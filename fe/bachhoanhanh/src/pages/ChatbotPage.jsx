import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../utils/api'
import { showToast } from '../components/Toast'

export function ChatbotPage({ token }) {
  const [sessionId, setSessionId] = useState(() => {
    try {
      return localStorage.getItem('chat_session_id') || ''
    } catch {
      return ''
    }
  })
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    if (!sessionId) {
      const newId = `chat-${Date.now()}-${Math.random().toString(36).slice(2)}`
      setSessionId(newId)
      try {
        localStorage.setItem('chat_session_id', newId)
      } catch {
        // ignore storage errors
      }
    }
  }, [sessionId])

  useEffect(() => {
    if (!started) return
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, started])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text) return
    if (!sessionId) {
      showToast('Không thể khởi tạo phiên chat', true)
      return
    }

    const userMessage = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setStarted(true)

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text, session_id: sessionId }),
      })
      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || 'Không thể gửi tin nhắn')
      }
      const data = await res.json()
      const reply = data.reply || 'Xin lỗi, hệ thống chưa trả lời được.'
      const botMessage = { role: 'assistant', content: reply }
      setMessages((prev) => [...prev, botMessage])
      if (data.order) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Đơn hàng đã tạo: #${data.order.id} với ${data.order.items?.length || 0} sản phẩm.`,
          },
        ])
      }
    } catch (error) {
      const message = error?.message || 'Lỗi kết nối chatbot'
      showToast(message, true)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Rất tiếc, không thể liên lạc với chatbot ngay lúc này.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="page active" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h2>Chatbot hỗ trợ mua hàng</h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
            Nói chuyện với trợ lý AI để hỏi sản phẩm hoặc đặt hàng tự động.
          </p>
        </div>
      </div>

      <div
        style={{
          border: '1px solid var(--border2)',
          borderRadius: 16,
          padding: 20,
          minHeight: 420,
          background: 'var(--surface)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: 8,
            marginBottom: 16,
          }}
        >
          {messages.length === 0 ? (
            <div style={{ color: 'var(--muted)' }}>
              Gửi một tin nhắn để bắt đầu. Ví dụ: "Cho tôi xem 5 sản phẩm tốt nhất" hoặc "Tôi muốn mua 2 kg thịt bò".
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    maxWidth: '78%',
                    padding: '12px 16px',
                    borderRadius: 16,
                    background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface-alt)',
                    color: msg.role === 'user' ? 'white' : 'var(--text)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Viết tin nhắn..."
            rows={2}
            style={{
              flex: 1,
              minHeight: 56,
              resize: 'none',
              padding: '14px 16px',
              borderRadius: 12,
              border: '1px solid var(--border2)',
              fontFamily: 'inherit',
              fontSize: 14,
              color: 'var(--text)',
              background: 'var(--surface)',
            }}
            disabled={loading}
          />
          <button
            className="btn btn-accent"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{ minWidth: 120, height: 56 }}
          >
            {loading ? 'Đang gửi...' : 'Gửi'}
          </button>
        </div>
      </div>
    </div>
  )
}
