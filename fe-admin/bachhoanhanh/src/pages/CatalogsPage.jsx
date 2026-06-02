import { useState, useMemo } from 'react'
import { showToast } from '../components/Toast'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { Loader } from '../components/Loader'

function flattenTree(nodes, out = []) {
  if (!nodes) return out
  nodes.forEach((node) => {
    out.push(node)
    if (node.children && node.children.length) flattenTree(node.children, out)
  })
  return out
}

export function CatalogsPage({ catalogs = [], loading, onAddCatalog, onDeleteCatalog, onRefresh }) {
  const [newName, setNewName] = useState('')
  const [newParentId, setNewParentId] = useState('')

  const flatCatalogs = useMemo(() => {
    const result = []
    const walk = (items, prefix = '') => {
      if (!items) return
      items.forEach((item) => {
        const label = prefix ? prefix + ' / ' + item.name : item.name
        result.push({ ...item, label })
        if (item.children) walk(item.children, label)
      })
    }
    walk(catalogs)
    return result
  }, [catalogs])

  const handleAddCatalog = async () => {
    if (!newName.trim()) return
    const payload = {
      name: newName.trim(),
      parentCatalogId: newParentId || null,
    }
    const result = await onAddCatalog(payload)
    if (result && result.success) {
      showToast(result.message)
      setNewName('')
      setNewParentId('')
    } else {
      showToast((result && result.message) || 'Unable to add catalog', true)
    }
  }

  const handleDelete = async (id) => {
    const result = await onDeleteCatalog(id)
    if (result && result.success) {
      showToast(result.message)
    } else {
      showToast((result && result.message) || 'Unable to delete catalog', true)
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
    <div className="page active" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2>Catalogs</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
            Manage catalog tree
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={onRefresh}>Refresh</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 18 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <h3>Add catalog</h3>
          <input
            type="text"
            placeholder="Catalog name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ width: '100%', marginBottom: 8 }}
          />
          <select
            value={newParentId}
            onChange={(e) => setNewParentId(e.target.value)}
            style={{ width: '100%', marginBottom: 8 }}
          >
            <option value="">No parent</option>
            {flatCatalogs.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
          <button className="btn btn-accent" onClick={handleAddCatalog}>Add catalog</button>
        </div>

        <div>
          {flatCatalogs.length === 0 ? (
            <div className="empty">
              <div className="icon">📁</div>
              <p>No catalogs found</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {flatCatalogs.map((item) => (
                <div key={item.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.label}</div>
                  </div>
                  <button className="btn btn-sm btn-ghost" onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
