import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/services/auth.server";
import CockroachLabsLogo from "~/components/cockroach-labs-logo";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  return json({ user });
};

export default function AdminLayout() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <>
      <header className="w-full bg-white p-4 shadow-lg">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <CockroachLabsLogo />
          <h1 className="text-3xl font-bold text-brand-deep-purple">
            Charity Activations
          </h1>
          <div className="flex items-center gap-1">
            <h3>Welcome {user.fullName}</h3>
            <form method="get" action="/admin/logout">
              <button className="rounded bg-brand-electric-purple px-3 py-2 font-medium text-white duration-300 hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:bg-brand-electric-purple/50 sm:self-start">
                Log out
              </button>
            </form>
          </div>
        </nav>
      </header>
      <main className="min-h-screen max-w-full bg-brand-deep-purple px-4 pb-8 pt-8">
        <Outlet />
      </main>
    </>
  );
}
