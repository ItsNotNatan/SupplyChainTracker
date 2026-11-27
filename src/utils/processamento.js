import { excelToJSDate, cleanTr } from './formatadores.js'
import { getMaterialCollectionStatus } from './statusCronograma.js'

const EMPTY_TRIPLE = () => ({ planejado: null, previsto: null, realizado: null })
const EMPTY_EXTERNAL_DATES = () => ({ entregaComau: EMPTY_TRIPLE(), criacaoPS: EMPTY_TRIPLE(), entregaUsuario: EMPTY_TRIPLE() })

const PERIOD_ALIASES = {
  planejado: ['plan', 'planejado', 'planeado', 'planned'],
  previsto: ['prev', 'previsto', 'forecast', 'previsao'],
  realizado: ['real', 'realizado', 'actual']
}

const MILESTONES = [
  { key: 'liberacao', label: 'Liberação de eng.', aliases: ['liberacao de eng', 'liberacao engenharia', 'liberacao', 'engineering release', 'release'] },
  { key: 'insercaoTarefa', label: 'Aprovação do PM', aliases: ['aprovacao do pm', 'aprovacao pm', 'insercao de tarefa', 'insercao da tarefa', 'insercao tarefa', 'task insertion', 'pm approval'] },
  { key: 'requisicao', label: 'Requisição', aliases: ['requisicao', 'requisition'] },
  { key: 'pedido', label: 'Pedido', aliases: ['pedido', 'purchase order', 'ordem de compra'] }
]

const EXTRA_DATES = [
  { key: 'entregaComau', label: 'Entrega na COMAU', aliases: ['data de entrega na comau', 'entrega na comau', 'entrega comau'] },
  { key: 'criacaoPS', label: 'Criação do P&S', aliases: ['data da criacao do p s', 'data de criacao do p s', 'criacao do p s', 'criacao p s', 'p s creation', 'ps creation', 'creation p s', 'creation of p s'] },
  { key: 'entregaUsuario', label: 'Entrega ao usuário', aliases: ['data de entrega ao usuario', 'entrega ao usuario', 'user delivery', 'delivery to user'] }
]

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function hasValue(value) {
  return value !== undefined && value !== null && String(value).trim() !== ''
}

function isPlaceholder(value) {
  const normalized = normalizeText(value)
  return !normalized || ['-', 'n a', 'na', 'n a o mapeado', 'nao mapeado', 'not mapped', 'nao informado', 'sem informacao', 's descricao'].includes(normalized)
}

function createHeaderInfo(rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { headers: [], headerRow: 0, dataStart: 0 }
  }

  const headerTerms = [
    'transmissao', 'descricao', 'description', 'referencia', 'reference', 'quantidade', 'qtd',
    'fabricante', 'fornecedor', 'status', 'liberacao', 'requisicao', 'pedido', 'projeto',
    'linha', 'operacao', 'plan', 'prev', 'real'
  ]

  let bestRow = 0
  let bestScore = 0
  const scanLimit = Math.min(rows.length, 8)

  for (let rowIndex = 0; rowIndex < scanLimit; rowIndex += 1) {
    const row = Array.isArray(rows[rowIndex]) ? rows[rowIndex] : []
    const values = row.map(normalizeText).filter(Boolean)
    const score = headerTerms.reduce((total, term) => (
      total + (values.some(value => value.includes(term)) ? 1 : 0)
    ), 0)
    if (score > bestScore || (score > 0 && score === bestScore)) {
      bestScore = score
      bestRow = rowIndex
    }
  }

  const groupedDateHeaderRow = rows.slice(0, scanLimit).findIndex(row => {
    const values = (Array.isArray(row) ? row : []).map(normalizeText).filter(Boolean)
    return ['plan', 'prev', 'real'].every(period => values.some(value => value === period || value.includes(period)))
  })
  if (groupedDateHeaderRow >= 0) bestRow = Math.max(bestRow, groupedDateHeaderRow)

  const columnCount = Math.max(...rows.slice(0, bestRow + 1).map(row => Array.isArray(row) ? row.length : 0), 0)
  const headerParts = Array.from({ length: columnCount }, () => [])
  for (let rowIndex = 0; rowIndex <= bestRow; rowIndex += 1) {
    let mergedHeading = ''
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      const value = rows[rowIndex]?.[columnIndex]
      if (hasValue(value)) {
        mergedHeading = normalizeText(value)
        headerParts[columnIndex].push(mergedHeading)
      } else if (rowIndex < bestRow && mergedHeading) {
        // Cabeçalhos agrupados/mesclados: replica o título do grupo nas colunas seguintes.
        headerParts[columnIndex].push(mergedHeading)
      }
    }
  }
  const headers = headerParts.map(parts => parts.join(' '))

  return { headers, headerRow: bestRow, dataStart: bestRow + 1 }
}

