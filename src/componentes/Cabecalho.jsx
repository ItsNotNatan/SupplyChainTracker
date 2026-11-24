import { Home } from 'lucide-react'
import logoComau from '../assets/logo-comau.png'

export default function Cabecalho({ onHome }) {
  return (
    <header className="app-header">
      <div className="header-title-wrapper">
        <img src={logoComau} alt="COMAU" className="header-logo-img" />
        <h1 className="header-title">SUPPLY CHAIN TRACKER</h1>
      </div>
      <button type="button" className="header-home-btn" onClick={onHome} aria-label="Voltar à central de operações">
        <Home size={17} />
        <span>Central</span>
      </button>
    </header>
  )
}
