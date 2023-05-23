import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { json, type DataFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { z } from "zod";
import { authenticator } from "~/services/auth.server";
import { redirectToCookie } from "~/utils/cookies.server";
import { ErrorList, Field, SubmitButton } from "~/utils/forms";

const LoginFormSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Must be a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters long")
});

export const action = async ({ request }: DataFunctionArgs) => {
  const formData = await request.formData();
  const submission = parse(formData, {
    schema: LoginFormSchema,
    acceptMultipleErrors: () => true
  });
  if (!submission.value || submission.intent !== "submit") {
    return json(
      {
        status: "error",
        submission
      } as const,
      { status: 400 }
    );
  }
  const redirectTo =
    (await redirectToCookie.parse(request.headers.get("Cookie"))) ??
    "/admin/dashboard";

  try {
    await authenticator.authenticate(FormStrategy.name, request, {
      context: { formData },
      successRedirect: redirectTo,
      throwOnError: true
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return json(
        {
          status: "error",
          submission: {
            ...submission,
            error: {
              "": error.message
            }
          }
        } as const,
        { status: 400 }
      );
    }
    throw error;
  }

  return json({ status: "success", submission } as const);
};

export function FormLoginForm({ formError }: { formError?: string | null }) {
  const loginFetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    id: "form-login-form",
    constraint: getFieldsetConstraint(LoginFormSchema),
    lastSubmission: loginFetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: LoginFormSchema });
    },
    shouldRevalidate: "onBlur"
  });

  return (
    <loginFetcher.Form
      method="post"
      action="/auth/form"
      {...form.props}
      className="mb-8 flex flex-col sm:mb-4"
    >
      <Field
        labelProps={{ htmlFor: fields.email.id, children: "Email" }}
        inputProps={{ ...conform.input(fields.email) }}
        errors={fields.email.errors}
      />
      <Field
        labelProps={{ htmlFor: fields.password.id, children: "Password" }}
        inputProps={{ ...conform.input(fields.password), type: "password" }}
        errors={fields.password.errors}
      />
      <ErrorList errors={formError ? [formError] : []} />
      <ErrorList errors={form.errors} id={form.errorId} />
      <SubmitButton
        type="submit"
        className="mt-4 px-6 py-2 md:min-w-[150px] md:self-start"
        state={loginFetcher.state}
      >
        Login
      </SubmitButton>
    </loginFetcher.Form>
  );
}
