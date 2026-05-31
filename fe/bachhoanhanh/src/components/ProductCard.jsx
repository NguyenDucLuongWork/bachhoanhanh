import { formatPrice } from '../utils/helpers'

export function ProductCard({ product, onView, onEdit, onDelete, isAdminUser, onAddToCart, onBuyNow }) {
  return (
    <article className="store-card" onClick={() => onView(product.productId)}>
      <div className="store-card-media">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <div className="image-fallback">No image</div>
        )}
        {product.catalogId && <span className="card-chip">{product.catalogId}</span>}
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
            <button
              className="btn btn-danger btn-sm"
              onClick={(event) => {
                event.stopPropagation()
                onDelete(product.productId)
              }}
            >
              Delete
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
            >
              Add to cart
            </button>
            <button
              className="btn btn-accent btn-sm"
              onClick={(event) => {
                event.stopPropagation()
                onBuyNow(product)
              }}
            >
              Buy now
            </button>
          </div>
        )}
      </div>
    </article>
  )
}
