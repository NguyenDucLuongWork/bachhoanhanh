/**
 * Vercel Serverless Function to proxy all HTTP backend requests
 * Catches all requests and forwards them to the backend
 */

export default async function handler(req, res) {
  // Only allow GET, POST, PUT, DELETE, PATCH, OPTIONS
  if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    return res.status(200).end()
  }

  try {
    // Get the path from the URL - remove /api prefix
    let path = req.url.replace(/^\/api\/?/, '/')
    
    // Remove query string for now, we'll add it back below
    const queryIndex = path.indexOf('?')
    const queryString = queryIndex >= 0 ? path.substring(queryIndex) : ''
    if (queryIndex >= 0) {
      path = path.substring(0, queryIndex)
    }

    const backendUrl = `http://103.173.226.31${path}${queryString}`

    console.log(`[v0] Proxying ${req.method} ${path} to: ${backendUrl}`)

    const options = {
      method: req.method,
      headers: {
        ...req.headers,
        host: '103.173.226.31',
      },
    }

    // Remove hop-by-hop headers and forwarding headers
    delete options.headers['host']
    delete options.headers['connection']
    delete options.headers['transfer-encoding']
    delete options.headers['x-forwarded-for']
    delete options.headers['x-forwarded-proto']
    delete options.headers['x-forwarded-host']

    let body = undefined
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      if (typeof req.body === 'string') {
        body = req.body
      } else {
        body = JSON.stringify(req.body)
      }
      if (!options.headers['content-type']) {
        options.headers['content-type'] = 'application/json'
      }
    }

    const response = await fetch(backendUrl, body ? { ...options, body } : options)
    const data = await response.text()

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept')
    res.setHeader('Access-Control-Allow-Credentials', 'true')

    // Forward response headers (except hop-by-hop headers)
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
