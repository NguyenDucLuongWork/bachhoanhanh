import { useState, useCallback } from 'react'

const PRODUCTS_URL = '/products'
const ATTRIBUTE_TYPES_URL = '/attribute-types'

export function useProducts(token) {
  const [products, setProducts] = useState([])
  const [attributeTypes, setAttributeTypes] = useState([])
  const [loading, setLoading] = useState(false)

  const loadAttributeTypes = useCallback(async () => {
    try {
      const headers = token ? { Authorization: 'Bearer ' + token } : {}
      const res = await fetch(ATTRIBUTE_TYPES_URL, { headers })
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
      const res = await fetch(PRODUCTS_URL, { headers })
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
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        }
        const res = await fetch(PRODUCTS_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify(productData),
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
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        }
        const res = await fetch(PRODUCTS_URL + '/' + id, {
          method: 'PUT',
          headers,
          body: JSON.stringify(productData),
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
        const res = await fetch(PRODUCTS_URL + '/' + id, {
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
        const res = await fetch(PRODUCTS_URL + '/search?name=' + encodeURIComponent(name), { headers })
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
        const res = await fetch(PRODUCTS_URL + '/by-prototype/' + prototypeId, { headers })
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
        const res = await fetch(PRODUCTS_URL + '/barcode/' + barcode, { headers })
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
        const res = await fetch(PRODUCTS_URL + '/' + id, { headers })
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
