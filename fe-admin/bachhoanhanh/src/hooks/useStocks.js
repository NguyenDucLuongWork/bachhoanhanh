import { useState, useCallback } from 'react'

const STOCKS_URL = '/stocks'

const buildHeaders = (token, extra = {}) => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...extra,
})

const parseResponse = async (res) => {
  const contentType = res.headers.get('content-type') || ''
  return contentType.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null)
}

const executeStockRequest = async (path, options = {}) => {
  const url = `${STOCKS_URL}${path}`
  const res = await fetch(url, options)
  const data = await parseResponse(res)
  return { res, data }
}

export function useStocks(token) {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(false)

  const loadStocks = useCallback(
    async (productId = '') => {
      setLoading(true)
      try {
        const query =
          typeof productId === 'string' && productId.trim()
            ? `?productId=${encodeURIComponent(productId.trim())}`
            : ''
        const { res, data } = await executeStockRequest(query, {
          method: 'GET',
          headers: buildHeaders(token),
        })
        if (!res.ok) {
          throw new Error(data?.message || 'Failed to load stocks')
        }
        setStocks(Array.isArray(data) ? data : [])
        return { success: true, data }
      } catch (error) {
        return { success: false, message: error.message }
      } finally {
        setLoading(false)
      }
    },
    [token]
  )

  const createStock = useCallback(
    async (payload) => {
      try {
        const { res, data } = await executeStockRequest('', {
          method: 'POST',
          headers: buildHeaders(token, { 'Content-Type': 'application/json' }),
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          throw new Error(data?.message || 'Failed to create stock')
        }
        return { success: true, data }
      } catch (error) {
        return { success: false, message: error.message }
      }
    },
    [token]
  )

  const updateStock = useCallback(
    async (id, payload) => {
      try {
        const { res, data } = await executeStockRequest(`/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: buildHeaders(token, { 'Content-Type': 'application/json' }),
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          throw new Error(data?.message || 'Failed to update stock')
        }
        return { success: true, data }
      } catch (error) {
        return { success: false, message: error.message }
      }
    },
    [token]
  )

  const deleteStock = useCallback(
    async (id) => {
      try {
        const { res, data } = await executeStockRequest(`/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          headers: buildHeaders(token),
        })
        if (!res.ok) {
          throw new Error(data?.message || 'Failed to delete stock')
        }
        return { success: true, data }
      } catch (error) {
        return { success: false, message: error.message }
      }
    },
    [token]
  )

  return {
    stocks,
    loading,
    loadStocks,
    createStock,
    updateStock,
    deleteStock,
  }
}
