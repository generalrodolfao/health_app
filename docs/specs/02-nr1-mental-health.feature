# language: pt-BR
Funcionalidade: Compliance NR-1 - Saúde Mental Ocupacional
  Como um gestor de RH/empresa
  Eu quero gerenciar riscos psicossociais dos colaboradores
  Para estar em conformidade com a NR-1 (atualização maio/2025)

  Contexto:
    Dado que a empresa possui o plano Business ou Enterprise
    E o módulo NR-1 está ativado

  Cenário: Realizar avaliação de riscos psicossociais
    Dado que estou no módulo NR-1
    Quando clico em "Nova Avaliação Psicossocial"
    E seleciono o departamento "TI"
    Então o sistema distribui o questionário padrão NR-1 para todos do departamento
    E cada colaborador recebe notificação para responder

  Cenário: Questionário de fatores de risco psicossociais
    Dado que recebi a notificação para avaliar riscos
    Quando acesso o questionário NR-1
    Então respondo às dimensões:
      | Dimensão                | Exemplo de Pergunta                              |
      | Exigências Psicológicas | "Com que frequência você tem que trabalhar rápido?"|
      | Controle sobre Trabalho | "Você tem influência sobre suas tarefas?"         |
      | Apoio Social            | "Você recebe apoio dos colegas quando precisa?"   |
      | Compensações            | "Seu salário é justo para o trabalho que faz?"    |
      | Violência/Assédio       | "Você presenciou situações de assédio no trabalho?"|
    E minhas respostas são anônimas para o gestor
    Mas identificadas para o sistema

  Cenário: Gerar relatório de riscos psicossociais
    Dado que 80% do departamento respondeu ao questionário
    Quando acesso "Relatórios NR-1"
    Então vejo:
      | Indicador              | TI    | Empresa | Risco  |
      | Risco Alto Estresse    | 15%   | 12%     | Médio  |
      | Satisfação Geral       | 72%   | 78%     | Baixo  |
      | Risco Burnout          | 8%    | 5%      | Alto   |
    E o sistema sugere ações corretivas baseadas nos resultados

  Cenário: Plano de Ação NR-1
    Dado que identifiquei risco alto de Burnout no departamento TI
    Quando clico em "Criar Plano de Ação"
    Então o sistema sugere:
      | Ação                          | Prazo     | Responsável      |
      | Sessões de mindfulness        | Imediato  | RH + Psicólogo   |
      | Redução de horas extras       | 30 dias   | Gestor TI        |
      | Programa de apoio psicológico | 15 dias   | RH               |
    E posso aprovar e atribuir cada ação

  Cenário: Dashboard de acompanhamento NR-1
    Dado que tenho ações em andamento
    Quando acesso o dashboard NR-1
    Então vejo indicadores em tempo real:
      - Colaboradores avaliados: 234/300 (78%)
      - Riscos críticos: 2 (Burnout, Assédio)
      - Ações concluídas: 5/12
      - Próxima avaliação: 25/06/2026
    E o sistema alerta se alguma ação está atrasada

  Cenário: Histórico de conformidade para fiscalização
    Dado que preciso comprovar conformidade NR-1
    Quando acesso "Histórico de Conformidade"
    Então vejo um relatório exportável contendo:
      - Avaliações realizadas por período
      - Ações implementadas com evidências
      - Participação dos trabalhadores
      - Assinatura digital dos responsáveis

  @critical
  Cenário: Integração com afastamentos (CAT)
    Dado que um colaborador apresentou risco crítico
    Quando o psiquiatra emite recomendação de afastamento
    Então o sistema registra o afastamento com CID-F
    E gera notificação para o setor de SST
    E o contador de dias de afastamento é atualizado

  Cenário: Anonimização garantida por LGPD
    Dado que um colaborador respondeu ao questionário
    Quando o gestor acessa os resultados individuais
    Então as respostas são agregadas (mínimo 5 pessoas por grupo)
    E respostas individuais são visíveis apenas ao sistema e ao psicólogo
