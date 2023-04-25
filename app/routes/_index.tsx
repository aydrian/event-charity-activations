import { redirect } from "@remix-run/node";

export const loader = async () => {
  return redirect("/admin");
};

export default function Index() {
  return <div>Nothing to see here</div>;
}
