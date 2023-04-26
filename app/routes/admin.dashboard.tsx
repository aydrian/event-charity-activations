import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Fragment } from "react";
import { requireUser } from "~/services/auth.server";
import { prisma } from "~/services/db.server";

export const loader = async ({ request }: LoaderArgs) => {
  await requireUser(request);
  const [charities, events] = await Promise.all([
    prisma.charity.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        Creator: { select: { fullName: true } }
      }
    }),
    prisma.event.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        startDate: true,
        endDate: true,
        location: true
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
      <div className="flex justify-between gap-12">
        <div className="grow rounded border border-brand-gray-b bg-white p-8 sm:px-16">
          <h2 className="mt-0 font-bold text-brand-deep-purple">Events</h2>
          {events.length > 0 ? (
            <dl>
              {events.map((event) => (
                <Fragment key={event.id}>
                  <dt className="font-semibold">
                    <Link to={`/dashboard/${event.slug}`}>{event.name}</Link>
                  </dt>
                  <dd className="text-sm">{event.location}</dd>
                </Fragment>
              ))}
            </dl>
          ) : (
            <div>There are no events</div>
          )}
          <Link to="/admin/events/new">Add Event</Link>
        </div>
        <div className="shrink rounded border border-brand-gray-b bg-white p-8 sm:px-16">
          <h2 className="mt-0 font-bold text-brand-deep-purple">Charities</h2>
          {charities.length > 0 ? (
            <dl>
              {charities.map((charity) => (
                <Fragment key={charity.id}>
                  <dt className="font-semibold">{charity.name}</dt>
                  <dd>
                    <div className="text-sm">{charity.description}</div>
                    <div className="text-xs">
                      Added by {charity.Creator.fullName}
                    </div>
                  </dd>
                </Fragment>
              ))}
            </dl>
          ) : (
            <div>There are no charities</div>
          )}
          <Link to="/admin/charities/new">Add Charity</Link>
        </div>
      </div>
    </section>
  );
}
