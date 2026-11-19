import { useState, useCallback } from 'react'
import * as XLSX from 'xlsx'
import Cabecalho from './componentes/Cabecalho.jsx'
import Inicio from './paginas/Inicio.jsx'
import Visualizacao from './paginas/Visualizacao.jsx'
import { processarDados, DEMO_SHEETS } from './utils/processamento.js'
import { fetchAllSheets } from './utils/gvizUtils.js'

const SHEETS_INICIAL = {
  followUp: [],
  saturacao: [],
  bordomaquina: [],
  comerciais: [],
  prpo: [],
  sourcingPlans: []
}

const FILTERS_INICIAIS = {
  palavraChave: '',
  projeto: '',
  linha: '',
  operacao: ''
}

export default function App() {
  const [tela, setTela] = useState('upload')
  const [fileQueue, setFileQueue] = useState([])
  const [feedback, setFeedback] = useState('')
  const [processedData, setProcessedData] = useState([])
  const [filters, setFilters] = useState(FILTERS_INICIAIS)
  const [uniqueProjetos, setUniqueProjetos] = useState(new Set())
  const [uniqueLinhas, setUniqueLinhas] = useState(new Set())
  const [uniqueOperacoes, setUniqueOperacoes] = useState(new Set())
  const [selectedCard, setSelectedCard] = useState(null)

  const handleAddFiles = useCallback((files) => {
    setFileQueue(previous => {
      const names = new Set(previous.map(file => file.name))
      const newFiles = files.filter(file => !names.has(file.name))
      return [...previous, ...newFiles]
    })
  }, [])

  const handleProcessar = useCallback(async () => {
    if (fileQueue.length === 0) return
    setFeedback(`Lendo ${fileQueue.length} arquivo(s). Por favor, aguarde...`)

    const sheets = { ...SHEETS_INICIAL, comerciais: [] }

    for (const file of fileQueue) {
      try {
        const workbook = await readExcel(file)
        const fileName = file.name.toLowerCase()
        const fileIsSourcingPlan = fileName.includes('sourcing') && fileName.includes('plan')
        const hasNamedSourcingTab = workbook.SheetNames.some(name => {
          const normalized = name.toLowerCase().replace(/[_-]+/g, ' ')
          return normalized.includes('sourcing plan') || normalized.includes('sourcingplan')
        })
        const fallbackSourcingTab = fileIsSourcingPlan && !hasNamedSourcingTab
          ? workbook.SheetNames.find(name => {
              const normalized = name.toLowerCase()
              return !normalized.includes('bkp') && !normalized.includes('backup') && !normalized.includes('copia') && !normalized.includes('cópia')
            })
          : null

        workbook.SheetNames.forEach(sheetName => {
          const lower = sheetName.toLowerCase()
          if (lower.includes('bkp') || lower.includes('cópia') || lower.includes('copia') || lower.includes('backup')) return

          const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '' })
          const normalizedTab = lower.replace(/[_-]+/g, ' ')

          if (normalizedTab.includes('sourcing plan') || normalizedTab.includes('sourcingplan') || sheetName === fallbackSourcingTab) {
            sheets.sourcingPlans.push(data)
          } else if (lower.includes('follow up') || lower.includes('follow-up') || lower.includes('followup')) {
            sheets.followUp = sheets.followUp.length === 0 ? data : [...sheets.followUp, ...data]
          } else if (lower.includes('saturação') || lower.includes('saturacao')) {
            sheets.saturacao = sheets.saturacao.length === 0 ? data : [...sheets.saturacao, ...data]
          } else if (lower.includes('bordomaquina') || lower.includes('bordo')) {
            sheets.bordomaquina = sheets.bordomaquina.length === 0 ? data : [...sheets.bordomaquina, ...data]
          } else if (lower.includes('comerciai') || lower.includes('poprog')) {
            sheets.comerciais.push(data)
          } else if (lower.includes('prpo')) {
            sheets.prpo = sheets.prpo.length === 0 ? data : [...sheets.prpo, ...data]
          }
        })
      } catch (error) {
        console.error('Erro ao ler arquivo:', file.name, error)
      }
    }

    setFeedback('Cruzando dados...')
    window.setTimeout(() => {
      aplicarResultado(sheets)
      setTela('dashboard')
      setFeedback('')
    }, 300)
  }, [fileQueue])

  const handleProcessSheets = useCallback(async (urls) => {
    setFeedback('Conectando à planilha...')
    try {
      const { sheets, summary } = await fetchAllSheets(urls, message => setFeedback(message))
      const tabsFound = summary.flatMap(item => Object.values(item.found ?? {})).length
      if (tabsFound === 0) {
        setFeedback('Nenhuma aba reconhecida. Confira os nomes das abas e o compartilhamento das planilhas.')
        return
      }

        setFeedback('Cruzando dados...')
      window.setTimeout(() => {
        aplicarResultado(sheets)
        setTela('dashboard')
        setFeedback('')
      }, 300)
    } catch (error) {
      console.error('Erro ao importar planilha:', error)
      setFeedback('Erro ao conectar. Verifique se a planilha está pública e tente novamente.')
    }
  }, [])

  const handleDemo = useCallback(() => {
    setFeedback('Carregando ambiente de demonstração...')
    window.setTimeout(() => {
      aplicarResultado(DEMO_SHEETS)
      setTela('dashboard')
      setFeedback('')
    }, 300)
  }, [])

  function aplicarResultado(sheets) {
    const result = processarDados(sheets)
    setProcessedData(result.processedData)
    setUniqueProjetos(result.uniqueProjetos)
    setUniqueLinhas(result.uniqueLinhas)
    setUniqueOperacoes(result.uniqueOperacoes)
    setFilters(FILTERS_INICIAIS)
    setSelectedCard(null)
  }

  const handleFilterChange = useCallback((field, value) => {
    setFilters(previous => ({ ...previous, [field]: value }))
  }, [])

  return (
    <>
      <Cabecalho />
      <main className="main-content">
        {tela === 'upload' && (
          <Inicio
            fileQueue={fileQueue}
            onAddFiles={handleAddFiles}
            onProcess={handleProcessar}
            onDemo={handleDemo}
            feedback={feedback}
            onProcessSheets={handleProcessSheets}
          />
        )}

        {tela === 'dashboard' && (
          <Visualizacao
            processedData={processedData}
            filters={filters}
            onFilterChange={handleFilterChange}
            uniqueProjetos={uniqueProjetos}
            uniqueLinhas={uniqueLinhas}
            uniqueOperacoes={uniqueOperacoes}
            selectedCard={selectedCard}
            onSelectCard={setSelectedCard}
            onCloseModal={() => setSelectedCard(null)}
          />
        )}
      </main>
    </>
  )
}

function readExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = event => {
      try {
        resolve(XLSX.read(new Uint8Array(event.target.result), { type: 'array' }))
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(reader.error || new Error(`Não foi possível ler ${file.name}`))
    reader.readAsArrayBuffer(file)
  })
}
