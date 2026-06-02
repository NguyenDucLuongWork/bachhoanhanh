import { formatPrice } from '../utils/helpers'

const statusColors = {
  pending: '#f97316',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#22c55e',
  cancelled: '#ef4444',
}

const statusLabels = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export function OrderCard({ order, onViewDetails, onCancel, onStatusChange }) {
  const statusColor = statusColors[order.status] || '#a1a1aa'
  const statusLabel = statusLabels[order.status] || order.status

  return (
    <div className="product-card">
      <div className="product-body" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
          <div>
            <div className="product-name" style={{ marginBottom: '4px' }}>
              Order #{order.id}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
            </div>
          </div>
          <div
            style={{
              background: statusColor,
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 500,
            }}
          >
            {statusLabel}
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Items:</div>
          <div style={{ fontSize: '13px' }}>
            {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
          </div>
        </div>

        <div style={{ marginBottom: '12px', paddingTop: '12px', borderTop: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--accent)' }}>
            {formatPrice(order.total)} ₫
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="btn btn-ghost btn-sm"
            style={{ flex: 1 }}
            onClick={() => onViewDetails(order.id)}
          >
            View
          </button>
          {order.status === 'pending' && (
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
              onClick={() => onCancel(order.id)}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
