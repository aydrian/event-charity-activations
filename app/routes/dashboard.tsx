import { Outlet } from "@remix-run/react";

export default function DashboardLayout() {
  return (
    <main>
      <Outlet />
    </main>
  );
}
