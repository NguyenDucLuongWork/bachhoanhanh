const AUTH_REALM = import.meta.env.VITE_AUTH_REALM || 'bachhoanhanh'
const isDev = import.meta.env.DEV === true || import.meta.env.MODE === 'development'

// Always use relative paths so proxy/serverless functions can handle the request
export const API_BASE_URL = ''
export const apiUrl = (path) => {
  return path
}

// In dev and production, use relative paths so the proxy can forward to the real backend
export const AUTH_TOKEN_URL = `/auth/realms/${AUTH_REALM}/protocol/openid-connect/token`

export default {
  API_BASE_URL,
  AUTH_TOKEN_URL,
  apiUrl,
}
