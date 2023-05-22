import { LeadScore } from "@prisma/client";
import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { json, redirect, type DataFunctionArgs } from "@remix-run/node";
import { Link, useFetcher } from "@remix-run/react";
import { z } from "zod";
import { prisma } from "~/services/db.server";
import type { getLeads } from "~/models/leads.server";
import { requireUser } from "~/services/auth.server";
import { LeadScoreSelector } from "~/components/lead-score-selector";
import { ErrorList, SubmitButton, TextareaField } from "~/utils/forms";

type LeadType = Awaited<ReturnType<typeof getLeads>>[number];

const LeadEditorSchema = z.object({
  id: z.string(),
  score: z.nativeEnum(LeadScore),
  notes: z.string().optional()
});

export const action = async ({ request }: DataFunctionArgs) => {
  await requireUser(request);
  const formData = await request.formData();
  const submission = parse(formData, {
    schema: LeadEditorSchema,
    acceptMultipleErrors: () => true
  });
  if (!submission.value) {
    return json(
      {
        status: "error",
        submission
      } as const,
      { status: 400 }
    );
  }
  if (submission.intent !== "submit") {
    return json({ status: "success", submission } as const);
  }

  const { id, notes, score } = submission.value;
  const lead = await prisma.lead.update({
    data: { score, notes },
    where: { id },
    select: { Donation: { select: { eventId: true } } }
  });
  return redirect(`/admin/events/${lead.Donation.eventId}/leads`);
};

export function LeadEditor({ lead }: { lead: LeadType }) {
  const leadEditorFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    id: "lead-editor",
    constraint: getFieldsetConstraint(LeadEditorSchema),
    lastSubmission: leadEditorFetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: LeadEditorSchema });
    },
    shouldRevalidate: "onBlur"
  });

  return (
    <leadEditorFetcher.Form
      method="post"
      action="/resources/lead-editor"
      {...form.props}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-1 md:flex-row md:gap-3">
        <input name="id" type="hidden" value={lead.id} />
        <LeadScoreSelector
          name={fields.score.name}
          label="Score Lead"
          defaultSelected={lead.score}
        />
        <TextareaField
          labelProps={{ htmlFor: fields.notes.id, children: "Notes:" }}
          textareaProps={{
            ...conform.textarea(fields.notes),
            defaultValue: lead.notes ?? undefined
          }}
          errors={fields.notes.errors}
          className="flex grow flex-col"
        />
        <ErrorList errors={form.errors} id={form.errorId} />
      </div>
      <div className="flex justify-end gap-3">
        <SubmitButton className="px-6 py-2 md:min-w-[150px] md:self-start">
          Save
        </SubmitButton>
        <Link
          to="../"
          relative="path"
          preventScrollReset={true}
          className="rounded border border-gray-200 bg-white px-6 py-2 text-xl font-medium text-gray-900 no-underline hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
        >
          Cancel
        </Link>
      </div>
    </leadEditorFetcher.Form>
  );
}
