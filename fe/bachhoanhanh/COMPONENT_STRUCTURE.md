# BachHoaNhanh Frontend - Component Structure

This document describes the React component structure and hooks organization.

## Directory Structure

```
src/
├── components/
│   ├── Header.jsx           # Navigation header with logo & auth status
│   ├── Footer.jsx           # Footer with links
│   ├── ProductCard.jsx      # Individual product card component
│   ├── ProductModal.jsx     # Add/Edit product modal
│   ├── DeleteConfirmModal.jsx # Delete confirmation modal
│   ├── Loader.jsx           # Loading spinner component
│   └── Toast.jsx            # Toast notification system
├── pages/
│   ├── LoginPage.jsx        # Login form & authentication page
│   └── ProductsPage.jsx     # Products listing, search, CRUD operations
├── hooks/
│   ├── useAuth.js           # Authentication state & logic (Keycloak token)
│   └── useProducts.js       # Product CRUD operations
├── utils/
│   └── helpers.js           # Utility functions (formatting, emojis, etc.)
├── styles/
│   └── theme.css            # Global theme & component styles (CSS variables)
├── App.jsx                  # Main app component with routing logic
├── App.css                  # App-level styles
├── main.jsx                 # React DOM entry point
└── index.css                # Base HTML styles
```

## Components

### Header.jsx
Sticky navigation header with logo and user authentication status.

**Props:**
- `username` (string) - Current logged-in username
- `onNavigate` (function) - Page navigation callback
- `onLogout` (function) - Logout handler

### Footer.jsx
Footer with links and copyright information.

### ProductCard.jsx
Displays individual product with emoji, name, price, ID, and action buttons.

**Props:**
- `product` (object) - Product data
- `onEdit` (function) - Edit handler
- `onDelete` (function) - Delete handler

### ProductModal.jsx
Modal for adding or editing products with form validation.

**Props:**
- `isOpen` (boolean) - Modal visibility
- `title` (string) - Modal title
- `onClose` (function) - Close handler
- `onSave` (function) - Save handler
- `product` (object|null) - Existing product data for edit mode

### DeleteConfirmModal.jsx
Confirmation modal for product deletion.

**Props:**
- `isOpen` (boolean) - Modal visibility
- `onClose` (function) - Cancel handler
- `onConfirm` (function) - Confirm deletion handler
- `isLoading` (boolean) - Loading state

### Loader.jsx
Loading spinner with animated dots.

### Toast.jsx
Toast notification system with global emitter pattern.

**Exports:**
- `useToast()` - Hook to manage toast state
- `ToastContainer` - Component to display toasts
- `showToast(message, isError)` - Global function to show toast

## Pages

### LoginPage.jsx
Login form with username/password fields, connects to Keycloak authentication.

**Props:**
- `onLoginSuccess` (function) - Login handler
- `loading` (boolean) - Loading state

### ProductsPage.jsx
Products management page with CRUD operations, search, and filtering.

**Props:**
- `products` (array) - List of products
- `loading` (boolean) - Loading state
- `onAddProduct` (function) - Add product handler
- `onUpdateProduct` (function) - Update product handler
- `onDeleteProduct` (function) - Delete product handler
- `onRefresh` (function) - Refresh products handler

## Hooks

### useAuth()
Manages authentication state and Keycloak token fetch.

**Returns:**
```javascript
{
  token: string|null,
  username: string|null,
  loading: boolean,
  login: (username, password) => Promise<{success, message}>,
  logout: () => void,
  isLoggedIn: boolean
}
```

**Usage:**
```jsx
const { token, username, login, logout } = useAuth()
```

### useProducts(token)
Manages product CRUD operations.

**Parameters:**
- `token` - Keycloak JWT token for API authorization

**Returns:**
```javascript
{
  products: array,
  loading: boolean,
  loadProducts: () => Promise<{success, message, data}>,
  addProduct: (name, price) => Promise<{success, message}>,
  updateProduct: (id, name, price) => Promise<{success, message}>,
  deleteProduct: (id) => Promise<{success, message}>,
}
```

**Usage:**
```jsx
const { products, addProduct, updateProduct, deleteProduct } = useProducts(token)
```

## Utilities

### helpers.js
- `escapeHtml(str)` - HTML escape for security
- `emojis` - Array of product emojis
- `getProductEmoji(id)` - Get emoji by product ID
- `formatPrice(price)` - Format price for Vietnamese locale

## Styling

### CSS Variables (theme.css)
```css
--bg: #09090b
--surface: #18181b
--surface2: #27272a
--border: rgba(255,255,255,0.08)
--text: #fafafa
--muted: #a1a1aa
--accent: #f97316
--success: #22c55e
--danger: #ef4444
```

## Data Flow

1. **App.jsx** manages global state (current page, auth status)
2. **useAuth** hook handles Keycloak login/logout
3. **useProducts** hook manages product API calls
4. Pages/Components receive props and call callbacks
5. **Toast** system displays feedback via global `showToast()` function

## API Endpoints

- Auth: `${VITE_API_BASE}/auth/realms/${VITE_AUTH_REALM}/protocol/openid-connect/token`
- Products: `${VITE_API_BASE}/products`

Authorization: JWT Bearer token in `Authorization` header
