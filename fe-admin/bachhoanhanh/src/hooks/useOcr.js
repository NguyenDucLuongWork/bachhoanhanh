import { useState } from 'react'
import { API_ENDPOINTS } from '../config'

export default function useOcr(baseUrl = '') {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const extract = async (file) => {
    if (!file) return null
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('image', file)

      // Try a set of likely base URLs to handle dev/proxy/container differences
      const candidateBases = []
      // Use configured API endpoint first
      const ocrBase = API_ENDPOINTS.OCR.replace(/\/api\/ocr$/, '')
      if (ocrBase) candidateBases.push(ocrBase)
      // relative first (works when frontend proxies /api to backend)
      candidateBases.push('')
      // common local dev hosts
      candidateBases.push('http://127.0.0.1:8090')
      candidateBases.push('http://localhost:8090')

      let lastError = null
      for (const b of candidateBases) {
        const url = `${b || ''}${b ? '' : ''}${b ? '/api/ocr/extract' : '/api/ocr/extract'}`
        // include auth token from localStorage (gateway expects Bearer token)
        const storedToken = localStorage.getItem('bhn_access_token')
        const headers = storedToken ? { Authorization: 'Bearer ' + storedToken } : {}
        try {
          const res = await fetch(url, { method: 'POST', body: fd, mode: 'cors', headers })
          // If server responds 404, try next candidate
          if (res.status === 404) {
            lastError = `404 from ${url}`
            continue
          }

          const text = await res.text()
          let data = null
          try {
            data = text ? JSON.parse(text) : null
          } catch (e) {
            data = { raw_text: text }
          }

          if (!res.ok) {
            const msg = (data && (data.error || data.message)) || text || `HTTP ${res.status} from ${url}`
            setError(msg)
            setLoading(false)
            return null
          }

          setResult(data)
          setLoading(false)
          return data
        } catch (err) {
          lastError = String(err)
          // try next candidate
        }
      }

      setError(lastError || 'No OCR endpoint reachable')
      setLoading(false)
      return null
    } catch (err) {
      setError(String(err))
      setLoading(false)
      return null
    }
  }

  return {
    loading,
    error,
    result,
    extract,
    clear: () => {
      setError(null)
      setResult(null)
    },
  }
}
