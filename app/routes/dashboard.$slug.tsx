import type { LoaderArgs } from "@remix-run/node";
import type { GroupedDonation } from "@prisma/client";
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
import { prisma } from "~/services/db.server";
import { initApollo } from "~/services/apollo";

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

function hexToRgbA(hex: string, alpha: number = 1) {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = Number("0x" + c.join(""));
    return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(
      ","
    )},${alpha})`;
  }
  throw new Error("Bad Hex");
}

export const loader = async ({ params }: LoaderArgs) => {
  const { slug } = params;
  const result = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
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
      donation: charity.donation,
      name: charity.Charity.name,
      count: counts[charity.charityId] || 0
    };
  });
  const qrcode = await QRCode.toDataURL(
    `https://${process.env.VERCEL_URL}/donate/${event.id}`
  );
  return json({ charities, event, qrcode });
};

export default function EventDashboard() {
  const {
    charities: initCharities,
    event,
    qrcode
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
    <section className="prose mx-auto grid max-w-5xl">
      <h1 className="font-extra-bold mb-0 bg-gradient-to-r from-brand-iridescent-blue to-brand-electric-purple bg-clip-text text-center text-5xl !leading-tight text-transparent sm:text-7xl">
        {event.name}
      </h1>
      <div className="flex justify-items-stretch gap-12">
        <div className="grow rounded border border-brand-gray-b bg-white p-1">
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
          Donations: {charities.reduce((acc, cur) => acc + cur.count, 0)}
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
      <div className="bg-white">
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className="bg-white">
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
