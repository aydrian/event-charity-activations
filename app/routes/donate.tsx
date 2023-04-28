import { Outlet } from "@remix-run/react";

export default function DonateLayout() {
  return (
    <main className="prose min-h-screen max-w-full bg-brand-deep-purple px-4 pb-8 pt-8">
      <Outlet />
    </main>
  );
}
