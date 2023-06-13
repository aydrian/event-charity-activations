import { type ChangeEvent, useRef, useState } from "react";
import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { json, redirect, type DataFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { z } from "zod";
import slugify from "slugify";
import { prisma } from "~/utils/db.server";
import { requireUserId } from "~/utils/auth.server";
import {
  CheckboxField,
  ErrorList,
  Field,
  SubmitButton,
  TextareaField,
  TemplateEditorField
} from "~/utils/forms";
import {
  type CharityItemWithColor,
  CharitySelector
} from "~/components/charity-selector";
import appConfig from "~/app.config";

const EventWithLeads = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Name is required" }),
  slug: z.string().min(1, { message: "Slug is required" }),
  donationAmount: z.coerce.number().default(3.0),
  startDate: z.coerce.date({ required_error: "Start Date is required" }),
  endDate: z.coerce.date({ required_error: "End Date is required" }),
  location: z.string({ required_error: "Location is required" }),
  twitter: z.string(),
  responseTemplate: z
    .string()
    .min(1, { message: "Response Template is required" }),
  tweetTemplate: z.string({ required_error: "Tweet Template is required" }),
  collectLeads: z.literal("on"),
  legalBlurb: z.string(),
  charities: z
    .array(z.object({ charityId: z.string(), color: z.string() }))
    .max(4, "A max of 4 charities is allowed")
    .min(1, "At least 1 charity is required")
});

