/**
 * Vercel Serverless Function to proxy HTTP backend requests
 * This avoids Mixed Content errors when frontend is HTTPS and backend is HTTP
 */

export default async function handler(req, res) {
  // Only allow GET, POST, PUT, DELETE, PATCH, OPTIONS
  if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  try {
    const { path } = req.query
    if (!path) {
      return res.status(400).json({ error: 'Path parameter required' })
    }

    const backendUrl = `http://103.173.226.31/${Array.isArray(path) ? path.join('/') : path}`
    const queryString = new URLSearchParams(req.query)
    queryString.delete('path')
    const fullUrl = `${backendUrl}${queryString.toString() ? '?' + queryString.toString() : ''}`

    console.log(`[v0] Proxying ${req.method} request to: ${fullUrl}`)

    const options = {
      method: req.method,
      headers: {
        ...req.headers,
        host: '103.173.226.31',
      },
    }

    // Remove headers that shouldn't be forwarded
    delete options.headers['x-forwarded-for']
    delete options.headers['x-forwarded-proto']
    delete options.headers['x-forwarded-host']

    let body = undefined
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      body = JSON.stringify(req.body)
      options.headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(fullUrl, body ? { ...options, body } : options)
    const data = await response.text()

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    // Forward response headers
    const contentType = response.headers.get('content-type')
    if (contentType) {
      res.setHeader('Content-Type', contentType)
    }

    res.status(response.status)
    res.send(data)
  } catch (error) {
    console.error('[v0] Proxy error:', error.message)
    res.status(500).json({ error: 'Proxy error', message: error.message })
  }
}
