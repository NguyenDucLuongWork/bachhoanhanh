import { useState, useEffect } from 'react'

export function ProductModal({ isOpen, title, onClose, onSave, product, prototypes }) {
  const [barcode, setBarcode] = useState('')
  const [name, setName] = useState('')
  const [image, setImage] = useState('')
  const [description, setDescription] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [prototypeId, setPrototypeId] = useState('')
  const [attributes, setAttributes] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setBarcode(product.barcode || '')
      setName(product.name || '')
      setImage(product.image || '')
      setDescription(product.description || '')
      setOriginalPrice(product.originalPrice || '')
      setPrototypeId(product.prototypeId || '')
      setAttributes(product.attributes || {})
    } else {
      setBarcode('')
      setName('')
      setImage('')
      setDescription('')
      setOriginalPrice('')
      setPrototypeId('')
      setAttributes({})
    }
  }, [product, isOpen])

  const handleSave = async () => {
    if (!name || !originalPrice) return
    setIsLoading(true)
    const productData = {
      barcode,
      name,
      image,
      description,
      originalPrice: parseFloat(originalPrice),
      prototypeId,
      attributes,
    }
    await onSave(productData)
    setIsLoading(false)
  }

  const handleAttributeChange = (key, value) => {
    setAttributes(prev => ({ ...prev, [key]: value }))
  }

  const addAttribute = () => {
    const key = prompt('Attribute key:')
    if (key) {
      setAttributes(prev => ({ ...prev, [key]: '' }))
    }
  }

  const removeAttribute = (key) => {
    setAttributes(prev => {
      const newAttrs = { ...prev }
      delete newAttrs[key]
      return newAttrs
    })
  }

  if (!isOpen) return null

  return (
    <div className="modal-bg open">
      <div className="modal">
        <h3>{title}</h3>
        <div className="field">
          <label>Barcode</label>
          <input
            type="text"
            placeholder="Product barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="field">
          <label>Name *</label>
          <input
            type="text"
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="field">
          <label>Image URL</label>
          <input
            type="text"
            placeholder="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea
            placeholder="Product description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            rows={3}
          />
        </div>
        <div className="field">
          <label>Original Price (VND) *</label>
          <input
            type="number"
            placeholder="0"
            min="0"
            step="1000"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="field">
          <label>Prototype</label>
          <select
            value={prototypeId}
            onChange={(e) => setPrototypeId(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Select prototype</option>
            {prototypes.map(proto => (
              <option key={proto.productId} value={proto.productId}>{proto.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Attributes</label>
          {Object.entries(attributes).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
              <input
                type="text"
                placeholder="Key"
                value={key}
                disabled
                style={{ flex: 1 }}
              />
              <input
                type="text"
                placeholder="Value"
                value={value}
                onChange={(e) => handleAttributeChange(key, e.target.value)}
                disabled={isLoading}
                style={{ flex: 2 }}
              />
              <button type="button" onClick={() => removeAttribute(key)} disabled={isLoading}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addAttribute} disabled={isLoading}>Add Attribute</button>
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
