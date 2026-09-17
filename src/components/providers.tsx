import { Link, useNavigate } from "@tanstack/react-router"
import type { ReactNode } from "react"
import { authClient } from "~/lib/auth/auth-client"
import { AuthProvider } from "./auth/auth-provider"

export function Providers({ children }: { children: ReactNode }) {
  const navigate = useNavigate()

  return (
    <AuthProvider
      authClient={authClient}
      navigate={({ to, replace }) => navigate({ to, replace })}
      Link={({ href, ...props }) => <Link to={href} {...props} />}
    >
      {children}
    </AuthProvider>
  )
}
