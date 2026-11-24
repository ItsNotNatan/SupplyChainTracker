import React from 'react'
import { Database, ArrowLeft, Clock } from 'lucide-react'
import './BancoDeDados.css'

export default function BancoDeDados({ onBack }) {
  return (
    <section className="sct-database-preview">
      <div className="sct-database-preview-card">
        <div className="sct-database-preview-icon">
          <Database size={38} strokeWidth={1.7} />
        </div>
        <span className="sct-database-preview-badge">
          <Clock size={14} /> Em desenvolvimento
        </span>
        <h1>Banco de Dados</h1>
        <p className="sct-database-preview-lead">
          Este espaço será destinado à consulta e ao gerenciamento centralizado das informações do Supply Chain Tracker.
        </p>
        <div className="sct-database-preview-note">
          A conexão com a base de dados e as ferramentas de consulta ainda não estão disponíveis nesta versão.
        </div>
        <button type="button" className="sct-database-preview-back" onClick={onBack}>
          <ArrowLeft size={17} /> Voltar à central
        </button>
      </div>
    </section>
  )
}
