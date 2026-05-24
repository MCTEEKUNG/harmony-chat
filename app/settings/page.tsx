"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, X, UserRound, IdCard } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { getMyProfile, updateProfile } from "@/lib/queries";
import { Profile, UserStatus } from "@/lib/types";
import { Avatar, StatusDot, statusLabel } from "@/components/Avatar";

const STATUSES: UserStatus[] = ["online", "idle", "dnd", "offline"];
const AVATAR_SEEDS = ["Alice", "Bob", "Carol", "Dave", "Felix", "Luna", "Milo", "Nova", "Pixel", "Zoe", "Atlas", "Sky"];
const avatarFor = (s: string) => `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(s)}`;

export default function SettingsPage() {
  const router = useRouter();
  const [me, setMe] = useState<Profile | null>(null);
  const [tab, setTab] = useState<"account" | "profile">("account");

  const [displayName, setDisplayName] = useState("");
  const [customStatus, setCustomStatus] = useState("");
  const [status, setStatus] = useState<UserStatus>("online");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      const p = await getMyProfile(data.session.user.id);
      if (!p) return;
      setMe(p);
      setDisplayName(p.display_name);
      setCustomStatus(p.custom_status ?? "");
      setStatus(p.status);
      setAvatarUrl(p.avatar_url ?? avatarFor(p.username));
    });
  }, [router]);

  function showToast(msg: string, type: "success" | "error" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const trimmedName = displayName.trim();
  const valid = trimmedName.length > 0;
  const dirty =
    !!me &&
    (trimmedName !== me.display_name ||
      customStatus.trim() !== (me.custom_status ?? "") ||
      status !== me.status ||
      avatarUrl !== (me.avatar_url ?? avatarFor(me.username)));

  function reset() {
    if (!me) return;
    setDisplayName(me.display_name);
    setCustomStatus(me.custom_status ?? "");
    setStatus(me.status);
    setAvatarUrl(me.avatar_url ?? avatarFor(me.username));
  }

  async function save() {
    if (!me || !dirty || !valid) return;
    setSaving(true);
    try {
      const updated = await updateProfile(me.id, {
        display_name: trimmedName,
        custom_status: customStatus.trim() || null,
        status,
        avatar_url: avatarUrl,
      });
      setMe(updated);
      showToast("Your changes have been saved.");
    } catch {
      showToast("Couldn't save changes. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  }

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

  const navItem = (id: "account" | "profile", label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setTab(id)}
      className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-medium transition ${
        tab === id ? "bg-d-active text-d-bright" : "text-d-muted hover:bg-d-hover hover:text-d-text"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="flex h-screen flex-col bg-d-mid md:flex-row">
      {/* Sidebar */}
      <aside className="d-scroll shrink-0 overflow-y-auto bg-d-darkest p-3 md:w-64 md:p-4">
        <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wide text-d-muted">
          User Settings
        </p>
        <div className="flex gap-1 md:flex-col">
          {navItem("account", "My Account", <UserRound size={18} />)}
          {navItem("profile", "Profile", <IdCard size={18} />)}
        </div>
        <div className="my-3 h-px bg-white/10" />
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-medium text-dnd transition hover:bg-dnd/10"
        >
          <LogOut size={18} /> Log Out
        </button>
      </aside>

      {/* Content */}
      <main className="d-scroll relative flex-1 overflow-y-auto px-5 py-8 md:px-12">
        <button
          onClick={() => router.push("/app")}
          title="Close (back to app)"
          className="absolute right-5 top-6 grid h-9 w-9 place-items-center rounded-full border border-d-muted/40 text-d-muted transition hover:bg-d-hover hover:text-d-text md:right-10"
        >
          <X size={18} />
        </button>

        <div className="mx-auto max-w-2xl pb-24">
          {tab === "account" ? (
            <>
              <h1 className="text-xl font-bold text-d-bright">My Account</h1>
              {/* banner card */}
              <div className="mt-5 overflow-hidden rounded-xl bg-d-darkest">
                <div className="h-24 bg-gradient-to-r from-blurple to-[#4651d4]" />
                <div className="flex items-center gap-4 px-5 pb-5">
                  <div className="-mt-10">
                    <Avatar src={avatarUrl} alt={displayName} size={88} status={status} ring="ring-d-darkest" />
                  </div>
                  <div className="min-w-0 pt-2">
                    <p className="truncate text-xl font-bold text-d-bright">{displayName || me.username}</p>
                    <p className="text-sm text-d-muted">@{me.username}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <Field label="Display name">
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={`w-full rounded-md border bg-[#1e1f22] px-3 py-2.5 text-d-bright outline-none focus:border-blurple ${
                      valid ? "border-black/30" : "border-dnd"
                    }`}
                  />
                  {!valid && <p className="mt-1 text-xs text-dnd">Display name can&apos;t be empty.</p>}
                </Field>

                <Field label="Status">
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition ${
                          status === s
                            ? "bg-d-active text-d-bright ring-1 ring-blurple"
                            : "bg-d-dark text-d-muted hover:bg-d-hover"
                        }`}
                      >
                        <StatusDot status={s} ring="ring-d-dark" className="h-4 w-4" />
                        {statusLabel[s]}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-d-bright">Profile</h1>
              <div className="mt-6 space-y-5">
                <Field label="Custom status">
                  <input
                    value={customStatus}
                    onChange={(e) => setCustomStatus(e.target.value)}
                    placeholder="What's happening?"
                    maxLength={128}
                    className="w-full rounded-md border border-black/30 bg-[#1e1f22] px-3 py-2.5 text-d-bright outline-none focus:border-blurple"
                  />
                </Field>

                <Field label="Avatar">
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_SEEDS.map((seed) => {
                      const url = avatarFor(seed);
                      return (
                        <button
                          key={seed}
                          onClick={() => setAvatarUrl(url)}
                          className={`rounded-full transition ${
                            avatarUrl === url ? "ring-2 ring-blurple" : "hover:opacity-80"
                          }`}
                        >
                          <Avatar src={url} alt={seed} size={44} />
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-d-muted">Pick an avatar generated with DiceBear.</p>
                </Field>
              </div>
            </>
          )}
        </div>

        {/* Unsaved changes bar */}
        {dirty && (
          <div className="fixed bottom-4 left-1/2 z-50 flex w-[min(92vw,560px)] -translate-x-1/2 items-center gap-3 rounded-lg bg-d-darkest px-4 py-3 shadow-2xl ring-1 ring-black/40 animate-fade-in">
            <span className="flex-1 text-sm text-d-text">Careful — you have unsaved changes!</span>
            <button
              onClick={reset}
              className="rounded px-3 py-1.5 text-sm text-d-muted hover:text-d-text"
            >
              Reset
            </button>
            <button
              onClick={save}
              disabled={saving || !valid}
              className="rounded-md bg-online px-4 py-1.5 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 animate-fade-in rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-2xl ${
              toast.type === "success" ? "bg-online" : "bg-dnd"
            }`}
          >
            {toast.msg}
          </div>
        )}
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-d-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
