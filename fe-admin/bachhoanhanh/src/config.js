// API Configuration
// Sử dụng relative path - Vite dev server sẽ proxy đến domain được cấu hình
// Cấu hình domain trong vite.config.js qua VITE_API_BASE_URL environment variable

// API Endpoints (sử dụng relative path để qua proxy)
export const API_ENDPOINTS = {
  AUTH: '/auth/realms/bachhoanhanh/protocol/openid-connect/token',
  REGISTER: '/users/register',
  ME: '/users/me',
  PRODUCTS: '/products',
  ATTRIBUTE_TYPES: '/attribute-types',
  PROTOTYPES: '/prototypes',
  CATALOGS: '/catalogs',
  ORDERS: '/orders',
  PAYMENTS: '/payments',
  BRANDS: '/brands',
  VOUCHERS: '/vouchers',
  STOCKS: '/stocks',
  USERS: '/users',
  OCR: '/api/ocr',
}

export default API_ENDPOINTS
