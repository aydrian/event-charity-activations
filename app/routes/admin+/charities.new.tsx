import type { LoaderArgs } from "@remix-run/node";

import { CharityEditor } from "~/routes/resources+/charity-editor.tsx";
import { requireUserId } from "~/utils/auth.server.ts";

export const loader = async ({ request }: LoaderArgs) => {
  return await requireUserId(request);
};

export default function AddCharity() {
  return (
    <section className="prose mx-auto grid max-w-4xl gap-12">
      <div className="rounded border border-brand-gray-b bg-white p-8 sm:px-16">
        <h2 className="m-0 font-bold text-brand-deep-purple">Create Charity</h2>
        <CharityEditor />
      </div>
    </section>
  );
}
