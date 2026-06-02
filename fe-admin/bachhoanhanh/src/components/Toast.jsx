import { useState, useCallback, useEffect } from 'react'

let toastEmitter = null

export function useToast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    toastEmitter = (message, isError = false) => {
      const id = Date.now()
      setToasts((prev) => [...prev, { id, message, isError }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 3000)
    }
  }, [])

  return { toasts, showToast: toastEmitter }
}

export function Toast({ message, isError }) {
  return (
    <div className="toast show">
      <span className={`toast-dot ${isError ? 'err' : ''}`}></span>
      <span>{message}</span>
    </div>
  )
}

export function ToastContainer({ toasts }) {
  if (toasts.length === 0) return null
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999 }}>
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} isError={toast.isError} />
      ))}
    </div>
  )
}

export function showToast(message, isError = false) {
  if (toastEmitter) {
    toastEmitter(message, isError)
  }
}
