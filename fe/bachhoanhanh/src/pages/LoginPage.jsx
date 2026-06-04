import { useState } from 'react'
import { showToast } from '../components/Toast'

export function LoginPage({ onLoginSuccess, onRegisterSuccess, loading }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
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

  const handleRegister = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const result = await onRegisterSuccess({
      phone,
      firstName,
      lastName,
      email,
      password: registerPassword,
    })
    if (!result.success) {
      showToast(result.message, true)
    } else {
      showToast('Account created and signed in')
    }
    setIsLoading(false)
  }

  return (
    <div className="page active">
      <div className="login-wrap">
        <div className="auth-tabs">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Sign in
          </button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
            Create account
          </button>
        </div>

        {mode === 'login' ? (
          <>
            <h2>Welcome back</h2>
            <p>Sign in with your customer account to continue shopping.</p>
            <form onSubmit={handleLogin}>
              <div className="field">
                <label>Username or phone</label>
                <input
                  type="text"
                  placeholder="Phone number or username"
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
          </>
        ) : (
          <>
            <h2>Create your customer account</h2>
            <p>Create a customer account to start ordering and tracking purchases.</p>
            <form onSubmit={handleRegister}>
              <div className="field">
                <label>Phone</label>
                <input
                  type="tel"
                  placeholder="0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={busy}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="field">
                  <label>Last name</label>
                  <input
                    type="text"
                    placeholder="Nguyen"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={busy}
                  />
                </div>
                <div className="field">
                  <label>First name</label>
                  <input
                    type="text"
                    placeholder="Van B"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={busy}
                  />
                </div>
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="new_guest@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={busy}
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  disabled={busy}
                />
              </div>
              <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={busy}>
                {busy ? 'Creating account...' : 'Create and sign in'}
              </button>
            </form>
          </>
        )}

        <hr className="divider" />
      </div>
    </div>
  )
}
