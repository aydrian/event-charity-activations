import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError
} from "@remix-run/react";
import handlebars from "handlebars";
import { processMarkdownToHtml } from "~/utils/markdown.server";

import { prisma } from "~/utils/db.server";
import { USDollar } from "~/utils/misc";
import TweetButton from "~/components/tweet-button";
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
          responseTemplate: true,
          tweetTemplate: true
        }
      },
      Charity: { select: { name: true, twitter: true, website: true } }
    }
  });
  if (!donation) {
    throw new Response("Not Found", {
      status: 404
    });
  }

  const responseTemplate = handlebars.compile(donation.Event.responseTemplate);
  const responseMd = responseTemplate({
    donationAmount: USDollar.format(donation.Event.donationAmount.toNumber()),
    event: { name: donation.Event.name },
    charity: { name: donation.Charity.name, url: donation.Charity.website }
  });
  const responseHtml = processMarkdownToHtml(responseMd.trim());

  const tweetTemplate = handlebars.compile(donation.Event.tweetTemplate);
  const tweetText = tweetTemplate({
    donationAmount: USDollar.format(donation.Event.donationAmount.toNumber()),
    event: donation.Event.twitter
      ? `@${donation.Event.twitter}`
      : donation.Event.name,
    charity: donation.Charity.twitter
      ? `@${donation.Charity.twitter}`
      : donation.Charity.name
  });

  return json({ donation, responseHtml, tweetText });
};

export default function DonateConfirm() {
  const { donation, responseHtml, tweetText } = useLoaderData<typeof loader>();
  return (
    <>
      <main className="prose min-h-screen max-w-full bg-brand-deep-purple px-4 pb-8 pt-8">
        <section className="mx-auto max-w-4xl">
          <h1 className="font-extra-bold mb-0 bg-gradient-to-r from-brand-iridescent-blue to-brand-electric-purple bg-clip-text text-center text-5xl !leading-tight text-transparent sm:text-7xl">
            {donation.Event.name}
          </h1>
          <div className="rounded border border-brand-gray-b bg-white p-4 sm:px-16">
            <div
              dangerouslySetInnerHTML={{
                __html: responseHtml.content
              }}
            />
            <TweetButton tweetText={tweetText} />
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
