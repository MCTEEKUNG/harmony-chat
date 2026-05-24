"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Profile, UserStatus } from "@/lib/types";
import { updateProfile } from "@/lib/queries";
import { Avatar, StatusDot, statusLabel } from "./Avatar";
import { Backdrop } from "./JoinServerModal";

const STATUSES: UserStatus[] = ["online", "idle", "dnd", "offline"];
const AVATAR_SEEDS = ["Alice", "Bob", "Carol", "Dave", "Felix", "Luna", "Milo", "Nova", "Pixel", "Zoe"];

function avatarFor(seed: string) {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

export default function UserSettingsModal({
  me,
  onClose,
  onSaved,
  onSignOut,
  onToast,
}: {
  me: Profile;
  onClose: () => void;
  onSaved: (p: Profile) => void;
  onSignOut: () => void;
  onToast: (msg: string, type?: "success" | "error") => void;
}) {
  const [displayName, setDisplayName] = useState(me.display_name);
  const [customStatus, setCustomStatus] = useState(me.custom_status ?? "");
  const [status, setStatus] = useState<UserStatus>(me.status);
  const [avatarUrl, setAvatarUrl] = useState(me.avatar_url ?? avatarFor(me.username));
  const [saving, setSaving] = useState(false);

  const trimmedName = displayName.trim();
  const dirty =
    trimmedName !== me.display_name ||
    customStatus.trim() !== (me.custom_status ?? "") ||
    status !== me.status ||
    avatarUrl !== (me.avatar_url ?? avatarFor(me.username));
  const valid = trimmedName.length > 0;

  async function save() {
    if (!dirty || !valid) return;
    setSaving(true);
    try {
      const updated = await updateProfile(me.id, {
        display_name: trimmedName,
        custom_status: customStatus.trim() || null,
        status,
        avatar_url: avatarUrl,
      });
      onToast("Profile updated");
      onSaved(updated);
    } catch {
      setSaving(false);
      onToast("Could not save changes. Please try again.", "error");
    }
  }

  return (
    <Backdrop onClose={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-d-mid p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-d-bright">User Settings</h2>

        <div className="mt-5 flex items-center gap-4">
          <Avatar src={avatarUrl} alt={displayName} size={72} status={status} ring="ring-d-mid" />
          <div>
            <p className="text-lg font-bold text-d-bright">{displayName || me.username}</p>
            <p className="text-sm text-d-muted">@{me.username}</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <Field label="Display name">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={`w-full rounded-md border bg-[#1e1f22] px-3 py-2 text-d-bright outline-none focus:border-blurple ${
                valid ? "border-black/30" : "border-dnd"
              }`}
            />
            {!valid && <p className="mt-1 text-xs text-dnd">Display name can&apos;t be empty.</p>}
          </Field>

          <Field label="Custom status">
            <input
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              placeholder="What's happening?"
              className="w-full rounded-md border border-black/30 bg-[#1e1f22] px-3 py-2 text-d-bright outline-none focus:border-blurple"
            />
          </Field>

          <Field label="Status">
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
                    status === s ? "bg-d-active text-d-bright ring-1 ring-blurple" : "bg-d-dark text-d-muted hover:bg-d-hover"
                  }`}
                >
                  <StatusDot status={s} ring="ring-d-dark" className="h-4 w-4" />
                  {statusLabel[s]}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Avatar">
            <div className="flex flex-wrap gap-2">
              {AVATAR_SEEDS.map((seed) => {
                const url = avatarFor(seed);
                return (
                  <button
                    key={seed}
                    onClick={() => setAvatarUrl(url)}
                    className={`rounded-full ${avatarUrl === url ? "ring-2 ring-blurple" : ""}`}
                  >
                    <Avatar src={url} alt={seed} size={40} />
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-dnd transition-colors hover:bg-dnd/10"
          >
            <LogOut size={16} /> Log Out
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm text-d-muted hover:text-d-text"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving || !dirty || !valid}
              className="rounded-md bg-blurple px-5 py-2 text-sm font-medium text-white transition hover:bg-blurple-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </Backdrop>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-d-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
