import type { LoaderArgs } from "@remix-run/node";
import type { GroupedDonation } from "@prisma/client";
import React from "react";
import { json, Response } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useRouteError,
  useLoaderData
} from "@remix-run/react";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { gql, useSubscription } from "@apollo/client";
import SVG from "react-inlinesvg";
import { prisma } from "~/services/db.server";
import { initApollo } from "~/services/apollo";
import { hexToRgbA } from "~/utils";
import { BanknotesIcon, GiftIcon } from "@heroicons/react/24/outline";
import { USDollar } from "~/utils";

const client = initApollo();

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const GET_DONATIONS = gql`
  subscription DonationAdded($event_id: uuid) {
    grouped_donations(where: { event_id: { _eq: $event_id } }) {
      charity_id
      event_id
      count
    }
  }
`;

export const loader = async ({ params }: LoaderArgs) => {
  const { slug } = params;
  const result = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      donationAmount: true,
      startDate: true,
      endDate: true,
      Charities: {
        select: {
          charityId: true,
          color: true,
          Charity: { select: { name: true, logoSVG: true } }
        }
      }
    }
  });
  if (!result) {
    throw new Response("Not Found", {
      status: 404
    });
  }
  const { Charities, ...event } = result;
  const groupedResults = await prisma.groupedDonation.findMany({
    where: { event_id: event.id },
    select: { charity_id: true, count: true }
  });
  const counts: { [key: string]: number } = groupedResults.reduce(
    (obj, item) => {
      return { ...obj, [item.charity_id]: item.count };
    },
    {}
  );
  const charities = Charities.map((charity) => {
    return {
      charity_id: charity.charityId,
      color: charity.color,
      name: charity.Charity.name,
      logoSVG: charity.Charity.logoSVG,
      count: counts[charity.charityId] || 0
    };
  });
  const donateLink = `${
    process.env.NODE_ENV === "development" ? "http" : "https"
  }://${process.env.VERCEL_URL}/donate/${event.id}`;
  const qrcode = await QRCode.toDataURL(donateLink);
  return json({ charities, event, qrcode, donateLink });
};

export default function EventDashboard() {
  const {
    charities: initCharities,
    event,
    qrcode,
    donateLink
  } = useLoaderData<typeof loader>();
  const [charities, setCharities] = useState(initCharities);
  const { data, error } = useSubscription(GET_DONATIONS, {
    variables: { event_id: event.id },
    client
  });

  useEffect(() => {
    if (!data?.grouped_donations) return;
    const grouptedDonations: GroupedDonation[] = data.grouped_donations;
    const counts: { [key: string]: number } = grouptedDonations.reduce(
      (obj, item) => {
        return { ...obj, [item.charity_id]: item.count };
      },
      {}
    );

    const newCharities = charities.map((charity) => {
      charity.count = counts[charity.charity_id] || charity.count;
      return charity;
    });
    setCharities(newCharities);
  }, [data]);

  return (
    <main className="min-h-screen max-w-full bg-brand-deep-purple p-4">
      <section className="prose mx-auto grid max-w-7xl">
        <h1 className="font-extra-bold mb-0 bg-gradient-to-r from-brand-iridescent-blue to-brand-electric-purple bg-clip-text text-center text-5xl !leading-tight text-transparent sm:text-7xl">
          CockroachDB at {event.name}
        </h1>
        <div className="flex flex-col justify-stretch gap-4">
          <div className="flex grow gap-4">
            <div className="grow rounded border border-brand-gray-b bg-white p-2">
              <Bar
                options={{
                  responsive: true,
                  scales: { y: { ticks: { stepSize: 1 } } }
                }}
                data={{
                  labels: charities.map((charity) => charity.name),
                  datasets: [
                    {
                      label: "total donations",
                      data: charities.map((charity) => charity.count),
                      backgroundColor: charities.map((charity) =>
                        hexToRgbA(charity.color, 0.5)
                      ),
                      borderColor: charities.map((charity) => charity.color),
                      borderWidth: 1
                    }
                  ]
                }}
              />
            </div>
            <div className="flex shrink flex-col justify-stretch gap-4 text-center">
              <div className="flex grow flex-col items-center justify-center rounded border border-brand-gray-b bg-white p-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-electric-purple p-2">
                  <GiftIcon className="aspect-square h-full text-gray-100" />
                </div>
                <div className="text-3xl font-extrabold">
                  {charities.reduce((acc, cur) => acc + cur.count, 0)}
                </div>
                <div className="text-semibold text-sm uppercase text-gray-700">
                  Total Donations
                </div>
              </div>
              <div className="flex grow flex-col items-center justify-center gap-1 rounded border border-brand-gray-b bg-white p-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-iridescent-blue p-2">
                  <BanknotesIcon className="aspect-square h-full text-gray-600" />
                </div>
                <div className="text-3xl font-extrabold">
                  {USDollar.format(
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
              <div className="flex grow flex-col items-center justify-center gap-1 rounded border border-brand-gray-b bg-white p-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1da1f2] p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="aspect-square h-full text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </div>
                <div className="font-extrabold">@CockroachDB</div>
              </div>
            </div>
          </div>
          <div className="flex shrink gap-4 rounded border border-brand-gray-b bg-white p-2">
            <a
              href={donateLink}
              target="_blank"
              className="flex grow justify-center"
            >
              <img
                src={qrcode}
                alt="Scan me"
                className="my-0 aspect-square h-full"
              />
            </a>
            <div className="flex shrink flex-col justify-center gap-4">
              <h2 className="my-0 text-brand-deep-purple">
                Scan the QR Code and we'll donate{" "}
                {USDollar.format(Number(event.donationAmount))} USD to your
                choice of the following charities:
              </h2>
              <div className="flex items-center justify-around">
                {charities.map((charity) => (
                  <React.Fragment key={charity.charity_id}>
                    {charity.logoSVG ? (
                      <SVG
                        src={charity.logoSVG}
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
