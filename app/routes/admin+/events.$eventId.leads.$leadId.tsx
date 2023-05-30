import type { LoaderArgs } from "@remix-run/node";
import { useOutletContext } from "@remix-run/react";
import { requireUser } from "~/utils/auth.server";
import type { getLeads } from "~/models/leads.server";
import { LeadEditor } from "~/routes/resources+/lead-editor";

type ContextType = {
  lead: Awaited<ReturnType<typeof getLeads>>[number];
};

// TODO: Is this needed?
export const loader = async ({ request }: LoaderArgs) => {
  return await requireUser(request);
};

export default function EditLead() {
  const { lead } = useOutletContext<ContextType>();
  return (
    <>
      <table className="whitespace-no-wrap table-striped relative w-full table-auto border-collapse bg-white md:hidden">
        <tbody>
          <tr>
            <th className="border-b border-gray-200 bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-600">
              Company Email
            </th>
            <td className="border-b border-dashed border-gray-200">
              <span className="flex items-center text-xs text-gray-700">
                <a href={`mailto:${lead.email}`}>{lead.email}</a>
              </span>
            </td>
          </tr>
          <tr>
            <th className="border-b border-gray-200 bg-gray-100 text-xs font-bold uppercase tracking-wider text-gray-600">
              Job Title
            </th>
            <td className="border-b border-dashed border-gray-200">
              <span className="flex items-center text-xs text-gray-700">
                {lead.jobRole}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="p-2">
        <LeadEditor lead={lead} />
      </div>
    </>
  );
}
