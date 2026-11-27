import { useMemo, useState, useEffect } from 'react'
import { Filter, SearchX, ChevronDown, Search, Folder, GitBranch, Hash, AlertCircle, Calendar, CheckCircle2 } from 'lucide-react'
import CardTransmissao from '../componentes/CardTransmissao.jsx'
import FiltroMultiplo from '../componentes/FiltroMultiplo.jsx'
import ModalDetalhes from '../componentes/ModalDetalhes.jsx'
import { getTransmissionScheduleStatus } from '../utils/statusCronograma.js'

const PAGE_SIZE = 48

function normalizeSearch(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function flattenSearchValues(value) {
  if (value === null || value === undefined || value === '') return []
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return []
    return [value.toLocaleDateString('pt-BR'), value.toISOString().slice(0, 10)]
  }
  if (Array.isArray(value)) return value.flatMap(flattenSearchValues)
  if (typeof value === 'object') return Object.values(value).flatMap(flattenSearchValues)
  return [String(value)]
}

function getSearchText(card) {
  const materials = [
    ...(card.materiais?.comerciais ?? []),
    ...(card.materiais?.construtivos ?? [])
  ]
  const materialValues = materials.flatMap(item => [
    item.qtd,
    item.descricao,
    item.referencia,
    item.fabricante,
    item.fornecedor,
    item.statusLiberacao,
    item.rc,
    item.po,
    item.tag,
    ...flattenSearchValues(item.datas),
    ...flattenSearchValues(item.datasComplementares)
  ])

  const otherDataValues = [
    ...flattenSearchValues(card.construtivo),
    ...flattenSearchValues(card.pcp),
    ...flattenSearchValues(card.manufatura)
  ]

  return normalizeSearch([
    card.id,
    card.projeto,
    card.projetoWBS,
    card.cliente,
    card.linha,
    card.operacao,
    card.descricao,
    ...otherDataValues,
    ...materialValues
  ].filter(Boolean).join(' '))
}

function toSelectionArray(value) {
  if (Array.isArray(value)) return value.map(normalizeSearch)
  return value ? [normalizeSearch(value)] : []
}

function compareLabels(a, b) {
  return a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' })
}

/**
 * Organiza as transmissões em uma hierarquia Projeto > Linha > Operação.
 * A chave normalizada evita grupos duplicados apenas por diferença de caixa/acentos.
 */
function groupByProjectLineOperation(cards) {
  const projects = new Map()

  cards.forEach(card => {
    const projectLabel = String(card.projeto || 'Projeto não informado').trim()
    const lineLabel = String(card.linha || 'Linha não informada').trim()
    const operationLabel = String(card.operacao || 'Operação não informada').trim()

    const projectKey = normalizeSearch(projectLabel) || '__projeto_sem_nome__'
    const lineKey = normalizeSearch(lineLabel) || '__linha_sem_nome__'
    const operationKey = normalizeSearch(operationLabel) || '__operacao_sem_nome__'

    if (!projects.has(projectKey)) {
      projects.set(projectKey, { key: projectKey, label: projectLabel, lines: new Map(), count: 0 })
    }
    const project = projects.get(projectKey)
    project.count += 1

    if (!project.lines.has(lineKey)) {
      project.lines.set(lineKey, { key: lineKey, label: lineLabel, operations: new Map(), count: 0 })
    }
    const line = project.lines.get(lineKey)
    line.count += 1

    if (!line.operations.has(operationKey)) {
      line.operations.set(operationKey, { key: operationKey, label: operationLabel, cards: [] })
    }
    line.operations.get(operationKey).cards.push(card)
  })

  return Array.from(projects.values())
    .sort((a, b) => compareLabels(a.label, b.label))
    .map(project => ({
      ...project,
      lines: Array.from(project.lines.values())
        .sort((a, b) => compareLabels(a.label, b.label))
        .map(line => ({
          ...line,
          operations: Array.from(line.operations.values())
            .sort((a, b) => compareLabels(a.label, b.label))
        }))
    }))
}

