import { createFileRoute } from "@tanstack/react-router";
import { SignUp } from "~/components/auth/sign-up";

export const Route = createFileRoute("/auth/sign-up")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUp />
      </div>
    </div>
  );
}
