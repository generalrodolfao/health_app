# language: pt-BR
Funcionalidade: Autenticação e Perfis
  Como um usuário do HealthApp
  Eu quero me autenticar e gerenciar meu perfil
  Para acessar as funcionalidades de forma segura

  Contexto:
    Dado que estou na página inicial do HealthApp

  Cenário: Registrar nova conta
    Dado que não tenho cadastro
    Quando clico em "Criar Conta"
    E preencho:
      | Campo       | Valor                    |
      | Nome        | "Maria Silva"            |
      | Email       | "maria@email.com"        |
      | Senha       | "********"               |
      | CPF         | "123.456.789-00"         |
      | Data Nasc.  | "15/03/1990"             |
    E aceito os termos de uso
    Então recebo email de confirmação
    E posso fazer login imediatamente

  Cenário: Login com email e senha
    Dado que tenho uma conta ativa
    Quando informo email e senha corretos
    Então sou autenticado
    E redirecionado para o dashboard
    E meu token JWT é armazenado no httpOnly cookie

  Cenário: Recuperar senha
    Dado que esqueci minha senha
    Quando clico em "Esqueci minha senha"
    E informo meu email
    Então recebo email com link de redefinição (válido por 1h)
    E posso criar uma nova senha

  Cenário: Perfil do usuário
    Dado que estou autenticado
    Quando acesso "Meu Perfil"
    Então vejo e posso editar:
      - Informações pessoais (nome, email, telefone, data nasc.)
      - Contato de emergência (nome, telefone, parentesco)
      - Plano de saúde (operadora, número, validade)
      - Preferências de notificação (email, push, SMS)
      - Tipo de conta (Pessoa Física / Empresa)

  Cenário: Perfil empresarial
    Dado que sou gestor de uma empresa
    Quando acesso "Configurações da Empresa"
    Então posso gerenciar:
      - CNPJ, razão social, porte
      - Colaboradores (convidar, remover, listar)
      - Módulos ativos (NR-1, Checkups, Mapa)
      - Configurar periodicidade de checkups obrigatórios
      - Definir exames obrigatórios por cargo

  @critical
  Cenário: 2FA (Autenticação de dois fatores)
    Dado que ativei 2FA nas configurações
    Quando faço login
    Então além de email/senha, solicito código do authenticator
    E após validar, acesso é concedido

  Cenário: Deletar conta (LGPD)
    Dado que quero excluir minha conta
    Quando acesso "Privacidade e Dados"
    E confirmo a exclusão da conta
    Então meus dados são anonimizados em 30 dias
    E recebo confirmação por email
