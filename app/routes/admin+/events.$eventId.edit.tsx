import type { LoaderArgs } from "@remix-run/node";
import { json, Response } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { EventEditor } from "~/routes/resources+/event-editor";

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireUser(request);
  const { eventId } = params;
  const findEvent = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      name: true,
      slug: true,
      startDate: true,
      endDate: true,
      location: true,
      donationAmount: true,
      twitter: true,
      tweetTemplate: true,
      collectLeads: true,
      legalBlurb: true,
      Charities: {
        select: { color: true, Charity: { select: { id: true, name: true } } }
      }
    }
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
        <EventEditor event={event} allCharities={allCharities} />
      </div>
    </section>
  );
}
