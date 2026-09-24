import { createFileRoute, useParams } from "@tanstack/react-router";
import { VerificationEmailSent } from "~/components/resend-email";
import { authClient } from "~/lib/auth/auth-client";
import {z} from "zod";

const searchSchema = z.object({
  email: z.string().email().optional().default(''),
})

export const Route = createFileRoute("/auth/verify-email")({
  validateSearch: searchSchema,
  component: VerifyEmailComponent,
});

function VerifyEmailComponent() {
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
