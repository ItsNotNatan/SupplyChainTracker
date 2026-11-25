import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'

function normalizeOption(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
}

/**
 * Filtro com seleção múltipla e pesquisa das opções enquanto o usuário digita.
 * `value` e `onChange` recebem sempre um array de strings.
 */
export default function FiltroMultiplo({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = 'Todas',
  emptyMessage = 'Nenhuma opção encontrada'
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)
  const searchInputId = useId()

  const selectedValues = Array.isArray(value)
    ? value.map(item => String(item))
    : value
      ? [String(value)]
      : []

  const normalizedOptions = useMemo(() => {
    const unique = new Map()

    for (const option of options) {
      const text = String(option ?? '').trim()
      if (!text) continue
      const key = normalizeOption(text)
      if (!key || !unique.has(key)) unique.set(key, text)
    }

    return Array.from(unique.values()).sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }))
  }, [options])

  const filteredOptions = useMemo(() => {
    const term = normalizeOption(search)
    if (!term) return normalizedOptions
    return normalizedOptions.filter(option => normalizeOption(option).includes(term))
  }, [normalizedOptions, search])

  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = event => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
        setSearch('')
      }
    }

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setOpen(false)
        setSearch('')
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function toggleOption(option) {
    const exists = selectedValues.includes(option)
    const nextValues = exists
      ? selectedValues.filter(item => item !== option)
      : [...selectedValues, option]

    onChange?.(nextValues)
  }

  function clearSelection() {
    onChange?.([])
  }

  const triggerDescription = selectedValues.length === 0
    ? placeholder
    : `${selectedValues.length} selecionado${selectedValues.length === 1 ? '' : 's'}`

  return (
    <div className={`multi-filter ${open ? 'is-open' : ''}`} ref={containerRef}>
      <button
        type="button"
        className="multi-filter-trigger"
        aria-expanded={open}
        onClick={() => {
          setOpen(current => !current)
          setSearch('')
        }}
      >
        <span className="multi-filter-trigger-copy">
          <strong>{label}</strong>
          <span>{triggerDescription}</span>
        </span>
        <ChevronDown className={`multi-filter-chevron ${open ? 'rotated' : ''}`} size={16} aria-hidden="true" />
      </button>

      {open && (
        <div className="multi-filter-menu">
          <label className="multi-filter-search" htmlFor={searchInputId}>
            <Search size={15} aria-hidden="true" />
            <input
              id={searchInputId}
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder={`Pesquisar ${label.toLowerCase()}...`}
              autoComplete="off"
              autoFocus
            />
            {search && (
              <button
                type="button"
                className="multi-filter-search-clear"
                onClick={() => setSearch('')}
                aria-label="Limpar pesquisa das opções"
              >
                <X size={14} />
              </button>
            )}
          </label>

          <div className="multi-filter-menu-actions">
            <span>{selectedValues.length} selecionado(s)</span>
            {selectedValues.length > 0 && (
              <button type="button" onClick={clearSelection}>Limpar seleção</button>
            )}
          </div>

          <div className="multi-filter-options" role="group" aria-label={`Opções de ${label}`}>
            {filteredOptions.length > 0 ? filteredOptions.map(option => {
              const checked = selectedValues.includes(option)
              return (
                <label key={option} className={`multi-filter-option ${checked ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOption(option)}
                  />
                  <span className="multi-filter-checkbox" aria-hidden="true">
                    {checked && <Check size={12} strokeWidth={3} />}
                  </span>
                  <span className="multi-filter-option-label" title={option}>{option}</span>
                </label>
              )
            }) : (
              <p className="multi-filter-empty">{emptyMessage}</p>
            )}
          </div>

          <div className="multi-filter-menu-footer">
            <button type="button" onClick={() => { setOpen(false); setSearch('') }}>Concluir</button>
          </div>
        </div>
      )}
    </div>
  )
}
