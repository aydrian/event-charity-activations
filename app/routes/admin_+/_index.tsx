import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { commitSession, getSession } from "~/utils/session.server";
import { authenticator } from "~/utils/auth.server";

import CompanyLogo from "~/components/company-logo";
import GitHubLogo from "~/components/github-logo";
import { OktaLoginForm } from "~/routes/auth+/okta+/_index";
import { redirectToCookie } from "~/utils/cookies.server";
import appConfig from "~/app.config";
// import { FormLoginForm } from "~/routes/auth+/form";

export const loader = async ({ request }: LoaderArgs) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/admin/dashboard"
  });
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirectTo");
  const loginMessage = url.searchParams.get("loginMessage");

  let headers = new Headers();
  if (redirectTo) {
    headers.append("Set-Cookie", await redirectToCookie.serialize(redirectTo));
  }
  const session = await getSession(request.headers.get("cookie"));
  const error = session.get(authenticator.sessionErrorKey);
  let errorMessage: string | null = null;
  if (typeof error?.message === "string") {
    errorMessage = error.message;
  }
  // TODO: Is this necessary?
  headers.append("Set-Cookie", await commitSession(session));

  return json({ loginMessage, formError: errorMessage }, { headers });
};

export default function AdminIndex() {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <header className="w-full bg-white p-4 shadow-lg">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <a href={appConfig.company.website} target="_blank" rel="noreferrer">
            <CompanyLogo />
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
              Manage charity activations for {appConfig.company.name} sponsored
              events.
            </h2>
          </div>
          <div className="rounded border border-brand-gray-b bg-white p-8 sm:px-16">
            <h3 className="m-0 font-bold text-brand-deep-purple">Login</h3>
            {data.loginMessage ? (
              <div className="text-sm text-red-500">{data.loginMessage}</div>
            ) : null}
            {/* <FormLoginForm formError={data.formError} /> */}
            <OktaLoginForm />
          </div>
        </section>
      </main>
      <footer className="bg-black">
        <ul className="mx-auto flex max-w-7xl items-center justify-between p-4 text-sm font-bold text-white">
          <li>
            <a
              href={`https://twitter.com/${appConfig.company.twitter}/`}
              target="_blank"
              rel="noreferrer"
            >
              @{appConfig.company.twitter}
            </a>
          </li>
          <li>
            <a
              href={appConfig.company.privacyPolicyUrl}
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
