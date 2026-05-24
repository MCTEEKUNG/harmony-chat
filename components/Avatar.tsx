import { UserStatus } from "@/lib/types";

export const statusColor: Record<UserStatus, string> = {
  online: "bg-online",
  idle: "bg-idle",
  dnd: "bg-dnd",
  offline: "bg-offline",
};

export const statusLabel: Record<UserStatus, string> = {
  online: "Online",
  idle: "Idle",
  dnd: "Do Not Disturb",
  offline: "Offline",
};

const STATUS_HEX: Record<UserStatus, string> = {
  online: "#23a55a",
  idle: "#f0b232",
  dnd: "#f23f43",
  offline: "#80848e",
};

// Surrounding surface color, used as the "notch" so cutout shapes read correctly.
const SURFACE_HEX: Record<string, string> = {
  "ring-d-dark": "#2b2d31",
  "ring-d-darkest": "#1e1f22",
  "ring-d-mid": "#313338",
};

/**
 * Discord-style status indicator: solid (online), crescent moon (idle),
 * minus bar (do-not-disturb), hollow ring (offline). The cut shapes are drawn
 * in the surrounding surface color so they read as transparent against the avatar.
 */
export function StatusDot({
  status,
  className,
  ring = "ring-d-dark",
}: {
  status: UserStatus;
  className?: string;
  ring?: string;
}) {
  const color = STATUS_HEX[status];
  const surface = SURFACE_HEX[ring] ?? "#2b2d31";
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      role="img"
      aria-label={statusLabel[status]}
    >
      {/* notch / separation ring */}
      <circle cx="8" cy="8" r="8" fill={surface} />
      {/* status body */}
      <circle cx="8" cy="8" r="6" fill={color} />
      {/* idle → crescent moon (bite from the top-left) */}
      {status === "idle" && <circle cx="4.7" cy="4.7" r="4.3" fill={surface} />}
      {/* do not disturb → horizontal bar */}
      {status === "dnd" && (
        <rect x="3.1" y="6.7" width="9.8" height="2.6" rx="1.3" fill={surface} />
      )}
      {/* offline → hollow ring */}
      {status === "offline" && <circle cx="8" cy="8" r="3.3" fill={surface} />}
    </svg>
  );
}

function fallback(alt: string) {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(alt)}`;
}

export function Avatar({
  src,
  alt,
  size = 40,
  status,
  ring = "ring-d-dark",
}: {
  src?: string | null;
  alt: string;
  size?: number;
  status?: UserStatus | null;
  ring?: string;
}) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src || fallback(alt)}
        alt={alt}
        className="h-full w-full rounded-full bg-d-darkest object-cover"
      />
      {status && (
        <StatusDot
          status={status}
          ring={ring}
          className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5"
        />
      )}
    </div>
  );
}
