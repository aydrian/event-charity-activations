import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { requireUser } from "~/services/auth.server";
import { prisma } from "~/services/db.server";

const Schema = z.object({
  charities: z
    .array(z.object({ charityId: z.string(), color: z.string() }))
    .max(4, "A max of 4 charities is allowed")
    .min(1, "At least 1 charity is required")
});

export const loader = async ({ request }: LoaderArgs) => {
  await requireUser(request);
  const charities = await prisma.charity.findMany({
    select: { id: true, name: true }
  });
  return json({ charities });
};

export default function Test() {
  const { charities } = useLoaderData<typeof loader>();

  return (
    <section className="prose mx-auto grid max-w-4xl gap-12">
      <div className="rounded border border-brand-gray-b bg-white p-8 sm:px-16">
        <h2 className="m-0 font-bold text-brand-deep-purple">Create Event</h2>
        <EventEditor allCharities={charities} />
      </div>
    </section>
  );
}
