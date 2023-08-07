import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { type DataFunctionArgs, json, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { type ChangeEvent, useRef, useState } from "react";
import { z } from "zod";

import appConfig from "~/app.config.ts";
import {
  type CharityItemWithColor,
  CharitySelector
} from "~/components/charity-selector.tsx";
import {
  CheckboxField,
  ErrorList,
  Field,
  SelectField,
  SubmitButton,
  TemplateEditorField,
  TextareaField
} from "~/components/forms.tsx";
import { requireUserId } from "~/utils/auth.server.ts";
import { prisma } from "~/utils/db.server.ts";
import slugify from "~/utils/slugify.ts";

const EventWithLeads = z.object({
  charities: z
    .array(z.object({ charityId: z.string(), color: z.string() }))
    .max(4, "A max of 4 charities is allowed")
    .min(1, "At least 1 charity is required"),
  collectLeads: z.literal("on"),
  donationAmount: z.coerce.number().default(3.0),
  donationCurrency: z.string().default("usd"),
  endDate: z.coerce.date({ required_error: "End Date is required" }),
  id: z.string().optional(),
  legalBlurb: z.string(),
  location: z.string({ required_error: "Location is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  responseTemplate: z
    .string()
    .min(1, { message: "Response Template is required" }),
  slug: z.string().min(1, { message: "Slug is required" }),
  startDate: z.coerce.date({ required_error: "Start Date is required" }),
  tweetTemplate: z.string({ required_error: "Tweet Template is required" }),
  twitter: z.string()
});

const EventWithoutLeads = z.object({
  charities: z
    .array(z.object({ charityId: z.string(), color: z.string() }))
    .max(4, "A max of 4 charities is allowed")
    .min(1, "At least 1 charity is required"),
  collectLeads: z.undefined(),
  donationAmount: z.coerce.number().default(3.0),
  donationCurrency: z.string().default("usd"),
  endDate: z.coerce.date({ required_error: "End Date is required" }),
  id: z.string().optional(),
  location: z.string({ required_error: "Location is required" }),
  name: z.string().min(1, { message: "Name is required" }),
  responseTemplate: z
    .string()
    .min(1, { message: "Response Template is required" }),
  slug: z.string().min(1, { message: "Slug is required" }),
  startDate: z.coerce.date({ required_error: "Start Date is required" }),
  tweetTemplate: z.string({ required_error: "Tweet Template is required" }),
  twitter: z.string()
});

export const EventEditorSchema = z
  .discriminatedUnion("collectLeads", [EventWithLeads, EventWithoutLeads])
  .transform(({ collectLeads, ...rest }) => ({
    collectLeads: collectLeads === "on",
    ...rest
  }));

export const action = async ({ request }: DataFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const submission = parse(formData, {
    acceptMultipleErrors: () => true,
    schema: EventEditorSchema
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

  const { charities, id, ...data } = submission.value;

  if (id) {
    const eventUpdate = prisma.event.update({
      data,
      where: { id }
    });

    const charitiesDelete = prisma.charitiesForEvents.deleteMany({
      where: { charityId: { notIn: charities.map((c) => c.charityId) } }
    });

    const charityUpserts = charities.map((charity) => {
      return prisma.charitiesForEvents.upsert({
        create: {
          charityId: charity.charityId,
          color: charity.color,
          eventId: id
        },
        update: {
          color: charity.color
        },
        where: {
          eventId_charityId: { charityId: charity.charityId, eventId: id }
        }
      });
    });

    await prisma.$transaction([
      eventUpdate,
      charitiesDelete,
      ...charityUpserts
    ]);
  } else {
    await prisma.event.create({
      data: {
        ...data,
        Charities: { create: charities },
        createdBy: userId
      }
    });
  }
  return redirect("/admin/dashboard");
};

export function EventEditor({
  allCharities,
  event
}: {
  allCharities: CharityItemWithColor[];
  event?: {
    charities: CharityItemWithColor[];
    collectLeads: boolean;
    donationAmount: string;
    donationCurrency: string;
    endDate: string;
    id: string;
    legalBlurb: null | string;
    location: string;
    name: string;
    responseTemplate: string;
    slug: string;
    startDate: string;
    tweetTemplate: string;
    twitter: null | string;
  };
}) {
  const slugRef = useRef<HTMLInputElement>(null);
  const [collectLeads, setCollectLeads] = useState(!!event?.collectLeads);
  const eventEditorFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    constraint: getFieldsetConstraint(
      collectLeads ? EventWithLeads : EventWithoutLeads
    ) as any,
    id: "event-editor",
    lastSubmission: eventEditorFetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: EventEditorSchema });
    },
    shouldRevalidate: "onBlur"
  });

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nameValue = event.target.value;
    if (slugRef.current?.value.length === 0) {
      slugRef.current.value = slugify(nameValue, { lower: true });
    }
  };

  return (
    <eventEditorFetcher.Form
      action="/resources/event-editor"
      method="post"
      {...form.props}
      className="not-prose mb-8 flex flex-col sm:mb-4"
    >
      <input name="id" type="hidden" value={event?.id} />
      <Field
        inputProps={{
          ...conform.input(fields.name),
          defaultValue: event?.name,
          onBlur: handleOnChange
        }}
        errors={fields.name.errors}
        labelProps={{ children: "Name", htmlFor: fields.name.id }}
      />
      <Field
        inputProps={{
          ...conform.input(fields.slug),
          defaultValue: event?.slug
        }}
        errors={fields.slug.errors}
        labelProps={{ children: "Slug", htmlFor: fields.slug.id }}
        ref={slugRef}
      />
      <div className="flex w-full flex-row justify-between gap-1">
        <Field
          inputProps={{
            ...conform.input(fields.startDate),
            defaultValue: event?.startDate?.split("T")[0],
            type: "date"
          }}
          className="grow"
          errors={fields.startDate.errors}
          labelProps={{ children: "Start Date", htmlFor: fields.startDate.id }}
        />
        <Field
          inputProps={{
            ...conform.input(fields.endDate),
            defaultValue: event?.endDate?.split("T")[0],
            type: "date"
          }}
          className="grow"
          errors={fields.endDate.errors}
          labelProps={{ children: "End Date", htmlFor: fields.endDate.id }}
        />
      </div>
      <Field
        inputProps={{
          ...conform.input(fields.location),
          defaultValue: event?.location
        }}
        errors={fields.location.errors}
        labelProps={{ children: "Location", htmlFor: fields.location.id }}
      />
      <div className="flex w-full flex-row justify-between gap-1">
        <Field
          inputProps={{
            ...conform.input(fields.donationAmount),
            defaultValue: event?.donationAmount || "3",
            inputMode: "numeric"
          }}
          labelProps={{
            children: "Donation Amount",
            htmlFor: fields.donationAmount.id
          }}
          className="grow"
          errors={fields.donationAmount.errors}
        />
        <SelectField
          buttonProps={{
            ...conform.input(fields.donationCurrency, { ariaAttributes: true }),
            defaultValue: event?.donationCurrency ?? "usd"
          }}
          labelProps={{
            children: "Donation Currency",
            htmlFor: fields.donationCurrency.id
          }}
          options={[
            { label: "usd", value: "usd" },
            { label: "eur", value: "eur" }
          ]}
          errors={fields.donationCurrency.errors}
        />
        <Field
          inputProps={{
            ...conform.input(fields.twitter),
            defaultValue: event?.twitter ?? undefined
          }}
          labelProps={{
            children: "Twitter",
            htmlFor: fields.twitter.id
          }}
          className="grow"
          errors={fields.twitter.errors}
        />
      </div>
      <TemplateEditorField
        labelProps={{
          children: "Response Template",
          htmlFor: fields.responseTemplate.id
        }}
        templateEditorProps={{
          variables: [
            {
              className: "bg-green-500",
              displayName: "Event Name",
              value: "{{event.name}}"
            },
            {
              className: "bg-yellow-500",
              displayName: "Charity Name",
              value: "{{charity.name}}"
            },
            {
              className: "bg-yellow-500",
              displayName: "Charity URL",
              value: "{{charity.url}}"
            },
            {
              className: "bg-blue-500",
              displayName: "Donation Amount",
              value: "{{donationAmount}}"
            }
          ],
          ...conform.textarea(fields.responseTemplate),
          defaultValue:
            event?.responseTemplate ||
            "Thank you for helping us donate {{donationAmount}} to {{charity}} at {{event}}."
        }}
        errors={fields.responseTemplate.errors}
      />
      <TemplateEditorField
        labelProps={{
          children: "Tweet Template",
          htmlFor: fields.tweetTemplate.id
        }}
        templateEditorProps={{
          variables: [
            {
              className: "bg-green-500",
              displayName: "Event",
              value: "{{event}}"
            },
            {
              className: "bg-yellow-500",
              displayName: "Charity",
              value: "{{charity}}"
            },
            {
              className: "bg-blue-500",
              displayName: "Donation Amount",
              value: "{{donationAmount}}"
            }
          ],
          ...conform.textarea(fields.tweetTemplate),
          defaultValue:
            event?.tweetTemplate ||
            `I just helped @${appConfig.company.twitter} donate {{donationAmount}} to {{charity}} at {{event}}.`
        }}
        errors={fields.tweetTemplate.errors}
      />
      <CheckboxField
        buttonProps={{
          ...conform.input(fields.collectLeads),
          defaultChecked: collectLeads,
          onCheckedChange: () => setCollectLeads(!collectLeads),
          required: false
        }}
        labelProps={{
          children: "Collect lead data?",
          htmlFor: fields.collectLeads.id
        }}
        errors={fields.collectLeads.errors}
      />
      {collectLeads ? (
        <TextareaField
          labelProps={{
            children: "Legal Blurb",
            htmlFor: fields.legalBlurb.id
          }}
          textareaProps={{
            ...conform.textarea(fields.legalBlurb),
            defaultValue: event?.legalBlurb ?? undefined
          }}
          errors={fields.legalBlurb.errors}
        />
      ) : null}
      <div className="flex flex-col gap-1">
        <h3 className="mb-0 text-xl font-semibold text-brand-deep-purple">
          Which charities will this event support?
        </h3>
        <CharitySelector
          allCharities={allCharities}
          maxItems={appConfig.charity.maxPerEvent}
          selectedCharities={event?.charities}
        />
        <div className="px-4 pb-3 pt-1">
          {fields.charities.errors?.length ? (
            <ErrorList
              errors={fields.charities.errors}
              id={`${fields.charities.id}-error`}
            />
          ) : null}
        </div>
      </div>
      <ErrorList errors={form.errors} id={form.errorId} />
      <SubmitButton
        className="mt-4 px-6 py-2 md:min-w-[150px] md:self-start"
        state={eventEditorFetcher.state}
        type="submit"
      >
        Submit
      </SubmitButton>
    </eventEditorFetcher.Form>
  );
}
