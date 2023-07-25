import type { LoaderArgs } from "@remix-run/node";

import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { Response, json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { LogOut } from "lucide-react";

import CompanyLogo from "~/components/company-logo.tsx";
import Footer from "~/components/footer.tsx";
import { Button } from "~/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu.tsx";
import { requireUserId } from "~/utils/auth.server.ts";
import { prisma } from "~/utils/db.server.ts";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  try {
    const user = await prisma.user.findUniqueOrThrow({
      select: {
        email: true,
        firstName: true,
        fullName: true,
        id: true,
        lastName: true
      },
      where: { id: userId }
    });

    return json({ user });
  } catch (err) {
    throw new Response("User not found", { status: 404 });
  }
};

export default function AdminLayout() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <>
      <header className="w-full bg-white p-4 shadow-lg">
        <div className="container mx-auto flex flex-col flex-wrap items-center md:flex-row">
          <div className="md:w-2/6">
            <CompanyLogo />
          </div>
          <div className="flex items-center md:w-2/6 md:items-center md:justify-center">
            <Link
              className="w-auto fill-current font-poppins text-3xl font-bold text-brand-deep-purple"
              to="/admin/dashboard"
            >
              Charity Activations
            </Link>
          </div>
          <nav className="ml-5 inline-flex h-full items-center md:ml-0 md:w-2/6 md:justify-end">
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="relative h-8 w-8 rounded-full bg-brand-deep-purple">
                    <Avatar>
                      <AvatarFallback>{`${user.firstName.charAt(
                        0
                      )}${user.lastName.charAt(0)}`}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <Link to="/admin/logout">Log out</Link>
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
        </div>
      </header>
      <main className="min-h-screen max-w-full bg-brand-deep-purple px-4 pb-8 pt-8">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
