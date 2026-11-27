# Tópico 5 — Engenharia

## O que mudou

- As informações anteriores de Mecânica e Controls foram substituídas por duas tabelas chamadas **Cronograma de acompanhamento**.
- Mecânica contém: Desenho 3D, Desenho 2D e Lista de materiais mecânicos.
- Controls contém: Projeto elétrico, Lista de materiais de controls, Topográfico, Lista de identificações e Layout de calhas.
- Cada entregável apresenta semáforo individual, Planejado, Previsto, Realizado e ícone de link.
- O status geral de Engenharia foi retirado do cabeçalho da seção e do card de Engenharia na navegação superior. Os status de cada entregável permanecem.
- Os mesmos critérios do utilitário `statusCronograma.js` (Tópico 4) são usados nos entregáveis. Sem datas suficientes, o semáforo fica cinza.
- O texto/valor antigo do entregável continua disponível em uma linha secundária abaixo do nome quando existe na fonte.

## Leitura dos dados

- Mecânica é lida prioritariamente da planilha Follow up.
- Controls é lida prioritariamente do PCP de Manufacturing.
- O processador procura colunas com os nomes dos entregáveis combinados a `Plan/Planejado`, `Prev/Previsto` e `Real/Realizado`.
- O link pode vir de uma coluna identificada como `Link`, `URL`, `Hyperlink`, `Arquivo` ou `Documento` associada ao entregável, ou de um endereço presente diretamente na célula do entregável.
- Na importação de arquivos Excel, `App.jsx` agora preserva o destino de hyperlinks das células para o processamento. Por segurança, só são aceitos endereços `http` ou `https`.
- Quando a fonte não contém uma URL válida, o ícone aparece desabilitado e informa que o link não está disponível. Nenhum destino é inventado.

## Arquivos alterados

- `src/App.jsx`: preservação de hyperlinks em células do Excel durante a importação.
- `src/componentes/ModalDetalhes.jsx`: tabelas de Engenharia, semáforos individuais, datas e ícones de link.
- `src/componentes/ArvoreHierarquia.jsx`: remoção do status geral do card de Engenharia.
- `src/utils/processamento.js`: estrutura de dados dos entregáveis, leitura de datas triplas, links e tratamento de células Excel com hyperlink.
- `src/estilos.css`: layout das tabelas e estilos dos ícones de link.

## Limitação da validação

As planilhas reais de Follow up e PCP não foram fornecidas junto desta etapa. O mapeamento foi testado com dados sintéticos que simulam colunas dos entregáveis, datas triplas e hyperlinks Excel. A confirmação dos nomes/posições reais das colunas e dos destinos de links depende da importação das planilhas utilizadas pela equipe.

## Testes executados

- Sintaxe dos 18 arquivos JavaScript/JSX: aprovada.
- Estrutura do CSS: aprovada.
- Imports locais: aprovados, exceto a imagem COMAU que deve continuar no projeto local do usuário.
- Processamento de demonstração: aprovado.
- Teste sintético de datas Planejado/Previsto/Realizado e hyperlinks: aprovado.
- Build completo do Vite: não executado neste ambiente porque as dependências do projeto não estão instaladas.
