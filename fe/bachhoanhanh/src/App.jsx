import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { LoginPage } from './pages/LoginPage'
import { CatalogsPage } from './pages/CatalogsPage'
import { ProductsPage } from './pages/ProductsPage'
import { OrdersPage } from './pages/OrdersPage'
import { ToastContainer, useToast } from './components/Toast'
import { useAuth } from './hooks/useAuth'
import { useCatalogs } from './hooks/useCatalogs'
import { usePrototypes } from './hooks/usePrototypes'
import { useProducts } from './hooks/useProducts'
import { useOrders } from './hooks/useOrders'
import './styles/theme.css'

function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const { token, username, loading, login, logout, isLoggedIn } = useAuth()
  const { catalogs: catalogList, loading: catalogsLoading, loadCatalogTree, addCatalog, updateCatalog, deleteCatalog } = useCatalogs(token)
  const { prototypes, loadPrototypes } = usePrototypes(token)
  const { products, loading: productsLoading, loadProducts, addProduct, updateProduct, deleteProduct } = useProducts(token)
  const { orders, loading: ordersLoading, loadOrders, getOrderDetails, updateOrderStatus, cancelOrder } = useOrders(token)
  const [selectedCatalog, setSelectedCatalog] = useState(null)
  const { toasts } = useToast()

  useEffect(() => {
    if (isLoggedIn) {
      setCurrentPage('catalogs')
      loadCatalogTree()
      loadPrototypes()
      loadProducts()
    }
  }, [isLoggedIn, token, loadCatalogTree, loadPrototypes, loadProducts])

  useEffect(() => {
    // Build catalogs from unique catalogIds in prototypes if needed, but now we have catalogList
    // For now, use catalogList directly
  }, [prototypes])

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
        {currentPage === 'catalogs' && isLoggedIn && (
          <CatalogsPage
            catalogs={catalogList}
            loading={catalogsLoading}
            onAddCatalog={addCatalog}
            onUpdateCatalog={updateCatalog}
            onDeleteCatalog={deleteCatalog}
            onRefresh={loadCatalogTree}
          />
        )}
        {currentPage === 'products' && isLoggedIn && (
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
          />
        )}
      </main>

      <Footer />

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default App