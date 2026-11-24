# Alterações implementadas — SupplyChainTracker

## Interface e navegação

- Renomeado o filtro antigo de WBS para **Projeto**.
- Substituído o campo de busca por **Procurar por palavra chave**.
- Mantidos exatamente quatro filtros: texto livre (palavra chave), projeto, linha e operação.
- Removidos os blocos Purchasing e Delivery, o botão Detalhamento e o status global das transmissões.
- Reorganizado o fluxo em quatro classes: **Engenharia**, **Comerciais**, **Construtivos** e **Manufatura**.
- Padronizados os cartões de transmissão com Projeto, Linha, Operação, Qtd, ID e Descrição.
- Os status das classes são apresentados por ícones, sem os textos de status nas caixas.
- Removido o texto “ERP COMAU” do cabeçalho.

## Engenharia

- Unificadas as engenharias Mecânica e Controls dentro de uma única caixa **Engenharia**, com duas subdivisões internas: **Mec** e **Controls**.
- Mecânica: Desenho 3D, Desenho 2D, Lista de materiais mecânicos e Revisão.
- Controls: Projeto elétrico, Lista de materiais de controls, Topográfico, Lista de identificações e Layout de calha.
- Horas estimadas removidas da interface de Engenharia.
- Estratégia removida de Engenharia e apresentada em Manufatura.

## Materiais comerciais e construtivos

- Criadas classes separadas para materiais **Comerciais** e **Construtivos**.
- Campos apresentados: quantidade, descrição, referência, fabricante (Comerciais) ou fornecedor (Construtivos), status da liberação, Nº da RC e Nº da PO.
- Cada classe apresenta os marcos Liberação, Inserção de tarefa, Requisição e Pedido com Planeado, Previsto e Realizado.
- Preparados campos de data simples para Data de entrega na COMAU, Data da criação do P&S e Data de entrega ao usuário; a origem e a associação com outras planilhas ainda precisam ser definidas.
- Criadas as etiquetas verdes **Antecipação** e **Já antecipado**; ambas classificam o item como Comercial.
- Removida a geração artificial de números RC/PO quando os dados não existem.

## Manufatura

- Campos: Estratégia, Montagem mecânica, Medição 3D, Bordo-máquina e Inspeção da qualidade.
- Entrega do dispositivo apresentada com datas Planeado, Previsto e Realizado.

## Importação e tratamento

- Reconhecida a aba/arquivo **Sourcing Plan**, inclusive variações usuais do nome.
- Leitura por cabeçalho para os campos de materiais; como fallback, classificação na coluna B e transmissão na coluna M.
- Leitura de cabeçalhos agrupados em mais de uma linha para datas Plan/Prev/Real.
- Mantida compatibilidade com as abas antigas Comerciais e PRPO.
- Ajustada a deduplicação para não descartar linhas sem referência e descrição.
- Atualizado o exemplo de demonstração para contemplar Comerciais, Construtivos e as duas etiquetas de antecipação.

## Pontos que ainda dependem das planilhas de origem

- **Sourcing Plan real:** o arquivo de código e as anotações da reunião foram enviados, mas a planilha real não. A leitura foi preparada com sinônimos de cabeçalho e fallback B/M; os nomes e posições definitivos precisam ser conferidos com o arquivo real.
- **Dados complementares:** o modelo já possui os campos de Data de entrega na COMAU, Data da criação do P&S e Data de entrega ao usuário, além de Fornecedor para Construtivos. A associação efetiva com outras planilhas ainda depende de definir arquivos/abas, colunas e a chave de relacionamento.
- **Nome legível do Projeto:** o sistema usa uma coluna explícita de nome de projeto quando existe; caso contrário, usa Cliente como alternativa para evitar exibir o código WBS. Para mostrar o nome oficial de cada projeto, é necessário fornecer a coluna ou tabela de correspondência.
- Campos não encontrados na base aparecem sem informação/como “Não mapeado”; o sistema não inventa datas ou números.

## Conferência desta revisão

- Conferidos os quatro filtros e os rótulos exigidos.
- Removido o indicador global do cabeçalho.
- Removida a exibição de fornecedor no cartão-resumo; o fornecedor permanece nos dados do item construtivo.
- Ajustadas as subdivisões da Engenharia para **Mec** e **Controls**.
- Antecipação e Já antecipado passam a prevalecer sobre a classificação Construtivo e são armazenadas como Comerciais.
- Os quatro marcos de materiais mantêm a estrutura Planeado/Previsto/Realizado; as três datas complementares usam um único campo de data cada.
- Testes do processador com a demonstração e planilhas sintéticas: os rótulos Antecipação/Já antecipado foram classificados como Comerciais, um item Construtivo comum permaneceu Construtivo, os cabeçalhos de datas em duas linhas foram lidos e os campos de fornecedor/data complementar foram preservados.
- Sintaxe dos 14 arquivos `.js`/`.jsx` e resolução dos imports relativos: sem erros.
- **Build Vite não executado:** a instalação das dependências não foi possível em modo offline porque o pacote `@vitejs/plugin-react` não estava disponível no cache npm.

