import { useState, useCallback } from 'react'
import { apiFetch } from '../utils/api'

const PRODUCTS_URL = '/products'
const ATTRIBUTE_TYPES_URL = '/attribute-types'

const buildProductRequest = (productData) => {
  if (!productData.imageFile) {
    return {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    }
  }

  const { imageFile, ...payload } = productData
  const formData = new FormData()
  formData.append('product', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
  formData.append('imageFile', imageFile)
  return { headers: {}, body: formData }
}

export function useProducts(token) {
  const [products, setProducts] = useState([])
  const [attributeTypes, setAttributeTypes] = useState([])
  const [loading, setLoading] = useState(false)

  const loadAttributeTypes = useCallback(async () => {
    try {
      const headers = token ? { Authorization: 'Bearer ' + token } : {}
      const res = await apiFetch(ATTRIBUTE_TYPES_URL, { headers })
      if (!res.ok) throw new Error('Failed to load attribute types')
      const data = await res.json()
      setAttributeTypes(data)
      return { success: true, data }
    } catch (e) {
      return { success: false, message: e.message }
    }
  }, [token])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const headers = token ? { Authorization: 'Bearer ' + token } : {}
      const res = await apiFetch(PRODUCTS_URL, { headers })
      if (!res.ok) throw new Error('Failed to load products')
      const data = await res.json()
      setProducts(data)
      return { success: true, data }
    } catch (e) {
      return { success: false, message: e.message }
    } finally {
      setLoading(false)
    }
  }, [token])

  const addProduct = useCallback(
    async (productData) => {
      try {
        const request = buildProductRequest(productData)
        const headers = {
          ...request.headers,
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        }
        const res = await apiFetch(PRODUCTS_URL, {
          method: 'POST',
          headers,
          body: request.body,
        })
        if (!res.ok) throw new Error('Create failed')
        const data = await res.json()
        setProducts((prev) => [...prev, data])
        return { success: true, message: 'Product added', data }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token]
  )

  const updateProduct = useCallback(
    async (id, productData) => {
      try {
        const request = buildProductRequest(productData)
        const headers = {
          ...request.headers,
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        }
        const res = await apiFetch(PRODUCTS_URL + '/' + id, {
          method: 'PUT',
          headers,
          body: request.body,
        })
        if (!res.ok) throw new Error('Update failed')
        const data = await res.json()
        setProducts((prev) => prev.map((p) => (p.productId === id ? data : p)))
        return { success: true, message: 'Product updated', data }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token]
  )

  const deleteProduct = useCallback(
    async (id) => {
      try {
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const res = await apiFetch(PRODUCTS_URL + '/' + id, {
          method: 'DELETE',
          headers,
        })
        if (!res.ok) throw new Error('Delete failed')
        setProducts((prev) => prev.filter((p) => p.productId !== id))
        return { success: true, message: 'Product deleted' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token]
  )

  const searchProducts = useCallback(
    async (name) => {
      try {
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const res = await apiFetch(PRODUCTS_URL + '/search?name=' + encodeURIComponent(name), { headers })
        if (!res.ok) throw new Error('Search failed')
        const data = await res.json()
        return { success: true, data }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token]
  )

  const getProductsByPrototype = useCallback(
    async (prototypeId) => {
      try {
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const res = await apiFetch(PRODUCTS_URL + '/by-prototype/' + prototypeId, { headers })
        if (!res.ok) throw new Error('Failed to load products by prototype')
        const data = await res.json()
        return { success: true, data }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token]
  )

  const getProductByBarcode = useCallback(
    async (barcode) => {
      try {
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const res = await apiFetch(PRODUCTS_URL + '/barcode/' + barcode, { headers })
        if (!res.ok) throw new Error('Failed to get product by barcode')
        const data = await res.json()
        return { success: true, data }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token]
  )

  const getProductById = useCallback(
    async (id) => {
      try {
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const res = await apiFetch(PRODUCTS_URL + '/' + id, { headers })
        if (!res.ok) throw new Error('Failed to load product details')
        const data = await res.json()
        return { success: true, data }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token]
  )

  return {
    products,
    loading,
    attributeTypes,
    loadProducts,
    loadAttributeTypes,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProductsByPrototype,
    getProductByBarcode,
    getProductById,
  }
}
