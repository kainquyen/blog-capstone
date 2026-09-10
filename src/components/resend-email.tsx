import { useEffect, useState } from "react";
import { Mail, RotateCw, CheckCircle2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface VerificationEmailSentProps {
  /** Email đã nhận link xác thực, hiển thị để người dùng đối chiếu */
  email: string;
  /**
   * Gọi lại API resend verification email.
   * Nên trả về Promise để component tự xử lý trạng thái loading.
   */
  onResend: () => Promise<void>;
  /** Số giây chờ giữa 2 lần gửi lại (mặc định 60s, khớp rateLimit BetterAuth) */
  cooldownSeconds?: number;
}

export function VerificationEmailSent({
  email,
  onResend,
  cooldownSeconds = 60,
}: VerificationEmailSentProps) {
  const [secondsLeft, setSecondsLeft] = useState(cooldownSeconds);
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
    try {
      await onResend();
      setJustResent(true);
      setSecondsLeft(cooldownSeconds);
      setTimeout(() => setJustResent(false), 3000);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-[500px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <CardHeader className="flex flex-col items-center text-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle>Kiểm tra hộp thư của bạn</CardTitle>
        <CardDescription>
          Chúng tôi đã gửi liên kết xác thực đến
        </CardDescription>
        <p className="text-sm font-medium text-foreground">{email}</p>
      </CardHeader>

      <CardContent className="text-center text-sm text-muted-foreground">
        Nhấp vào liên kết trong email để hoàn tất xác thực tài khoản. Nếu
        không thấy email, hãy kiểm tra thêm mục Spam hoặc Quảng cáo.
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button
          variant="outline"
          className="w-full"
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
      </CardFooter>
    </Card>
  );
}