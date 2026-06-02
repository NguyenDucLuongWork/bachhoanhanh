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

function CatalogTreeNode({ item, depth = 0, onDelete }) {
  const children = item.children || []

  return (
    <div className="catalog-tree-node">
      <div className="catalog-tree-row" style={{ '--depth': depth }}>
        <div className="catalog-tree-main">
          <span className={children.length ? 'catalog-tree-toggle has-children' : 'catalog-tree-toggle'} />
          <div>
            <strong>{item.name}</strong>
            <span>{item.id}</span>
          </div>
        </div>
        <button className="btn btn-sm btn-ghost" onClick={() => onDelete(item.id)}>
          Delete
        </button>
      </div>
      {children.length > 0 && (
        <div className="catalog-tree-children">
          {children.map((child) => (
            <CatalogTreeNode key={child.id} item={child} depth={depth + 1} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
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
    <div className="page active admin-compact-page admin-catalogs-page" style={{ maxWidth: '1100px', margin: '0 auto' }}>
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
          {catalogs.length === 0 ? (
            <div className="empty">
              <p>No catalogs found</p>
            </div>
          ) : (
            <div className="catalog-tree">
              {catalogs.map((item) => (
                <CatalogTreeNode key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
