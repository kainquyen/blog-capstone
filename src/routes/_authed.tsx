import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSessionFn } from '~/lib/auth/session.functions'

/**
 * TODO 18: Ôn lại — beforeLoad gọi getSessionFn(), redirect '/login' nếu
 * không có, return { session } nếu có. NHỚ LẠI nguyên tắc đã học 4+ lần:
 * đây CHỈ là UX guard, mọi server function trong route con VẪN PHẢI tự
 * gắn authMiddleware (xem admin/posts.tsx).
 */
export const Route = createFileRoute('/_authed')({
  beforeLoad: async () => {
    const session = await getSessionFn()
    if(!session) throw redirect({to: '/login'})
    return {session}
  },
})
