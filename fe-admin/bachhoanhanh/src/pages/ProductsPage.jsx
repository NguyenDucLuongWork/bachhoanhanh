import { useMemo, useState } from 'react'
import { ProductModal } from '../components/ProductModal'
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
  onRefresh,
  prototypes,
  catalogs,
  selectedCatalog,
  onSelectCatalog,
  onViewProduct,
  onViewBrand,
  getProductByBarcode,
  onSearchBrands,
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
  const [selectedProduct, setSelectedProduct] = useState(null)

  const selectedCatalogNode = selectedCatalog ? findCatalog(catalogs, selectedCatalog) : null
  const selectedIds = selectedCatalogNode ? collectCatalogIds(selectedCatalogNode) : []

  const getProductBrandName = (product) => {
    if (product.brandName) return product.brandName
    if (product.attributes && typeof product.attributes === 'object') {
      const brandKey = Object.keys(product.attributes).find((key) => String(key).trim().toUpperCase() === 'BRAND')
      return brandKey ? product.attributes[brandKey] : null
    }
    return null
  }

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    let result = products.filter((product) => {
      const matchesCatalog = !selectedCatalog || selectedIds.includes(product.catalogId)
      const matchesQuery =
        !normalizedQuery ||
        product.name?.toLowerCase().includes(normalizedQuery) ||
        product.barcode?.toLowerCase().includes(normalizedQuery)
      const matchesPrice = product.originalPrice >= priceMin && product.originalPrice <= priceMax
      return matchesCatalog && matchesQuery && matchesPrice
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
  }, [products, query, selectedCatalog, selectedIds, priceMin, priceMax, sortBy])

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
    const result = await onAddProduct(productData)
    if (result.success) {
      showToast(result.message)
      setIsAddModalOpen(false)
    } else {
      showToast(result.message, true)
    }
  }

  const handleSaveEdit = async (productData) => {
    const result = await onUpdateProduct(selectedProduct.productId, productData)
    if (result.success) {
      showToast(result.message)
      setIsEditModalOpen(false)
      setSelectedProduct(null)
    } else {
      showToast(result.message, true)
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
          <div className="store-filters">
            <div className="store-filter-group">
              <label>Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
            </div>

            <div className="store-filter-group">
              <label>Price:</label>
              <input 
                type="number" 
                min="0" 
                value={priceMin}
                onChange={(e) => setPriceMin(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="Min"
              />
              <span style={{ color: 'var(--muted)' }}>-</span>
              <input 
                type="number" 
                min="0" 
                value={priceMax}
                onChange={(e) => setPriceMax(Math.max(0, parseInt(e.target.value) || 1000000))}
                placeholder="Max"
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
            <div className="admin-product-table-wrap">
              <table className="admin-product-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Barcode</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Catalog</th>
                    <th className="text-center">Available</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr 
                      key={product.productId}
                      onClick={() => onViewProduct(product.productId)}
                    >
                      <td>{product.productId}</td>
                      <td className="mono-muted">{product.barcode || '-'}</td>
                      <td>
                        <div className="admin-product-name">
                          {product.image && (
                            <img 
                              src={product.image} 
                              alt={product.name}
                            />
                          )}
                          <span>{product.name}</span>
                        </div>
                      </td>
                      <td className="admin-product-description">
                        {product.description || '-'}
                      </td>
                      <td className="admin-product-price">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice || 0)}
                      </td>
                      <td className="muted-cell">{product.catalogId || '-'}</td>
                      <td className="text-center muted-cell">
                        {getAvailableAmount(product)}
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={(event) => {
                              event.stopPropagation()
                              setSelectedProduct(product)
                              setIsEditModalOpen(true)
                            }}
                          >
                            Edit
                          </button>
                          {!isAdminUser && (
                            <>
                              <button 
                                className="btn btn-ghost btn-sm"
                                onClick={() => onAddToCart?.(product)}
                              >
                                Cart
                              </button>
                              <button 
                                className="btn btn-accent btn-sm"
                                onClick={() => onBuyNow?.(product)}
                              >
                                Buy
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
        onSearchBrands={onSearchBrands}
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
        onSearchBrands={onSearchBrands}
        attributeTypes={attributeTypes}
      />

    </div>
  )
}
