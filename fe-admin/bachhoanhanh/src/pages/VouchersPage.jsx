import { useMemo, useState } from 'react'
import { formatPrice } from '../utils/helpers'
import { showToast } from '../components/Toast'
import { Loader } from '../components/Loader'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'

const emptyVoucher = {
  code: '',
  description: '',
  discountType: 'PERCENT',
  discountValue: 0,
  minOrderValue: 0,
  maxDiscountAmount: 0,
  usageLimit: 0,
  startDate: '',
  endDate: '',
  active: true,
  targetType: 'global',
  targetProductId: '',
  targetCatalogId: '',
}

function formatLocalDatetime(value) {
  if (!value) return ''
  return value.slice(0, 16)
}

function normalizeDatetimeInput(value) {
  if (!value) return ''
  return value.length === 16 ? `${value}:00` : value
}

function flattenCatalogs(catalogs) {
  const result = []
  const walk = (items, prefix = '') => {
    items.forEach((item) => {
      const label = prefix ? `${prefix} / ${item.name}` : item.name
      result.push({ id: item.id, label })
      if (Array.isArray(item.children) && item.children.length > 0) {
        walk(item.children, label)
      }
    })
  }
  walk(catalogs)
  return result
}

export function VouchersPage({ vouchers, loading, products, catalogs, onRefresh, onCreateVoucher, onUpdateVoucher, onDeleteVoucher, onSearchVoucherById, onSearchVoucherByCode }) {
  const [voucherForm, setVoucherForm] = useState(emptyVoucher)
  const [editingVoucher, setEditingVoucher] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingVoucherId, setDeletingVoucherId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResult, setSearchResult] = useState(null)

  const catalogOptions = useMemo(() => flattenCatalogs(catalogs || []), [catalogs])

  const openAdd = () => {
    setEditingVoucher(null)
    setVoucherForm(emptyVoucher)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingVoucher(null)
    setVoucherForm(emptyVoucher)
  }

  const openEdit = (voucher) => {
    setEditingVoucher(voucher)
    let targetType = 'global'
    if (voucher.targetProductId) targetType = 'product'
    else if (voucher.targetCatalogId) targetType = 'catalog'
    setVoucherForm({
      code: voucher.code || '',
      description: voucher.description || '',
      discountType: voucher.discountType || 'PERCENT',
      discountValue: voucher.discountValue || 0,
      minOrderValue: voucher.minOrderValue || 0,
      maxDiscountAmount: voucher.maxDiscountAmount || 0,
      usageLimit: voucher.usageLimit || 0,
      startDate: formatLocalDatetime(voucher.startDate),
      endDate: formatLocalDatetime(voucher.endDate),
      active: !!voucher.active,
      targetType,
      targetProductId: voucher.targetProductId ?? '',
      targetCatalogId: voucher.targetCatalogId ?? '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    setDeletingVoucherId(id)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = async () => {
    setSaving(true)
    const result = await onDeleteVoucher(deletingVoucherId)
    if (result.success) {
      showToast(result.message)
    } else {
      showToast(result.message, true)
    }
    setSaving(false)
    setIsDeleteOpen(false)
    setDeletingVoucherId(null)
  }

  const handleSave = async () => {
    if (!voucherForm.code.trim()) {
      showToast('Voucher code is required', true)
      return
    }
    if (!voucherForm.description.trim()) {
      showToast('Description is required', true)
      return
    }
    if (!voucherForm.discountValue || Number(voucherForm.discountValue) < 0) {
      showToast('Discount value must be a valid number', true)
      return
    }
    if (!voucherForm.startDate || !voucherForm.endDate) {
      showToast('Start and end dates are required', true)
      return
    }

    const payload = {
      code: voucherForm.code.trim().toUpperCase(),
      description: voucherForm.description.trim(),
      discountType: voucherForm.discountType,
      discountValue: Number(voucherForm.discountValue),
      minOrderValue: Number(voucherForm.minOrderValue) || 0,
      maxDiscountAmount: Number(voucherForm.maxDiscountAmount) || 0,
      usageLimit: Number(voucherForm.usageLimit) || 0,
      startDate: normalizeDatetimeInput(voucherForm.startDate),
      endDate: normalizeDatetimeInput(voucherForm.endDate),
      active: voucherForm.active,
      targetProductId: voucherForm.targetType === 'product' && voucherForm.targetProductId ? Number(voucherForm.targetProductId) : null,
      targetCatalogId: voucherForm.targetType === 'catalog' ? voucherForm.targetCatalogId || null : null,
    }

    setSaving(true)
    const result = editingVoucher
      ? await onUpdateVoucher(editingVoucher.id, payload)
      : await onCreateVoucher(payload)

    if (result.success) {
      showToast(result.message)
      closeModal()
    } else {
      showToast(result.message, true)
    }
    setSaving(false)
  }

  const handleSearch = async () => {
    const term = searchTerm.trim()
    if (!term) {
      setSearchResult(null)
      await onRefresh()
      return
    }

    if (/^\d+$/.test(term)) {
      const result = await onSearchVoucherById(term)
      if (result.success) {
        setSearchResult(result.data)
      } else {
        showToast(result.message, true)
        setSearchResult(null)
      }
      return
    }

    const result = await onSearchVoucherByCode(term)
    if (result.success) {
      setSearchResult(result.data)
    } else {
      showToast(result.message, true)
      setSearchResult(null)
    }
  }

  const handleResetSearch = async () => {
    setSearchTerm('')
    setSearchResult(null)
    await onRefresh()
  }

  if (loading) {
    return (
      <div className="page active">
        <Loader />
      </div>
    )
  }

  return (
    <div className="page active commerce-shell">
      <section className="store-hero">
        <div>
          <span className="eyebrow">Voucher management</span>
          <h1>Manage vouchers</h1>
          <p>Create, update and apply promotional codes for orders.</p>
        </div>
        <div className="hero-metrics">
          <div>
            <strong>{vouchers.length}</strong>
            <span>Vouchers</span>
          </div>
          <div>
            <strong>Admin</strong>
            <span>Access</span>
          </div>
          <div>
            <strong>Codes</strong>
            <span>Promotions</span>
          </div>
        </div>
      </section>

      <section className="store-layout">
        <div className="store-toolbar" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
          <div>Voucher management console</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by voucher code or id"
              style={{ padding: '8px 10px', minWidth: '220px' }}
            />
            <button className="btn btn-ghost" onClick={handleSearch}>Search</button>
            <button className="btn btn-ghost" onClick={handleResetSearch}>Reset</button>
            <button className="btn btn-ghost" onClick={() => onRefresh()}>Refresh</button>
            <button className="btn btn-accent" onClick={openAdd}>Add voucher</button>
          </div>
        </div>

        {searchResult && (
          <div className="search-result" style={{ marginBottom: '16px', padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <h3>Search result</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div><strong>ID</strong> {searchResult.id}</div>
              <div><strong>Code</strong> {searchResult.code}</div>
              <div><strong>Type</strong> {searchResult.discountType}</div>
              <div><strong>Value</strong> {formatPrice(searchResult.discountValue)}{searchResult.discountType === 'PERCENT' ? '%' : ' VND'}</div>
              <div><strong>Active</strong> {searchResult.active ? 'Yes' : 'No'}</div>
              <div><strong>Target product</strong> {searchResult.targetProductId ?? 'None'}</div>
              <div><strong>Target catalog</strong> {searchResult.targetCatalogId || 'None'}</div>
              <div><strong>Valid</strong> {searchResult.startDate} → {searchResult.endDate}</div>
            </div>
          </div>
        )}

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Code</th>
                <th>Description</th>
                <th>Discount</th>
                <th>Min order</th>
                <th>Target</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    No vouchers available.
                  </td>
                </tr>
              ) : (
                vouchers.map((voucher) => (
                  <tr key={voucher.id}>
                    <td>{voucher.id}</td>
                    <td>{voucher.code}</td>
                    <td style={{ maxWidth: '240px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{voucher.description}</td>
                    <td>
                      {voucher.discountType === 'PERCENT'
                        ? `${voucher.discountValue}%`
                        : `${formatPrice(voucher.discountValue)} VND`}
                    </td>
                    <td>{formatPrice(voucher.minOrderValue)} VND</td>
                    <td>
                      {voucher.targetProductId ? `Product ${voucher.targetProductId}` : voucher.targetCatalogId ? `Catalog ${voucher.targetCatalogId}` : 'Global'}
                    </td>
                    <td>{voucher.active ? 'Yes' : 'No'}</td>
                    <td style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button className="btn btn-ghost" onClick={() => openEdit(voucher)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(voucher.id)}>Delete</button>
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingVoucher ? 'Edit voucher' : 'Add voucher'}</h2>
            <div className="modal-body">
              <label>
                Code
                <input
                  type="text"
                  value={voucherForm.code}
                  onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value })}
                />
              </label>
              <label>
                Description
                <textarea
                  rows={3}
                  value={voucherForm.description}
                  onChange={(e) => setVoucherForm({ ...voucherForm, description: e.target.value })}
                />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>
                  Discount type
                  <select
                    value={voucherForm.discountType}
                    onChange={(e) => setVoucherForm({ ...voucherForm, discountType: e.target.value })}
                  >
                    <option value="PERCENT">PERCENT</option>
                    <option value="FIXED">FIXED</option>
                  </select>
                </label>
                <label>
                  Discount value
                  <input
                    type="number"
                    value={voucherForm.discountValue}
                    onChange={(e) => setVoucherForm({ ...voucherForm, discountValue: e.target.value })}
                    min="0"
                  />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>
                  Minimum order value
                  <input
                    type="number"
                    value={voucherForm.minOrderValue}
                    onChange={(e) => setVoucherForm({ ...voucherForm, minOrderValue: e.target.value })}
                    min="0"
                  />
                </label>
                <label>
                  Max discount amount
                  <input
                    type="number"
                    value={voucherForm.maxDiscountAmount}
                    onChange={(e) => setVoucherForm({ ...voucherForm, maxDiscountAmount: e.target.value })}
                    min="0"
                  />
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>
                  Usage limit
                  <input
                    type="number"
                    value={voucherForm.usageLimit}
                    onChange={(e) => setVoucherForm({ ...voucherForm, usageLimit: e.target.value })}
                    min="0"
                  />
                </label>
                <label>
                  Active
                  <select
                    value={voucherForm.active ? 'true' : 'false'}
                    onChange={(e) => setVoucherForm({ ...voucherForm, active: e.target.value === 'true' })}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </label>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label>
                  Start date
                  <input
                    type="datetime-local"
                    value={voucherForm.startDate}
                    onChange={(e) => setVoucherForm({ ...voucherForm, startDate: e.target.value })}
                  />
                </label>
                <label>
                  End date
                  <input
                    type="datetime-local"
                    value={voucherForm.endDate}
                    onChange={(e) => setVoucherForm({ ...voucherForm, endDate: e.target.value })}
                  />
                </label>
              </div>
              <label>
                Target type
                <select
                  value={voucherForm.targetType}
                  onChange={(e) => setVoucherForm({ 
                    ...voucherForm, 
                    targetType: e.target.value,
                    targetProductId: '',
                    targetCatalogId: ''
                  })}
                >
                  <option value="global">Global (No target)</option>
                  <option value="product">Specific product</option>
                  <option value="catalog">Catalog</option>
                </select>
              </label>
              {voucherForm.targetType === 'product' && (
                <label>
                  Target product
                  <select
                    value={voucherForm.targetProductId}
                    onChange={(e) => setVoucherForm({ ...voucherForm, targetProductId: e.target.value })}
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.productId} value={product.productId}>
                        {product.name} ({product.productId})
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {voucherForm.targetType === 'catalog' && (
                <label>
                  Target catalog
                  <select
                    value={voucherForm.targetCatalogId}
                    onChange={(e) => setVoucherForm({ ...voucherForm, targetCatalogId: e.target.value })}
                  >
                    <option value="">Select a catalog</option>
                    {catalogOptions.map((catalog) => (
                      <option key={catalog.id} value={catalog.id}>
                        {catalog.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal} disabled={saving}>
                Cancel
              </button>
              <button className="btn btn-accent" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save voucher'}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={saving}
      />
    </div>
  )
}
