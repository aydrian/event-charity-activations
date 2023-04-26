import { Outlet } from "@remix-run/react";

export default function DashboardLayout() {
  return (
    <main className="min-h-screen max-w-full bg-brand-deep-purple px-4 pb-8 pt-8">
      <Outlet />
    </main>
  );
}
