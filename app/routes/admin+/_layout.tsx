import type { LoaderArgs } from "@remix-run/node";

import { Response, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

import CompanyLogo from "~/components/company-logo";
import Footer from "~/components/footer";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  try {
    const user = await prisma.user.findUniqueOrThrow({
      select: { firstName: true, id: true },
      where: { id: userId }
    });

    return json({ user });
  } catch (err) {
    throw new Response("User not found", { status: 404 });
  }
};

export default function AdminLayout() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <>
      <header className="w-full bg-white p-4 shadow-lg">
        <div className="container mx-auto flex flex-col flex-wrap items-center md:flex-row">
          <div className="md:w-2/6">
            <CompanyLogo />
          </div>
          <div className="flex items-center md:w-2/6 md:items-center md:justify-center">
            <Link
              className="w-auto fill-current text-3xl font-bold text-brand-deep-purple"
              to="/admin/dashboard"
            >
              Charity Activations
            </Link>
          </div>
          <nav className="ml-5 inline-flex h-full items-center md:ml-0 md:w-2/6 md:justify-end">
            <div className="flex items-center gap-1">
              <span className="hidden text-sm md:inline-block">
                Welcome, {user.firstName}
              </span>
              <form action="/admin/logout" method="get">
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
