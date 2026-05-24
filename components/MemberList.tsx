"use client";

import { Crown } from "lucide-react";
import { Member } from "@/lib/types";
import { Avatar } from "./Avatar";

export default function MemberList({
  members,
  className = "",
  onShowProfile,
}: {
  members: Member[];
  className?: string;
  onShowProfile?: (userId: string) => void;
}) {
  const online = members.filter((m) => m.profile && m.profile.status !== "offline");
  const offline = members.filter((m) => !m.profile || m.profile.status === "offline");

  return (
    <aside className={`w-60 shrink-0 flex-col bg-d-dark ${className}`}>
      <div className="d-scroll flex-1 overflow-y-auto px-4 py-4">
        <Section title="Online" count={online.length} members={online} onShowProfile={onShowProfile} />
        <Section title="Offline" count={offline.length} members={offline} dim onShowProfile={onShowProfile} />
      </div>
    </aside>
  );
}

function Section({
  title,
  count,
  members,
  dim,
  onShowProfile,
}: {
  title: string;
  count: number;
  members: Member[];
  dim?: boolean;
  onShowProfile?: (userId: string) => void;
}) {
  if (count === 0) return null;
  return (
    <div className="mb-5">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-d-muted">
        {title} — {count}
      </h3>
      <ul className="space-y-0.5">
        {members.map((m) => (
          <li
            key={m.user_id}
            onClick={() => onShowProfile?.(m.user_id)}
            className={`flex cursor-pointer items-center gap-3 rounded px-2 py-1.5 hover:bg-d-hover ${
              dim ? "opacity-40 hover:opacity-100" : ""
            }`}
          >
            <Avatar
              src={m.profile?.avatar_url}
              alt={m.profile?.display_name ?? "User"}
              size={32}
              status={m.profile?.status ?? "offline"}
              ring="ring-d-dark"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-d-text">
                {m.profile?.display_name ?? "Unknown"}
                {m.role === "owner" && (
                  <Crown
                    size={12}
                    className="ml-1 inline-block align-[-1px] text-idle"
                    aria-label="Server owner"
                  />
                )}
              </p>
              {m.profile?.custom_status && (
                <p className="truncate text-xs text-d-muted">{m.profile.custom_status}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
