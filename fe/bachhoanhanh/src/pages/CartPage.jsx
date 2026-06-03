import { useEffect, useMemo, useState } from 'react'
import { formatPrice } from '../utils/helpers'
import { showToast } from '../components/Toast'
import { apiFetch } from '../utils/api'

const CITY_OPTIONS = ['Ha Noi', 'Ho Chi Minh City', 'Da Nang', 'Can Tho']
const DISTRICT_OPTIONS = {
  'Ha Noi': ['Ba Dinh', 'Hoan Kiem', 'Dong Da', 'Cau Giay', 'Ha Dong'],
  'Ho Chi Minh City': ['District 1', 'District 3', 'Binh Thanh', 'Tan Binh', 'Thu Duc'],
  'Da Nang': ['Hai Chau', 'Thanh Khe', 'Son Tra', 'Ngu Hanh Son'],
  'Can Tho': ['Ninh Kieu', 'Binh Thuy', 'Cai Rang'],
}

export function CartPage({
  cartItems,
  profile,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCreateOrder,
  onCheckoutCreated,
  onNavigate,
}) {
  const [submitting, setSubmitting] = useState(false)
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherPreview, setVoucherPreview] = useState(null)
  const [voucherLoading, setVoucherLoading] = useState(false)
  const [voucherModalOpen, setVoucherModalOpen] = useState(false)
  const [vouchers, setVouchers] = useState([])
  const [vouchersLoading, setVouchersLoading] = useState(false)
  const [recipient, setRecipient] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: CITY_OPTIONS[0],
    district: DISTRICT_OPTIONS[CITY_OPTIONS[0]][0],
    note: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [acceptedPolicy, setAcceptedPolicy] = useState(false)

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
    setRecipient((prev) => ({
      ...prev,
      fullName: `${profile?.lastName || ''} ${profile?.firstName || ''}`.trim(),
      phone: profile?.phone || '',
      email: profile?.email || '',
    }))
  }, [profile])

  useEffect(() => {
    setVoucherPreview(null)
  }, [cartSignature])

  const setRecipientField = (field, value) => {
    setRecipient((prev) => {
      if (field === 'city') {
        return {
          ...prev,
          city: value,
          district: DISTRICT_OPTIONS[value]?.[0] || '',
        }
      }
      return { ...prev, [field]: value }
    })
  }

  const validateCheckout = () => {
    if (cartItems.length === 0) {
      showToast('Your cart is empty', true)
      return false
    }
    if (!recipient.fullName.trim() || !recipient.phone.trim() || !recipient.email.trim() || !recipient.address.trim()) {
      showToast('Please fill all required recipient information', true)
      return false
    }
    if (!acceptedPolicy) {
      showToast('Please accept the order confirmation terms', true)
      return false
    }
    return true
  }

  const loadVouchers = async () => {
    setVoucherModalOpen(true)
    if (vouchers.length > 0) return
    setVouchersLoading(true)
    try {
      const res = await apiFetch('/vouchers')
      if (!res.ok) throw new Error('Failed to load vouchers')
      const data = await res.json()
      setVouchers(data)
    } catch (e) {
      showToast(e.message, true)
    } finally {
      setVouchersLoading(false)
    }
  }

  const applyVoucher = async (selectedCode = voucherCode) => {
    const code = selectedCode.trim().toUpperCase()
    if (!code) return
    setVoucherLoading(true)
    setVoucherPreview(null)
    try {
      const res = await apiFetch('/vouchers/apply', {
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
      setVoucherModalOpen(false)
      showToast('Voucher applied')
    } catch (e) {
      showToast(e.message, true)
    } finally {
      setVoucherLoading(false)
    }
  }

  const handleCheckout = async () => {
    if (!validateCheckout()) return

    setSubmitting(true)
    const result = await onCreateOrder(cartItems, undefined, voucherPreview?.code || null)
    if (!result.success) {
      showToast(result.message, true)
      setSubmitting(false)
      return
    }

    await onClearCart()
    setVoucherPreview(null)
    setVoucherCode('')
    showToast(paymentMethod === 'cod' ? 'Order created' : 'Order created. Payment is ready')
    setSubmitting(false)
    onCheckoutCreated(result.data)
  }

  if (cartItems.length === 0) {
    return (
      <div className="page active" style={{ maxWidth: '980px', margin: '0 auto' }}>
        <div className="empty">
          <div className="icon">Cart</div>
          <p style={{ fontSize: '14px' }}>Your cart is empty</p>
          <button className="btn btn-accent" style={{ marginTop: '16px' }} onClick={() => onNavigate('products')}>
            Browse products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page active checkout-page">
      <div className="checkout-grid">
        <section className="checkout-section">
          <div className="checkout-title">
            <span>1</span>
            <h2>Recipient details</h2>
          </div>

          <div className="checkout-form">
            <label>
              <span>Full name</span>
              <input value={recipient.fullName} onChange={(e) => setRecipientField('fullName', e.target.value)} placeholder="Enter recipient name" />
            </label>
            <div className="checkout-form-row">
              <label>
                <span>Phone number</span>
                <input value={recipient.phone} onChange={(e) => setRecipientField('phone', e.target.value)} placeholder="Enter phone number" />
              </label>
              <label>
                <span>Email</span>
                <input value={recipient.email} onChange={(e) => setRecipientField('email', e.target.value)} placeholder="Enter email address" />
              </label>
            </div>
            <label>
              <span>Street address</span>
              <input value={recipient.address} onChange={(e) => setRecipientField('address', e.target.value)} placeholder="House number, street, ward" />
            </label>
            <div className="checkout-form-row">
              <label>
                <span>City</span>
                <select value={recipient.city} onChange={(e) => setRecipientField('city', e.target.value)}>
                  {CITY_OPTIONS.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>District</span>
                <select value={recipient.district} onChange={(e) => setRecipientField('district', e.target.value)}>
                  {(DISTRICT_OPTIONS[recipient.city] || []).map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              <span>Delivery note</span>
              <textarea value={recipient.note} onChange={(e) => setRecipientField('note', e.target.value)} placeholder="Add delivery note" rows={4} />
            </label>
          </div>

          <div className="checkout-note">
            <strong>Checkout note</strong>
            <p>Account information is prefilled here, but changes only apply to this order.</p>
            <p>Please confirm the phone number and address before placing the order.</p>
          </div>
        </section>

        <aside className="checkout-section cart-summary">
          <div className="checkout-title">
            <span>2</span>
            <h2>Order review</h2>
          </div>

          <div className="summary-table">
            <div className="summary-head">
              <strong>Product</strong>
              <strong>Qty</strong>
              <strong>Total</strong>
            </div>
            {cartItems.map((item) => (
              <div className="summary-item" key={item.productId}>
                <div>
                  <strong>{item.name}</strong>
                  <span>Unit price: {formatPrice(item.originalPrice)} VND</span>
                  <button type="button" onClick={() => onRemoveItem(item.productId)}>
                    Remove
                  </button>
                </div>
                <div className="qty-control">
                  <button type="button" onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}>
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}>
                    +
                  </button>
                </div>
                <strong>{formatPrice(Number(item.originalPrice || 0) * item.quantity)} VND</strong>
              </div>
            ))}
          </div>

          <div className="summary-lines">
            <div>
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)} VND</strong>
            </div>
            <div>
              <span>Discount</span>
              <strong>{formatPrice(discountAmount)} VND</strong>
            </div>
            <div className="summary-total">
              <span>Grand total</span>
              <strong>{formatPrice(total)} VND</strong>
            </div>
          </div>

          <div className="voucher-box checkout-block">
            <label>Promo code</label>
            <div>
              <input value={voucherCode || 'No voucher selected'} readOnly />
              <button className="btn btn-accent" onClick={loadVouchers} disabled={voucherLoading}>
                Choose
              </button>
            </div>
            {voucherPreview && <p>Applied {voucherPreview.code}: -{formatPrice(discountAmount)} VND</p>}
          </div>

          <div className="payment-panel checkout-block">
            <h3>Payment method</h3>
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
              />
              <strong>Cash on delivery</strong>
            </label>
            <p className="payment-copy">Pay when the order arrives. The store may confirm your phone number before dispatch.</p>

            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'transfer'}
                onChange={() => setPaymentMethod('transfer')}
              />
              <strong>Bank transfer before delivery</strong>
            </label>
            <p className="payment-copy">Use this option when you want to complete payment before delivery confirmation.</p>
          </div>

          <label className="policy-check">
            <input type="checkbox" checked={acceptedPolicy} onChange={(e) => setAcceptedPolicy(e.target.checked)} />
            <span>I agree to the delivery policy and order confirmation terms.</span>
          </label>

          <button className="btn btn-accent checkout-submit" onClick={handleCheckout} disabled={submitting}>
            {submitting ? 'Placing order...' : 'Place order'}
          </button>
        </aside>
      </div>

      {voucherModalOpen && (
        <div className="modal-bg open">
          <div className="modal voucher-modal">
            <div className="voucher-modal-head">
              <div>
                <h3>Choose voucher</h3>
                <p>Review available promotions and apply one to this cart.</p>
              </div>
              <button className="btn btn-ghost" onClick={() => setVoucherModalOpen(false)}>
                Close
              </button>
            </div>

            <div className="voucher-manual">
              <input
                value={voucherCode}
                onChange={(e) => {
                  setVoucherCode(e.target.value)
                  setVoucherPreview(null)
                }}
                placeholder="Enter voucher code"
              />
              <button className="btn btn-accent" onClick={() => applyVoucher()} disabled={voucherLoading}>
                {voucherLoading ? 'Applying...' : 'Apply code'}
              </button>
            </div>

            {vouchersLoading ? (
              <div className="empty" style={{ padding: '26px' }}>Loading vouchers...</div>
            ) : vouchers.length === 0 ? (
              <div className="empty" style={{ padding: '26px' }}>No vouchers available.</div>
            ) : (
              <div className="voucher-list">
                {vouchers.map((voucher) => (
                  <div className="voucher-card" key={voucher.id}>
                    <div>
                      <div className="voucher-code">{voucher.code}</div>
                      <p>{voucher.description || 'Promotion for selected products or catalogs.'}</p>
                      <div className="voucher-meta">
                        <span>
                          {voucher.discountType === 'PERCENT'
                            ? `${formatPrice(voucher.discountValue)}% off`
                            : `${formatPrice(voucher.discountValue)} VND off`}
                        </span>
                        <span>Min order: {formatPrice(voucher.minOrderValue || 0)} VND</span>
                        {voucher.maxDiscountAmount > 0 && (
                          <span>Max discount: {formatPrice(voucher.maxDiscountAmount)} VND</span>
                        )}
                        <span>Valid until: {voucher.endDate ? new Date(voucher.endDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-accent"
                      onClick={() => applyVoucher(voucher.code)}
                      disabled={voucherLoading || !voucher.active}
                    >
                      {voucher.active ? 'Apply' : 'Inactive'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
