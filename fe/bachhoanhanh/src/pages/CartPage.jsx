import { useEffect, useMemo, useState } from 'react'
import { formatPrice } from '../utils/helpers'
import { showToast } from '../components/Toast'

export function CartPage({ cartItems, onUpdateQuantity, onRemoveItem, onClearCart, onCreateOrder, onCheckoutCreated, onNavigate }) {
  const [submitting, setSubmitting] = useState(false)
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherPreview, setVoucherPreview] = useState(null)
  const [voucherLoading, setVoucherLoading] = useState(false)

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.originalPrice || 0) * item.quantity, 0),
    [cartItems]
  )
  const discountAmount = voucherPreview?.discountAmount || 0
  const total = Math.max(0, subtotal - discountAmount)
  const cartSignature = useMemo(
    () => cartItems.map((item) => `${item.productId}:${item.quantity}`).join('|'),
    [cartItems]
  )

  useEffect(() => {
    setVoucherPreview(null)
  }, [cartSignature])

  const applyVoucher = async () => {
    const code = voucherCode.trim().toUpperCase()
    if (!code) return
    setVoucherLoading(true)
    setVoucherPreview(null)
    try {
      const res = await fetch('/vouchers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          orderTotal: subtotal,
          productIds: cartItems.map((item) => Number(item.productId)),
          catalogIds: cartItems.map((item) => item.catalogId).filter(Boolean),
        }),
      })
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Voucher is not valid')
      }
      const data = await res.json()
      setVoucherPreview(data)
      setVoucherCode(data.code)
      showToast('Voucher applied')
    } catch (e) {
      showToast(e.message, true)
    } finally {
      setVoucherLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) return

    setSubmitting(true)
    const result = await onCreateOrder(cartItems, undefined, voucherPreview?.code || null)
    if (!result.success) {
      showToast(result.message, true)
      setSubmitting(false)
      return
    }

    onClearCart()
    setVoucherPreview(null)
    setVoucherCode('')
    showToast('Order created')
    setSubmitting(false)
    onCheckoutCreated(result.data)
  }

  return (
    <div className="page active" style={{ maxWidth: '980px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2>Cart</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
            Review items before placing your order
          </p>
        </div>
        <button className="btn btn-ghost" onClick={() => onNavigate('products')}>
          Continue shopping
        </button>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty">
          <div className="icon">Cart</div>
          <p style={{ fontSize: '14px' }}>Your cart is empty</p>
          <button className="btn btn-accent" style={{ marginTop: '16px' }} onClick={() => onNavigate('products')}>
            Browse products
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: '18px', alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: '12px' }}>
            {cartItems.map((item) => (
              <div key={item.productId} className="product-card" style={{ display: 'grid', gridTemplateColumns: '112px 1fr', minHeight: '112px' }}>
                <div className="product-img" style={{ height: '112px', overflow: 'hidden' }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span>No image</span>
                  )}
                </div>
                <div className="product-body" style={{ display: 'grid', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                      <div className="product-name">{item.name}</div>
                      <div className="product-price">{formatPrice(item.originalPrice)} VND</div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => onRemoveItem(item.productId)}>
                      Remove
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}>
                        -
                      </button>
                      <strong style={{ minWidth: '28px', textAlign: 'center' }}>{item.quantity}</strong>
                      <button className="btn btn-ghost btn-sm" onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}>
                        +
                      </button>
                    </div>
                    <strong>{formatPrice(Number(item.originalPrice || 0) * item.quantity)} VND</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="product-card">
            <div className="product-body" style={{ display: 'grid', gap: '14px' }}>
              <h3>Order summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', color: 'var(--muted)' }}>
                <span>Items</span>
                <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700 }}>Voucher</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    value={voucherCode}
                    onChange={(e) => {
                      setVoucherCode(e.target.value)
                      setVoucherPreview(null)
                    }}
                    placeholder="WELCOME10"
                    style={{ minWidth: 0, flex: 1, border: '1px solid var(--border2)', borderRadius: '10px', padding: '9px 10px' }}
                  />
                  <button className="btn btn-ghost btn-sm" onClick={applyVoucher} disabled={voucherLoading || cartItems.length === 0}>
                    {voucherLoading ? '...' : 'Apply'}
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', color: 'var(--muted)' }}>
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)} VND</span>
              </div>
              {voucherPreview && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', color: 'var(--success)' }}>
                  <span>Discount ({voucherPreview.code})</span>
                  <span>-{formatPrice(discountAmount)} VND</span>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'baseline', paddingTop: '12px', borderTop: '0.5px solid var(--border)' }}>
                <strong>Total</strong>
                <strong style={{ color: 'var(--accent)', fontSize: '20px', whiteSpace: 'nowrap' }}>{formatPrice(total)} VND</strong>
              </div>
              <button className="btn btn-accent" style={{ justifyContent: 'center' }} onClick={handleCheckout} disabled={submitting}>
                {submitting ? 'Placing order...' : 'Place order'}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
