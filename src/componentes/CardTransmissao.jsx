import { Folder, Hash, PenTool, Package, Settings, Factory } from 'lucide-react'
import { getTheme } from '../utils/formatadores.js'

const STAGES_MAP = [
  { key: 'Engenharia', label: 'Engenharia', icon: PenTool },
  { key: 'Comerciais', label: 'Comerciais', icon: Package },
  { key: 'Construtivos', label: 'Construtivos', icon: Settings },
  { key: 'Manufatura', label: 'Manufatura', icon: Factory }
]

export default function CardTransmissao({ card, onSelect, index = 0 }) {
  const handleKeyDown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(card)
    }
  }

  return (
    <article
      className="card transmission-card"
      onClick={() => onSelect(card)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Abrir transmissão ${card.id}`}
      style={{ animationDelay: `${Math.min(index * 40, 480)}ms` }}
    >
      <div className="card-header">
        <div className="transmission-meta" aria-label="Identificação da transmissão">
          <div className="transmission-meta-row">
            <span className="card-tag"><Folder className="icon-inline" /> Projeto: {card.projeto || 'Não informado'}</span>
            <span className="card-tag">Linha: {card.linha || '—'}</span>
          </div>
          <div className="transmission-meta-row">
            <span className="card-tag">Operação: {card.operacao || '—'}</span>
            <span className="card-tag card-tag-quantity"><Hash className="icon-inline" /> Qtd: {card.qtd || 1}</span>
          </div>
        </div>
      </div>

      {/* O nome da transmissão permanece como título, sem o rótulo ID: e sem caixa ao redor. */}
      <h3 className="card-title transmission-title">{card.id}</h3>

      <p className="card-desc"><strong>Descrição:</strong> {card.descricao || 'Não informada'}</p>

      <div className="card-stages" aria-label="Status das classes">
        {STAGES_MAP.map(({ key, label, icon: StageIcon }) => {
          const theme = getTheme(card.stages?.[key])
          const StatusIcon = theme.Icon
          return (
            <div key={key} className={`stage-box ${theme.c}`} title={`${label}: ${theme.t}`}>
              <span className="stage-title">{label}</span>
              <div className="stage-status" aria-label={`Status ${theme.t}`}>
                <StageIcon className="stage-department-icon" />
                <StatusIcon className="stage-status-icon" />
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}
