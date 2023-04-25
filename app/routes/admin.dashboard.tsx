import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Fragment } from "react";
import { requireUser } from "~/services/auth.server";
import { prisma } from "~/services/db.server";

export const loader = async ({ request }: LoaderArgs) => {
  await requireUser(request);
  const charities = await prisma.charity.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      Creator: { select: { fullName: true } }
    }
  });
  const events = await prisma.event.findMany({
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      location: true
    }
  });
  return json({ charities, events });
};

export default function AdminDashboard() {
  const { charities, events } = useLoaderData<typeof loader>();
  return (
    <section>
      <h1>Admin Dashboard</h1>
      <h2>Charities</h2>
      {charities.length > 0 ? (
        <dl>
          {charities.map((charity) => (
            <Fragment key={charity.id}>
              <dt>{charity.name}</dt>
              <dd>
                <div>{charity.description}</div>
                <div>Added by {charity.Creator.fullName}</div>
              </dd>
            </Fragment>
          ))}
        </dl>
      ) : (
        <div>There are no charities</div>
      )}
      <Link to="/admin/charities/new">Add Charity</Link>
      <h2>Events</h2>
      {events.length > 0 ? (
        <dl>
          {events.map((event) => (
            <Fragment key={event.id}>
              <dt>{event.name}</dt>
              <dd>{event.location}</dd>
            </Fragment>
          ))}
        </dl>
      ) : (
        <div>There are no events</div>
      )}
      <Link to="/admin/events/new">Add Event</Link>
    </section>
  );
}
