import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginForm } from '~/components/login-form'
import z from 'zod'
import { getSessionFn } from '~/lib/auth/session.functions'

const loginSearchSchema = z.object({
  redirectTo: z.string().optional()
})

export const Route = createFileRoute('/login')({
  beforeLoad: async ({location}) => {
    const session = await getSessionFn()
    if(session) throw redirect({ to: "/" })
  },
  component: LoginPage,
  validateSearch: loginSearchSchema,
})

function LoginPage() {
  const search = Route.useSearch()
  const redirectTo = search.redirectTo

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  )
}
