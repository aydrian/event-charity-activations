import type { LoaderArgs } from "@remix-run/node";

import { Response, json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError
} from "@remix-run/react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Title,
  Tooltip
} from "chart.js";
import QRCode from "qrcode";
import React from "react";
import { Bar } from "react-chartjs-2";
import { useEventSource } from "remix-utils";

import appConfig from "~/app.config.ts";
import { Icon } from "~/components/icon.tsx";
import { getDashboardCharities } from "~/models/charity.server.ts";
import { prisma } from "~/utils/db.server.ts";
import env from "~/utils/env.server.ts";
import { hexToRgbA } from "~/utils/misc.ts";

import type { NewDonationEvent } from "./resources+/crl-cdc-webhook.tsx";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

export const loader = async ({ params }: LoaderArgs) => {
  const { slug } = params;
  const event = await prisma.event.findUnique({
    select: {
      donationAmount: true,
      donationCurrency: true,
      endDate: true,
      id: true,
      name: true,
      startDate: true
    },
    where: { slug }
  });
  if (!event) {
    throw new Response("Not Found", {
      status: 404
    });
  }

  const charities = await getDashboardCharities(event.id);
  const donateLink = `${
    env.NODE_ENV === "development"
      ? "https://localhost:3000"
      : `https://${env.FLY_APP_NAME}.fly.dev`
  }/donate/${event.id}`;
  const qrcode = await QRCode.toDataURL(donateLink);
  return json({ charities, donateLink, event, qrcode });
};

export default function EventDashboard() {
  const {
    charities: initCharities,
    donateLink,
    event,
    qrcode
  } = useLoaderData<typeof loader>();
  const newDonationEventString = useEventSource("/resources/crl-cdc-webhook", {
    event: `new-donation-${event.id}`
  });
  const newDonationEvent: NewDonationEvent | null = newDonationEventString
    ? JSON.parse(newDonationEventString)
    : null;
  const charities = newDonationEvent?.charities ?? initCharities;
  const Currency = Intl.NumberFormat(undefined, {
    currency: event.donationCurrency,
    minimumFractionDigits: 0,
    style: "currency"
  });

  return (
    <main className="min-h-screen max-w-full bg-brand-deep-purple p-4">
      <section className="prose mx-auto grid max-w-7xl">
        <h1 className="mb-0 bg-gradient-to-r from-brand-iridescent-blue to-brand-electric-purple bg-clip-text text-center font-poppins text-5xl font-bold !leading-tight text-transparent sm:text-7xl">
          {appConfig.company.name} at {event.name}
        </h1>
        <div className="flex flex-col justify-stretch gap-4">
          <div className="flex grow gap-4">
            <div className="border-brand-gray-b grow rounded border bg-white p-2">
              <Bar
                data={{
                  datasets: [
                    {
                      backgroundColor: charities.map((charity) =>
                        hexToRgbA(charity.color, 0.5)
                      ),
                      borderColor: charities.map((charity) => charity.color),
                      borderWidth: 1,
                      data: charities.map((charity) => charity.count),
                      label: "total donations"
                    }
                  ],
                  labels: charities.map((charity) => charity.name)
                }}
                options={{
                  responsive: true,
                  scales: { y: { ticks: { stepSize: 1 } } }
                }}
              />
            </div>
            <div className="flex shrink flex-col justify-stretch gap-4 text-center">
              <div className="border-brand-gray-b flex grow flex-col items-center justify-center rounded border bg-white p-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-electric-purple p-2">
                  <Icon
                    className="aspect-square h-full text-gray-100"
                    name="gift-outline"
                  />
                </div>
                <div className="text-3xl font-extrabold">
                  {charities.reduce((acc, cur) => acc + cur.count, 0)}
                </div>
                <div className="text-semibold text-sm uppercase text-gray-700">
                  Total Donations
                </div>
              </div>
              <div className="border-brand-gray-b flex grow flex-col items-center justify-center gap-1 rounded border bg-white p-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-iridescent-blue p-2">
                  <Icon
                    className="aspect-square h-full text-gray-600"
                    name="banknotes-outline"
                  />
                </div>
                <div className="text-3xl font-extrabold">
                  {Currency.format(
                    charities.reduce(
                      (acc, cur) =>
                        acc + cur.count * Number(event.donationAmount),
                      0
                    )
                  )}
                </div>
                <div className="text-semibold text-sm uppercase text-gray-700">
                  Total Donated
                </div>
              </div>
              <div className="border-brand-gray-b flex grow flex-col items-center justify-center gap-1 rounded border bg-white p-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1da1f2] p-2">
                  <svg
                    className="aspect-square h-full text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </div>
                <div className="font-extrabold">
                  @{appConfig.company.twitter}
                </div>
              </div>
            </div>
          </div>
          <div className="border-brand-gray-b flex shrink gap-4 rounded border bg-white p-2">
            <a
              className="flex grow justify-center"
              href={donateLink}
              rel="noreferrer"
              target="_blank"
            >
              <img
                alt="Scan me"
                className="my-0 aspect-square h-full"
                src={qrcode}
              />
            </a>
            <div className="flex shrink flex-col justify-center gap-4">
              <h2 className="my-0 text-brand-deep-purple">
                Scan the QR Code and we'll donate{" "}
                {Currency.format(Number(event.donationAmount))} to your choice
                of the following charities:
              </h2>
              <div className="flex items-center justify-around">
                {charities.map((charity) => (
                  <React.Fragment key={charity.charity_id}>
                    {charity.logoSVG ? (
                      <img
                        src={`data:image/svg+xml;utf8,${encodeURIComponent(
                          charity.logoSVG
                        )}`}
                        alt={charity.name}
                        className="h-12 text-brand-deep-purple"
                      />
                    ) : null}
                  </React.Fragment>
                ))}
              </div>
            </div>
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
      <div className="bg-white">
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  }

  throw error;
}
