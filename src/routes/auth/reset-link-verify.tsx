import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "~/lib/auth/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { CheckCircle2, CircleCheck, LoaderCircle, RotateCw, ShieldAlert } from "lucide-react";
const searchSchema = z.object({
  token: z.string().optional().default(""),
  email: z.string().optional().default(""),
});

export const Route = createFileRoute("/auth/reset-link-verify")({
  validateSearch: searchSchema,
  component: ResetLinkVerifyComponent,
});

function ResetLinkVerifyComponent() {
  const { email, token } = Route.useSearch();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const isCalledRef = useRef(false);
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

  const handleResend = async () => {
    if (secondsLeft > 0 || isResending) return;
    setIsResending(true);
    const { error } = await authClient.sendVerificationEmail({ email: email });
    if (error) {
      toast.error("Lỗi gửi email, vui lòng thử lại!");
      setIsResending(false);
      setJustResent(true);
      setTimeout(() => setJustResent(false), 3000);
      return;
    }
    setSecondsLeft(60);
    setJustResent(true);
    setTimeout(() => setJustResent(false), 3000);
    setIsResending(false);
  };

  useEffect(() => {
    if (isCalledRef.current) return;
    isCalledRef.current = true;

    if (!token) {
      toast.error("Link xác thực không hợp lệ hoặc thiếu token!");
      setIsVerifying(false);
      return;
    }

    async function verifyToken() {
      try {
        const { error } = await authClient.verifyEmail({ query: { token } });
        if (error) {
          setIsSuccess(false);
        } else {
          setIsSuccess(true);
        }
      } catch (error) {
        console.log(error);
        toast.error("Đã có lỗi xảy ra, vui lòng thử lại sau!");
        setIsSuccess(false);
      } finally {
        setIsVerifying(false);
      }
    }
    verifyToken();
  }, [token]);
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">
            {isVerifying ? (
              <>
                <p className="flex justify-center mb-3">
                  <LoaderCircle
                    size={50}
                    className="text-primary animate-spin"
                  />
                </p>
                Đang xác thực email...
              </>
            ) : isSuccess ? (
              <>
                <p className="flex justify-center mb-3">
                  <CircleCheck size={50} className="text-green-600" />
                </p>
                Xác thực thành công!
              </>
            ) : (
              <>
                <p className="flex justify-center mb-3">
                  <ShieldAlert size={50} className="text-destructive" />
                </p>
                Xác thực thất bại
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 items-center">
          {isVerifying ? (
            <p className="text-sm text-muted-foreground">
              Vui lòng đợi trong giây lát...
            </p>
          ) : isSuccess ? (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Email <strong>{email}</strong> đã được xác thực thành công.
              </p>
              <Button
                className="w-full cursor-pointer"
                onClick={() => navigate({ to: "/" })}
              >
                Đi tới trang chủ
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-destructive text-center">
                Đường dẫn đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu gửi lại
                email xác thực tới {email}.
              </p>
              <Button
                variant="outline"
                className="w-full cursor-pointer"
                disabled={secondsLeft > 0 || isResending}
                onClick={handleResend}
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
