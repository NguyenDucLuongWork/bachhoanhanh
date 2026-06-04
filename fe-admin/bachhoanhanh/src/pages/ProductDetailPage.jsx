import { useEffect, useState } from 'react'
import { Loader } from '../components/Loader'
import { formatPrice, getAvailableAmount } from '../utils/helpers'
import { useStocks } from '../hooks/useStocks'

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

export function ProductDetailPage({ productId, getProductById, onBack, isAdminUser, onAddToCart, onBuyNow, onViewBrand, products = [] }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const { stocks: productStocks, loading: productStocksLoading, loadStocks } = useStocks()

  useEffect(() => {
    if (!productId) return

    let cancelled = false
    const productFromList = products.find((item) => String(item.productId) === String(productId))
    if (productFromList) {
      // If the product in the list lacks attributes/brand details, fetch full details
      const lacksAttributes = !productFromList.attributes || (typeof productFromList.attributes === 'object' && Object.keys(productFromList.attributes || {}).length === 0)
      const lacksBrand = !productFromList.brandId && !productFromList.brandName && !productFromList.brandDescription
      if ((lacksAttributes || lacksBrand) && getProductById) {
        const loadProduct = async () => {
          setLoading(true)
          const result = await getProductById(productId)
          if (!cancelled) {
            if (result.success) setProduct(result.data)
            else setProduct(productFromList)
            setQuantity(1)
            setLoading(false)
          }
        }
        loadProduct()
        return () => { cancelled = true }
      }

      setProduct(productFromList)
      setQuantity(getAvailableAmount(productFromList) > 0 ? 1 : 0)
      return
    }

    const loadProduct = async () => {
      setLoading(true)
      setError(null)
      const result = await getProductById(productId)
      if (result.success) {
        setProduct(result.data)
        setQuantity(getAvailableAmount(result.data) > 0 ? 1 : 0)
      } else {
        setError(result.message)
      }
      setLoading(false)
    }

    loadProduct()
  }, [productId, getProductById, products])

  useEffect(() => {
    if (!product || !product.barcode) return
    loadStocks(product.barcode)
  }, [product, loadStocks])

  const getRelatedProducts = () => {
    if (!product) return []
    return products
      .filter((p) => p.catalogId === product.catalogId && p.productId !== product.productId)
      .slice(0, 4)
  }

  const handleAddToCartWithQuantity = () => {
    if (quantity <= 0) return
    const productWithQuantity = { ...product, requestedQuantity: quantity }
    onAddToCart(productWithQuantity)
    setQuantity(getAvailableAmount(product) > 0 ? 1 : 0)
  }

  const handleBuyNowWithQuantity = () => {
    if (quantity <= 0) return
    const productWithQuantity = { ...product, requestedQuantity: quantity }
    onBuyNow(productWithQuantity)
    setQuantity(getAvailableAmount(product) > 0 ? 1 : 0)
  }

  if (loading) {
    return (
      <div className="page active">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page active commerce-shell">
        <div className="page-header">
          <div>
            <h2>Product details</h2>
          </div>
          <button className="btn btn-ghost" onClick={onBack}>
            Back to store
          </button>
        </div>
        <div className="empty">
          <div className="icon">Unable to load</div>
          <p style={{ fontSize: '14px' }}>{error}</p>
        </div>
      </div>
    )
  }

  if (!product) return null

  // Normalize attributes: sometimes backend returns a JSON string
  let attributes = product.attributes || {}
  if (typeof attributes === 'string') {
    try {
      attributes = JSON.parse(attributes)
    } catch (e) {
      // leave as string fallback
      attributes = { RAW: attributes }
    }
  }

  // If backend put brand inside attributes under key like 'BRAND', prefer top-level brand fields
  const hasBrandInfo = !!(product.brandId || product.brandName)
  if (!hasBrandInfo && attributes && typeof attributes === 'object') {
    const brandKey = Object.keys(attributes).find((k) => String(k).trim().toUpperCase() === 'BRAND')
    if (brandKey) {
      const brandVal = attributes[brandKey]
      if (brandVal) {
        product.brandName = product.brandName || brandVal
      }
    }
  }

  const relatedProducts = getRelatedProducts()
  const availableAmount = getAvailableAmount(product)
  const stockStatus = availableAmount > 0 ? 'In Stock' : 'Out of Stock'
  const stockColor = availableAmount > 0 ? '#10b981' : '#ef4444'

  // Prepare attributes for display, removing BRAND key if we've shown brand separately
  const attributesToShow = (() => {
    if (!attributes || typeof attributes !== 'object') return {}
    const copy = { ...attributes }
    const brandKey = Object.keys(copy).find((k) => String(k).trim().toUpperCase() === 'BRAND')
    if (brandKey && (product.brandName || product.brandId)) delete copy[brandKey]
    return copy
  })()

  return (
    <div className="page active commerce-shell">
      <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: '18px' }}>
        Back to store
      </button>

      <section className="detail-shell">
        <div className="detail-media">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div className="image-fallback">No image available</div>
          )}
        </div>

        <div className="detail-info">
          <span className="card-chip" style={{ position: 'static', width: 'fit-content' }}>
            {product.catalogId || 'General'}
          </span>
          <h1>{product.name}</h1>
          <p className="detail-description">
            {product.description || 'Daily essential product available through BachHoaNhanh storefront.'}
          </p>

          <div className="detail-price">{formatPrice(product.originalPrice)} VND</div>

          {/* Inline brand link removed; brand displayed in dedicated block below */}

          {/* Stock Status */}
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>Stock:</span>
            <span style={{ color: stockColor, fontWeight: '600' }}>
              {stockStatus}
            </span>
          </div>

          {!isAdminUser && (
            <>
              {/* Quantity Selector */}
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>Quantity:</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '6px', width: 'fit-content' }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '8px 12px',
                      cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                      opacity: quantity <= 1 ? 0.5 : 1,
                    }}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = availableAmount > 0 ? Math.max(1, Math.min(availableAmount, parseInt(e.target.value) || 1)) : 0
                      setQuantity(val)
                    }}
                    style={{
                      width: '60px',
                      border: 'none',
                      borderLeft: '1px solid var(--border)',
                      borderRight: '1px solid var(--border)',
                      textAlign: 'center',
                      padding: '6px 0',
                    }}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(availableAmount, quantity + 1))}
                    disabled={quantity >= availableAmount || availableAmount <= 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '8px 12px',
                      cursor: quantity >= availableAmount || availableAmount <= 0 ? 'not-allowed' : 'pointer',
                      opacity: quantity >= availableAmount || availableAmount <= 0 ? 0.5 : 1,
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="detail-actions">
                <button 
                  className="btn btn-ghost" 
                  onClick={handleAddToCartWithQuantity}
                  disabled={availableAmount <= 0 || quantity <= 0}
                >
                  Add to cart ({quantity})
                </button>
                <button 
                  className="btn btn-accent" 
                  onClick={handleBuyNowWithQuantity}
                  disabled={availableAmount <= 0 || quantity <= 0}
                >
                  Buy now
                </button>
              </div>
            </>
          )}

          <div className="detail-meta">
            <div>
              <span>Barcode</span>
              <strong>{product.barcode || 'N/A'}</strong>
            </div>
            <div>
              <span>Prototype</span>
              <strong>{product.prototypeId || 'N/A'}</strong>
            </div>
            <div>
              <span>Product ID</span>
              <strong>{product.productId}</strong>
            </div>
          </div>

          {/* Dedicated brand block: always show when brand info exists */}
          {(product.brandId || product.brandName || product.brandDescription) && (
            <div style={{ marginTop: '16px', padding: '16px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', background: 'var(--muted)', flex: '0 0 72px' }}>
                {product.brandImage ? (
                  <img src={product.brandImage} alt={product.brandName || 'Brand'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%' }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{product.brandName || 'Brand'}</div>
                    {product.brandDescription && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>{product.brandDescription}</div>}
                  </div>
                  {product.brandName && (
                    <button className="btn btn-ghost" onClick={() => onViewBrand?.(product.brandName)}>
                      View brand
                    </button>
                  )}
                </div>

                <div style={{ marginTop: 10, display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13 }}>
                  <div><strong>Email:</strong> {product.brandEmail || 'n/a'}</div>
                  <div><strong>Phone:</strong> {product.brandPhone || 'n/a'}</div>
                  <div><strong>ID:</strong> {product.brandId || '-'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="detail-attributes">
        <div className="page-header" style={{ marginBottom: '14px' }}>
          <div>
            <h2>Product attributes</h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
              Specifications and storage information
            </p>
          </div>
        </div>
        {!attributesToShow || Object.keys(attributesToShow).length === 0 ? (
          <div className="empty">
            <p>No attributes available</p>
          </div>
        ) : (
          <div className="attribute-grid">
            {Object.entries(attributesToShow).map(([key, value]) => (
                <div key={key} className="attribute-tile">
                  <span>{String(key).replace(/_/g, ' ').toUpperCase()}</span>
                  <strong>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</strong>
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Stock records moved below attributes as a dedicated table */}
      <section style={{ marginTop: 20 }}>
        <div className="page-header" style={{ marginBottom: '14px' }}>
          <div>
            <h2>Stock records</h2>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
              Loaded by barcode: {product.barcode || 'N/A'}
            </p>
          </div>
        </div>

        {productStocksLoading ? (
          <div className="empty"><p>Loading stock rows…</p></div>
        ) : !productStocks || productStocks.length === 0 ? (
          <div className="empty"><p>No stock records found for this product.</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stock ID</th>
                  <th>Amount</th>
                  <th>Available</th>
                  <th>Import date</th>
                  <th>Manufacture date</th>
                  <th>Expiry date</th>
                </tr>
              </thead>
              <tbody>
                {productStocks.map((stock) => (
                  <tr key={stock.id || `${stock.productId}-${stock.amount}-${stock.expiryDate}`}> 
                    <td>{stock.id || '-'}</td>
                    <td>{stock.amount || 0}</td>
                    <td>{stock.available ? 'Yes' : 'No'}</td>
                    <td>{formatDate(stock.importDate)}</td>
                    <td>{formatDate(stock.manufactureDate)}</td>
                    <td>{formatDate(stock.expiryDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && !isAdminUser && (
        <section style={{ marginTop: '40px' }}>
          <div className="page-header" style={{ marginBottom: '20px' }}>
            <div>
              <h2>Related products</h2>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                Similar items from the same category
              </p>
            </div>
          </div>
          <div className="store-grid">
            {relatedProducts.map((relProduct) => (
              <div 
                key={relProduct.productId}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
                onClick={() => onViewProduct(relProduct.productId)}
              >
                <div style={{ height: '140px', background: 'var(--bg-alt)', borderRadius: '6px', marginBottom: '10px', overflow: 'hidden' }}>
                  {relProduct.image ? (
                    <img src={relProduct.image} alt={relProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)' }}>
                      No image
                    </div>
                  )}
                </div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', lineHeight: '1.3' }}>
                  {relProduct.name}
                </h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: 'var(--muted)' }}>
                  {formatPrice(relProduct.originalPrice)} VND
                </p>
                <span style={{
                  display: 'inline-block',
                  fontSize: '11px',
                  padding: '4px 8px',
                  background: getAvailableAmount(relProduct) > 0 ? '#d1fae5' : '#fee2e2',
                  color: getAvailableAmount(relProduct) > 0 ? '#065f46' : '#7f1d1d',
                  borderRadius: '4px'
                }}>
                  {getAvailableAmount(relProduct) > 0 ? 'In stock' : 'Out of stock'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
