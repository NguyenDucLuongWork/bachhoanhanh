import { useState } from 'react'
import ApiTester from './components/ApiTester'
import Header from './components/header'
import Footer from './components/footer'

function App() {
  const [apiTestOpen, setApiTestOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#09090b' }}>
      <Header
        onApiTestToggle={() => setApiTestOpen(o => !o)}
        isApiTestActive={apiTestOpen}
      />

      <ApiTester visible={apiTestOpen} />

      {/* Your page content */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem' }}>
        <div style={{ textAlign: 'center', color: '#52525b', fontFamily: 'monospace' }}>
          <p style={{ fontSize: '0.875rem' }}>← Your page content goes here</p>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App