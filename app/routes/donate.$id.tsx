import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect, Response } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError
} from "@remix-run/react";
import { ValidatedForm, validationError } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { FormInput } from "~/components/form-input";
import { prisma } from "~/services/db.server";

export const loader = async ({ params }: LoaderArgs) => {
  const { id } = params;
  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      collectLeads: true,
      Charities: {
        select: {
          donation: true,
          color: true,
          Charity: { select: { id: true, name: true } }
        }
      }
    }
  });
  if (!event) {
    throw new Response("Not Found", {
      status: 404
    });
  }
  const { Charities, ...rest } = event;
  const charities = Charities.map((item) => ({
    donation: item.donation,
    color: item.color,
    ...item.Charity
  }));
  return json({ event: rest, charities });
};

const validator = withZod(
  z.object({
    eventId: z.string(),
    firstName: z.string({ required_error: "First Name is required" }),
    lastName: z.string({ required_error: "Last Name is required" }),
    email: z.string({ required_error: "Email is required" }).email(),
    company: z.string({ required_error: "Company is required" }),
    jobRole: z.string({ required_error: "Job Title is required" }),
    charityId: z.string({ required_error: "Charity is required" }),
    collectLeads: z.coerce.boolean()
  })
);

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const result = await validator.validate(formData);
  console.log({ result });
  if (result.error) return validationError(result.error);
  const { eventId, charityId, collectLeads, ...lead } = result.data;

  const donation = await prisma.donation.create({
    data: {
      eventId,
      charityId,
      ...(collectLeads && { Lead: { create: lead } })
    },
    select: { id: true }
  });
  return redirect(`/donated/${donation.id}`);
};

export default function EventDonate() {
  const { event, charities } = useLoaderData<typeof loader>();
  return (
    <section className="mx-auto max-w-4xl">
      <h1 className="font-extra-bold mb-0 bg-gradient-to-r from-brand-iridescent-blue to-brand-electric-purple bg-clip-text text-center text-5xl !leading-tight text-transparent sm:text-7xl">
        {event.name}
      </h1>
      <p className="text-center text-white">
        Complete the form and we'll donate to your selected charity.
      </p>
      <div className="rounded border border-brand-gray-b bg-white p-4 sm:px-16">
        <ValidatedForm
          validator={validator}
          method="post"
          className="flex flex-col gap-1 sm:mb-4"
        >
          <input type="hidden" name="eventId" value={event.id} />
          <input
            type="hidden"
            name="collectLeads"
            value={String(event.collectLeads)}
          />
          {event.collectLeads ? (
            <>
              <FormInput name="firstName" label="First Name" type="text" />
              <FormInput name="lastName" label="Last Name" type="text" />
              <FormInput name="email" label="Company Email" type="email" />
              <FormInput name="company" label="Company" type="text" />
              <FormInput name="jobRole" label="Job Title" type="text" />
            </>
          ) : (
            <>
              <input type="hidden" name="firstName" value="nothing" />
              <input type="hidden" name="lastName" value="nothing" />
              <input type="hidden" name="email" value="nothing@nothing.com" />
              <input type="hidden" name="company" value="nothing" />
              <input type="hidden" name="jobRole" value="nothing" />
            </>
          )}
          <fieldset>
            <legend className="mb mb-2 font-bold !text-brand-deep-purple">
              Select a charity
            </legend>
            <div className="mx-2 flex flex-col gap-3">
              {charities.map((charity, index) => (
                <div
                  className="flex justify-items-stretch gap-1"
                  key={charity.id}
                >
                  <input
                    id={`charity${index}`}
                    type="radio"
                    name="charityId"
                    value={charity.id}
                    defaultChecked={index === 0}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor={`charity${index}`}
                    className={`grow cursor-pointer rounded-lg border border-gray-300 bg-white p-5 text-center font-semibold hover:bg-gray-50 focus:outline-none peer-checked:border-transparent peer-checked:ring-2 peer-checked:ring-green-500`}
                  >
                    {charity.name}
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
          <button
            type="submit"
            className="mt-4 min-w-[150px] rounded bg-brand-electric-purple px-6 py-2 text-xl font-medium text-white duration-300 hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:bg-brand-electric-purple/50 sm:self-start"
          >
            Submit
          </button>
        </ValidatedForm>
      </div>
    </section>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
