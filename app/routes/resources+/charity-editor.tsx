import { type ChangeEvent, useRef } from "react";
import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { json, redirect, type DataFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { z } from "zod";
import slugify from "slugify";
import { prisma } from "~/utils/db.server";
import { requireUserId } from "~/utils/auth.server";
import { ErrorList, Field, SubmitButton } from "~/utils/forms";
import { FileUploader } from "./upload";
import { PhotoIcon } from "@heroicons/react/24/outline";

export const CharityEditorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Name is required" }),
  slug: z.string().min(1, { message: "Slug is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  website: z.string().url().optional(),
  twitter: z.string().optional(),
  logoSVG: z.string().optional()
});

export const action = async ({ request }: DataFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const submission = parse(formData, {
    schema: CharityEditorSchema,
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

  const { id, ...data } = submission.value;

  if (id) {
    await prisma.charity.update({
      where: { id },
      data
    });
  } else {
    await prisma.charity.create({
      data: {
        ...data,
        createdBy: userId
      }
    });
  }
  return redirect("/admin/dashboard");
};

export function CharityEditor({
  charity
}: {
  charity?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    website: string | null;
    twitter: string | null;
    logoSVG: string | null;
  };
}) {
  const slugRef = useRef<HTMLInputElement>(null);
  const charityEditorFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    id: "charity-editor",
    constraint: getFieldsetConstraint(CharityEditorSchema),
    lastSubmission: charityEditorFetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: CharityEditorSchema });
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
    <charityEditorFetcher.Form
      method="post"
      action="/resources/charity-editor"
      {...form.props}
      className="not-prose mb-8 flex flex-col sm:mb-4"
    >
      <input name="id" type="hidden" value={charity?.id} />
      <Field
        labelProps={{ htmlFor: fields.name.id, children: "Name" }}
        inputProps={{
          ...conform.input(fields.name),
          defaultValue: charity?.name,
          onBlur: handleOnChange
        }}
        errors={fields.name.errors}
      />
      <Field
        labelProps={{ htmlFor: fields.slug.id, children: "Slug" }}
        inputProps={{
          ...conform.input(fields.slug),
          defaultValue: charity?.slug,
          ref: slugRef
        }}
        errors={fields.slug.errors}
      />
      <Field
        labelProps={{ htmlFor: fields.description.id, children: "Description" }}
        inputProps={{
          ...conform.input(fields.description),
          defaultValue: charity?.description
        }}
        errors={fields.description.errors}
      />
      <div className="flex flex-col gap-1">
        <span className="font-bold !text-brand-deep-purple">Logo</span>
        <FileUploader
          name={fields.logoSVG.name}
          fileTypes=".svg"
          UploadIcon={PhotoIcon}
          className="h-52"
          defaultValue={charity?.logoSVG ?? undefined}
        />
        <span className=" text-xs italic text-gray-700">
          Please use a 1-color svg file.
        </span>
      </div>
      <Field
        labelProps={{ htmlFor: fields.website.id, children: "Website" }}
        inputProps={{
          ...conform.input(fields.website),
          defaultValue: charity?.website ?? undefined
        }}
        errors={fields.website.errors}
      />
      <Field
        labelProps={{ htmlFor: fields.twitter.id, children: "Twitter" }}
        inputProps={{
          ...conform.input(fields.twitter),
          defaultValue: charity?.twitter ?? undefined
        }}
        errors={fields.twitter.errors}
      />
      <ErrorList errors={form.errors} id={form.errorId} />
      <SubmitButton
        type="submit"
        className="mt-4 px-6 py-2 md:min-w-[150px] md:self-start"
        state={charityEditorFetcher.state}
      >
        Submit
      </SubmitButton>
    </charityEditorFetcher.Form>
  );
}
