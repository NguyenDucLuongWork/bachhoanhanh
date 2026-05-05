import { useState, useCallback } from 'react'

const AUTH_URL = '/api/auth'

export function useAuth() {
  const [token, setToken] = useState(null)
  const [username, setUsername] = useState(null)
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
      setToken(data.access_token)
      setUsername(user)
      return { success: true, message: 'Signed in successfully' }
    } catch (e) {
      return { success: false, message: e.message || 'Login failed' }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUsername(null)
  }, [])

  return {
    token,
    username,
    loading,
    login,
    logout,
    isLoggedIn: !!token,
  }
}
