import { useState, useEffect, useMemo } from 'react'
import { OrderCard } from '../components/OrderCard'
import { OrderDetailsModal } from '../components/OrderDetailsModal'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { Loader } from '../components/Loader'
import { showToast } from '../components/Toast'
import { formatPrice } from '../utils/helpers'

const ORDER_STATUSES = ['PENDING', 'ACCEPTED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const STATUS_LABELS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  PAID: 'Paid',
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
  // default to last 7 days
  const today = new Date()
  const defaultEndStr = today.toISOString().slice(0, 10)
  const defaultStart = new Date(today)
  defaultStart.setDate(defaultStart.getDate() - 6)
  const defaultStartStr = defaultStart.toISOString().slice(0, 10)
  const [startDate, setStartDate] = useState(defaultStartStr)
  const [endDate, setEndDate] = useState(defaultEndStr)
  const [showPendingOnly, setShowPendingOnly] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [cancelingId, setCancelingId] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [customerInfo, setCustomerInfo] = useState(null)
  const [customerLoading, setCustomerLoading] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)

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

  const getOrderDate = (order) => {
    const value = order.createdAt || order.created_at || order.date
    const date = value ? new Date(value) : null
    return date && !Number.isNaN(date.getTime()) ? date : null
  }

  const parseOrderTotal = (order) => {
    const candidates = [order.total, order.totalPrice, order.grandTotal]
    for (const candidate of candidates) {
      const numeric = Number(candidate)
      if (Number.isFinite(numeric)) return numeric
    }
    return 0
  }

  const filteredOrders = useMemo(() => {
    let filtered = orders

    const query = searchQuery.trim().toLowerCase()
    const hasQuery = Boolean(query)
    const hasStartDate = Boolean(startDate)
    const hasEndDate = Boolean(endDate)
    const start = hasStartDate ? new Date(startDate) : null
    const end = hasEndDate ? new Date(endDate) : null
    if (end) {
      end.setHours(23, 59, 59, 999)
    }

    if (hasQuery) {
      filtered = filtered.filter((o) => String(o.id).toLowerCase().includes(query))
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((o) => normalizeStatus(o.status) === statusFilter)
    }

    if (showPendingOnly) {
      filtered = filtered.filter((o) => normalizeStatus(o.status) === 'PENDING')
    }

    if (hasStartDate || hasEndDate) {
      filtered = filtered.filter((o) => {
        const orderDate = getOrderDate(o)
        if (!orderDate) return false
        if (hasStartDate && orderDate < start) return false
        if (hasEndDate && orderDate > end) return false
        return true
      })
    }

    // Sort orders: newest first by date only
    const sorted = filtered.slice().sort((a, b) => {
      const da = getOrderDate(a)
      const db = getOrderDate(b)

      if (da && db) {
        return db.getTime() - da.getTime()
      } else if (da && !db) {
        return -1
      } else if (!da && db) {
        return 1
      }

      // keep original relative order when no dates
      return 0
    })

    return sorted
  }, [orders, searchQuery, statusFilter, startDate, endDate, showPendingOnly])

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

  const rangeSummary = useMemo(() => {
    let expectedRevenue = 0
    let realRevenue = 0
    const productCounts = {}

    filteredOrders.forEach((order) => {
      const status = normalizeStatus(order.status)
      const orderTotal = parseOrderTotal(order)
      if (status !== 'CANCELLED') {
        expectedRevenue += orderTotal
      }
      if (status === 'PAID') {
        realRevenue += orderTotal
      }

      ;(order.items || []).forEach((item) => {
        const productId = item.productId || item.id || item.product_id || 'unknown'
        const name = item.name || item.productName || item.title || String(productId)
        const quantity = Number(item.quantity ?? item.qty ?? item.amount ?? 0) || 0
        const current = productCounts[productId] || { productId, name, qty: 0 }
        current.qty += quantity
        productCounts[productId] = current
      })
    })

    const topProducts = Object.values(productCounts)
      .filter((product) => product.qty > 0)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6)

    return {
      expectedRevenue,
      realRevenue,
      topProducts,
    }
  }, [filteredOrders])

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
    
// Check if error is from stock service when accepting order
    if (status === 'ACCEPTED' && !result.success) {
      showToast('Order processing error. Please cancel the order.', true)
    } else {
      showToast(result.message || (result.success ? 'Order updated' : 'Update failed'), !result.success)
    }
  }

  const handleCancelClick = (id) => {
    setScrollPosition(window.scrollY || window.pageYOffset)
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
      // Restore scroll position after modal closes
      setTimeout(() => {
        window.scrollTo(0, scrollPosition)
      }, 100)
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginTop: 16 }}>
          <div style={{ padding: 16, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>Expectation Revenue</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{formatPrice(rangeSummary.expectedRevenue)} VND</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>Real Revenue</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>{formatPrice(rangeSummary.realRevenue)} VND</div>
          </div>
          <div style={{ padding: 16, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>Top selling products</div>
            {rangeSummary.topProducts.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: 13 }}>No products found</div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {rangeSummary.topProducts.map((product) => (
                  <div key={product.productId} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{product.name}</span>
                    <strong>{product.qty}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="search-bar" style={{ gap: 12, flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search orders by ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12, color: 'var(--muted)' }}>
              From
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12, color: 'var(--muted)' }}>
              To
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--muted)' }}>
              <input
                type="checkbox"
                checked={showPendingOnly}
                onChange={(e) => setShowPendingOnly(e.target.checked)}
                style={{ width: 14, height: 14 }}
              />
              Show pending only
            </label>
          </div>
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
                        {normalizeStatus(order.status) === 'ACCEPTED' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleStatusChange(order.id, 'PAID')}
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                            >
                              Paid
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
          title="Cancel order?"
          message="This order will be cancelled. This action cannot be undone."
          confirmText="Cancel"
          closeText="Back"
          isDanger={true}
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
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12, color: 'var(--muted)' }}>
            From
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12, color: 'var(--muted)' }}>
            To
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted)' }}>
            <input
              type="checkbox"
              checked={showPendingOnly}
              onChange={(e) => setShowPendingOnly(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            Show pending only
          </label>
        </div>
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
