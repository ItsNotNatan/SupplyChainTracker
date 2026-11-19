import { useEffect, useState } from 'react'
import {
  X, Folder, Hash, PenTool, DollarSign, Wrench, Factory, ChevronDown, ChevronUp, Search
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

// 1. LIMITE DEFINIDO PARA 5 ITENS POR PÁGINA
const ITENS_POR_PAGINA = 5

function filtrarMateriais(materiais, termoBusca) {
  if (!termoBusca) return materiais
  
  const keyword = String(termoBusca)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

  return materiais.filter(item => {
    const textoItem = [
      item.descricao, item.referencia, item.fabricante, 
      item.fornecedor, item.rc, item.po, item.tag
    ].filter(Boolean).join(' ')
     .normalize('NFD')
     .replace(/[\u0300-\u036f]/g, '')
     .toLowerCase()

    return textoItem.includes(keyword)
  })
}

export default function ModalDetalhes({ card, onClose, initialTab = 'All' }) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [activeEngineeringSub, setActiveEngineeringSub] = useState('All')
  
  const [buscaComerciais, setBuscaComerciais] = useState('')
  const [buscaConstrutivos, setBuscaConstrutivos] = useState('')

  const [paginaComerciais, setPaginaComerciais] = useState(1)
  const [paginaConstrutivos, setPaginaConstrutivos] = useState(1)

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    setActiveTab(initialTab)
    setActiveEngineeringSub('All')
    
    setBuscaComerciais('')
    setBuscaConstrutivos('')
    setPaginaComerciais(1)
    setPaginaConstrutivos(1)
  }, [card?.id, initialTab])

  function handleTabChange(tab) {
    setActiveTab(tab)
    setActiveEngineeringSub('All')
  }

  if (!card) return null

  const showAll = activeTab === 'All'
  const showEngineering = showAll || activeTab === 'Engenharia'
  const showCommercial = showAll || activeTab === 'Comerciais'
  const showConstructive = showAll || activeTab === 'Construtivos'
  const showManufacturing = showAll || activeTab === 'Manufatura'
  
  const materials = card.materiais ?? { comerciais: [], construtivos: [] }
  
  // 2. MATEMÁTICA DA PAGINAÇÃO PARA COMERCIAIS
  const comerciaisFiltrados = filtrarMateriais(materials.comerciais, buscaComerciais)
  const totalPaginasComerciais = Math.ceil(comerciaisFiltrados.length / ITENS_POR_PAGINA)
  const indiceInicioComerciais = (paginaComerciais - 1) * ITENS_POR_PAGINA
  const indiceFimComerciais = paginaComerciais * ITENS_POR_PAGINA
  const comerciaisVisiveis = comerciaisFiltrados.slice(indiceInicioComerciais, indiceFimComerciais)

  // 3. MATEMÁTICA DA PAGINAÇÃO PARA CONSTRUTIVOS
  const construtivosFiltrados = filtrarMateriais(materials.construtivos, buscaConstrutivos)
  const totalPaginasConstrutivos = Math.ceil(construtivosFiltrados.length / ITENS_POR_PAGINA)
  const indiceInicioConstrutivos = (paginaConstrutivos - 1) * ITENS_POR_PAGINA
  const indiceFimConstrutivos = paginaConstrutivos * ITENS_POR_PAGINA
  const construtivosVisiveis = construtivosFiltrados.slice(indiceInicioConstrutivos, indiceFimConstrutivos)

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
          <ArvoreHierarquia stages={card.stages} activeTab={activeTab} onTabChange={handleTabChange} />

          <div className="details-grid">
            {showEngineering && (
              <section className={`detail-section ${!showAll ? 'full-width' : ''}`}>
                <SectionTitle icon={PenTool} title="Engenharia" status={card.stages?.Engenharia} />
                <div className="engineering-subgrid">
                  <EngineeringSubsection
                    id="mecanica"
                    title="Mec"
                    status={card.subStages?.EngMecanica}
                    expanded={activeEngineeringSub === 'All' || activeEngineeringSub === 'Mec'}
                    selected={activeEngineeringSub === 'Mec'}
                    onClick={() => setActiveEngineeringSub(current => current === 'Mec' ? 'All' : 'Mec')}
                  >
                    <InfoRow label="Desenho 3D" value={card.construtivo?.des3D || 'Não mapeado'} badge />
                    <InfoRow label="Desenho 2D" value={card.construtivo?.des2D || 'Não mapeado'} badge />
                    <InfoRow label="Lista de materiais mecânicos" value={card.pcp?.listaMatMec && card.pcp.listaMatMec !== 'Não mapeado' ? card.pcp.listaMatMec : (card.construtivo?.listaMatMec || 'Não mapeado')} badge />
                    <InfoRow label="Revisão" value={card.construtivo?.rev || '—'} />
                  </EngineeringSubsection>

                  <EngineeringSubsection
                    id="controls"
                    title="Controles"
                    status={card.subStages?.EngControls}
                    expanded={activeEngineeringSub === 'All' || activeEngineeringSub === 'Controls'}
                    selected={activeEngineeringSub === 'Controls'}
                    onClick={() => setActiveEngineeringSub(current => current === 'Controls' ? 'All' : 'Controls')}
                  >
                    <InfoRow label="Projeto elétrico" value={card.pcp?.projEle || 'Não mapeado'} badge />
                    <InfoRow label="Lista de materiais de controles" value={card.pcp?.listaMatControls || 'Não mapeado'} badge />
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
                
                <div className="keyword-filter" style={{ marginBottom: '1rem', width: '100%' }}>
                  <Search className="filter-search-icon icon-sm" />
                  <input
                    type="text"
                    placeholder="Procurar por palavra chave..."
                    className="filter-input"
                    value={buscaComerciais}
                    onChange={e => {
                      setBuscaComerciais(e.target.value)
                      setPaginaComerciais(1)
                    }}
                  />
                </div>

                <CaixaExpansivel 
                  titulo="Itens Comerciais" 
                  contagem={comerciaisFiltrados.length}
                >
                  {comerciaisVisiveis.length > 0 ? (
                    <>
                      <div className="material-list">
                        {comerciaisVisiveis.map((item, index) => (
                          <MaterialCard key={item.id || `${item.referencia}-${index}`} item={item} category="commercial" />
                        ))}
                      </div>
                      
                      {/* INSERÇÃO DOS BOTÕES DE PAGINAÇÃO */}
                      <ControlesPaginacao 
                        paginaAtual={paginaComerciais} 
                        totalPaginas={totalPaginasComerciais} 
                        onMudarPagina={setPaginaComerciais} 
                      />
                    </>
                  ) : (
                    <EmptyMessage>Nenhum item comercial encontrado para esta pesquisa.</EmptyMessage>
                  )}
                </CaixaExpansivel>
              </section>
            )}

            {showConstructive && (
              <section className={`detail-section ${!showAll ? 'full-width' : ''}`}>
                <SectionTitle icon={Wrench} title="Construtivos" status={card.stages?.Construtivos} />
                
                <div className="keyword-filter" style={{ marginBottom: '1rem', width: '100%' }}>
                  <Search className="filter-search-icon icon-sm" />
                  <input
                    type="text"
                    placeholder="Procurar por palavra chave..."
                    className="filter-input"
                    value={buscaConstrutivos}
                    onChange={e => {
                      setBuscaConstrutivos(e.target.value)
                      setPaginaConstrutivos(1)
                    }}
                  />
                </div>

                <CaixaExpansivel 
                  titulo="Itens Construtivos" 
                  contagem={construtivosFiltrados.length}
                >
                  {construtivosVisiveis.length > 0 ? (
                    <>
                      <div className="material-list">
                        {construtivosVisiveis.map((item, index) => (
                          <MaterialCard key={item.id || `${item.referencia}-${index}`} item={item} category="constructive" />
                        ))}
                      </div>

                      {/* INSERÇÃO DOS BOTÕES DE PAGINAÇÃO */}
                      <ControlesPaginacao 
                        paginaAtual={paginaConstrutivos} 
                        totalPaginas={totalPaginasConstrutivos} 
                        onMudarPagina={setPaginaConstrutivos} 
                      />
                    </>
                  ) : (
                    <EmptyMessage>Nenhum item construtivo encontrado para esta pesquisa.</EmptyMessage>
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
                  <InfoRow label="Bordo-máquina" value={card.manufatura?.bordoMaquina || 'Não mapeado'} />
                  <InfoRow label="Inspeção da qualidade" value={card.manufatura?.inspecaoQualidade || card.pcp?.testes || 'Não mapeado'} />
                  <InfoRow label="Controle de processo" value={card.pcp?.controleProcesso || 'Não mapeado'} />
                  {card.construtivo?.localEnt && card.construtivo.localEnt !== '-' && (
                    <InfoRow label="Local de montagem" value={card.construtivo.localEnt} />
                  )}
                </div>
                {card.pcp?.semanaEntrega && (
                  <p className="date-table-note manufacturing-week-note">Semana informada no PCP: <strong>{card.pcp.semanaEntrega}</strong>. A conversão para uma data depende do calendário/ano da planilha de origem.</p>
                )}
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

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================

// 4. NOVO COMPONENTE DE PAGINAÇÃO: Renderiza os números das páginas e botões Anterior/Próximo
function ControlesPaginacao({ paginaAtual, totalPaginas, onMudarPagina }) {
  if (totalPaginas <= 1) return null

  const botoesPagina = []
  for (let i = 1; i <= totalPaginas; i++) {
    const isAtiva = paginaAtual === i
    botoesPagina.push(
      <button
        key={i}
        onClick={() => onMudarPagina(i)}
        style={{
          margin: '0 0.2rem',
          padding: '0.35rem 0.65rem',
          border: '1px solid',
          borderColor: isAtiva ? 'var(--cyan-mid)' : 'var(--border-mid)',
          background: isAtiva ? 'var(--cyan-mid)' : 'var(--surface)',
          color: isAtiva ? '#fff' : 'var(--text-main)',
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.75rem',
          transition: 'all 0.2s'
        }}
        aria-label={`Página ${i}`}
        aria-current={isAtiva ? 'page' : undefined}
      >
        {i}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1.25rem', gap: '0.5rem' }}>
      <button
        disabled={paginaAtual === 1}
        onClick={() => onMudarPagina(paginaAtual - 1)}
        className="btn-outline"
        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', opacity: paginaAtual === 1 ? 0.5 : 1 }}
      >
        Anterior
      </button>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {botoesPagina}
      </div>
      
      <button
        disabled={paginaAtual === totalPaginas}
        onClick={() => onMudarPagina(paginaAtual + 1)}
        className="btn-outline"
        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', opacity: paginaAtual === totalPaginas ? 0.5 : 1 }}
      >
        Próximo
      </button>
    </div>
  )
}

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

function EngineeringSubsection({ id, title, status, expanded, selected, onClick, children }) {
  const theme = getTheme(status)
  const StatusIcon = theme.Icon
  return (
    <section className={`engineering-subsection ${selected ? 'selected' : ''}`}>
      <button
        type="button"
        className="engineering-subsection-toggle"
        onClick={onClick}
        aria-expanded={expanded}
        aria-controls={`engineering-subsection-${id}`}
        aria-pressed={selected}
      >
        <span>{title}</span>
        <span className="engineering-subsection-toggle-status" title={`Status: ${theme.t}`} aria-label={`Status: ${theme.t}`}>
          <StatusIcon className={`icon-sm ${theme.c}`} />
        </span>
      </button>
      {expanded && <div id={`engineering-subsection-${id}`} className="engineering-subsection-content">{children}</div>}
    </section>
  )
}

// Substitui apenas a função MaterialCard no ficheiro ModalDetalhes.jsx

function MaterialCard({ item, category }) {
  const isCommercial = category === 'commercial'
  const manufacturerLabel = isCommercial ? 'Fabricante' : 'Fornecedor'
  const manufacturerValue = isCommercial
    ? item.fabricante
    : (item.fornecedores?.length ? item.fornecedores.join(', ') : (item.fornecedor || item.fabricante))

  // LÓGICA DE CORES: Define a classe base e adiciona o verde se for antecipado
  let cardClass = isCommercial ? 'material-commercial' : 'material-constructive'
  if (item.tag) {
    cardClass += ' material-anticipated'
  }

  return (
    <article className={`material-card ${cardClass}`}>
      <div className="material-card-heading">
        <div>
          <div className="material-type-label">{isCommercial ? 'Material comercial' : 'Material construtivo'}</div>
          <h4 className="material-description">{item.descricao || 'Descrição não informada'}</h4>
        </div>
        {/* A etiqueta verde no canto superior direito mantém-se */}
        {item.tag && <span className="anticipation-tag">{item.tag}</span>}
      </div>

      <div className="material-fields">
        <InfoRow label="Qtd" value={item.qtd || '—'} />
        <InfoRow label="Referência" value={item.referencia || '—'} />
        <InfoRow label={manufacturerLabel} value={manufacturerValue || 'Não informado'} />
        <InfoRow label="Status da liberação" value={item.statusLiberacao || 'Não informado'} badge />
        {(isCommercial || (item.fornecedoresDetalhes?.length ?? 0) <= 1) && (
          <>
            <InfoRow label="Nº da RC" value={item.rc || 'Não informado'} />
            <InfoRow label="Nº da PO" value={item.po || 'Não informado'} />
          </>
        )}
      </div>

      {!isCommercial && (item.fornecedoresDetalhes?.length ?? 0) > 1 && (
        <div className="date-table-block compact">
          <div className="date-table-heading">Acompanhamento por fornecedor</div>
          <div className="date-table-scroll">
            <table className="date-table">
              <thead><tr><th>Fornecedor</th><th>Nº da RC</th><th>Nº da PO</th><th>Status da liberação</th></tr></thead>
              <tbody>{item.fornecedoresDetalhes.map((supplier, index) => (
                <tr key={`${supplier.nome}-${index}`}>
                  <th scope="row">{supplier.nome}</th>
                  <td>{supplier.rc || 'Não informado'}</td>
                  <td>{supplier.po || 'Não informado'}</td>
                  <td>{supplier.statusLiberacao || 'Não informado'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

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
              <th>Planejado</th>
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