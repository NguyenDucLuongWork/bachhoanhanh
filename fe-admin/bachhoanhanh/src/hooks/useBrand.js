import { useState, useCallback } from 'react'

const DEBUG = true
const BRANDS_URL = '/brands'

const buildHeaders = (token, extra = {}) => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
  ...extra,
})

const debugLog = (label, payload) => {
  if (!DEBUG) return
  console.groupCollapsed(`useBrand ${label}`)
  console.log(payload)
  console.groupEnd()
}

const executeBrandRequest = async (path, options = {}) => {
  const url = `${BRANDS_URL}${path}`
  const requestOptions = {
    method: options.method || 'GET',
    headers: options.headers || {},
    body: options.body,
  }

  debugLog('request', { url, requestOptions })

  const res = await fetch(url, requestOptions)
  const contentType = res.headers.get('content-type') || ''
  let data = null

  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => null)
  } else {
    data = await res.text().catch(() => null)
  }

  debugLog('response', {
    url,
    status: res.status,
    ok: res.ok,
    headers: Object.fromEntries(res.headers.entries()),
    body: data,
  })

  return { res, data }
}

export function useBrand(token) {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(false)

  const loadBrands = useCallback(
    async (name = '') => {
      setLoading(true)
      try {
        const query = typeof name === 'string' && name.trim() ? `?name=${encodeURIComponent(name.trim())}` : ''
        const { res, data } = await executeBrandRequest(query, {
          headers: buildHeaders(token),
        })

        if (!res.ok) {
          throw new Error(data?.message || 'Failed to load brands')
        }

        setBrands(Array.isArray(data) ? data : [])
        return { success: true, data }
      } catch (e) {
        return { success: false, message: e.message }
      } finally {
        setLoading(false)
      }
    },
    [token]
  )

  const searchBrands = useCallback(
    async (search = '') => {
      try {
        const query = typeof search === 'string' && search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
        const { res, data } = await executeBrandRequest(query, {
          headers: buildHeaders(token),
        })

        if (!res.ok) {
          throw new Error(data?.message || 'Failed to search brands')
        }

        return { success: true, data }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token]
  )

  const getBrandById = useCallback(
    async (id) => {
      try {
        const { res, data } = await executeBrandRequest(`/${id}`, {
          headers: buildHeaders(token),
        })

        if (!res.ok) {
          throw new Error(data?.message || 'Failed to load brand details')
        }

        return { success: true, data }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token]
  )

  const getBrandByName = useCallback(
    async (name) => {
      try {
        if (!name?.trim()) {
          throw new Error('Brand name is required')
        }

        const query = `?name=${encodeURIComponent(name.trim())}`
        const { res, data } = await executeBrandRequest(query, {
          headers: buildHeaders(token),
        })

        if (!res.ok) {
          throw new Error(data?.message || 'Failed to load brand by name')
        }

        const brand = Array.isArray(data) ? data[0] : data
        if (!brand) {
          throw new Error('Brand not found')
        }

        return { success: true, data: brand }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token]
  )

  const createBrand = useCallback(
    async (brandData) => {
      try {
        const { res, data } = await executeBrandRequest('', {
          method: 'POST',
          headers: buildHeaders(token, { 'Content-Type': 'application/json' }),
          body: JSON.stringify(brandData),
        })

        if (!res.ok) {
          throw new Error(data?.message || 'Create brand failed')
        }

        setBrands((prev) => [...prev, data])
        return { success: true, data, message: 'Brand created' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token]
  )

  const updateBrand = useCallback(
    async (id, brandData) => {
      try {
        const { res, data } = await executeBrandRequest(`/${id}`, {
          method: 'PUT',
          headers: buildHeaders(token, { 'Content-Type': 'application/json' }),
          body: JSON.stringify(brandData),
        })

        if (!res.ok) {
          throw new Error(data?.message || 'Update brand failed')
        }

        setBrands((prev) => prev.map((item) => (item.id === id ? data : item)))
        return { success: true, data, message: 'Brand updated' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token]
  )

  const deleteBrand = useCallback(
    async (id) => {
      try {
        const { res } = await executeBrandRequest(`/${id}`, {
          method: 'DELETE',
          headers: buildHeaders(token),
        })

        if (!res.ok) {
          throw new Error('Delete brand failed')
        }

        setBrands((prev) => prev.filter((item) => item.id !== id))
        return { success: true, message: 'Brand deleted' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token]
  )

  return {
    brands,
    loading,
    loadBrands,
    searchBrands,
    getBrandByName,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
  }
}