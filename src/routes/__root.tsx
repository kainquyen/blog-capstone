import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import "~/styles/app.css";
import { authClient } from "~/lib/auth/auth-client";
import { getSessionFn } from "~/lib/auth/session.functions";
import { ThemeProvider } from "~/components/theme-provider";
import { ModeToggle } from "~/components/mode-toggle";
import { TooltipProvider } from "~/components/ui/tooltip";
import NotFoundPage from "~/components/notFoundPage";
import { Toaster } from "~/components/ui/sonner";
import { toast } from "sonner";
import { RouterProgressBar } from "~/components/router-progress-bar";
import { Providers } from "~/components/providers";
import {
  CreditCardIcon,
  LayoutDashboard,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
export const Route = createRootRoute({
  beforeLoad: async () => {
    const session = await getSessionFn();
    return { session };
  },
  notFoundComponent: () => <NotFoundPage />,

  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "Blog Capstone" },
      { name: "description", content: "Ghi chép hành trình học full-stack" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const router = useRouter();
  const { session } = Route.useRouteContext();

  const pathname = useRouterState({
    select: (s) => (s.resolvedLocation ?? s.location).pathname,
  });
  const isDashboard = pathname.startsWith("/dashboard");

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Đăng xuất thành công!");
          router.invalidate();
        },
      },
    });
  }

  return (
    <RootDocument>
      <ThemeProvider defaultTheme="system" storageKey="theme">
        <Providers>
          {!isDashboard && (
            <nav className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border text-[15px] font-semibold">
              <Link
                to="/"
                className="font-bold text-lg tracking-tight text-foreground flex items-center gap-2"
              >
                Blog
              </Link>

              <ul
                aria-label="Điều hướng chính"
                className="flex gap-6 items-center"
              >
                <li>
                  <a
                    href="#notes"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Notes
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>

              <div className="flex items-center gap-4 text-sm">
                <ModeToggle />
                {session ? (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="cursor-pointer"
                        render={
                          <Avatar>
                            <AvatarImage
                              src={session.user.image ?? "https://github.com/shadcn.png"}
                              alt={session.user.name}
                            />
                            <AvatarFallback>
                              {session.user.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                            <AvatarBadge className="bg-green-600 dark:bg-green-500" />
                          </Avatar>
                        }
                      />
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => router.navigate({ to: "/dashboard" })}
                        >
                          <LayoutDashboard />
                          Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => router.navigate({ to: "/dashboard/settings-account" })}
                        >
                          <SettingsIcon />
                          Cài đặt
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={handleSignOut}
                          className="cursor-pointer"
                        >
                          <LogOutIcon />
                          Đăng xuất
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth/sign-in"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/auth/sign-up"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </nav>
          )}
          <Outlet />
        </Providers>
      </ThemeProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <Toaster position="top-center" richColors />
        <RouterProgressBar />
        <TooltipProvider>{children}</TooltipProvider>
        <Scripts />
      </body>
    </html>
  );
}
