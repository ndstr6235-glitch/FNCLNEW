import Link from "next/link";
import { EVENT_TYPES } from "@/lib/crm/constants";
import type { EventType } from "@/lib/crm/types";

interface EventItem {
  id: string;
  type: EventType;
  title: string;
  date: string;
  time: string;
  clientName?: string;
}

interface UpcomingEventsProps {
  events: EventItem[];
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  return (
    <div className="bg-surface p-4 lg:p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text">
          Nadcházející události
        </h2>
        <Link href="/calendar" className="text-xs text-gold hover:underline">
          Zobrazit vše →
        </Link>
      </div>
      {events.length === 0 ? (
        <p className="text-sm text-text-dim py-4 text-center">
          Žádné události v příštích 7 dnech
        </p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const meta = EVENT_TYPES[event.type];
            return (
              <div key={event.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 flex items-center justify-center text-sm shrink-0"
                  style={{ backgroundColor: meta.pale }}
                >
                  {meta.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-text-dim">
                    {event.date} {event.time}
                    {event.clientName && ` — ${event.clientName}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
