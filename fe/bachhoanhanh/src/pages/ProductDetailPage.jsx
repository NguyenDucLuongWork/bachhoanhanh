import { useEffect, useState } from 'react'
import { Loader } from '../components/Loader'
import { formatPrice } from '../utils/helpers'

export function ProductDetailPage({ productId, getProductById, onBack, isAdminUser, onAddToCart, onBuyNow }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!productId) return

    const loadProduct = async () => {
      setLoading(true)
      setError(null)
      const result = await getProductById(productId)
      if (result.success) {
        setProduct(result.data)
      } else {
        setError(result.message)
      }
      setLoading(false)
    }

    loadProduct()
  }, [productId, getProductById])

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

          {!isAdminUser && (
            <div className="detail-actions">
              <button className="btn btn-ghost" onClick={() => onAddToCart(product)}>
                Add to cart
              </button>
              <button className="btn btn-accent" onClick={() => onBuyNow(product)}>
                Buy now
              </button>
            </div>
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
    </div>
  )
}
