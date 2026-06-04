import { useEffect, useMemo, useState } from 'react'
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

  // Refresh data when page becomes active
  useEffect(() => {
    onRefresh()
  }, [])

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
            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: 'var(--card-bg)',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: 'var(--elevated-bg)',
                    borderBottom: '2px solid var(--border)'
                  }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>ID</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>Barcode</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>Name</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>Description</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>Price</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>Catalog</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>Available</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr 
                      key={product.productId}
                      style={{ 
                        borderBottom: '1px solid var(--border)',
                        backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--elevated-bg)',
                        transition: 'background-color 0.2s',
                        cursor: 'pointer'
                      }}
                      onClick={() => onViewProduct(product.productId)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'transparent' : 'var(--elevated-bg)'}
                    >
                      <td style={{ padding: '12px 16px', fontSize: '13px' }}>{product.productId}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontFamily: 'monospace', color: 'var(--muted)' }}>{product.barcode || '-'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {product.image && (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }}
                            />
                          )}
                          <span>{product.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {product.description || '-'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '500' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.originalPrice || 0)}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--muted)' }}>{product.catalogId || '-'}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', color: 'var(--muted)' }}>
                        {getAvailableAmount(product)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <button 
                            className="btn btn-ghost"
                            onClick={(event) => {
                              event.stopPropagation()
                              setSelectedProduct(product)
                              setIsEditModalOpen(true)
                            }}
                            style={{ padding: '4px 8px', fontSize: '12px', minWidth: 'auto' }}
                          >
                            Edit
                          </button>
                          {!isAdminUser && (
                            <>
                              <button 
                                className="btn btn-ghost"
                                onClick={() => onAddToCart?.(product)}
                                style={{ padding: '4px 8px', fontSize: '12px', minWidth: 'auto' }}
                              >
                                Cart
                              </button>
                              <button 
                                className="btn btn-accent"
                                onClick={() => onBuyNow?.(product)}
                                style={{ padding: '4px 8px', fontSize: '12px', minWidth: 'auto' }}
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
