import type { LoaderArgs } from "@remix-run/node";

import { authenticator } from "~/utils/auth.server.ts";
import { redirectToCookie } from "~/utils/cookies.server.ts";

export const loader = async ({ request }: LoaderArgs) => {
  const redirectTo =
    (await redirectToCookie.parse(request.headers.get("Cookie"))) ??
    "/admin/dashboard";

  return authenticator.authenticate("okta", request, {
    failureRedirect: "/admin",
    successRedirect: redirectTo
  });
};
