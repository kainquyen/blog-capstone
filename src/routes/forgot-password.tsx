import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, KeyRound, RotateCw } from "lucide-react";
import { useState } from "react";
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
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  component: RouteComponent,
});

function RouteComponent() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
      toast.success('Đã gửi link đặt lại mật khẩu vào email của bạn!');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
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
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-left pb-5">
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
                disabled={isSubmitting}
              />
            </div>
          </div>
          {error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full cursor-pointer bg-foreground hover:bg-foreground/80"
            disabled={isSubmitting || !email.trim()}
          >
            {isSubmitting ? (
              <>
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi liên kết...
              </>
            ) : (
              "Gửi liên kết đặt lại mật khẩu"
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
