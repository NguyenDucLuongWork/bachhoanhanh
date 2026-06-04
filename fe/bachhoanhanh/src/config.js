const API_BASE = import.meta.env.VITE_API_BASE || 'http://103.173.226.31'
const AUTH_REALM = import.meta.env.VITE_AUTH_REALM || 'bachhoanhanh'
const isDev = import.meta.env.DEV === true || import.meta.env.MODE === 'development'

export const API_BASE_URL = API_BASE
export const apiUrl = (path) => {
  if (isDev) return path
  return `${API_BASE}${path}`
}

// In dev use a relative path so Vite dev server proxy can forward the request
// and avoid CORS issues. In production build use the absolute API base.
export const AUTH_TOKEN_URL = isDev
  ? `/auth/realms/${AUTH_REALM}/protocol/openid-connect/token`
  : `${API_BASE}/auth/realms/${AUTH_REALM}/protocol/openid-connect/token`

export default {
  API_BASE_URL,
  AUTH_TOKEN_URL,
  apiUrl,
}
