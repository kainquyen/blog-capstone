import { createFileRoute } from '@tanstack/react-router'
import { auth } from '~/lib/auth/auth'

/**
 * TODO 4: Ôn lại — điền handler GET/POST giao thẳng request cho
 * auth.handler(request). Nhớ lại vì sao path này dùng wildcard $.
 *
 * Vì /api/auth/signup, /api/auth/login, /api/auth/callback đều có thể là
 * request get và post 
 */
export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }) => auth.handler(request),
      POST: async ({ request }) => auth.handler(request),
    },
  },
})
