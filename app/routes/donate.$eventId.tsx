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
import { hexToRgbA } from "~/utils";
import Footer from "~/components/footer";
import { SubmitButton } from "~/components/submit-button";

export const loader = async ({ params }: LoaderArgs) => {
  const { eventId } = params;
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      name: true,
      donationAmount: true,
      collectLeads: true,
      legalBlurb: true,
      Charities: {
        select: {
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
    collectLeads: z.string()
  })
);

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const result = await validator.validate(formData);
  if (result.error) return validationError(result.error);
  const { eventId, charityId, collectLeads, ...lead } = result.data;

  const donation = await prisma.donation.create({
    data: {
      eventId,
      charityId,
      ...(collectLeads === "true" && { Lead: { create: lead } })
    },
    select: { id: true }
  });
  return redirect(`/donated/${donation.id}`);
};

export default function EventDonate() {
  const { event, charities } = useLoaderData<typeof loader>();
  return (
    <>
      <main className="prose min-h-screen max-w-full bg-brand-deep-purple px-4 pb-8 pt-8">
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
                  <input
                    type="hidden"
                    name="email"
                    value="nothing@nothing.com"
                  />
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
                        className={`grow cursor-pointer rounded-lg border border-gray-300 bg-white p-5 text-center text-2xl font-bold hover:bg-gray-50 focus:outline-none peer-checked:ring-4 peer-checked:ring-brand-focus peer-checked:ring-offset-4`}
                        style={{
                          backgroundColor: hexToRgbA(charity.color, 0.5)
                        }}
                      >
                        {charity.name}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
              <SubmitButton className="mt-4 min-w-[150px] px-6 py-2 sm:self-start">
                Submit
              </SubmitButton>
              {event.collectLeads ? (
                <div className=" text-xs text-gray-700">{event.legalBlurb}</div>
              ) : null}
            </ValidatedForm>
          </div>
        </section>
      </main>
      <Footer />
    </>
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
  }
  throw error;
}
