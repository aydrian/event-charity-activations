import { Fieldset, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { json, redirect, type DataFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { z } from "zod";
import { prisma } from "~/services/db.server";
import { ErrorList, Field, SubmitButton } from "~/utils/forms";
import { CharityPicker } from "~/components/charity-picker";

export const DonationSchema = z.object({
  eventId: z.string(),
  charityId: z.string(),
  collectLeads: z.coerce.boolean()
});

export const LeadSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Company email is invalid" }),
  company: z.string().min(1, { message: "Company is required" }),
  jobRole: z.string().min(1, { message: "Job title is required" })
});

export const DonationWithLeadSchema = DonationSchema.merge(LeadSchema);

export const DonationFormSchema = z
  .discriminatedUnion("collectLeads", [
    z
      .object({
        collectLeads: z.literal("true")
      })
      .merge(LeadSchema),
    z.object({
      collectLeads: z.literal("")
    })
  ])
  .and(DonationSchema.omit({ collectLeads: true }));

export const action = async ({ request }: DataFunctionArgs) => {
  const formData = await request.formData();
  const submission = parse(formData, {
    schema: DonationFormSchema,
    acceptMultipleErrors: () => true
  });
  console.log(submission);
  if (!submission.value) {
    return json(
      {
        status: "error",
        submission
      } as const,
      { status: 400 }
    );
  }

  const { collectLeads, ...data } = submission.value;

  const donation = await prisma.donation.create({
    data,
    select: { id: true }
  });
  return redirect(`/donated/${donation.id}`);
};

type EventType = {
  id: string;
  name: string;
  donationAmount: string;
  collectLeads: boolean;
  legalBlurb: string | null;
  charities: {
    id: string;
    name: string;
    color: string;
  }[];
};

export function DonationForm({
  event,
  schema = DonationSchema,
  children
}: {
  event: EventType;
  schema?: z.AnyZodObject;
  children?({ fields }: { fields: Fieldset<Record<string, any>> }): JSX.Element;
}) {
  const donationFormFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    id: "donation-form",
    constraint: getFieldsetConstraint(schema),
    lastSubmission: donationFormFetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema });
    },
    shouldRevalidate: "onBlur"
  });

  return (
    <donationFormFetcher.Form
      method="post"
      action="/resources/donate"
      className="not-prose flex flex-col sm:mb-4"
      {...form.props}
    >
      <input type="hidden" name="eventId" value={event.id} />
      <input
        type="hidden"
        name="collectLeads"
        value={event.collectLeads ? "true" : ""}
      />
      {children ? children({ fields }) : null}
      <CharityPicker
        name={fields.charityId.name}
        label="Select a charity"
        charities={event.charities}
        errors={fields.charityId.errors}
      />
      <ErrorList errors={form.errors} id={form.errorId} />
      <SubmitButton
        type="submit"
        className="mt-4 px-6 py-2 md:min-w-[150px] md:self-start"
        state={donationFormFetcher.state}
      >
        Submit
      </SubmitButton>
      {event.collectLeads ? (
        <div className=" text-xs text-gray-700">{event.legalBlurb}</div>
      ) : null}
    </donationFormFetcher.Form>
  );
}

export function DonationWithLeadForm({ event }: { event: EventType }) {
  return (
    <DonationForm event={event} schema={DonationWithLeadSchema}>
      {({ fields }) => (
        <>
          <Field
            labelProps={{
              htmlFor: fields.firstName.id,
              children: "First Name"
            }}
            inputProps={{ ...fields.firstName, autoComplete: "given-name" }}
            errors={fields.firstName.errors}
          />
          <Field
            labelProps={{
              htmlFor: fields.lastName.id,
              children: "Last Name"
            }}
            inputProps={{ ...fields.lastName, autoComplete: "family-name" }}
            errors={fields.lastName.errors}
          />
          <Field
            labelProps={{
              htmlFor: fields.email.id,
              children: "Company Email"
            }}
            inputProps={{ ...fields.email, autoComplete: "email" }}
            errors={fields.email.errors}
          />
          <Field
            labelProps={{
              htmlFor: fields.company.id,
              children: "Company"
            }}
            inputProps={{ ...fields.company, autoComplete: "organization" }}
            errors={fields.company.errors}
          />
          <Field
            labelProps={{
              htmlFor: fields.jobRole.id,
              children: "Job Title"
            }}
            inputProps={{
              ...fields.jobRole,
              autoComplete: "organization-title"
            }}
            errors={fields.jobRole.errors}
          />
        </>
      )}
    </DonationForm>
  );
}
