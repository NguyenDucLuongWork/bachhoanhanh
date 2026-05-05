import { formatPrice, getProductEmoji } from '../utils/helpers'

export function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div className="product-card">
      <div className="product-img">{getProductEmoji(product.id)}</div>
      <div className="product-body">
        <div className="product-name">{product.name}</div>
        <div className="product-price">{formatPrice(product.price)} ₫</div>
        <div className="product-id">ID: {product.id}</div>
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
            onClick={() => onDelete(product.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
