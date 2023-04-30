import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import type { ChangeEvent } from "react";
import { useRef } from "react";
import { redirect } from "@remix-run/node";
import { Link, useActionData } from "@remix-run/react";
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
    description: z.string({ required_error: "Description is required" })
  })
);

export const action = async ({ request }: ActionArgs) => {
  const user = await requireUser(request);
  const formData = await request.formData();
  const result = await validator.validate(formData);
  if (result.error) return validationError(result.error);
  const { name, description, slug } = result.data;

  await prisma.charity.create({
    data: { name, slug, description, createdBy: user.id }
  });
  return redirect("/admin/dashboard");
};

export default function AddCharity() {
  const slugRef = useRef<HTMLInputElement>(null);
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
        <h2 className="m-0 font-bold text-brand-deep-purple">Create Charity</h2>
        <ValidatedForm
          validator={validator}
          method="post"
          className="mb-8 flex flex-col sm:mb-4"
        >
          <FormInput
            name="name"
            label="Name"
            type="text"
            onBlur={handleOnChange}
          />
          <FormInput name="slug" label="Slug" type="text" ref={slugRef} />
          <FormInput name="description" label="Description" type="text" />
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
      </div>
    </section>
  );
}
