/**
 * Regras de status do cronograma dos materiais.
 *
 * Regras já alinhadas na reunião:
 * - Verde: realizado antes ou na data planejada.
 * - Vermelho: previsto depois da data planejada.
 * - Amarelo: ainda não implementado, pois o significado não foi definido.
 *
 * Quando não há dados suficientes para comparar, a interface usa cinza neutro.
 * Isso evita atribuir um significado incorreto à cor amarela ou marcar um item
 * como concluído sem evidência nas datas.
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

function parseDate(value) {
  if (value === undefined || value === null || value === '') return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  const text = String(value).trim()
  if (!text) return null

  // Aceita datas brasileiras sem depender do formato regional do navegador.
  const brDate = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/)
  if (brDate) {
    const [, day, month, year] = brDate
    const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function dateNumber(value) {
  const date = parseDate(value)
  if (!date) return null
  // Compara apenas o dia, sem diferenças causadas por horário/timezone.
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

export function getMilestoneScheduleStatus(triple = {}) {
  const planned = dateNumber(triple.planejado)
  const forecast = dateNumber(triple.previsto)
  const actual = dateNumber(triple.realizado)
  const hasData = planned !== null || forecast !== null || actual !== null

  if (planned === null) {
    return {
      code: 'unknown',
      label: hasData ? 'Sem data planejada para comparação' : 'Sem datas disponíveis',
      hasData
    }
  }

  // O realizado é a informação final e prevalece sobre uma previsão anterior.
  if (actual !== null) {
    return actual <= planned
      ? { code: 'complete', label: 'Concluído até a data planejada', hasData: true }
      : { code: 'delayed', label: 'Realizado após a data planejada', hasData: true }
  }

  if (forecast !== null && forecast > planned) {
    return { code: 'delayed', label: 'Previsão posterior à data planejada', hasData: true }
  }

  if (forecast !== null) {
    return { code: 'unknown', label: 'Previsão dentro do planejado; aguardando realização', hasData: true }
  }

  return { code: 'unknown', label: 'Aguardando previsão ou realização', hasData: true }
}

export function getMaterialScheduleStatus(material, milestoneKeys = MATERIAL_MILESTONE_KEYS) {
  const dates = {
    ...(material?.datas || {}),
    ...(material?.datasComplementares || {})
  }
  const statuses = milestoneKeys.map(key => getMilestoneScheduleStatus(dates[key]))
  const milestonesWithData = statuses.filter(status => status.hasData)

  if (milestonesWithData.some(status => status.code === 'delayed')) {
    return { code: 'delayed', label: 'Ponto de atenção: existe marco atrasado' }
  }

  // Só sinaliza verde quando todos os marcos que possuem dados estão concluídos
  // dentro do prazo. Marcos totalmente sem dados não são tratados como concluídos.
  if (milestonesWithData.length > 0 && milestonesWithData.every(status => status.code === 'complete')) {
    return { code: 'complete', label: 'Marcos informados concluídos no prazo' }
  }

  return { code: 'unknown', label: 'Status ainda não determinado pelas datas disponíveis' }
}

export function getMaterialCollectionStatus(items, milestoneKeys = MATERIAL_MILESTONE_KEYS) {
  if (!Array.isArray(items) || items.length === 0) return 'Vazio'

  const statuses = items.map(item => getMaterialScheduleStatus(item, milestoneKeys))
  if (statuses.some(status => status.code === 'delayed')) return 'On delayed'
  if (statuses.every(status => status.code === 'complete')) return 'Complete'

  // Não usamos Ongoing porque o indicador amarelo ainda aguarda definição.
  return 'Vazio'
}
