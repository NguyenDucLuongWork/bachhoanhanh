import { useEffect, useMemo } from 'react'
import { Loader } from '../components/Loader'
import { formatPrice } from '../utils/helpers'

export function AdminDashboard({ orders = [], loading = false, onLoadOrders }) {
  useEffect(() => {
    if (onLoadOrders) onLoadOrders()
  }, [onLoadOrders])

  const stats = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const productMap = {}
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const revenueByDay = Array.from({ length: daysInMonth }, () => 0)

    let monthTotal = 0
    let lastMonthTotal = 0
    let todayTotal = 0
    const todayKey = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toDateString()
    const todayOrders = []

    orders.forEach((order) => {
      const d = order.createdAt ? new Date(order.createdAt) : null
      const orderTotal = Number(order.total || order.totalPrice || 0)

      if (d) {
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          revenueByDay[d.getDate() - 1] += orderTotal
          monthTotal += orderTotal
        }

        const lastMonthIndex = new Date(currentYear, currentMonth - 1, 1)
        if (d.getMonth() === lastMonthIndex.getMonth() && d.getFullYear() === lastMonthIndex.getFullYear()) {
          lastMonthTotal += orderTotal
        }

        if (d.toDateString() === todayKey) {
          todayTotal += orderTotal
          todayOrders.push(order)
        }
      }

      (order.items || []).forEach((it) => {
        const pid = it.productId || it.id
        if (!pid) return
        if (!productMap[pid]) productMap[pid] = { productId: pid, name: it.productName || it.name || 'Product', image: it.image || null, qty: 0 }
        productMap[pid].qty += Number(it.quantity || it.qty || 1)
      })
    })

    const topProducts = Object.values(productMap).sort((a, b) => b.qty - a.qty).slice(0, 6)

    return { topProducts, revenueByDay, monthTotal, lastMonthTotal, todayTotal, todayOrders }
  }, [orders])

  if (loading) return (<div className="page active"><Loader /></div>)

  return (
    <div className="page active admin-dashboard-page">
      <div className="page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Sales overview and product performance</p>
        </div>
        <button className="btn btn-ghost" onClick={() => onLoadOrders && onLoadOrders()}>
          Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
        <div style={{ padding: 12, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Revenue this month</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{formatPrice(stats.monthTotal || 0)} VND</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
            Compared to last month: {stats.lastMonthTotal ? `${Math.round(((stats.monthTotal - stats.lastMonthTotal) / Math.max(1, stats.lastMonthTotal)) * 100)}%` : 'N/A'}
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 120 }}>
              {(() => {
                const arr = stats.revenueByDay || []
                const max = Math.max(1, ...arr)
                return arr.map((val, i) => (
                  <div key={i} title={`${i + 1}: ${formatPrice(val)} VND`} style={{ flex: '1 0 0', display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ width: '100%', height: `${(val / max) * 100}%`, background: 'linear-gradient(180deg,var(--accent),var(--accent-2))', borderRadius: 4 }} />
                  </div>
                ))
              })()}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
              <span>1</span>
              <span>{(stats.revenueByDay || []).length}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: 12, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Top selling products (this month)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {(stats.topProducts || []).map((p) => (
                <div key={p.productId} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 6, overflow: 'hidden', background: 'var(--muted)' }}>
                    {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%' }} />}
                  </div>
                  <div style={{ fontSize: 13 }}>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.qty} sold</div>
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
                (stats.todayOrders || []).map((o) => (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed var(--border)' }}>
                    <div style={{ fontSize: 13 }}>#{o.id}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{formatPrice(o.total || o.totalPrice || 0)} VND</div>
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
