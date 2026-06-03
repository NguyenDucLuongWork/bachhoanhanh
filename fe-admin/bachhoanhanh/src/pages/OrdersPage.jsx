import { useState, useEffect, useMemo } from 'react'
import { OrderCard } from '../components/OrderCard'
import { OrderDetailsModal } from '../components/OrderDetailsModal'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { Loader } from '../components/Loader'
import { showToast } from '../components/Toast'
import { formatPrice } from '../utils/helpers'

const ORDER_STATUSES = ['PENDING', 'ACCEPTED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const STATUS_LABELS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

const normalizeStatus = (status) => (status || 'PENDING').toUpperCase()

export function OrdersPage({
  orders,
  loading,
  onLoadOrders,
  onGetOrderDetails,
  onUpdateStatus,
  onCancelOrder,
  onRefresh,
  onGoHome,
  isAdminUser = false,
  token,
  userId = null,
  getCustomerDetail = null,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [cancelingId, setCancelingId] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [customerInfo, setCustomerInfo] = useState(null)
  const [customerLoading, setCustomerLoading] = useState(false)

  useEffect(() => {
    onLoadOrders(userId)
  }, [onLoadOrders, userId])

  useEffect(() => {
    let cancelled = false
    const loadCustomer = async () => {
      if (!userId || !getCustomerDetail) {
        setCustomerInfo(null)
        return
      }
      setCustomerLoading(true)
      const res = await getCustomerDetail(userId)
      if (!cancelled) {
        if (res.success) setCustomerInfo(res.data)
        else setCustomerInfo(null)
        setCustomerLoading(false)
      }
    }
    loadCustomer()
    return () => {
      cancelled = true
    }
  }, [userId, getCustomerDetail])

  const filteredOrders = useMemo(() => {
    let filtered = orders

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((o) => String(o.id).includes(searchQuery))
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((o) => normalizeStatus(o.status) === statusFilter)
    }

    return filtered
  }, [orders, searchQuery, statusFilter])

  const orderStats = useMemo(() => {
    const stats = ORDER_STATUSES.reduce(
      (acc, status) => ({
        ...acc,
        [status]: 0,
      }),
      { total: orders.length }
    )

    orders.forEach((order) => {
      const status = normalizeStatus(order.status)
      stats[status] = (stats[status] || 0) + 1
    })

    return stats
  }, [orders])

  

  const handleViewDetails = async (id) => {
    const result = await onGetOrderDetails(id)
    if (result.success) {
      setSelectedOrder(result.data)
      setIsDetailsModalOpen(true)
    } else {
      showToast(result.message, true)
    }
  }

  const handleStatusChange = async (id, status) => {
    if (!onUpdateStatus) return
    const result = await onUpdateStatus(id, status)
    showToast(result.message || (result.success ? 'Order updated' : 'Update failed'), !result.success)
  }

  const handleCancelClick = (id) => {
    setCancelingId(id)
    setIsCancelModalOpen(true)
  }

  const handleConfirmCancel = async () => {
    setModalLoading(true)
    const result = await onCancelOrder(cancelingId)
    if (result.success) {
      showToast(result.message)
      setIsCancelModalOpen(false)
      setCancelingId(null)
    } else {
      showToast(result.message, true)
    }
    setModalLoading(false)
  }

  if (loading) {
    return (
      <div className="page active">
        <Loader />
      </div>
    )
  }

  if (isAdminUser) {
    return (
      <div className="page active admin-orders-page">
        <div className="page-header">
          <div>
            <h2>Order management</h2>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
              Monitor all customer orders and update fulfillment status.
            </p>
          </div>
          <button className="btn btn-ghost" onClick={onRefresh}>
            Refresh
          </button>
        </div>

        {userId && (
          <div style={{ margin: '16px 0', padding: 12, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
            {customerLoading ? (
              <div>Loading customer...</div>
            ) : customerInfo ? (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 24, background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                  {((customerInfo.firstName || '')[0] || (customerInfo.lastName || '')[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{customerInfo.firstName} {customerInfo.lastName}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{customerInfo.phone} • {customerInfo.email}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>ID: {customerInfo.keycloakId || customerInfo.id}</div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--muted)' }}>Customer not found</div>
            )}
          </div>
        )}

        <div className="order-stats-grid">
          <div className="order-stat-tile">
            <span>Total orders</span>
            <strong>{orderStats.total}</strong>
          </div>
          {ORDER_STATUSES.map((status) => (
            <div className="order-stat-tile" key={status}>
              <span>{STATUS_LABELS[status]}</span>
              <strong>{orderStats[status] || 0}</strong>
            </div>
          ))}
        </div>

        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search orders by ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="admin-order-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All status</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="data-table admin-orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Total</th>
                <th>Voucher</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="admin-orders-empty">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                    <td>
                      <strong>{order.items?.length || 0}</strong>
                      <span>{order.productName || 'Order items'}</span>
                    </td>
                    <td>{formatPrice(order.subtotal || order.total || 0)} VND</td>
                    <td>{formatPrice(order.discountAmount || 0)} VND</td>
                    <td>
                      <strong>{formatPrice(order.total || order.totalPrice || 0)} VND</strong>
                    </td>
                    <td>{order.voucherCode || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 500 }}>
                          {STATUS_LABELS[normalizeStatus(order.status)] || normalizeStatus(order.status)}
                        </span>
                        {normalizeStatus(order.status) === 'PENDING' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-sm"
                              onClick={() => handleStatusChange(order.id, 'ACCEPTED')}
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                            >
                              Accept
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancelClick(order.id)}
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="admin-order-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => handleViewDetails(order.id)}>
                          View
                        </button>
                        {normalizeStatus(order.status) !== 'CANCELLED' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleCancelClick(order.id)}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <OrderDetailsModal
          isOpen={isDetailsModalOpen}
          orderData={selectedOrder}
          onClose={() => {
            setIsDetailsModalOpen(false)
            setSelectedOrder(null)
          }}
          onPaymentCompleted={() => {
            onRefresh()
          }}
          onGoHome={onGoHome}
          token={token}
          staticQrImageUrl="/qr.png"
          getCustomerDetail={getCustomerDetail}
        />

        <DeleteConfirmModal
          isOpen={isCancelModalOpen}
          onClose={() => setIsCancelModalOpen(false)}
          onConfirm={handleConfirmCancel}
          isLoading={modalLoading}
        />
      </div>
    )
  }

  return (
    <div className="page active" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2>Orders</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
            Track and manage your orders
          </p>
        </div>
        <button className="btn btn-ghost" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {userId && (
        <div style={{ margin: '16px 0', padding: 12, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
          {customerLoading ? (
            <div>Loading customer...</div>
          ) : customerInfo ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 24, background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                {((customerInfo.firstName || '')[0] || (customerInfo.lastName || '')[0] || 'U').toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{customerInfo.firstName} {customerInfo.lastName}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>{customerInfo.phone} • {customerInfo.email}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>ID: {customerInfo.keycloakId || customerInfo.id}</div>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--muted)' }}>Customer not found</div>
          )}
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search orders by ID…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          style={{
            padding: '9px 14px',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'var(--surface)',
            border: '0.5px solid var(--border2)',
            color: 'var(--text)',
            fontFamily: 'var(--font)',
            cursor: 'pointer',
          }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty">
          <div className="icon">📋</div>
          <p style={{ fontSize: '14px' }}>No orders found</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onViewDetails={handleViewDetails}
              onCancel={handleCancelClick}
            />
          ))}
        </div>
      )}

      <OrderDetailsModal
        isOpen={isDetailsModalOpen}
        orderData={selectedOrder}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedOrder(null)
        }}
        onPaymentCompleted={() => {
          onRefresh()
        }}
        onGoHome={onGoHome}
        token={token}
        staticQrImageUrl="/qr.png"
        getCustomerDetail={getCustomerDetail}
      />

      <DeleteConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        isLoading={modalLoading}
      />
    </div>
  )
}
