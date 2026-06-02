import { useCallback, useState } from 'react'

const VOUCHERS_URL = '/vouchers'

export function useVouchers(token) {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(false)

  const loadVouchers = useCallback(async () => {
    setLoading(true)
    try {
      const headers = token ? { Authorization: 'Bearer ' + token } : {}
      const res = await fetch(VOUCHERS_URL, { headers })
      if (!res.ok) throw new Error('Failed to load vouchers')
      const data = await res.json()
      setVouchers(data)
      return { success: true, data }
    } catch (e) {
      return { success: false, message: e.message }
    } finally {
      setLoading(false)
    }
  }, [token])

  const getVoucherById = useCallback(
    async (id) => {
      try {
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const res = await fetch(`${VOUCHERS_URL}/${id}`, { headers })
        if (!res.ok) {
          const errorData = await res.json().catch(() => null)
          throw new Error(errorData?.message || 'Voucher not found')
        }
        const data = await res.json()
        return { success: true, data }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token]
  )

  const getVoucherByCode = useCallback(
    async (code) => {
      try {
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const res = await fetch(`${VOUCHERS_URL}/code/${encodeURIComponent(code)}`, { headers })
        if (!res.ok) {
          const errorData = await res.json().catch(() => null)
          throw new Error(errorData?.message || 'Voucher not found')
        }
        const data = await res.json()
        return { success: true, data }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token]
  )

  const createVoucher = useCallback(
    async (voucherData) => {
      if (!token) return { success: false, message: 'Not authenticated' }
      try {
        const res = await fetch(VOUCHERS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify(voucherData),
        })
        if (!res.ok) {
          const errorData = await res.json().catch(() => null)
          throw new Error(errorData?.message || 'Create voucher failed')
        }
        await loadVouchers()
        return { success: true, message: 'Voucher created' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token, loadVouchers]
  )

  const updateVoucher = useCallback(
    async (id, voucherData) => {
      if (!token) return { success: false, message: 'Not authenticated' }
      try {
        const res = await fetch(`${VOUCHERS_URL}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify(voucherData),
        })
        if (!res.ok) {
          const errorData = await res.json().catch(() => null)
          throw new Error(errorData?.message || 'Update voucher failed')
        }
        await loadVouchers()
        return { success: true, message: 'Voucher updated' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token, loadVouchers]
  )

  const deleteVoucher = useCallback(
    async (id) => {
      if (!token) return { success: false, message: 'Not authenticated' }
      try {
        const res = await fetch(`${VOUCHERS_URL}/${id}`, {
          method: 'DELETE',
          headers: { Authorization: 'Bearer ' + token },
        })
        if (!res.ok) {
          const errorData = await res.json().catch(() => null)
          throw new Error(errorData?.message || 'Delete voucher failed')
        }
        await loadVouchers()
        return { success: true, message: 'Voucher deleted' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token, loadVouchers]
  )

  return {
    vouchers,
    loading,
    loadVouchers,
    getVoucherById,
    getVoucherByCode,
    createVoucher,
    updateVoucher,
    deleteVoucher,
  }
}
