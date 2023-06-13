import type { LoaderArgs } from "@remix-run/node";

import { authenticator } from "~/utils/auth.server";
import { redirectToCookie } from "~/utils/cookies.server";

export const loader = async ({ request }: LoaderArgs) => {
  const redirectTo =
    (await redirectToCookie.parse(request.headers.get("Cookie"))) ??
    "/admin/dashboard";

  return authenticator.authenticate("okta", request, {
    failureRedirect: "/admin",
    successRedirect: redirectTo
  });
};
