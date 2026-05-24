"use client";

import { MessageCircle, MoreVertical } from "lucide-react";
import { Profile } from "@/lib/types";
import { Avatar, statusLabel } from "@/components/Avatar";

export default function FriendRow({ profile }: { profile: Profile }) {
  const subtext = profile.custom_status || statusLabel[profile.status];

  return (
    <li className="group flex items-center gap-3 rounded-lg border-t border-transparent px-3 py-2.5 hover:bg-d-hover/60">
      <Avatar
        src={profile.avatar_url}
        alt={profile.display_name}
        size={36}
        status={profile.status}
        ring="ring-d-mid"
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline gap-1.5">
          <span className="truncate text-[15px] font-semibold text-d-bright">
            {profile.display_name}
          </span>
          <span className="hidden truncate text-xs text-d-muted group-hover:inline">
            @{profile.username}
          </span>
        </p>
        <p className="truncate text-xs text-d-muted">{subtext}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          title="Message"
          aria-label={`Message ${profile.display_name}`}
          className="grid h-9 w-9 place-items-center rounded-full bg-d-darkest text-d-muted transition-colors hover:text-d-bright"
        >
          <MessageCircle size={18} />
        </button>
        <button
          type="button"
          title="More"
          aria-label={`More options for ${profile.display_name}`}
          className="grid h-9 w-9 place-items-center rounded-full bg-d-darkest text-d-muted transition-colors hover:text-d-bright"
        >
          <MoreVertical size={18} />
        </button>
      </div>
    </li>
  );
}
