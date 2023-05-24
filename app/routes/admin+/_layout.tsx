import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/utils/auth.server";
import CockroachLabsLogo from "~/components/cockroach-labs-logo";
import Footer from "~/components/footer";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  return json({ user });
};

export default function AdminLayout() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <>
      <header className="w-full bg-white p-4 shadow-lg">
        <div className="container mx-auto flex flex-col flex-wrap items-center md:flex-row">
          <div className="md:w-2/6">
            <CockroachLabsLogo />
          </div>
          <div className="flex items-center md:w-2/6 md:items-center md:justify-center">
            <Link
              to="/admin/dashboard"
              className="w-auto fill-current text-3xl font-bold text-brand-deep-purple"
            >
              Charity Activations
            </Link>
          </div>
          <nav className="ml-5 inline-flex h-full items-center md:ml-0 md:w-2/6 md:justify-end">
            <div className="flex items-center gap-1">
              <span className="hidden text-sm md:inline-block">
                Welcome, {user.firstName}
              </span>
              <form method="get" action="/admin/logout">
                <button className="rounded bg-brand-electric-purple px-2 py-1 text-sm font-medium text-white duration-300 hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:bg-brand-electric-purple/50 sm:self-start">
                  Log out
                </button>
              </form>
            </div>
          </nav>
        </div>
      </header>
      <main className="min-h-screen max-w-full bg-brand-deep-purple px-4 pb-8 pt-8">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
