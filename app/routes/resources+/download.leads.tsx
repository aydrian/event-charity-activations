import type { LoaderArgs } from "@remix-run/node";

import { Response } from "@remix-run/node";
import { stringify } from "csv-stringify/sync";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request);
  const url = new URL(request.url);
  const eventId = url.searchParams.get("event_id");

  if (!eventId) {
    throw new Response("Expected query param: event_id", { status: 400 });
  }

  const event = await prisma.event.findUnique({
    select: { id: true, name: true, slug: true },
    where: { id: eventId }
  });
  if (!event) {
    throw new Response("Not Found", {
      status: 404
    });
  }

  const leads = await prisma.lead.findMany({
    orderBy: {
      lastName: "asc"
    },
    select: {
      company: true,
      email: true,
      firstName: true,
      jobRole: true,
      lastName: true,
      notes: true,
      score: true
    },
    where: {
      Donation: {
        eventId: event.id
      }
    }
  });

  const columns = [
    { key: "firstName" },
    { key: "lastName" },
    { key: "email" },
    { key: "company" },
    { key: "jobRole" },
    { key: "score" },
    { key: "notes" }
  ];
  const csv = stringify(leads, { columns, header: true });

  return new Response(csv, {
    headers: {
      "Content-Disposition": `attachment; filename="${event.slug}-leads.csv"`,
      "Content-Type": "text/csv"
    }
  });
};
