import { useState, useCallback } from 'react'

const AUTH_URL = '/auth/realms/bachhoanhanh/protocol/openid-connect/token'
const REGISTER_URL = '/users/register'
const ME_URL = '/users/me'
const TOKEN_STORAGE_KEY = 'bhn_access_token'
const USERNAME_STORAGE_KEY = 'bhn_username'
const PROFILE_STORAGE_KEY = 'bhn_user_profile'

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
    localStorage.removeItem(PROFILE_STORAGE_KEY)
    return null
  }
  return token
}

function getStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function useAuth() {
  const [token, setToken] = useState(() => getStoredToken())
  const [username, setUsername] = useState(() => localStorage.getItem(USERNAME_STORAGE_KEY))
  const [profile, setProfile] = useState(() => getStoredProfile())
  const [roles, setRoles] = useState(() => {
    const storedToken = getStoredToken()
    return storedToken ? getRolesFromToken(storedToken) : []
  })
  const [loading, setLoading] = useState(false)

  const loadMe = useCallback(async (accessToken) => {
    try {
      const res = await fetch(ME_URL, {
        headers: { Authorization: 'Bearer ' + accessToken },
      })
      if (!res.ok) throw new Error('Failed to load user profile')
      const data = await res.json()
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data))
      setProfile(data)
      return { success: true, data }
    } catch (e) {
      return { success: false, message: e.message }
    }
  }, [])

  const updateProfile = useCallback(
    async (profileData) => {
      if (!token) return { success: false, message: 'Not authenticated' }
      try {
        const res = await fetch(ME_URL, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify(profileData),
        })
        if (!res.ok) {
          const errorData = await res.json().catch(() => null)
          throw new Error(errorData?.message || 'Update profile failed')
        }
        const data = await res.json()
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data))
        setProfile(data)
        return { success: true, data, message: 'Profile updated' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token]
  )

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
      await loadMe(data.access_token)
      return { success: true, message: 'Signed in successfully' }
    } catch (e) {
      return { success: false, message: e.message || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }, [loadMe])

  const registerCustomer = useCallback(
    async ({ phone, firstName, lastName, email, password }) => {
      setLoading(true)
      try {
        if (!phone || !firstName || !lastName || !password) {
          throw new Error('Phone, first name, last name and password are required')
        }

        const res = await fetch(REGISTER_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone,
            firstName,
            lastName,
            email: email || null,
            password,
          }),
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => null)
          throw new Error(errorData?.message || 'Registration failed')
        }

        return await login(phone, password)
      } catch (e) {
        return { success: false, message: e.message || 'Registration failed' }
      } finally {
        setLoading(false)
      }
    },
    [login]
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USERNAME_STORAGE_KEY)
    localStorage.removeItem(PROFILE_STORAGE_KEY)
    setToken(null)
    setUsername(null)
    setProfile(null)
    setRoles([])
  }, [])

  return {
    token,
    username,
    profile,
    roles,
    loading,
    login,
    registerCustomer,
    loadMe,
    updateProfile,
    logout,
    isLoggedIn: !!token,
    isAdmin: roles.includes('ADMIN'),
    isStaff: roles.includes('STAFF'),
    isCustomer: roles.includes('CUSTOMER'),
  }
}