## Como validar no seu computador

Na pasta do projeto, execute:

```bash
npm install
npm run build
npm run dev
```


## Seleção separada de materiais comerciais e construtivos

Na abertura dos detalhes de uma transmissão, foi incluída uma área com duas caixas clicáveis: **Comerciais** e **Construtivos**. Cada caixa apresenta a quantidade de itens daquela categoria. Ao selecionar uma delas, a tela filtra o conteúdo para mostrar somente os materiais correspondentes. O botão “Mostrar todas as etapas novamente” restaura a visualização completa.

---

## Atualização: Central de Operações (landing page)

- A aplicação agora abre primeiro na Central de Operações.
- O cartão **Área de Supply Chain** abre a tela de importação quando ainda não há dados carregados; se os dados já estiverem na sessão, retorna diretamente ao dashboard.
- O cartão **Banco de Dados** abre uma tela de prévia marcada como em desenvolvimento, sem simular uma conexão ou funcionalidades inexistentes.
- As telas internas receberam um botão **Central** para voltar à landing page sem descartar os dados já carregados na sessão.
- A logo é importada de `src/assets/logo-comau.png`. O arquivo da imagem não veio no pacote de código recebido; mantenha/adicone a logo original nesse caminho.

### Arquivos adicionados/alterados

- `src/App.jsx`
- `src/componentes/Cabecalho.jsx`
- `src/estilos.css`
- `src/paginas/CentralOperacoes/CentralOperacoes.jsx`
- `src/paginas/CentralOperacoes/CentralOperacoes.css`
- `src/paginas/BancoDeDados/BancoDeDados.jsx`
- `src/paginas/BancoDeDados/BancoDeDados.css`


## Atualização — Continuação das solicitações da reunião de 19/11/2026

### Materiais Comerciais e Construtivos

- Incluídos filtros por Fabricante (Comerciais) ou Construtivos/fornecedor (Construtivos), Nº da RC e Nº da PO. Os filtros RC e PO aceitam correspondência parcial e podem ser combinados.
- A busca geral por palavra-chave agora considera quantidade, descrição, referência, fabricante/fornecedor, status de liberação, RC, PO, tags, dados de Engenharia/PCP/Manufatura e datas dos materiais.
- Os cards dos materiais foram reorganizados em três colunas em telas grandes, duas em telas intermediárias e uma em dispositivos estreitos.
- Implementada paginação dos materiais com seleção de 3, 6, 9, 12 ou 24 itens por página, navegação por primeira/anterior/número/próxima/última página e contador de itens.
- Quantidade foi posicionada imediatamente depois de Fabricante nos dados dos materiais Comerciais.
- Nos Construtivos, o rótulo de fornecedor foi alterado para **Construtivos**, seguido do nome da empresa.
- Removida a exibição de NF e PULL/PO adicional dos cards de materiais, mantendo Nº da PO normal.
- Removido o campo Revisão da subdivisão de Engenharia.

### Cronograma

- As três datas complementares (Entrega na COMAU, Criação do P&S e Entrega ao usuário) agora possuem estrutura Planejado/Previsto/Realizado.
- As três datas complementares foram incorporadas à mesma tabela dos marcos Liberação, Inserção de tarefa, Requisição e Pedido, totalizando sete marcos.
- Ajustada a leitura do processador para mapear as datas complementares por cabeçalho e período.
- Ajustada a leitura do status de prazo para consultar a data Prevista dentro da nova estrutura trimestral.

### Ajustes visuais

- Ícone de Construtivos alterado para engrenagem tanto nos cards quanto na árvore de etapas.
- Aumentada a espessura das bordas dos cards de transmissão e dos materiais, além das linhas da tabela de datas.
- Removido o efeito de brilho/piscada dos estados vermelho, verde e amarelo dos cards; o vermelho permanece estático.
- Ajustada a nomenclatura da subdivisão para **Mecânica** e da lista para **Lista de materiais de control** conforme a discussão da reunião.

### Validações e limitações

- Sintaxe verificada em todos os 16 arquivos JS/JSX da aplicação.
- Imports relativos entre módulos locais conferidos; as imagens da logo continuam dependendo do arquivo local `src/assets/logo-comau.png`, que deve ser preservado ao copiar os arquivos.
- Processador executado com a base de demonstração: 4 transmissões e 7 materiais.
- Processador testado com uma planilha sintética contendo os sete marcos e as datas Planejado/Previsto/Realizado; os sete trios foram mapeados.
- **Build Vite não validado neste ambiente:** `vite` não está instalado em `node_modules`; por isso `npm run build` não pôde ser concluído.

### Pendências que continuam aguardando definição

- Definição do significado e das regras da cor amarela do semáforo por Felipe.
- Definição da regra consolidada que determina quando o card de cada material Comercial fica verde ou vermelho a partir dos marcos.
- Planilhas reais de origem e chave de relacionamento para as datas complementares, para validar o mapeamento contra dados reais.
