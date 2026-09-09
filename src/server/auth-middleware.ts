import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "~/lib/auth/auth";

/**
 * TODO 5: Viết authMiddleware — type: 'function', đọc session qua
 * auth.api.getSession(), throw Error('Unauthorized') nếu null. Nhớ bọc
 * try/catch quanh getSession() để chuẩn hoá lỗi (bài học Seroval Error
 * bạn từng gặp), tránh lỗi lạ lọt ra client.
 */
export const authMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();
    let session = null;

    try {
      session = await auth.api.getSession({ headers: request.headers });
    } catch (error) {
      session = null;
    }

    if (!session) {
      throw new Error("Unauthorized");
    }

    return next({
      context: { session },
    });
  },
);

/**
 * TODO 6: Viết requireRoleMiddleware(role) — factory pattern, phụ thuộc
 * authMiddleware, so sánh context.session.user.role.
 */
export function requireRoleMiddleware(role: string) {
  return createMiddleware({ type: "function" })
    .middleware([authMiddleware])
    .server(({ next, context }) => {
      if (context.session.user.role !== role) {
        throw new Error("Unauthorized");
      }
      return next();
    });
}
