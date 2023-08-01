import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { type DataFunctionArgs, json, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { CharityPicker } from "~/components/charity-picker.tsx";
import { prisma } from "~/utils/db.server.ts";
import { ErrorList, Field, SubmitButton } from "~/utils/forms.tsx";

const DonationWithLeads = z.object({
  charityId: z.string(),
  collectLeads: z.literal("true"),
  company: z.string().min(1, { message: "Company is required" }),
  email: z.string().email({ message: "Company email is invalid" }),
  eventId: z.string(),
  firstName: z.string().min(1, { message: "First name is required" }),
  jobRole: z.string().min(1, { message: "Job title is required" }),
  lastName: z.string().min(1, { message: "Last name is required" })
});

const DonationWithoutLeads = z.object({
  charityId: z.string(),
  collectLeads: z.literal("false"),
  eventId: z.string()
});

const DonationFormSchema = z.discriminatedUnion("collectLeads", [
  DonationWithLeads,
  DonationWithoutLeads
]);

export const action = async ({ request }: DataFunctionArgs) => {
  const formData = await request.formData();
  const submission = parse(formData, {
    acceptMultipleErrors: () => true,
    schema: DonationFormSchema
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

  const { collectLeads, ...data } = submission.value;

  const donation = await prisma.donation.create({
    data,
    select: { id: true }
  });
  return redirect(`/donated/${donation.id}`);
};

export function DonationForm({
  event
}: {
  event: {
    charities: {
      color: string;
      id: string;
      name: string;
    }[];
    collectLeads: boolean;
    donationAmount: string;
    id: string;
    legalBlurb: null | string;
    name: string;
  };
}) {
  const { t } = useTranslation();
  const donationFormFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    constraint: getFieldsetConstraint(
      event.collectLeads ? DonationWithLeads : DonationWithoutLeads
    ) as any,
    id: "donation-form",
    lastSubmission: donationFormFetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: DonationFormSchema });
    },
    shouldRevalidate: "onBlur"
  });

  return (
    <donationFormFetcher.Form
      action="/resources/donate"
      className="not-prose flex flex-col sm:mb-4"
      method="post"
      {...form.props}
    >
      <input name="eventId" type="hidden" value={event.id} />
      <input
        name="collectLeads"
        type="hidden"
        value={String(event.collectLeads)}
      />
      {event.collectLeads ? (
        <>
          <Field
            inputProps={{
              ...conform.input(fields.firstName),
              autoComplete: "given-name"
            }}
            labelProps={{
              children: t("given-name"),
              htmlFor: fields.firstName.id
            }}
            errors={fields.firstName.errors}
          />
          <Field
            inputProps={{
              ...conform.input(fields.lastName),
              autoComplete: "family-name"
            }}
            labelProps={{
              children: t("family-name"),
              htmlFor: fields.lastName.id
            }}
            errors={fields.lastName.errors}
          />
          <Field
            inputProps={{
              ...conform.input(fields.email),
              autoComplete: "email"
            }}
            labelProps={{
              children: t("email"),
              htmlFor: fields.email.id
            }}
            errors={fields.email.errors}
          />
          <Field
            inputProps={{
              ...conform.input(fields.company),
              autoComplete: "organization"
            }}
            labelProps={{
              children: t("organization"),
              htmlFor: fields.company.id
            }}
            errors={fields.company.errors}
          />
          <Field
            inputProps={{
              ...conform.input(fields.jobRole),
              autoComplete: "organization-title"
            }}
            labelProps={{
              children: t("organization-title"),
              htmlFor: fields.jobRole.id
            }}
            errors={fields.jobRole.errors}
          />
        </>
      ) : null}
      <CharityPicker
        charities={event.charities}
        errors={fields.charityId.errors}
        label={t("select-charity")}
        name={fields.charityId.name}
      />
      <ErrorList errors={form.errors} id={form.errorId} />
      <SubmitButton
        className="mt-4 px-6 py-2 md:min-w-[150px] md:self-start"
        state={donationFormFetcher.state}
        type="submit"
      >
        {t("submit")}
      </SubmitButton>
      {event.collectLeads ? (
        <div className=" text-xs text-gray-700">{event.legalBlurb}</div>
      ) : null}
    </donationFormFetcher.Form>
  );
}
