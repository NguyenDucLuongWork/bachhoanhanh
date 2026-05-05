import { useState, useEffect } from 'react'
import { ProductCard } from '../components/ProductCard'
import { ProductModal } from '../components/ProductModal'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { Loader } from '../components/Loader'
import { showToast } from '../components/Toast'

export function ProductsPage({ products, loading, onAddProduct, onUpdateProduct, onDeleteProduct, onRefresh, prototypes, catalogs, selectedCatalog, onSelectCatalog }) {
  const [filteredProducts, setFilteredProducts] = useState(products)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

  useEffect(() => {
    let filtered = products
    if (selectedCatalog) {
      const catalogPrototypes = prototypes.filter(p => p.catalogId === selectedCatalog).map(p => p.productId)
      filtered = filtered.filter(p => catalogPrototypes.includes(p.prototypeId))
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(p.productId).includes(searchQuery) ||
          (p.barcode && p.barcode.includes(searchQuery))
      )
    }
    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCatalog, prototypes])

  const handleAddProduct = async (productData) => {
    setModalLoading(true)
    const result = await onAddProduct(productData)
    if (result.success) {
      showToast(result.message)
      setIsAddModalOpen(false)
    } else {
      showToast(result.message, true)
    }
    setModalLoading(false)
  }

  const handleEditProduct = (product) => {
    setSelectedProduct(product)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async (productData) => {
    setModalLoading(true)
    const result = await onUpdateProduct(selectedProduct.productId, productData)
    if (result.success) {
      showToast(result.message)
      setIsEditModalOpen(false)
      setSelectedProduct(null)
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
    const result = await onDeleteProduct(deletingId)
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
          <h2>Products</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
            Manage your product catalog
          </p>
        </div>
        <button className="btn btn-accent" onClick={() => setIsAddModalOpen(true)}>
          + Add product
        </button>
      </div>

      {/* Catalog Tabs */}
      <div className="tabs" style={{ marginBottom: '20px' }}>
        <button
          className={`tab ${!selectedCatalog ? 'active' : ''}`}
          onClick={() => onSelectCatalog(null)}
        >
          All
        </button>
        {catalogs.map(catalog => (
          <button
            key={catalog.id}
            className={`tab ${selectedCatalog === catalog.id ? 'active' : ''}`}
            onClick={() => onSelectCatalog(catalog.id)}
          >
            {catalog.name}
          </button>
        ))}
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn btn-ghost" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty">
          <div className="icon">📦</div>
          <p style={{ fontSize: '14px' }}>No products found</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.productId}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <ProductModal
        isOpen={isAddModalOpen}
        title="Add product"
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddProduct}
        product={null}
        prototypes={prototypes}
      />

      <ProductModal
        isOpen={isEditModalOpen}
        title="Edit product"
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedProduct(null)
        }}
        onSave={handleSaveEdit}
        product={selectedProduct}
        prototypes={prototypes}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={modalLoading}
      />
    </div>
  )
}
