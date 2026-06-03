import { useEffect, useMemo, useState } from 'react'
import { Loader } from '../components/Loader'
import { formatPrice } from '../utils/helpers'

function formatMonthKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function resolveValue(value) {
  let current = value
  let depth = 0
  while (typeof current === 'function' && depth < 5) {
    current = current()
    depth += 1
  }
  return current
}

function parseOrderTotal(order) {
  const candidates = [order?.total, order?.totalPrice]
  for (const candidate of candidates) {
    const resolved = resolveValue(candidate)
    const numeric = Number(resolved)
    if (Number.isFinite(numeric)) return numeric
  }
  return 0
}

export function AdminDashboard({ orders = [], loading = false, onLoadOrders, products = [] }) {
  useEffect(() => {
    if (onLoadOrders) onLoadOrders()
  }, [onLoadOrders])

  const [monthKey, setMonthKey] = useState(formatMonthKey(new Date()))

  const changeMonth = (delta) => {
    const [year, month] = monthKey.split('-').map(Number)
    const next = new Date(year, month - 1 + delta, 1)
    setMonthKey(formatMonthKey(next))
  }

  const handleMonthInput = (event) => {
    setMonthKey(event.target.value)
  }

  const stats = useMemo(() => {
    const [year, monthValue] = monthKey.split('-').map(Number)
    const month = monthValue - 1
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const revenueByDay = Array.from({ length: daysInMonth }, () => 0)

    let monthTotal = 0
    let prevMonthTotal = 0
    let todayTotal = 0
    const todayKey = new Date().toDateString()
    const todayOrders = []
    const productMap = {}

    const prevMonth = new Date(year, month - 1, 1)

    orders.forEach((order) => {
      const createdAt = order.createdAt || order.created_at || order.date
      const date = createdAt ? new Date(createdAt) : null
      if (!date || Number.isNaN(date.getTime())) return

      const orderTotal = parseOrderTotal(order)
      const orderDay = date.getDate() - 1

      if (date.getMonth() === month && date.getFullYear() === year) {
        if (orderDay >= 0 && orderDay < revenueByDay.length) {
          revenueByDay[orderDay] += orderTotal
        }
        monthTotal += orderTotal

        ;(order.items || []).forEach((item) => {
          const productId = item.productId || item.id || item.product_id
          if (!productId) return
          const qty = Number(item.quantity ?? item.qty ?? 1) || 1
          if (!productMap[productId]) productMap[productId] = { productId, qty: 0 }
          productMap[productId].qty += qty
        })
      }

      if (date.getMonth() === prevMonth.getMonth() && date.getFullYear() === prevMonth.getFullYear()) {
        prevMonthTotal += orderTotal
      }

      if (date.toDateString() === todayKey) {
        todayTotal += orderTotal
        todayOrders.push(order)
      }
    })

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6)
      .map((item) => {
        const product = products.find(
          (prod) => String(prod.productId || prod.id) === String(item.productId)
        )
        return {
          ...item,
          name: product?.name || String(item.productId),
          image: product?.image || product?.brandImage || null,
        }
      })

    return {
      topProducts,
      revenueByDay,
      monthTotal,
      prevMonthTotal,
      todayTotal,
      todayOrders,
    }
  }, [orders, monthKey, products])

  const linePoints = useMemo(() => {
    const values = stats.revenueByDay || []
    if (values.length === 0) return ''
    const width = 600
    const height = 120
    const maxValue = Math.max(1, ...values)
    return values
      .map((value, index) => `${(index / (values.length - 1)) * width},${height - (value / maxValue) * height}`)
      .join(' ')
  }, [stats.revenueByDay])

  if (loading) return (<div className="page active"><Loader /></div>)

  return (
    <div className="page active admin-dashboard-page">
      <div className="page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
            Sales overview and product performance
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={() => onLoadOrders && onLoadOrders()}>
            Refresh
          </button>
          <button className="btn btn-ghost" onClick={() => changeMonth(-1)}>
            &larr;
          </button>
          <input
            type="month"
            value={monthKey}
            onChange={handleMonthInput}
            style={{ padding: '6px 8px', borderRadius: 8 }}
          />
          <button className="btn btn-ghost" onClick={() => changeMonth(1)}>
            &rarr;
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        <div style={{ padding: 12, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Revenue ({monthKey})</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{formatPrice(stats.monthTotal || 0)} VND</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
            Compared to last month:{' '}
            {stats.prevMonthTotal ? `${Math.round(((stats.monthTotal - stats.prevMonthTotal) / Math.max(1, stats.prevMonthTotal)) * 100)}%` : 'N/A'}
          </div>

          <div style={{ marginTop: 12 }}>
            <svg width="100%" height="140" viewBox="0 0 600 140" preserveAspectRatio="xMidYMid meet">
              <polyline fill="none" stroke="var(--accent)" strokeWidth="3" points={linePoints} />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
              <span>1</span>
              <span>{(stats.revenueByDay || []).length}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: 12, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
              Top selling products ({monthKey})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {(stats.topProducts || []).map((product) => (
                <div key={product.productId} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 6, overflow: 'hidden', background: 'var(--muted)', flex: '0 0 56px' }}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%' }} />
                    )}
                  </div>
                  <div style={{ fontSize: 13, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{product.qty} sold</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 12, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Revenue today</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{formatPrice(stats.todayTotal || 0)} VND</div>
            <div style={{ maxHeight: 160, overflow: 'auto' }}>
              {(stats.todayOrders || []).length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>No orders today</div>
              ) : (
                stats.todayOrders.map((order) => (
                  <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed var(--border)' }}>
                    <div style={{ fontSize: 13 }}>#{order.id}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {formatPrice(order.total || order.totalPrice || 0)} VND
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
