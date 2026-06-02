import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { LoginPage } from './pages/LoginPage'
import { ProductsPage } from './pages/ProductsPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { OrdersPage } from './pages/OrdersPage'
import { CartPage } from './pages/CartPage'
import { AccountPage } from './pages/AccountPage'
import { BrandPage } from './pages/BrandPage'
import { CatalogsPage } from './pages/CatalogsPage'
import { BrandDetailPage } from './pages/BrandDetailPage'
import { StockPage } from './pages/StockPage'
import { VouchersPage } from './pages/VouchersPage'
import { UsersManagementPage } from './pages/UsersManagementPage'
import { CustomerDetailPage } from './pages/CustomerDetailPage'
import { ToastContainer, useToast } from './components/Toast'
import { showToast } from './components/Toast'
import { OrderDetailsModal } from './components/OrderDetailsModal'
import { useAuth } from './hooks/useAuth'
import { useCatalogs } from './hooks/useCatalogs'
import { usePrototypes } from './hooks/usePrototypes'
import { useProducts } from './hooks/useProducts'
import { useBrand } from './hooks/useBrand'
import { useOrders } from './hooks/useOrders'
import { useStocks } from './hooks/useStocks'
import { useVouchers } from './hooks/useVouchers'
import { useUsers } from './hooks/useUsers'
import './styles/theme.css'

