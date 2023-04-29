import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { LeadScore } from "@prisma/client";
import { json, redirect } from "@remix-run/node";
import { Link, useOutletContext } from "@remix-run/react";
import { ValidatedForm, validationError } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { requireUser } from "~/services/auth.server";
import { prisma } from "~/services/db.server";
import { getLeads } from "~/models/leads.server";
import { ScoreIcon } from "~/components/score-icon";

type ContextType = {
  lead: Awaited<ReturnType<typeof getLeads>>[number];
};

export const loader = async ({ request }: LoaderArgs) => {
  await requireUser(request);
  return json({});
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
    <ValidatedForm
      validator={validator}
      method="post"
      className="flex flex-col gap-1 sm:mb-4"
    >
      <div className="flex flex-col gap-1 md:flex-row md:gap-3">
        <input type="hidden" name="id" value={lead.id} />
        <ScoreSelector
          name="score"
          label="Score Lead"
          defaultSelected={lead.score}
        />
        <div className="flex grow flex-col">
          <label htmlFor="notes">Notes:</label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            defaultValue={lead.notes || ""}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
          ></textarea>
        </div>
      </div>
      <div>
        <button
          type="submit"
          className="mb-2 mr-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Save
        </button>
        <Link
          to="../"
          relative="path"
          preventScrollReset={true}
          className="mb-2 mr-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 no-underline hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
        >
          Cancel
        </Link>
      </div>
    </ValidatedForm>
  );
}

type ScoreSelectorProps = {
  label: string;
  name: string;
  defaultSelected?: LeadScore;
};

function ScoreSelector({
  label,
  name,
  defaultSelected = "BADGE_SCAN"
}: ScoreSelectorProps) {
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <div className="flex justify-stretch gap-4 md:h-full md:w-8 md:shrink md:flex-col md:justify-evenly">
        {Object.entries(LeadScore).map(([key, value], index) => {
          return (
            <div key={`${key}${index}`} className="flex">
              <input
                id={`${key}${index}`}
                type="radio"
                name={name}
                value={value}
                defaultChecked={key === defaultSelected}
                className="peer sr-only"
              />
              <label
                htmlFor={`${key}${index}`}
                className="hover:border-1 cursor-pointer overflow-hidden rounded-lg hover:border-yellow-500 peer-checked:border-transparent peer-checked:ring-4 peer-checked:ring-black md:peer-checked:ring-2"
              >
                <ScoreIcon score={value} className="p-1" />
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
