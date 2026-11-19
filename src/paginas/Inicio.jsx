import BotaoUpload from '../componentes/BotaoUpload.jsx'

/**
 * Área de preparação e importação dos arquivos de origem.
 * Renderiza sobre o dashboard enquanto nenhum dado foi processado.
 */
export default function Inicio({ fileQueue, onAddFiles, onProcess, onDemo, feedback, onProcessSheets }) {
  return (
    <BotaoUpload
      fileQueue={fileQueue}
      onAddFiles={onAddFiles}
      onProcess={onProcess}
      onDemo={onDemo}
      feedback={feedback}
      onProcessSheets={onProcessSheets}
    />
  )
}
