import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { requireUser } from "~/services/auth.server";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  return json({ user });
};

export default function AdminLayout() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <>
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Welcome {user.fullName}</h1>
        <form method="get" action="/admin/logout">
          <button className="rounded bg-brand-electric-purple px-3 py-2 font-medium text-white duration-300 hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:bg-brand-electric-purple/50 sm:self-start">
            Log out
          </button>
        </form>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
