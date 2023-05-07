import type { LoaderArgs, SerializeFrom } from "@remix-run/node";
import type { ExternalScriptsFunction } from "remix-utils";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError
} from "@remix-run/react";
import handlebars from "handlebars";

import { prisma } from "~/services/db.server";
import Footer from "~/components/footer";

export const loader = async ({ params }: LoaderArgs) => {
  const { donationId } = params;
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    select: {
      id: true,
      Event: {
        select: {
          name: true,
          donationAmount: true,
          twitter: true,
          tweetTemplate: true
        }
      },
      Charity: { select: { name: true, twitter: true } }
    }
  });
  if (!donation) {
    throw new Response("Not Found", {
      status: 404
    });
  }

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  });

  const tweetTemplate = handlebars.compile(donation.Event.tweetTemplate);
  const tweetText = tweetTemplate({
    donationAmount: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0
    }).format(donation.Event.donationAmount.toNumber()),
    event: donation.Event.twitter
      ? `@${donation.Event.twitter}`
      : donation.Event.name,
    charity: donation.Charity.twitter
      ? `@${donation.Charity.twitter}`
      : donation.Charity.name
  });

  return json({ donation, tweetText });
};

let scripts: ExternalScriptsFunction<SerializeFrom<typeof loader>> = () => {
  return [
    {
      async: true,
      src: "https://platform.twitter.com/widgets.js"
    }
  ];
};
export let handle = { scripts };

export default function DonateConfirm() {
  const { donation, tweetText } = useLoaderData<typeof loader>();
  const searchParams = new URLSearchParams();
  searchParams.append("text", tweetText);
  searchParams.append("url", "https://cockroachlabs.com/");
  searchParams.append("via", "CockroachDB");
  return (
    <>
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
            <a
              className="twitter-share-button"
              data-size="large"
              href={`https://twitter.com/intent/tweet?${searchParams}`}
            >
              Tweet
            </a>
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
