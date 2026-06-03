import { useState, useCallback } from 'react'
import { API_ENDPOINTS } from '../config'

export function usePrototypes(token) {
  const [prototypes, setPrototypes] = useState([])
  const [loading, setLoading] = useState(false)

  const loadPrototypes = useCallback(async () => {
    setLoading(true)
    try {
      const headers = token ? { Authorization: 'Bearer ' + token } : {}
      const res = await fetch(API_ENDPOINTS.PROTOTYPES, { headers })
      if (!res.ok) throw new Error('Failed to load prototypes')
      const data = await res.json()
      setPrototypes(data)
      return { success: true, data }
    } catch (e) {
      return { success: false, message: e.message }
    } finally {
      setLoading(false)
    }
  }, [token])

  const getPrototypesByCatalog = useCallback(
    async (catalogId) => {
      try {
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const res = await fetch(API_ENDPOINTS.PROTOTYPES + '/by-catalog/' + catalogId, { headers })
        if (!res.ok) throw new Error('Failed to load prototypes by catalog')
        const data = await res.json()
        return { success: true, data }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token]
  )

  const getPrototypeById = useCallback(
    async (id) => {
      try {
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const res = await fetch(API_ENDPOINTS.PROTOTYPES + '/' + id, { headers })
        if (!res.ok) throw new Error('Failed to get prototype')
        const data = await res.json()
        return { success: true, data }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token]
  )

  const createPrototype = useCallback(
    async (prototypeData) => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        }
        const res = await fetch(API_ENDPOINTS.PROTOTYPES, {
          method: 'POST',
          headers,
          body: JSON.stringify(prototypeData),
        })
        if (!res.ok) throw new Error('Create failed')
        await loadPrototypes()
        return { success: true, message: 'Prototype added' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token, loadPrototypes]
  )

  const updatePrototypeInfo = useCallback(
    async (id, prototypeData) => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        }
        const res = await fetch(API_ENDPOINTS.PROTOTYPES + '/' + id + '/info', {
          method: 'PATCH',
          headers,
          body: JSON.stringify(prototypeData),
        })
        if (!res.ok) throw new Error('Update failed')
        await loadPrototypes()
        return { success: true, message: 'Prototype updated' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token, loadPrototypes]
  )

  const updatePrototypeAttributes = useCallback(
    async (id, prototypeData) => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        }
        const res = await fetch(API_ENDPOINTS.PROTOTYPES + '/' + id + '/attributes', {
          method: 'PATCH',
          headers,
          body: JSON.stringify(prototypeData),
        })
        if (!res.ok) throw new Error('Update failed')
        await loadPrototypes()
        return { success: true, message: 'Prototype attributes updated' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token, loadPrototypes]
  )

  const addAttributeToPrototype = useCallback(
    async (id, typeName) => {
      try {
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const res = await fetch(API_ENDPOINTS.PROTOTYPES + '/' + id + '/attributes/add?typeName=' + encodeURIComponent(typeName), {
          method: 'PATCH',
          headers,
        })
        if (!res.ok) throw new Error('Add attribute failed')
        await loadPrototypes()
        return { success: true, message: 'Attribute added' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token, loadPrototypes]
  )

  const removeAttributeFromPrototype = useCallback(
    async (id, typeName) => {
      try {
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const res = await fetch(API_ENDPOINTS.PROTOTYPES + '/' + id + '/attributes/remove?typeName=' + encodeURIComponent(typeName), {
          method: 'PATCH',
          headers,
        })
        if (!res.ok) throw new Error('Remove attribute failed')
        await loadPrototypes()
        return { success: true, message: 'Attribute removed' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token, loadPrototypes]
  )

  const deletePrototype = useCallback(
    async (id) => {
      try {
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const res = await fetch(API_ENDPOINTS.PROTOTYPES + '/' + id, {
          method: 'DELETE',
          headers,
        })
        if (!res.ok) throw new Error('Delete failed')
        await loadPrototypes()
        return { success: true, message: 'Prototype deleted' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token, loadPrototypes]
  )

  return {
    prototypes,
    loading,
    loadPrototypes,
    getPrototypesByCatalog,
    getPrototypeById,
    createPrototype,
    updatePrototypeInfo,
    updatePrototypeAttributes,
    addAttributeToPrototype,
    removeAttributeFromPrototype,
    deletePrototype,
  }
}