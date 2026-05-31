import { useState, useCallback } from 'react'

const AUTH_URL = '/auth/realms/bachhoanhanh/protocol/openid-connect/token'
const TOKEN_STORAGE_KEY = 'bhn_access_token'
const USERNAME_STORAGE_KEY = 'bhn_username'

function decodeJwtPayload(token) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
    const json = atob(padded)
    return JSON.parse(json)
  } catch {
    return null
  }
}

function getRolesFromToken(token) {
  const payload = decodeJwtPayload(token)
  const roles = payload?.realm_access?.roles
  return Array.isArray(roles) ? roles.filter((role) => typeof role === 'string') : []
}

function isTokenExpired(token) {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return true
  return payload.exp * 1000 <= Date.now()
}

function getStoredToken() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USERNAME_STORAGE_KEY)
    return null
  }
  return token
}

export function useAuth() {
  const [token, setToken] = useState(() => getStoredToken())
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_STORAGE_KEY))
  const [roles, setRoles] = useState(() => {
    const storedToken = getStoredToken()
    return storedToken ? getRolesFromToken(storedToken) : []
  })
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (user, password) => {
    setLoading(true)
    try {
      if (!user || !password) {
        throw new Error('Please fill in credentials')
      }

      const form = new URLSearchParams()
      form.append('grant_type', 'password')
      form.append('client_id', 'gateway-client')
      form.append('username', user)
      form.append('password', password)

      const res = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form,
      })

      if (!res.ok) throw new Error('Invalid credentials')

      const data = await res.json()
      const userRoles = getRolesFromToken(data.access_token)
      localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token)
      localStorage.setItem(USERNAME_STORAGE_KEY, user)
      setToken(data.access_token)
      setUsername(user)
      setRoles(userRoles)
      return { success: true, message: 'Signed in successfully' }
    } catch (e) {
      return { success: false, message: e.message || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USERNAME_STORAGE_KEY)
    setToken(null)
    setUsername(null)
    setRoles([])
  }, [])

  return {
    token,
    username,
    roles,
    loading,
    login,
    logout,
    isLoggedIn: !!token,
    isAdmin: roles.includes('ADMIN'),
    isStaff: roles.includes('STAFF'),
    isCustomer: roles.includes('CUSTOMER'),
  }
}
