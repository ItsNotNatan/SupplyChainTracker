# Atualização — semáforos dos prazos

## Arquivos incluídos no pacote de substituição

Copie mantendo os mesmos caminhos:

- `src/componentes/ModalDetalhes.jsx` — mostra o semáforo ao lado de cada marco e aplica a coloração de status aos cards Comerciais.
- `src/utils/processamento.js` — consolida o status das categorias com base nas datas e corrige estados não mapeados.
- `src/utils/statusCronograma.js` — novo utilitário com as regras de comparação das datas.
- `src/estilos.css` — aparência dos semáforos e dos cards verdes/vermelhos/cinzas.

## Regras aplicadas

- Verde: data realizada igual ou anterior à planejada.
- Vermelho: data prevista posterior à planejada. Quando já existe data realizada, realizado posterior ao planejado também é tratado como atraso.
- Cinza: não há dados suficientes para comparação, ou há previsão dentro do planejado mas ainda sem realização.
- Amarelo: não aplicado, pois Felipe ainda precisa definir o significado e o critério.

## Consolidação da cor do card Comercial

- Vermelho se pelo menos um marco que possui dados estiver atrasado.
- Verde se todos os marcos que possuem dados estiverem concluídos dentro do prazo.
- Cinza se não há datas suficientes ou ainda há marcos informados sem realização.

Essa é uma regra conservadora proposta para a interface e deve ser validada com Felipe.

## O que continua pendente por falta de fonte

A tabela já aceita Planejado/Previsto/Realizado para Entrega na COMAU, Criação do P&S e Entrega ao usuário. A importação real dessas datas ainda depende de identificar:

1. Planilha e aba de origem de cada data.
2. Nome/cabeçalho da coluna correspondente.
3. Campo que relaciona a linha da planilha externa com o item/transmissão do Sourcing Plan.

Não foram inventadas fontes nem chaves de relacionamento.

## Validação executada

- Sintaxe JavaScript/JSX validada em 17 arquivos.
- Imports relativos de código verificados.
- Processamento da base de demonstração executado com sucesso.
- Testes de status: realizado antes/no planejado, previsto depois do planejado, previsão dentro do planejado sem realizado, realizado depois do planejado e ausência de datas.
- Testado que `Não mapeado` não é considerado concluído e que `Pendente` continua sendo reconhecido como dado existente.
- O build Vite não foi executado porque o pacote `vite` não está instalado neste ambiente.

## Observação sobre a logo

Este pacote de substituição não contém nem altera `src/assets/logo-comau.png`. Preserve o arquivo de logo que já existe no seu projeto local.
