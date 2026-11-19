import { PenTool, DollarSign, Wrench, Factory } from 'lucide-react'
import { getTheme } from '../utils/formatadores.js'

const STAGES = [
  { key: 'Engenharia', label: 'Engenharia', Icon: PenTool },
  { key: 'Comerciais', label: 'Comerciais', Icon: DollarSign },
  { key: 'Construtivos', label: 'Construtivos', Icon: Wrench },
  { key: 'Manufatura', label: 'Manufatura', Icon: Factory }
]

export default function ArvoreHierarquia({ stages = {}, activeTab, onTabChange }) {
  return (
    <div className="e2e-stepper" aria-label="Etapas do acompanhamento">
      {STAGES.map(({ key, label, Icon }) => {
        const theme = getTheme(stages[key])
        const StatusIcon = theme.Icon
        const active = activeTab === key
        return (
          <button
            key={key}
            type="button"
            className={`step ${theme.c} ${active ? 'active' : ''}`}
            onClick={() => onTabChange(active ? 'All' : key)}
            title={`${label}: ${theme.t}. Clique para filtrar esta classe.`}
            aria-pressed={active}
          >
            <span className="step-icon-wrapper"><Icon className="icon-md" /></span>
            <span className="step-label">{label}</span>
            <span className="step-status-icon" aria-label={`Status: ${theme.t}`}>
              <StatusIcon className="icon-sm" />
            </span>
          </button>
        )
      })}
    </div>
  )
}
