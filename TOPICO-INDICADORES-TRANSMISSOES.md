# Indicadores de status das transmissões

## O que foi incluído

Foram adicionados cinco cartões acima da hierarquia Projeto > Linha > Operação:

1. Total
2. Transmissões em atraso (vermelho)
3. Previsto para próximos 7 dias (amarelo)
4. Concluído em atraso (verde claro)
5. Concluído no prazo (verde escuro)

Cada cartão tem um ícone, quantidade e funciona como filtro. Clicar em um status mostra somente as transmissões daquela categoria; clicar em Total retorna à listagem completa dentro dos filtros de palavra-chave, Projeto, Linha e Operação que já estiverem aplicados.

## Como a contagem é calculada

A contagem considera transmissões únicas (IDs), não a quantidade de marcos. Para cada transmissão, a classificação agrega os marcos com datas disponíveis em:

- materiais Comerciais e Construtivos;
- entregáveis de Engenharia (Mecânica e Controls);
- Entrega do dispositivo da Manufatura.

Prioridade da classificação da transmissão:

1. Vermelho: pelo menos um marco está vermelho.
2. Amarelo: não há marco vermelho e pelo menos um marco está amarelo.
3. Verde claro: todos os marcos que têm datas estão concluídos e pelo menos um foi realizado depois do Planejado.
4. Verde escuro: todos os marcos que têm datas estão concluídos no prazo.
5. Cinza: demais condições ou ausência de datas suficientes.

A caixa Total inclui também as transmissões cinzas. Como não foi solicitada uma sexta caixa cinza, a soma dos quatro status coloridos pode ser menor que Total.

## Comportamento dos filtros

- Os números acompanham a busca por palavra-chave e os filtros Projeto, Linha e Operação.
- Os números não mudam quando se clica em um cartão de status; assim o usuário ainda consegue comparar as quantidades enquanto filtra a árvore.
- Os cartões de status são filtros de seleção única. Clicar novamente no status ativo ou em Total remove o filtro de status.

## Arquivos modificados

- `src/paginas/Visualizacao.jsx`: cálculo das contagens, cartões clicáveis e filtro por status.
- `src/utils/statusCronograma.js`: consolidação dos marcos em um status da transmissão.
- `src/estilos.css`: layout responsivo e cores dos cinco cartões.

## Validações

- 18 arquivos JS/JSX passaram pela verificação sintática.
- Imports relativos de código e CSS foram verificados.
- Chaves do CSS estão balanceadas.
- A função de status foi testada para vermelho, amarelo, verde claro, verde escuro, cinza e prioridade do vermelho.

O build Vite completo não foi executado neste ambiente. O pacote-fonte recebido não contém `src/assets/logo-comau.png`; ao copiar o projeto completo, preserve a logo já existente no seu ambiente local.
