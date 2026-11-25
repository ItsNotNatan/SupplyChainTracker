import { useEffect, useMemo, useState } from 'react'
import {
  X, Hash, PenTool, Package, Settings, Factory,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Search, RotateCcw
} from 'lucide-react'
import { getTheme, formatDate } from '../utils/formatadores.js'
import ArvoreHierarquia from './ArvoreHierarquia.jsx'
import { getMaterialScheduleStatus, getMilestoneScheduleStatus } from '../utils/statusCronograma.js'

const MATERIAL_MILESTONES = [
  { key: 'liberacao', label: 'Liberação' },
  { key: 'insercaoTarefa', label: 'Inserção de tarefa' },
  { key: 'requisicao', label: 'Requisição' },
  { key: 'pedido', label: 'Pedido' },
  { key: 'entregaComau', label: 'Entrega na COMAU' },
  { key: 'criacaoPS', label: 'Criação do P&S' },
  { key: 'entregaUsuario', label: 'Entrega ao usuário' }
]

const PAGE_SIZE_OPTIONS = [3, 6, 9, 12, 24]

function normalizeFilter(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

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
  const commercialItems = materials.comerciais ?? []
  const constructiveItems = materials.construtivos ?? []

  return (
    <div className="modal-overlay active" onClick={event => { if (event.target === event.currentTarget) onClose() }}>
      <div className="modal-content">
        <div className="modal-header">
          <div className="modal-header-info">
            <h2 className="modal-title">{card.id}</h2>
            <div className="modal-tags modal-tags-inline" aria-label="Identificação da transmissão">
              <span className="badge-outline">Projeto: {card.projeto || 'Não informado'}</span>
              <span className="badge-outline">Linha: {card.linha || '—'}</span>
              <span className="badge-outline">Operação: {card.operacao || '—'}</span>
              <span className="badge-outline"><Hash className="icon-sm" /> Qtd: {card.qtd || 1}</span>
            </div>
            <p className="modal-description"><strong>Descrição:</strong> {card.descricao || 'Não informada'}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fechar detalhes">
            <X className="icon-md" />
          </button>
        </div>

        <div className="modal-body">
          <ArvoreHierarquia stages={card.stages} activeTab={activeTab} onTabChange={setActiveTab} />

          <MaterialCategorySelector
            activeTab={activeTab}
            onSelect={setActiveTab}
            commercialCount={commercialItems.length}
            constructiveCount={constructiveItems.length}
          />

          <div className="details-grid">
            {showEngineering && (
              <section className={`detail-section ${!showAll ? 'full-width' : ''}`}>
                <SectionTitle icon={PenTool} title="Engenharia" status={card.stages?.Engenharia} />
                <div className="engineering-subgrid">
                  <EngineeringSubsection title="Mecânica" status={card.subStages?.EngMecanica}>
                    <InfoRow label="Desenho 3D" value={card.construtivo?.des3D || 'Não mapeado'} badge />
                    <InfoRow label="Desenho 2D" value={card.construtivo?.des2D || 'Não mapeado'} badge />
                    <InfoRow label="Lista de materiais mecânicos" value={card.pcp?.listaMatMec && card.pcp.listaMatMec !== 'Não mapeado' ? card.pcp.listaMatMec : (card.construtivo?.listaMatMec || 'Não mapeado')} badge />
                  </EngineeringSubsection>

                  <EngineeringSubsection title="Controls" status={card.subStages?.EngControls}>
                    <InfoRow label="Projeto elétrico" value={card.pcp?.projEle || 'Não mapeado'} badge />
                    <InfoRow label="Lista de materiais de control" value={card.pcp?.listaMatControls || 'Não mapeado'} badge />
                    <InfoRow label="Topográfico" value={card.pcp?.projTop || 'Não mapeado'} badge />
                    <InfoRow label="Lista de identificações" value={card.pcp?.listaIdent || 'Não mapeado'} badge />
                    <InfoRow label="Layout de calha" value={card.pcp?.layoutCalha || 'Não mapeado'} badge />
                  </EngineeringSubsection>
                </div>
              </section>
            )}

            {showCommercial && (
              <section className={`detail-section material-detail-section ${!showAll ? 'full-width' : ''}`}>
                <SectionTitle icon={Package} title="Comerciais" status={card.stages?.Comerciais} />
                {commercialItems.length > 0 ? (
                  <MaterialListExplorer items={commercialItems} category="commercial" />
                ) : (
                  <EmptyMessage>Nenhum item comercial associado a esta transmissão.</EmptyMessage>
                )}
              </section>
            )}

            {showConstructive && (
              <section className={`detail-section material-detail-section ${!showAll ? 'full-width' : ''}`}>
                <SectionTitle icon={Settings} title="Construtivos" status={card.stages?.Construtivos} />
                {constructiveItems.length > 0 ? (
                  <MaterialListExplorer items={constructiveItems} category="constructive" />
                ) : (
                  <EmptyMessage>Nenhum item construtivo associado a esta transmissão.</EmptyMessage>
                )}
                {card.construtivo?.obs && (
                  <div className="material-observation">
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

function MaterialCategorySelector({
  activeTab,
  onSelect,
  commercialCount,
  constructiveCount
}) {
  const categories = [
    {
      key: 'Comerciais',
      title: 'Comerciais',
      description: 'Visualizar somente os materiais comerciais desta transmissão',
      count: commercialCount,
      icon: Package,
      className: 'commercial'
    },
    {
      key: 'Construtivos',
      title: 'Construtivos',
      description: 'Visualizar somente os materiais construtivos desta transmissão',
      count: constructiveCount,
      icon: Settings,
      className: 'constructive'
    }
  ]

  return (
    <section className="material-category-area" aria-label="Selecionar classe de materiais">
      <div className="material-category-heading">
        <h3>Materiais da transmissão</h3>
        <p>Selecione uma das caixas para visualizar os itens daquela classe.</p>
      </div>

      <div className="material-category-selector">
        {categories.map(({ key, title, description, count, icon: Icon, className }) => (
          <button
            key={key}
            type="button"
            className={`material-category-button ${className} ${activeTab === key ? 'selected' : ''}`}
            onClick={() => onSelect(key)}
            aria-pressed={activeTab === key}
          >
            <span className="material-category-icon"><Icon className="icon-lg" /></span>
            <span className="material-category-copy">
              <strong>{title}</strong>
              <small>{description}</small>
            </span>
            <span className="material-category-count">
              <strong>{count}</strong>
              <small>{count === 1 ? 'item' : 'itens'}</small>
            </span>
          </button>
        ))}
      </div>

      {activeTab === 'Comerciais' || activeTab === 'Construtivos' ? (
        <button type="button" className="material-category-show-all" onClick={() => onSelect('All')}>
          Mostrar todas as etapas novamente
        </button>
      ) : null}
    </section>
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

function MaterialListExplorer({ items, category }) {
  const [manufacturerFilter, setManufacturerFilter] = useState('')
  const [rcFilter, setRcFilter] = useState('')
  const [poFilter, setPoFilter] = useState('')
  const [pageSize, setPageSize] = useState(9)
  const [page, setPage] = useState(1)

  const manufacturerOptions = useMemo(() => (
    Array.from(new Set(items
      .map(item => String(item.fabricante || item.fornecedor || '').trim())
      .filter(name => name && !['-', 'nao informado', 'n/a'].includes(normalizeFilter(name)))))
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
  ), [items])

  const filteredItems = useMemo(() => items.filter(item => {
    const itemManufacturer = normalizeFilter(item.fabricante || item.fornecedor)
    const itemRc = normalizeFilter(item.rc)
    const itemPo = normalizeFilter(item.po)
    return (!manufacturerFilter || itemManufacturer === normalizeFilter(manufacturerFilter)) &&
      (!rcFilter || itemRc.includes(normalizeFilter(rcFilter))) &&
      (!poFilter || itemPo.includes(normalizeFilter(poFilter)))
  }), [items, manufacturerFilter, rcFilter, poFilter])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const visibleItems = filteredItems.slice(startIndex, startIndex + pageSize)
  const firstVisible = filteredItems.length ? startIndex + 1 : 0
  const lastVisible = Math.min(startIndex + pageSize, filteredItems.length)

  useEffect(() => {
    setPage(1)
  }, [manufacturerFilter, rcFilter, poFilter, pageSize, items])

  const hasFilters = Boolean(manufacturerFilter || rcFilter || poFilter)
  const pageStart = Math.max(1, Math.min(safePage - 2, totalPages - 4))
  const pageEnd = Math.min(totalPages, pageStart + 4)
  const pageNumbers = Array.from({ length: pageEnd - pageStart + 1 }, (_, index) => pageStart + index)

  return (
    <div className="material-list-browser">
      <div className="material-filter-panel" aria-label="Filtros dos materiais">
        <div className="material-filter-heading">
          <div>
            <strong>Filtrar materiais</strong>
            <span>Fabricante, número da RC e número da PO</span>
          </div>
          {hasFilters && (
            <button
              type="button"
              className="material-filter-reset"
              onClick={() => {
                setManufacturerFilter('')
                setRcFilter('')
                setPoFilter('')
              }}
            >
              <RotateCcw size={13} /> Limpar filtros
            </button>
          )}
        </div>

        <div className="material-filters-grid">
          <label className="material-filter-field">
            <span>{category === 'commercial' ? 'Fabricante' : 'Construtivos'}</span>
            <select value={manufacturerFilter} onChange={event => setManufacturerFilter(event.target.value)}>
              <option value="">Todos</option>
              {manufacturerOptions.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>

          <label className="material-filter-field">
            <span>Nº da RC</span>
            <div className="material-filter-input-wrap">
              <Search size={14} />
              <input
                type="search"
                placeholder="Buscar RC"
                value={rcFilter}
                onChange={event => setRcFilter(event.target.value)}
              />
            </div>
          </label>

          <label className="material-filter-field">
            <span>Nº da PO</span>
            <div className="material-filter-input-wrap">
              <Search size={14} />
              <input
                type="search"
                placeholder="Buscar PO"
                value={poFilter}
                onChange={event => setPoFilter(event.target.value)}
              />
            </div>
          </label>
        </div>
      </div>

      <div className="material-list-summary">
        <span>{filteredItems.length} {filteredItems.length === 1 ? 'material encontrado' : 'materiais encontrados'}</span>
        <label>
          Itens por página
          <select value={pageSize} onChange={event => setPageSize(Number(event.target.value))}>
            {PAGE_SIZE_OPTIONS.map(size => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
      </div>

      {visibleItems.length > 0 ? (
        <div className="material-list">
          {visibleItems.map((item, index) => (
            <MaterialCard key={item.id || `${item.referencia}-${startIndex + index}`} item={item} category={category} />
          ))}
        </div>
      ) : (
        <EmptyMessage>
          {items.length === 0
            ? 'Nenhum material cadastrado nesta categoria.'
            : 'Nenhum material corresponde aos filtros selecionados.'}
        </EmptyMessage>
      )}

      {filteredItems.length > 0 && totalPages > 1 && (
        <nav className="material-pagination" aria-label="Paginação dos materiais">
          <span className="material-pagination-range">Exibindo {firstVisible}–{lastVisible} de {filteredItems.length}</span>
          <div className="material-pagination-buttons">
            <button type="button" onClick={() => setPage(1)} disabled={safePage === 1} aria-label="Primeira página" title="Primeira página">
              <ChevronsLeft size={15} />
            </button>
            <button type="button" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={safePage === 1} aria-label="Página anterior" title="Página anterior">
              <ChevronLeft size={15} />
            </button>
            {pageNumbers.map(pageNumber => (
              <button
                type="button"
                key={pageNumber}
                className={safePage === pageNumber ? 'active' : ''}
                onClick={() => setPage(pageNumber)}
                aria-current={safePage === pageNumber ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            ))}
            <button type="button" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={safePage === totalPages} aria-label="Próxima página" title="Próxima página">
              <ChevronRight size={15} />
            </button>
            <button type="button" onClick={() => setPage(totalPages)} disabled={safePage === totalPages} aria-label="Última página" title="Última página">
              <ChevronsRight size={15} />
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}

function MaterialCard({ item, category }) {
  const isCommercial = category === 'commercial'
  const manufacturerLabel = isCommercial ? 'Fabricante' : 'Construtivos'
  const manufacturerValue = isCommercial ? item.fabricante : (item.fornecedor || item.fabricante)
  const combinedDates = { ...(item.datas || {}), ...(item.datasComplementares || {}) }
  const overallStatus = getMaterialScheduleStatus(item, MATERIAL_MILESTONES.map(milestone => milestone.key))

  return (
    <article className={`material-card ${isCommercial ? 'material-commercial' : 'material-constructive'} ${isCommercial ? `material-schedule-${overallStatus.code}` : ''}`}>
      <div className="material-card-heading">
        <div>
          <div className="material-type-label">{isCommercial ? 'Material comercial' : 'Material construtivo'}</div>
          <h4 className="material-description">{item.descricao || 'Descrição não informada'}</h4>
        </div>
        <div className="material-card-heading-status">
          {isCommercial && (
            <span
              className={`material-overall-status-dot ${overallStatus.code}`}
              title={overallStatus.label}
              aria-label={overallStatus.label}
            />
          )}
          {item.tag && <span className="anticipation-tag">{item.tag}</span>}
        </div>
      </div>

      <div className="material-fields">
        <InfoRow label="Referência" value={item.referencia || '—'} />
        <InfoRow label={manufacturerLabel} value={manufacturerValue || 'Não informado'} />
        <InfoRow label="Qtd" value={item.qtd || '—'} />
        <InfoRow label="Status da liberação" value={item.statusLiberacao || 'Não informado'} badge />
        <InfoRow label="Nº da RC" value={item.rc || 'Não informado'} />
        <InfoRow label="Nº da PO" value={item.po || 'Não informado'} />
      </div>

      <DateTable title="Cronograma de acompanhamento" dates={combinedDates} milestones={MATERIAL_MILESTONES} />
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
              const milestoneStatus = getMilestoneScheduleStatus(triple)
              return (
                <tr key={key}>
                  <th scope="row">
                    <span className="date-milestone-label">
                      <span
                        className={`milestone-status-dot ${milestoneStatus.code}`}
                        title={milestoneStatus.label}
                        aria-label={milestoneStatus.label}
                      />
                      <span>{label}</span>
                    </span>
                  </th>
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
