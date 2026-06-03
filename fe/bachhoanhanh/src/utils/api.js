import { API_BASE_URL } from '../config'

const hasAbsoluteUrl = (url) => typeof url === 'string' && /^(https?:)?\/\//i.test(url)

export function getApiUrl(path) {
  if (hasAbsoluteUrl(path)) return path
  if (import.meta.env.DEV) return path
  const normalizedBase = API_BASE_URL.replace(/\/$/, '')
  return `${normalizedBase}${path.startsWith('/') ? '' : '/'}${path}`
}

export function apiFetch(path, options) {
  return fetch(getApiUrl(path), options)
}
