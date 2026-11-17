import { PenTool, Cpu, ShoppingCart, DollarSign, Wrench, Factory, Truck } from 'lucide-react'
import { getTheme } from '../utils/formatadores.js'

const STAGE_ICONS = {
  EngMecanica: PenTool,
  EngControls: Cpu,
  Purchasing: ShoppingCart,
  Commercial: DollarSign,
  Constructives: Wrench,
  Manufacturing: Factory,
  Delivery: Truck
}

const formatLabel = (key) => {
  if (key === 'EngMecanica') return 'ENG. MECÂNICA'
  if (key === 'EngControls') return 'ENG. CONTROLS'
  return key.toUpperCase()
}

export default function ArvoreHierarquia({ stages, activeTab, onTabChange }) {
  return (
    <div className="e2e-stepper" style={{ paddingBottom: '2rem' }}>
      <div style={{ position: 'absolute', bottom: '0.5rem', width: '100%', textAlign: 'center', left: 0, fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>
        * Clique nos ícones acima para filtrar e isolar os detalhes de cada departamento
      </div>
      
      {Object.entries(stages).map(([key, value]) => {
        const theme = getTheme(value)
        const IconStage = STAGE_ICONS[key]
        const isActive = activeTab === key
        
        const activeStyle = isActive ? { 
          outline: '3px solid var(--cyan-mid)', 
          outlineOffset: '3px',
          transform: 'scale(1.15)',
          zIndex: 10
        } : {}

        return (
          <div 
            key={key} 
            className={`step ${theme.c}`}
            onClick={() => onTabChange(isActive ? 'All' : key)}
            style={{ cursor: 'pointer' }}
            title={`Filtrar área: ${formatLabel(key)}`}
          >
            <div className="step-icon-wrapper" style={activeStyle}>
              {IconStage && <IconStage className="icon-md" />}
            </div>
            <div className="step-label" style={isActive ? { color: 'var(--cyan-mid)' } : {}}>
              {formatLabel(key)}
            </div>
            <div className="step-status-text">{theme.t}</div>
          </div>
        )
      })}
    </div>
  )
}