import type { LoaderArgs } from "@remix-run/node";
import { Response } from "@remix-run/node";
import { stringify } from "csv-stringify/sync";

import { requireUser } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export const loader = async ({ request }: LoaderArgs) => {
  await requireUser(request);
  const url = new URL(request.url);
  const eventId = url.searchParams.get("event_id");

  if (!eventId) {
    throw new Response("Expected query param: event_id", { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, name: true, slug: true }
  });
  if (!event) {
    throw new Response("Not Found", {
      status: 404
    });
  }

  const leads = await prisma.lead.findMany({
    where: {
      Donation: {
        eventId: event.id
      }
    },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      company: true,
      jobRole: true,
      score: true,
      notes: true
    },
    orderBy: {
      lastName: "asc"
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
  const csv = stringify(leads, { header: true, columns });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${event.slug}-leads.csv"`
    }
  });
};
