import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import type { ChangeEvent } from "react";
import { useRef } from "react";
import { redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { ValidatedForm, validationError } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import slugify from "slugify";
import { FormInput } from "~/components/form-input";
import { requireUser } from "~/services/auth.server";
import { prisma } from "~/services/db.server";

export const loader = async ({ request }: LoaderArgs) => {
  return await requireUser(request);
};

const validator = withZod(
  z.object({
    name: z.string({ required_error: "Name is required" }),
    slug: z.string({ required_error: "Slug is required" }),
    startDate: z.coerce.date({ required_error: "Start Date is required" }),
    endDate: z.coerce.date({ required_error: "End Date is required" }),
    location: z.string({ required_error: "Location is required" })
  })
);

export const action = async ({ request }: ActionArgs) => {
  const user = await requireUser(request);
  const formData = await request.formData();
  const result = await validator.validate(formData);
  if (result.error) return validationError(result.error);

  await prisma.event.create({
    data: { ...result.data, createdBy: user.id }
  });
  return redirect("/admin/dashboard");
};

export default function AddEvent() {
  const slugRef = useRef<HTMLInputElement>(null);
  const data = useActionData();
  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nameValue = event.target.value;
    if (slugRef.current?.value.length === 0) {
      slugRef.current.value = slugify(nameValue);
    }
  };

  return (
    <section>
      <h1>Create Event</h1>
      <ValidatedForm validator={validator} method="post">
        <FormInput
          name="name"
          label="Name"
          type="text"
          onBlur={handleOnChange}
        />
        <FormInput name="slug" label="Slug" type="text" ref={slugRef} />
        <FormInput name="startDate" label="Start Date" type="date" />
        <FormInput name="endDate" label="End Date" type="date" />
        <FormInput name="location" label="Location" type="text" />
        {data && (
          <div className="pt-1 text-red-700">
            <div>{data.title}</div>
            <div>{data.description}</div>
          </div>
        )}
        <button
          type="submit"
          className="mt-4 min-w-[150px] rounded bg-brand-electric-purple px-6 py-2 font-medium text-white duration-300 hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:bg-brand-electric-purple/50 sm:self-start"
        >
          Add
        </button>
      </ValidatedForm>
    </section>
  );
}
