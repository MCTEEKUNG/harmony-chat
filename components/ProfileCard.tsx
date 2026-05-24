"use client";

import { useEffect, useState } from "react";
import { Crown, Pencil, MessageSquare } from "lucide-react";
import { Profile, Server, UserStatus } from "@/lib/types";
import { getMyProfile, getMutualServers } from "@/lib/queries";
import { Avatar, statusLabel } from "./Avatar";
import { Backdrop } from "./JoinServerModal";

export default function ProfileCard({
  userId,
  meId,
  liveStatus,
  roleLabel,
  onClose,
  onEditProfile,
  onToast,
}: {
  userId: string;
  meId: string;
  liveStatus?: UserStatus;
  roleLabel?: string;
  onClose: () => void;
  onEditProfile: () => void;
  onToast: (msg: string, type?: "success" | "error") => void;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mutual, setMutual] = useState<Server[]>([]);

  useEffect(() => {
    let on = true;
    getMyProfile(userId).then((p) => on && setProfile(p));
    if (userId !== meId) getMutualServers(meId, userId).then((s) => on && setMutual(s));
    return () => {
      on = false;
    };
  }, [userId, meId]);

  const isMe = userId === meId;
  const status = liveStatus ?? profile?.status ?? "offline";

  return (
    <Backdrop onClose={onClose}>
      <div className="w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl bg-d-darkest shadow-2xl animate-fade-in">
        <div className="h-[72px] bg-gradient-to-r from-blurple to-[#4651d4]" />
        <div className="px-4 pb-4">
          <div className="-mt-10 mb-2">
            <Avatar
              src={profile?.avatar_url}
              alt={profile?.display_name ?? "User"}
              size={80}
              status={status}
              ring="ring-d-darkest"
            />
          </div>

          <div className="rounded-lg bg-d-mid p-3">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-lg font-bold text-d-bright">
                {profile?.display_name ?? "…"}
              </h3>
              {roleLabel === "owner" && (
                <Crown size={16} className="shrink-0 text-idle" aria-label="Owner" />
              )}
            </div>
            <p className="text-sm text-d-muted">@{profile?.username ?? "…"}</p>

            {profile?.custom_status && (
              <p className="mt-2 border-t border-white/5 pt-2 text-sm text-d-text">
                {profile.custom_status}
              </p>
            )}

            <p className="mt-2 text-xs text-d-muted">{statusLabel[status]}</p>

            {roleLabel && (
              <div className="mt-3">
                <p className="text-xs font-bold uppercase tracking-wide text-d-muted">Roles</p>
                <span className="mt-1 inline-flex items-center gap-1.5 rounded bg-d-dark px-2 py-0.5 text-xs text-d-text">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: roleLabel === "owner" ? "#f0b232" : "#949ba4" }}
                  />
                  {roleLabel === "owner" ? "Owner" : "Member"}
                </span>
              </div>
            )}

            {!isMe && mutual.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-bold uppercase tracking-wide text-d-muted">
                  {mutual.length} Mutual Server{mutual.length > 1 ? "s" : ""}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {mutual.slice(0, 8).map((s) =>
                    s.icon_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={s.id}
                        src={s.icon_url}
                        alt={s.name}
                        title={s.name}
                        className="h-7 w-7 rounded-full bg-d-dark"
                      />
                    ) : null
                  )}
                </div>
              </div>
            )}

            <div className="mt-4">
              {isMe ? (
                <button
                  onClick={onEditProfile}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md bg-blurple py-2 text-sm font-medium text-white transition hover:bg-blurple-hover"
                >
                  <Pencil size={15} /> Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => onToast("Direct messages aren't available yet.", "error")}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md bg-d-dark py-2 text-sm font-medium text-d-text transition hover:bg-d-hover"
                >
                  <MessageSquare size={15} /> Message
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Backdrop>
  );
}
