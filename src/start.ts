import { createStart } from '@tanstack/react-start'
import { csrfMiddleware } from '~/server/csrf-middleware'

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [csrfMiddleware],
  }
})
