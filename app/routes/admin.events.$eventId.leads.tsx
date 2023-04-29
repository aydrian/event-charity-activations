import type { LoaderArgs } from "@remix-run/node";
import { json, Response } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/services/auth.server";
import { prisma } from "~/services/db.server";
import { getLeads } from "~/models/leads.server";
import { ScoreIcon } from "~/components/score-icon";
import { PencilIcon } from "@heroicons/react/24/outline";

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireUser(request);
  const { eventId, leadId } = params;
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, name: true, collectLeads: true }
  });
  if (!event || !event.collectLeads) {
    throw new Response("Not Found", {
      status: 404
    });
  }
  const leads = await getLeads(event.id);

  return json({ event, leads, selectedLeadId: leadId });
};

export default function EventLeads() {
  const { event, leads, selectedLeadId } = useLoaderData<typeof loader>();
  return (
    <section className="prose mx-auto grid max-w-4xl">
      <h1 className="font-extra-bold mb-0 bg-gradient-to-r from-brand-iridescent-blue to-brand-electric-purple bg-clip-text text-center text-5xl !leading-tight text-transparent sm:text-7xl">
        {event.name}
      </h1>
      <div className="rounded border border-brand-gray-b bg-white p-4 sm:px-16">
        <h2 className="mt-0 text-brand-deep-purple">Leads</h2>
        {leads.length > 0 ? (
          <div className="flex flex-col">
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                isSelected={lead.id === selectedLeadId}
              />
            ))}
          </div>
        ) : (
          <div>No leads have been collected.</div>
        )}
      </div>
    </section>
  );
}

type LeadCardProps = {
  lead: Awaited<ReturnType<typeof getLeads>>[number];
  isSelected?: boolean;
};

function LeadCard({ lead, isSelected = false }: LeadCardProps) {
  return (
    <div key={lead.id} className="flex flex-col gap-1">
      <div className="flex items-baseline gap-1">
        <ScoreIcon score={lead.score} className="h-5 rounded p-0.5" />
        <a
          href={`mailto:${lead.email}`}
        >{`${lead.lastName}, ${lead.firstName}`}</a>
        <div className="flex gap-1">
          <div>{lead.jobRole}</div>
          <div>{lead.company}</div>
        </div>
        {!isSelected ? (
          <Link
            to={`./${lead.id}`}
            preventScrollReset={true}
            reloadDocument={true}
          >
            <PencilIcon
              title="Edit Lead"
              className="aspect-square h-4 text-brand-deep-purple"
            />
            <span className="sr-only">Edit Lead</span>
          </Link>
        ) : null}
      </div>
      {isSelected ? <Outlet context={{ lead }} /> : null}
    </div>
  );
}
