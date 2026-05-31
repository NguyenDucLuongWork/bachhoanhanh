import { useState, useEffect } from 'react'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import './App.css'

function App() {
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if token exists in localStorage on mount
    const savedToken = localStorage.getItem('auth_token')
    if (savedToken) {
      setToken(savedToken)
    }
    setLoading(false)
  }, [])

  const handleLoginSuccess = (authToken) => {
    setToken(authToken)
  }

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem('auth_token')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <>
      {!token ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <AdminDashboard token={token} onLogout={handleLogout} />
      )}
    </>
  )
}

export default App