function App() {
  const [currentPage, setCurrentPage] = useState('products')
  const { token, username, profile, roles, loading, login, registerCustomer, updateProfile, logout, isLoggedIn } = useAuth()
  const { catalogs: catalogList, loadCatalogTree, loadCatalogs, addCatalog, updateCatalog, deleteCatalog, loading: catalogsLoading } = useCatalogs(token)
  const { prototypes, loadPrototypes } = usePrototypes(token)
  const { products, loading: productsLoading, loadProducts, addProduct, updateProduct, deleteProduct, getProductById, searchProducts, getProductByBarcode, attributeTypes, loadAttributeTypes } = useProducts(token)
  const { brands, loading: brandsLoading, loadBrands, searchBrands, getBrandByName, createBrand, updateBrand, deleteBrand } = useBrand(token)
  const { orders, loading: ordersLoading, loadOrders, createOrder, getOrderDetails, updateOrderStatus, cancelOrder } = useOrders(token)
  const { stocks, loading: stocksLoading, loadStocks, createStock, updateStock, deleteStock } = useStocks(token)
  const { vouchers, loading: vouchersLoading, loadVouchers, getVoucherById, getVoucherByCode, createVoucher, updateVoucher, deleteVoucher } = useVouchers(token)
  const { customers, staff, customerDetail, loading: usersLoading, loadCustomers, loadStaff, getCustomerDetail, searchCustomerByPhone, createStaff, updateStaff, updateCustomer, deleteUser } = useUsers(token)
  const [selectedCatalog, setSelectedCatalog] = useState(null)
  const [productDetailId, setProductDetailId] = useState(null)
  const [brandDetailName, setBrandDetailName] = useState(null)
  const [customerDetailId, setCustomerDetailId] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [pendingAction, setPendingAction] = useState(null)
  const [checkoutOrder, setCheckoutOrder] = useState(null)
  const { toasts } = useToast()
  const isAdminUser = roles.includes('ADMIN') || roles.includes('STAFF')

  useEffect(() => {
    loadCatalogTree()
    loadPrototypes()
    loadProducts()
    loadBrands()
    loadAttributeTypes()
    loadStocks()
    if (isAdminUser) {
      loadCustomers()
      loadStaff()
    }
  }, [loadCatalogTree, loadPrototypes, loadProducts, loadBrands, loadAttributeTypes, loadStocks, loadCustomers, loadStaff, isAdminUser])

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
    if (currentPage === 'stocks') {
      loadStocks()
    }
    if (currentPage === 'vouchers' && isAdminUser) {
      loadVouchers()
    }
  }, [currentPage, loadStocks, loadVouchers, isAdminUser])

  useEffect(() => {
    const hash = window.location.hash || '#/'
    const route = hash.replace(/^#/, '').split('/').filter(Boolean)

    if (route[0] === 'products' && route[1]) {
      setProductDetailId(route[1])
      setCurrentPage('product-detail')
      window.history.replaceState({ page: 'product-detail', productId: route[1] }, '', `${window.location.pathname}#/${route.join('/')}`)
      return
    }

    if (route[0] === 'brands' && route[1] === 'detail' && route[2]) {
      const brandName = decodeURIComponent(route[2])
      setBrandDetailName(brandName)
      setCurrentPage('brand-detail')
      window.history.replaceState({ page: 'brand-detail', brandName }, '', `${window.location.pathname}#/${route.join('/')}`)
      return
    }

    if (route[0] === 'brands') {
      setCurrentPage('brands')
      window.history.replaceState({ page: 'brands' }, '', `${window.location.pathname}#/brands`)
      return
    }

    if (route[0] === 'stocks') {
      setCurrentPage('stocks')
      window.history.replaceState({ page: 'stocks' }, '', `${window.location.pathname}#/stocks`)
      return
    }
    if (route[0] === 'catalogs') {
      setCurrentPage('catalogs')
      window.history.replaceState({ page: 'catalogs' }, '', `${window.location.pathname}#/catalogs`)
      return
    }
    if (route[0] === 'vouchers') {
      setCurrentPage('vouchers')
      window.history.replaceState({ page: 'vouchers' }, '', `${window.location.pathname}#/vouchers`)
      return
    }
    if (route[0] === 'cart') {
      setCurrentPage('cart')
      window.history.replaceState({ page: 'cart' }, '', `${window.location.pathname}#/cart`)
      return
    }
    if (route[0] === 'orders') {
      setCurrentPage('orders')
      window.history.replaceState({ page: 'orders' }, '', `${window.location.pathname}#/orders`)
      return
    }
    if (route[0] === 'account') {
      setCurrentPage('account')
      window.history.replaceState({ page: 'account' }, '', `${window.location.pathname}#/account`)
      return
    }

    if (route[0] === 'users') {
      if (route[1] === 'detail' && route[2]) {
        setCustomerDetailId(route[2])
        setCurrentPage('customer-detail')
        window.history.replaceState({ page: 'customer-detail', customerId: route[2] }, '', `${window.location.pathname}#/${route.join('/')}`)
        return
      }
      setCurrentPage('users')
      window.history.replaceState({ page: 'users' }, '', `${window.location.pathname}#/users`)
      return
    }

    window.history.replaceState({ page: 'products' }, '', `${window.location.pathname}#/`)
  }, [])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/'
      const route = hash.replace(/^#/, '').split('/').filter(Boolean)
      if (route[0] === 'products' && route[1]) {
        setCurrentPage('product-detail')
        setProductDetailId(route[1])
        setBrandDetailName(null)
        return
      }
      if (route[0] === 'brands' && route[1] === 'detail' && route[2]) {
        setCurrentPage('brand-detail')
        setBrandDetailName(decodeURIComponent(route[2]))
        setProductDetailId(null)
        return
      }
      if (route[0] === 'brands') {
        setCurrentPage('brands')
        setProductDetailId(null)
        setBrandDetailName(null)
        return
      }
      if (route[0] === 'vouchers') {
        setCurrentPage('vouchers')
        setProductDetailId(null)
        setBrandDetailName(null)
        return
      }
      if (route[0] === 'cart') {
        setCurrentPage('cart')
        setProductDetailId(null)
        setBrandDetailName(null)
        return
      }
      if (route[0] === 'orders') {
        setCurrentPage('orders')
        setProductDetailId(null)
        setBrandDetailName(null)
        return
      }
      if (route[0] === 'account') {
        setCurrentPage('account')
        setProductDetailId(null)
        setBrandDetailName(null)
        return
      }
      if (route[0] === 'stocks') {
        setCurrentPage('stocks')
        setProductDetailId(null)
        setBrandDetailName(null)
        setCustomerDetailId(null)
        return
      }
      if (route[0] === 'users') {
        if (route[1] === 'detail' && route[2]) {
          setCurrentPage('customer-detail')
          setCustomerDetailId(route[2])
          setProductDetailId(null)
          setBrandDetailName(null)
          return
        }
        setCurrentPage('users')
        setProductDetailId(null)
        setBrandDetailName(null)
        setCustomerDetailId(null)
        return
      }
      setCurrentPage('products')
      setProductDetailId(null)
      setBrandDetailName(null)
      setCustomerDetailId(null)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
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
    navigateTo('products')
  }

  const navigateTo = (page, id) => {
    const basePath = window.location.pathname
    if (page === 'products') {
      setProductDetailId(null)
      setBrandDetailName(null)
      window.history.pushState({ page: 'products' }, '', `${basePath}#/`)
    } else if (page === 'product-detail' && id) {
      setProductDetailId(id)
      setBrandDetailName(null)
      window.history.pushState({ page: 'product-detail', productId: id }, '', `${basePath}#/products/${id}`)
    } else if (page === 'brands') {
      setProductDetailId(null)
      setBrandDetailName(null)
      window.history.pushState({ page: 'brands' }, '', `${basePath}#/brands`)
    } else if (page === 'brand-detail' && id) {
      setProductDetailId(null)
      setBrandDetailName(id)
      window.history.pushState({ page: 'brand-detail', brandName: id }, '', `${basePath}#/brands/detail/${encodeURIComponent(id)}`)
    } else if (page === 'stocks') {
      setProductDetailId(null)
      setBrandDetailName(null)
      window.history.pushState({ page: 'stocks' }, '', `${basePath}#/stocks`)
    } else if (page === 'vouchers') {
      setProductDetailId(null)
      setBrandDetailName(null)
      window.history.pushState({ page: 'vouchers' }, '', `${basePath}#/vouchers`)
    } else if (page === 'catalogs') {
      setProductDetailId(null)
      setBrandDetailName(null)
      window.history.pushState({ page: 'catalogs' }, '', `${basePath}#/catalogs`)
    } else if (page === 'cart') {
      setProductDetailId(null)
      setBrandDetailName(null)
      window.history.pushState({ page: 'cart' }, '', `${basePath}#/cart`)
    } else if (page === 'orders') {
      setProductDetailId(null)
      setBrandDetailName(null)
      window.history.pushState({ page: 'orders' }, '', `${basePath}#/orders`)
    } else if (page === 'account') {
      setProductDetailId(null)
      setBrandDetailName(null)
      setCustomerDetailId(null)
      window.history.pushState({ page: 'account' }, '', `${basePath}#/account`)
    } else if (page === 'users') {
      setProductDetailId(null)
      setBrandDetailName(null)
      setCustomerDetailId(null)
      window.history.pushState({ page: 'users' }, '', `${basePath}#/users`)
    } else if (page === 'customer-detail' && id) {
      setProductDetailId(null)
      setBrandDetailName(null)
      setCustomerDetailId(id)
      window.history.pushState({ page: 'customer-detail', customerId: id }, '', `${basePath}#/users/detail/${id}`)
    } else if (page === 'login') {
      setProductDetailId(null)
      setBrandDetailName(null)
      setCustomerDetailId(null)
      window.history.pushState({ page: 'login' }, '', `${basePath}#/login`)
    } else {
      setProductDetailId(null)
      setBrandDetailName(null)
      setCustomerDetailId(null)
      window.history.pushState({ page: 'products' }, '', `${basePath}#/`)
    }
    setCurrentPage(page)
  }

  const handleNavigate = (page) => {
    if (page === 'products') {
      navigateTo('products')
    } else if (page === 'brands') {
      navigateTo('brands')
    } else if (page === 'stocks') {
      navigateTo('stocks')
    } else if (page === 'catalogs') {
      navigateTo('catalogs')
    } else if (page === 'users') {
      navigateTo('users')
    } else if (page === 'orders') {
      navigateTo('orders')
    } else if (page === 'vouchers') {
      navigateTo('vouchers')
    } else {
      setCurrentPage(page)
    }
  }

  const handleViewBrand = (brandName) => {
    if (!brandName) return
    navigateTo('brand-detail', brandName)
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

  const handleViewProductByBarcode = (barcode) => {
    const product = products.find((item) => item.barcode === barcode)
    if (product) {
      navigateTo('product-detail', product.productId)
      return
    }
    showToast('Unable to find product for this barcode', true)
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
        {currentPage === 'login' && (
          <LoginPage
            onLoginSuccess={handleLogin}
            onRegisterSuccess={registerCustomer}
            loading={loading}
          />
        )}
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
            onViewBrand={handleViewBrand}
            searchProducts={searchProducts}
            getProductByBarcode={getProductByBarcode}
            onSearchBrands={searchBrands}
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
            onViewBrand={handleViewBrand}
            products={products}
          />
        )}
        {currentPage === 'brand-detail' && brandDetailName && (
          <BrandDetailPage
            brandName={brandDetailName}
            getBrandByName={getBrandByName}
            onBack={() => navigateTo('brands')}
          />
        )}
        {currentPage === 'catalogs' && isAdminUser && (
          <CatalogsPage
            catalogs={catalogList}
            loading={catalogsLoading}
            onAddCatalog={addCatalog}
            onUpdateCatalog={updateCatalog}
            onDeleteCatalog={deleteCatalog}
            onRefresh={loadCatalogTree}
          />
        )}
        {currentPage === 'stocks' && (
          <StockPage
            stocks={stocks}
            loading={stocksLoading}
            onRefresh={loadStocks}
            onCreateStock={createStock}
            onUpdateStock={updateStock}
            onDeleteStock={deleteStock}
            products={products}
            onViewProductByBarcode={handleViewProductByBarcode}
          />
        )}
        {currentPage === 'brands' && (
          <BrandPage
            brands={brands}
            loading={brandsLoading}
            onRefresh={loadBrands}
            onCreateBrand={createBrand}
            onUpdateBrand={updateBrand}
            onDeleteBrand={deleteBrand}
            onViewBrand={handleViewBrand}
            isAdminUser={isAdminUser}
          />
        )}
        {currentPage === 'vouchers' && isAdminUser && (
          <VouchersPage
            vouchers={vouchers}
            loading={vouchersLoading}
            products={products}
            catalogs={catalogList}
            onRefresh={loadVouchers}
            onCreateVoucher={createVoucher}
            onUpdateVoucher={updateVoucher}
            onDeleteVoucher={deleteVoucher}
            onSearchVoucherById={getVoucherById}
            onSearchVoucherByCode={getVoucherByCode}
          />
        )}
        {currentPage === 'orders' && isLoggedIn && (
          <OrdersPage
            orders={orders}
            loading={ordersLoading}
            onLoadOrders={loadOrders}
            onGetOrderDetails={getOrderDetails}
            onUpdateStatus={updateOrderStatus}
            onCancelOrder={cancelOrder}
            onRefresh={loadOrders}
            onGoHome={() => setCurrentPage('products')}
            isAdminUser={isAdminUser}
            token={token}
          />
        )}
        {currentPage === 'cart' && isLoggedIn && (
          <CartPage
            cartItems={cartItems}
            profile={profile}
            onUpdateQuantity={updateCartQuantity}
            onRemoveItem={removeCartItem}
            onClearCart={() => setCartItems([])}
            onCreateOrder={createOrder}
            onCheckoutCreated={setCheckoutOrder}
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === 'account' && isLoggedIn && (
          <AccountPage
            profile={profile}
            username={username}
            onUpdateProfile={updateProfile}
          />
        )}
        {currentPage === 'users' && isAdminUser && (
          <UsersManagementPage
            customers={customers}
            staff={staff}
            loading={usersLoading}
            isAdminUser={isAdminUser}
            onLoadCustomers={loadCustomers}
            onLoadStaff={loadStaff}
            onSearchByPhone={searchCustomerByPhone}
            onGetCustomerDetail={getCustomerDetail}
            onCreateStaff={createStaff}
            onUpdateStaff={updateStaff}
            onUpdateCustomer={updateCustomer}
            onDeleteUser={deleteUser}
            onViewCustomerDetail={(customerId) => navigateTo('customer-detail', customerId)}
          />
        )}
        {currentPage === 'customer-detail' && customerDetailId && isAdminUser && (
          <CustomerDetailPage
            customerId={customerDetailId}
            onBack={() => navigateTo('users')}
            getCustomerDetail={getCustomerDetail}
            onUpdateCustomer={updateCustomer}
          />
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
