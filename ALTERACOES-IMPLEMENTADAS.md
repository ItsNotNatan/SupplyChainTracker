# Alterações implementadas — SupplyChainTracker

## Interface e navegação

- Renomeado o filtro antigo de WBS para **Projeto**.
- Substituído o campo de busca por **Procurar por palavra chave**.
- Mantidos exatamente quatro filtros: texto livre (palavra chave), projeto, linha e operação.
- Removidos os blocos Purchasing e Delivery, o botão Detalhamento e o status global das transmissões.
- Reorganizado o fluxo em quatro classes: **Engenharia**, **Comerciais**, **Construtivos** e **Manufatura**.
- Padronizados os cartões de transmissão com Projeto, Linha, Operação, Qtd, ID e Descrição.
- Os status das classes são apresentados por ícones, sem os textos de status nas caixas.
- Mantidos os quatro indicadores de resumo (total, em andamento, atrasadas/em risco e concluídas), calculados sobre o resultado dos filtros; não há um status global exibido em cada transmissão.
- Criada tela inicial com acesso às áreas Supply Chain e Banco de dados.
- Adicionado retorno à tela inicial pelo cabeçalho.
- Criado estado vazio no Supply Chain com atalho para a área de carregamento.
- Removido o texto “ERP COMAU” do cabeçalho.
- Uniformizados os traços e destaques decorativos em um único azul (`#054A9A`), sem gradientes azul/roxo; o tom é uma aproximação visual e deve ser conferido com o manual oficial da marca, caso disponível.

## Engenharia

- Unificadas as engenharias Mecânica e de Controles dentro de uma única caixa **Engenharia**, com duas subdivisões internas clicáveis: **Mec** e **Controles**.
- Mecânica: Desenho 3D, Desenho 2D, Lista de materiais mecânicos e Revisão.
- Controles: Projeto elétrico, Lista de materiais de controles, Topográfico, Lista de identificações e Layout de calha.
- Horas estimadas removidas da interface de Engenharia.
- Estratégia removida de Engenharia e apresentada em Manufatura.

## Materiais comerciais e construtivos

- Criadas classes separadas para materiais **Comerciais** e **Construtivos**.
- Campos apresentados: quantidade, descrição, referência, fabricante (Comerciais) ou fornecedor (Construtivos), status da liberação, Nº da RC e Nº da PO.
- Cada classe apresenta os marcos Liberação, Inserção de tarefa, Requisição e Pedido com Planejado, Previsto e Realizado.
- Preparados campos de data simples para Data de entrega na COMAU, Data da criação do P&S e Data de entrega ao usuário; a origem e a associação com outras planilhas ainda precisam ser definidas.
- Criadas as etiquetas verdes **Antecipação** e **Já antecipado**; ambas classificam o item como Comercial.
- Removida a geração artificial de números RC/PO quando os dados não existem.

## Manufatura

- Campos: Estratégia, Montagem mecânica, Medição 3D, Bordo-máquina, Inspeção da qualidade e Controle de processo.
- Entrega do dispositivo apresentada com datas Planeado, Previsto e Realizado.

## Importação e tratamento

- Reconhecida a aba/arquivo **Sourcing Plan**, inclusive variações usuais do nome.
- Leitura por cabeçalho para os campos de materiais; como fallback, classificação na coluna B e transmissão na coluna M.
- Leitura de cabeçalhos agrupados em mais de uma linha para datas Plan/Prev/Real.
- Mantida compatibilidade com as abas antigas Comerciais e PRPO.
- Ajustada a deduplicação para não descartar linhas sem referência e descrição.
- Atualizado o exemplo de demonstração para contemplar Comerciais, Construtivos e as duas etiquetas de antecipação.
- Reconhecida a origem PCP Manufacturing, com fallback para a coluna L (transmissão) e AP (agenda/semana de entrega) quando os cabeçalhos não forem identificados.

## Pontos que ainda dependem das planilhas de origem

- **Sourcing Plan real:** o arquivo de código e as anotações da reunião foram enviados, mas a planilha real não. A leitura foi preparada com sinônimos de cabeçalho e fallback B/M; os nomes e posições definitivos precisam ser conferidos com o arquivo real.
- **Dados complementares:** o modelo já possui os campos de Data de entrega na COMAU, Data da criação do P&S e Data de entrega ao usuário, além de Fornecedor para Construtivos. A associação efetiva com outras planilhas ainda depende de definir arquivos/abas, colunas e a chave de relacionamento.
- **Nome legível do Projeto:** o sistema usa uma coluna explícita de nome de projeto quando existe; caso contrário, usa Cliente como alternativa para evitar exibir o código WBS. Para mostrar o nome oficial de cada projeto, é necessário fornecer a coluna ou tabela de correspondência.
- Campos não encontrados na base aparecem sem informação/como “Não mapeado”; o sistema não inventa datas ou números.

## Conferência desta revisão

- Conferidos os quatro filtros e os rótulos exigidos.
- Removido o indicador global do cabeçalho.
- O fornecedor de itens construtivos permanece nos dados do material e também aparece no cartão da transmissão quando houver informação disponível.
- Duplicatas de um mesmo construtivo são consolidadas para preservar mais de um fornecedor associado ao item.
- A importação reconhece também abas PCP Manufacturing; a coluna L (índice 11) e a coluna AP (índice 41) são usadas como fallback quando os cabeçalhos não identificam transmissão/data. A semana no formato WK-xx é preservada como texto, sem conversão para uma data inventada.
- Ajustadas as subdivisões da Engenharia para **Mec** e **Controles**, com seleção clicável individual.
- Antecipação e Já antecipado passam a prevalecer sobre a classificação Construtivo e são armazenadas como Comerciais.
- Os quatro marcos de materiais mantêm a estrutura Planejado/Previsto/Realizado; as três datas complementares usam um único campo de data cada.
- Testes do processador com a demonstração e planilhas sintéticas: Antecipação/Já antecipado classificados como Comerciais, Construtivo preservado, datas Plan/Prev/Real lidas, dois fornecedores consolidados com RC/PO individuais e semana `WK-06` preservada sem conversão para data.
- Sintaxe dos 15 arquivos `.js`/`.jsx` e resolução dos imports relativos: sem erros.
- **Build Vite:** não executado; `npm install` excedeu o tempo limite neste ambiente. Execute a instalação no seu computador e depois `npm run build`.
- A tela Banco de dados é uma área de preparação/importação; armazenamento compartilhado ainda depende de backend e conexão PostgreSQL.

## Como validar no seu computador

Na pasta do projeto, execute:

```bash
npm install
npm run build
npm run dev
```
