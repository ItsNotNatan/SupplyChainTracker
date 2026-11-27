/**
 * Regras oficiais dos semáforos do cronograma, conforme orientação do cliente.
 *
 * Prioridade (da primeira condição atendida para a última):
 * 1. Vermelho: Realizado vazio E Previsto > Planejado.
 * 2. Verde claro: Realizado > Planejado.
 * 3. Verde escuro: Realizado <= Planejado.
 * 4. Amarelo: Previsto - 7 dias <= Hoje.
 * 5. Cinza: todas as demais condições.
 */

export const MATERIAL_MILESTONE_KEYS = [
  'liberacao',
  'insercaoTarefa',
  'requisicao',
  'pedido',
  'entregaComau',
  'criacaoPS',
  'entregaUsuario'
]

const DAY_MS = 24 * 60 * 60 * 1000
const PLACEHOLDERS = new Set(['-', '—', 'n/a', 'na', 'nao mapeado', 'não mapeado', 'nao informado', 'não informado'])

function isBlankDate(value) {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') {
    const text = value.trim()
    return !text || PLACEHOLDERS.has(text.toLowerCase())
  }
  return false
}

function parseDate(value) {
  if (isBlankDate(value)) return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  // O Excel pode entregar datas como números seriais.
  if (typeof value === 'number' || /^\d+(?:\.\d+)?$/.test(String(value).trim())) {
    const serial = Number(value)
    if (!Number.isFinite(serial) || serial <= 0 || serial > 100000) return null
    const parsed = new Date(Date.UTC(1899, 11, 30) + Math.round(serial * DAY_MS))
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const text = String(value).trim()

  // Datas brasileiras: DD/MM/AAAA, DD-MM-AAAA ou DD.MM.AAAA.
  const brDate = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:\s.*)?$/)
  if (brDate) {
    const [, dayText, monthText, yearText] = brDate
    const day = Number(dayText)
    const month = Number(monthText)
    const year = Number(yearText)
    const parsed = new Date(Date.UTC(year, month - 1, day))
    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.getUTCFullYear() !== year ||
      parsed.getUTCMonth() !== month - 1 ||
      parsed.getUTCDate() !== day
    ) return null
    return parsed
  }

  // Data ISO sem horário: evita interpretação local do navegador.
  const isoDate = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (isoDate) {
    const [, yearText, monthText, dayText] = isoDate
    const year = Number(yearText)
    const month = Number(monthText)
    const day = Number(dayText)
    const parsed = new Date(Date.UTC(year, month - 1, day))
    if (
      Number.isNaN(parsed.getTime()) ||
      parsed.getUTCFullYear() !== year ||
      parsed.getUTCMonth() !== month - 1 ||
      parsed.getUTCDate() !== day
    ) return null
    return parsed
  }

  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function dateNumber(value) {
  const date = parseDate(value)
  if (!date) return null
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

function todayNumber(value = new Date()) {
  const date = value instanceof Date ? value : parseDate(value)
  if (!date || Number.isNaN(date.getTime())) return Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  // Usa o dia local atual para a regra "Hoje", sem comparar horários.
  if (value instanceof Date) {
    return Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())
  }
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

export function getMilestoneScheduleStatus(triple = {}, today = new Date()) {
  const planned = dateNumber(triple.planejado)
  const forecast = dateNumber(triple.previsto)
  const actual = dateNumber(triple.realizado)
  const hasData = planned !== null || forecast !== null || actual !== null

  // Vermelho: ainda não realizado e previsão posterior ao planejado.
  if (actual === null && planned !== null && forecast !== null && forecast > planned) {
    return {
      code: 'delayed',
      label: 'Vermelho: sem realização e previsto posterior ao planejado',
      hasData: true
    }
  }

  // Verde claro: foi realizado, mas depois da data planejada.
  if (actual !== null && planned !== null && actual > planned) {
    return {
      code: 'late-complete',
      label: 'Verde claro: realizado depois do planejado',
      hasData: true
    }
  }

  // Verde escuro: foi realizado na data planejada ou antes dela.
  if (actual !== null && planned !== null && actual <= planned) {
    return {
      code: 'complete',
      label: 'Verde escuro: realizado na data planejada ou antes',
      hasData: true
    }
  }

  // Amarelo: a data prevista está dentro dos próximos sete dias
  // ou já passou. A condição é aplicada depois das três regras anteriores.
  const todayDay = todayNumber(today)
  if (forecast !== null && forecast - (7 * DAY_MS) <= todayDay) {
    return {
      code: 'attention',
      label: 'Amarelo: previsto menos sete dias é menor ou igual a hoje',
      hasData: true
    }
  }

  return {
    code: 'unknown',
    label: hasData ? 'Cinza: demais condições' : 'Cinza: sem datas disponíveis',
    hasData
  }
}

export function getMaterialScheduleStatus(material, milestoneKeys = MATERIAL_MILESTONE_KEYS, today = new Date()) {
  const dates = {
    ...(material?.datas || {}),
    ...(material?.datasComplementares || {})
  }
  const statuses = milestoneKeys.map(key => getMilestoneScheduleStatus(dates[key], today))
  const milestonesWithData = statuses.filter(status => status.hasData)

  if (milestonesWithData.some(status => status.code === 'delayed')) {
    return { code: 'delayed', label: 'Ponto de atenção: existe marco vermelho' }
  }

  if (milestonesWithData.some(status => status.code === 'attention')) {
    return { code: 'attention', label: 'Atenção: existe marco previsto para até sete dias' }
  }

  // A cor geral só fica verde quando todos os marcos que possuem dados
  // foram realizados. Marcos sem qualquer informação continuam fora da conta,
  // preservando a regra anterior enquanto as fontes externas são integradas.
  const allKnownMilestonesCompleted = milestonesWithData.length > 0 && milestonesWithData.every(
    status => status.code === 'complete' || status.code === 'late-complete'
  )

  if (allKnownMilestonesCompleted) {
    const hasLateCompletion = milestonesWithData.some(status => status.code === 'late-complete')
    return hasLateCompletion
      ? { code: 'late-complete', label: 'Materiais informados concluídos, com marco realizado após o planejado' }
      : { code: 'complete', label: 'Materiais informados concluídos no prazo' }
  }

  return { code: 'unknown', label: 'Status ainda não determinado pelas datas disponíveis' }
}

export function getMaterialCollectionStatus(items, milestoneKeys = MATERIAL_MILESTONE_KEYS, today = new Date()) {
  if (!Array.isArray(items) || items.length === 0) return 'Vazio'

  const statuses = items.map(item => getMaterialScheduleStatus(item, milestoneKeys, today))
  if (statuses.some(status => status.code === 'delayed')) return 'On delayed'
  if (statuses.some(status => status.code === 'attention')) return 'Ongoing'

  if (statuses.every(status => status.code === 'complete' || status.code === 'late-complete')) {
    return statuses.some(status => status.code === 'late-complete') ? 'Complete late' : 'Complete'
  }

  return 'Vazio'
}


/**
 * Consolida os marcos de uma transmissão em um único status para os indicadores
 * do painel Projeto > Linha > Operação.
 *
 * Prioridade para a transmissão:
 * 1. delayed      -> ao menos um marco vermelho;
 * 2. attention    -> sem vermelho e ao menos um marco amarelo;
 * 3. late-complete-> todos os marcos com datas conhecidos concluídos, com atraso;
 * 4. complete     -> todos os marcos com datas conhecidos concluídos no prazo;
 * 5. unknown      -> demais situações (exibidas em cinza e contabilizadas apenas em Total).
 *
 * Marcos sem qualquer data não entram na consolidação até que sua fonte seja integrada.
 */
export function getTransmissionScheduleStatus(transmission, today = new Date()) {
  const milestoneStatuses = []
  const addTriple = triple => {
    if (!triple || typeof triple !== 'object') return
    const status = getMilestoneScheduleStatus(triple, today)
    if (status.hasData) milestoneStatuses.push(status)
  }

  const materials = [
    ...(transmission?.materiais?.comerciais || []),
    ...(transmission?.materiais?.construtivos || [])
  ]

  materials.forEach(material => {
    Object.values(material?.datas || {}).forEach(addTriple)
    Object.values(material?.datasComplementares || {}).forEach(addTriple)
  })

  ;['mecanica', 'controls'].forEach(group => {
    Object.values(transmission?.engenharia?.[group] || {}).forEach(deliverable => {
      addTriple(deliverable?.datas)
    })
  })

  addTriple(
    transmission?.manufatura?.entregaDispositivo ||
    transmission?.pcp?.entregaDispositivo
  )

  if (milestoneStatuses.length === 0) {
    return { code: 'unknown', label: 'Sem datas suficientes para classificar a transmissão', hasData: false }
  }

  if (milestoneStatuses.some(status => status.code === 'delayed')) {
    return { code: 'delayed', label: 'Transmissão em atraso', hasData: true }
  }

  if (milestoneStatuses.some(status => status.code === 'attention')) {
    return { code: 'attention', label: 'Possui marco previsto para os próximos sete dias', hasData: true }
  }

  const allKnownMilestonesCompleted = milestoneStatuses.every(status => (
    status.code === 'complete' || status.code === 'late-complete'
  ))

  if (allKnownMilestonesCompleted) {
    const hasLateCompletion = milestoneStatuses.some(status => status.code === 'late-complete')
    return hasLateCompletion
      ? { code: 'late-complete', label: 'Transmissão concluída com atraso', hasData: true }
      : { code: 'complete', label: 'Transmissão concluída no prazo', hasData: true }
  }

  return { code: 'unknown', label: 'Demais condições (cinza)', hasData: true }
}
