# Ajuste da visualização — Projeto > Linha > Operação

## O que foi alterado

1. A tela de visualização deixou de apresentar uma grade plana de transmissões e passou a agrupar os registros na hierarquia:
   - Projeto
   - Linha
   - Operação (OP)
   - Cards das transmissões pertencentes à operação
2. Cada nível apresenta seu nome e uma contagem de transmissões.
3. Os grupos são ordenados por nome, usando ordenação numérica/localizada em português.
4. Os filtros existentes (palavra-chave, Projeto, Linha e Operação) continuam funcionando antes da montagem da hierarquia.
5. O carregamento progressivo/paginação de transmissões foi preservado.
6. Nos cards de transmissão, foram removidas as tags Projeto, Linha e Operação, pois os dados já aparecem nos agrupamentos externos.
7. O nome completo da transmissão continua como título, sem o prefixo `ID:` e sem caixa ao redor.
8. A quantidade continua visível no card.

## Arquivos alterados

- `src/paginas/Visualizacao.jsx`
- `src/componentes/CardTransmissao.jsx`
- `src/estilos.css`

## Observação

Este pacote altera somente a visualização hierárquica e os metadados exibidos nos cards de transmissão. Não altera o processamento das planilhas, os semáforos, a Engenharia ou a Manufatura.
