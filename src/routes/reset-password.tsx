import { createFileRoute, redirect } from '@tanstack/react-router'
import { ResetPasswordForm } from '~/components/ResetPassword';
import { z } from 'zod';
import { getSessionFn } from '~/lib/auth/session.functions';

const searchSchema = z.object({
  token: z.string().optional().default(''),
})

export const Route = createFileRoute('/reset-password')({
  beforeLoad: async ({ location }) => {
    const session = await getSessionFn()
    if (session) throw redirect({ to: "/" })
  },
  validateSearch: searchSchema,
  component: RouteComponent,
})
function RouteComponent() {
  const { token } = Route.useSearch();
  return <ResetPasswordForm token={token} />
}
