import { useEffect, useState } from "react";
import { authClient } from "~/lib/auth/auth-client";
import { CheckCircle2, Eye, EyeOff, KeyRound, AlertCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Link } from "@tanstack/react-router";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const minLength = 8;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const lengthOk = password.length >= minLength;
  const matchOk = password.length > 0 && password === confirmPassword;
  const canSubmit = lengthOk && matchOk && !isSubmitting;

  useEffect(() => {
    console.log(token === '' ? 'empty' : 'not empty')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lengthOk) {
      setError(`Mật khẩu phải có ít nhất ${minLength} ký tự`);
      return;
    }
    if (!matchOk) {
      setError("Hai mật khẩu không khớp nhau");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await authClient.resetPassword({
        newPassword: password,
        token: token,
      });
      setIsSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể đặt lại mật khẩu, vui lòng thử lại",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (token === '') {
    return (
      <Card className="w-full max-w-sm absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <CardHeader className="flex flex-col items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Mã đặt lại mật khẩu đã hết hạn</CardTitle>
          <CardDescription>
            Vui lòng thực hiện lại thao tác quên mật khẩu để được gửi lại mã mới.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full cursor-pointer bg-foreground hover:bg-foreground/80">
            <Link to="/forgot-password">Quên mật khẩu</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-sm absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <CardHeader className=" flex flex-col items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Đặt lại mật khẩu thành công</CardTitle>
          <CardDescription>
            Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full cursor-pointer bg-foreground hover:bg-foreground/80">
            <Link to="/login">Về trang đăng nhập</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <CardHeader className="flex flex-col items-center text-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Đặt mật khẩu mới</CardTitle>
        <CardDescription>
          Chọn một mật khẩu khác với mật khẩu cũ của bạn.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-password">Mật khẩu mới</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={`Tối thiểu ${minLength} ký tự`}
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 pb-5">
            <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full cursor-pointer bg-foreground hover:bg-foreground/80" disabled={!canSubmit}>
            {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
