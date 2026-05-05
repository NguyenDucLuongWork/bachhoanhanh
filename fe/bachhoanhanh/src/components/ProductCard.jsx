import { formatPrice, getProductEmoji } from '../utils/helpers'

export function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div className="product-card">
      <div className="product-img">{product.image ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getProductEmoji(product.productId)}</div>
      <div className="product-body">
        <div className="product-name">{product.name}</div>
        <div className="product-price">{formatPrice(product.originalPrice)} ₫</div>
        {product.barcode && <div className="product-id">Barcode: {product.barcode}</div>}
        {product.description && <div className="product-description" style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '5px' }}>{product.description}</div>}
        <div className="product-id">ID: {product.productId}</div>
        <div className="product-actions">
          <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => onEdit(product)}>
            Edit
          </button>
          <button
            className="btn btn-sm"
            style={{
              background: 'rgba(239,68,68,0.1)',
              color: '#ef4444',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '8px',
              fontSize: '12px',
              padding: '5px 10px',
            }}
            onClick={() => onDelete(product.productId)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
