import { createRouter, ErrorComponent } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultErrorComponent: ({ error, reset }) => (
      <div className="p-6">
        <p className="text-red-600 font-semibold">Đã có lỗi xảy ra:</p>
        <ErrorComponent error={error} />
        <button className="mt-2 underline" onClick={() => reset()}>
          Thử lại
        </button>
      </div>
    ),
  })
  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
