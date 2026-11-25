import { useMemo, useState, useEffect } from 'react'
import { Filter, SearchX, ChevronDown, Search } from 'lucide-react'
import CardTransmissao from '../componentes/CardTransmissao.jsx'
import FiltroMultiplo from '../componentes/FiltroMultiplo.jsx'
import ModalDetalhes from '../componentes/ModalDetalhes.jsx'

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

  const filtered = useMemo(() => {
    const keyword = normalizeSearch(filters.palavraChave)
    return processedData.filter(card => {
      const keywordMatch = !keyword || getSearchText(card).includes(keyword)
      const selectedProjects = (Array.isArray(filters.projeto) ? filters.projeto : (filters.projeto ? [filters.projeto] : [])).map(normalizeSearch)
      const selectedLines = (Array.isArray(filters.linha) ? filters.linha : (filters.linha ? [filters.linha] : [])).map(normalizeSearch)
      const selectedOperations = (Array.isArray(filters.operacao) ? filters.operacao : (filters.operacao ? [filters.operacao] : [])).map(normalizeSearch)
      const projectMatch = selectedProjects.length === 0 || selectedProjects.includes(normalizeSearch(card.projeto))
      const lineMatch = selectedLines.length === 0 || selectedLines.includes(normalizeSearch(card.linha))
      const operationMatch = selectedOperations.length === 0 || selectedOperations.includes(normalizeSearch(card.operacao))
      return keywordMatch && projectMatch && lineMatch && operationMatch
    })
  }, [processedData, filters])

  useEffect(() => { setPage(1) }, [filtered])

  const visible = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page])
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

        <div className="cards-result-count">
          {filtered.length} {filtered.length === 1 ? 'transmissão encontrada' : 'transmissões encontradas'}
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
              <div className="cards-grid">
                {visible.map((card, index) => (
                  <CardTransmissao
                    key={card.id}
                    card={card}
                    onSelect={onSelectCard}
                    index={index}
                  />
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
