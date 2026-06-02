import { useMemo, useState } from 'react'
import { Loader } from '../components/Loader'
import { showToast } from '../components/Toast'

const emptyForm = {
  productId: '',
  name: '',
  catalogId: '',
  attributeTypeNames: [],
}

function unpackAttributes(prototype) {
  if (Array.isArray(prototype.attributeTypeNames) && prototype.attributeTypeNames.length > 0) {
    return prototype.attributeTypeNames
  }
  if (!prototype.packedAttributes) return []
  return prototype.packedAttributes.split(',').filter(Boolean)
}

export function PrototypesPage({
  prototypes,
  loading,
  catalogs,
  attributeTypes,
  onRefresh,
  onCreatePrototype,
  onUpdatePrototypeInfo,
  onUpdatePrototypeAttributes,
  onAddAttribute,
  onRemoveAttribute,
  onDeletePrototype,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [catalogFilter, setCatalogFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const filteredPrototypes = useMemo(() => {
    return prototypes.filter((prototype) => {
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        prototype.productId?.toLowerCase().includes(query) ||
        prototype.name?.toLowerCase().includes(query)
      const matchesCatalog = catalogFilter === 'all' || prototype.catalogId === catalogFilter
      return matchesSearch && matchesCatalog
    })
  }, [prototypes, searchQuery, catalogFilter])

  const stats = useMemo(() => {
    const catalogCount = new Set(prototypes.map((prototype) => prototype.catalogId).filter(Boolean)).size
    const attributeCount = prototypes.reduce((sum, prototype) => sum + unpackAttributes(prototype).length, 0)
    return {
      total: prototypes.length,
      catalogs: catalogCount,
      attributes: attributeCount,
    }
  }, [prototypes])

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const startEdit = (prototype) => {
    setEditingId(prototype.productId)
    setForm({
      productId: prototype.productId || '',
      name: prototype.name || '',
      catalogId: prototype.catalogId || '',
      attributeTypeNames: unpackAttributes(prototype),
    })
  }

  const toggleAttribute = (name) => {
    setForm((prev) => {
      const selected = prev.attributeTypeNames.includes(name)
      return {
        ...prev,
        attributeTypeNames: selected
          ? prev.attributeTypeNames.filter((item) => item !== name)
          : [...prev.attributeTypeNames, name],
      }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.productId.trim() || !form.name.trim() || !form.catalogId.trim()) {
      showToast('Prototype ID, name and catalog are required', true)
      return
    }

    setSaving(true)
    const payload = {
      productId: form.productId.trim(),
      name: form.name.trim(),
      catalogId: form.catalogId.trim(),
      attributeTypeNames: form.attributeTypeNames,
    }

    const result = editingId
      ? await updateExistingPrototype(payload)
      : await onCreatePrototype(payload)

    showToast(result.message || (result.success ? 'Prototype saved' : 'Save failed'), !result.success)
    if (result.success) resetForm()
    setSaving(false)
  }

  const updateExistingPrototype = async (payload) => {
    const infoResult = await onUpdatePrototypeInfo(editingId, {
      name: payload.name,
      catalogId: payload.catalogId,
    })
    if (!infoResult.success) return infoResult

    return onUpdatePrototypeAttributes(editingId, {
      attributeTypeNames: payload.attributeTypeNames,
    })
  }

  const handleQuickAddAttribute = async (prototype, typeName) => {
    if (!typeName) return
    const result = await onAddAttribute(prototype.productId, typeName)
    showToast(result.message || 'Attribute added', !result.success)
  }

  const handleRemoveAttribute = async (prototype, typeName) => {
    const result = await onRemoveAttribute(prototype.productId, typeName)
    showToast(result.message || 'Attribute removed', !result.success)
  }

  const handleDelete = async (prototype) => {
    const result = await onDeletePrototype(prototype.productId)
    showToast(result.message || 'Prototype deleted', !result.success)
    if (editingId === prototype.productId) resetForm()
  }

  if (loading) {
    return (
      <div className="page active">
        <Loader />
      </div>
    )
  }

  return (
    <div className="page active admin-compact-page admin-prototypes-page">
      <div className="page-header">
        <div>
          <h2>Prototype management</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
            Manage product templates and required attribute types.
          </p>
        </div>
        <button className="btn btn-ghost" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      <div className="order-stats-grid">
        <div className="order-stat-tile">
          <span>Total prototypes</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="order-stat-tile">
          <span>Catalogs covered</span>
          <strong>{stats.catalogs}</strong>
        </div>
        <div className="order-stat-tile">
          <span>Attributes used</span>
          <strong>{stats.attributes}</strong>
        </div>
      </div>

      <div className="prototype-layout">
        <form className="prototype-form" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit prototype' : 'Create prototype'}</h3>
          <div className="field">
            <label>Prototype ID</label>
            <input
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              disabled={!!editingId}
              placeholder="Example: FROZEN_FOOD"
            />
          </div>
          <div className="field">
            <label>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Display name"
            />
          </div>
          <div className="field">
            <label>Catalog</label>
            <select value={form.catalogId} onChange={(e) => setForm({ ...form, catalogId: e.target.value })}>
              <option value="">Select catalog</option>
              {catalogs.map((catalog) => (
                <option key={catalog.id} value={catalog.id}>
                  {catalog.name || catalog.id}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Attributes</label>
            <div className="prototype-attribute-picker">
              {attributeTypes.map((attribute) => (
                <label key={attribute.name}>
                  <input
                    type="checkbox"
                    checked={form.attributeTypeNames.includes(attribute.name)}
                    onChange={() => toggleAttribute(attribute.name)}
                  />
                  <span>{attribute.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="prototype-form-actions">
            <button className="btn btn-accent" type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update prototype' : 'Create prototype'}
            </button>
            {editingId && (
              <button className="btn btn-ghost" type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="prototype-table-panel">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by ID or name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="admin-order-filter"
              value={catalogFilter}
              onChange={(e) => setCatalogFilter(e.target.value)}
            >
              <option value="all">All catalogs</option>
              {catalogs.map((catalog) => (
                <option key={catalog.id} value={catalog.id}>
                  {catalog.name || catalog.id}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-table-wrap">
            <table className="data-table admin-prototypes-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Catalog</th>
                  <th>Attributes</th>
                  <th>Quick add</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrototypes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="admin-orders-empty">
                      No prototypes found
                    </td>
                  </tr>
                ) : (
                  filteredPrototypes.map((prototype) => {
                    const attributes = unpackAttributes(prototype)
                    return (
                      <tr key={prototype.productId}>
                        <td>{prototype.productId}</td>
                        <td>{prototype.name}</td>
                        <td>{prototype.catalogId}</td>
                        <td>
                          <div className="prototype-chip-list">
                            {attributes.length === 0 ? (
                              <span className="prototype-muted">No attributes</span>
                            ) : (
                              attributes.map((typeName) => (
                                <button
                                  key={typeName}
                                  type="button"
                                  onClick={() => handleRemoveAttribute(prototype, typeName)}
                                  title="Remove attribute"
                                >
                                  {typeName}
                                </button>
                              ))
                            )}
                          </div>
                        </td>
                        <td>
                          <select
                            className="admin-status-select"
                            value=""
                            onChange={(e) => handleQuickAddAttribute(prototype, e.target.value)}
                          >
                            <option value="">Select attribute</option>
                            {attributeTypes
                              .filter((attribute) => !attributes.includes(attribute.name))
                              .map((attribute) => (
                                <option key={attribute.name} value={attribute.name}>
                                  {attribute.name}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td>
                          <div className="admin-order-actions">
                            <button className="btn btn-ghost btn-sm" type="button" onClick={() => startEdit(prototype)}>
                              Edit
                            </button>
                            <button className="btn btn-danger btn-sm" type="button" onClick={() => handleDelete(prototype)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
