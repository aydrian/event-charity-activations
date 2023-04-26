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
    <div>
      Thank you for helping us donate to {donation.Charity.name} at{" "}
      {donation.Event.name}
    </div>
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
