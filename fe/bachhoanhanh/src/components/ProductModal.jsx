import { useState, useEffect } from 'react'

export function ProductModal({ isOpen, title, onClose, onSave, product }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setName(product.name)
      setPrice(product.price)
    } else {
      setName('')
      setPrice('')
    }
  }, [product, isOpen])

  const handleSave = async () => {
    if (!name || !price) return
    setIsLoading(true)
    await onSave(name, parseFloat(price))
    setIsLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="modal-bg open">
      <div className="modal">
        <h3>{title}</h3>
        <div className="field">
          <label>Name</label>
          <input
            type="text"
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="field">
          <label>Price (VND)</label>
          <input
            type="number"
            placeholder="0"
            min="0"
            step="1000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button className="btn btn-accent" onClick={handleSave} disabled={isLoading}>
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
