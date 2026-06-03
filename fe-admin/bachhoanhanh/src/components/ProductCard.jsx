import { formatPrice, getAvailableAmount } from '../utils/helpers'

export function ProductCard({ product, onView, onEdit, isAdminUser, onAddToCart, onBuyNow }) {
  const availableAmount = getAvailableAmount(product)
  const hasStock = availableAmount > 0
  const stockStatus = hasStock ? 'In Stock' : 'Out of Stock'
  const stockColor = hasStock ? '#10b981' : '#ef4444'
  
  return (
    <article className="store-card" onClick={() => onView(product.productId)}>
      <div className="store-card-media">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="image-fallback">No image</div>
        )}
        {!isAdminUser && (
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: stockColor,
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            {stockStatus}
          </span>
        )}
      </div>

      <div className="store-card-body">
        <div>
          <h3>{product.name}</h3>
          <p>{product.description || 'Fresh daily essentials ready for fast delivery.'}</p>
        </div>
        <div className="card-price-row">
          <strong>{formatPrice(product.originalPrice)} VND</strong>
          {product.barcode && <span>#{product.barcode}</span>}
        </div>

        {isAdminUser ? (
          <div className="card-actions">
            <button
              className="btn btn-ghost btn-sm"
              onClick={(event) => {
                event.stopPropagation()
                onEdit(product)
              }}
            >
              Edit
            </button>
          </div>
        ) : (
          <div className="card-actions">
            <button
              className="btn btn-ghost btn-sm"
              onClick={(event) => {
                event.stopPropagation()
                onAddToCart(product)
              }}
              disabled={!hasStock}
            >
              Add to cart
            </button>
            <button
              className="btn btn-accent btn-sm"
              onClick={(event) => {
                event.stopPropagation()
                onBuyNow(product)
              }}
              disabled={!hasStock}
            >
              Buy now
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
