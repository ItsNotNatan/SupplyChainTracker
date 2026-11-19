import * as XLSX from 'xlsx'

export function extractSheetId(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

function csvTo2D(csvText) {
  try {
    const workbook = XLSX.read(csvText, { type: 'string' })
    return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: '' })
  } catch {
    return []
  }
}

async function fetchTab(sheetId, tabName) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const text = await response.text()
    if (text.startsWith('google.') || text.includes('"status":"error"')) return null
    const data = csvTo2D(text)
    return data.length > 1 ? data : null
  } catch {
    return null
  }
}

const TAB_VARIANTS = {
  followUp: ['Follow Up', 'Follow-Up', 'FOLLOW UP', 'follow up', 'FollowUp', 'Follow_Up'],
  saturacao: ['Saturação', 'Saturacao', 'SATURAÇÃO', 'saturacao', 'Saturacão'],
  bordomaquina: ['BordoMaquina', 'Bordo Maquina', 'Bordo', 'bordo', 'BORDOMAQUINA', 'Bordo de Máquina'],
  pcpManufacturing: ['PCP Manufacturing', 'PCP_MANUFACTURING', 'PCP - Manufacturing', 'PCP', 'Manufacturing', 'Manufatura'],
  sourcingPlan: ['Sourcing Plan', 'SOURCING PLAN', 'sourcing plan', 'SourcingPlan', 'Sourcing_Plan', 'Sourcing-Plan'],
  comerciais: ['Comerciais', 'COMERCIAIS', 'comerciais', 'PoProgr', 'PoProg', 'POPROG'],
  prpo: ['PRPO', 'prpo', 'PR/PO', 'PR-PO']
}

async function fetchSheetsFromId(sheetId, onProgress) {
  const result = { followUp: [], saturacao: [], bordomaquina: [], pcpManufacturing: [], sourcingPlans: [], comerciais: [], prpo: [] }
  const found = {}

  for (const [type, variants] of Object.entries(TAB_VARIANTS)) {
    onProgress?.(`Procurando aba "${type}"...`)
    for (const name of variants) {
      const data = await fetchTab(sheetId, name)
      if (!data) continue

      if (type === 'comerciais') result.comerciais.push(data)
      else if (type === 'sourcingPlan') result.sourcingPlans.push(data)
      else result[type] = data
      found[type] = name
      break
    }
  }

  return { sheets: result, found }
}

export async function fetchAllSheets(urls, onProgress) {
  const accumulated = { followUp: [], saturacao: [], bordomaquina: [], pcpManufacturing: [], sourcingPlans: [], comerciais: [], prpo: [] }
  const summary = []

  for (const url of urls) {
    const sheetId = extractSheetId(url)
    if (!sheetId) {
      summary.push({ url, erro: 'URL inválida' })
      continue
    }

    onProgress?.('Conectando à planilha...')
    const { sheets, found } = await fetchSheetsFromId(sheetId, onProgress)

    if (sheets.followUp.length) accumulated.followUp = accumulated.followUp.length ? [...accumulated.followUp, ...sheets.followUp] : sheets.followUp
    if (sheets.saturacao.length) accumulated.saturacao = accumulated.saturacao.length ? [...accumulated.saturacao, ...sheets.saturacao] : sheets.saturacao
    if (sheets.bordomaquina.length) accumulated.bordomaquina = accumulated.bordomaquina.length ? [...accumulated.bordomaquina, ...sheets.bordomaquina] : sheets.bordomaquina
    if (sheets.pcpManufacturing.length) accumulated.pcpManufacturing = accumulated.pcpManufacturing.length ? [...accumulated.pcpManufacturing, ...sheets.pcpManufacturing] : sheets.pcpManufacturing
    if (sheets.sourcingPlans.length) accumulated.sourcingPlans.push(...sheets.sourcingPlans)
    if (sheets.comerciais.length) accumulated.comerciais.push(...sheets.comerciais)
    if (sheets.prpo.length) accumulated.prpo = accumulated.prpo.length ? [...accumulated.prpo, ...sheets.prpo] : sheets.prpo

    summary.push({ url, found })
  }

  return { sheets: accumulated, summary }
}
