export function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export const emojis = ['🛍', '📦', '🧴', '🥤', '🍜', '🧃', '🫙', '🧁', '🥡', '🧂']

export function getProductEmoji(id) {
  return emojis[id % emojis.length]
}

export function formatPrice(price) {
  return Number(price).toLocaleString('vi-VN')
}

export function getAvailableAmount(product) {
  if (!product) return 0

  if (product.totalAvailableAmount != null) {
    const value = Number(product.totalAvailableAmount)
    return Number.isFinite(value) ? value : 0
  }

  if (Array.isArray(product.availableStocks)) {
    return product.availableStocks.reduce((sum, stock) => {
      const amount = Number(stock.amount)
      return sum + (Number.isFinite(amount) ? amount : 0)
    }, 0)
  }

  const value = Number(product.stock ?? product.quantity ?? product.amount ?? 0)
  return Number.isFinite(value) ? value : 0
}