function findColumn(headers, aliases = [], excluded = []) {
  const normalizedAliases = aliases.map(normalizeText).filter(Boolean)
  const normalizedExcluded = excluded.map(normalizeText).filter(Boolean)

  const matchesAlias = (header, alias) => {
    // Abreviações curtas (RC, PO, PN, QTD) precisam ser palavras inteiras.
    // Assim, "PO" não encontra por engano a coluna "Tipo".
    if (alias.length <= 3) return header.split(' ').includes(alias)
    return header.includes(alias)
  }

  for (const alias of normalizedAliases) {
    const index = headers.findIndex(header => (
      matchesAlias(header, alias) &&
      !normalizedExcluded.some(ex => header.includes(ex))
    ))
    if (index >= 0) return index
  }
  return -1
}

function readField(row, headerInfo, aliases, fallbackIndex = -1) {
  const index = findColumn(headerInfo?.headers ?? [], aliases)
  if (index >= 0 && hasValue(row?.[index])) return row[index]
  if (fallbackIndex >= 0 && hasValue(row?.[fallbackIndex])) return row[fallbackIndex]
  return null
}

function readDate(value) {
  if (!hasValue(value)) return null
  const date = excelToJSDate(value)
  return date && !Number.isNaN(date.getTime()) ? date : null
}

function findMilestoneColumn(headers, milestoneAliases, periodAliases) {
  return headers.findIndex(header => (
    milestoneAliases.some(alias => header.includes(normalizeText(alias))) &&
    periodAliases.some(alias => header.includes(normalizeText(alias)))
  ))
}

function readDateTriple(row, headerInfo, milestoneAliases) {
  const result = EMPTY_TRIPLE()
  for (const [period, aliases] of Object.entries(PERIOD_ALIASES)) {
    const index = findMilestoneColumn(headerInfo?.headers ?? [], milestoneAliases, aliases)
    if (index >= 0) result[period] = readDate(row?.[index])
  }
  return result
}

function firstAvailable(...values) {
  return values.find(value => hasValue(value)) ?? null
}

function createMaterial(row, headerInfo, typeRaw, card) {
  const typeText = normalizeText(typeRaw)
  const tagRaw = readField(row, headerInfo, ['tag', 'etiqueta', 'marcador', 'status de antecipacao', 'antecipacao'], -1)
  const tagText = normalizeText(tagRaw)
  const classificationText = `${typeText} ${tagText}`.trim()
  const isAnticipated = classificationText.includes('antecip')
  const anticipatedTag = isAnticipated
    ? (classificationText.includes('ja antecipado') ? 'Já antecipado' : 'Antecipação')
    : null

  // A antecipação sempre prevalece: mesmo que a coluna de classe esteja como
  // Construtivo, os itens Antecipação/Já antecipado pertencem a Comerciais.
  const isConstructive = !isAnticipated && (typeText.includes('construt') || typeText.includes('construct') || typeText.includes('custom'))
  const isCommercial = isAnticipated || typeText.includes('comercial') || typeText.includes('commercial')

  if (!isConstructive && !isCommercial) return null

  const dates = {}
  MILESTONES.forEach(milestone => {
    dates[milestone.key] = readDateTriple(row, headerInfo, milestone.aliases)
  })

  const complementaryDates = {}
  EXTRA_DATES.forEach(extra => {
    complementaryDates[extra.key] = readDateTriple(row, headerInfo, extra.aliases)
  })

  const quantity = readField(row, headerInfo, ['quantidade', 'qtd', 'quantity', 'qty'])
  const description = readField(row, headerInfo, ['descricao', 'description', 'material', 'item'])
  const reference = readField(row, headerInfo, ['referencia', 'reference', 'part number', 'part no', 'pn', 'ref', 'codigo', 'material code'])
  const manufacturer = readField(row, headerInfo, ['fabricante', 'manufacturer', 'marca', 'brand'])
  const supplier = readField(row, headerInfo, ['fornecedor', 'supplier', 'vendor'])
  const releaseStatus = readField(row, headerInfo, ['status da liberacao', 'status liberacao', 'release status', 'liberacao status'])
  const rc = readField(row, headerInfo, ['numero da rc', 'n da rc', 'no da rc', 'rc', 'requisicao de compra'])
  const po = readField(row, headerInfo, ['numero da po', 'n da po', 'no da po', 'po', 'pedido de compra'])

  return {
    id: `${card.id}-${isConstructive ? 'construtivo' : 'comercial'}-${card.materiais.comerciais.length + card.materiais.construtivos.length + 1}`,
    tipo: isConstructive ? 'Construtivo' : 'Comercial',
    tag: anticipatedTag,
    qtd: quantity ?? '',
    descricao: String(description ?? '').trim(),
    referencia: String(reference ?? '').trim(),
    fabricante: String(manufacturer ?? '').trim(),
    fornecedor: String(supplier ?? (isConstructive ? card.construtivo?.fornecedor : '') ?? '').trim(),
    statusLiberacao: String(releaseStatus ?? '').trim(),
    rc: String(rc ?? '').trim(),
    po: String(po ?? '').trim(),
    datas: dates,
    datasComplementares: complementaryDates
  }
}

