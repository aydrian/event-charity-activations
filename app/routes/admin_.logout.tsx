import type { LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export const loader = async ({ request }: LoaderArgs) => {
  const redirectTo = new URL(request.url).pathname;
  const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
  await authenticator.logout(request, { redirectTo: `/admin?${searchParams}` });
};
