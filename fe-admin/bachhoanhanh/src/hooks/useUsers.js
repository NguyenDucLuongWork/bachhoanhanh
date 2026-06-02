import { useState, useCallback } from 'react'

const USERS_URL = '/users'

export function useUsers(token) {
  const [customers, setCustomers] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(false)
  const [customerDetail, setCustomerDetail] = useState(null)

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const headers = token ? { Authorization: 'Bearer ' + token } : {}
      const res = await fetch(`${USERS_URL}/customers`, { headers })
      if (!res.ok) throw new Error('Failed to load customers')
      const data = await res.json()
      setCustomers(Array.isArray(data) ? data : [])
      return { success: true, data }
    } catch (e) {
      return { success: false, message: e.message }
    } finally {
      setLoading(false)
    }
  }, [token])

  const loadStaff = useCallback(async () => {
    setLoading(true)
    try {
      const headers = token ? { Authorization: 'Bearer ' + token } : {}
      const res = await fetch(`${USERS_URL}/staff`, { headers })
      if (!res.ok) throw new Error('Failed to load staff')
      const data = await res.json()
      setStaff(Array.isArray(data) ? data : [])
      return { success: true, data }
    } catch (e) {
      return { success: false, message: e.message }
    } finally {
      setLoading(false)
    }
  }, [token])

  const getCustomerDetail = useCallback(async (id) => {
    try {
      const headers = token ? { Authorization: 'Bearer ' + token } : {}
      const res = await fetch(`${USERS_URL}/${id}`, { headers })
      if (!res.ok) throw new Error('Failed to load customer details')
      const data = await res.json()
      setCustomerDetail(data)
      return { success: true, data }
    } catch (e) {
      return { success: false, message: e.message }
    }
  }, [token])

  const searchCustomerByPhone = useCallback(async (phone) => {
    try {
      const headers = token ? { Authorization: 'Bearer ' + token } : {}
      const res = await fetch(`${USERS_URL}/customers/search?phone=${encodeURIComponent(phone)}`, { headers })
      if (!res.ok) throw new Error('Failed to search customer')
      const data = await res.json()
      return { success: true, data }
    } catch (e) {
      return { success: false, message: e.message }
    }
  }, [token])

  const createStaff = useCallback(async (staffData) => {
    try {
      const headers = token ? { Authorization: 'Bearer ' + token } : {}
      const res = await fetch(`${USERS_URL}/staff`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData),
      })
      if (!res.ok) throw new Error('Failed to create staff')
      const data = await res.json()
      setStaff((prev) => [...prev, data])
      return { success: true, data }
    } catch (e) {
      return { success: false, message: e.message }
    }
  }, [token])

  const updateStaff = useCallback(async (id, staffData) => {
    try {
      const headers = token ? { Authorization: 'Bearer ' + token } : {}
      const res = await fetch(`${USERS_URL}/staff/${id}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData),
      })
      if (!res.ok) throw new Error('Failed to update staff')
      const data = await res.json()
      setStaff((prev) => prev.map((s) => (s.id === id ? data : s)))
      return { success: true, data }
    } catch (e) {
      return { success: false, message: e.message }
    }
  }, [token])

  const updateCustomer = useCallback(async (id, customerData) => {
    try {
      const headers = token ? { Authorization: 'Bearer ' + token } : {}
      const res = await fetch(`${USERS_URL}/${id}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      })
      if (!res.ok) throw new Error('Failed to update customer')
      const data = await res.json()
      setCustomers((prev) => prev.map((c) => (c.id === id ? data : c)))
      return { success: true, data }
    } catch (e) {
      return { success: false, message: e.message }
    }
  }, [token])

  const deleteUser = useCallback(async (id) => {
    try {
      const headers = token ? { Authorization: 'Bearer ' + token } : {}
      const res = await fetch(`${USERS_URL}/${id}`, {
        method: 'DELETE',
        headers,
      })
      if (!res.ok) throw new Error('Failed to delete user')
      setCustomers((prev) => prev.filter((c) => c.id !== id))
      setStaff((prev) => prev.filter((s) => s.id !== id))
      return { success: true }
    } catch (e) {
      return { success: false, message: e.message }
    }
  }, [token])

  return {
    customers,
    staff,
    customerDetail,
    loading,
    loadCustomers,
    loadStaff,
    getCustomerDetail,
    searchCustomerByPhone,
    createStaff,
    updateStaff,
    updateCustomer,
    deleteUser,
  }
}
