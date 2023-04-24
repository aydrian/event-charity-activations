import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useSearchParams
} from "@remix-run/react";
import { ValidatedForm, validationError } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { getSession } from "~/services/session.server";
import { authenticator } from "~/services/auth.server";

import { FormInput } from "~/components/form-input";
import CockroachLabsLogo from "~/components/cockroach-labs-logo";
import GitHubLogo from "~/components/github-logo";

export const loader = async ({ request }: LoaderArgs) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/admin/dashboard"
  });
  let session = await getSession(request.headers.get("cookie"));
  let error = session.get(authenticator.sessionErrorKey);
  return json({ error });
};

const validator = withZod(
  z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("Must be a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    redirectTo: z.string().default("/admin/dashboard")
  })
);

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const result = await validator.validate(formData);
  if (result.error) return validationError(result.error);
  const { redirectTo } = result.data;

  return await authenticator.authenticate("user-pass", request, {
    successRedirect: redirectTo || "/admin/dashboard",
    failureRedirect: "/admin",
    context: { formData }
  });
};

export default function AdminIndex() {
  const { error } = useLoaderData<typeof loader>();
  const data = useActionData();
  const [searchParams] = useSearchParams();
  return (
    <>
      <header className="w-full bg-white p-4 shadow-lg">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <a
            href="https://www.cockroachlabs.com/"
            target="_blank"
            rel="noreferrer"
          >
            <CockroachLabsLogo />
          </a>
          <a
            href="https://github.com/aydrian/event-charity-activations/"
            target="_blank"
            rel="noreferrer"
          >
            <GitHubLogo />
          </a>
        </nav>
      </header>
      <main className="prose min-h-screen max-w-full bg-brand-deep-purple px-4 pb-16 pt-16 ">
        <section className="mx-auto grid max-w-4xl gap-12">
          <h1 className="font-extra-bold mb-0 bg-gradient-to-r from-brand-iridescent-blue to-brand-electric-purple bg-clip-text text-center text-5xl !leading-tight text-transparent sm:text-7xl">
            Charity Activations
          </h1>
          <div className="mx-auto max-w-3xl">
            <h2 className="my-0 text-center text-white">
              Manage charity activations for Cockroach Labs sponsored events.
            </h2>
          </div>
          <div className="rounded border border-brand-gray-b bg-white p-8 pt-16 sm:px-16">
            <h3 className="m-0 font-bold text-brand-deep-purple">Login</h3>
            <ValidatedForm
              validator={validator}
              method="post"
              className="mb-8 flex flex-col sm:mb-4"
            >
              <input
                type="hidden"
                name="redirectTo"
                value={searchParams.get("redirectTo") ?? undefined}
              />
              <FormInput name="email" label="Email" type="email" />
              <FormInput name="password" label="Password" type="password" />
              {data && (
                <div className="pt-1 text-red-700">
                  <div>{data.title}</div>
                  <div>{data.description}</div>
                </div>
              )}
              {error && (
                <div className="pt-1 text-sm text-red-700">{error.message}</div>
              )}
              <button
                type="submit"
                className="mt-4 min-w-[150px] rounded bg-brand-electric-purple px-6 py-2 font-medium text-white duration-300 hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:bg-brand-electric-purple/50 sm:self-start"
              >
                Login
              </button>
            </ValidatedForm>
          </div>
        </section>
      </main>
      <footer className="bg-black">
        <ul className="mx-auto flex max-w-7xl items-center justify-between p-4 text-sm font-bold text-white">
          <li>
            <a
              href="https://twitter.com/CockroachDB/"
              target="_blank"
              rel="noreferrer"
            >
              @CockroachDB
            </a>
          </li>
          <li>
            <a
              href="https://www.cockroachlabs.com/privacy/"
              target="_blank"
              rel="noreferrer"
            >
              Privacy Policy
            </a>
          </li>
        </ul>
      </footer>
    </>
  );
}
