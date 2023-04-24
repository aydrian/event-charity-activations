import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";

export const loader = async ({ request }: LoaderArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/admin"
  });

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
