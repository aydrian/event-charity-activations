import { Link } from "@remix-run/react";

import { Icon } from "~/components/icon.tsx";

type EventCardProps = {
  event: {
    collectLeads: boolean;
    endDate: string;
    id: string;
    location: string;
    name: string;
    slug: string;
    startDate: string;
  };
};

function formatDates(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const sameYear = start.getFullYear() === end.getFullYear();
  // const sameMonth = start.getMonth() === end.getMonth();
  return `${start.toLocaleDateString("en-us", {
    ...(!sameYear && { year: "numeric" }),
    day: "numeric",
    month: "short",
    timeZone: "UTC"
  })} - ${end.toLocaleDateString("en-us", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric"
  })}`;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="border-brand-gray-b rounded border bg-white">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">{event.name}</div>
          <Link to={`/admin/events/${event.id}/edit`}>
            <Icon
              className="aspect-square h-5 text-gray-800"
              name="pencil-outline"
            />
            <span className="sr-only">Edit Event</span>
          </Link>
        </div>
        <div className="text-lg font-medium text-gray-800">
          {formatDates(event.startDate, event.endDate)}
        </div>
        <div>{event.location}</div>
      </div>
      <div className="flex gap-2 px-6 pb-2 pt-4">
        <Link title="Event Dashboard" to={`/dashboard/${event.slug}`}>
          <Icon
            className="h-8 w-8 text-brand-deep-purple"
            name="chart-bar-square-outline"
          />
          <span className="sr-only">Event Dashboard</span>
        </Link>
        {event.collectLeads ? (
          <>
            <Link title="Leads" to={`/admin/events/${event.id}/leads`}>
              <Icon
                className="h-8 w-8 text-brand-deep-purple"
                name="user-group-outline"
              />
              <span className="sr-only">Leads</span>
            </Link>
            <a
              href={`/resources/download/leads?${new URLSearchParams([
                ["event_id", event.id]
              ])}`}
            >
              <Icon
                className="h-8 w-8 text-brand-deep-purple"
                name="document-arrow-down-outline"
              />
              <span className="sr-only">Download Leads</span>
            </a>
          </>
        ) : null}
      </div>
    </div>
  );
}
