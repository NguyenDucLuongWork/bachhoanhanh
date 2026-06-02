import { useState, useEffect } from 'react'
import { showToast } from '../components/Toast'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { Loader } from '../components/Loader'

export function CatalogsPage({ catalogs, loading, onAddCatalog, onUpdateCatalog, onDeleteCatalog, onRefresh }) {
  const [filteredCatalogs, setFilteredCatalogs] = useState(catalogs)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCatalog, setSelectedCatalog] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [newCatalogName, setNewCatalogName] = useState('')
  const [editCatalogName, setEditCatalogName] = useState('')

  useEffect(() => {
    setFilteredCatalogs(
      catalogs.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(c.id).includes(searchQuery)
      )
    )
  }, [catalogs, searchQuery])

  const handleAddCatalog = async () => {
    if (!newCatalogName.trim()) return
    setModalLoading(true)
    const result = await onAddCatalog({ name: newCatalogName.trim() })
    if (result.success) {
      showToast(result.message)
      setIsAddModalOpen(false)
      setNewCatalogName('')
    } else {
      showToast(result.message, true)
    }
    setModalLoading(false)
  }

  const handleEditCatalog = (catalog) => {
    setSelectedCatalog(catalog)
    setEditCatalogName(catalog.name)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editCatalogName.trim()) return
    setModalLoading(true)
    const result = await onUpdateCatalog(selectedCatalog.id, { name: editCatalogName.trim() })
    if (result.success) {
      showToast(result.message)
      setIsEditModalOpen(false)
      setSelectedCatalog(null)
      setEditCatalogName('')
    } else {
      showToast(result.message, true)
    }
    setModalLoading(false)
  }

  const handleDeleteClick = (id) => {
    setDeletingId(id)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    setModalLoading(true)
    const result = await onDeleteCatalog(deletingId)
    if (result.success) {
      showToast(result.message)
      setIsDeleteModalOpen(false)
      setDeletingId(null)
    } else {
      showToast(result.message, true)
    }
    setModalLoading(false)
  }

  if (loading) {
    return (
      <div className="page active">
        <Loader />
      </div>
    )
  }

  return (
    <div className="page active" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2>Catalogs</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
            Manage your catalog structure
          </p>
        </div>
        <button className="btn btn-accent" onClick={() => setIsAddModalOpen(true)}>
          + Add catalog
        </button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search catalogs…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn btn-ghost" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {filteredCatalogs.length === 0 ? (
        <div className="empty">
          <div className="icon">📁</div>
          <p style={{ fontSize: '14px' }}>No catalogs found</p>
        </div>
      ) : (
        <div className="catalogs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '14px' }}>
          {filteredCatalogs.map((catalog) => (
            <div key={catalog.id} className="catalog-card" style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>{catalog.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>ID: {catalog.id}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleEditCatalog(catalog)}>
                  Edit
                </button>
                <button
                  className="btn btn-sm"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    color: '#ef4444',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    fontSize: '12px',
                    padding: '5px 10px',
                  }}
                  onClick={() => handleDeleteClick(catalog.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Catalog Modal */}
      {isAddModalOpen && (
        <div className="modal-bg open">
          <div className="modal">
            <h3>Add catalog</h3>
            <div className="field">
              <label>Name</label>
              <input
                type="text"
                placeholder="Catalog name"
                value={newCatalogName}
                onChange={(e) => setNewCatalogName(e.target.value)}
                disabled={modalLoading}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setIsAddModalOpen(false)} disabled={modalLoading}>
                Cancel
              </button>
              <button className="btn btn-accent" onClick={handleAddCatalog} disabled={modalLoading}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Catalog Modal */}
      {isEditModalOpen && (
        <div className="modal-bg open">
          <div className="modal">
            <h3>Edit catalog</h3>
            <div className="field">
              <label>Name</label>
              <input
                type="text"
                placeholder="Catalog name"
                value={editCatalogName}
                onChange={(e) => setEditCatalogName(e.target.value)}
                disabled={modalLoading}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => { setIsEditModalOpen(false); setSelectedCatalog(null); setEditCatalogName(''); }} disabled={modalLoading}>
                Cancel
              </button>
              <button className="btn btn-accent" onClick={handleSaveEdit} disabled={modalLoading}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={modalLoading}
      />
    </div>
  )
}