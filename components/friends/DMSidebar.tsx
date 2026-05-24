"use client";

import { useState } from "react";
import {
  Users,
  Sparkles,
  Store,
  Search,
  Mic,
  MicOff,
  Headphones,
  HeadphoneOff,
  Settings,
} from "lucide-react";
import { Profile } from "@/lib/types";
import { Avatar, statusLabel } from "@/components/Avatar";
import { Tooltip } from "@/components/Tooltip";

export default function DMSidebar({
  me,
  dmUsers,
  onOpenSettings,
}: {
  me: Profile;
  dmUsers: Profile[];
  onOpenSettings: () => void;
}) {
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);

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
    <aside className="hidden h-full w-60 shrink-0 flex-col bg-d-dark md:flex">
      {/* Search */}
      <div className="shrink-0 px-2.5 py-2.5 shadow-sm shadow-black/20">
        <button
          type="button"
          className="flex h-7 w-full items-center gap-2 rounded bg-d-darkest px-2 text-left text-sm text-d-muted hover:bg-d-darkest/70"
        >
          <Search size={14} className="shrink-0" />
          <span className="truncate">Find or start a conversation</span>
        </button>
      </div>

      <div className="d-scroll flex-1 overflow-y-auto px-2 pt-2">
        <NavRow icon={<Users size={20} />} label="Friends" active />
        <NavRow icon={<Sparkles size={20} />} label="Nitro" />
        <NavRow icon={<Store size={20} />} label="Shop" />

        <div className="mb-1 mt-4 flex items-center justify-between px-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-d-muted">
            Direct Messages
          </span>
        </div>

        <ul className="space-y-0.5">
          {dmUsers.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left text-d-muted transition-colors hover:bg-d-hover hover:text-d-text"
              >
                <Avatar
                  src={u.avatar_url}
                  alt={u.display_name}
                  size={32}
                  status={u.status}
                  ring="ring-d-dark"
                />
                <span className="truncate text-[15px] font-medium">
                  {u.display_name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* User panel */}
      <div className="flex items-center gap-0.5 bg-d-darkest/70 px-2 py-2">
        <button
          onClick={onOpenSettings}
          className="flex min-w-0 flex-1 items-center gap-2 rounded p-1 hover:bg-d-hover"
          title="Profile & status"
        >
          <Avatar
            src={me.avatar_url}
            alt={me.display_name}
            size={32}
            status={me.status}
            ring="ring-d-darkest"
          />
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold text-d-bright">
              {me.display_name}
            </p>
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
    </aside>
  );
}

function NavRow({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`mb-0.5 flex w-full items-center gap-3 rounded px-2 py-2 text-left text-[15px] font-medium transition-colors ${
        active
          ? "bg-d-active text-d-bright"
          : "text-d-muted hover:bg-d-hover hover:text-d-text"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}
