import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { auth } from '~/lib/auth/auth'

// Ôn lại: đây là server function DÙNG CHUNG cho cả __root.tsx (hiện nav
// đăng nhập/đăng xuất) và _authed.tsx (bảo vệ route) — tránh lặp code.
export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const request = getRequest()
    try {
      return await auth.api.getSession({ headers: request.headers })
    } catch {
      return null
    }
  },
)
