import { useState, useCallback } from 'react'

const PRODUCTS_URL = '/api/products'

export function useProducts(token) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

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
    async (name, price) => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        }
        const res = await fetch(PRODUCTS_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify({ name, price }),
        })
        if (!res.ok) throw new Error('Create failed')
        await loadProducts()
        return { success: true, message: 'Product added' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token, loadProducts]
  )

  const updateProduct = useCallback(
    async (id, name, price) => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        }
        const res = await fetch(PRODUCTS_URL + '/' + id, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ id, name, price }),
        })
        if (!res.ok) throw new Error('Update failed')
        await loadProducts()
        return { success: true, message: 'Product updated' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token, loadProducts]
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
        await loadProducts()
        return { success: true, message: 'Product deleted' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token, loadProducts]
  )

  return {
    products,
    loading,
    loadProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  }
}
