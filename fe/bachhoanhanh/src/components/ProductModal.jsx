import { useState, useEffect } from 'react'

const flattenCatalogs = (catalogs, prefix = '') =>
  catalogs.flatMap((catalog) => [
    { id: catalog.id, name: `${prefix}${catalog.name}` },
    ...(catalog.children?.length ? flattenCatalogs(catalog.children, `${prefix}  `) : []),
  ])

export function ProductModal({ isOpen, title, onClose, onSave, product, prototypes, catalogs }) {
  const [barcode, setBarcode] = useState('')
  const [name, setName] = useState('')
  const [image, setImage] = useState('')
  const [description, setDescription] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [selectedPrototypeId, setSelectedPrototypeId] = useState('')
  const [catalogId, setCatalogId] = useState('')
  const [attributes, setAttributes] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const getPrototypeById = (id) => prototypes.find((proto) => proto.productId === id || proto.id === id)

  const getAttributeKeys = (proto) => {
    if (!proto) return []
    if (Array.isArray(proto.unpackedAttributes) && proto.unpackedAttributes.length) {
      return proto.unpackedAttributes
    }
    if (typeof proto.packedAttributes === 'string') {
      return proto.packedAttributes.split(',').map((item) => item.trim()).filter(Boolean)
    }
    return []
  }

  const buildAttributes = (proto, existing = {}) => {
    const keys = getAttributeKeys(proto)
    return keys.reduce((acc, key) => {
      acc[key] = existing[key] ?? ''
      return acc
    }, {})
  }

  useEffect(() => {
    if (product) {
      const protoId = product.prototypeId || ''
      const proto = getPrototypeById(protoId)
      setBarcode(product.barcode || '')
      setName(product.name || '')
      setImage(product.image || '')
      setDescription(product.description || '')
      setOriginalPrice(product.originalPrice || '')
      setSelectedPrototypeId(protoId)
      setCatalogId(product.catalogId || '')
      setAttributes(buildAttributes(proto, product.attributes || {}))
    } else {
      setBarcode('')
      setName('')
      setImage('')
      setDescription('')
      setOriginalPrice('')
      setSelectedPrototypeId('')
      setCatalogId('')
      setAttributes({})
    }
  }, [product, isOpen, prototypes])

  useEffect(() => {
    if (!selectedPrototypeId) return
    const proto = getPrototypeById(selectedPrototypeId)
    if (!proto) return
    setAttributes((prev) => buildAttributes(proto, prev))
  }, [selectedPrototypeId, prototypes])

  const handleSave = async () => {
    if (!name || !originalPrice) return
    setIsLoading(true)
    const productData = {
      barcode,
      name,
      image,
      description,
      originalPrice: parseFloat(originalPrice),
      catalogId: catalogId || null,
      prototypeId: selectedPrototypeId,
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
          <label>Catalog</label>
          <select
            value={catalogId}
            onChange={(e) => setCatalogId(e.target.value)}
            disabled={isLoading}
          >
            <option value="">Select catalog</option>
            {flattenCatalogs(catalogs || []).map((catalog) => (
              <option key={catalog.id} value={catalog.id}>
                {catalog.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Prototype</label>
          <select
            value={selectedPrototypeId}
            onChange={(e) => setSelectedPrototypeId(e.target.value)}
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
