import type { LoaderArgs } from "@remix-run/node";

import { Response, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { EventEditor } from "~/routes/resources+/event-editor.tsx";
import { requireUserId } from "~/utils/auth.server.ts";
import { prisma } from "~/utils/db.server.ts";

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireUserId(request);
  const { eventId } = params;
  const findEvent = await prisma.event.findUnique({
    select: {
      Charities: {
        select: { Charity: { select: { id: true, name: true } }, color: true }
      },
      collectLeads: true,
      donationAmount: true,
      endDate: true,
      id: true,
      legalBlurb: true,
      location: true,
      name: true,
      responseTemplate: true,
      slug: true,
      startDate: true,
      tweetTemplate: true,
      twitter: true
    },
    where: { id: eventId }
  });
  if (!findEvent) {
    throw new Response("Not Found", {
      status: 404
    });
  }
  const allCharities = await prisma.charity.findMany({
    select: { id: true, name: true }
  });
  const { Charities, ...event } = findEvent;

  const charities = Charities.map((charity) => {
    return {
      ...charity.Charity,
      color: charity.color
    };
  });

  return json({ allCharities, event: { ...event, charities } });
};

export default function EditEvent() {
  const { allCharities, event } = useLoaderData<typeof loader>();

  return (
    <section className="prose mx-auto grid max-w-4xl gap-12">
      <div className="rounded border border-brand-gray-b bg-white p-8 sm:px-16">
        <h2 className="m-0 font-bold text-brand-deep-purple">Edit Event</h2>
        <EventEditor allCharities={allCharities} event={event} />
      </div>
    </section>
  );
}
