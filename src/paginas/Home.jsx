import { ArrowRight, Database, Network } from 'lucide-react'

export default function Home({ onOpenSupplyChain, onOpenDatabase, hasData }) {
  return (
    <section className="home-page" aria-labelledby="home-title">
      <div className="home-intro">
        {/* O texto "COMAU · SITE" que ficava aqui foi removido com sucesso. */}
        <h2 id="home-title">Supply Chain Tracker</h2>
        <p>Selecione a área que deseja acessar.</p>
      </div>

      <div className="home-options">
        <button type="button" className="home-option" onClick={onOpenSupplyChain}>
          <span className="home-option-icon"><Network aria-hidden="true" /></span>
          <span className="home-option-copy">
            <strong>Supply Chain</strong>
            <span>Acessar transmissões, projetos e acompanhamento dos materiais.</span>
            <small>{hasData ? 'Base carregada nesta sessão' : 'Nenhuma base carregada nesta sessão'}</small>
          </span>
          <ArrowRight className="home-option-arrow" aria-hidden="true" />
        </button>

        <button type="button" className="home-option" onClick={onOpenDatabase}>
          <span className="home-option-icon"><Database aria-hidden="true" /></span>
          <span className="home-option-copy">
            <strong>Banco de dados</strong>
            <span>Importar planilhas e preparar os dados utilizados pelo rastreador.</span>
            <small>Área de carregamento e preparação de dados</small>
          </span>
          <ArrowRight className="home-option-arrow" aria-hidden="true" />
        </button>
      </div>

      {/* A nota de rodapé sobre o armazenamento dos arquivos foi removida daqui. */}
    </section>
  )
}