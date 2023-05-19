import { json, type LoaderArgs, Response } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUser } from "~/services/auth.server";
import { prisma } from "~/services/db.server";
import { CharityEditor } from "./resources.charity-editor";

export const loader = async ({ params, request }: LoaderArgs) => {
  await requireUser(request);
  const { charityId } = params;
  const charity = await prisma.charity.findUnique({
    where: { id: charityId },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logoSVG: true,
      website: true,
      twitter: true
    }
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
