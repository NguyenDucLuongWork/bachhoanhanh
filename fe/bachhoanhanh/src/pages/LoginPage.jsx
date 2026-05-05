import { useState } from 'react'
import { showToast } from '../components/Toast'

export function LoginPage({ onLoginSuccess, loading }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const result = await onLoginSuccess(username, password)
    if (!result.success) {
      showToast(result.message, true)
    }
    setIsLoading(false)
  }

  return (
    <div className="page active">
      <div className="login-wrap">
        <h2>Welcome back</h2>
        <p>Sign in to your BachHoaNhanh account</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Username</label>
            <input
              type="text"
              placeholder="your-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="btn btn-accent"
            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <hr className="divider" />
        <p style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center' }}>
          Secured with Keycloak · OpenID Connect
        </p>
      </div>
    </div>
  )
}
