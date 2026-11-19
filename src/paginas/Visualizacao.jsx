import { useMemo, useState, useEffect } from 'react'
import { Filter, SearchX, ChevronDown, Search } from 'lucide-react'
import CardTransmissao from '../componentes/CardTransmissao.jsx'
import ModalDetalhes from '../componentes/ModalDetalhes.jsx'

const PAGE_SIZE = 48

function getTransmissionStatus(card) {
  const statuses = Object.values(card.stages ?? {}).filter(status => status && status !== 'Vazio')
  if (statuses.length === 0) return 'Vazio'
  if (statuses.includes('On delayed')) return 'On delayed'
  return statuses.every(status => status === 'Complete') ? 'Complete' : 'Ongoing'
}

function normalizeSearch(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function getSearchText(card) {
  const materialValues = [
    ...(card.materiais?.comerciais ?? []),
    ...(card.materiais?.construtivos ?? [])
  ].flatMap(item => [item.descricao, item.referencia, item.fabricante, item.fornecedor, item.rc, item.po, item.tag])

  return normalizeSearch([
    card.id,
    card.projeto,
    card.projetoWBS,
    card.cliente,
    card.linha,
    card.operacao,
    card.descricao,
    card.construtivo?.fornecedor,
    card.manufatura?.estrategia,
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
  onCloseModal,
  onOpenDatabase
}) {
  const [page, setPage] = useState(1)
  
  // NOVO ESTADO: Guarda em que aba o modal deve iniciar
  const [initialTab, setInitialTab] = useState('All')

  // NOVA FUNÇÃO: Intercepta o clique do cartão para guardar a aba antes de abrir
  const handleCardClick = (card, tab = 'All') => {
    setInitialTab(tab)
    onSelectCard(card)
  }

  const filtered = useMemo(() => {
    const keyword = normalizeSearch(filters.palavraChave)
    return processedData.filter(card => {
      const keywordMatch = !keyword || getSearchText(card).includes(keyword)
      const projectMatch = !filters.projeto || card.projeto === filters.projeto
      const lineMatch = !filters.linha || card.linha === filters.linha
      const operationMatch = !filters.operacao || card.operacao === filters.operacao
      return keywordMatch && projectMatch && lineMatch && operationMatch
    })
  }, [processedData, filters])

  useEffect(() => { setPage(1) }, [filtered])

  const visible = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page])
  const summary = useMemo(() => {
    const counts = { total: filtered.length, ongoing: 0, delayed: 0, complete: 0 }
    filtered.forEach(card => {
      const status = getTransmissionStatus(card)
      if (status === 'Ongoing') counts.ongoing += 1
      if (status === 'On delayed') counts.delayed += 1
      if (status === 'Complete') counts.complete += 1
    })
    return counts
  }, [filtered])
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
          <select
            className="filter-select"
            value={filters.projeto}
            onChange={event => onFilterChange('projeto', event.target.value)}
            aria-label="Filtrar por projeto"
          >
            <option value="">Todos os projetos</option>
            {Array.from(uniqueProjetos).sort().map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={filters.linha}
            onChange={event => onFilterChange('linha', event.target.value)}
            aria-label="Filtrar por linha"
          >
            <option value="">Todas as linhas</option>
            {Array.from(uniqueLinhas).sort().map(line => (
              <option key={line} value={line}>{line}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={filters.operacao}
            onChange={event => onFilterChange('operacao', event.target.value)}
            aria-label="Filtrar por operação"
          >
            <option value="">Todas as operações</option>
            {Array.from(uniqueOperacoes).sort().map(operation => (
              <option key={operation} value={operation}>{operation}</option>
            ))}
          </select>
        </div>

        <div className="stats-grid" aria-label="Resumo das transmissões filtradas">
          <div className="stat-card blue"><div className="stat-title">Total de transmissões</div><div className="stat-value">{summary.total}</div></div>
          <div className="stat-card yellow"><div className="stat-title">Em andamento</div><div className="stat-value">{summary.ongoing}</div></div>
          <div className="stat-card red"><div className="stat-title">Atrasadas ou em risco</div><div className="stat-value">{summary.delayed}</div></div>
          <div className="stat-card green"><div className="stat-title">Concluídas</div><div className="stat-value">{summary.complete}</div></div>
        </div>

        <div className="cards-result-count">
          {filtered.length} {filtered.length === 1 ? 'transmissão encontrada' : 'transmissões encontradas'}
        </div>

        <div className="cards-wrapper">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <SearchX className="icon-xl" />
              {processedData.length === 0 ? (
                <>
                  <p style={{ fontWeight: 600 }}>Nenhum dado carregado.</p>
                  <p style={{ fontSize: '.8rem' }}>Acesse o Banco de dados para importar as planilhas do projeto.</p>
                  <button type="button" className="btn btn-primary" onClick={onOpenDatabase}>Abrir banco de dados</button>
                </>
              ) : (
                <>
                  <p style={{ fontWeight: 600 }}>Nenhuma transmissão encontrada.</p>
                  <p style={{ fontSize: '.8rem' }}>Altere ou limpe um dos filtros para ver outros resultados.</p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="cards-grid">
                {visible.map((card, index) => (
                  <CardTransmissao
                    key={card.id}
                    card={card}
                    onSelect={handleCardClick} // ATUALIZADO: Chama a nossa nova função
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

      {/* ATUALIZADO: Passa a initialTab para o Modal */}
      {selectedCard && <ModalDetalhes card={selectedCard} initialTab={initialTab} onClose={onCloseModal} />}
    </>
  )
}