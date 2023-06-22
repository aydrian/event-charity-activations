import { type DataFunctionArgs, Response, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/utils/auth.server.ts";
import { prisma } from "~/utils/db.server.ts";

import { CharityEditor } from "../resources+/charity-editor.tsx";

export const loader = async ({ params, request }: DataFunctionArgs) => {
  await requireUserId(request);
  const { charityId } = params;
  const charity = await prisma.charity.findUnique({
    select: {
      description: true,
      id: true,
      logoSVG: true,
      name: true,
      slug: true,
      twitter: true,
      website: true
    },
    where: { id: charityId }
  });
  if (!charity) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ charity });
};

export default function EditCharity() {
  const { charity } = useLoaderData<typeof loader>();

  return (
    <section className="prose mx-auto grid max-w-4xl gap-12">
      <div className="rounded border border-brand-gray-b bg-white p-8 sm:px-16">
        <h2 className="m-0 font-bold text-brand-deep-purple">Edit Charity</h2>
        <CharityEditor charity={charity} />
      </div>
    </section>
  );
}
