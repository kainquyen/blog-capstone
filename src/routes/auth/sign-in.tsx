import { createFileRoute, redirect } from "@tanstack/react-router";
import { SignIn } from "~/components/auth/sign-in";
import z from "zod";
import { getSessionFn } from "~/lib/auth/session.functions";

const loginSearchSchema = z.object({
  redirectTo: z.string().optional(),
});

export const Route = createFileRoute("/auth/sign-in")({
  beforeLoad: async () => {
    const session = await getSessionFn();
    if (session) throw redirect({ to: "/" });
  },
  component: SignInComponent,
  validateSearch: loginSearchSchema,
});

function SignInComponent() {
  const search = Route.useSearch();
  const redirect = search.redirectTo;
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignIn redirectTo={redirect} />
      </div>
    </div>
  );
}
