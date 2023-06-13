import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { EventEditor } from "~/routes/resources+/event-editor";

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);
  const charities = await prisma.charity.findMany({
    select: { id: true, name: true }
  });
  return json({ charities });
};

export default function AddEvent() {
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
