import type { LoaderArgs } from "@remix-run/node";

import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import SVG from "react-inlinesvg";

import EventCard from "~/components/event-card";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);
  const [charities, events] = await Promise.all([
    prisma.charity.findMany({
      select: {
        Creator: { select: { fullName: true } },
        id: true,
        logoSVG: true,
        name: true,
        website: true
      }
    }),
    prisma.event.findMany({
      orderBy: { endDate: "desc" },
      select: {
        collectLeads: true,
        endDate: true,
        id: true,
        location: true,
        name: true,
        slug: true,
        startDate: true
      }
    })
  ]);
  return json({ charities, events });
};

export default function AdminDashboard() {
  const { charities, events } = useLoaderData<typeof loader>();
  return (
    <section className="prose mx-auto grid max-w-4xl">
      <h1 className="text-white">Admin Dashboard</h1>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:gap-12">
        <div className="grow rounded border border-brand-gray-b bg-white p-8 sm:px-16">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="mb-0 mt-0 font-bold text-brand-deep-purple">
              Events
            </h2>
            <Link to="/admin/events/new">
              <PlusCircleIcon
                className="aspect-square h-6"
                title="Add Charity"
              />
              <span className="sr-only">Add Event</span>
            </Link>
          </div>
          {events.length > 0 ? (
            <div className="flex flex-col gap-4">
              {events.map((event) => (
                <EventCard event={event} key={event.id} />
              ))}
            </div>
          ) : (
            <div>There are no events</div>
          )}
        </div>
        <div className="shrink rounded border border-brand-gray-b bg-white p-8 sm:px-16">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="mb-0 mt-0 font-bold text-brand-deep-purple">
              Charities
            </h2>
            <Link to="/admin/charities/new">
              <PlusCircleIcon
                className="aspect-square h-6"
                title="Add Charity"
              />
              <span className="sr-only">Add Charity</span>
            </Link>
          </div>
          {charities.length > 0 ? (
            <dl className=" divide-y divide-gray-200">
              {charities.map((charity) => (
                <div className="flex flex-col pb-3" key={charity.id}>
                  <dt>
                    {charity.logoSVG ? (
                      <SVG
                        className="h-12 text-brand-deep-purple"
                        src={charity.logoSVG}
                      />
                    ) : null}
                    <div className="font-semibold">
                      <Link to={`/admin/charities/${charity.id}/edit`}>
                        {charity.name}
                      </Link>
                    </div>
                  </dt>
                  <dd>
                    <div className="text-sm">
                      <a
                        href={
                          charity.website ||
                          `https://google.com/search?${new URLSearchParams([
                            ["q", charity.name]
                          ])}`
                        }
                        rel="noreferrer noopener"
                        target="_blank"
                      >
                        {charity.website}
                      </a>
                    </div>
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <div>There are no charities</div>
          )}
        </div>
      </div>
    </section>
  );
}