function addMaterialIfUnique(target, material) {
  const key = `${normalizeText(material.referencia)}|${normalizeText(material.descricao)}`
  // Sem referência e sem descrição não há uma chave segura para deduplicação.
  if (key === '|') {
    target.push(material)
    return
  }
  const exists = target.some(item => `${normalizeText(item.referencia)}|${normalizeText(item.descricao)}` === key)
  if (!exists) target.push(material)
}

function statusFromValues(values) {
  const active = values.filter(value => !isPlaceholder(value))
  if (active.length === 0) return 'Vazio'
  if (active.some(value => /atras|bloquead|overdue/i.test(String(value)))) return 'On delayed'
  return active.every(value => /liberad|conclu|complete|100%|\bok\b/i.test(String(value)))
    ? 'Complete'
    : 'Ongoing'
}

function aggregateStatuses(statuses) {
  const active = statuses.filter(status => status !== 'Vazio')
  if (active.length === 0) return 'Vazio'
  if (active.includes('On delayed')) return 'On delayed'
  return active.every(status => status === 'Complete') ? 'Complete' : 'Ongoing'
}

export function processarDados(sheets = {}) {
  const trMap = new Map()
  const supRiscoMap = new Map()

  const safeSheets = {
    followUp: Array.isArray(sheets.followUp) ? sheets.followUp : [],
    saturacao: Array.isArray(sheets.saturacao) ? sheets.saturacao : [],
    bordomaquina: Array.isArray(sheets.bordomaquina) ? sheets.bordomaquina : [],
    comerciais: Array.isArray(sheets.comerciais) ? sheets.comerciais : [],
    prpo: Array.isArray(sheets.prpo) ? sheets.prpo : [],
    sourcingPlans: Array.isArray(sheets.sourcingPlans) ? sheets.sourcingPlans : (Array.isArray(sheets.sourcingPlan) && sheets.sourcingPlan.length ? [sheets.sourcingPlan] : [])
  }

  function getOrCreateCard(trId) {
    const id = cleanTr(trId)
    if (!trMap.has(id)) {
      trMap.set(id, {
        id,
        cliente: 'N/A',
        projeto: 'N/A',
        projetoWBS: 'N/A',
        linha: 'N/A',
        linhaOp: 'N/A',
        operacao: 'N/A',
        descricao: 'S/ Descrição',
        qtd: 1,
        construtivo: null,
        manufatura: { estrategia: '', montagemMecanica: '', medicao3D: '', bordoMaquina: '', inspecaoQualidade: '', entregaDispositivo: EMPTY_TRIPLE() },
        riscoFornecedor: { saturacaoPerc: 0, nota: 'N/A' },
        pcp: null,
        materiais: { comerciais: [], construtivos: [] },
        logisticaAdvanced: {}
      })
    }
    return trMap.get(id)
  }

  // 1. Risco/saturação de fornecedores
  const saturationInfo = createHeaderInfo(safeSheets.saturacao)
  safeSheets.saturacao.slice(saturationInfo.dataStart).forEach(row => {
    if (!Array.isArray(row) || !row.length) return
    const supplier = readField(row, saturationInfo, ['fornecedor', 'supplier'], 0)
    if (!hasValue(supplier)) return
    const saturation = readField(row, saturationInfo, ['saturacao', 'saturacao percentual', 'saturation'], 2)
    const rating = readField(row, saturationInfo, ['nota avaliacao', 'avaliacao', 'rating', 'nota'], 4)
    supRiscoMap.set(String(supplier).trim().toUpperCase(), {
      saturacaoPerc: Number.parseFloat(saturation) || 0,
      nota: rating || 'N/A'
    })
  })

  // 2. Bordo de Máquina / dados de manufatura
  const boardInfo = createHeaderInfo(safeSheets.bordomaquina)
  safeSheets.bordomaquina.slice(boardInfo.dataStart).forEach(row => {
    if (!Array.isArray(row) || row.length < 2) return
    const transmission = cleanTr(readField(row, boardInfo, ['transmissao', 'id da transmissao', 'transmission'], 1))
    if (!transmission || normalizeText(transmission).includes('transmissao')) return

    const card = getOrCreateCard(transmission)
    const operation = readField(row, boardInfo, ['operacao', 'operation'], 2)
    if (hasValue(operation)) card.operacao = String(operation).trim()

    const deliveryDate = readDate(readField(row, boardInfo, ['data de entrega do dispositivo', 'entrega do dispositivo', 'data entrega', 'data'], 3))
    const deliveryTriple = readDateTriple(row, boardInfo, ['entrega do dispositivo', 'entrega dispositivo', 'data entrega dispositivo', 'device delivery', 'delivery of device'])
    if (!deliveryTriple.realizado) deliveryTriple.realizado = deliveryDate

    const projectElectrical = readField(row, boardInfo, ['projeto eletrico', 'proj ele'], 6)
    const projectTopographic = readField(row, boardInfo, ['topografico', 'projeto topografico', 'proj top'], 8)
    const materialElectrical = readField(row, boardInfo, ['material eletrico', 'mat ele'], 9)
    const materialPneumatic = readField(row, boardInfo, ['material pneumatica', 'material pneumatico', 'mat pneu'], 10)
    const tests = readField(row, boardInfo, ['inspecao da qualidade', 'inspecao qualidade', 'status testes', 'testes'], 15)

    const listMaterialsMechanical = readField(row, boardInfo, ['lista de materiais mecanicos', 'lista materiais mecanicos', 'bom mecanica'])
    const listMaterialsControls = readField(row, boardInfo, ['lista de materiais de control', 'lista de materiais de controls', 'lista materiais controls', 'lista de materiais controls'])

    card.pcp = {
      dataEntrega: deliveryDate,
      projEle: projectElectrical || '-',
      projTop: projectTopographic || '-',
      matEle: materialElectrical || '0',
      matPneu: materialPneumatic || '0',
      misc: readField(row, boardInfo, ['miscelaneas', 'misc'], 11) || '-',
      placaAlum: readField(row, boardInfo, ['placa', 'placa aluminio', 'placa alum'], 12) || '-',
      etiQ: readField(row, boardInfo, ['etiquetas', 'etiqueta', 'etiq'], 13) || '-',
      qrCode: readField(row, boardInfo, ['qr code', 'qrcode', 'qr'], 14) || '-',
      testes: tests || '-',
      inspecaoQualidade: tests || '-',
      obsPcp: readField(row, boardInfo, ['observacao', 'obs'], 16) || '',
      listaMatMec: listMaterialsMechanical || 'Não mapeado',
      listaMatControls: listMaterialsControls || 'Não mapeado',
      listaIdent: readField(row, boardInfo, ['lista de identificacoes', 'lista identificacoes'], -1) || 'Não mapeado',
      layoutCalha: readField(row, boardInfo, ['layout de calha', 'layout calha'], -1) || 'Não mapeado',
      montagemMecanica: readField(row, boardInfo, ['montagem mecanica', 'mechanical assembly'], -1) || '',
      medicao3D: readField(row, boardInfo, ['medicao 3d', 'medicao tridimensional', '3d measurement'], -1) || '',
      bordoMaquina: readField(row, boardInfo, ['bordo maquina', 'status bordo maquina'], -1) || 'Não mapeado',
      entregaDispositivo: deliveryTriple
    }

    card.manufatura.inspecaoQualidade = String(card.pcp.inspecaoQualidade || '').trim()
    card.manufatura.montagemMecanica = String(card.pcp.montagemMecanica || '').trim()
    card.manufatura.medicao3D = String(card.pcp.medicao3D || '').trim()
    card.manufatura.bordoMaquina = String(card.pcp.bordoMaquina || '').trim()
    card.manufatura.entregaDispositivo = deliveryTriple
  })

  // 3. Follow-up: projeto, linha, estratégia e dados construtivos
  const followInfo = createHeaderInfo(safeSheets.followUp)
  safeSheets.followUp.slice(followInfo.dataStart).forEach(row => {
    if (!Array.isArray(row) || row.length < 5) return

    const transmission = cleanTr(readField(row, followInfo, ['transmissao', 'id da transmissao', 'transmission'], 4))
    if (!transmission || normalizeText(transmission).includes('transmissao')) return

    const cliente = String(readField(row, followInfo, ['cliente', 'customer'], 0) ?? '').trim()
    const wbs = String(readField(row, followInfo, ['wbs', 'estrutura analitica'], 1) ?? '').trim()
    const projectColumn = findColumn(followInfo.headers, ['nome do projeto', 'nome projeto', 'project name', 'project', 'projeto'], ['wbs'])
    const projetoLido = projectColumn >= 0 ? row[projectColumn] : null
    const projeto = String(firstAvailable(projetoLido, cliente, wbs, 'N/A')).trim()
    const linha = String(readField(row, followInfo, ['linha', 'line'], 2) ?? '').trim()
    const operacao = String(readField(row, followInfo, ['operacao', 'operation', 'operation code'], -1) ?? '').trim()
    const descricao = String(readField(row, followInfo, ['descricao', 'description', 'operation description'], 3) ?? '').trim()
    const fornecedorName = String(readField(row, followInfo, ['fornecedor', 'supplier', 'fabricante'], 11) ?? '').trim().toUpperCase()
    const risk = supRiscoMap.get(fornecedorName) || { saturacaoPerc: 0, nota: 'N/A' }

    const card = getOrCreateCard(transmission)
    card.cliente = cliente || card.cliente
    card.projeto = projeto || card.projeto
    card.projetoWBS = wbs || card.projetoWBS
    card.linha = linha || card.linha
    card.linhaOp = linha || card.linhaOp
    card.operacao = operacao || card.operacao
    card.descricao = descricao || card.descricao
    card.qtd = readField(row, followInfo, ['quantidade', 'qtd', 'quantity'], 5) || card.qtd || 1

    const strategy = readField(row, followInfo, ['estrategia', 'make or buy', 'make buy'], 8)
    if (hasValue(strategy)) card.manufatura.estrategia = String(strategy).trim()

    card.construtivo = {
      rev: readField(row, followInfo, ['revisao', 'revision', 'rev'], 5) || '-',
      makeBuy: strategy || '-',
      fornecedor: fornecedorName || '-',
      inicio: readDate(readField(row, followInfo, ['inicio', 'data inicio', 'start date'], 9)),
      entregaForn: readDate(readField(row, followInfo, ['entrega fornecedor', 'data entrega fornecedor', 'entrega prevista'], 12)),
      reprog: readDate(readField(row, followInfo, ['reprogramacao', 'data reprogramacao'], 14)),
      entregaMfg: readDate(readField(row, followInfo, ['entrega manufatura', 'data entrega comau', 'entrega comau'], 13)),
      statusSys: String(readField(row, followInfo, ['status', 'status sistema', 'status follow up'], 15) ?? '').trim(),
      valorTot: readField(row, followInfo, ['valor total', 'valor ordem'], 16) || 0,
      respFollow: readField(row, followInfo, ['responsavel follow up', 'resp follow', 'responsavel'], 18) || '-',
      nf: readField(row, followInfo, ['nota fiscal', 'nf'], 19) || '-',
      comercialResp: readField(row, followInfo, ['responsavel comercial', 'comprador'], 20) || '-',
      status: readField(row, followInfo, ['status liberacao', 'status'], 21) || '-',
      localEnt: readField(row, followInfo, ['local montagem', 'local entrega', 'local'], 22) || '-',
      obs: readField(row, followInfo, ['observacao', 'observacoes', 'obs'], 7) || '',
      des2D: readField(row, followInfo, ['desenho 2d', 'projeto 2d'], 24) || 'Não mapeado',
      des3D: readField(row, followInfo, ['desenho 3d', 'projeto 3d'], 25) || 'Não mapeado',
      dtNecessidade: readDate(readField(row, followInfo, ['data necessidade', 'dt necessidade'], 27)),
      rc: String(readField(row, followInfo, ['numero da rc', 'n da rc', 'rc'], 35) ?? '').trim(),
      dtRc: readDate(readField(row, followInfo, ['data rc', 'dt rc', 'emissao rc'], 36)),
      oc: String(readField(row, followInfo, ['numero da po', 'n da po', 'po', 'oc'], 37) ?? '').trim(),
      dtOc: readDate(readField(row, followInfo, ['data po', 'data pedido', 'dt po', 'dt oc'], 38))
    }
    card.riscoFornecedor = risk

    const mechanicalList = readField(row, followInfo, ['lista de materiais mecanicos', 'lista materiais mecanicos', 'bom mecanica'], -1)
    if (hasValue(mechanicalList)) card.construtivo.listaMatMec = mechanicalList

    const mechanicalAssembly = readField(row, followInfo, ['montagem mecanica', 'mechanical assembly'], -1)
    if (hasValue(mechanicalAssembly)) card.manufatura.montagemMecanica = String(mechanicalAssembly).trim()

    const measurement3D = readField(row, followInfo, ['medicao 3d', '3d measurement'], -1)
    if (hasValue(measurement3D)) card.manufatura.medicao3D = String(measurement3D).trim()
  })

  // 4. Sourcing Plan: classificação (coluna B) e transmissão (coluna M)
  safeSheets.sourcingPlans.forEach(sourcingTable => {
    const sourcingInfo = createHeaderInfo(sourcingTable)
    sourcingTable.slice(sourcingInfo.dataStart).forEach(row => {
      if (!Array.isArray(row) || row.length === 0) return
      const type = readField(row, sourcingInfo, ['classe', 'classificacao', 'tipo de material', 'tipo de item', 'tipo', 'category', 'class', 'material type', 'item type'], 1)
      const transmission = cleanTr(readField(row, sourcingInfo, ['transmissao', 'id da transmissao', 'transmission'], 12))
      if (!transmission || normalizeText(transmission).includes('transmissao')) return

      const card = getOrCreateCard(transmission)
      const projectColumn = findColumn(sourcingInfo.headers, ['nome do projeto', 'nome projeto', 'project name', 'project', 'projeto'], ['wbs'])
      const sourceProject = projectColumn >= 0 ? row[projectColumn] : null
      const sourceLine = readField(row, sourcingInfo, ['linha', 'line'])
      const sourceOperation = readField(row, sourcingInfo, ['operacao', 'operation', 'operation code'])
      if (hasValue(sourceProject)) card.projeto = String(sourceProject).trim()
      if (hasValue(sourceLine)) card.linha = String(sourceLine).trim()
      if (hasValue(sourceOperation)) card.operacao = String(sourceOperation).trim()

      const material = createMaterial(row, sourcingInfo, type, card)
      if (!material) return
      const target = material.tipo === 'Comercial' ? card.materiais.comerciais : card.materiais.construtivos
      addMaterialIfUnique(target, material)
    })
  })

  // 5. Abas legadas Comerciais/PRPO (mantidas como compatibilidade)
  const processLegacyCommercialSheet = (sheet) => {
    if (!Array.isArray(sheet) || sheet.length === 0) return
    const info = createHeaderInfo(sheet)
    sheet.slice(info.dataStart).forEach(row => {
      if (!Array.isArray(row) || row.length < 2) return
      const transmission = cleanTr(readField(row, info, ['transmissao', 'id da transmissao', 'transmission'], 0))
      if (!transmission || normalizeText(transmission).includes('transmissao')) return

      const card = getOrCreateCard(transmission)
      const material = {
        id: `${transmission}-legacy-${card.materiais.comerciais.length + 1}`,
        tipo: 'Comercial',
        tag: null,
        qtd: readField(row, info, ['quantidade', 'qtd', 'quantity'], 4) || '',
        descricao: String(readField(row, info, ['descricao', 'description', 'material'], 1) ?? '').trim(),
        referencia: String(readField(row, info, ['referencia', 'reference', 'part number', 'pn'], 2) ?? '').trim(),
        fabricante: String(readField(row, info, ['fabricante', 'manufacturer', 'brand'], -1) ?? '').trim(),
        fornecedor: String(readField(row, info, ['fornecedor', 'supplier', 'vendor'], 11) ?? '').trim(),
        statusLiberacao: String(readField(row, info, ['status liberacao', 'status da liberacao', 'release status'], -1) ?? '').trim(),
        rc: String(readField(row, info, ['numero da rc', 'n da rc', 'rc'], 5) ?? '').trim(),
        po: String(readField(row, info, ['numero da po', 'n da po', 'po', 'oc'], 9) ?? '').trim(),
        datas: {
          liberacao: EMPTY_TRIPLE(),
          insercaoTarefa: EMPTY_TRIPLE(),
          requisicao: EMPTY_TRIPLE(),
          pedido: EMPTY_TRIPLE()
        },
        datasComplementares: EMPTY_EXTERNAL_DATES(),
        nf: readField(row, info, ['nota fiscal', 'nf'], 13) || '',
        pull: readField(row, info, ['pull', 'pull system'], 14) || ''
      }
      addMaterialIfUnique(card.materiais.comerciais, material)

      const freight = readField(row, info, ['incoterm', 'frete'], 21)
      const costCenter = readField(row, info, ['centro de custo', 'wbs'], 19)
      const cargoDate = readDate(readField(row, info, ['data presenca carga', 'presenca carga'], 25))
      if (hasValue(freight)) card.logisticaAdvanced.frete = freight
      if (hasValue(costCenter)) card.logisticaAdvanced.cc = costCenter
      if (cargoDate) card.logisticaAdvanced.presencaCarga = cargoDate
    })
  }

  safeSheets.comerciais.forEach(processLegacyCommercialSheet)
  if (safeSheets.prpo.length) processLegacyCommercialSheet(safeSheets.prpo)

  // 6. Fallback construtivo para transmissões que ainda não têm a linha do Sourcing Plan
  trMap.forEach(card => {
    if (card.construtivo && card.materiais.construtivos.length === 0) {
      const constructive = card.construtivo
      card.materiais.construtivos.push({
        id: `${card.id}-construtivo-followup`,
        tipo: 'Construtivo',
        tag: null,
        qtd: card.qtd,
        descricao: card.descricao,
        referencia: constructive.rev || '',
        fabricante: '',
        fornecedor: constructive.fornecedor || '',
        statusLiberacao: constructive.statusSys || constructive.status || '',
        rc: constructive.rc || '',
        po: constructive.oc || '',
        datas: {
          liberacao: EMPTY_TRIPLE(),
          insercaoTarefa: EMPTY_TRIPLE(),
          requisicao: { ...EMPTY_TRIPLE(), realizado: constructive.dtRc },
          pedido: { ...EMPTY_TRIPLE(), realizado: constructive.dtOc }
        },
        datasComplementares: EMPTY_EXTERNAL_DATES()
      })
    }
  })

  // 7. Status individuais das quatro classes (não existe status global)
  const processedData = Array.from(trMap.values()).map(card => {
    const mechanicalStatus = statusFromValues([
      card.construtivo?.des2D,
      card.construtivo?.des3D,
      card.construtivo?.listaMatMec,
      card.pcp?.listaMatMec
    ])
    const controlsStatus = statusFromValues([
      card.pcp?.projEle,
      card.pcp?.listaMatControls,
      card.pcp?.projTop,
      card.pcp?.listaIdent,
      card.pcp?.layoutCalha
    ])

    // O status de Comerciais/Construtivos acompanha as datas Planejado,
    // Previsto e Realizado dos marcos; não usa apenas a existência de RC/PO.
    const commercialStatus = getMaterialCollectionStatus(card.materiais.comerciais)
    const constructiveStatus = getMaterialCollectionStatus(card.materiais.construtivos)

    // Só considera etapas reais de manufatura. A existência de um objeto PCP,
    // por si só, não significa que a etapa esteja em andamento ou concluída.
    const manufacturingValues = [
      card.manufatura.montagemMecanica,
      card.manufatura.medicao3D,
      card.manufatura.bordoMaquina,
      card.manufatura.inspecaoQualidade,
      card.pcp?.testes
    ]
    const manufacturingHasData = manufacturingValues.some(value => !isPlaceholder(value))
    const manufacturingStatus = manufacturingHasData
      ? statusFromValues(manufacturingValues)
      : 'Vazio'

    return {
      ...card,
      subStages: { EngMecanica: mechanicalStatus, EngControls: controlsStatus },
      stages: {
        Engenharia: aggregateStatuses([mechanicalStatus, controlsStatus]),
        Comerciais: commercialStatus,
        Construtivos: constructiveStatus,
        Manufatura: manufacturingStatus
      }
    }
  })

  const uniqueProjetos = new Set(processedData.map(card => card.projeto).filter(value => value && value !== 'N/A'))
  const uniqueLinhas = new Set(processedData.map(card => card.linha).filter(value => value && value !== 'N/A'))
  const uniqueOperacoes = new Set(processedData.map(card => card.operacao).filter(value => value && value !== 'N/A'))

  return { processedData, uniqueProjetos, uniqueLinhas, uniqueOperacoes }
}

