import { formatPrice } from '../utils/helpers'

export function ProductCard({ product, onView, onEdit, onDelete }) {
  return (
    <div className="product-card" onClick={() => onView(product.productId)} style={{ cursor: 'pointer' }}>
      {product.image ? (
        <div className="product-img" style={{ height: '180px', overflow: 'hidden', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ) : (
        <div className="product-img" style={{ height: '180px', display: 'grid', placeItems: 'center', color: 'var(--muted)', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', background: 'rgba(0,0,0,0.03)' }}>
          No image
        </div>
      )}
      <div className="product-body" style={{ padding: '20px 18px' }}>
        <div className="product-name">{product.name}</div>
        <div className="product-price">{formatPrice(product.originalPrice)} ₫</div>
        <div className="product-actions" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-ghost btn-sm"
            style={{ flex: 1 }}
            onClick={(e) => {
              e.stopPropagation()
              onEdit(product)
            }}
          >
            Edit
          </button>
          <button
            className="btn btn-sm"
            style={{
              flex: 1,
              background: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '8px',
              fontSize: '12px',
              padding: '5px 10px',
            }}
            onClick={(e) => {
              e.stopPropagation()
              onDelete(product.productId)
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
