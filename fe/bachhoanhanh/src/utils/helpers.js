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
