import { createFileRoute } from '@tanstack/react-router'
import { ResetPasswordForm } from '~/components/ResetPassword';
import { z } from 'zod';

const searchSchema = z.object({
  token: z.string().optional().default(''),
})

export const Route = createFileRoute('/reset-password')({
  validateSearch: searchSchema,
  component: RouteComponent,
})
function RouteComponent() {
  const { token } = Route.useSearch();
  return <ResetPasswordForm token={token} />
}
