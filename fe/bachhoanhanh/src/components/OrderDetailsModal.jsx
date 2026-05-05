import { useState, useEffect } from 'react'
import { formatPrice } from '../utils/helpers'

export function OrderDetailsModal({ isOpen, orderData, onClose }) {
  const [order, setOrder] = useState(null)

  useEffect(() => {
    if (orderData) {
      setOrder(orderData)
    }
  }, [orderData, isOpen])

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

        <div className="modal-footer">
          <button className="btn btn-accent" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
