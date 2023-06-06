import { Link } from "@remix-run/react";
import {
  ChartBarSquareIcon,
  DocumentArrowDownIcon,
  PencilIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

type EventCardProps = {
  event: {
    id: string;
    name: string;
    slug: string;
    startDate: string;
    endDate: string;
    location: string;
    collectLeads: boolean;
  };
};

function formatDates(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const sameYear = start.getFullYear() === end.getFullYear();
  // const sameMonth = start.getMonth() === end.getMonth();
  return `${start.toLocaleDateString("en-us", {
    ...(!sameYear && { year: "numeric" }),
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  })} - ${end.toLocaleDateString("en-us", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  })}`;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="rounded border border-brand-gray-b bg-white">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">{event.name}</div>
          <Link to={`/admin/events/${event.id}/edit`}>
            <PencilIcon
              title="Edit Event"
              className="aspect-square h-5 text-gray-800"
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
        <Link to={`/dashboard/${event.slug}`} title="Event Dashboard">
          <ChartBarSquareIcon className="h-8 w-8 text-brand-deep-purple" />
          <span className="sr-only">Event Dashboard</span>
        </Link>
        {event.collectLeads ? (
          <>
            <Link to={`/admin/events/${event.id}/leads`} title="Leads">
              <UserGroupIcon className="h-8 w-8 text-brand-deep-purple" />
              <span className="sr-only">Leads</span>
            </Link>
            <a
              href={`/resources/download/leads?${new URLSearchParams([
                ["event_id", event.id]
              ])}`}
            >
              <DocumentArrowDownIcon className="h-8 w-8 text-brand-deep-purple" />
              <span className="sr-only">Download Leads</span>
            </a>
          </>
        ) : null}
      </div>
    </div>
  );
}
