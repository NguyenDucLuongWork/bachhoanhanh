import { useState, useCallback } from 'react'
import { API_ENDPOINTS } from '../config'

export function useCatalogs(token) {
  const [catalogs, setCatalogs] = useState([])
  const [loading, setLoading] = useState(false)

  const loadCatalogs = useCallback(async () => {
    setLoading(true)
    try {
      const headers = token ? { Authorization: 'Bearer ' + token } : {}
      const res = await fetch(API_ENDPOINTS.CATALOGS, { headers })
      if (!res.ok) throw new Error('Failed to load catalogs')
      const data = await res.json()
      setCatalogs(data)
      return { success: true, data }
    } catch (e) {
      return { success: false, message: e.message }
    } finally {
      setLoading(false)
    }
  }, [token])

  const loadCatalogTree = useCallback(async () => {
    setLoading(true)
    try {
      const headers = token ? { Authorization: 'Bearer ' + token } : {}
      const res = await fetch(API_ENDPOINTS.CATALOGS + '?tree=true', { headers })
      if (!res.ok) throw new Error('Failed to load catalog tree')
      const data = await res.json()
      setCatalogs(data)
      return { success: true, data }
    } catch (e) {
      return { success: false, message: e.message }
    } finally {
      setLoading(false)
    }
  }, [token])

  const addCatalog = useCallback(
    async (catalogData) => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        }
        const res = await fetch(API_ENDPOINTS.CATALOGS, {
          method: 'POST',
          headers,
          body: JSON.stringify(catalogData),
        })
        if (!res.ok) throw new Error('Create failed')
        await loadCatalogTree()
        return { success: true, message: 'Catalog added' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token, loadCatalogTree]
  )

  const updateCatalog = useCallback(
    async (id, catalogData) => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        }
        const res = await fetch(API_ENDPOINTS.CATALOGS + '/' + id, {
          method: 'PUT',
          headers,
          body: JSON.stringify(catalogData),
        })
        if (!res.ok) throw new Error('Update failed')
        await loadCatalogTree()
        return { success: true, message: 'Catalog updated' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token, loadCatalogTree]
  )

  const deleteCatalog = useCallback(
    async (id) => {
      try {
        const headers = token ? { Authorization: 'Bearer ' + token } : {}
        const res = await fetch(API_ENDPOINTS.CATALOGS + '/' + id, {
          method: 'DELETE',
          headers,
        })
        if (!res.ok) throw new Error('Delete failed')
        await loadCatalogTree()
        return { success: true, message: 'Catalog deleted' }
      } catch (e) {
        return { success: false, message: e.message }
      }
    },
    [token, loadCatalogTree]
  )

  return {
    catalogs,
    loading,
    loadCatalogs,
    loadCatalogTree,
    addCatalog,
    updateCatalog,
    deleteCatalog,
  }
}
