import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ params }: LoaderArgs) => {
  const { slug } = params;
  return json({ slug });
};

export default function EventDonate() {
  const { slug } = useLoaderData<typeof loader>();
  return <section>Donation form for event: {slug}</section>;
}
