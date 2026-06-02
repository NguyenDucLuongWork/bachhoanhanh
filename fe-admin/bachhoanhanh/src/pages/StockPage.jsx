import { useMemo, useState } from 'react'
import { Loader } from '../components/Loader'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { showToast } from '../components/Toast'

const emptyStockForm = {
  productId: '',
  amount: '',
  available: true,
  importDate: '',
  manufactureDate: '',
  expiryDate: '',
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

export function StockPage({
  stocks,
  loading,
  onRefresh,
  onCreateStock,
  onUpdateStock,
  onDeleteStock,
  products = [],
  onViewProductByBarcode,
}) {
  const [searchBarcode, setSearchBarcode] = useState('')
  const [showUnavailableOnly, setShowUnavailableOnly] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [stockForm, setStockForm] = useState(emptyStockForm)
  const [editingStock, setEditingStock] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingStockId, setDeletingStockId] = useState(null)

  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const matchesBarcode = searchBarcode.trim()
        ? String(stock.productId).includes(searchBarcode.trim())
        : true
      const matchesUnavailable = showUnavailableOnly ? stock.available === false : true
      return matchesBarcode && matchesUnavailable
    })
  }, [stocks, searchBarcode, showUnavailableOnly])

  const openAddStock = () => {
    setEditingStock(null)
    setStockForm(emptyStockForm)
    setIsModalOpen(true)
  }

  const openEditStock = (stock) => {
    setEditingStock(stock)
    setStockForm({
      productId: stock.productId || '',
      amount: String(stock.amount || ''),
      available: Boolean(stock.available),
      importDate: stock.importDate || '',
      manufactureDate: stock.manufactureDate || '',
      expiryDate: stock.expiryDate || '',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingStock(null)
    setStockForm(emptyStockForm)
  }

  const handleSaveStock = async () => {
    if (!stockForm.productId.trim()) {
      showToast('Product barcode is required', true)
      return
    }
    if (!stockForm.amount || Number(stockForm.amount) <= 0) {
      showToast('Amount must be greater than zero', true)
      return
    }

    setIsSaving(true)
    const payload = {
      productId: stockForm.productId.trim(),
      amount: Number(stockForm.amount),
      available: Boolean(stockForm.available),
      importDate: stockForm.importDate || undefined,
      manufactureDate: stockForm.manufactureDate || undefined,
      expiryDate: stockForm.expiryDate || undefined,
    }

    const result = editingStock
      ? await onUpdateStock(editingStock.id, payload)
      : await onCreateStock(payload)

    if (result.success) {
      showToast(editingStock ? 'Stock updated' : 'Stock created')
      closeModal()
      await onRefresh(searchBarcode)
    } else {
      showToast(result.message || 'Unable to save stock', true)
    }
    setIsSaving(false)
  }

  const handleConfirmDelete = async () => {
    if (!deletingStockId) return
    const result = await onDeleteStock(deletingStockId)
    if (result.success) {
      showToast('Stock deleted')
      setIsDeleteOpen(false)
      setDeletingStockId(null)
      await onRefresh(searchBarcode)
    } else {
      showToast(result.message || 'Unable to delete stock', true)
    }
  }

  const getProductName = (barcode) => products.find((product) => product.barcode === barcode)?.name || 'Unknown'

  if (loading) {
    return (
      <div className="page active">
        <Loader />
      </div>
    )
  }

  return (
    <section className="page active commerce-shell stock-page">
      <header className="page-header">
        <h1>Stock management</h1>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => onRefresh(searchBarcode)} disabled={loading}>
            Refresh stocks
          </button>
          <button className="btn btn-accent" onClick={openAddStock}>
            Add stock
          </button>
        </div>
      </header>

      <div className="panel panel-flat">
        <div className="panel-body">
          <div className="form-row">
            <label htmlFor="stock-filter-barcode">Barcode</label>
            <input
              id="stock-filter-barcode"
              type="text"
              value={searchBarcode}
              onChange={(event) => setSearchBarcode(event.target.value)}
              placeholder="Filter by product barcode"
            />
            <button className="btn btn-secondary" onClick={() => onRefresh(searchBarcode)}>
              Search
            </button>
          </div>
          <div className="form-row">
            <label>
              <input
                type="checkbox"
                checked={showUnavailableOnly}
                onChange={(event) => setShowUnavailableOnly(event.target.checked)}
              />
              Show unavailable only
            </label>
          </div>
        </div>
      </div>

      <div className="panel panel-flat">
        <div className="panel-body">
          {filteredStocks.length === 0 ? (
            <div className="empty">
              <p>No stock records found.</p>
            </div>
          ) : (
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Barcode</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Available</th>
                    <th>Import date</th>
                    <th>Manufacture date</th>
                    <th>Expiry date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((stock) => (
                    <tr key={stock.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td>{stock.id || '-'}</td>
                      <td>{stock.productId || '-'}</td>
                      <td>
                        <button className="btn btn-link" onClick={() => onViewProductByBarcode?.(stock.productId)}>
                          {getProductName(stock.productId)}
                        </button>
                      </td>
                      <td>{stock.amount ?? '-'}</td>
                      <td>{stock.available ? 'Yes' : 'No'}</td>
                      <td>{formatDate(stock.importDate)}</td>
                      <td>{formatDate(stock.manufactureDate)}</td>
                      <td>{formatDate(stock.expiryDate)}</td>
                      <td style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button className="btn btn-ghost" onClick={() => openEditStock(stock)}>
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => {
                            setDeletingStockId(stock.id)
                            setIsDeleteOpen(true)
                          }}
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
      </div>

      {isModalOpen && (
        <div className="modal-bg open" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <h2>{editingStock ? 'Edit stock' : 'Add stock'}</h2>
            <div className="modal-body" style={{ display: 'grid', gap: '12px' }}>
              <label>
                Barcode
                <input
                  type="text"
                  value={stockForm.productId}
                  onChange={(event) => setStockForm({ ...stockForm, productId: event.target.value })}
                />
              </label>
              <label>
                Amount
                <input
                  type="number"
                  min="0"
                  value={stockForm.amount}
                  onChange={(event) => setStockForm({ ...stockForm, amount: event.target.value })}
                />
              </label>
              <label>
                Available
                <select
                  value={stockForm.available ? 'true' : 'false'}
                  onChange={(event) => setStockForm({ ...stockForm, available: event.target.value === 'true' })}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>
              <label>
                Import date
                <input
                  type="date"
                  value={stockForm.importDate}
                  onChange={(event) => setStockForm({ ...stockForm, importDate: event.target.value })}
                />
              </label>
              <label>
                Manufacture date
                <input
                  type="date"
                  value={stockForm.manufactureDate}
                  onChange={(event) => setStockForm({ ...stockForm, manufactureDate: event.target.value })}
                />
              </label>
              <label>
                Expiry date
                <input
                  type="date"
                  value={stockForm.expiryDate}
                  onChange={(event) => setStockForm({ ...stockForm, expiryDate: event.target.value })}
                />
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal} disabled={isSaving}>
                Cancel
              </button>
              <button className="btn btn-accent" onClick={handleSaveStock} disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false)
          setDeletingStockId(null)
        }}
        onConfirm={handleConfirmDelete}
        isLoading={false}
      />
    </section>
  )
}
