"use client";

import { useState } from "react";
import {
  Hash,
  Volume2,
  Settings,
  Mic,
  MicOff,
  Headphones,
  HeadphoneOff,
  ChevronDown,
  Check,
} from "lucide-react";
import { Channel, Member, Profile, Server } from "@/lib/types";
import { Avatar, statusLabel } from "./Avatar";
import { Tooltip } from "./Tooltip";
import VoiceConnection from "./VoiceConnection";

export default function ChannelSidebar({
  server,
  channels,
  activeChannelId,
  onSelectChannel,
  me,
  onOpenSettings,
  activeVoiceChannelId,
  voiceParticipants,
  onJoinVoice,
  voiceChannel,
  onLeaveVoice,
}: {
  server: Server | null;
  channels: Channel[];
  activeChannelId: string | null;
  onSelectChannel: (id: string) => void;
  me: Profile | null;
  onOpenSettings: () => void;
  activeVoiceChannelId: string | null;
  voiceParticipants: Record<string, Member[]>;
  onJoinVoice: (channel: Channel) => void;
  voiceChannel: Channel | null;
  onLeaveVoice: () => void;
}) {
  const textChannels = channels.filter((c) => c.type === "text");
  const voiceChannels = channels.filter((c) => c.type === "voice");

  // Self mute / deafen (Discord user-panel controls)
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyInvite() {
    if (!server) return;
    try {
      await navigator.clipboard.writeText(server.invite_code);
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  function toggleMute() {
    setMuted((m) => {
      const next = !m;
      if (!next) setDeafened(false);
      return next;
    });
  }
  function toggleDeafen() {
    setDeafened((d) => {
      const next = !d;
      setMuted(next);
      return next;
    });
  }

  return (
    <div className="flex h-full w-60 shrink-0 flex-col bg-d-dark">
      <button
        onClick={copyInvite}
        title="Copy invite code"
        className="flex h-12 shrink-0 items-center gap-1 px-4 text-left shadow-sm shadow-black/30 transition-colors hover:bg-d-hover"
      >
        <h2 className="min-w-0 flex-1 truncate font-semibold text-d-bright">
          {server?.name ?? "—"}
        </h2>
        {copied ? (
          <Check size={18} className="shrink-0 text-online" />
        ) : (
          <ChevronDown size={18} className="shrink-0 text-d-muted" />
        )}
      </button>

      <div className="d-scroll flex-1 overflow-y-auto px-2 py-3">
        <ChannelGroup title="Text Channels">
          {textChannels.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectChannel(c.id)}
              className={`flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left ${
                c.id === activeChannelId
                  ? "bg-d-active text-d-bright"
                  : "text-d-muted hover:bg-d-hover hover:text-d-text"
              }`}
            >
              <Hash size={18} className="shrink-0 text-d-muted" />
              <span className="truncate text-sm font-medium">{c.name}</span>
            </button>
          ))}
        </ChannelGroup>

        <ChannelGroup title="Voice Channels">
          {voiceChannels.map((c) => {
            const parts = voiceParticipants[c.id] ?? [];
            return (
              <div key={c.id}>
                <button
                  onClick={() => onJoinVoice(c)}
                  className={`flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-left ${
                    c.id === activeVoiceChannelId
                      ? "bg-d-active text-d-bright"
                      : "text-d-muted hover:bg-d-hover hover:text-d-text"
                  }`}
                >
                  <Volume2 size={18} className="shrink-0" />
                  <span className="truncate text-sm font-medium">{c.name}</span>
                </button>
                {parts.length > 0 && (
                  <ul className="ml-5 mt-0.5 space-y-0.5">
                    {parts.map((p) => (
                      <li key={p.user_id} className="flex items-center gap-2 px-2 py-1">
                        <Avatar
                          src={p.profile?.avatar_url}
                          alt={p.profile?.display_name ?? "User"}
                          size={20}
                        />
                        <span className="truncate text-xs text-d-text">
                          {p.profile?.display_name}
                        </span>
                        <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-online" />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </ChannelGroup>
      </div>

      {/* Voice connection panel — sits above the user panel, like Discord */}
      {voiceChannel && me && (
        <VoiceConnection channel={voiceChannel} me={me} onLeave={onLeaveVoice} />
      )}

      {/* User panel */}
      {me && (
        <div className="flex items-center gap-0.5 bg-d-darkest/70 px-2 py-2">
          <button
            onClick={onOpenSettings}
            className="flex min-w-0 flex-1 items-center gap-2 rounded p-1 hover:bg-d-hover"
            title="Edit profile & status"
          >
            <Avatar src={me.avatar_url} alt={me.display_name} size={32} status={me.status} ring="ring-d-darkest" />
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold text-d-bright">{me.display_name}</p>
              <p className="truncate text-xs text-d-muted">
                {me.custom_status || statusLabel[me.status]}
              </p>
            </div>
          </button>
          <Tooltip label={muted ? "Unmute" : "Mute"} side="top">
            <button
              onClick={toggleMute}
              className={`shrink-0 rounded p-1.5 hover:bg-d-hover ${
                muted ? "text-dnd" : "text-d-muted hover:text-d-text"
              }`}
            >
              {muted ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </Tooltip>
          <Tooltip label={deafened ? "Undeafen" : "Deafen"} side="top">
            <button
              onClick={toggleDeafen}
              className={`shrink-0 rounded p-1.5 hover:bg-d-hover ${
                deafened ? "text-dnd" : "text-d-muted hover:text-d-text"
              }`}
            >
              {deafened ? <HeadphoneOff size={18} /> : <Headphones size={18} />}
            </button>
          </Tooltip>
          <Tooltip label="User Settings" side="top">
            <button
              onClick={onOpenSettings}
              className="shrink-0 rounded p-1.5 text-d-muted hover:bg-d-hover hover:text-d-text"
            >
              <Settings size={18} />
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

function ChannelGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="mb-1 flex w-full items-center gap-1 px-1 text-xs font-semibold uppercase tracking-wide text-d-muted transition-colors hover:text-d-text"
      >
        <svg
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`h-3 w-3 transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
        >
          <path d="M3 4.5 6 7.5 9 4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {title}
      </button>
      {open && <div className="space-y-0.5">{children}</div>}
    </div>
  );
}
