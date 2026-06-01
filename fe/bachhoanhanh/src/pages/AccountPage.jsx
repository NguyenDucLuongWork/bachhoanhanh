import { useEffect, useState } from 'react'
import { showToast } from '../components/Toast'

export function AccountPage({ profile, username, onUpdateProfile }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFirstName(profile?.firstName || '')
    setLastName(profile?.lastName || '')
    setEmail(profile?.email || '')
  }, [profile])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    const result = await onUpdateProfile({ firstName, lastName, email })
    if (result.success) {
      showToast(result.message)
    } else {
      showToast(result.message, true)
    }
    setSaving(false)
  }

  return (
    <section className="page active" style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2>Account</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
            Update your profile information
          </p>
        </div>
      </div>

      <form className="login-wrap" style={{ maxWidth: '620px', marginTop: 0 }} onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="field">
            <label>Last name</label>
            <input value={lastName} onChange={(event) => setLastName(event.target.value)} disabled={saving} />
          </div>
          <div className="field">
            <label>First name</label>
            <input value={firstName} onChange={(event) => setFirstName(event.target.value)} disabled={saving} />
          </div>
        </div>

        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={saving} />
        </div>

        <div className="field">
          <label>Phone / login username</label>
          <input type="text" value={profile?.phone || username || ''} readOnly />
        </div>

        <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={saving}>
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </section>
  )
}
