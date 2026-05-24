"use client";

import { Profile } from "@/lib/types";
import { Avatar } from "@/components/Avatar";

type ActivityCard = {
  game: string;
  detail: string;
  inVoice: number;
};

// Clearly-mock activity, paired with real profiles when available.
const MOCK_ACTIVITY: ActivityCard[] = [
  { game: "Pixel Drifters", detail: "Ranked — Round 3", inVoice: 2 },
  { game: "Star Foundry", detail: "Building a new base", inVoice: 1 },
];

export default function ActivityPanel({ people }: { people: Profile[] }) {
  const cards = MOCK_ACTIVITY.slice(0, Math.min(MOCK_ACTIVITY.length, people.length));

  return (
    <aside className="hidden h-full w-[340px] shrink-0 flex-col border-l border-black/20 bg-d-mid px-4 py-5 xl:flex">
      <h2 className="mb-4 text-xl font-bold text-d-bright">Active Now</h2>

      {cards.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <h3 className="text-base font-semibold text-d-bright">
            It&apos;s quiet for now
          </h3>
          <p className="mt-1.5 max-w-[16rem] text-sm text-d-muted">
            When friends start an activity it&apos;ll show up here.
          </p>
        </div>
      ) : (
        <div className="d-scroll flex-1 space-y-3 overflow-y-auto">
          {cards.map((card, i) => {
            const host = people[i];
            return (
              <div
                key={card.game}
                className="rounded-lg bg-d-dark/80 p-3 shadow-sm shadow-black/20"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar
                    src={host.avatar_url}
                    alt={host.display_name}
                    size={32}
                    status={host.status}
                    ring="ring-d-dark"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-d-bright">
                      {host.display_name}
                    </p>
                    <p className="truncate text-xs text-d-muted">
                      Playing {card.game}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-d-muted">{card.detail}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-d-muted">
                    {card.inVoice} in voice
                  </span>
                  <button
                    type="button"
                    className="rounded bg-online px-3 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Join
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
