"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import * as q from "@/lib/queries";
import { Profile, Server } from "@/lib/types";
import ServerRail from "@/components/ServerRail";
import DMSidebar from "@/components/friends/DMSidebar";
import FriendsMain from "@/components/friends/FriendsMain";
import ActivityPanel from "@/components/friends/ActivityPanel";

export default function FriendsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<Profile | null>(null);
  const [servers, setServers] = useState<Server[]>([]);
  const [people, setPeople] = useState<Profile[]>([]);

  // ---- Auth bootstrap (mirrors app/app/page.tsx) ----
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      const profile = await q.getMyProfile(data.session.user.id);
      if (!mounted) return;
      setMe(profile);
      const [srv, others] = await Promise.all([
        q.getMyServers(data.session.user.id),
        q.getOtherProfiles(data.session.user.id),
      ]);
      if (!mounted) return;
      setServers(srv);
      setPeople(others);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, [router]);

  if (!ready || !me) {
    return (
      <div className="grid h-full place-items-center bg-d-darkest text-d-muted">
        <div className="animate-pulse">Loading Harmony…</div>
      </div>
    );
  }

  const dmUsers = people.slice(0, 8);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ServerRail
        servers={servers}
        activeServerId={null}
        onSelect={() => router.push("/app")}
        onAddServer={() => router.push("/app")}
      />

      <DMSidebar me={me} dmUsers={dmUsers} onOpenSettings={() => router.push("/app")} />

      <FriendsMain friends={people} />

      <ActivityPanel people={people} />
    </div>
  );
}
