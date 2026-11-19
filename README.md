<div align="center">
  <h1>Sistema de Integração e Visualização de Projetos - Comau - (SupplyChainTracker)</h1>
  
  <p>
    Uma solução para centralização, tratamento e visualização hierárquica de dados de montagem e listas de materiais.
  </p>
  
  <img src="https://img.shields.io/badge/STATUS-MVP-important?style=for-the-badge" alt="Status MVP">
  
  <br /><br />

  <h3>Tecnologias & Ferramentas</h3>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <br />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <br />
  <img src="https://img.shields.io/badge/VS_Code-0078D4?style=for-the-badge&logo=visual%20studio%20code&logoColor=white" alt="VS Code">
</div>

<br />

<details open="open">
  <summary>Sumário</summary>
  <ol>
    <li><a href="#-sobre-o-projeto">Sobre o Projeto</a></li>
    <li><a href="#-o-desafio-problema">O Desafio (Problema)</a></li>
    <li><a href="#-a-solução">A Solução</a></li>
    <li><a href="#-benchmarking--impacto">Benchmarking & Impacto</a></li>
    <li><a href="#️-jornada-do-usuário">Jornada do Usuário</a></li>
    <li><a href="#️-arquitetura-e-fluxo-de-dados">Arquitetura e Fluxo</a></li>
  </ol>
</details>

---

## 📄 Sobre o Projeto

Este projeto visa resolver gargalos operacionais no **Departamento de SITE (Instalações)**, focando na otimização da leitura e interpretação de dados de projetos de engenharia. O sistema atua como uma ferramenta de **ETL (Extract, Transform, Load)** e visualização, processando arquivos brutos para gerar uma visão unificada das linhas de montagem.

## 🚩 O Desafio (Problema)

Atualmente, a gestão de dados no departamento enfrenta dificuldades críticas relacionadas à fragmentação da informação:

* **Visualização Fragmentada:** Ausência de uma visão holística (Overview) das linhas de montagem dos projetos recebidos.
* **Descentralização de Materiais:** As planilhas de Lista de Materiais (BOM - Bill of Materials) são recebidas separadamente, dificultando o cruzamento de dados com o cronograma ou o projeto físico.
* **Inconsistência de Dados (Input):** Os arquivos de entrada (`.xlsx` ou `.xlsm`) carecem de padronização, apresentando formatação desorganizada que impede a análise direta.
* **Complexidade de Relacionamento:** Dificuldade extrema em agrupar dados interligados (ex: relacionar um ID de transmissão específico com sua respectiva lista de materiais e linha de montagem).

## 💡 A Solução

O sistema propõe uma arquitetura de processamento inteligente que ingere arquivos desestruturados e devolve informações organizadas logicamente.

### Objetivos Principais

1. **Centralização de Inputs:** Recebimento unificado de arquivos `.xlsx` e `.xlsm`.
2. **Processamento Lógico:** Aplicação de algoritmos de organização baseados em regras de negócio pré-definidas.
3. **Estruturação Hierárquica:** Agrupamento automático de dados seguindo a árvore lógica do projeto:
   - *Linhas de Montagem* ➔ *Transmissões (IDs)* ➔ *Listas de Materiais (BOM)*.
4. **Visualização Otimizada:** Interface ou saída de dados que permite ao usuário visualizar o projeto de forma macro e micro, com todas as dependências corretamente vinculadas.

---

## 📊 Benchmarking & Impacto

Comparativo de eficiência entre o processo manual atual e a automação proposta pelo SIV-SITE.

| Métrica | Processo Atual (Manual) | SIV-SITE (Automatizado) | Melhoria Estimada |
| :--- | :--- | :--- | :---: |
| **Tempo de Análise** | Horas (Agrupamento manual) | Minutos (Processamento auto) | 🔼 **Alta** |
| **Integridade de Dados** | Alta propensão a erro humano | Validação lógica por código | 🔼 **Alta** |
| **Visualização** | Planilhas desconexas | Dashboard Unificado | ✅ **Total** |

