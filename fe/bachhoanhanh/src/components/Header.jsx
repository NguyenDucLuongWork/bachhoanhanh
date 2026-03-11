import { useState, useEffect } from 'react'

export default function Header({ onApiTestToggle, isApiTestActive }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'Docs', href: '#' },
    { label: 'About', href: '#' },
    { label: 'Contact', href: '#' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Syne:wght@400;600;800&display=swap');

        .header-root {
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'Syne', sans-serif;
          transition: all 0.3s ease;
        }

        .header-bg {
          background: ${scrolled
            ? 'rgba(9, 9, 11, 0.92)'
            : 'rgba(9, 9, 11, 0.75)'};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'transparent'};
          transition: all 0.4s ease;
        }

        .header-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .logo-mark {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #e879f9 0%, #818cf8 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 600;
          color: white;
          letter-spacing: -1px;
          flex-shrink: 0;
        }

        .logo-text {
          font-size: 1.1rem;
          font-weight: 800;
          color: #f4f4f5;
          letter-spacing: -0.02em;
        }

        .logo-text span {
          color: #a78bfa;
        }

        nav {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .nav-link {
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #a1a1aa;
          text-decoration: none;
          transition: all 0.2s ease;
          letter-spacing: 0.01em;
        }

        .nav-link:hover {
          color: #f4f4f5;
          background: rgba(255,255,255,0.06);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .btn-api {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 7px 16px;
          border-radius: 9px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: all 0.22s ease;
          border: 1.5px solid;
          white-space: nowrap;
        }

        .btn-api.inactive {
          background: transparent;
          border-color: rgba(167, 139, 250, 0.4);
          color: #a78bfa;
        }

        .btn-api.inactive:hover {
          background: rgba(167, 139, 250, 0.1);
          border-color: #a78bfa;
          color: #c4b5fd;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(167, 139, 250, 0.2);
        }

        .btn-api.active {
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 16px rgba(124, 58, 237, 0.4);
        }

        .btn-api.active:hover {
          box-shadow: 0 6px 24px rgba(124, 58, 237, 0.5);
          transform: translateY(-1px);
        }

        .btn-api-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.7;
        }

        .btn-api.active .btn-api-dot {
          background: #4ade80;
          opacity: 1;
          box-shadow: 0 0 8px #4ade80;
          animation: pulse-dot 2s ease-in-out infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 4px #4ade80; }
          50% { box-shadow: 0 0 12px #4ade80; }
        }

        .btn-primary {
          padding: 7px 18px;
          border-radius: 9px;
          background: #f4f4f5;
          color: #09090b;
          font-size: 0.875rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .btn-primary:hover {
          background: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255,255,255,0.15);
        }

        .mobile-toggle {
          display: none;
          background: transparent;
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          padding: 7px;
          cursor: pointer;
          color: #a1a1aa;
          transition: all 0.2s;
        }

        .mobile-toggle:hover {
          border-color: rgba(255,255,255,0.25);
          color: #f4f4f5;
        }

        .mobile-menu {
          display: none;
          background: rgba(9, 9, 11, 0.98);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 1rem 1.5rem;
          flex-direction: column;
          gap: 0.25rem;
        }

        .mobile-menu .nav-link {
          display: block;
          padding: 10px 14px;
        }

        .mobile-menu-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        @media (max-width: 768px) {
          nav { display: none; }
          .btn-primary { display: none; }
          .mobile-toggle { display: flex; }
          .mobile-menu { display: ${mobileOpen ? 'flex' : 'none'}; }
        }
      `}</style>

      <header className="header-root">
        <div className="header-bg">
          <div className="header-inner">
            {/* Logo */}
            <a href="#" className="logo">
              <div className="logo-mark">{'</>'}</div>
              <span className="logo-text">my<span>app</span></span>
            </a>

            {/* Desktop Nav */}
            <nav>
              {navLinks.map(link => (
                <a key={link.label} href={link.href} className="nav-link">
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="header-actions">
              <button
                className={`btn-api ${isApiTestActive ? 'active' : 'inactive'}`}
                onClick={onApiTestToggle}
                title="Toggle API Tester"
              >
                <span className="btn-api-dot" />
                {isApiTestActive ? 'API Tester ON' : 'API Tester'}
              </button>
              <button className="btn-primary">Get Started</button>

              {/* Mobile hamburger */}
              <button
                className="mobile-toggle"
                onClick={() => setMobileOpen(o => !o)}
                aria-label="Toggle menu"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  {mobileOpen ? (
                    <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  ) : (
                    <>
                      <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="mobile-menu">
          {navLinks.map(link => (
            <a key={link.label} href={link.href} className="nav-link">{link.label}</a>
          ))}
          <div className="mobile-menu-actions">
            <button
              className={`btn-api ${isApiTestActive ? 'active' : 'inactive'}`}
              onClick={() => { onApiTestToggle(); setMobileOpen(false); }}
            >
              <span className="btn-api-dot" />
              {isApiTestActive ? 'API Tester ON' : 'Open API Tester'}
            </button>
            <button className="btn-primary">Get Started</button>
          </div>
        </div>
      </header>
    </>
  )
}