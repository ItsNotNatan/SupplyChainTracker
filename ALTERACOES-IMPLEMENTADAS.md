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
