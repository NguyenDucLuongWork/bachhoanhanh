import { useEffect, useState } from 'react'
import { Loader } from '../components/Loader'
import { formatPrice } from '../utils/helpers'
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

    const loadProduct = async () => {
      setLoading(true)
      setError(null)
      const result = await getProductById(productId)
      if (result.success) {
        setProduct(result.data)
        setQuantity(1)
      } else {
        setError(result.message)
      }
      setLoading(false)
    }

    loadProduct()
  }, [productId, getProductById])

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
    const productWithQuantity = { ...product, requestedQuantity: quantity }
    onAddToCart(productWithQuantity)
    setQuantity(1)
  }

  const handleBuyNowWithQuantity = () => {
    const productWithQuantity = { ...product, requestedQuantity: quantity }
    onBuyNow(productWithQuantity)
    setQuantity(1)
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

  const relatedProducts = getRelatedProducts()
  const stockStatus = product.stock > 0 ? 'In Stock' : 'Out of Stock'
  const stockColor = product.stock > 0 ? '#10b981' : '#ef4444'

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

          {product.brandName && (
            <div style={{ marginBottom: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>Brand:</span>
              <button
                className="btn btn-ghost"
                onClick={() => onViewBrand?.(product.brandName)}
                style={{ padding: '6px 10px', fontSize: '13px', textDecoration: 'underline', color: 'var(--primary)' }}
              >
                {product.brandName}
              </button>
            </div>
          )}

          {/* Stock Status */}
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--muted)' }}>Stock:</span>
            <span style={{ color: stockColor, fontWeight: '600' }}>
              {stockStatus} ({product.stock || 0} units)
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
                      const val = Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1))
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
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '8px 12px',
                      cursor: quantity >= product.stock ? 'not-allowed' : 'pointer',
                      opacity: quantity >= product.stock ? 0.5 : 1,
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
                  disabled={product.stock <= 0}
                >
                  Add to cart ({quantity})
                </button>
                <button 
                  className="btn btn-accent" 
                  onClick={handleBuyNowWithQuantity}
                  disabled={product.stock <= 0}
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

          <section className="panel panel-flat" style={{ marginTop: '18px' }}>
            <div className="panel-body">
              <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Stock records</h3>
                  <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '13px' }}>
                    Loaded by barcode: {product.barcode || 'N/A'}
                  </p>
                </div>
                {productStocksLoading && <span style={{ color: 'var(--muted)' }}>Loading stock data…</span>}
              </div>
              {productStocksLoading ? (
                <p>Loading stock rows…</p>
              ) : !productStocks || productStocks.length === 0 ? (
                <div className="empty">
                  <p>No stock records found for this product.</p>
                </div>
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
            </div>
          </section>

          {product.brandDescription && (
            <div style={{ marginTop: '16px', padding: '16px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Brand details</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6' }}>
                {product.brandDescription}
              </div>
              <div style={{ marginTop: '10px', display: 'grid', gap: '4px', fontSize: '13px' }}>
                <div><strong>Email:</strong> {product.brandEmail || 'n/a'}</div>
                <div><strong>Phone:</strong> {product.brandPhone || 'n/a'}</div>
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
        {!product.attributes || Object.keys(product.attributes).length === 0 ? (
          <div className="empty">
            <p>No attributes available</p>
          </div>
        ) : (
          <div className="attribute-grid">
            {Object.entries(product.attributes).map(([key, value]) => (
              <div key={key} className="attribute-tile">
                <span>{key}</span>
                <strong>{value}</strong>
              </div>
            ))}
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
                  background: relProduct.stock > 0 ? '#d1fae5' : '#fee2e2',
                  color: relProduct.stock > 0 ? '#065f46' : '#7f1d1d',
                  borderRadius: '4px'
                }}>
                  {relProduct.stock > 0 ? `${relProduct.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
