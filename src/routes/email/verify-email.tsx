import { createFileRoute, useParams } from "@tanstack/react-router";
import { VerificationEmailSent } from "~/components/resend-email";
import { authClient } from "~/lib/auth/auth-client";
import {z} from "zod";

const searchSchema = z.object({
  email: z.string().email().optional().default(''),
})

export const Route = createFileRoute("/email/verify-email")({
  validateSearch: searchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { email } = Route.useSearch();
  return (
    <VerificationEmailSent
      email={email}
      onResend={async () => {
        await authClient.sendVerificationEmail({ email: email });
      }}
    />
  );
}
