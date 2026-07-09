# language: pt-BR
Funcionalidade: Dashboard Principal
  Como um usuário
  Eu quero ver um resumo da minha saúde em um dashboard
  Para entender rapidamente o que preciso fazer

  Cenário: Dashboard com dados reais
    Dado que tenho checkups e avaliações NR-1
    Quando acesso o dashboard
    Então vejo 4 cards principais:
      | Card                | Conteúdo                                    |
      | Progresso Checkup   | Anel de progresso %, X/Y exames concluídos  |
      | Próximo Exame       | Nome do exame + profissional                |
      | Saúde Mental        | Último score NR-1 + nível de risco          |
      | Unidade Mais Próxima| Nome + distância da farmácia/hospital       |
    E vejo atalhos rápidos para todas as funcionalidades

  Cenário: Dashboard sem dados — estado vazio guiaido
    Dado que sou novo sem nenhum dado
    Quando acesso o dashboard
    Então vejo cards com estado vazio
    E cada card tem um CTA claro:
      - "Criar checkup" → /checkups
      - "Fazer avaliação" → /nr1
      - "Ver mapa" → /map
      - "Completar perfil" → /profile

  Cenário: Dashboard com erro de API
    Dado que a API está indisponível
    Quando acesso o dashboard
    Então vejo uma mensagem "Não foi possível carregar seus dados"
    E um botão "Tentar novamente"