### Redução de Complexidade
```mermaid
graph LR
    subgraph "Processo Antigo"
    A[Receber XLS] --> B[Abrir Múltiplos Arquivos]
    B --> C[Cruzar Dados Manualmente]
    C --> D[Identificar Erros]
    D --> E[Gerar Relatório]
    end

    subgraph "SIV-SITE"
    F[Upload XLS] --> G[Processamento Automático]
    G --> H[Visualização Pronta]
    end
    
    style G fill:#bbf,stroke:#333,stroke-width:2px
```

---

## 🗺️ Jornada do Usuário

Abaixo, o fluxo simplificado da experiência do engenheiro ao utilizar a plataforma:
```mermaid
flowchart LR
    subgraph INPUT ["📥 ENTRADA"]
        A[/"📁 Upload dos<br/>Arquivos Excel"/]
    end

    subgraph PROCESSAMENTO ["⚙️ PROCESSAMENTO"]
        B["🔍 Validação<br/>de Formato"]
        C["🧹 Limpeza e<br/>Normalização"]
        D["🔗 Criação dos<br/>Vínculos"]
    end

    subgraph OUTPUT ["📤 SAÍDA"]
        E[/"📊 Visualização<br/>em Árvore"/]
        F[/"💾 Exportação<br/>Organizada"/]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F

    style INPUT fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style PROCESSAMENTO fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style OUTPUT fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
```

**Legenda:**
| Etapa | Responsável | Descrição |
|:---:|:---:|:---|
| 📥 Entrada | Engenheiro | Upload dos arquivos `.xlsx` ou `.xlsm` |
| ⚙️ Processamento | Sistema | Validação, limpeza e criação de vínculos hierárquicos |
| 📤 Saída | Engenheiro | Visualização dos dados e exportação organizada |

---


## Importação das classes de acompanhamento

O rastreador organiza cada transmissão em **Engenharia**, **Comerciais**, **Construtivos** e **Manufatura**. Para a classe de materiais, a importação reconhece uma aba ou arquivo chamado `Sourcing Plan` (também aceita variações simples do nome). O classificador de materiais procura a coluna de tipo/classe; quando ela não é identificada pelo cabeçalho, usa a coluna B. O ID da transmissão é procurado pelo cabeçalho e, como alternativa, pela coluna M.

No `Sourcing Plan`, os cabeçalhos são identificados por nomes em português ou inglês para quantidade, descrição, referência, fabricante/fornecedor, status de liberação, RC e PO. Para datas, o sistema procura grupos **Plan / Prev / Real** (Planeado / Previsto / Realizado) nos marcos de liberação, inserção de tarefa, requisição e pedido. As datas complementares — entrega na COMAU, criação do P&S e entrega ao usuário — usam campos de data simples; a associação com outras planilhas permanece preparada, mas depende da definição dos arquivos, abas e chaves de relacionamento.

Os campos sem correspondência na planilha recebida permanecem sem informação; o sistema não cria RC, PO ou datas fictícias. A estrutura está preparada para essas três datas complementares, mas a vinculação com outras planilhas depende de os respectivos arquivos/abas e cabeçalhos serem disponibilizados.

## ⚙️ Arquitetura e Fluxo de Dados

O núcleo do software baseia-se em um fluxo rigoroso de tratamento de dados:

1. **Ingestão (Input):** Carregamento dos arquivos brutos (Excel).
2. **Normalização:** O sistema identifica colunas chave e remove inconsistências.
3. **Mapeamento de Hierarquia:**
   - Identificação das Linhas Principais.
   - Associação dos IDs de Transmissão às linhas.
   - Vinculação dos itens da Lista de Materiais aos seus respectivos IDs.
4. **Renderização (Output):** Exibição dos dados agrupados e saneados para tomada de decisão.
```mermaid
graph TD;
    A[Arquivos Desorganizados .xlsx/.xlsm] -->|Input| B(Sistema de Processamento);
    B -->|Limpeza| C{Regras de Hierarquia};
    C -->|Agrupamento| D[Linhas de Montagem];
    C -->|Vínculo| E[IDs / Transmissões];
    C -->|Associação| F[Lista de Materiais];
    D --- E
    E --- F
    F -->|Output| G[Visualização Unificada do Projeto];
```

---

<div align="center">
  <p>Documentação desenvolvida por Natan Guimarães dos Santos e Heron de Souza.</p>
</div>
