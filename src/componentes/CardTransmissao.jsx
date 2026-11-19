import { Folder, Hash, PenTool, DollarSign, Wrench, Factory } from 'lucide-react'
import { getTheme } from '../utils/formatadores.js'

const STAGES_MAP = [
  { key: 'Engenharia', label: 'Engenharia', icon: PenTool, cor: 'cor-engenharia' },
  { key: 'Comerciais', label: 'Comerciais', icon: DollarSign, cor: 'cor-comerciais' },
  { key: 'Construtivos', label: 'Construtivos', icon: Wrench, cor: 'cor-construtivos' },
  { key: 'Manufatura', label: 'Manufatura', icon: Factory, cor: 'cor-manufatura' }
]

export default function CardTransmissao({ card, onSelect, index = 0 }) {
  const suppliers = Array.from(new Set([
    ...(card.materiais?.construtivos ?? []).flatMap(item => item.fornecedores?.length ? item.fornecedores : [item.fornecedor || item.fabricante]),
    card.construtivo?.fornecedor
  ].map(value => String(value ?? '').trim()).filter(value => value && value !== '-' && value.toLowerCase() !== 'não informado' && value.toLowerCase() !== 'construtivo')))

  const handleKeyDown = event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(card, 'All')
    }
  }

  return (
    <article
      className="card transmission-card"
      onClick={() => onSelect(card, 'All')}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Abrir transmissão ${card.id}`}
      style={{ animationDelay: `${Math.min(index * 40, 480)}ms` }}
    >
      <div className="card-header">
        <div className="transmission-meta">
          <span className="card-tag"><Folder className="icon-inline" /> Projeto: {card.projeto || 'Não informado'}</span>
          <span className="card-tag">Linha: {card.linha || '—'}</span>
          <span className="card-tag">Operação: {card.operacao || '—'}</span>
          <span className="card-tag card-tag-quantity"><Hash className="icon-inline" /> Qtd: {card.qtd || 1}</span>
          {suppliers.length > 0 && <span className="card-tag card-tag-supplier">Fornecedor: {suppliers.join(', ')}</span>}
        </div>
        <span className="transmission-id">ID: {card.id}</span>
      </div>

      <p className="card-desc"><strong>Descrição:</strong> {card.descricao || 'Não informada'}</p>

      <div className="card-stages" aria-label="Status das classes">
        {STAGES_MAP.map(({ key, label, icon: StageIcon, cor }) => {
          const theme = getTheme(card.stages?.[key])
          const StatusIcon = theme.Icon
          return (
            <div 
              key={key} 
              className={`stage-box ${theme.c}`} 
              title={`${label}: ${theme.t}`}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(card, key)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  onSelect(card, key)
                }
              }}
            >
              <span className="stage-title">{label}</span>
              <div className="stage-status" aria-label={`Status ${theme.t}`}>
                <StageIcon className={`stage-department-icon ${cor}`} />
                <StatusIcon className="stage-status-icon" />
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}