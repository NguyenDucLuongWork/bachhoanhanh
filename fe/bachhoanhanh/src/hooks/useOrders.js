import { useState, useCallback } from 'react'

const ORDERS_URL = '/api/orders'

export function useOrders(token) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const headers = token ? { Authorization: 'Bearer ' + token } : {}
      const res = await fetch(ORDERS_URL, { headers })
      if (!res.ok) throw new Error('Failed to load orders')
      const data = await res.json()
      setOrders(data)
      return { success: true, data }
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
        const res = await fetch(ORDERS_URL + '/' + id, { headers })
        if (!res.ok) throw new Error('Failed to load order details')
        const data = await res.json()
        return { success: true, data }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token]
  )

  const updateOrderStatus = useCallback(
    async (id, status) => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        }
        const res = await fetch(ORDERS_URL + '/' + id, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status }),
        })
        if (!res.ok) throw new Error('Update failed')
        await loadOrders()
        return { success: true, message: 'Order updated' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token, loadOrders]
  )

  const cancelOrder = useCallback(
    async (id) => {
      try {
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const res = await fetch(ORDERS_URL + '/' + id, {
          method: 'DELETE',
          headers,
        })
        if (!res.ok) throw new Error('Cancel failed')
        await loadOrders()
        return { success: true, message: 'Order cancelled' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token, loadOrders]
  )

  return {
    orders,
    loading,
    loadOrders,
    getOrderDetails,
    updateOrderStatus,
    cancelOrder,
  }
}
