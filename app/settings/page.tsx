"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getMyProfile } from "@/lib/queries";
import { Profile } from "@/lib/types";
import UserSettings from "@/components/UserSettings";

export default function SettingsPage() {
  const router = useRouter();
  const [me, setMe] = useState<Profile | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      const p = await getMyProfile(data.session.user.id);
      if (p) setMe(p);
    });
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (!me) {
    return (
      <div className="grid h-full place-items-center bg-d-mid text-d-muted">
        <span className="animate-pulse">Loading settings…</span>
      </div>
    );
  }

  return (
    <UserSettings me={me} onClose={() => router.push("/app")} onSaved={setMe} onSignOut={logout} />
  );
}
