import { useState, useEffect } from 'react'
import useOcr from '../hooks/useOcr'

const flattenCatalogs = (catalogs, prefix = '') =>
  catalogs.flatMap((catalog) => [
    { id: catalog.id, name: `${prefix}${catalog.name}` },
    ...(catalog.children?.length ? flattenCatalogs(catalog.children, `${prefix}  `) : []),
  ])

export function ProductModal({ isOpen, title, onClose, onSave, product, prototypes, catalogs, attributeTypes, onSearchBrands }) {
  const [barcode, setBarcode] = useState('')
  const [name, setName] = useState('')
  const [image, setImage] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [activeTab, setActiveTab] = useState('details') // 'details' | 'photo'
  const [ocrSelectedFile, setOcrSelectedFile] = useState(null)
  const ocr = useOcr()
  const [description, setDescription] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [selectedPrototypeId, setSelectedPrototypeId] = useState('')
  const [catalogId, setCatalogId] = useState('')
  const [attributes, setAttributes] = useState({})
  const [brandQuery, setBrandQuery] = useState('')
  const [brandOptions, setBrandOptions] = useState([])
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [brandLoading, setBrandLoading] = useState(false)
  const [brandError, setBrandError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const getPrototypeById = (id) => prototypes.find((proto) => proto.productId === id || proto.id === id)

  const getAttributeDataType = (key) => {
    const type = attributeTypes?.find((t) => t.name === key)
    return type?.dataType || 'String'
  }

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

  const isBrandAttribute = (key) => String(key).trim().toUpperCase() === 'BRAND'

  const handleBrandSelect = (brand) => {
    if (!brand) return
    setSelectedBrand(brand)
    setBrandQuery(brand.name || '')
    setAttributes((prev) => ({ ...prev, BRAND: brand.name || '' }))
    setBrandOptions([])
    setBrandError('')
  }

  const renderAttributeInput = (key, value, onChange) => {
    if (isBrandAttribute(key)) {
      return (
        <div style={{ flex: 2, display: 'grid', gap: '8px' }}>
          <input
            type="text"
            placeholder="Search existing brand"
            value={brandQuery}
            onChange={(e) => {
              const query = e.target.value
              setBrandQuery(query)
              setSelectedBrand(null)
              onChange(query)
            }}
            disabled={isLoading}
          />
          {brandLoading && (
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
              Searching brands...
            </div>
          )}
          {brandOptions.length > 0 && (
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '4px 0',
              background: 'var(--surface)',
              maxHeight: '180px',
              overflowY: 'auto'
            }}>
              {brandOptions.map((brand) => (
                <button
                  key={brand.id || brand.name}
                  type="button"
                  onClick={() => handleBrandSelect(brand)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    border: 'none',
                    background: 'transparent',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    color: 'var(--text)'
                  }}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          )}
          {brandError && (
            <div style={{ fontSize: '12px', color: 'var(--error)' }}>
              {brandError}
            </div>
          )}
        </div>
      )
    }

    const dataType = getAttributeDataType(key)

    switch (dataType) {
      case 'Date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isLoading}
            style={{ flex: 2 }}
          />
        )
      case 'Number':
      case 'Weight':
        return (
          <input
            type="number"
            placeholder="Value"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isLoading}
            style={{ flex: 2 }}
          />
        )
      case 'Unit':
        return (
          <input
            type="number"
            placeholder="Value"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isLoading}
            style={{ flex: 2 }}
          />
        )
      case 'String':
      default:
        return (
          <input
            type="text"
            placeholder="Value"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isLoading}
            style={{ flex: 2 }}
          />
        )
    }
  }

  useEffect(() => {
    if (product) {
      const protoId = product.prototypeId || ''
      const proto = getPrototypeById(protoId)
      setBarcode(product.barcode || '')
      setName(product.name || '')
      setImage(product.image || '')
      setImageFile(null)
      setDescription(product.description || '')
      setOriginalPrice(product.originalPrice || '')
      setSelectedPrototypeId(protoId)
      setCatalogId(product.catalogId || '')
      setAttributes(buildAttributes(proto, product.attributes || {}))
      setBrandQuery(product.attributes?.BRAND || product.brandName || '')
      setSelectedBrand(null)
      setBrandOptions([])
      setBrandError('')
    } else {
      setBarcode('')
      setName('')
      setImage('')
      setImageFile(null)
      setDescription('')
      setOriginalPrice('')
      setSelectedPrototypeId('')
      setCatalogId('')
      setAttributes({})
      setBrandQuery('')
      setBrandOptions([])
      setSelectedBrand(null)
      setBrandError('')
    }
  }, [product, isOpen, prototypes])

  useEffect(() => {
    if (!selectedPrototypeId) return
    const proto = getPrototypeById(selectedPrototypeId)
    if (!proto) return
    setAttributes((prev) => buildAttributes(proto, prev))
  }, [selectedPrototypeId, prototypes])

  useEffect(() => {
    if (!brandQuery.trim()) {
      setBrandOptions([])
      setBrandError('')
      return
    }

    let active = true
    const fetchBrands = async () => {
      setBrandLoading(true)
      const result = await onSearchBrands?.(brandQuery)
      if (!active) return

      if (result?.success) {
        setBrandOptions(Array.isArray(result.data) ? result.data : [])
        setBrandError('')
      } else {
        setBrandOptions([])
        setBrandError(result?.message || 'Unable to search brands')
      }
      setBrandLoading(false)
    }

    fetchBrands()

    return () => {
      active = false
    }
  }, [brandQuery, onSearchBrands])

  const handleSave = async () => {
    if (!name || !originalPrice) return
    setIsLoading(true)
    const productData = {
      barcode,
      name,
      image,
      imageFile,
      description,
      originalPrice: parseFloat(originalPrice),
      catalogId: catalogId || null,
      prototypeId: selectedPrototypeId,
      attributes: {
        ...attributes,
        ...(selectedBrand?.name ? { BRAND: selectedBrand.name } : {}),
      },
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

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0] || null
    setImageFile(file)
  }

  if (!isOpen) return null

  return (
    <div className="modal-bg open">
      <div className="modal" style={{ maxHeight: '90vh', overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ position: 'sticky', top: 0, background: 'var(--surface)', paddingBottom: '12px', marginBottom: '12px', borderBottom: '0.5px solid var(--border)', zIndex: 10 }}>
          <h3 style={{ marginTop: 0 }}>{title}</h3>
        </div>
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
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <button
            type="button"
            className={activeTab === 'details' ? 'btn btn-ghost active' : 'btn btn-ghost'}
            onClick={() => setActiveTab('details')}
            disabled={isLoading}
          >
            Details
          </button>
          <button
            type="button"
            className={activeTab === 'photo' ? 'btn btn-ghost active' : 'btn btn-ghost'}
            onClick={() => setActiveTab('photo')}
            disabled={isLoading}
          >
            Photo / OCR
          </button>
        </div>

        {activeTab === 'details' && (
          <div className="field">
            <label>Image URL</label>
            <input
              type="text"
              placeholder="External image URL or uploaded S3 URL"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              disabled={isLoading}
            />
            <div style={{ display: 'grid', gap: '8px', marginTop: '10px' }}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageFileChange}
                disabled={isLoading}
              />
              {imageFile && (
                <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
                  Selected file will be uploaded to S3: {imageFile.name}
                </div>
              )}
              {!imageFile && image && (
                <div style={{ color: 'var(--muted)', fontSize: '12px' }}>
                  Current image will be kept unless a new file is selected.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'photo' && (
          <div className="field">
            <label>Capture / Upload for OCR</label>
            <div style={{ display: 'grid', gap: '8px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setOcrSelectedFile(e.target.files?.[0] || null)}
                disabled={isLoading || ocr.loading}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={async () => {
                    if (!ocrSelectedFile) return
                    await ocr.extract(ocrSelectedFile)
                  }}
                  disabled={isLoading || ocr.loading || !ocrSelectedFile}
                >
                  {ocr.loading ? 'Running OCR...' : 'Run OCR'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setOcrSelectedFile(null)
                    ocr.clear()
                  }}
                  disabled={isLoading || ocr.loading}
                >
                  Clear
                </button>
              </div>

              {ocr.error && <div style={{ color: 'var(--error)', fontSize: '13px' }}>{ocr.error}</div>}

              {ocr.result && (
                <div style={{ border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', background: 'var(--surface)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>OCR Raw Text</div>
                  <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap', maxHeight: '160px', overflowY: 'auto' }}>{ocr.result.raw_text}</div>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--muted)' }}>Parsed fields</div>
                  <pre style={{ fontSize: '13px', margin: '6px 0', whiteSpace: 'pre-wrap' }}>{JSON.stringify(ocr.result.fields || {}, null, 2)}</pre>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-accent"
                      onClick={() => {
                        const fields = ocr.result.fields || {}
                        if (fields.name) setName(fields.name)
                        if (fields.sku && !barcode) setBarcode(fields.sku)
                        if (fields.price) setOriginalPrice(String(Number(fields.price) || fields.price))
                        // attach the selected file as the imageFile to be uploaded with product
                        if (ocrSelectedFile) {
                          setImageFile(ocrSelectedFile)
                        }
                        // close the OCR tab and return to details
                        setActiveTab('details')
                      }}
                    >
                      Apply to form
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        setActiveTab('details')
                      }}
                    >
                      Back to details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="field">
          <label>Description</label>
          <textarea
            placeholder="Product description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            rows={3}
          />
          {selectedBrand && (
            <div style={{
              marginTop: '10px',
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.02)',
              fontSize: '13px',
              color: 'var(--muted)'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>{selectedBrand.name}</div>
              {selectedBrand.description ? (
                <div>{selectedBrand.description.length > 100 ? `${selectedBrand.description.slice(0, 100)}...` : selectedBrand.description}</div>
              ) : (
                <div>No brand description available.</div>
              )}
              <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--muted)' }}>
                Email: {selectedBrand.email || 'No email provided'}
              </div>
            </div>
          )}
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
          {Object.entries(attributes).map(([key, value]) => {
            const dataType = getAttributeDataType(key)
            return (
              <div key={key} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{key}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>({dataType})</div>
                </div>
                {renderAttributeInput(key, value, (newVal) => handleAttributeChange(key, newVal))}
                <button type="button" onClick={() => removeAttribute(key)} disabled={isLoading} style={{ padding: '6px 12px' }}>
                  Remove
                </button>
              </div>
            )
          })}
          <button type="button" onClick={addAttribute} disabled={isLoading}>
            Add Attribute
          </button>
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
