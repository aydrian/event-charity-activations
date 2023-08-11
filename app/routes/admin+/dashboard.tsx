import type { LoaderArgs } from "@remix-run/node";

import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import EventCard from "~/components/event-card.tsx";
import { Icon } from "~/components/icon.tsx";
import { requireUserId } from "~/utils/auth.server.ts";
import { prisma } from "~/utils/db.server.ts";

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
  // const SVG = new InlineSVG();
  return (
    <section className="prose mx-auto grid max-w-4xl">
      <h1 className="font-poppins text-white">Admin Dashboard</h1>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:gap-12">
        <div className="border-brand-gray-b grow rounded border bg-white p-8 sm:px-16">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="mb-0 mt-0 font-bold text-brand-deep-purple">
              Events
            </h2>
            <Link to="/admin/events/new">
              <Icon className="aspect-square h-6" name="plus-circle-outline" />
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
        <div className="border-brand-gray-b shrink rounded border bg-white p-8 sm:px-16">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="mb-0 mt-0 font-bold text-brand-deep-purple">
              Charities
            </h2>
            <Link to="/admin/charities/new">
              <Icon className="aspect-square h-6" name="plus-circle-outline" />
              <span className="sr-only">Add Charity</span>
            </Link>
          </div>
          {charities.length > 0 ? (
            <dl className=" divide-y divide-gray-200">
              {charities.map((charity) => (
                <div className="flex flex-col pb-3" key={charity.id}>
                  <dt>
                    {charity.logoSVG ? (
                      <img
                        src={`data:image/svg+xml;utf8,${encodeURIComponent(
                          charity.logoSVG
                        )}`}
                        alt={charity.name}
                        className="h-12 text-brand-deep-purple"
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
