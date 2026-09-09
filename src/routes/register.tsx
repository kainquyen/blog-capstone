import { createFileRoute } from "@tanstack/react-router";
import { SignupForm } from "~/components/signup-form";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

/**
 * TODO 17: Y hệt login.tsx nhưng dùng signUp.email({ email, password, name }).
 * Đây là bài tập LẶP LẠI có chủ đích — làm lại từ đầu không xem code cũ
 * giúp kiến thức chuyển từ "nhớ đã đọc" sang "tự viết được".
 */
function RegisterPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  );
}
