import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { LoginPage } from './pages/LoginPage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { OrdersPage } from './pages/OrdersPage'
import { CartPage } from './pages/CartPage'
import { ToastContainer, useToast } from './components/Toast'
import { showToast } from './components/Toast'
import { OrderDetailsModal } from './components/OrderDetailsModal'
import { useAuth } from './hooks/useAuth'
import { useCatalogs } from './hooks/useCatalogs'
import { usePrototypes } from './hooks/usePrototypes'
import { useProducts } from './hooks/useProducts'
import { useOrders } from './hooks/useOrders'
import './styles/theme.css'

function App() {
  const [currentPage, setCurrentPage] = useState('products')
  const { token, username, roles, loading, login, logout, isLoggedIn } = useAuth()
  const { catalogs: catalogList, loadCatalogTree } = useCatalogs(token)
  const { prototypes, loadPrototypes } = usePrototypes(token)
  const { products, loading: productsLoading, loadProducts, addProduct, updateProduct, deleteProduct, getProductById, searchProducts, getProductByBarcode, attributeTypes, loadAttributeTypes } = useProducts(token)
  const { orders, loading: ordersLoading, loadOrders, createOrder, getOrderDetails, updateOrderStatus, cancelOrder } = useOrders(token)
  const [selectedCatalog, setSelectedCatalog] = useState(null)
  const [productDetailId, setProductDetailId] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [pendingAction, setPendingAction] = useState(null)
  const [checkoutOrder, setCheckoutOrder] = useState(null)
  const { toasts } = useToast()
  const isAdminUser = roles.includes('ADMIN') || roles.includes('STAFF')

  useEffect(() => {
    loadCatalogTree()
    loadPrototypes()
    loadProducts()
    loadAttributeTypes()
  }, [loadCatalogTree, loadPrototypes, loadProducts, loadAttributeTypes])

  useEffect(() => {
    if (isLoggedIn && currentPage === 'login') {
      if (pendingAction?.type === 'add-to-cart') {
        addToCart(pendingAction.product, true)
        setPendingAction(null)
        navigateTo('products')
        return
      }
      if (pendingAction?.type === 'buy-now') {
        addToCart(pendingAction.product, true)
        setPendingAction(null)
        navigateTo('cart')
        return
      }
      setCurrentPage('products')
    }
  }, [isLoggedIn, currentPage, pendingAction])

  useEffect(() => {
    const pathname = window.location.pathname
    if (pathname.startsWith('/products/')) {
      const id = pathname.split('/products/')[1]
      if (id) {
        setProductDetailId(id)
        setCurrentPage('product-detail')
        window.history.replaceState({ page: 'product-detail', productId: id }, '', pathname)
        return
      }
    }
    window.history.replaceState({ page: 'products' }, '', '/')
  }, [])

  useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state || { page: 'products' }
      setCurrentPage(state.page || 'products')
      setProductDetailId(state.productId || null)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleLogin = async (user, pass) => {
    const result = await login(user, pass)
    if (result.success) {
      return { success: true }
    }
    return result
  }

  const handleLogout = () => {
    logout()
    setProductDetailId(null)
    setCurrentPage('products')
    window.history.pushState({ page: 'products' }, '', '/')
  }

  const navigateTo = (page, id) => {
    if (page === 'products') {
      setProductDetailId(null)
      window.history.pushState({ page: 'products' }, '', '/')
    } else if (page === 'product-detail' && id) {
      setProductDetailId(id)
      window.history.pushState({ page: 'product-detail', productId: id }, '', `/products/${id}`)
    } else {
      window.history.pushState({ page }, '', '/')
    }
    setCurrentPage(page)
  }

  const handleNavigate = (page) => {
    if (page === 'products') {
      navigateTo('products')
    } else {
      setCurrentPage(page)
    }
  }

  const requireLogin = (action = null) => {
    if (action) {
      setPendingAction(action)
    }
    navigateTo('login')
  }

  const addToCart = (product, skipAuthCheck = false) => {
    if (!skipAuthCheck && !isLoggedIn) {
      requireLogin({ type: 'add-to-cart', product })
      return
    }
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.productId)
      if (existing) {
        return prev.map((item) =>
          item.productId === product.productId ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    showToast('Added to cart')
  }

  const buyNow = (product) => {
    if (!isLoggedIn) {
      requireLogin({ type: 'buy-now', product })
      return
    }
    addToCart(product)
    navigateTo('cart')
  }

  const updateCartQuantity = (productId, quantity) => {
    setCartItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.productId !== productId)
      }
      return prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    })
  }

  const removeCartItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  const handleViewProduct = (id) => {
    navigateTo('product-detail', id)
  }

  const handleBackToProducts = () => {
    navigateTo('products')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        username={username}
        roles={roles}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <main>
        {currentPage === 'login' && <LoginPage onLoginSuccess={handleLogin} loading={loading} />}
        {currentPage === 'products' && (
          <ProductsPage
            products={products}
            loading={productsLoading}
            onAddProduct={addProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
            onRefresh={loadProducts}
            prototypes={prototypes}
            catalogs={catalogList}
            selectedCatalog={selectedCatalog}
            onSelectCatalog={setSelectedCatalog}
            onViewProduct={handleViewProduct}
            searchProducts={searchProducts}
            getProductByBarcode={getProductByBarcode}
            attributeTypes={attributeTypes}
            isAdminUser={isAdminUser}
            isLoggedIn={isLoggedIn}
            onAddToCart={addToCart}
            onBuyNow={buyNow}
            onRequireLogin={requireLogin}
          />
        )}
        {currentPage === 'product-detail' && productDetailId && (
          <ProductDetailPage
            productId={productDetailId}
            onBack={handleBackToProducts}
            getProductById={getProductById}
            isAdminUser={isAdminUser}
            onAddToCart={addToCart}
            onBuyNow={buyNow}
            products={products}
          />
        )}
        {currentPage === 'orders' && isLoggedIn && (
          <OrdersPage
            orders={orders}
            loading={ordersLoading}
            onLoadOrders={loadOrders}
            onGetOrderDetails={getOrderDetails}
            onCancelOrder={cancelOrder}
            onRefresh={loadOrders}
            onGoHome={() => setCurrentPage('products')}
            token={token}
          />
        )}
        {currentPage === 'cart' && isLoggedIn && (
          <CartPage
            cartItems={cartItems}
            onUpdateQuantity={updateCartQuantity}
            onRemoveItem={removeCartItem}
            onClearCart={() => setCartItems([])}
            onCreateOrder={createOrder}
            onCheckoutCreated={setCheckoutOrder}
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === 'account' && isLoggedIn && (
          <section className="page active" style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div className="page-header">
              <div>
                <h2>Account</h2>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                  Profile and access information
                </p>
              </div>
            </div>
            <div className="login-wrap" style={{ maxWidth: '520px' }}>
              <div className="field">
                <label>Username</label>
                <input type="text" value={username || ''} readOnly />
              </div>
              <div className="field">
                <label>Role</label>
                <input type="text" value={roles.join(', ') || 'CUSTOMER'} readOnly />
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />

      <OrderDetailsModal
        isOpen={!!checkoutOrder}
        orderData={checkoutOrder}
        onClose={() => setCheckoutOrder(null)}
        onPaymentCompleted={() => {
          loadOrders()
        }}
        onGoHome={() => {
          setCheckoutOrder(null)
          handleNavigate('orders')
        }}
        token={token}
        staticQrImageUrl="/qr.png"
      />

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default App
