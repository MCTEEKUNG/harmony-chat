"use client";

import { MessageCircle, Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Server } from "@/lib/types";
import { Tooltip } from "./Tooltip";

export default function ServerRail({
  servers,
  activeServerId,
  onSelect,
  onAddServer,
}: {
  servers: Server[];
  activeServerId: string | null;
  onSelect: (id: string) => void;
  onAddServer: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const homeActive = pathname === "/friends";

  return (
    <nav className="flex h-full w-[72px] flex-col items-center gap-2 bg-d-darkest py-3">
      <Tooltip label="Home" side="right">
        <button
          onClick={() => router.push("/friends")}
          className="group relative flex items-center justify-center"
          aria-label="Home"
          aria-current={homeActive ? "page" : undefined}
        >
          <span
            className={`absolute -left-3 w-1 rounded-r-full bg-white transition-all ${
              homeActive ? "h-10" : "h-0 group-hover:h-5"
            }`}
          />
          <span
            className={`grid h-12 w-12 place-items-center text-white transition-all ${
              homeActive
                ? "rounded-xl bg-blurple"
                : "rounded-3xl bg-d-dark text-d-text group-hover:rounded-xl group-hover:bg-blurple group-hover:text-white"
            }`}
          >
            <MessageCircle size={26} strokeWidth={2.2} />
          </span>
        </button>
      </Tooltip>
      <div className="my-1 h-0.5 w-8 rounded bg-d-dark" />

      <div className="d-scroll flex flex-1 flex-col items-center gap-2 overflow-y-auto">
        {servers.map((s) => {
          const active = s.id === activeServerId;
          return (
            <Tooltip key={s.id} label={s.name} side="right">
              <button
                onClick={() => onSelect(s.id)}
                className="group relative flex items-center justify-center"
              >
              <span
                className={`absolute -left-3 w-1 rounded-r-full bg-white transition-all ${
                  active ? "h-10" : "h-0 group-hover:h-5"
                }`}
              />
              {s.icon_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.icon_url}
                  alt={s.name}
                  className={`h-12 w-12 bg-d-dark object-cover transition-all ${
                    active ? "rounded-2xl" : "rounded-3xl group-hover:rounded-2xl"
                  }`}
                />
              ) : (
                <span
                  className={`grid h-12 w-12 place-items-center bg-d-dark text-sm font-semibold text-d-text transition-all ${
                    active ? "rounded-2xl" : "rounded-3xl group-hover:rounded-2xl"
                  }`}
                >
                  {initials(s.name)}
                </span>
              )}
              </button>
            </Tooltip>
          );
        })}

        <Tooltip label="Add a server" side="right">
          <button
            onClick={onAddServer}
            className="grid h-12 w-12 place-items-center rounded-3xl bg-d-dark text-online transition-all hover:rounded-2xl hover:bg-online hover:text-white"
          >
            <Plus size={24} />
          </button>
        </Tooltip>
      </div>
    </nav>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