export const DEMO_SHEETS = {
  saturacao: [
    ['Fornecedor', '', 'Saturação %', '', 'Nota Avaliação'],
    ['MEC SYSTEMS', '', '0.85', '', '0.92'],
    ['AR SANTOS', '', '0.95', '', '0.81'],
    ['IMECOR', '', '0.45', '', '0.96']
  ],
  bordomaquina: [
    ['ID', 'TRANSMISSÃO', 'OPERAÇÃO', 'DATA ENTREGA DISPOSITIVO', 'LOCAL', 'PRIO', 'PROJ ELE', 'PROJ PNEU', 'PROJ TOP', 'MAT ELE', 'MAT PNEU', 'MISC', 'PLACA', 'ETIQ', 'QR', 'TESTES', 'OBS'],
    [1, 'VW427-PATAGONIA-AUFBAU-0035-2025', 'OP10', 46000, 'Betim', 'N', 'Liberado', 'Liberado', 'N/A', '1', '1', 'Ok', 'Fixada', 'Colado', 'Gerado', 'Testes OK', 'Sem Pendências'],
    [2, 'VW247-PATAGONIA-BODYSIDE-0001-2025', 'OP20', 46050, 'Santo André', 'S', 'Em Análise', 'Não liberado', 'N/A', '0.2', '0', 'Pendente', '-', '-', '-', 'Pendente', 'Aguardando Mat.'],
    [3, 'STL-PSA-BB21-JJ-PCK01-0102-2024', 'OP25', '04/02/2026', 'Betim', 'N', 'Liberado', 'Liberado', 'N/A', '1', '1', 'Ok', 'Fixada', 'Colado', 'Gerado', 'Testes OK', 'Apenas PCP']
  ],
  followUp: [
    [],
    ['VW', 'BRBCBBB35', 'AUFBAU', 'DISPOSITIVO INDEX', 'VW427-PATAGONIA-AUFBAU-0035-2025', '1', 'Date', 'Aprovado GQ', 'Make', '45500', 'OC', 'MEC SYSTEMS', '45600', '45605', '45610', '100% Concluído', '15000', '120', 'Ana', '123', 'Vic', 'Ok', 'Betim', ''],
    ['VW', 'BRBCBBB35', 'BODYSIDE', 'GRAMPO PNEUMATICO', 'VW247-PATAGONIA-BODYSIDE-0001-2025', '0', 'Date', 'Máquina CNC Quebrou', 'Buy', '45550', 'OC', 'AR SANTOS', '45620', '45625', '45640', 'Atrasado', '8400', '45', 'Rudnei', '-', 'Jes', 'Fail', 'S.André', '1'],
    ['RENAULT', 'BRBCBBB37', 'STW', 'SUPORTE BASE', 'BB37-VW-ANCH-STW-UB2-0002-2025', '2', 'Date', 'Nenhuma obs.', 'Make/Buy', '45550', 'OC', 'IMECOR', '45620', '45625', '45640', 'Em andamento', '1200', '15', 'Kaio', '-', 'Vic', 'Ok', 'S.André', 'MÁXIMA']
  ],
  comerciais: [
    [[], ['VW427-PATAGONIA-AUFBAU-0035-2025', 'SENSOR M12', 'PN123', 'D', '4', 'RC1', 'x', 'x', 'x', 'OC1', 'x', 'FORN', 45600, 'NF12', 'PULL99']],
    [[], ['VW247-PATAGONIA-BODYSIDE-0001-2025', 'CILINDRO 50MM', 'CIL50', 'D', '2', 'RC2', 'x', 'x', 'x', '', 'x', 'FORN', 45630, '', '']]
  ],
  prpo: [
    [],
    ['VW427-PATAGONIA-AUFBAU-0035-2025', 'SENSOR M12', 'PN123', 'D', '4', 'RC1', 'x', 'x', 'x', 'OC1', 'x', 'FORN', 45600, 'NF12', 'PULL99', '', '', '', '', 'BRBC-CC1', '', 'CIF', '', '', '', 45590]
  ],
  sourcingPlans: [[
    ['Tipo', 'Qtd', 'Descrição', 'Referência', 'Fabricante', 'Status da liberação', 'Nº da RC', 'Nº da PO', 'Liberação Plan', 'Liberação Prev', 'Liberação Real', 'Linha', 'Transmissão'],
    ['Comercial', 4, 'Sensor M12', 'PN123', 'Phoenix Contact', 'Liberado', 'RC-001', 'PO-001', 46000, 46010, 46005, 'AUFBAU', 'VW427-PATAGONIA-AUFBAU-0035-2025'],
    ['Construtivo', 2, 'Suporte de fixação', 'SUP-002', '', 'Em cotação', 'RC-002', '', 46000, 46020, '', 'STW', 'BB37-VW-ANCH-STW-UB2-0002-2025'],
    ['Antecipação', 1, 'Conector M12 antecipado', 'PN-ANT-1', 'Phoenix Contact', 'Liberado', 'RC-003', 'PO-003', 46000, 46002, 46001, 'AUFBAU', 'VW427-PATAGONIA-AUFBAU-0035-2025'],
    ['Já antecipado', 3, 'Cabo já antecipado', 'PN-ANT-2', 'Siemens', 'Liberado', 'RC-004', 'PO-004', 46000, 46001, 46001, 'AUFBAU', 'VW427-PATAGONIA-AUFBAU-0035-2025']
  ]]
}
