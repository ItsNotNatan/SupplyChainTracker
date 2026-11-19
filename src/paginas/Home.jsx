import { ArrowRight, Database, Network } from 'lucide-react'

export default function Home({ onOpenSupplyChain, onOpenDatabase, hasData }) {
  return (
    <section className="home-page" aria-labelledby="home-title">
      <div className="home-intro">
        <span className="home-eyebrow">COMAU · SITE</span>
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

      <p className="home-storage-note">
        Nesta versão, os arquivos importados ficam disponíveis somente durante a sessão atual do navegador.
        O armazenamento compartilhado entre usuários exige a conexão com um backend e um banco de dados.
      </p>
    </section>
  )
}
