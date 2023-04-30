import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { LeadScore } from "@prisma/client";
import { redirect } from "@remix-run/node";
import { Link, useOutletContext } from "@remix-run/react";
import { ValidatedForm, validationError } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { requireUser } from "~/services/auth.server";
import { prisma } from "~/services/db.server";
import { getLeads } from "~/models/leads.server";
import { LeadScoreSelector } from "~/components/lead-score-selector";
import { FormTextArea } from "~/components/form-textarea";

type ContextType = {
  lead: Awaited<ReturnType<typeof getLeads>>[number];
};

export const loader = async ({ request }: LoaderArgs) => {
  return await requireUser(request);
};

const validator = withZod(
  z.object({
    id: z.string(),
    score: z.string(),
    notes: z.string().optional()
  })
);

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const result = await validator.validate(formData);
  if (result.error) return validationError(result.error);
  const { id, score: strScore, notes } = result.data;
  const score = strScore as LeadScore;

  await prisma.lead.update({
    data: { score, notes },
    where: { id }
  });
  return redirect("../");
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
        <ValidatedForm
          validator={validator}
          method="post"
          className="flex flex-col gap-3"
          defaultValues={{
            notes: lead.notes || "",
            score: lead.score,
            id: lead.id
          }}
        >
          <div className="flex flex-col gap-1 md:flex-row md:gap-3">
            <input type="hidden" name="id" value={lead.id} />
            <LeadScoreSelector
              name="score"
              label="Score Lead"
              defaultSelected={lead.score}
            />
            <FormTextArea
              name="notes"
              label="Notes:"
              rows={4}
              className="flex grow flex-col"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="submit"
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Save
            </button>
            <Link
              to="../"
              relative="path"
              preventScrollReset={true}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 no-underline hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
            >
              Cancel
            </Link>
          </div>
        </ValidatedForm>
      </div>
    </>
  );
}
