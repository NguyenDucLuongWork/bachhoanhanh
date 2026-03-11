import { useState, useRef } from 'react'

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const METHOD_COLORS = {
  GET: '#34d399',
  POST: '#60a5fa',
  PUT: '#fbbf24',
  PATCH: '#a78bfa',
  DELETE: '#f87171',
}

const DEFAULT_HEADERS = [
  { key: 'Content-Type', value: 'application/json', enabled: true },
  { key: 'Authorization', value: 'Bearer <token>', enabled: false },
]

function ParamRow({ row, onChange, onRemove }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <input
        className="at-input"
        placeholder="Key"
        value={row.key}
        onChange={e => onChange({ ...row, key: e.target.value })}
        style={{ flex: 1 }}
      />
      <input
        className="at-input"
        placeholder="Value"
        value={row.value}
        onChange={e => onChange({ ...row, value: e.target.value })}
        style={{ flex: 2 }}
      />
      <label className="at-checkbox-label" title="Enable">
        <input
          type="checkbox"
          checked={row.enabled}
          onChange={e => onChange({ ...row, enabled: e.target.checked })}
          style={{ accentColor: '#a78bfa' }}
        />
      </label>
      <button className="at-icon-btn" onClick={onRemove} title="Remove">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  )
}

export default function ApiTester({ visible }) {
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('http://localhost:9000/products')
  const [activeTab, setActiveTab] = useState('params')
  const [params, setParams] = useState([{ key: '', value: '', enabled: true }])
  const [headers, setHeaders] = useState(DEFAULT_HEADERS)
  const [body, setBody] = useState('{\n  \n}')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [elapsed, setElapsed] = useState(null)
  const [responseTab, setResponseTab] = useState('body')
  const abortRef = useRef(null)

  const addRow = (list, setter) =>
    setter([...list, { key: '', value: '', enabled: true }])

  const updateRow = (list, setter, idx, val) =>
    setter(list.map((r, i) => (i === idx ? val : r)))

  const removeRow = (list, setter, idx) =>
    setter(list.filter((_, i) => i !== idx))

  const buildUrl = () => {
    const activeParams = params.filter(p => p.enabled && p.key)
    if (!activeParams.length) return url
    const qs = new URLSearchParams(activeParams.map(p => [p.key, p.value])).toString()
    return `${url}${url.includes('?') ? '&' : '?'}${qs}`
  }

  const send = async () => {
    if (loading) { abortRef.current?.abort(); return }
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setResponse(null)
    const t0 = performance.now()
    try {
      const activeHeaders = headers.filter(h => h.enabled && h.key)
      const headersObj = Object.fromEntries(activeHeaders.map(h => [h.key, h.value]))
      const opts = {
        method,
        headers: headersObj,
        signal: controller.signal,
      }
      if (['POST', 'PUT', 'PATCH'].includes(method) && body.trim()) {
        opts.body = body
      }
      const res = await fetch(buildUrl(), opts)
      const ms = Math.round(performance.now() - t0)
      setElapsed(ms)
      const contentType = res.headers.get('content-type') || ''
      let data
      if (contentType.includes('json')) {
        data = await res.json()
      } else {
        data = await res.text()
      }
      const responseHeaders = {}
      res.headers.forEach((v, k) => { responseHeaders[k] = v })
      setResponse({
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        data,
        headers: responseHeaders,
        type: contentType.includes('json') ? 'json' : 'text',
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        setResponse({ error: err.message, ok: false })
      }
      setElapsed(Math.round(performance.now() - t0))
    } finally {
      setLoading(false)
    }
  }

  if (!visible) return null

  const statusColor = response
    ? response.ok ? '#34d399' : '#f87171'
    : '#52525b'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Syne:wght@500;700&display=swap');

        .at-root {
          font-family: 'Syne', sans-serif;
          background: #0c0c0f;
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .at-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1.5rem;
        }

        .at-top-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .at-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: #a78bfa;
          text-transform: uppercase;
          background: rgba(167, 139, 250, 0.1);
          border: 1px solid rgba(167, 139, 250, 0.2);
          padding: 3px 10px;
          border-radius: 6px;
        }

        .at-title {
          font-size: 1rem;
          font-weight: 700;
          color: #e4e4e7;
          margin-left: 0.25rem;
        }

        .at-url-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .at-method-select {
          background: #18181b;
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 9px;
          color: ${METHOD_COLORS[method]};
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 0 14px;
          cursor: pointer;
          outline: none;
          min-width: 90px;
          transition: border-color 0.2s;
          appearance: none;
          -webkit-appearance: none;
          text-align: center;
        }

        .at-method-select:focus {
          border-color: rgba(167,139,250,0.4);
        }

        .at-url-input {
          flex: 1;
          background: #18181b;
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 9px;
          color: #e4e4e7;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          padding: 0 14px;
          height: 42px;
          outline: none;
          transition: border-color 0.2s;
        }

        .at-url-input:focus {
          border-color: rgba(167,139,250,0.4);
        }

        .at-send-btn {
          padding: 0 24px;
          height: 42px;
          border-radius: 9px;
          border: none;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          letter-spacing: 0.04em;
          min-width: 90px;
        }

        .at-send-btn.idle {
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: white;
          box-shadow: 0 4px 16px rgba(124,58,237,0.35);
        }

        .at-send-btn.idle:hover {
          box-shadow: 0 6px 20px rgba(124,58,237,0.5);
          transform: translateY(-1px);
        }

        .at-send-btn.loading {
          background: rgba(248,113,113,0.12);
          color: #f87171;
          border: 1.5px solid rgba(248,113,113,0.3);
        }

        .at-panels {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media(max-width: 768px) {
          .at-panels { grid-template-columns: 1fr; }
        }

        .at-panel {
          background: #18181b;
          border: 1.5px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          overflow: hidden;
        }

        .at-panel-tabs {
          display: flex;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0 0.75rem;
        }

        .at-tab {
          padding: 10px 14px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #52525b;
          cursor: pointer;
          border: none;
          background: transparent;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: all 0.2s;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.01em;
        }

        .at-tab.active {
          color: #a78bfa;
          border-bottom-color: #a78bfa;
        }

        .at-tab:hover:not(.active) {
          color: #a1a1aa;
        }

        .at-panel-body {
          padding: 0.875rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-height: 160px;
          max-height: 320px;
          overflow-y: auto;
        }

        .at-panel-body::-webkit-scrollbar { width: 5px; }
        .at-panel-body::-webkit-scrollbar-track { background: transparent; }
        .at-panel-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }

        .at-input {
          background: #09090b;
          border: 1.5px solid rgba(255,255,255,0.06);
          border-radius: 7px;
          color: #e4e4e7;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.78rem;
          padding: 6px 10px;
          height: 34px;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
          box-sizing: border-box;
        }

        .at-input:focus {
          border-color: rgba(167,139,250,0.35);
        }

        .at-checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        .at-icon-btn {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.07);
          background: transparent;
          color: #52525b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .at-icon-btn:hover {
          background: rgba(248,113,113,0.1);
          color: #f87171;
          border-color: rgba(248,113,113,0.25);
        }

        .at-add-btn {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          color: #52525b;
          background: transparent;
          border: 1px dashed rgba(255,255,255,0.07);
          border-radius: 7px;
          padding: 6px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .at-add-btn:hover {
          color: #a78bfa;
          border-color: rgba(167,139,250,0.3);
        }

        .at-textarea {
          background: #09090b;
          border: 1.5px solid rgba(255,255,255,0.06);
          border-radius: 7px;
          color: #e4e4e7;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.78rem;
          padding: 10px;
          resize: vertical;
          min-height: 140px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          line-height: 1.6;
          transition: border-color 0.2s;
        }

        .at-textarea:focus {
          border-color: rgba(167,139,250,0.35);
        }

        /* Response */
        .at-response-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 0.875rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-wrap: wrap;
        }

        .at-status-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 6px;
          background: ${response?.ok ? 'rgba(52,211,153,0.1)' : response ? 'rgba(248,113,113,0.1)' : 'rgba(82,82,91,0.2)'};
          color: ${statusColor};
          border: 1px solid ${response?.ok ? 'rgba(52,211,153,0.2)' : response ? 'rgba(248,113,113,0.2)' : 'rgba(82,82,91,0.2)'};
        }

        .at-meta-item {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          color: #52525b;
        }

        .at-meta-item span {
          color: #71717a;
        }

        .at-response-pre {
          margin: 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.76rem;
          color: #a1a1aa;
          white-space: pre-wrap;
          word-break: break-all;
          line-height: 1.65;
        }

        .at-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 160px;
          gap: 0.5rem;
        }

        .at-empty-icon {
          color: #27272a;
          margin-bottom: 4px;
        }

        .at-empty-text {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: #3f3f46;
        }

        .at-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(167,139,250,0.15);
          border-top-color: #a78bfa;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .json-key { color: #93c5fd; }
        .json-str { color: #86efac; }
        .json-num { color: #fcd34d; }
        .json-bool { color: #f9a8d4; }
        .json-null { color: #71717a; }
      `}</style>

      <div className="at-root">
        <div className="at-inner">
          {/* Header */}
          <div className="at-top-bar">
            <span className="at-label">DEV</span>
            <span className="at-title">API Tester</span>
          </div>

          {/* URL Bar */}
          <div className="at-url-row">
            <select
              className="at-method-select"
              value={method}
              onChange={e => setMethod(e.target.value)}
              style={{ color: METHOD_COLORS[method] }}
            >
              {METHODS.map(m => (
                <option key={m} value={m} style={{ color: METHOD_COLORS[m], background: '#18181b' }}>
                  {m}
                </option>
              ))}
            </select>

            <input
              className="at-url-input"
              type="text"
              placeholder="https://api.example.com/endpoint"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />

            <button
              className={`at-send-btn ${loading ? 'loading' : 'idle'}`}
              onClick={send}
            >
              {loading ? 'Cancel' : 'Send →'}
            </button>
          </div>

          {/* Two-panel layout */}
          <div className="at-panels">
            {/* Request Panel */}
            <div className="at-panel">
              <div className="at-panel-tabs">
                {['params', 'headers', 'body'].map(tab => (
                  <button
                    key={tab}
                    className={`at-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="at-panel-body">
                {activeTab === 'params' && (
                  <>
                    {params.map((row, i) => (
                      <ParamRow
                        key={i}
                        row={row}
                        onChange={val => updateRow(params, setParams, i, val)}
                        onRemove={() => removeRow(params, setParams, i)}
                      />
                    ))}
                    <button className="at-add-btn" onClick={() => addRow(params, setParams)}>
                      + Add param
                    </button>
                  </>
                )}
                {activeTab === 'headers' && (
                  <>
                    {headers.map((row, i) => (
                      <ParamRow
                        key={i}
                        row={row}
                        onChange={val => updateRow(headers, setHeaders, i, val)}
                        onRemove={() => removeRow(headers, setHeaders, i)}
                      />
                    ))}
                    <button className="at-add-btn" onClick={() => addRow(headers, setHeaders)}>
                      + Add header
                    </button>
                  </>
                )}
                {activeTab === 'body' && (
                  <textarea
                    className="at-textarea"
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder='{ "key": "value" }'
                    spellCheck={false}
                  />
                )}
              </div>
            </div>

            {/* Response Panel */}
            <div className="at-panel">
              <div className="at-panel-tabs">
                {['body', 'headers'].map(tab => (
                  <button
                    key={tab}
                    className={`at-tab ${responseTab === tab ? 'active' : ''}`}
                    onClick={() => setResponseTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {response && (
                <div className="at-response-meta">
                  <span className="at-status-badge">
                    {response.error ? 'ERROR' : `${response.status} ${response.statusText}`}
                  </span>
                  {elapsed !== null && (
                    <span className="at-meta-item">⏱ <span>{elapsed}ms</span></span>
                  )}
                </div>
              )}

              <div className="at-panel-body">
                {loading && (
                  <div className="at-empty-state">
                    <div className="at-spinner" />
                    <span className="at-empty-text">Sending request…</span>
                  </div>
                )}
                {!loading && !response && (
                  <div className="at-empty-state">
                    <svg className="at-empty-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="at-empty-text">Hit Send to see the response</span>
                  </div>
                )}
                {!loading && response && responseTab === 'body' && (
                  <pre className="at-response-pre">
                    {response.error
                      ? response.error
                      : response.type === 'json'
                        ? JSON.stringify(response.data, null, 2)
                        : String(response.data)
                    }
                  </pre>
                )}
                {!loading && response && responseTab === 'headers' && (
                  <pre className="at-response-pre">
                    {Object.entries(response.headers || {})
                      .map(([k, v]) => `${k}: ${v}`)
                      .join('\n')}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}