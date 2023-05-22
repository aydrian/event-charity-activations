import type { LoaderArgs } from "@remix-run/node";
import { json, Response } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError
} from "@remix-run/react";
import { prisma } from "~/services/db.server";
import Footer from "~/components/footer";
import { DonationForm } from "~/routes/resources+/donate";
import { USDollar } from "~/utils";

export const loader = async ({ params }: LoaderArgs) => {
  const { eventId } = params;
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      name: true,
      donationAmount: true,
      collectLeads: true,
      legalBlurb: true,
      Charities: {
        select: {
          color: true,
          Charity: { select: { id: true, name: true } }
        }
      }
    }
  });
  if (!event) {
    throw new Response("Not Found", {
      status: 404
    });
  }
  const { Charities, ...rest } = event;
  const charities = Charities.map((item) => ({
    color: item.color,
    ...item.Charity
  }));
  return json({ event: { ...rest, charities } });
};

export default function EventDonate() {
  const { event } = useLoaderData<typeof loader>();
  return (
    <>
      <main className="prose min-h-screen max-w-full bg-brand-deep-purple px-4 pb-8 pt-8">
        <section className="mx-auto max-w-4xl">
          <h1 className="font-extra-bold mb-0 bg-gradient-to-r from-brand-iridescent-blue to-brand-electric-purple bg-clip-text text-center text-5xl !leading-tight text-transparent sm:text-7xl">
            {event.name}
          </h1>
          <p className="text-center text-white">
            Complete the form and we'll donate{" "}
            {USDollar.format(Number(event.donationAmount))} to your selected
            charity.
          </p>
          <div className="rounded border border-brand-gray-b bg-white p-4 sm:px-16">
            <DonationForm event={event} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  }
  throw error;
}
