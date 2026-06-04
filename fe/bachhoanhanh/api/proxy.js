const BACKEND_URL = process.env.BACKEND_URL || 'http://103.173.226.31'

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { path } = req.query
  
  if (!path) {
    res.status(400).json({ error: 'path parameter required' })
    return
  }

  const pathArray = Array.isArray(path) ? path : [path]
  const targetPath = '/' + pathArray.join('/')
  const targetUrl = `${BACKEND_URL}${targetPath}`

  try {
    // Build request options
    const options = {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(BACKEND_URL).host,
      },
    }

    // Remove headers that shouldn't be forwarded
    delete options.headers['x-forwarded-for']
    delete options.headers['x-forwarded-proto']
    delete options.headers['x-forwarded-host']
    delete options.headers.connection

    // Forward body for non-GET requests
    let body = null
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = JSON.stringify(req.body)
      options.headers['content-type'] = 'application/json'
      options.headers['content-length'] = Buffer.byteLength(body)
    }

    // Make request to backend
    const response = await fetch(targetUrl, {
      ...options,
      body,
    })

    // Forward status and headers
    res.status(response.status)
    
    // Copy relevant headers
    const headersToForward = [
      'content-type',
      'content-length',
      'cache-control',
      'set-cookie',
    ]
    
    headersToForward.forEach((header) => {
      const value = response.headers.get(header)
      if (value) {
        res.setHeader(header, value)
      }
    })

    // Send response body
    const data = await response.arrayBuffer()
    res.send(Buffer.from(data))
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(502).json({ error: 'Backend unavailable', message: error.message })
  }
}
