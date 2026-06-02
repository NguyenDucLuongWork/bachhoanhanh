import { useEffect, useState } from 'react'
import { Loader } from '../components/Loader'
import { showToast } from '../components/Toast'

export function CustomerDetailPage({ customerId, onBack, getCustomerDetail, onUpdateCustomer }) {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadCustomer = async () => {
      setLoading(true)
      const result = await getCustomerDetail(customerId)
      if (result.success) {
        setCustomer(result.data)
        setFormData(result.data)
      } else {
        showToast(result.message || 'Failed to load customer', true)
      }
      setLoading(false)
    }

    if (customerId) {
      loadCustomer()
    }
  }, [customerId, getCustomerDetail])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const result = await onUpdateCustomer(customerId, formData)
    setIsSaving(false)
    if (result.success) {
      showToast('Customer updated successfully')
      setCustomer(formData)
      setIsEditing(false)
    } else {
      showToast(result.message || 'Failed to update customer', true)
    }
  }

  if (loading) {
    return (
      <div className="page active">
        <Loader />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="page active">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Customer not found</p>
          <button className="btn btn-accent" onClick={onBack} style={{ marginTop: 16 }}>
            Back to Users
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page active" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h2>Customer Details</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
            {customer.firstName} {customer.lastName}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={onBack}>
          ← Back
        </button>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        {!isEditing ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase' }}>First Name</label>
                <p style={{ fontSize: 14, marginTop: 4 }}>{customer.firstName}</p>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase' }}>Last Name</label>
                <p style={{ fontSize: 14, marginTop: 4 }}>{customer.lastName}</p>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase' }}>Phone</label>
                <p style={{ fontSize: 14, marginTop: 4 }}>{customer.phone}</p>
              </div>
              <div>
                <label style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase' }}>Email</label>
                <p style={{ fontSize: 14, marginTop: 4 }}>{customer.email}</p>
              </div>
              {customer.dateOfBirth && (
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase' }}>Date of Birth</label>
                  <p style={{ fontSize: 14, marginTop: 4 }}>{customer.dateOfBirth}</p>
                </div>
              )}
              {customer.address && (
                <div>
                  <label style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase' }}>Address</label>
                  <p style={{ fontSize: 14, marginTop: 4 }}>{customer.address}</p>
                </div>
              )}
            </div>

            <button className="btn btn-accent" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSave()
            }}
            style={{ display: 'grid', gap: 12 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={isSaving}
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={isSaving}
              />
            </div>
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required disabled={isSaving} />
            <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required disabled={isSaving} />
            <input type="date" name="dateOfBirth" placeholder="Date of Birth" value={formData.dateOfBirth || ''} onChange={handleChange} disabled={isSaving} />
            <input type="text" name="address" placeholder="Address" value={formData.address || ''} onChange={handleChange} disabled={isSaving} />

            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-accent" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setIsEditing(false)
                  setFormData(customer)
                }}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
