import { useEffect, useState } from 'react'
import { Loader } from '../components/Loader'

export function BrandDetailPage({ brandName, getBrandByName, onBack }) {
  const [brand, setBrand] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!brandName) return

    let active = true
    const loadBrand = async () => {
      setLoading(true)
      setError('')
      const result = await getBrandByName?.(brandName)
      if (!active) return

      if (result?.success) {
        setBrand(result.data)
      } else {
        setBrand(null)
        setError(result?.message || 'Brand not found')
      }
      setLoading(false)
    }

    loadBrand()

    return () => {
      active = false
    }
  }, [brandName, getBrandByName])

  const handleBack = () => {
    onBack?.()
  }

  if (loading) {
    return (
      <div className="page active">
        <Loader />
      </div>
    )
  }

  return (
    <div className="page active commerce-shell">
      <section className="store-hero">
        <div>
          <span className="eyebrow">Brand detail</span>
          <h1>{brand?.name || brandName}</h1>
          <p>Brand information loaded by exact name search from the product or brand table.</p>
        </div>
        <div className="hero-metrics">
          <div>
            <strong>{brand?.id ?? '-'}</strong>
            <span>ID</span>
          </div>
          <div>
            <strong>{brand?.email || '-'}</strong>
            <span>Email</span>
          </div>
          <div>
            <strong>{brand?.phoneNumber || '-'}</strong>
            <span>Phone</span>
          </div>
        </div>
      </section>

      <section className="store-layout">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <button className="btn btn-ghost" onClick={handleBack}>
            Back to brands
          </button>
        </div>

        {error ? (
          <div style={{ padding: '24px', background: 'var(--surface)', borderRadius: '12px', color: 'var(--error)' }}>
            {error}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '18px', width: '100%' }}>
            <div style={{ display: 'grid', gap: '12px', background: 'var(--surface)', padding: '20px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {brand?.image ? (
                  <img src={brand.image} alt={brand.name} style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: '14px', border: '1px solid var(--border)' }} />
                ) : (
                  <div style={{ width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', background: 'rgba(0,0,0,0.05)', color: 'var(--muted)' }}>
                    No image
                  </div>
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div>
                      <strong>Description</strong>
                      <p style={{ marginTop: '8px', lineHeight: '1.6', color: 'var(--muted)' }}>
                        {brand?.description || 'No description provided.'}
                      </p>
                    </div>
                    <div>
                      <strong>Contact</strong>
                      <p style={{ marginTop: '8px', lineHeight: '1.6', color: 'var(--muted)' }}>
                        Email: {brand?.email || 'n/a'}<br />
                        Phone: {brand?.phoneNumber || 'n/a'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
