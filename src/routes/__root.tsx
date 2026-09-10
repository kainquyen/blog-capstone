import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouter,
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
export const Route = createRootRoute({
  /**
   * TODO 11: Ôn lại — gọi getSessionFn(), return { session } để mọi route
   * con lấy được qua Route.useRouteContext() (đúng "Server-Driven State"
   * đã học, tránh nhấp nháy nav login/logout).
   */
  beforeLoad: async () => {
    const session = await getSessionFn();
    return { session };
  },
  notFoundComponent: () => <NotFoundPage />,

  /**
   * TODO 12: SEO mặc định cho toàn site — đây là kiến thức MỚI so với
   * capstone trước (trang docs "SEO" bạn vừa đọc). Thêm các thẻ meta cơ
   * bản: description, og:title, og:description, og:type. Route con (bài
   * viết cụ thể) sẽ OVERRIDE lại các field này bằng head() riêng của nó
   * (xem post.$slug.tsx) — nhớ lại cách route lá "kế thừa và ghi đè" head
   * từ route cha, giống hệt cách CSS import kế thừa theo vị trí route đã
   * học ở trang CSS Styling.
   */
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "Blog Capstone" },
      // TODO 12: thêm các meta còn lại
      { name: "description", content: "Ghi chép hành trình học full-stack" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const router = useRouter();
  const { session } = Route.useRouteContext();

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
        <nav className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border text-[15px] font-semibold">
          <Link
            to="/"
            className="font-bold text-lg tracking-tight text-foreground flex items-center gap-2"
          >
            Blog
          </Link>

          <ul aria-label="Điều hướng chính" className="flex gap-6 items-center">
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
          </ul>

          <div className="flex items-center gap-4 text-sm">
            <ModeToggle />
            {session ? (
              <>
                <Link
                  to="/admin/posts"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Quản lý bài viết
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground transition-colors underline cursor-pointer"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </nav>
        <Outlet />
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
        <TooltipProvider>{children}</TooltipProvider>
        <Scripts />
      </body>
    </html>
  );
}
