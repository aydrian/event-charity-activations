import type { LoaderArgs } from "@remix-run/node";
import { json, Response } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useRouteError,
  useLoaderData
} from "@remix-run/react";
import QRCode from "qrcode";
import { prisma } from "~/services/db.server";

export const loader = async ({ params }: LoaderArgs) => {
  const { slug } = params;
  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      Donations: { select: { charityId: true } },
      Charities: {
        select: {
          charityId: true,
          color: true,
          donation: true,
          Charity: { select: { name: true } }
        }
      }
    }
  });
  if (!event) {
    throw new Response("Not Found", {
      status: 404
    });
  }
  const qrcode = await QRCode.toDataURL(
    `https://${process.env.VERCEL_URL}/donation/${event.id}`
  );
  return json({ event, qrcode });
};

export default function EventDashboard() {
  const { event, qrcode } = useLoaderData<typeof loader>();
  return (
    <section className="prose mx-auto grid max-w-4xl">
      <h1 className="font-extra-bold mb-0 bg-gradient-to-r from-brand-iridescent-blue to-brand-electric-purple bg-clip-text text-center text-5xl !leading-tight text-transparent sm:text-7xl">
        {event.name}
      </h1>
      <div className="flex justify-items-stretch gap-12">
        <div className="grow rounded border border-brand-gray-b bg-white p-8 sm:px-16">
          Chart
          <ul>
            {event.Charities.map((charity) => (
              <li key={charity.charityId}>{charity.Charity.name}</li>
            ))}
          </ul>
          Donations: {event.Donations.length}
        </div>
        <div className="grow rounded border border-brand-gray-b bg-white p-8 sm:px-16">
          <img src={qrcode} alt="Scan me" className="aspect-square h-48" />
        </div>
      </div>
    </section>
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
