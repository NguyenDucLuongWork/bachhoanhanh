import { useState, useEffect } from 'react'
import { showToast } from '../components/Toast'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { Loader } from '../components/Loader'

const StaffForm = ({ onSubmit, isLoading, staffData = null }) => {
  const [form, setForm] = useState(
    staffData || {
      username: '',
      phone: '',
      lastName: '',
      firstName: '',
      email: '',
      password: '',
      dateOfBirth: '',
      idCardNumber: '',
      address: '',
      isFemale: false,
    }
  )

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
        required
        disabled={isLoading || !!staffData}
      />
      <input type="text" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required disabled={isLoading} />
      <input type="text" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required disabled={isLoading} />
      <input type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required disabled={isLoading} />
      <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required disabled={isLoading} />
      {!staffData && <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required disabled={isLoading} />}
      <input type="date" name="dateOfBirth" placeholder="Date of Birth" value={form.dateOfBirth} onChange={handleChange} disabled={isLoading} />
      <input type="text" name="idCardNumber" placeholder="ID Card Number" value={form.idCardNumber} onChange={handleChange} disabled={isLoading} />
      <input type="text" name="address" placeholder="Address" value={form.address} onChange={handleChange} disabled={isLoading} />
      <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="checkbox" name="isFemale" checked={form.isFemale} onChange={handleChange} disabled={isLoading} />
        <span>Female</span>
      </label>
      <button type="submit" className="btn btn-accent" disabled={isLoading}>
        {isLoading ? 'Saving...' : staffData ? 'Update Staff' : 'Add Staff'}
      </button>
    </form>
  )
}

