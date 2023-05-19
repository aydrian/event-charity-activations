import type { LoaderArgs } from "@remix-run/node";
import { requireUser } from "~/services/auth.server";
import { CharityEditor } from "./resources.charity-editor";

export const loader = async ({ request }: LoaderArgs) => {
  return await requireUser(request);
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
