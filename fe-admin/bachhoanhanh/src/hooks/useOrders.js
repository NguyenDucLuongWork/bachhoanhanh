import { useState, useCallback } from 'react'
import { API_ENDPOINTS } from '../config'

export function useOrders(token) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastUserId, setLastUserId] = useState(null)

  const loadOrders = useCallback(async (userId = null) => {
    setLoading(true)
    setLastUserId(userId)
    try {
      const headers = token ? { Authorization: 'Bearer ' + token } : {}
      let url = API_ENDPOINTS.ORDERS
      if (userId) {
        const sep = url.includes('?') ? '&' : '?'
        url = `${url}${sep}userId=${encodeURIComponent(userId)}`
      }
      const res = await fetch(url, { headers })
      if (!res.ok) throw new Error('Failed to load orders')
      let data = await res.json()
      
      // Ensure each order has a status field
      let ordersWithStatus = (Array.isArray(data) ? data : []).map(order => ({
        ...order,
        status: order.status || 'pending'
      }))
      
      // Check if any order is missing the status field (when status is falsy and was defaulted to pending)
      const needsDetailFetch = ordersWithStatus.length > 0 && ordersWithStatus.some(o => !data.find(d => d.id === o.id)?.status)
      
      if (needsDetailFetch) {
        try {
          const detailedOrders = await Promise.all(
            ordersWithStatus.map(async (order) => {
              // Skip if order already has a real status (not just default)
              const originalOrder = data.find(d => d.id === order.id)
              if (originalOrder?.status) {
                return order
              }
              
              const detailRes = await fetch(API_ENDPOINTS.ORDERS + '/' + order.id, { headers })
              if (detailRes.ok) {
                const details = await detailRes.json()
                return { ...order, ...details, status: details.status || 'pending' }
              }
              return order
            })
          )
          ordersWithStatus = detailedOrders
        } catch (e) {
          console.error('Error fetching order details:', e)
          // Continue with partial data
        }
      }
      
      setOrders(ordersWithStatus)
      return { success: true, data: ordersWithStatus }
    } catch (e) {
      return { success: false, message: e.message }
    } finally {
      setLoading(false)
    }
  }, [token])

  const getOrderDetails = useCallback(
    async (id) => {
      try {
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const res = await fetch(API_ENDPOINTS.ORDERS + '/' + id, { headers })
        if (!res.ok) throw new Error('Failed to load order details')
        const data = await res.json()
        return { success: true, data }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token]
  )

  const createOrder = useCallback(
    async (itemsOrProductId, quantity, voucherCode) => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        }
        const body = Array.isArray(itemsOrProductId)
          ? {
              items: itemsOrProductId.map((item) => ({
                productId: String(item.productId),
                quantity: item.quantity,
              })),
              voucherCode: voucherCode || null,
            }
          : {
              productId: String(itemsOrProductId),
              quantity,
              voucherCode: voucherCode || null,
            }
        const res = await fetch(API_ENDPOINTS.ORDERS, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const errorData = await res.json().catch(() => null)
          throw new Error(errorData?.message || 'Create order failed')
        }
        const data = await res.json()
        await loadOrders()
        return { success: true, message: 'Order created', data }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token, loadOrders]
  )

  const updateOrderStatus = useCallback(
    async (id, status) => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        }
        const res = await fetch(API_ENDPOINTS.ORDERS + '/' + id, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status }),
        })
        if (!res.ok) throw new Error('Update failed')
        
        // Update local state immediately
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === id ? { ...order, status } : order
          )
        )
        
        // Then refresh from server
        await loadOrders(lastUserId)
        return { success: true, message: 'Order updated' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token, loadOrders, lastUserId]
  )

  const cancelOrder = useCallback(
    async (id) => {
      try {
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const res = await fetch(API_ENDPOINTS.ORDERS + '/' + id, {
          method: 'DELETE',
          headers,
        })
        if (!res.ok) throw new Error('Cancel failed')
        
        // Update local state immediately - set status to 'cancelled'
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === id ? { ...order, status: 'cancelled' } : order
          )
        )
        
        // Then refresh from server
        await loadOrders(lastUserId)
        return { success: true, message: 'Order cancelled' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token, loadOrders, lastUserId]
  )

  return {
    orders,
    loading,
    loadOrders,
    createOrder,
    getOrderDetails,
    updateOrderStatus,
    cancelOrder,
  }
}
