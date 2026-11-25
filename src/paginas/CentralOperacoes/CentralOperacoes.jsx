import React from 'react'
import { Eye, Settings, ArrowRight } from 'lucide-react'
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
          <span className="sct-home-kicker">PLATAFORMA DE GESTÃO DA CADEIA DE SUPRIMENTOS</span>

          <h1 className="sct-home-greeting">
            Bem-vindo ao SUPPLY CHAIN <span className="brand-tracker">TRACKER</span>
          </h1>

          <p className="sct-home-instructions">
            Uma plataforma centralizada para monitoramento e controle da nossa cadeia de suprimentos para projetos em tempo real.
          </p>
        </header>

        <section className="sct-home-hub-grid" aria-label="Áreas do sistema">
          <button
            type="button"
            className="sct-hub-card sct-hub-card--blue"
            onClick={onOpenSupplyChain}
            aria-label={hasLoadedData ? 'Acessar Painel de Monitoramento e continuar acompanhando os dados carregados' : 'Acessar Painel de Monitoramento'}
          >
            <div className="sct-hub-card-topline">
              <div className="sct-hub-card-icon">
                <Eye size={36} strokeWidth={1.8} />
              </div>
              {hasLoadedData && <span className="sct-hub-card-status">Base carregada nesta sessão</span>}
            </div>

            <h2>Painel de Monitoramento</h2>
            <p>
              Monitore o status de cada transmissão e acompanhe os detalhes das etapas de engenharia, materiais comerciais, construtivos e manufatura.
            </p>

            <div className="sct-area-tags" aria-label="Funcionalidades do painel">
              <span className="sct-area-tag">Transmissões</span>
              <span className="sct-area-tag">Engenharia</span>
              <span className="sct-area-tag">Comerciais</span>
              <span className="sct-area-tag">Construtivos</span>
              <span className="sct-area-tag">Manufatura</span>
            </div>

            <div className="sct-hub-card-action">
              Acessar Painel <ArrowRight size={18} className="sct-arrow-transition" />
            </div>
          </button>

          <button
            type="button"
            className="sct-hub-card sct-hub-card--indigo"
            onClick={onOpenDatabase}
            aria-label="Abrir Área do Administrador"
          >
            <div className="sct-hub-card-topline">
              <div className="sct-hub-card-icon">
                <Settings size={36} strokeWidth={1.8} />
              </div>
              <span className="sct-hub-card-status sct-hub-card-status--planned">Em desenvolvimento</span>
            </div>

            <h2>Área do Administrador</h2>
            <p>
              Área destinada ao gerenciamento das bases de dados e das funcionalidades do sistema.
            </p>

            <div className="sct-area-tags" aria-label="Funcionalidades administrativas">
              <span className="sct-area-tag">Base de dados</span>
              <span className="sct-area-tag">Gestão do sistema</span>
            </div>

            <div className="sct-hub-card-action">
              Acessar Administração <ArrowRight size={18} className="sct-arrow-transition" />
            </div>
          </button>
        </section>

        <footer className="sct-home-hub-footer">
          Supply Chain <span className="brand-tracker">Tracker</span> <span aria-hidden="true">·</span> COMAU
        </footer>
      </div>
    </div>
  )
}
