import { useState } from 'react'
import { Home } from 'lucide-react'

export default function Cabecalho({ onHome, showHome = false }) {
  const [logoUnavailable, setLogoUnavailable] = useState(false)

  return (
    <header className="app-header">
      <div className="header-title-wrapper">
        {logoUnavailable ? (
          <span className="header-logo-fallback">COMAU</span>
        ) : (
          <img
            src="/logo-comau.png"
            alt="COMAU"
            className="header-logo-img"
            onError={() => setLogoUnavailable(true)}
          />
        )}
        <h1 className="header-title">SUPPLY CHAIN TRACKER</h1>
      </div>
      {showHome && (
        <button type="button" className="header-home-button" onClick={onHome}>
          <Home className="icon-sm" /> Início
        </button>
      )}
    </header>
  )
}
