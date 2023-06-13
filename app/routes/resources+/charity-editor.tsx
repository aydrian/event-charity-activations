import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { type DataFunctionArgs, json, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { type ChangeEvent, useRef } from "react";
import slugify from "slugify";
import { z } from "zod";

import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { ErrorList, Field, SubmitButton } from "~/utils/forms";

import { FileUploader } from "./upload";

export const CharityEditorSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  id: z.string().optional(),
  logoSVG: z.string().optional(),
  name: z.string().min(1, { message: "Name is required" }),
  slug: z.string().min(1, { message: "Slug is required" }),
  twitter: z.string().optional(),
  website: z.string().url().optional()
});

export const action = async ({ request }: DataFunctionArgs) => {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const submission = parse(formData, {
    acceptMultipleErrors: () => true,
    schema: CharityEditorSchema
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
      data,
      where: { id }
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
    description: string;
    id: string;
    logoSVG: null | string;
    name: string;
    slug: string;
    twitter: null | string;
    website: null | string;
  };
}) {
  const slugRef = useRef<HTMLInputElement>(null);
  const charityEditorFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    constraint: getFieldsetConstraint(CharityEditorSchema),
    id: "charity-editor",
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
      action="/resources/charity-editor"
      method="post"
      {...form.props}
      className="not-prose mb-8 flex flex-col sm:mb-4"
    >
      <input name="id" type="hidden" value={charity?.id} />
      <Field
        inputProps={{
          ...conform.input(fields.name),
          defaultValue: charity?.name,
          onBlur: handleOnChange
        }}
        errors={fields.name.errors}
        labelProps={{ children: "Name", htmlFor: fields.name.id }}
      />
      <Field
        inputProps={{
          ...conform.input(fields.slug),
          defaultValue: charity?.slug,
          ref: slugRef
        }}
        errors={fields.slug.errors}
        labelProps={{ children: "Slug", htmlFor: fields.slug.id }}
      />
      <Field
        inputProps={{
          ...conform.input(fields.description),
          defaultValue: charity?.description
        }}
        errors={fields.description.errors}
        labelProps={{ children: "Description", htmlFor: fields.description.id }}
      />
      <div className="flex flex-col gap-1">
        <span className="font-bold !text-brand-deep-purple">Logo</span>
        <FileUploader
          UploadIcon={PhotoIcon}
          className="h-52"
          defaultValue={charity?.logoSVG ?? undefined}
          fileTypes=".svg"
          name={fields.logoSVG.name}
        />
        <span className=" text-xs italic text-gray-700">
          Please use a 1-color svg file.
        </span>
      </div>
      <Field
        inputProps={{
          ...conform.input(fields.website),
          defaultValue: charity?.website ?? undefined
        }}
        errors={fields.website.errors}
        labelProps={{ children: "Website", htmlFor: fields.website.id }}
      />
      <Field
        inputProps={{
          ...conform.input(fields.twitter),
          defaultValue: charity?.twitter ?? undefined
        }}
        errors={fields.twitter.errors}
        labelProps={{ children: "Twitter", htmlFor: fields.twitter.id }}
      />
      <ErrorList errors={form.errors} id={form.errorId} />
      <SubmitButton
        className="mt-4 px-6 py-2 md:min-w-[150px] md:self-start"
        state={charityEditorFetcher.state}
        type="submit"
      >
        Submit
      </SubmitButton>
    </charityEditorFetcher.Form>
  );
}
