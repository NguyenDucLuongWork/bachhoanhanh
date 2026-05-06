import { useState, useEffect } from 'react'
import { formatPrice } from '../utils/helpers'
import { showToast } from './Toast'

export function OrderDetailsModal({ isOpen, orderData, onClose, onPaymentCompleted }) {
  const [order, setOrder] = useState(null)
  const [payLoading, setPayLoading] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [autoOpenPayment, setAutoOpenPayment] = useState(() => {
    try {
      return localStorage.getItem('autoOpenPayment') === '1'
    } catch (e) {
      return false
    }
  })
  const [autoOpened, setAutoOpened] = useState(false)

  useEffect(() => {
    if (orderData) {
      setOrder(orderData)
    }
  }, [orderData, isOpen])

  // When modal opens, create a checkout for this order (if pending)
  useEffect(() => {
    let cancelled = false
    async function createCheckout() {
      if (!orderData || orderData.status !== 'pending') return
      setCheckoutLoading(true)
      try {
        const res = await fetch('/api/payments/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: orderData.id, amount: orderData.total }),
        })
        if (!res.ok) throw new Error('Failed to create checkout')
        const data = await res.json()
        if (!cancelled) setPaymentInfo(data)
      } catch (e) {
        showToast(e.message || 'Cannot create payment', true)
      } finally {
        setCheckoutLoading(false)
      }
    }

    if (isOpen) createCheckout()
    return () => {
      cancelled = true
    }
  }, [isOpen, orderData])

  // Auto-open payment URL when paymentInfo becomes available and user enabled the option
  useEffect(() => {
    if (!paymentInfo || !paymentInfo.paymentUrl) return
    if (!autoOpenPayment) return
    if (autoOpened) return // avoid opening repeatedly if paymentInfo doesn't change

    try {
      const url = '/api' + paymentInfo.paymentUrl
      window.open(url, '_blank')
      setAutoOpened(true)
    } catch (e) {
      // ignore pop-up blocked errors — user can still click Open Payment
      console.warn('Auto-open payment failed', e)
    }
  }, [paymentInfo, autoOpenPayment, autoOpened])

  if (!isOpen || !order) return null

  return (
    <div className="modal-bg open">
      <div className="modal" style={{ maxWidth: '500px' }}>
        <h3>Order #{order.id}</h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>
            Order Date
          </label>
          <div style={{ marginTop: '4px', fontSize: '14px' }}>
            {new Date(order.createdAt).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>
            Status
          </label>
          <div
            style={{
              marginTop: '4px',
              display: 'inline-block',
              background: 'rgba(249,115,22,0.12)',
              color: '#f97316',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              textTransform: 'capitalize',
            }}
          >
            {order.status}
          </div>
        </div>

        <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '0.5px solid var(--border)' }}>
          <label style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
            Items
          </label>
          {order.items && order.items.length > 0 ? (
            <div>
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: idx < order.items.length - 1 ? '0.5px solid var(--border)' : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--accent)' }}>
                    {formatPrice(item.price * item.quantity)} ₫
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>No items</div>
          )}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Total:</span>
            <div style={{ fontSize: '20px', fontWeight: '600', color: 'var(--accent)' }}>
              {formatPrice(order.total)} ₫
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={autoOpenPayment}
              onChange={(e) => {
                const val = e.target.checked
                setAutoOpenPayment(val)
                try {
                  localStorage.setItem('autoOpenPayment', val ? '1' : '0')
                } catch (err) {}
              }}
            />
            <span style={{ fontSize: '13px' }}>Auto-open payment when ready</span>
          </label>
          {paymentInfo && paymentInfo.paymentUrl && (
            <div style={{ marginLeft: 'auto' }}>
              {/* QR image (uses external QR generation service) */}
              <img
                alt="Payment QR"
                style={{ width: 72, height: 72, borderRadius: 6, border: '1px solid var(--border)' }}
                src={
                  'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' +
                  encodeURIComponent(window.location.origin + '/api' + paymentInfo.paymentUrl)
                }
              />
            </div>
          )}

        </div>

        <div className="modal-footer">
                  {order.status === 'pending' && (
                    <>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          // Open payment URL in new tab (proxied via /api)
                          if (paymentInfo && paymentInfo.paymentUrl) {
                            const url = '/api' + paymentInfo.paymentUrl
                            window.open(url, '_blank')
                          } else {
                            showToast('Payment url not ready', true)
                          }
                        }}
                        disabled={checkoutLoading}
                      >
                        {checkoutLoading ? 'Preparing...' : 'Open Payment'}
                      </button>

                      <button
                        className="btn btn-accent"
                        onClick={async () => {
                          if (!paymentInfo || !paymentInfo.paymentId) {
                            showToast('No payment created', true)
                            return
                          }
                          setPayLoading(true)
                          try {
                            const res = await fetch('/api/payments/' + paymentInfo.paymentId + '/pay', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                            })
                            if (!res.ok) {
                              const txt = await res.text()
                              throw new Error(txt || 'Payment failed')
                            }
                            showToast('Payment completed')
                            if (onPaymentCompleted) onPaymentCompleted()
                            onClose()
                          } catch (e) {
                            showToast(e.message || 'Payment error', true)
                          } finally {
                            setPayLoading(false)
                          }
                        }}
                        disabled={payLoading || checkoutLoading}
                      >
                        {payLoading ? 'Completing...' : 'Mark as Paid'}
                      </button>
                    </>
                  )}

              <button className="btn btn-accent" onClick={onClose}>
                Close
              </button>
        </div>
      </div>
    </div>
  )
}
