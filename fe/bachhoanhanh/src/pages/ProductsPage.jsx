import { useMemo, useState } from 'react'
import { ProductCard } from '../components/ProductCard'
import { ProductModal } from '../components/ProductModal'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { Loader } from '../components/Loader'
import { showToast } from '../components/Toast'
import { getAvailableAmount } from '../utils/helpers'

const findCatalog = (nodes, id) => {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = node.children?.length ? findCatalog(node.children, id) : null
    if (found) return found
  }
  return null
}

const collectCatalogIds = (node) => {
  if (!node) return []
  return [node.id, ...(node.children || []).flatMap(collectCatalogIds)]
}

export function ProductsPage({
  products,
  loading,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRefresh,
  prototypes,
  catalogs,
  selectedCatalog,
  onSelectCatalog,
  onViewProduct,
  getProductByBarcode,
  attributeTypes,
  isAdminUser,
  onAddToCart,
  onBuyNow,
}) {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('name') // name, price-asc, price-desc
  const [priceMin, setPriceMin] = useState(0)
  const [priceMax, setPriceMax] = useState(1000000)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

  const selectedCatalogNode = selectedCatalog ? findCatalog(catalogs, selectedCatalog) : null
  const selectedIds = selectedCatalogNode ? collectCatalogIds(selectedCatalogNode) : []

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    let result = products.filter((product) => {
      const isVisibleToCustomer = isAdminUser || getAvailableAmount(product) > 0
      const matchesCatalog = !selectedCatalog || selectedIds.includes(product.catalogId)
      const matchesQuery =
        !normalizedQuery ||
        product.name?.toLowerCase().includes(normalizedQuery) ||
        product.barcode?.toLowerCase().includes(normalizedQuery)
      const matchesPrice = product.originalPrice >= priceMin && product.originalPrice <= priceMax
      return isVisibleToCustomer && matchesCatalog && matchesQuery && matchesPrice
    })

    // Apply sorting
    if (sortBy === 'name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.originalPrice || 0) - (b.originalPrice || 0))
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.originalPrice || 0) - (a.originalPrice || 0))
    }

    return result
  }, [products, query, selectedCatalog, selectedIds, priceMin, priceMax, sortBy, isAdminUser])

  const handleBarcodeSearch = async () => {
    if (!query.trim() || !/^\d+$/.test(query.trim())) return
    const result = await getProductByBarcode(query.trim())
    if (result.success) {
      onViewProduct(result.data.productId)
    } else {
      showToast(result.message, true)
    }
  }

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
    <div className="page active commerce-shell">
      <section className="store-hero">
        <div>
          <span className="eyebrow">{isAdminUser ? 'Operations workspace' : 'Same-day grocery delivery'}</span>
          <h1>{isAdminUser ? 'Manage the product catalog' : 'Fresh groceries, household goods, and daily essentials.'}</h1>
          <p>
            {isAdminUser
              ? 'Create, update, and audit catalog items while customers continue shopping from the storefront.'
              : 'Browse curated categories, add items to cart, and place orders through the existing microservice APIs.'}
          </p>
        </div>
        <div className="hero-metrics">
          <div>
            <strong>{products.length}</strong>
            <span>Products</span>
          </div>
          <div>
            <strong>{catalogs.length}</strong>
            <span>Categories</span>
          </div>
          <div>
            <strong>Fast</strong>
            <span>Checkout</span>
          </div>
        </div>
      </section>

      <section className="store-layout">
        <aside className="catalog-panel">
          <div className="panel-title">Categories</div>
          <button className={!selectedCatalog ? 'catalog-link active' : 'catalog-link'} onClick={() => onSelectCatalog(null)}>
            All products
          </button>
          {catalogs.map((catalog) => (
            <div key={catalog.id} className="catalog-group">
              <button
                className={selectedCatalog === catalog.id ? 'catalog-link active' : 'catalog-link'}
                onClick={() => onSelectCatalog(catalog.id)}
              >
                {catalog.name}
              </button>
              {catalog.children?.map((child) => (
                <button
                  key={child.id}
                  className={selectedCatalog === child.id ? 'catalog-link child active' : 'catalog-link child'}
                  onClick={() => onSelectCatalog(child.id)}
                >
                  {child.name}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <div className="store-main">
          <div className="store-toolbar">
            <div className="store-search">
              <input
                type="text"
                placeholder="Search products or barcode"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleBarcodeSearch()
                }}
              />
              <button className="btn btn-ghost" onClick={handleBarcodeSearch}>
                Search
              </button>
            </div>
            <div className="toolbar-actions">
              <button className="btn btn-ghost" onClick={onRefresh}>
                Refresh
              </button>
              {isAdminUser && (
                <button className="btn btn-accent" onClick={() => setIsAddModalOpen(true)}>
                  Add product
                </button>
              )}
            </div>
          </div>

          {/* Filters and Sort */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>Price:</label>
              <input 
                type="number" 
                min="0" 
                value={priceMin}
                onChange={(e) => setPriceMin(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="Min"
                style={{ width: '80px', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border)' }}
              />
              <span style={{ color: 'var(--muted)' }}>-</span>
              <input 
                type="number" 
                min="0" 
                value={priceMax}
                onChange={(e) => setPriceMax(Math.max(0, parseInt(e.target.value) || 1000000))}
                placeholder="Max"
                style={{ width: '80px', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border)' }}
              />
            </div>

            {(sortBy !== 'name' || priceMin > 0 || priceMax < 1000000) && (
              <button 
                className="btn btn-ghost"
                onClick={() => {
                  setSortBy('name')
                  setPriceMin(0)
                  setPriceMax(1000000)
                }}
                style={{ fontSize: '12px' }}
              >
                Clear filters
              </button>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty">
              <div className="icon">No items</div>
              <p style={{ fontSize: '14px' }}>No products match your filters.</p>
            </div>
          ) : (
            <div className="store-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onView={onViewProduct}
                  onEdit={(item) => {
                    setSelectedProduct(item)
                    setIsEditModalOpen(true)
                  }}
                  onDelete={(id) => {
                    setDeletingId(id)
                    setIsDeleteModalOpen(true)
                  }}
                  isAdminUser={isAdminUser}
                  onAddToCart={onAddToCart}
                  onBuyNow={onBuyNow}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <ProductModal
        isOpen={isAddModalOpen}
        title="Add product"
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddProduct}
        product={null}
        prototypes={prototypes}
        catalogs={catalogs}
        attributeTypes={attributeTypes}
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
        catalogs={catalogs}
        attributeTypes={attributeTypes}
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