export default function Visualizacao({
  processedData,
  filters,
  onFilterChange,
  uniqueProjetos,
  uniqueLinhas,
  uniqueOperacoes,
  selectedCard,
  onSelectCard,
  onCloseModal
}) {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredByCriteria = useMemo(() => {
    const keyword = normalizeSearch(filters.palavraChave)
    const selectedProjects = toSelectionArray(filters.projeto)
    const selectedLines = toSelectionArray(filters.linha)
    const selectedOperations = toSelectionArray(filters.operacao)

    return processedData.filter(card => {
      const keywordMatch = !keyword || getSearchText(card).includes(keyword)
      const projectMatch = selectedProjects.length === 0 || selectedProjects.includes(normalizeSearch(card.projeto))
      const lineMatch = selectedLines.length === 0 || selectedLines.includes(normalizeSearch(card.linha))
      const operationMatch = selectedOperations.length === 0 || selectedOperations.includes(normalizeSearch(card.operacao))
      return keywordMatch && projectMatch && lineMatch && operationMatch
    })
  }, [processedData, filters])

  // Classifica cada transmissão uma única vez e utiliza o mesmo resultado
  // tanto para os indicadores quanto para o filtro acionado pelos cards.
  const classifiedCards = useMemo(() => filteredByCriteria.map(card => ({
    card,
    status: getTransmissionScheduleStatus(card)
  })), [filteredByCriteria])

  const statusCounts = useMemo(() => {
    const counts = {
      all: filteredByCriteria.length,
      delayed: 0,
      attention: 0,
      'late-complete': 0,
      complete: 0
    }

    classifiedCards.forEach(({ status }) => {
      if (Object.prototype.hasOwnProperty.call(counts, status.code)) {
        counts[status.code] += 1
      }
    })

    return counts
  }, [filteredByCriteria.length, classifiedCards])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return filteredByCriteria
    return classifiedCards
      .filter(({ status }) => status.code === statusFilter)
      .map(({ card }) => card)
  }, [filteredByCriteria, classifiedCards, statusFilter])

  const statusCards = [
    { key: 'all', label: 'Total', tone: 'total', Icon: Folder, description: 'Todas as transmissões dos filtros atuais' },
    { key: 'delayed', label: 'Transmissões em atraso', tone: 'delayed', Icon: AlertCircle, description: 'Pelo menos um marco vermelho' },
    { key: 'attention', label: 'Previsto para próximos 7 dias', tone: 'attention', Icon: Calendar, description: 'Pelo menos um marco amarelo, sem marco vermelho' },
    { key: 'late-complete', label: 'Concluído em atraso', tone: 'late-complete', Icon: CheckCircle2, description: 'Marcos conhecidos concluídos, com ao menos um realizado após o planejado' },
    { key: 'complete', label: 'Concluído no prazo', tone: 'complete', Icon: CheckCircle2, description: 'Marcos conhecidos concluídos dentro do prazo' }
  ]

  const handleStatusFilter = key => {
    if (key === 'all' || statusFilter === key) {
      setStatusFilter('all')
    } else {
      setStatusFilter(key)
    }
  }

  useEffect(() => { setPage(1) }, [filtered])

  const visible = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page])
  const hierarchy = useMemo(() => groupByProjectLineOperation(visible), [visible])
  const hasMore = filtered.length > visible.length
  const remaining = filtered.length - visible.length

  return (
    <>
      <div className="dashboard-workspace">
        <div className="filters-bar">
          <div className="filter-label">
            <Filter className="icon-sm" /> Filtros
          </div>
          <div className="keyword-filter">
            <Search className="filter-search-icon icon-sm" />
            <input
              type="text"
              placeholder="Procurar por palavra chave"
              aria-label="Procurar por palavra chave"
              className="filter-input"
              value={filters.palavraChave}
              onChange={event => onFilterChange('palavraChave', event.target.value)}
            />
          </div>
          <FiltroMultiplo
            label="Projeto"
            placeholder="Todos os projetos"
            options={Array.from(uniqueProjetos)}
            value={filters.projeto}
            onChange={value => onFilterChange('projeto', value)}
          />
          <FiltroMultiplo
            label="Linha"
            placeholder="Todas as linhas"
            options={Array.from(uniqueLinhas)}
            value={filters.linha}
            onChange={value => onFilterChange('linha', value)}
          />
          <FiltroMultiplo
            label="Operação"
            placeholder="Todas as operações"
            options={Array.from(uniqueOperacoes)}
            value={filters.operacao}
            onChange={value => onFilterChange('operacao', value)}
          />
        </div>

        <div className="transmission-status-kpis" aria-label="Resumo de transmissões por status">
          {statusCards.map(({ key, label, tone, Icon, description }) => (
            <button
              type="button"
              key={key}
              className={`transmission-kpi transmission-kpi--${tone}${statusFilter === key ? ' is-selected' : ''}`}
              onClick={() => handleStatusFilter(key)}
              aria-pressed={statusFilter === key}
              title={`${description}. Clique para filtrar as transmissões.`}
            >
              <span className="transmission-kpi-icon" aria-hidden="true">
                <Icon size={20} strokeWidth={2.1} />
              </span>
              <span className="transmission-kpi-copy">
                <span className="transmission-kpi-label">{label}</span>
                <strong className="transmission-kpi-value">{statusCounts[key]}</strong>
              </span>
            </button>
          ))}
        </div>

        <div className="cards-result-count">
          {filtered.length} {filtered.length === 1 ? 'transmissão encontrada' : 'transmissões encontradas'}
          {statusFilter !== 'all' && ' no status selecionado'}
        </div>

        <div className="cards-wrapper">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <SearchX className="icon-xl" />
              <p style={{ fontWeight: 600 }}>Nenhuma transmissão encontrada.</p>
              <p style={{ fontSize: '.8rem' }}>Altere ou limpe um dos filtros para ver outros resultados.</p>
            </div>
          ) : (
            <>
              <div className="transmission-hierarchy">
                {hierarchy.map(project => (
                  <section className="hierarchy-project" key={project.key}>
                    <header className="hierarchy-project-header">
                      <div className="hierarchy-heading-main">
                        <Folder className="hierarchy-heading-icon" aria-hidden="true" />
                        <div>
                          <span className="hierarchy-level-label">PROJETO</span>
                          <h2>{project.label}</h2>
                        </div>
                      </div>
                      <span className="hierarchy-item-count">
                        {project.count} {project.count === 1 ? 'transmissão' : 'transmissões'}
                      </span>
                    </header>

                    <div className="hierarchy-lines">
                      {project.lines.map(line => (
                        <section className="hierarchy-line" key={`${project.key}-${line.key}`}>
                          <header className="hierarchy-line-header">
                            <GitBranch className="hierarchy-line-icon" aria-hidden="true" />
                            <span className="hierarchy-level-label">LINHA</span>
                            <h3>{line.label}</h3>
                            <span className="hierarchy-item-count">{line.count} {line.count === 1 ? 'transmissão' : 'transmissões'}</span>
                          </header>

                          <div className="hierarchy-operations">
                            {line.operations.map(operation => (
                              <section className="hierarchy-operation" key={`${project.key}-${line.key}-${operation.key}`}>
                                <header className="hierarchy-operation-header">
                                  <span className="hierarchy-operation-chip"><Hash size={13} aria-hidden="true"/> OP</span>
                                  <h4>{operation.label}</h4>
                                  <span className="hierarchy-item-count">{operation.cards.length} {operation.cards.length === 1 ? 'transmissão' : 'transmissões'}</span>
                                </header>

                                <div className="cards-grid hierarchy-cards-grid">
                                  {operation.cards.map((card, index) => (
                                    <CardTransmissao
                                      key={`${card.id}-${index}`}
                                      card={card}
                                      onSelect={onSelectCard}
                                      index={index}
                                    />
                                  ))}
                                </div>
                              </section>
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              {hasMore && (
                <div className="load-more-bar">
                  <span className="load-more-count">Exibindo {visible.length} de {filtered.length} transmissões</span>
                  <button className="btn-load-more" onClick={() => setPage(current => current + 1)}>
                    <ChevronDown className="icon-sm" /> Carregar mais {Math.min(PAGE_SIZE, remaining)}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedCard && <ModalDetalhes card={selectedCard} onClose={onCloseModal} />}
    </>
  )
}
