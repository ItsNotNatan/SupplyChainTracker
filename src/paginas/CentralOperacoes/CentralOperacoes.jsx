import React from 'react'
import { Box, Database, ArrowRight } from 'lucide-react'
import logoComau from '../../assets/logo-comau.png'
import './CentralOperacoes.css'

export default function CentralOperacoes({ onOpenSupplyChain, onOpenDatabase, hasLoadedData = false }) {
  return (
    <div className="sct-home-hub-container">
      <div className="sct-wave-container" aria-hidden="true">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sct-wave-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.72" />
              <stop offset="50%" stopColor="#eff6ff" stopOpacity="0.84" />
              <stop offset="100%" stopColor="#e0e7ff" stopOpacity="0.66" />
            </linearGradient>
          </defs>
          <path
            fill="url(#sct-wave-gradient)"
            d="M0,192L60,202.7C120,213,240,235,360,213.3C480,192,600,128,720,112C840,96,960,128,1080,144C1200,160,1320,160,1380,160L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          />
        </svg>
      </div>

      <div className="sct-home-hub-content">
        <header className="sct-home-hub-header">
          <img src={logoComau} alt="Logo COMAU" className="sct-home-hub-logo" />
          <span className="sct-home-kicker">PLATAFORMA DE GESTÃO DE PROJETOS</span>
          <h1 className="sct-home-greeting">
            Bem-vindo ao SUPPLY <span>CHAIN TRACKER</span>
          </h1>
          <p className="sct-home-instructions">
            Acompanhe transmissões, engenharia, materiais e etapas de manufatura em um só lugar.
          </p>
        </header>

        <section className="sct-home-hub-grid" aria-label="Áreas do sistema">
          <button
            type="button"
            className="sct-hub-card sct-hub-card--blue"
            onClick={onOpenSupplyChain}
            aria-label={hasLoadedData ? 'Acessar Supply Chain e continuar acompanhando os dados carregados' : 'Acessar área de Supply Chain'}
          >
            <div className="sct-hub-card-topline">
              <div className="sct-hub-card-icon">
                <Box size={36} strokeWidth={1.8} />
              </div>
              {hasLoadedData && <span className="sct-hub-card-status">Base carregada nesta sessão</span>}
            </div>
            <h2>Área de Supply Chain</h2>
            <p>
              Importe as planilhas dos projetos e acompanhe transmissões, Engenharia, materiais Comerciais e Construtivos e Manufatura.
            </p>
            <div className="sct-area-tags" aria-label="Funcionalidades">
              <span className="sct-area-tag">Transmissões</span>
              <span className="sct-area-tag">Engenharia</span>
              <span className="sct-area-tag">Comerciais</span>
              <span className="sct-area-tag">Construtivos</span>
              <span className="sct-area-tag">Manufatura</span>
            </div>
            <div className="sct-hub-card-action">
              Acessar Supply Chain <ArrowRight size={18} className="sct-arrow-transition" />
            </div>
          </button>

          <button
            type="button"
            className="sct-hub-card sct-hub-card--indigo"
            onClick={onOpenDatabase}
            aria-label="Abrir prévia da área de Banco de Dados"
          >
            <div className="sct-hub-card-topline">
              <div className="sct-hub-card-icon">
                <Database size={36} strokeWidth={1.8} />
              </div>
              <span className="sct-hub-card-status sct-hub-card-status--planned">Em desenvolvimento</span>
            </div>
            <h2>Banco de Dados</h2>
            <p>
              Área destinada à consulta e ao gerenciamento centralizado das informações dos projetos e materiais.
            </p>
            <div className="sct-area-tags" aria-label="Áreas previstas">
              <span className="sct-area-tag">Projetos</span>
              <span className="sct-area-tag">Transmissões</span>
              <span className="sct-area-tag">Materiais</span>
              <span className="sct-area-tag">Consulta</span>
            </div>
            <div className="sct-hub-card-action">
              Visualizar módulo <ArrowRight size={18} className="sct-arrow-transition" />
            </div>
          </button>
        </section>

        <footer className="sct-home-hub-footer">
          Supply Chain Tracker <span aria-hidden="true">·</span> COMAU
        </footer>
      </div>
    </div>
  )
}
