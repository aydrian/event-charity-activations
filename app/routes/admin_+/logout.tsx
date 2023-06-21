import type { LoaderArgs } from "@remix-run/node";

import { authenticator } from "~/utils/auth.server.ts";

export const loader = async ({ request }: LoaderArgs) => {
  await authenticator.logout(request, { redirectTo: `/admin` });
};
