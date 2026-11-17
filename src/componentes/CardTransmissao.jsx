import { Factory, Flag, Search, Hash } from 'lucide-react'
import { getTheme, formatDate } from '../utils/formatadores.js'

const STAGES_MAP = [
  { k: 'EngMecanica', l: 'ENG MEC' },
  { k: 'EngControls', l: 'ENG CTRL' },
  { k: 'Purchasing', l: 'PUR' },
  { k: 'Commercial', l: 'COM' },
  { k: 'Constructives', l: 'MFG Ext' },
  { k: 'Manufacturing', l: 'MFG Int' },
  { k: 'Delivery', l: 'DEL' }
]

export default function CardTransmissao({ card, onSelect, index = 0 }) {
  const theme = getTheme(card.overallStatus)
  const { Icon: StatusIcon } = theme

  return (
    <div
      className={`card ${theme.b}`}
      onClick={() => onSelect(card)}
      style={{ animationDelay: `${Math.min(index * 55, 550)}ms` }}
    >
      <div className="card-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start', flex: 1, paddingRight: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <span className="card-tag">
              {card.cliente} · {card.linhaOp}
            </span>
            <span className="card-tag" style={{ background: 'var(--surface-4)', color: 'var(--text-main)', borderColor: 'var(--border-hi)', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
              <Hash className="icon-inline" style={{ margin: 0, width: '0.6rem', height: '0.6rem' }} />
              Qtd: {card.qtd || 1}
            </span>
          </div>
          <h3 className="card-title">{card.id}</h3>
        </div>
        <div className={`card-status-badge ${theme.bg}`} style={{ flexShrink: 0 }}>
          {StatusIcon && <StatusIcon className="icon-inline" style={{ margin: 0 }} />}
        </div>
      </div>

      <p className="card-desc" title={card.descricao}>
        {card.descricao || '-'}
      </p>

      <div className="card-stages">
        {STAGES_MAP.map(({ k, l }) => {
          const st = getTheme(card.stages[k])
          const { Icon } = st
          return (
            <div key={k} className={`stage-box ${st.bg}`}>
              <span className="stage-title">{l}</span>
              <div className="stage-status">
                {Icon && <Icon className="icon-inline" />}
                {st.t === 'N/A' ? '-' : st.t.substring(0, 4) + '.'}
              </div>
            </div>
          )
        })}
      </div>

      {card.construtivo && (
        <div className="card-footer">
          <div className="card-footer-item">
            <Factory className="icon-inline" />
            <span>{card.construtivo.fornecedor.substring(0, 15)}</span>
          </div>
          <div className="card-footer-item">
            <Flag className="icon-inline" />
            <span>{formatDate(card.construtivo.entregaMfg)}</span>
          </div>
        </div>
      )}

      <button className="view-details-btn">
        <Search className="icon-sm" /> Detalhamento
      </button>
    </div>
  )
}