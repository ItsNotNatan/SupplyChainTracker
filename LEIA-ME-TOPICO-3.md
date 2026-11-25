# Tópico 3 — Busca unificada dos materiais

## O que mudou

- Removido o painel interno de filtros dos materiais.
- Removidos os filtros separados de Fabricante/Construtivos, Nº da RC e Nº da PO.
- Criado um único campo de palavra-chave compartilhado entre as listas Comerciais e Construtivos.
- A pesquisa procura em todos os valores dos objetos de materiais, inclusive valores em estruturas aninhadas como datas, tags e status.
- A busca ignora diferenças entre maiúsculas/minúsculas e acentos.
- Quando as duas categorias estão visíveis, o mesmo termo filtra as duas listas simultaneamente.
- Os seletores principais de Comerciais e Construtivos foram preservados para permitir visualizar uma categoria por vez.
- A paginação e a escolha de itens por página foram mantidas separadas por categoria.

## Arquivos alterados

- `src/componentes/ModalDetalhes.jsx`
- `src/estilos.css`

## Como testar

1. Abra uma transmissão que tenha materiais Comerciais e Construtivos.
2. Deixe as duas categorias visíveis.
3. Digite uma referência, fabricante, fornecedor, número de RC, número de PO, descrição, tag ou termo que esteja em uma data.
4. Confira que o mesmo campo filtra ambas as listas.
5. Clique no seletor Comercial ou Construtivo e confirme que a busca continua funcionando para a categoria selecionada.
6. Apague o texto pelo botão de limpar ou pela tecla Backspace e confirme que todos os itens voltam.

## Observação

Os seletores grandes de categoria foram mantidos. Foram removidos somente os filtros internos separados e seu painel, conforme a interpretação de “remover essas subcaixas”.
