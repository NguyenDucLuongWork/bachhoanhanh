export function Header({ username, currentPage, onNavigate, onLogout }) {
  return (
    <header>
      <div className="logo">
        Bach<span>Hoa</span>Nhanh
      </div>
      <nav id="main-nav">
        <button
          onClick={() => onNavigate('products')}
          className={currentPage === 'products' || currentPage === 'product-detail' ? 'active' : ''}
        >
          Products
        </button>
        {username && (
          <button
            onClick={() => onNavigate('orders')}
            className={currentPage === 'orders' ? 'active' : ''}
          >
            Orders
          </button>
        )}
      </nav>
      <div className="nav-right">
        {username ? (
          <>
            <span className="badge badge-green">● Connected</span>
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
              Get started
            </button>
          </>
        )}
      </div>
    </header>
  )
}