const EventWithoutLeads = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Name is required" }),
  slug: z.string().min(1, { message: "Slug is required" }),
  donationAmount: z.coerce.number().default(3.0),
  startDate: z.coerce.date({ required_error: "Start Date is required" }),
  endDate: z.coerce.date({ required_error: "End Date is required" }),
  location: z.string({ required_error: "Location is required" }),
  twitter: z.string(),
  responseTemplate: z
    .string()
    .min(1, { message: "Response Template is required" }),
  tweetTemplate: z.string({ required_error: "Tweet Template is required" }),
  collectLeads: z.undefined(),
  charities: z
    .array(z.object({ charityId: z.string(), color: z.string() }))
    .max(4, "A max of 4 charities is allowed")
    .min(1, "At least 1 charity is required")
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
    schema: EventEditorSchema,
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

  const { id, charities, ...data } = submission.value;

  if (id) {
    const eventUpdate = prisma.event.update({
      where: { id },
      data
    });

    const charitiesDelete = prisma.charitiesForEvents.deleteMany({
      where: { charityId: { notIn: charities.map((c) => c.charityId) } }
    });

    const charityUpserts = charities.map((charity) => {
      return prisma.charitiesForEvents.upsert({
        update: {
          color: charity.color
        },
        create: {
          eventId: id,
          charityId: charity.charityId,
          color: charity.color
        },
        where: {
          eventId_charityId: { eventId: id, charityId: charity.charityId }
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
        createdBy: userId,
        Charities: { create: charities }
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
    id: string;
    name: string;
    slug: string;
    startDate: string;
    endDate: string;
    location: string;
    donationAmount: string;
    twitter: string | null;
    responseTemplate: string;
    tweetTemplate: string;
    collectLeads: boolean;
    legalBlurb: string | null;
    charities: CharityItemWithColor[];
  };
}) {
  const slugRef = useRef<HTMLInputElement>(null);
  const [collectLeads, setCollectLeads] = useState(!!event?.collectLeads);
  const eventEditorFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    id: "event-editor",
    constraint: getFieldsetConstraint(
      collectLeads ? EventWithLeads : EventWithoutLeads
    ) as any,
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
      method="post"
      action="/resources/event-editor"
      {...form.props}
      className="not-prose mb-8 flex flex-col sm:mb-4"
    >
      <input name="id" type="hidden" value={event?.id} />
      <Field
        labelProps={{ htmlFor: fields.name.id, children: "Name" }}
        inputProps={{
          ...conform.input(fields.name),
          defaultValue: event?.name,
          onBlur: handleOnChange
        }}
        errors={fields.name.errors}
      />
      <Field
        labelProps={{ htmlFor: fields.slug.id, children: "Slug" }}
        inputProps={{
          ...conform.input(fields.slug),
          defaultValue: event?.slug,
          ref: slugRef
        }}
        errors={fields.slug.errors}
      />
      <div className="flex w-full flex-row justify-between gap-1">
        <Field
          className="grow"
          labelProps={{ htmlFor: fields.startDate.id, children: "Start Date" }}
          inputProps={{
            ...conform.input(fields.startDate),
            type: "date",
            defaultValue: event?.startDate?.split("T")[0]
          }}
          errors={fields.startDate.errors}
        />
        <Field
          className="grow"
          labelProps={{ htmlFor: fields.endDate.id, children: "End Date" }}
          inputProps={{
            ...conform.input(fields.endDate),
            type: "date",
            defaultValue: event?.endDate?.split("T")[0]
          }}
          errors={fields.endDate.errors}
        />
      </div>
      <Field
        labelProps={{ htmlFor: fields.location.id, children: "Location" }}
        inputProps={{
          ...conform.input(fields.location),
          defaultValue: event?.location
        }}
        errors={fields.location.errors}
      />
      <div className="flex w-full flex-row justify-between gap-1">
        <Field
          className="grow"
          labelProps={{
            htmlFor: fields.donationAmount.id,
            children: "Donation Amount"
          }}
          inputProps={{
            ...conform.input(fields.donationAmount),
            inputMode: "numeric",
            defaultValue: event?.donationAmount || "3"
          }}
          errors={fields.donationAmount.errors}
        />
        <Field
          className="grow"
          labelProps={{
            htmlFor: fields.twitter.id,
            children: "Twitter"
          }}
          inputProps={{
            ...conform.input(fields.twitter),
            defaultValue: event?.twitter ?? undefined
          }}
          errors={fields.twitter.errors}
        />
      </div>
      <TemplateEditorField
        labelProps={{
          htmlFor: fields.responseTemplate.id,
          children: "Response Template"
        }}
        templateEditorProps={{
          variables: [
            {
              displayName: "Event Name",
              value: "{{event.name}}",
              className: "bg-green-500"
            },
            {
              displayName: "Charity Name",
              value: "{{charity.name}}",
              className: "bg-yellow-500"
            },
            {
              displayName: "Charity URL",
              value: "{{charity.url}}",
              className: "bg-yellow-500"
            },
            {
              displayName: "Donation Amount",
              value: "{{donationAmount}}",
              className: "bg-blue-500"
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
          htmlFor: fields.tweetTemplate.id,
          children: "Tweet Template"
        }}
        templateEditorProps={{
          variables: [
            {
              displayName: "Event",
              value: "{{event}}",
              className: "bg-green-500"
            },
            {
              displayName: "Charity",
              value: "{{charity}}",
              className: "bg-yellow-500"
            },
            {
              displayName: "Donation Amount",
              value: "{{donationAmount}}",
              className: "bg-blue-500"
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
        labelProps={{
          htmlFor: fields.collectLeads.id,
          children: "Collect lead data?"
        }}
        checkboxProps={{
          ...conform.input(fields.collectLeads),
          defaultChecked: collectLeads,
          required: false,
          onChange: () => setCollectLeads(!collectLeads)
        }}
        errors={fields.collectLeads.errors}
      />
      {collectLeads ? (
        <TextareaField
          labelProps={{
            htmlFor: fields.legalBlurb.id,
            children: "Legal Blurb"
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
          selectedCharities={event?.charities}
          maxItems={appConfig.charity.maxPerEvent}
        />
        <div className="px-4 pb-3 pt-1">
          {fields.charities.errors?.length ? (
            <ErrorList
              id={`${fields.charities.id}-error`}
              errors={fields.charities.errors}
            />
          ) : null}
        </div>
      </div>
      <ErrorList errors={form.errors} id={form.errorId} />
      <SubmitButton
        type="submit"
        className="mt-4 px-6 py-2 md:min-w-[150px] md:self-start"
        state={eventEditorFetcher.state}
      >
        Submit
      </SubmitButton>
    </eventEditorFetcher.Form>
  );
}
