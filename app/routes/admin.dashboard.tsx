import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/services/auth.server";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request);
  return json({ user });
};

export default function AdminDashboard() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <section>
      <h1>Admin Dashboard</h1>
    </section>
  );
}
