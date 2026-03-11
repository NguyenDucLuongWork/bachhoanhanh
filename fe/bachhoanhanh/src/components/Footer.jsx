export default function Footer() {
  const year = new Date().getFullYear()

  const cols = [
    {
      title: 'Product',
      links: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
    },
    {
      title: 'Developers',
      links: ['Docs', 'API Reference', 'SDKs', 'Status'],
    },
    {
      title: 'Company',
      links: ['About', 'Blog', 'Careers', 'Contact'],
    },
    {
      title: 'Legal',
      links: ['Privacy', 'Terms', 'Cookies', 'Security'],
    },
  ]

  const socials = [
    {
      label: 'GitHub',
      href: '#',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
      ),
    },
    {
      label: 'Twitter / X',
      href: '#',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      label: 'Discord',
      href: '#',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      ),
    },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Syne:wght@400;600;800&display=swap');

        .footer-root {
          font-family: 'Syne', sans-serif;
          background: #09090b;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin-top: auto;
        }

        .footer-grid-section {
          max-width: 1280px;
          margin: 0 auto;
          padding: 4rem 1.5rem 3rem;
          display: grid;
          grid-template-columns: 1.8fr repeat(4, 1fr);
          gap: 3rem;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .footer-logo-mark {
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
          flex-shrink: 0;
        }

        .footer-logo-text {
          font-size: 1.1rem;
          font-weight: 800;
          color: #f4f4f5;
          letter-spacing: -0.02em;
        }

        .footer-logo-text span { color: #a78bfa; }

        .footer-tagline {
          font-size: 0.875rem;
          color: #52525b;
          line-height: 1.7;
          max-width: 220px;
        }

        .footer-socials {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .social-btn {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: transparent;
          color: #52525b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .social-btn:hover {
          border-color: rgba(167, 139, 250, 0.4);
          color: #a78bfa;
          background: rgba(167, 139, 250, 0.07);
          transform: translateY(-2px);
        }

        .footer-col-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: #71717a;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 1rem;
        }

        .footer-col-links {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .footer-col-links a {
          font-size: 0.875rem;
          color: #52525b;
          text-decoration: none;
          transition: color 0.2s;
          font-weight: 500;
        }

        .footer-col-links a:hover {
          color: #d4d4d8;
        }

        .footer-bottom {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1.25rem 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .footer-copy {
          font-size: 0.8rem;
          color: #3f3f46;
          font-family: 'JetBrains Mono', monospace;
        }

        .footer-copy span { color: #52525b; }

        .footer-status {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: #4ade80;
          opacity: 0.75;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 8px #4ade80;
          animation: blink 2.5s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @media (max-width: 960px) {
          .footer-grid-section {
            grid-template-columns: repeat(2, 1fr);
          }
          .footer-brand {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 500px) {
          .footer-grid-section {
            grid-template-columns: 1fr 1fr;
            padding: 2.5rem 1rem 2rem;
          }
        }
      `}</style>

      <footer className="footer-root">
        <div className="footer-grid-section">
          {/* Brand column */}
          <div className="footer-brand">
            <a href="#" className="footer-logo">
              <div className="footer-logo-mark">{'</>'}</div>
              <span className="footer-logo-text">my<span>app</span></span>
            </a>
            <p className="footer-tagline">
              Built for developers. Designed to ship fast.
            </p>
            <div className="footer-socials">
              {socials.map(s => (
                <a key={s.label} href={s.href} className="social-btn" title={s.label} aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.title}>
              <div className="footer-col-title">{col.title}</div>
              <ul className="footer-col-links">
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <span className="footer-copy">
            © {year} <span>myapp, Inc.</span> — All rights reserved.
          </span>
          <div className="footer-status">
            <span className="status-dot" />
            All systems operational
          </div>
        </div>
      </footer>
    </>
  )
}