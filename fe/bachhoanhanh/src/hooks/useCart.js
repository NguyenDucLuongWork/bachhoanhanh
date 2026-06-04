import { useCallback, useEffect, useMemo, useState } from 'react'
import { showToast } from '../components/Toast'
import { apiFetch } from '../utils/api'

const CART_URL = '/cart'

export function useCart(token) {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)

  const authHeaders = useCallback(
    () => (token ? { Authorization: 'Bearer ' + token } : {}),
    [token]
  )

  const loadCart = useCallback(async () => {
    if (!token) {
      setCartItems([])
      return { success: true, data: [] }
    }
    setLoading(true)
    try {
      const res = await apiFetch(CART_URL, { headers: authHeaders() })
      if (!res.ok) throw new Error('Failed to load cart')
      const data = await res.json()
      setCartItems(data)
      return { success: true, data }
    } catch (e) {
      return { success: false, message: e.message }
    } finally {
      setLoading(false)
    }
  }, [authHeaders, token])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  )

  const addToCart = useCallback(
    async (product) => {
      if (!token) return { success: false, message: 'Login required' }
      try {
        console.log(token)

        const res = await apiFetch(CART_URL + '/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
          },
          body: JSON.stringify({
            productId: product.productId,
            barcode: product.barcode,
            name: product.name,
            image: product.image,
            description: product.description,
            catalogId: product.catalogId,
            prototypeId: product.prototypeId,
            originalPrice: product.originalPrice,
            quantity: product.requestedQuantity || product.quantity || 1,
          }),
        })
        if (!res.ok) throw new Error('Failed to add item to cart')
        const data = await res.json()
        setCartItems(data)
        showToast('Added to cart')
        return { success: true, data }
      } catch (e) {
        showToast(e.message, true)
        return { success: false, message: e.message }
      }
    },
    [authHeaders, token]
  )

  const updateCartQuantity = useCallback(
    async (productId, quantity) => {
      if (!token) return { success: false, message: 'Login required' }
      try {
        const res = await apiFetch(CART_URL + '/items/' + productId, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders(),
          },
          body: JSON.stringify({ quantity }),
        })
        if (!res.ok) throw new Error('Failed to update cart')
        const data = await res.json()
        setCartItems(data)
        return { success: true, data }
      } catch (e) {
        showToast(e.message, true)
        return { success: false, message: e.message }
      }
    },
    [authHeaders, token]
  )

  const removeCartItem = useCallback(
    async (productId) => {
      if (!token) return { success: false, message: 'Login required' }
      try {
        const res = await apiFetch(CART_URL + '/items/' + productId, {
          method: 'DELETE',
          headers: authHeaders(),
        })
        if (!res.ok) throw new Error('Failed to remove cart item')
        const data = await res.json()
        setCartItems(data)
        return { success: true, data }
      } catch (e) {
        showToast(e.message, true)
        return { success: false, message: e.message }
      }
    },
    [authHeaders, token]
  )

  const clearCart = useCallback(async () => {
    if (!token) {
      setCartItems([])
      return { success: true }
    }
    try {
      const res = await apiFetch(CART_URL, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Failed to clear cart')
      setCartItems([])
      return { success: true }
    } catch (e) {
      showToast(e.message, true)
      return { success: false, message: e.message }
    }
  }, [authHeaders, token])

  return {
    cartItems,
    cartCount,
    loading,
    loadCart,
    addToCart,
    updateCartQuantity,
    removeCartItem,
    clearCart,
  }
}
