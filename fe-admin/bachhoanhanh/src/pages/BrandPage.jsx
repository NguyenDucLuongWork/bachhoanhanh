import { useState } from 'react'
import { Loader } from '../components/Loader'
import { showToast } from '../components/Toast'

const emptyBrand = {
  name: '',
  image: '',
  description: '',
  phoneNumber: '',
  email: '',
}

export function BrandPage({ brands, loading, onRefresh, onCreateBrand, onUpdateBrand, onDeleteBrand, onViewBrand, isAdminUser }) {
  const [brandForm, setBrandForm] = useState(emptyBrand)
  const [editingBrand, setEditingBrand] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const openAddBrand = () => {
    setEditingBrand(null)
    setBrandForm(emptyBrand)
    setIsModalOpen(true)
  }

  const handleSearch = async () => {
    await onRefresh(searchTerm)
  }

  const handleSearchReset = async () => {
    setSearchTerm('')
    await onRefresh('')
  }

  const openEditBrand = (brand) => {
    setEditingBrand(brand)
    setBrandForm({
      name: brand.name || '',
      image: brand.image || '',
      description: brand.description || '',
      phoneNumber: brand.phoneNumber || '',
      email: brand.email || '',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBrand(null)
    setBrandForm(emptyBrand)
  }

  const handleSave = async () => {
    if (!brandForm.name.trim()) {
      showToast('Brand name is required', true)
      return
    }

    setSaving(true)
    const result = editingBrand
      ? await onUpdateBrand(editingBrand.id, brandForm)
      : await onCreateBrand(brandForm)

    if (result.success) {
      showToast(result.message)
      closeModal()
    } else {
      showToast(result.message, true)
    }
    setSaving(false)
  }

  const handleDelete = async (brand) => {
    if (!window.confirm(`Delete brand '${brand.name}'?`)) return
    const result = await onDeleteBrand(brand.id)
    if (result.success) {
      showToast(result.message)
    } else {
      showToast(result.message, true)
    }
  }

  if (loading) {
    return (
      <div className="page active">
        <Loader />
      </div>
    )
  }

  return (
    <div className="page active commerce-shell admin-compact-page admin-brands-page">
      <section className="store-hero">
        <div>
          <span className="eyebrow">Brand management</span>
          <h1>Manage brands</h1>
          <p>See all brand partners and update their details from the manager console.</p>
        </div>
        <div className="hero-metrics">
          <div>
            <strong>{brands.length}</strong>
            <span>Brands</span>
          </div>
          <div>
            <strong>{isAdminUser ? 'Admin' : 'View'}</strong>
            <span>Access</span>
          </div>
          <div>
            <strong>Brand</strong>
            <span>Directory</span>
          </div>
        </div>
      </section>

      <section className="store-layout">
        <div className="store-toolbar" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
    <div>{isAdminUser ? 'Brand operations workspace' : 'Brand directory'}</div>
    
    {/* Hàng 1: Search */}
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search by brand name"
        style={{ padding: '8px 10px', minWidth: '220px' }}
      />
      <button className="btn btn-ghost" onClick={handleSearch}>Search</button>
      <button className="btn btn-ghost" onClick={handleSearchReset}>Reset</button>
    </div>

    {/* Hàng 2: Refresh + Add */}
    <div style={{ display: 'flex', gap: '8px' }}>
      <button className="btn btn-ghost" onClick={() => onRefresh(searchTerm)}>Refresh</button>
      {isAdminUser && (
        <button className="btn btn-accent" onClick={() => openAddBrand()}>Add brand</button>
      )}
    </div>
  </div>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>ID</th>
                <th style={{ borderBottom: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Name</th>
                <th style={{ borderBottom: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Description</th>
                <th style={{ borderBottom: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Image</th>
                <th style={{ borderBottom: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Phone</th>
                <th style={{ borderBottom: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ borderBottom: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    No brands available.
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr key={brand.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px' }}>{brand.id}</td>
                    <td style={{ padding: '12px' }}>{brand.name || 'Untitled'}</td>
                    <td style={{ padding: '12px', maxWidth: '320px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {brand.description || 'No description'}
                    </td>
                    <td style={{ padding: '12px' }}>{brand.image || 'n/a'}</td>
                    <td style={{ padding: '12px' }}>{brand.phoneNumber || 'n/a'}</td>
                    <td style={{ padding: '12px' }}>{brand.email || 'n/a'}</td>
                    {isAdminUser ? (
                      <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                        <button className="btn btn-ghost" onClick={() => openEditBrand(brand)}>
                          Edit
                        </button>
                        <button className="btn btn-ghost" onClick={() => onViewBrand?.(brand.name)}>
                          View
                        </button>
                        <button className="btn btn-danger" onClick={() => handleDelete(brand)}>
                          Delete
                        </button>
                      </td>
                    ) : (
                      <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                        <button className="btn btn-ghost" onClick={() => onViewBrand?.(brand.name)}>
                          View
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <div className={"modal-bg open"} onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingBrand ? 'Edit brand' : 'Add brand'}</h2>
            <div className="modal-body">
              <label>
                Name
                <input
                  type="text"
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                />
              </label>
              <label>
                Description
                <textarea
                  value={brandForm.description}
                  onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                />
              </label>
              <label>
                Image URL
                <input
                  type="text"
                  value={brandForm.image}
                  onChange={(e) => setBrandForm({ ...brandForm, image: e.target.value })}
                />
              </label>
              <label>
                Phone number
                <input
                  type="text"
                  value={brandForm.phoneNumber}
                  onChange={(e) => setBrandForm({ ...brandForm, phoneNumber: e.target.value })}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={brandForm.email}
                  onChange={(e) => setBrandForm({ ...brandForm, email: e.target.value })}
                />
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal} disabled={saving}>
                Cancel
              </button>
              <button className="btn btn-accent" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
