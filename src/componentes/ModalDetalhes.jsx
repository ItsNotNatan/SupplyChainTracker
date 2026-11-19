import { useEffect, useState } from 'react'
import {
  X, Folder, Hash, PenTool, DollarSign, Wrench, Factory, ChevronDown, ChevronUp
} from 'lucide-react'
import { getTheme, formatDate } from '../utils/formatadores.js'
import ArvoreHierarquia from './ArvoreHierarquia.jsx'

const MATERIAL_MILESTONES = [
  { key: 'liberacao', label: 'Liberação' },
  { key: 'insercaoTarefa', label: 'Inserção de tarefa' },
  { key: 'requisicao', label: 'Requisição' },
  { key: 'pedido', label: 'Pedido' }
]

const COMPLEMENTARY_MILESTONES = [
  { key: 'entregaComau', label: 'Data de entrega na COMAU' },
  { key: 'criacaoPS', label: 'Data da criação do P&S' },
  { key: 'entregaUsuario', label: 'Data de entrega ao usuário' }
]

export default function ModalDetalhes({ card, onClose }) {
  const [activeTab, setActiveTab] = useState('All')

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => setActiveTab('All'), [card?.id])

  if (!card) return null

  const showAll = activeTab === 'All'
  const showEngineering = showAll || activeTab === 'Engenharia'
  const showCommercial = showAll || activeTab === 'Comerciais'
  const showConstructive = showAll || activeTab === 'Construtivos'
  const showManufacturing = showAll || activeTab === 'Manufatura'
  const materials = card.materiais ?? { comerciais: [], construtivos: [] }

  return (
    <div className="modal-overlay active" onClick={event => { if (event.target === event.currentTarget) onClose() }}>
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-header-info">
            <div className="modal-eyebrow"><Folder className="icon-sm" /> Projeto: {card.projeto || 'Não informado'}</div>
            <h2 className="modal-title">ID: {card.id}</h2>
            <p className="modal-description"><strong>Descrição:</strong> {card.descricao || 'Não informada'}</p>
            <div className="modal-tags">
              <span className="badge-outline">Linha: {card.linha || '—'}</span>
              <span className="badge-outline">Operação: {card.operacao || '—'}</span>
              <span className="badge-outline"><Hash className="icon-sm" /> Qtd: {card.qtd || 1}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar detalhes">
            <X className="icon-md" />
          </button>
        </div>

        <div className="modal-body">
          <ArvoreHierarquia stages={card.stages} activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="details-grid">
            {showEngineering && (
              <section className={`detail-section ${!showAll ? 'full-width' : ''}`}>
                <SectionTitle icon={PenTool} title="Engenharia" status={card.stages?.Engenharia} />
                <div className="engineering-subgrid">
                  <EngineeringSubsection title="Mec" status={card.subStages?.EngMecanica}>
                    <InfoRow label="Desenho 3D" value={card.construtivo?.des3D || 'Não mapeado'} badge />
                    <InfoRow label="Desenho 2D" value={card.construtivo?.des2D || 'Não mapeado'} badge />
                    <InfoRow label="Lista de materiais mecânicos" value={card.pcp?.listaMatMec && card.pcp.listaMatMec !== 'Não mapeado' ? card.pcp.listaMatMec : (card.construtivo?.listaMatMec || 'Não mapeado')} badge />
                    <InfoRow label="Revisão" value={card.construtivo?.rev || '—'} />
                  </EngineeringSubsection>

                  <EngineeringSubsection title="Controls" status={card.subStages?.EngControls}>
                    <InfoRow label="Projeto elétrico" value={card.pcp?.projEle || 'Não mapeado'} badge />
                    <InfoRow label="Lista de materiais de controls" value={card.pcp?.listaMatControls || 'Não mapeado'} badge />
                    <InfoRow label="Topográfico" value={card.pcp?.projTop || 'Não mapeado'} badge />
                    <InfoRow label="Lista de identificações" value={card.pcp?.listaIdent || 'Não mapeado'} badge />
                    <InfoRow label="Layout de calha" value={card.pcp?.layoutCalha || 'Não mapeado'} badge />
                  </EngineeringSubsection>
                </div>
              </section>
            )}

            {showCommercial && (
              <section className={`detail-section ${!showAll ? 'full-width' : ''}`}>
                <SectionTitle icon={DollarSign} title="Comerciais" status={card.stages?.Comerciais} />
                <CaixaExpansivel 
                  titulo="Itens Comerciais" 
                  contagem={materials.comerciais.length}
                >
                  {materials.comerciais.length > 0 ? (
                    <div className="material-list">
                      {materials.comerciais.map((item, index) => (
                        <MaterialCard key={item.id || `${item.referencia}-${index}`} item={item} category="commercial" />
                      ))}
                    </div>
                  ) : (
                    <EmptyMessage>Nenhum item comercial associado a esta transmissão.</EmptyMessage>
                  )}
                </CaixaExpansivel>
              </section>
            )}

            {showConstructive && (
              <section className={`detail-section ${!showAll ? 'full-width' : ''}`}>
                <SectionTitle icon={Wrench} title="Construtivos" status={card.stages?.Construtivos} />
                <CaixaExpansivel 
                  titulo="Itens Construtivos" 
                  contagem={materials.construtivos.length}
                >
                  {materials.construtivos.length > 0 ? (
                    <div className="material-list">
                      {materials.construtivos.map((item, index) => (
                        <MaterialCard key={item.id || `${item.referencia}-${index}`} item={item} category="constructive" />
                      ))}
                    </div>
                  ) : (
                    <EmptyMessage>Nenhum item construtivo associado a esta transmissão.</EmptyMessage>
                  )}
                </CaixaExpansivel>
                
                {card.construtivo?.obs && (
                  <div className="material-observation" style={{ marginTop: '1rem' }}>
                    <strong>Observações do follow-up:</strong> {card.construtivo.obs}
                  </div>
                )}
              </section>
            )}

            {showManufacturing && (
              <section className={`detail-section ${!showAll ? 'full-width' : ''}`}>
                <SectionTitle icon={Factory} title="Manufatura" status={card.stages?.Manufatura} />
                <div className="manufacturing-fields">
                  <InfoRow label="Estratégia" value={card.manufatura?.estrategia || 'Não mapeado'} />
                  <InfoRow label="Montagem mecânica" value={card.manufatura?.montagemMecanica || 'Não mapeado'} />
                  <InfoRow label="Medição 3D" value={card.manufatura?.medicao3D || 'Não mapeado'} />
                  <InfoRow label="Bordo-máquina" value={card.manufatura?.bordoMaquina || (card.pcp ? 'Registrado no PCP' : 'Não mapeado')} />
                  <InfoRow label="Inspeção da qualidade" value={card.manufatura?.inspecaoQualidade || card.pcp?.testes || 'Não mapeado'} />
                  {card.construtivo?.localEnt && card.construtivo.localEnt !== '-' && (
                    <InfoRow label="Local de montagem" value={card.construtivo.localEnt} />
                  )}
                </div>
                <DateTable
                  title="Entrega do dispositivo"
                  dates={{ entregaDispositivo: card.manufatura?.entregaDispositivo || card.pcp?.entregaDispositivo }}
                  milestones={[{ key: 'entregaDispositivo', label: 'Entrega do dispositivo' }]}
                />
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* --- NOVO COMPONENTE: Caixa Expansível (Acordeão) --- */
function CaixaExpansivel({ titulo, contagem, children }) {
  const [aberto, setAberto] = useState(false)

  return (
    <div style={{ border: '1px solid var(--border-mid)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '0.5rem', background: 'var(--surface)' }}>
      <button 
        onClick={() => setAberto(!aberto)}
        style={{ 
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '0.75rem 1rem', background: 'var(--surface-2)', border: 'none', 
          cursor: 'pointer', borderBottom: aberto ? '1px solid var(--border)' : 'none',
          fontFamily: 'inherit', color: 'var(--text-main)', fontWeight: 600
        }}
      >
        <span>{titulo} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.4rem' }}>({contagem} itens)</span></span>
        {aberto ? <ChevronUp className="icon-sm text-muted" /> : <ChevronDown className="icon-sm text-muted" />}
      </button>
      
      {aberto && (
        <div style={{ padding: '1rem', background: 'var(--bg)' }}>
          {children}
        </div>
      )}
    </div>
  )
}
/* --------------------------------------------------- */

function SectionTitle({ icon: Icon, title, status }) {
  const theme = getTheme(status)
  const StatusIcon = theme.Icon
  return (
    <h3 className="detail-section-title">
      <Icon className="icon-sm" />
      <span>{title}</span>
      <span className={`section-status ${theme.c}`} title={`Status: ${theme.t}`} aria-label={`Status: ${theme.t}`}>
        <StatusIcon className="icon-sm" />
      </span>
    </h3>
  )
}

function EngineeringSubsection({ title, status, children }) {
  const theme = getTheme(status)
  const StatusIcon = theme.Icon
  return (
    <div className="engineering-subsection">
      <div className="engineering-subsection-title">
        <span>{title}</span>
        <StatusIcon className={`icon-sm ${theme.c}`} title={`Status: ${theme.t}`} />
      </div>
      {children}
    </div>
  )
}

function MaterialCard({ item, category }) {
  const isCommercial = category === 'commercial'
  const manufacturerLabel = isCommercial ? 'Fabricante' : 'Fornecedor'
  const manufacturerValue = isCommercial ? item.fabricante : (item.fornecedor || item.fabricante)

  return (
    <article className={`material-card ${isCommercial ? 'material-commercial' : 'material-constructive'}`}>
      <div className="material-card-heading">
        <div>
          <div className="material-type-label">{isCommercial ? 'Material comercial' : 'Material construtivo'}</div>
          <h4 className="material-description">{item.descricao || 'Descrição não informada'}</h4>
        </div>
        {item.tag && <span className="anticipation-tag">{item.tag}</span>}
      </div>

      <div className="material-fields">
        <InfoRow label="Qtd" value={item.qtd || '—'} />
        <InfoRow label="Referência" value={item.referencia || '—'} />
        <InfoRow label={manufacturerLabel} value={manufacturerValue || 'Não informado'} />
        <InfoRow label="Status da liberação" value={item.statusLiberacao || 'Não informado'} badge />
        <InfoRow label="Nº da RC" value={item.rc || 'Não informado'} />
        <InfoRow label="Nº da PO" value={item.po || 'Não informado'} />
      </div>

      <DateTable title="Datas de acompanhamento" dates={item.datas} milestones={MATERIAL_MILESTONES} />
      <SingleDateTable title="Dados de outras planilhas" dates={item.datasComplementares} milestones={COMPLEMENTARY_MILESTONES} />

      {(item.nf || item.pull) && (
        <div className="material-extra-info">
          {item.nf && <span>NF: {item.nf}</span>}
          {item.pull && <span>PULL: {item.pull}</span>}
        </div>
      )}
    </article>
  )
}

function DateTable({ title, dates = {}, milestones, compact = false }) {
  if (!milestones?.length) return null
  const hasAnyDate = milestones.some(({ key }) => {
    const triple = dates?.[key]
    return triple && (triple.planejado || triple.previsto || triple.realizado)
  })

  return (
    <div className={`date-table-block ${compact ? 'compact' : ''}`}>
      <div className="date-table-heading">{title}</div>
      <div className="date-table-scroll">
        <table className="date-table">
          <thead>
            <tr>
              <th>Marco</th>
              <th>Planeado</th>
              <th>Previsto</th>
              <th>Realizado</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map(({ key, label }) => {
              const triple = dates?.[key] || {}
              return (
                <tr key={key}>
                  <th scope="row">{label}</th>
                  <td>{formatDate(triple.planejado)}</td>
                  <td>{formatDate(triple.previsto)}</td>
                  <td>{formatDate(triple.realizado)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {!hasAnyDate && <p className="date-table-note">Datas ainda não disponíveis na base importada.</p>}
    </div>
  )
}

function SingleDateTable({ title, dates = {}, milestones }) {
  if (!milestones?.length) return null
  const hasAnyDate = milestones.some(({ key }) => dates?.[key])

  return (
    <div className="date-table-block compact">
      <div className="date-table-heading">{title}</div>
      <div className="date-table-scroll">
        <table className="date-table">
          <thead>
            <tr>
              <th>Informação</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map(({ key, label }) => (
              <tr key={key}>
                <th scope="row">{label}</th>
                <td>{formatDate(dates?.[key])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!hasAnyDate && <p className="date-table-note">Dados ainda não disponíveis nas planilhas de origem.</p>}
    </div>
  )
}

function InfoRow({ label, value, badge = false }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className={`info-val ${badge ? 'badge-status' : ''}`}>{value || '—'}</span>
    </div>
  )
}

function EmptyMessage({ children }) {
  return <p className="empty-message">{children}</p>
}