import { useState } from 'react'
import { showToast } from '../components/Toast'

export function LoginPage({ onLoginSuccess, loading }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const busy = loading || isLoading

  const handleLogin = async (e) => {
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
        <h2>Manager sign in</h2>
        <p>Access is limited to ADMIN and STAFF accounts only.</p>
        <form onSubmit={handleLogin}>
          <div className="field">
            <label>Username</label>
            <input
              type="text"
              placeholder="admin or teststaff"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={busy}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
            />
          </div>
          <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={busy}>
            {busy ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <hr className="divider" />
        <div className="seed-accounts">
          <strong>Manager seed accounts</strong>
          <span>admin / 123456</span>
          <span>teststaff / 123456</span>
        </div>
      </div>
    </div>
  )
}
