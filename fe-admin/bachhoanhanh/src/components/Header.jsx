export function Header({ username, roles = [], cartCount = 0, currentPage, onNavigate, onLogout }) {
  const isAdminUser = roles.includes('ADMIN') || roles.includes('STAFF')
  const isCustomer = roles.includes('CUSTOMER')
  const roleLabel = isAdminUser ? (roles.includes('ADMIN') ? 'Admin' : 'Staff') : 'Customer'

  return (
    <header className="shop-header">
      <button className="brand-mark" onClick={() => onNavigate('products')} aria-label="Go home">
        <span className="brand-icon">B</span>
        <span>
          Bach<span>Hoa</span>Nhanh
        </span>
      </button>

      <nav className="shop-nav" id="main-nav">
        <button
          onClick={() => onNavigate('products')}
          className={currentPage === 'products' || currentPage === 'product-detail' ? 'active' : ''}
        >
          {isAdminUser ? 'Admin Dashboard' : 'Store'}
        </button>
        <button onClick={() => onNavigate('brands')} className={currentPage === 'brands' ? 'active' : ''}>
          Brands
        </button>
        {isAdminUser && (
          <>
            <button onClick={() => onNavigate('catalogs')} className={currentPage === 'catalogs' ? 'active' : ''}>
              Catalogs
            </button>
            <button onClick={() => onNavigate('prototypes')} className={currentPage === 'prototypes' ? 'active' : ''}>
              Prototypes
            </button>
            <button onClick={() => onNavigate('stocks')} className={currentPage === 'stocks' ? 'active' : ''}>
              Stocks
            </button>
            <button onClick={() => onNavigate('vouchers')} className={currentPage === 'vouchers' ? 'active' : ''}>
              Vouchers
            </button>
            <button onClick={() => onNavigate('orders')} className={currentPage === 'orders' ? 'active' : ''}>
              Orders
            </button>
            <button onClick={() => onNavigate('users')} className={currentPage === 'users' || currentPage === 'customer-detail' ? 'active' : ''}>
              Users
            </button>
          </>
        )}
        {isCustomer && (
          <>
            <button onClick={() => onNavigate('cart')} className={currentPage === 'cart' ? 'active' : ''}>
              Cart{cartCount > 0 ? ` ${cartCount}` : ''}
            </button>
            <button onClick={() => onNavigate('orders')} className={currentPage === 'orders' ? 'active' : ''}>
              Orders
            </button>
            <button onClick={() => onNavigate('account')} className={currentPage === 'account' ? 'active' : ''}>
              Account
            </button>
          </>
        )}
      </nav>

      <div className="nav-right">
        {username ? (
          <>
            <span className="role-pill">{roleLabel}</span>
            <div className="avatar" title={username}>
              {username[0].toUpperCase()}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={onLogout}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={() => onNavigate('login')}>
              Sign in
            </button>
            <button className="btn btn-accent" onClick={() => onNavigate('login')}>
              Start shopping
            </button>
          </>
        )}
      </div>
    </header>
  )
}
