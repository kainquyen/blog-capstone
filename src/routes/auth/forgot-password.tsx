import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  RotateCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth/auth-client";
import { getSessionFn } from "~/lib/auth/session.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/forgot-password")({
  beforeLoad: async ({ location }) => {
    const session = await getSessionFn();
    if (session) throw redirect({ to: "/" });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [justResent, setJustResent] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsResending(true);

    if (!email || email.trim() === "") {
      setError("Bạn phải nhập email để gửi link đặt lại mật khẩu");
      setIsResending(false);
      return;
    }

    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/auth/reset-password",
    });
    setJustResent(true);
    setError("");
    if (error) {
      toast.error("Đã có lỗi xảy ra, vui lòng thử lại sau!");
    } else {
      toast.success("Đã gửi link đặt lại mật khẩu vào email của bạn!");
    }

    setSecondsLeft(60);
    setIsResending(false);
    setTimeout(() => setJustResent(false), 3000);
  }
  return (
    <Card className="w-[500px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-xl font-bold">Quên mật khẩu?</CardTitle>
        <CardDescription>
          Nhập địa chỉ email của bạn, chúng tôi sẽ gửi liên kết để đặt lại mật
          khẩu.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col ">
          <div className="flex flex-col gap-2 text-left mb-3">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={isResending}
              />
            </div>
          </div>
          {error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 mb-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="w-full cursor-pointer"
            disabled={secondsLeft > 0 || isResending}
            onClick={handleSubmit}
          >
            {isResending ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" />
                Đang gửi lại...
              </>
            ) : justResent ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Đã gửi lại email
              </>
            ) : secondsLeft > 0 ? (
              `Gửi lại sau ${secondsLeft}s`
            ) : (
              "Gửi lại email xác thực"
            )}
          </Button>
          <Button variant="ghost">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Quay lại đăng nhập
            </Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
