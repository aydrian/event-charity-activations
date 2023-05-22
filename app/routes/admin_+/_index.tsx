import type { LoaderArgs } from "@remix-run/node";
// import { json } from "@remix-run/node";
// import {
//   useLoaderData,
//   useSearchParams
// } from "@remix-run/react";
// import { commitSession, getSession } from "~/services/session.server";
import { authenticator } from "~/services/auth.server";

import CockroachLabsLogo from "~/components/cockroach-labs-logo";
import GitHubLogo from "~/components/github-logo";
import { OktaLoginForm } from "~/routes/auth+/okta";
// import { FormLoginForm } from "./resources.login";

export const loader = async ({ request }: LoaderArgs) => {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/admin/dashboard"
  });
  // const session = await getSession(request.headers.get("cookie"));
  // const error = session.get(authenticator.sessionErrorKey);
  // let errorMessage: string | null = null;
  // if (typeof error?.message === "string") {
  //   errorMessage = error.message;
  // }
  // return json(
  //   { formError: errorMessage },
  //   {
  //     headers: {
  //       "Set-Cookie": await commitSession(session)
  //     }
  //   }
  // );
};

export default function AdminIndex() {
  // const data = useLoaderData<typeof loader>();
  // const [searchParams] = useSearchParams();
  // const redirectTo = searchParams.get("redirectTo") ?? undefined;
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
          <div className="rounded border border-brand-gray-b bg-white p-8 sm:px-16">
            <h3 className="m-0 font-bold text-brand-deep-purple">Login</h3>
            {/* <FormLoginForm redirectTo={redirectTo} formError={data.formError} /> */}
            <OktaLoginForm />
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
