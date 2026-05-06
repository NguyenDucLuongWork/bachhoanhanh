import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { LoginPage } from './pages/LoginPage'
import { ProductsPage } from './pages/ProductsPage'
import { OrdersPage } from './pages/OrdersPage'
import { ToastContainer, useToast } from './components/Toast'
import { useAuth } from './hooks/useAuth'
import { useProducts } from './hooks/useProducts'
import { useOrders } from './hooks/useOrders'
import './styles/theme.css'

function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const { token, username, loading, login, logout, isLoggedIn } = useAuth()
  const { products, loading: productsLoading, loadProducts, addProduct, updateProduct, deleteProduct } = useProducts(token)
  const { orders, loading: ordersLoading, loadOrders, getOrderDetails, cancelOrder } = useOrders(token)
  const { toasts } = useToast()

  useEffect(() => {
    if (isLoggedIn) {
      setCurrentPage('products')
      loadProducts()
    }
  }, [isLoggedIn, token, loadProducts])

  const handleLogin = async (user, pass) => {
    const result = await login(user, pass)
    if (result.success) {
      return { success: true }
    }
    return result
  }

  const handleLogout = () => {
    logout()
    setCurrentPage('login')
  }

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header username={username} currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} />

      <main>
        {currentPage === 'login' && <LoginPage onLoginSuccess={handleLogin} loading={loading} />}
        {currentPage === 'products' && isLoggedIn && (
          <ProductsPage
            products={products}
            loading={productsLoading}
            onAddProduct={addProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
            onRefresh={loadProducts}
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
      </main>

      <Footer />

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default App