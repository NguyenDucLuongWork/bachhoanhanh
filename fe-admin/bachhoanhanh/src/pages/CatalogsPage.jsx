import { useMemo, useState } from 'react'
import { showToast } from '../components/Toast'
import { Loader } from '../components/Loader'

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
        if (item.children?.length) walk(item.children, label)
      })
    }
    walk(catalogs)
    return result
  }, [catalogs])

  const handleAddCatalog = async () => {
    if (!newName.trim()) {
      showToast('Catalog name is required', true)
      return
    }

    const result = await onAddCatalog({
      name: newName.trim(),
      parentCatalogId: newParentId || null,
    })

    if (result?.success) {
      showToast(result.message)
      setNewName('')
      setNewParentId('')
    } else {
      showToast(result?.message || 'Unable to add catalog', true)
    }
  }

  const handleDelete = async (id) => {
    const result = await onDeleteCatalog(id)
    if (result?.success) {
      showToast(result.message)
    } else {
      showToast(result?.message || 'Unable to delete catalog', true)
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
    <div className="page active admin-compact-page admin-catalogs-page">
      <div className="page-header">
        <div>
          <h2>Catalogs</h2>
          <p>Manage catalog tree</p>
        </div>
      </div>

      <div className="catalog-admin-layout">
        <div className="catalog-form-card">
          <div>
            <h3>Add catalog</h3>
            <p>Create a root catalog or attach it under an existing parent.</p>
          </div>
          <label>
            Catalog name
            <input
              type="text"
              placeholder="Example: Fresh food"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCatalog()}
            />
          </label>
          <label>
            Parent catalog
            <select value={newParentId} onChange={(e) => setNewParentId(e.target.value)}>
              <option value="">No parent - root catalog</option>
              {flatCatalogs.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <button className="btn btn-accent" onClick={handleAddCatalog}>
            Add catalog
          </button>
        </div>

        <div className="catalog-tree-panel">
          <div className="catalog-tree-header">
            <div>
              <strong>Catalog tree</strong>
              <span>{flatCatalogs.length} catalogs</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onRefresh}>
              Reload tree
            </button>
          </div>
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
