# language: pt-BR
Funcionalidade: Onboarding e Checkup Anual
  Como um usuário
  Eu quero criar meu checkup anual com exames personalizados
  Para não esquecer nenhum exame importante

  Cenário: Onboarding — selecionar categorias de saúde
    Dado que acabei de me cadastrar
    Quando acesso o onboarding
    Então vejo categorias de saúde com ícones:
      | Categoria       | Ícone | Exemplos                              |
      | Cardiovascular  | ❤️    | Eletro, Eco, Pressão arterial         |
      | Rotina          | 🩸    | Hemograma, Glicemia, Colesterol       |
      | Dental          | 🦷    | Limpeza, Raio-X, Avaliação            |
      | Visão           | 👁️    | Fundo de olho, Tonometria             |
      | Prevenção       | 🛡️    | Papanicolau, PSA, Mamografia          |
      | Saúde Mental    | 🧠    | Avaliação psicológica, Triagem        |
    E posso selecionar múltiplas categorias
    E ao confirmar, o sistema cria um plano de checkup personalizado

  Cenário: Criar checkup anual com exames pré-definidos
    Dado que completei o onboarding
    Quando o sistema gera meu plano
    Então vejo exames organizados por categoria
    E cada exame mostra: nome, profissional, frequência recomendada
    E posso desmarcar exames que não se aplicam
    E posso adicionar exames personalizados
    E ao confirmar, o checkup é criado com status "Em andamento"

  Cenário: Visualizar dashboard de checkup
    Dado que tenho um checkup ativo
    Quando acesso o dashboard
    Então vejo um anel de progresso mostrando X% concluído
    E vejo "N/M exames concluídos"
    E vejo o próximo exame pendente destacado
    E vejo atalhos para NR-1 e Mapa da Saúde

  Cenário: Marcar exame como concluído
    Dado que tenho exames pendentes
    Quando clico no checkbox do exame "Hemograma"
    Então o exame fica riscado com status "Concluído"
    E a data de conclusão é registrada automaticamente
    E o progresso do checkup é recalculado
    E se todos os exames estão concluídos, o checkup fica "Completo"

  Cenário: Desmarcar exame concluído
    Dado que um exame está "Concluído"
    Quando clico no checkbox novamente
    Então o exame volta para "Pendente"
    E a data de conclusão é removida
    E se o checkup estava "Completo", volta para "Em andamento"

  Cenário: Adicionar exame a checkup existente
    Dado que tenho um checkup para o ano atual
    Quando clico em "Adicionar exame"
    E seleciono um exame da lista
    Então o exame é adicionado ao checkup com status "Pendente"
    E o progresso é recalculado

  Cenário: Criar checkup para ano diferente
    Dado que tenho um checkup para 2026
    Quando clico em "Novo Checkup"
    E seleciono o ano 2027
    E escolho os exames
    Então o checkup para 2027 é criado

  Cenário: Histórico de checkups de anos anteriores
    Dado que tenho checkups de 2024 e 2025 concluídos
    Quando acesso a página de checkups
    Então vejo uma seção "Anos Anteriores"
    E cada checkup mostra ano, progresso e status
    E posso clicar para ver os detalhes

  Cenário: Estado vazio — sem checkups
    Dado que sou um novo usuário sem checkups
    Quando acesso a página de checkups
    Então vejo um estado vazio com ilustração
    E um botão "Criar meu primeiro checkup"
    E chips com modelos sugeridos (Checkup Completo, Básico, Cardio)

  @critical
  Cenário: Template de checkup rápido
    Dado que estou criando um checkup
    Quando seleciono o template "Checkup Completo"
    Então todos os exames de todas as categorias são marcados
    E posso desmarcar o que não preciso
    E o botão "Criar" mostra o total de exames selecionados
