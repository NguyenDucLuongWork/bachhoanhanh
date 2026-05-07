import { useState, useEffect } from 'react'
import { Loader } from '../components/Loader'
import { formatPrice } from '../utils/helpers'

export function ProductDetailPage({ productId, getProductById, onBack }) {
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
      <div className="page active" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="page-header">
          <div>
            <h2>Product details</h2>
          </div>
          <button className="btn btn-ghost" onClick={onBack}>
            ← Back
          </button>
        </div>
        <div className="empty">
          <div className="icon">⚠️</div>
          <p style={{ fontSize: '14px' }}>{error}</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="page active" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header" style={{ alignItems: 'center' }}>
        <div>
          <h2>Product details</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
            View all information for {product.name}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={onBack}>
          ← Back
        </button>
      </div>

      <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1.2fr 1fr', marginTop: '20px' }}>
        <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: '18px', padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <h3 style={{ margin: 0 }}>Name</h3>
                <p style={{ margin: '8px 0 0', color: 'var(--text)' }}>{product.name}</p>
              </div>
              <div>
                <h3 style={{ margin: 0 }}>Price</h3>
                <p style={{ margin: '8px 0 0', color: 'var(--text)' }}>{formatPrice(product.originalPrice)} ₫</p>
              </div>
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Catalog ID</h3>
              <p style={{ margin: '8px 0 0', color: 'var(--text)' }}>{product.catalogId || 'N/A'}</p>
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Prototype ID</h3>
              <p style={{ margin: '8px 0 0', color: 'var(--text)' }}>{product.prototypeId || 'N/A'}</p>
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Barcode</h3>
              <p style={{ margin: '8px 0 0', color: 'var(--text)' }}>{product.barcode || 'N/A'}</p>
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Description</h3>
              <p style={{ margin: '8px 0 0', color: 'var(--text)' }}>{product.description || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '24px' }}>
          <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: '18px', padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Image</h3>
            {product.image ? (
              <img src={product.image} alt={product.name} style={{ width: '100%', borderRadius: '16px', objectFit: 'cover' }} />
            ) : (
              <div style={{ minHeight: '220px', display: 'grid', placeItems: 'center', color: 'var(--muted)', border: '1px dashed var(--border)', borderRadius: '16px' }}>
                No image available
              </div>
            )}
          </div>

          <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: '18px', padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Attributes</h3>
            {!product.attributes || Object.keys(product.attributes).length === 0 ? (
              <p style={{ margin: 0, color: 'var(--muted)' }}>No attributes available</p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {Object.entries(product.attributes).map(([key, value]) => (
                  <div key={key} style={{ display: 'grid', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{key}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
