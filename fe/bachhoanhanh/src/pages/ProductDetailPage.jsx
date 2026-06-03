import { useEffect, useState } from 'react'
import { Loader } from '../components/Loader'
import { formatPrice, getAvailableAmount } from '../utils/helpers'

const ATTRIBUTE_LABELS = {
  BRAND: 'Brand',
  BRAND_DESCRIPTION: 'Brand description',
  ORIGIN: 'Origin',
  WEIGHT: 'Weight',
  VOLUME: 'Volume',
  EXPIRY_DATE: 'Expiry date',
  IMPORT_DATE: 'Import date',
  EXPORT_DATE: 'Export date',
  STORAGE_INSTRUCTIONS: 'Storage',
  INGREDIENTS: 'Ingredients',
  WARNINGS: 'Warnings',
  BENEFITS: 'Benefits',
  USAGE_INSTRUCTIONS: 'Usage',
  SUITABLE_FOR: 'Suitable for',
  ENERGY: 'Energy',
}

const ATTRIBUTE_ORDER = [
  'BRAND',
  'BRAND_DESCRIPTION',
  'ORIGIN',
  'WEIGHT',
  'VOLUME',
  'EXPIRY_DATE',
  'STORAGE_INSTRUCTIONS',
  'INGREDIENTS',
  'BENEFITS',
  'USAGE_INSTRUCTIONS',
  'SUITABLE_FOR',
  'ENERGY',
  'WARNINGS',
]

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN')
}

function getOrderedAttributes(attributes = {}) {
  const entries = Object.entries(attributes).filter(([, value]) => value != null && String(value).trim() !== '')
  return entries.sort(([a], [b]) => {
    const ai = ATTRIBUTE_ORDER.indexOf(a)
    const bi = ATTRIBUTE_ORDER.indexOf(b)
    if (ai === -1 && bi === -1) return a.localeCompare(b)
    if (ai === -1) return 1
    if (bi === -1) return -1
    return ai - bi
  })
}

export function ProductDetailPage({ productId, getProductById, onBack, isAdminUser, onAddToCart, onBuyNow, onViewProduct, products = [] }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!productId) return

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
  }, [productId, getProductById])

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

  const relatedProducts = getRelatedProducts()
  const availableAmount = getAvailableAmount(product)
  const availableStocks = Array.isArray(product.availableStocks) ? product.availableStocks : []
  const attributeSource = {
    ...(product.attributes || {}),
    ...(product.brandDescription ? { BRAND_DESCRIPTION: product.brandDescription } : {}),
  }
  const orderedAttributes = getOrderedAttributes(attributeSource)
  const stockStatus = availableAmount > 0 ? 'In stock' : 'Out of stock'
  const stockColor = availableAmount > 0 ? '#10b981' : '#ef4444'
  const nearestExpiry = availableStocks
    .filter((stock) => Number(stock.amount || 0) > 0)
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))[0]?.expiryDate

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

          <div className="detail-stock">
            <div className="detail-stock-head">
              <span>Availability</span>
              <strong style={{ color: stockColor }}>{stockStatus}</strong>
            </div>
            {nearestExpiry && (
              <div className="detail-stock-expiry">
                Nearest expiry: {formatDate(nearestExpiry)}
              </div>
            )}
          </div>

          {!isAdminUser && (
            <>
              <div className="detail-quantity">
                <label>Quantity</label>
                <div className="quantity-stepper">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || availableAmount <= 0}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value, 10)
                      const val = availableAmount > 0 ? Math.max(1, Math.min(availableAmount, parsed || 1)) : 0
                      setQuantity(val)
                    }}
                    min={availableAmount > 0 ? 1 : 0}
                    max={availableAmount}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(availableAmount, quantity + 1))}
                    disabled={quantity >= availableAmount || availableAmount <= 0}
                  >
                    +
                  </button>
                </div>
              </div>

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
        </div>
      </section>

      <section className="detail-section">
        <div className="detail-section-head">
          <h2>Product attributes</h2>
          <p>Specifications and storage information</p>
        </div>
        {orderedAttributes.length === 0 ? (
          <div className="empty">
            <p>No attributes available</p>
          </div>
        ) : (
          <div className="attribute-grid">
            {orderedAttributes.map(([key, value]) => (
              <div key={key} className="attribute-tile">
                <span>{ATTRIBUTE_LABELS[key] || key.replaceAll('_', ' ').toLowerCase()}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && !isAdminUser && (
        <section className="related-section">
          <div className="page-header">
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
                className="related-card"
                onClick={() => onViewProduct(relProduct.productId)}
              >
                <div className="related-card-media">
                  {relProduct.image ? (
                    <img src={relProduct.image} alt={relProduct.name} />
                  ) : (
                    <div className="image-fallback">No image</div>
                  )}
                </div>
                <h4>
                  {relProduct.name}
                </h4>
                <p>
                  {formatPrice(relProduct.originalPrice)} VND
                </p>
                <span className={getAvailableAmount(relProduct) > 0 ? 'mini-stock in-stock' : 'mini-stock out-stock'}>
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
