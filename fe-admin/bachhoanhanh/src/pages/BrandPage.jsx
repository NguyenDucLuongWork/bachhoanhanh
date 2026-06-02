import { useEffect, useState } from 'react'
import { Loader } from '../components/Loader'
import { showToast } from '../components/Toast'

const emptyBrand = {
  name: '',
  image: '',
  imageFile: null,
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
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (!brandForm.imageFile) {
      setPreviewUrl('')
      return
    }

    const url = URL.createObjectURL(brandForm.imageFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [brandForm.imageFile])

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
      imageFile: null,
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
    if (!editingBrand && !brandForm.imageFile) {
      showToast('Brand image file is required', true)
      return
    }

    setSaving(true)
    const payload = {
      ...brandForm,
      name: brandForm.name.trim(),
      image: editingBrand ? brandForm.image.trim() : '',
      description: brandForm.description.trim(),
      phoneNumber: brandForm.phoneNumber.trim(),
      email: brandForm.email.trim(),
    }
    const result = editingBrand
      ? await onUpdateBrand(editingBrand.id, payload)
      : await onCreateBrand(payload)

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

  const imagePreview = previewUrl || brandForm.image

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
        <div className="brand-admin-toolbar">
          <div className="brand-admin-title">
            <strong>{isAdminUser ? 'Brand operations workspace' : 'Brand directory'}</strong>
            <span>Search and maintain supplier information.</span>
          </div>
          <div className="brand-admin-actions">
            <div className="brand-search">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by brand name"
              />
              <button className="btn btn-ghost" onClick={handleSearch}>Search</button>
              {searchTerm && <button className="btn btn-ghost" onClick={handleSearchReset}>Reset</button>}
            </div>
            {isAdminUser && (
              <button className="btn btn-accent" onClick={openAddBrand}>Add brand</button>
            )}
          </div>
        </div>

        <div className="table-scroll">
          <table className="data-table brand-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Image</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-table-cell">
                    No brands available.
                  </td>
                </tr>
              ) : (
                brands.map((brand) => (
                  <tr key={brand.id}>
                    <td>{brand.id}</td>
                    <td><strong>{brand.name || 'Untitled'}</strong></td>
                    <td className="brand-description-cell">{brand.description || 'No description'}</td>
                    <td>
                      {brand.image ? (
                        <div className="brand-image-cell">
                          <img src={brand.image} alt={brand.name || 'Brand'} />
                        </div>
                      ) : (
                        'n/a'
                      )}
                    </td>
                    <td>{brand.phoneNumber || 'n/a'}</td>
                    <td>{brand.email || 'n/a'}</td>
                    <td>
                      <div className="table-actions">
                        {isAdminUser && (
                          <button className="btn btn-ghost" onClick={() => openEditBrand(brand)}>
                            Edit
                          </button>
                        )}
                        <button className="btn btn-ghost" onClick={() => onViewBrand?.(brand.name)}>
                          View
                        </button>
                        {isAdminUser && (
                          <button className="btn btn-danger" onClick={() => handleDelete(brand)}>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <div className="modal-bg open" onClick={closeModal}>
          <div className="modal brand-modal" onClick={(e) => e.stopPropagation()}>
            <div className="brand-modal-head">
              <div>
                <h2>{editingBrand ? 'Edit brand' : 'Add brand'}</h2>
                <p>{editingBrand ? 'Update brand profile and replace the S3 image if needed.' : 'Create a brand with a required S3 image upload.'}</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={closeModal} disabled={saving}>
                Close
              </button>
            </div>

            <div className="modal-body brand-modal-body">
              <label className="brand-field brand-field-wide">
                Name
                <input
                  type="text"
                  value={brandForm.name}
                  onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                />
              </label>

              <label className="brand-field brand-field-wide">
                Description
                <textarea
                  value={brandForm.description}
                  onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                />
              </label>

              <div className="brand-image-upload brand-field-wide">
                <div className="brand-preview">
                  {imagePreview ? <img src={imagePreview} alt={brandForm.name || 'Brand'} /> : <span>No image</span>}
                </div>
                <div className="brand-image-controls">
                  <label className="brand-field">
                    Upload image to S3
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => setBrandForm({ ...brandForm, imageFile: e.target.files?.[0] || null })}
                    />
                  </label>
                  {editingBrand && !brandForm.imageFile && brandForm.image && (
                    <p className="brand-upload-note">Current S3 image will be kept unless a new file is selected.</p>
                  )}
                  {!editingBrand && !brandForm.imageFile && (
                    <p className="brand-upload-note">Select an image file to upload to S3.</p>
                  )}
                  {brandForm.imageFile && (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setBrandForm({ ...brandForm, imageFile: null })}
                      type="button"
                    >
                      Clear selected file
                    </button>
                  )}
                </div>
              </div>

              <label className="brand-field">
                Phone number
                <input
                  type="text"
                  value={brandForm.phoneNumber}
                  onChange={(e) => setBrandForm({ ...brandForm, phoneNumber: e.target.value })}
                />
              </label>

              <label className="brand-field">
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
