import type { LoaderArgs } from "@remix-run/node";
import { json, Response } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getLeads } from "~/models/leads.server";
import { LeadScoreIcon } from "~/components/lead-score-icon";
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
        <div className="not-prose relative overflow-x-auto overflow-y-auto rounded-lg bg-white shadow">
          <table className="whitespace-no-wrap table-striped relative w-full table-auto border-collapse bg-white">
            <thead>
              <tr className="text-left">
                <th className="sticky top-0 border-b border-gray-200 bg-gray-100 md:px-3 md:py-2"></th>
                <th className="sticky top-0 border-b border-gray-200 bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-600 md:px-6 md:py-2">
                  First Name
                </th>
                <th className="sticky top-0 border-b border-gray-200 bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-600 md:px-6 md:py-2">
                  Last Name
                </th>
                <th className="sticky top-0 hidden border-b border-gray-200 bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-600 md:table-cell md:px-6 md:py-2">
                  Company Email
                </th>
                <th className="sticky top-0 hidden border-b border-gray-200 bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-600 md:table-cell md:px-6 md:py-2">
                  Job Title
                </th>
                <th className="sticky top-0 border-b border-gray-200 bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-600 md:px-6 md:py-2">
                  Company
                </th>
                <th className="sticky top-0 border-b border-gray-200 bg-gray-100 md:px-3 md:py-2"></th>
              </tr>
            </thead>
            <tbody>
              {leads.length > 0 ? (
                <>
                  {leads.map((lead) => (
                    <LeadRow
                      key={lead.id}
                      lead={lead}
                      isSelected={lead.id === selectedLeadId}
                    />
                  ))}
                </>
              ) : (
                <tr>
                  <td
                    className="border-t border-dashed border-gray-200"
                    colSpan={7}
                  >
                    <span className="flex items-center px-6 py-3 text-gray-700">
                      No leads have been collected.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

type LeadRowProps = {
  lead: Awaited<ReturnType<typeof getLeads>>[number];
  isSelected?: boolean;
};

function LeadRow({ lead, isSelected = false }: LeadRowProps) {
  return (
    <>
      <tr>
        <td className="border-t border-dashed border-gray-200">
          <div className="flex items-center justify-between md:px-3 md:py-2">
            <LeadScoreIcon score={lead.score} className="h-5 rounded p-0.5" />
          </div>
        </td>
        <td className="border-t border-dashed border-gray-200">
          <span className="flex items-center text-xs text-gray-700 md:px-6 md:py-3">
            {lead.firstName}
          </span>
        </td>
        <td className="border-t border-dashed border-gray-200">
          <span className="flex items-center text-xs text-gray-700 md:px-6 md:py-3">
            {lead.lastName}
          </span>
        </td>
        <td className="hidden border-t border-dashed border-gray-200 md:table-cell">
          <span className="flex items-center text-xs text-gray-700 md:px-6 md:py-3">
            <a href={`mailto:${lead.email}`}>{lead.email}</a>
          </span>
        </td>
        <td className="hidden border-t border-dashed border-gray-200 md:table-cell">
          <span className="flex items-center text-xs text-gray-700 md:px-6 md:py-3">
            {lead.jobRole}
          </span>
        </td>
        <td className="border-t border-dashed border-gray-200">
          <span className="flex items-center text-xs text-gray-700 md:px-6 md:py-3">
            {lead.company}
          </span>
        </td>
        <td className="border-t border-dashed border-gray-200">
          {!isSelected ? (
            <div className="flex items-center justify-between md:px-3 md:py-2">
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
            </div>
          ) : null}
        </td>
      </tr>
      {isSelected ? (
        <tr>
          <td
            className="border-t border-dashed border-gray-200 p-0"
            colSpan={7}
          >
            <Outlet context={{ lead }} />
          </td>
        </tr>
      ) : null}
    </>
  );
}