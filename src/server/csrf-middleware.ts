import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

/**
 * TODO 7: Ôn lại Server Primitives — chặn request non-GET/HEAD có Origin
 * không khớp process.env.APP_ORIGIN.
 */
export const csrfMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getRequest();
  
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const origin = request.headers.get('origin')
    if (origin !== process.env.APP_ORIGIN) {
      throw new Error('Forbidden: CSRF Token not found')
    }
  }
  return next()
})
