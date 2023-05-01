import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError
} from "@remix-run/react";

import { prisma } from "~/services/db.server";

export const loader = async ({ params }: LoaderArgs) => {
  const { donationId } = params;
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    select: {
      id: true,
      Event: { select: { name: true } },
      Charity: { select: { name: true } }
    }
  });
  if (!donation) {
    throw new Response("Not Found", {
      status: 404
    });
  }

  return json({ donation });
};

export default function DonateConfirm() {
  const { donation } = useLoaderData<typeof loader>();
  return (
    <main className="prose min-h-screen max-w-full bg-brand-deep-purple px-4 pb-8 pt-8">
      <section className="mx-auto max-w-4xl">
        <h1 className="font-extra-bold mb-0 bg-gradient-to-r from-brand-iridescent-blue to-brand-electric-purple bg-clip-text text-center text-5xl !leading-tight text-transparent sm:text-7xl">
          {donation.Event.name}
        </h1>
        <div className="rounded border border-brand-gray-b bg-white p-4 sm:px-16">
          <div>
            Thank you for helping us donate to {donation.Charity.name} at{" "}
            {donation.Event.name}.
          </div>
        </div>
      </section>
    </main>
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
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
