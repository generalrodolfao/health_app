# language: pt-BR
Funcionalidade: Acompanhamento de Checkups Anuais
  Como um usuário do HealthApp
  Eu quero gerenciar meus exames e consultas anuais
  Para não esquecer nenhum checkup importante

  Contexto:
    Dado que estou logado no sistema
    E meu perfil está completo com dados de saúde

  Cenário: Criar um novo checkup anual
    Dado que estou na página "Meus Checkups"
    Quando clico em "Novo Checkup Anual"
    E seleciono os exames:
      | Exame                  | Profissional       |
      | Checkup Geral          | Clínico Geral      |
      | Limpeza e Avaliação    | Dentista           |
      | Exame de Sangue        | Laboratório        |
      | Eletrocardiograma      | Cardiologista      |
    E defino a data alvo como "2026-03-15"
    Então o sistema cria o checkup com status "Pendente"
    E cada exame aparece como item individual com status "Pendente"
    E recebo notificação "Checkup anual criado com sucesso"

  Cenário: Marcar exame como concluído
    Dado que existe um checkup com exames pendentes
    Quando acesso os detalhes do checkup
    E clico em "Concluir" no exame "Exame de Sangue"
    E anexo o resultado (PDF opcional)
    Então o exame fica com status "Concluído"
    E o progresso do checkup é atualizado para 25%

  Cenário: Visualizar linha do tempo anual
    Dado que tenho checkups de anos anteriores
    Quando acesso "Histórico de Checkups"
    Então vejo uma linha do tempo com:
      | Ano | Status     | Exames Concluídos |
      | 2025 | Completo  | 4/4              |
      | 2024 | Completo  | 3/4              |
      | 2023 | Incompleto| 2/4              |

  Cenário: Receber lembretes automáticos
    Dado que existe um checkup com data alvo em 30 dias
    Quando o sistema processa notificações
    Então recebo um email "Seu checkup anual está chegando!"
    E uma notificação no app "Faltam 30 dias para seu checkup"

  Cenário: Compartilhar resultados com profissional
    Dado que tenho exames concluídos
    Quando seleciono "Compartilhar Resultados"
    E informo o email "dr.felipe@clinica.com"
    Então o profissional recebe um link seguro com validade de 7 dias
    E o acesso é registrado no log de auditoria

  Cenário: Categorizar exames por tipo
    Dado que estou criando um checkup
    Quando seleciono os exames
    Então vejo categorias:
      | Categoria       | Exemplos                                   |
      | Rotina          | Sangue, Urina, Fezes                       |
      | Cardiovascular  | Eletro, Eco, Holter                        |
      | Visão           | Fundo de olho, Tonometria                  |
      | Dental          | Limpeza, Raio-X, Canal                     |
      | Mental          | Avaliação psicológica, Triagem             |
      | Preventivo      | Papanicolau, PSA, Mamografia               |

  @critical
  Cenário: Empresa vinculada - visão do RH
    Dado que sou gestor de RH de uma empresa
    Quando acesso o dashboard da empresa
    Então vejo o checklist de saúde dos funcionários:
      | Funcionário | Checkup 2026 | Dental | Geral | Mental |
      | Maria       | 75%          | OK     | OK    | Pend.  |
      | João        | Completo     | OK     | OK    | OK     |
    E posso exportar relatório em PDF
