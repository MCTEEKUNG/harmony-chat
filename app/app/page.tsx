"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import * as q from "@/lib/queries";
import { PAGE_SIZE } from "@/lib/queries";
import { Channel, Member, Message, Profile, Server, UserStatus } from "@/lib/types";
import ServerRail from "@/components/ServerRail";
import ChannelSidebar from "@/components/ChannelSidebar";
import ChatArea from "@/components/ChatArea";
import MemberList from "@/components/MemberList";
import JoinServerModal from "@/components/JoinServerModal";
import ProfileCard from "@/components/ProfileCard";
import UserSettings from "@/components/UserSettings";
import { ContextMenu } from "@/components/ContextMenu";
import { UserRound, Copy } from "lucide-react";

export default function AppPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<Profile | null>(null);

  const [servers, setServers] = useState<Server[]>([]);
  const [activeServerId, setActiveServerId] = useState<string | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [onlineStatus, setOnlineStatus] = useState<Record<string, UserStatus>>({});
  const [voiceParticipants, setVoiceParticipants] = useState<Record<string, Member[]>>({});
  const [activeVoiceChannelId, setActiveVoiceChannelId] = useState<string | null>(null);

  const [showJoin, setShowJoin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [userMenu, setUserMenu] = useState<{ x: number; y: number; userId: string } | null>(null);
  const [toasts, setToasts] = useState<{ id: number; type: "success" | "error"; msg: string }[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, { name: string; t: number }>>({});
  const typingChanRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastTypingSentRef = useRef(0);

  const activeServer = useMemo(
    () => servers.find((s) => s.id === activeServerId) ?? null,
    [servers, activeServerId]
  );
  const activeChannel = useMemo(
    () => channels.find((c) => c.id === activeChannelId) ?? null,
    [channels, activeChannelId]
  );
  const activeVoiceChannel = useMemo(
    () => channels.find((c) => c.id === activeVoiceChannelId) ?? null,
    [channels, activeVoiceChannelId]
  );

  // Members with live presence status applied
  const liveMembers = useMemo(
    () =>
      members.map((m) => ({
        ...m,
        profile: m.profile
          ? { ...m.profile, status: onlineStatus[m.user_id] ?? "offline" }
          : m.profile,
      })),
    [members, onlineStatus]
  );

  // ---- Auth bootstrap ----
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      // Clear any stale voice membership from a previous session/reload
      await supabase.from("voice_participants").delete().eq("user_id", data.session.user.id);
      const profile = await q.getMyProfile(data.session.user.id);
      if (!mounted) return;
      setMe(profile);
      const srv = await q.getMyServers(data.session.user.id);
      if (!mounted) return;
      setServers(srv);
      setActiveServerId((prev) => prev ?? srv[0]?.id ?? null);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [router]);

  // ---- Load channels + members on server change ----
  const loadServerData = useCallback(async (serverId: string) => {
    const [chs, mems] = await Promise.all([
      q.getServerChannels(serverId),
      q.getServerMembers(serverId),
    ]);
    setChannels(chs);
    setMembers(mems);
    setActiveChannelId(chs.find((c) => c.type === "text")?.id ?? null);
    return chs;
  }, []);

  useEffect(() => {
    if (!activeServerId) {
      setChannels([]);
      setMembers([]);
      setActiveChannelId(null);
      return;
    }
    loadServerData(activeServerId);
  }, [activeServerId, loadServerData]);

  // ---- Load messages on channel change ----
  useEffect(() => {
    if (!activeChannelId) {
      setMessages([]);
      setHasMore(false);
      return;
    }
    let mounted = true;
    q.getMessages(activeChannelId).then((msgs) => {
      if (!mounted) return;
      setMessages(msgs);
      setHasMore(msgs.length === PAGE_SIZE);
    });
    return () => {
      mounted = false;
    };
  }, [activeChannelId]);

  // ---- Realtime messages for active channel ----
  useEffect(() => {
    if (!activeChannelId) return;
    const profilesById = new Map(
      members.filter((m) => m.profile).map((m) => [m.user_id, m.profile as Profile])
    );
    const ch = supabase
      .channel(`messages:${activeChannelId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `channel_id=eq.${activeChannelId}` },
        async (payload) => {
          const row = payload.new as Message;
          if (row.is_deleted) return;
          let profile = profilesById.get(row.user_id) ?? null;
          if (!profile) profile = await q.getMyProfile(row.user_id);
          setMessages((prev) =>
            prev.some((m) => m.id === row.id) ? prev : [...prev, { ...row, profile }]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `channel_id=eq.${activeChannelId}` },
        (payload) => {
          const row = payload.new as Message;
          setMessages((prev) => {
            if (row.is_deleted) return prev.filter((m) => m.id !== row.id);
            return prev.map((m) => (m.id === row.id ? { ...m, ...row, profile: m.profile } : m));
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "messages", filter: `channel_id=eq.${activeChannelId}` },
        (payload) => {
          const old = payload.old as { id: string };
          setMessages((prev) => prev.filter((m) => m.id !== old.id));
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [activeChannelId, members]);

  // ---- Presence (online status) ----
  useEffect(() => {
    if (!me) return;
    const presence = supabase.channel("presence:global", {
      config: { presence: { key: me.id } },
    });
    presence
      .on("presence", { event: "sync" }, () => {
        const state = presence.presenceState<{ status: UserStatus }>();
        const next: Record<string, UserStatus> = {};
        for (const [userId, metas] of Object.entries(state)) {
          next[userId] = metas[0]?.status ?? "online";
        }
        setOnlineStatus(next);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presence.track({ status: me.status });
        }
      });
    return () => {
      supabase.removeChannel(presence);
    };
  }, [me]);

  // ---- Voice participants (DB-backed) ----
  const refreshVoice = useCallback(async (chs: Channel[]) => {
    const voice = chs.filter((c) => c.type === "voice");
    const entries = await Promise.all(
      voice.map(async (c) => [c.id, await q.getVoiceParticipants(c.id)] as const)
    );
    setVoiceParticipants(Object.fromEntries(entries));
  }, []);

  useEffect(() => {
    if (channels.length) refreshVoice(channels);
  }, [channels, refreshVoice]);

  useEffect(() => {
    if (!channels.length) return;
    const ch = supabase
      .channel("voice-participants")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "voice_participants" },
        () => refreshVoice(channels)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [channels, refreshVoice]);

  // ---- Typing indicator (realtime broadcast, no DB) ----
  useEffect(() => {
    if (!activeChannelId || !me) return;
    setTypingUsers({});
    const chan = supabase.channel(`typing:${activeChannelId}`);
    chan
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.userId === me.id) return;
        setTypingUsers((prev) => ({
          ...prev,
          [payload.userId]: { name: payload.name, t: Date.now() },
        }));
      })
      .subscribe();
    typingChanRef.current = chan;
    const sweep = setInterval(() => {
      setTypingUsers((prev) => {
        const now = Date.now();
        const next: typeof prev = {};
        let changed = false;
        for (const [k, v] of Object.entries(prev)) {
          if (now - v.t < 4000) next[k] = v;
          else changed = true;
        }
        return changed ? next : prev;
      });
    }, 1500);
    return () => {
      clearInterval(sweep);
      supabase.removeChannel(chan);
      typingChanRef.current = null;
    };
  }, [activeChannelId, me]);

  const handleTyping = useCallback(() => {
    if (!me) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current < 1500) return;
    lastTypingSentRef.current = now;
    typingChanRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: { userId: me.id, name: me.display_name },
    });
  }, [me]);

  // ---- Handlers ----
  const handleSend = useCallback(
    async (content: string) => {
      if (!me || !activeChannelId) return;
      try {
        const msg = await q.sendMessage(activeChannelId, me.id, content);
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      } catch (e) {
        console.error("send failed", e);
      }
    },
    [me, activeChannelId]
  );

  const handleEdit = useCallback(async (id: string, content: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, content, edited_at: new Date().toISOString() } : m))
    );
    await q.editMessage(id, content);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    await q.deleteMessage(id);
  }, []);

  const notify = useCallback((msg: string, type: "success" | "error" = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const openUserMenu = useCallback((userId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setUserMenu({ x: e.clientX, y: e.clientY, userId });
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (!activeChannelId || messages.length === 0 || loadingMore) return;
    setLoadingMore(true);
    const older = await q.getMessages(activeChannelId, messages[0].created_at);
    setMessages((prev) => [...older, ...prev]);
    setHasMore(older.length === PAGE_SIZE);
    setLoadingMore(false);
  }, [activeChannelId, messages, loadingMore]);

  const handleJoinVoice = useCallback(
    async (channel: Channel) => {
      if (!me) return;
      if (activeVoiceChannelId && activeVoiceChannelId !== channel.id) {
        await q.leaveVoice(activeVoiceChannelId, me.id);
      }
      await q.joinVoice(channel.id, me.id);
      setActiveVoiceChannelId(channel.id);
      setMobileNav(false);
    },
    [me, activeVoiceChannelId]
  );

  const handleLeaveVoice = useCallback(async () => {
    if (!me || !activeVoiceChannelId) return;
    await q.leaveVoice(activeVoiceChannelId, me.id);
    setActiveVoiceChannelId(null);
  }, [me, activeVoiceChannelId]);

  const handleSignOut = useCallback(async () => {
    if (me && activeVoiceChannelId) await q.leaveVoice(activeVoiceChannelId, me.id);
    await supabase.auth.signOut();
    router.replace("/login");
  }, [me, activeVoiceChannelId, router]);

  if (!ready || !me) {
    return (
      <div className="grid h-full place-items-center bg-d-darkest text-d-muted">
        <div className="animate-pulse">Loading Harmony…</div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      <ServerRail
        servers={servers}
        activeServerId={activeServerId}
        onSelect={setActiveServerId}
        onAddServer={() => setShowJoin(true)}
      />

      {/* Channel sidebar: static on md+, slide-over drawer on mobile */}
      <div
        className={`${
          mobileNav ? "fixed inset-y-0 left-[72px] z-40 shadow-2xl" : "hidden"
        } md:static md:z-auto md:block md:shadow-none`}
      >
        <ChannelSidebar
          server={activeServer}
          channels={channels}
          activeChannelId={activeChannelId}
          onSelectChannel={(id) => {
            setActiveChannelId(id);
            setMobileNav(false);
          }}
          me={me}
          onOpenSettings={() => setShowSettings(true)}
          activeVoiceChannelId={activeVoiceChannelId}
          voiceParticipants={voiceParticipants}
          onJoinVoice={handleJoinVoice}
          voiceChannel={activeVoiceChannel}
          onLeaveVoice={handleLeaveVoice}
          onUserContextMenu={openUserMenu}
        />
      </div>
      {mobileNav && (
        <div
          className="fixed inset-0 z-30 bg-[#0b0b12]/60 md:hidden"
          onClick={() => setMobileNav(false)}
        />
      )}

      <div className="flex min-h-0 min-w-0 flex-1">
          <ChatArea
            channel={activeChannel}
            channels={channels}
            messages={messages}
            me={me}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onSend={handleSend}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onLoadMore={handleLoadMore}
            onSelectChannel={setActiveChannelId}
            onOpenNav={() => setMobileNav(true)}
            onTyping={handleTyping}
            typingNames={Object.values(typingUsers).map((u) => u.name)}
            onToggleMembers={() => setMembersOpen((v) => !v)}
            onShowProfile={setProfileUserId}
          />
          {/* Docked member list — large screens */}
          <MemberList
            members={liveMembers}
            className="hidden lg:flex"
            onShowProfile={setProfileUserId}
            onUserContextMenu={openUserMenu}
          />
      </div>

      {/* Member list as an overlay drawer on tablet/mobile */}
      {membersOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-30 bg-[#0b0b12]/60"
            onClick={() => setMembersOpen(false)}
          />
          <MemberList
            members={liveMembers}
            className="fixed right-0 top-0 z-40 flex h-full shadow-2xl"
            onShowProfile={(id) => {
              setMembersOpen(false);
              setProfileUserId(id);
            }}
            onUserContextMenu={openUserMenu}
          />
        </div>
      )}

      {showJoin && (
        <JoinServerModal
          me={me}
          onClose={() => setShowJoin(false)}
          onJoined={async (serverId) => {
            setShowJoin(false);
            const srv = await q.getMyServers(me.id);
            setServers(srv);
            setActiveServerId(serverId);
          }}
        />
      )}

      {showSettings && (
        <UserSettings
          me={me}
          onClose={() => setShowSettings(false)}
          onSaved={setMe}
          onSignOut={handleSignOut}
        />
      )}

      {profileUserId && (
        <ProfileCard
          userId={profileUserId}
          meId={me.id}
          liveStatus={onlineStatus[profileUserId] ?? "offline"}
          roleLabel={members.find((m) => m.user_id === profileUserId)?.role}
          onClose={() => setProfileUserId(null)}
          onEditProfile={() => {
            setProfileUserId(null);
            setShowSettings(true);
          }}
          onToast={notify}
        />
      )}

      {userMenu && (
        <ContextMenu
          x={userMenu.x}
          y={userMenu.y}
          onClose={() => setUserMenu(null)}
          items={[
            {
              label: "View Profile",
              icon: <UserRound size={15} />,
              onClick: () => setProfileUserId(userMenu.userId),
            },
            {
              label: "Copy User ID",
              icon: <Copy size={15} />,
              onClick: async () => {
                try {
                  await navigator.clipboard.writeText(userMenu.userId);
                  notify("Copied user ID");
                } catch {
                  notify("Couldn't copy.", "error");
                }
              },
            },
          ]}
        />
      )}

      {/* Toasts */}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto animate-fade-in rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-2xl ${
              t.type === "success" ? "bg-online" : "bg-dnd"
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
