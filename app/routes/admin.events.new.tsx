import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { ValidatedForm, validationError } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import slugify from "slugify";
import { FormInput } from "~/components/form-input";
import { FormTextArea } from "~/components/form-textarea";
import { requireUser } from "~/services/auth.server";
import { prisma } from "~/services/db.server";
import { SubmitButton } from "~/components/submit-button";

import { CharitySelector } from "~/components/charity-selector";

export const loader = async ({ request }: LoaderArgs) => {
  await requireUser(request);
  const charities = await prisma.charity.findMany({
    select: { id: true, name: true }
  });
  return json({ charities });
};

const validator = withZod(
  z.object({
    name: z.string({ required_error: "Name is required" }),
    slug: z.string({ required_error: "Slug is required" }),
    donationAmount: z.coerce.number().default(3.0),
    startDate: z.coerce.date({ required_error: "Start Date is required" }),
    endDate: z.coerce.date({ required_error: "End Date is required" }),
    location: z.string({ required_error: "Location is required" }),
    twitter: z.string().optional(),
    tweetTemplate: z.string({ required_error: "Tweet Template is required" }),
    collectLeads: z.coerce.boolean(),
    legalBlurb: z.string().optional(),
    charities: z
      .array(z.object({ charityId: z.string(), color: z.string() }))
      .max(4, "A max of 4 charities is allowed")
      .min(1, "At least 1 charity is required")
  })
);

export const action = async ({ request }: ActionArgs) => {
  const user = await requireUser(request);
  const formData = await request.formData();
  const result = await validator.validate(formData);
  if (result.error) return validationError(result.error);
  const { charities, ...rest } = result.data;

  await prisma.event.create({
    data: {
      ...rest,
      createdBy: user.id,
      Charities: { create: charities }
    }
  });
  return redirect("/admin/dashboard");
};

export default function AddEvent() {
  const slugRef = useRef<HTMLInputElement>(null);
  const [collectLeads, setCollectLeads] = useState(false);
  const { charities } = useLoaderData<typeof loader>();
  const data = useActionData();
  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nameValue = event.target.value;
    if (slugRef.current?.value.length === 0) {
      slugRef.current.value = slugify(nameValue, { lower: true });
    }
  };

  return (
    <section className="prose mx-auto grid max-w-4xl gap-12">
      <div className="rounded border border-brand-gray-b bg-white p-8 sm:px-16">
        <h2 className="m-0 font-bold text-brand-deep-purple">Create Event</h2>
        <ValidatedForm
          validator={validator}
          method="post"
          className="mb-8 flex flex-col sm:mb-4"
          defaultValues={{
            donationAmount: 3.0,
            tweetTemplate:
              "I just helped @CockroachDB donate {{donationAmount}} to {{charity}} at {{event}}."
          }}
        >
          <FormInput
            name="name"
            label="Name"
            type="text"
            onBlur={handleOnChange}
          />
          <FormInput name="slug" label="Slug" type="text" ref={slugRef} />
          <div className="flex w-full flex-row justify-between gap-1">
            <FormInput
              name="startDate"
              label="Start Date"
              type="date"
              className="grow"
            />
            <FormInput
              name="endDate"
              label="End Date"
              type="date"
              className="grow"
            />
          </div>
          <FormInput name="location" label="Location" type="text" />
          <div className="flex w-full flex-row justify-between gap-1">
            <FormInput
              name="donationAmount"
              label="Donation Amount"
              inputMode="numeric"
              pattern="\d*"
              className="grow"
            />
            <FormInput name="twitter" label="Twitter" className="grow" />
          </div>
          <FormTextArea name="tweetTemplate" label="Tweet Template" />
          <div className="flex flex-row gap-1">
            <label className="font-bold !text-brand-deep-purple">
              Collect lead data?
            </label>
            <input
              type="checkbox"
              name="collectLeads"
              checked={collectLeads}
              onChange={() => setCollectLeads(!collectLeads)}
            />
          </div>
          {collectLeads ? (
            <FormTextArea name="legalBlurb" label="Legal Blurb" />
          ) : null}
          <h3>Which charities will this event support?</h3>
          <CharitySelector charities={charities} />
          {data && (
            <div className="pt-1 text-red-700">
              <div>{data.title}</div>
              <div>{data.description}</div>
            </div>
          )}
          <SubmitButton className="mt-4 min-w-[150px] px-6 py-2 sm:self-start">
            Add
          </SubmitButton>
        </ValidatedForm>
      </div>
    </section>
  );
}