export function UsersManagementPage({
  customers = [],
  staff = [],
  loading,
  isAdminUser,
  isStaffUser,
  profile = null,
  onUpdateProfile,
  onLoadCustomers,
  onLoadStaff,
  onSearchByPhone,
  onGetCustomerDetail,
  onCreateStaff,
  onUpdateStaff,
  onUpdateCustomer,
  onDeleteUser,
  onViewCustomerDetail,
}) {
  const [tab, setTab] = useState('customers') // customers, staff
  const [searchPhone, setSearchPhone] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searchError, setSearchError] = useState(null)
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    dateOfBirth: '',
    idCardNumber: '',
    isFemale: false,
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [showStaffForm, setShowStaffForm] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [isStaffFormLoading, setIsStaffFormLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deletingType, setDeletingType] = useState(null) // 'customer' or 'staff'

  useEffect(() => {
    if (profile) {
      setProfileForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        email: profile.email || '',
        address: profile.address || '',
        dateOfBirth: profile.dateOfBirth || '',
        idCardNumber: profile.idCardNumber || '',
        isFemale: !!profile.isFemale,
      })
    }
  }, [profile])

  const handleSearchCustomer = async () => {
    if (!searchPhone.trim()) {
      showToast('Please enter a phone number', true)
      return
    }

    setSearchResult(null)
    setSearchError(null)
    const result = await onSearchByPhone(searchPhone.trim())
    if (result.success && result.data) {
      const found = Array.isArray(result.data) ? result.data : [result.data]
      if (found.length === 0) {
        setSearchError('No user found')
        showToast('No user found', true)
      } else {
        setSearchResult(found)
        showToast('User found!')
      }
    } else {
      setSearchError(result.message || 'Customer not found')
      showToast(result.message || 'Customer not found', true)
    }
  }

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target
    setProfileForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileLoading(true)

    const result = await onUpdateProfile({
      ...profileForm,
      phone: profileForm.phone || profile?.phone || '',
    })

    setProfileLoading(false)

    if (result.success) {
      showToast('Profile updated successfully')
    } else {
      showToast(result.message || 'Failed to update profile', true)
    }
  }

  const handleAddStaff = async (formData) => {
    setIsStaffFormLoading(true)
    const result = await onCreateStaff(formData)
    setIsStaffFormLoading(false)
    if (result.success) {
      showToast('Staff member created successfully')
      setShowStaffForm(false)
    } else {
      showToast(result.message || 'Failed to create staff', true)
    }
  }

  const handleUpdateStaff = async (formData) => {
    if (!selectedStaff) return
    setIsStaffFormLoading(true)
    const result = await onUpdateStaff(selectedStaff.id, formData)
    setIsStaffFormLoading(false)
    if (result.success) {
      showToast('Staff member updated successfully')
      setSelectedStaff(null)
      setShowStaffForm(false)
    } else {
      showToast(result.message || 'Failed to update staff', true)
    }
  }

  const handleDeleteClick = (id, type) => {
    setDeletingId(id)
    setDeletingType(type)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    const result = await onDeleteUser(deletingId)
    if (result.success) {
      showToast('User deleted successfully')
    } else {
      showToast(result.message || 'Failed to delete user', true)
    }
    setDeleteModalOpen(false)
    setDeletingId(null)
    setDeletingType(null)
  }

  const handleViewCustomer = (customerId) => {
    onViewCustomerDetail(customerId)
  }

  if (loading) {
    return (
      <div className="page active">
        <Loader />
      </div>
    )
  }

  return (
    <div className="page active admin-compact-page admin-users-page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2>User Management</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
            Manage customers and staff members
          </p>
        </div>
      </div>

      {!isStaffUser && (
        <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
          <button
            onClick={() => setTab('customers')}
            style={{
              background: 'none',
              border: 'none',
              paddingBottom: 12,
              fontSize: 14,
              fontWeight: tab === 'customers' ? 600 : 400,
              color: tab === 'customers' ? 'var(--primary)' : 'var(--muted)',
              borderBottom: tab === 'customers' ? '2px solid var(--primary)' : 'none',
              cursor: 'pointer',
            }}
          >
            Customers ({customers.length})
          </button>
          {isAdminUser && (
            <button
              onClick={() => setTab('staff')}
              style={{
                background: 'none',
                border: 'none',
                paddingBottom: 12,
                fontSize: 14,
                fontWeight: tab === 'staff' ? 600 : 400,
                color: tab === 'staff' ? 'var(--primary)' : 'var(--muted)',
                borderBottom: tab === 'staff' ? '2px solid var(--primary)' : 'none',
                cursor: 'pointer',
              }}
            >
              Staff ({staff.length})
            </button>
          )}
        </div>
      )}

      {isStaffUser ? (
        <div>
          <div style={{ marginBottom: 32, display: 'grid', gap: 16 }}>
            <div style={{ padding: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <h3 style={{ marginBottom: 12 }}>Search User by Phone</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  style={{ flex: 1, minWidth: 220 }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchCustomer()}
                />
                <button className="btn btn-accent" onClick={handleSearchCustomer}>
                  Search
                </button>
                <button className="btn btn-ghost" onClick={() => {
                  setSearchPhone('')
                  setSearchResult(null)
                  setSearchError(null)
                }}>
                  Clear
                </button>
              </div>
              {searchError && (
                <p style={{ marginTop: 12, color: 'var(--danger)' }}>{searchError}</p>
              )}
              {searchResult && (
                <div style={{ marginTop: 16, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>Name</th>
                          <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>Phone</th>
                          <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>Email</th>
                          <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                        {searchResult.map((item, index) => (
                          <tr key={item.keycloakId || item.id || index} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: 12 }}>{item.firstName} {item.lastName}</td>
                            <td style={{ padding: 12 }}>{item.phone}</td>
                            <td style={{ padding: 12 }}>{item.email}</td>
                            <td style={{ padding: 12, display: 'flex', gap: 8 }}>
                              <button
                                className="btn btn-small"
                                onClick={() => onViewCustomerDetail(item.keycloakId || item.id)}
                                style={{ fontSize: 12, padding: '6px 12px' }}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={{ padding: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <h3 style={{ marginBottom: 12 }}>My Profile</h3>
              <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: 12 }}>
                <input name="firstName" placeholder="First Name" value={profileForm.firstName} onChange={handleProfileChange} required />
                <input name="lastName" placeholder="Last Name" value={profileForm.lastName} onChange={handleProfileChange} required />
                <input name="phone" placeholder="Phone" value={profileForm.phone} onChange={handleProfileChange} required />
                <input name="email" type="email" placeholder="Email" value={profileForm.email} onChange={handleProfileChange} required />
                <input name="dateOfBirth" type="date" placeholder="Date of Birth" value={profileForm.dateOfBirth} onChange={handleProfileChange} />
                <input name="idCardNumber" placeholder="ID Card Number" value={profileForm.idCardNumber} onChange={handleProfileChange} />
                <input name="address" placeholder="Address" value={profileForm.address} onChange={handleProfileChange} />
                <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="checkbox" name="isFemale" checked={profileForm.isFemale} onChange={handleProfileChange} />
                  <span>Female</span>
                </label>
                <button type="submit" className="btn btn-accent" disabled={profileLoading}>
                  {profileLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* CUSTOMERS TAB */}
          {tab === 'customers' && (
            <div>
              <div style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Search by phone number"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  style={{ flex: 1 }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchCustomer()}
                />
                <button className="btn btn-accent" onClick={handleSearchCustomer}>
                  Search
                </button>
                <button className="btn btn-ghost" onClick={onLoadCustomers}>
                  Refresh
                </button>
              </div>

              {customers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                  <p>No customers found</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>Name</th>
                        <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>Phone</th>
                        <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>Email</th>
                        <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.keycloakId || customer.id} style={{ borderBottom: '1px solid var(--border)', hover: { background: 'var(--surface)' } }}>
                          <td style={{ padding: 12 }}>
                            {customer.firstName} {customer.lastName}
                          </td>
                          <td style={{ padding: 12 }}>{customer.phone}</td>
                          <td style={{ padding: 12 }}>{customer.email}</td>
                          <td style={{ padding: 12, display: 'flex', gap: 8 }}>
                            <button
                              className="btn btn-small"
                              onClick={() => handleViewCustomer(customer.keycloakId || customer.id)}
                              style={{ fontSize: 12, padding: '6px 12px' }}
                            >
                              View
                            </button>
                            {isAdminUser && (
                              <button
                                className="btn btn-danger btn-small"
                                onClick={() => handleDeleteClick(customer.id, 'customer')}
                                style={{ fontSize: 12, padding: '6px 12px' }}
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* STAFF TAB */}
          {tab === 'staff' && isAdminUser && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <button
                  className="btn btn-accent"
                  onClick={() => {
                    setShowStaffForm(!showStaffForm)
                    setSelectedStaff(null)
                  }}
                >
                  {showStaffForm && !selectedStaff ? 'Cancel' : '+ Add Staff Member'}
                </button>
              </div>

              {showStaffForm && !selectedStaff && (
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 24,
                    maxWidth: 500,
                  }}
                >
                  <h3>Add New Staff Member</h3>
                  <StaffForm onSubmit={handleAddStaff} isLoading={isStaffFormLoading} />
                </div>
              )}

              {selectedStaff && showStaffForm && (
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 24,
                    maxWidth: 500,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3>Edit Staff Member</h3>
                    <button
                      className="btn btn-ghost"
                      onClick={() => {
                        setSelectedStaff(null)
                        setShowStaffForm(false)
                      }}
                      style={{ fontSize: 14 }}
                    >
                      Cancel
                    </button>
                  </div>
                  <StaffForm onSubmit={handleUpdateStaff} isLoading={isStaffFormLoading} staffData={selectedStaff} />
                </div>
              )}

              {staff.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                  <p>No staff members found</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>Name</th>
                        <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>Username</th>
                        <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>Phone</th>
                        <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>Email</th>
                        <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>ID Card</th>
                        <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: 'var(--muted)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map((member) => (
                        <tr key={member.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: 12 }}>
                            {member.firstName} {member.lastName}
                          </td>
                          <td style={{ padding: 12 }}>{member.username}</td>
                          <td style={{ padding: 12 }}>{member.phone}</td>
                          <td style={{ padding: 12 }}>{member.email}</td>
                          <td style={{ padding: 12 }}>{member.idCardNumber}</td>
                          <td style={{ padding: 12, display: 'flex', gap: 8 }}>
                            <button
                              className="btn btn-small"
                              onClick={() => {
                                setSelectedStaff(member)
                                setShowStaffForm(true)
                              }}
                              style={{ fontSize: 12, padding: '6px 12px' }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-small"
                              onClick={() => handleDeleteClick(member.id, 'staff')}
                              style={{ fontSize: 12, padding: '6px 12px' }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        title="Delete User"
        message={`Are you sure you want to delete this ${deletingType === 'customer' ? 'customer' : 'staff member'}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false)
          setDeletingId(null)
          setDeletingType(null)
        }}
      />
    </div>
  )
}
