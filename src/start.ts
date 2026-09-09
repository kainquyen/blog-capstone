import { createStart } from '@tanstack/react-start'
import { csrfMiddleware } from '~/server/csrf-middleware'

// TODO 8: gắn csrfMiddleware vào requestMiddleware
export const startInstance = createStart(() => {
  return {
    requestMiddleware: [csrfMiddleware],
  }
})
