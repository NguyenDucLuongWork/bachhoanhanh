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

export function AdminDashboard({ orders = [], loading = false, onLoadOrders, products = [], onViewProduct }) {
  useEffect(() => {
    if (onLoadOrders) onLoadOrders()
  }, [onLoadOrders])

  const [monthKey, setMonthKey] = useState(formatMonthKey(new Date()))
  const [hoverPoint, setHoverPoint] = useState(null)

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

    let expectedMonthTotal = 0
    let realMonthTotal = 0
    let prevMonthTotal = 0
    let expectedTodayTotal = 0
    let realTodayTotal = 0
    const todayKey = new Date().toDateString()
    const todayOrders = []
    const productMap = {}

    const prevMonth = new Date(year, month - 1, 1)

    orders.forEach((order) => {
      const createdAt = order.createdAt || order.created_at || order.date
      const date = createdAt ? new Date(createdAt) : null
      if (!date || Number.isNaN(date.getTime())) return

      const orderTotal = parseOrderTotal(order)
      const status = (order.status || '').toString().toUpperCase()
      const orderDay = date.getDate() - 1

      if (date.getMonth() === month && date.getFullYear() === year) {
        if (status !== 'CANCELLED') {
          if (orderDay >= 0 && orderDay < revenueByDay.length) {
            revenueByDay[orderDay] += orderTotal
          }
          expectedMonthTotal += orderTotal

          ;(order.items || []).forEach((item) => {
            const productId = item.productId || item.id || item.product_id
            if (!productId) return
            const qty = Number(item.quantity ?? item.qty ?? 1) || 1
            if (!productMap[productId]) productMap[productId] = { productId, qty: 0 }
            productMap[productId].qty += qty
          })
        }

        if (status === 'PAID') {
          realMonthTotal += orderTotal
        }
      }

      if (date.getMonth() === prevMonth.getMonth() && date.getFullYear() === prevMonth.getFullYear()) {
        prevMonthTotal += orderTotal
      }

      if (date.toDateString() === todayKey) {
        todayOrders.push(order)
        if (status !== 'CANCELLED') {
          expectedTodayTotal += orderTotal
        }
        if (status === 'PAID') {
          realTodayTotal += orderTotal
        }
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
      expectedMonthTotal,
      realMonthTotal,
      prevMonthTotal,
      expectedTodayTotal,
      realTodayTotal,
      todayOrders,
    }
  }, [orders, monthKey, products])

  const lineChart = useMemo(() => {
    const values = stats.revenueByDay || []
    const width = 600
    const chartHeight = 120
    const topPadding = 24
    const bottomPadding = 24
    const height = chartHeight + topPadding + bottomPadding
    if (values.length === 0) {
      return {
        points: '',
        maxValue: 1,
        labels: [0, 0, 0],
        width,
        height,
        chartHeight,
        topPadding,
        bottomPadding,
        days: [1, 1],
        values,
      }
    }

    const maxValue = Math.max(1, ...values)
    const points = values
      .map((value, index) => {
        const x = values.length > 1 ? (index / (values.length - 1)) * width : width / 2
        const y = topPadding + (chartHeight - (value / maxValue) * chartHeight)
        return `${x},${y}`
      })
      .join(' ')

    const midValue = Math.round(maxValue / 2)
    const days = [1, values.length]

    return {
      points,
      maxValue,
      labels: [0, midValue, maxValue],
      width,
      height,
      chartHeight,
      topPadding,
      bottomPadding,
      days,
      values,
    }
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
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Expectation Revenue ({monthKey})</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{formatPrice(stats.expectedMonthTotal || 0)} VND</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
            Real Revenue: <strong>{formatPrice(stats.realMonthTotal || 0)} VND</strong>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
            Compared to last month: {stats.prevMonthTotal ? `${Math.round(((stats.expectedMonthTotal - stats.prevMonthTotal) / Math.max(1, stats.prevMonthTotal)) * 100)}%` : 'N/A'}
          </div>

          <div style={{ marginTop: 28, paddingTop: 12 }}>
            <svg width="100%" height={lineChart.height} viewBox={`0 0 ${lineChart.width} ${lineChart.height}`} preserveAspectRatio="xMidYMid meet">
              <rect x="0" y={lineChart.topPadding} width={lineChart.width} height={lineChart.chartHeight} rx="16" fill="rgba(255,255,255,.04)" />
              {lineChart.labels.map((label, index) => {
                const y = lineChart.topPadding + (lineChart.chartHeight - (index / (lineChart.labels.length - 1)) * lineChart.chartHeight)
                return (
                  <g key={index}>
                    <line
                      x1="0"
                      y1={y}
                      x2={lineChart.width}
                      y2={y}
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="1"
                    />
                  </g>
                )
              })}
              <polyline fill="none" stroke="var(--accent)" strokeWidth="3" points={lineChart.points} strokeLinecap="round" strokeLinejoin="round" />
              {lineChart.values?.map((value, index) => {
                const x = lineChart.values.length > 1 ? (index / (lineChart.values.length - 1)) * lineChart.width : lineChart.width / 2
                const y = lineChart.topPadding + (lineChart.chartHeight - (value / lineChart.maxValue) * lineChart.chartHeight)
                return (
                  <g
                    key={index}
                    onMouseEnter={() => setHoverPoint({ day: index + 1, value, x, y })}
                    onMouseLeave={() => setHoverPoint(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle cx={x} cy={y} r="4" fill="var(--accent)" />
                    <text x={x} y={y - 10} fill="var(--accent)" fontSize="9" textAnchor="middle" dominantBaseline="central">
                      {formatPrice(value)}
                    </text>
                  </g>
                )
              })}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
              <span>Day 1</span>
              <span>Day {lineChart.days[1]}</span>
            </div>
            {hoverPoint && (
              <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', color: 'var(--text)', fontSize: 12 }}>
                Day {hoverPoint.day}: {formatPrice(hoverPoint.value)} VND
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: 12, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
              Top selling products ({monthKey})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
              {(stats.topProducts || []).map((product) => (
                <button
                  key={product.productId}
                  type="button"
                  onClick={() => onViewProduct?.(product.productId)}
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    background: 'transparent',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    cursor: onViewProduct ? 'pointer' : 'default',
                  }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.08)', flex: '0 0 56px' }}>
                    {product.image ? (
                      <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%' }} />
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3, wordBreak: 'break-word' }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{product.qty} sold</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: 12, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Revenue today</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{formatPrice(stats.expectedTodayTotal || 0)} VND</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
              Real today: {formatPrice(stats.realTodayTotal || 0)} VND
            </div>
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
