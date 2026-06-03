import { useState, useEffect, useMemo } from 'react'
import { OrderCard } from '../components/OrderCard'
import { OrderDetailsModal } from '../components/OrderDetailsModal'
import { DeleteConfirmModal } from '../components/DeleteConfirmModal'
import { Loader } from '../components/Loader'
import { showToast } from '../components/Toast'

const normalizeStatus = (status) => (status || 'PENDING').toUpperCase()

export function OrdersPage({
  orders,
  loading,
  onLoadOrders,
  onGetOrderDetails,
  onCancelOrder,
  onRefresh,
  onGoHome,
  token,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [cancelingId, setCancelingId] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)

  useEffect(() => {
    onLoadOrders()
  }, [onLoadOrders])

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

  const handleViewDetails = async (id) => {
    const result = await onGetOrderDetails(id)
    if (result.success) {
      setSelectedOrder(result.data)
      setIsDetailsModalOpen(true)
    } else {
      showToast(result.message, true)
    }
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
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
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
