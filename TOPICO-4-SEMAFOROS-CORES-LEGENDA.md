# Tópico 4 — Semáforos, cores e legenda

## Implementado

1. Atualizada `src/utils/statusCronograma.js` para aplicar a ordem de prioridade das regras enviadas pelo Felipe:
   - Vermelho: Realizado vazio e Previsto > Planejado.
   - Verde claro: Realizado > Planejado.
   - Verde escuro: Realizado <= Planejado.
   - Amarelo: Previsto - 7 dias <= Hoje.
   - Cinza: demais condições.
2. A comparação usa somente o dia, sem depender de diferenças de horário. O leitor aceita datas brasileiras, datas ISO, objetos Date e números seriais do Excel. Valores vazios, hífens e "Não mapeado" são tratados como ausência de data.
3. A regra individual foi aplicada aos sete marcos de materiais Comerciais e Construtivos e à tabela existente de Entrega do dispositivo em Manufatura.
4. Os cards individuais de Comerciais e Construtivos passaram a exibir o indicador de status e a cor de borda/fundo derivados dos marcos.
5. Adicionada legenda de cinco cores no modal de detalhes.
6. As tags "Antecipação" e "Já antecipado" mantêm seu fundo atual, mas o texto fica preto.
7. O ícone de relógio dos estados "Em andamento" foi substituído por uma bolinha.
8. Os nomes dos marcos foram atualizados: "Liberação de eng." e "Aprovação do PM". O processamento mantém aliases para continuar reconhecendo cabeçalhos antigos e também os novos.

## Regra de consolidação do card

Para resumir vários marcos na cor geral do material, foi adotada esta prioridade técnica:

- Vermelho se qualquer marco estiver vermelho.
- Amarelo se não houver vermelho e existir algum marco amarelo.
- Verde claro ou verde escuro se todos os marcos que possuem dados estiverem concluídos; verde claro prevalece quando ao menos um foi realizado depois do planejado.
- Cinza nos demais casos.

Essa consolidação é uma regra de apresentação derivada para resumir vários marcos. As regras individuais dos semáforos são as fórmulas diretamente fornecidas pelo cliente.

## Continuidade para os próximos tópicos

- Os entregáveis individuais de Engenharia ainda são exibidos como linhas de informação simples. No tópico de reestruturação da Engenharia, eles serão convertidos em tabela de cronograma e passarão a usar a mesma função de semáforo.
- A estrutura detalhada do cronograma de Manufatura também será feita no tópico específico de Manufatura. A linha atual "Entrega do dispositivo" já usa a regra nova.
- O significado de amarelo foi aplicado conforme a fórmula fornecida: `Previsto - 7 dias <= Hoje`.
