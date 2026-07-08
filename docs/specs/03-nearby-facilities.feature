# language: pt-BR
Funcionalidade: Mapa de Farmácias e Hospitais Próximos
  Como um usuário do HealthApp
  Eu quero encontrar farmácias e hospitais próximos
  Para ter acesso rápido a serviços de saúde

  Contexto:
    Dado que estou logado no sistema
    E permiti o acesso à minha localização

  Cenário: Visualizar mapa com unidades próximas
    Dado que estou na página "Mapa da Saúde"
    Quando o sistema detecta minha localização
    Então vejo um mapa com marcadores para:
      | Tipo       | Ícone | Cor   |
      | Hospital   | 🏥    | Verm. |
      | Farmácia   | 💊    | Verde |
      | Clínica    | 🏨    | Azul  |
    E cada marcador mostra nome e distância ao clicar

  Cenário: Buscar por tipo de unidade
    Dado que estou no mapa
    Quando seleciono o filtro "Farmácias"
    Então apenas farmácias são exibidas no mapa
    E a lista lateral mostra as 10 mais próximas ordenadas por distância

  Cenário: Detalhes da unidade
    Dado que cliquei em um marcador no mapa
    Quando visualizo o popup de detalhes
    Então vejo:
      - Nome: "Farmácia São João"
      - Endereço: "Rua Augusta, 1500"
      - Telefone: "(11) 99999-8888"
      - Aberto: 07:00 - 22:00
      - Distância: "1.2 km"
      - Nota: 4.5 ★ (230 avaliações)
    E posso clicar para "Ligar" ou "Abrir no Waze"

  Cenário: Calcular rota
    Dado que selecionei uma unidade
    Quando clico em "Como Chegar"
    Então o sistema abre o roteiro no Google Maps/Waze
    Com a localização de origem e destino preenchidas

  Cenário: Farmácias de plantão (24h)
    Dado que são 23:00
    Quando busco por farmácias
    Então farmácias 24h aparecem destacadas com selo "24H"
    E são priorizadas no resultado

  @critical
  Cenário: Emergência - hospital mais próximo
    Dado que estou em situação de emergência
    Quando clico em "Emergência"
    Então o sistema identifica o hospital mais próximo com pronto-socorro
    E exibe:
      - Nome do hospital
      - Distância e tempo estimado
      - Botão "Ligar para SAMU (192)"
      - Botão "Compartilhar localização com contato de emergência"

  Cenário: Avaliar unidade
    Dado que visitei uma unidade
    Quando acesso a página da unidade
    E clico em "Avaliar"
    Então posso dar nota de 1 a 5
    E deixar um comentário opcional
    E minha avaliação é publicada após moderação

  Cenário: Cadastro de novas unidades (admin)
    Dado que sou administrador do sistema
    Quando acesso "Gerenciar Unidades"
    Então posso:
      - Adicionar nova unidade (nome, endereço, tipo, coordenadas)
      - Editar informações de horário e telefone
      - Importar em lote via CSV/JSON
      - Ativar/desativar unidades no mapa

  @critical
  Cenário: Fallback sem geolocalização
    Dado que não autorizei o acesso à localização
    Quando acesso o mapa
    Então o sistema exibe um campo de busca por CEP/endereço
    E funciona com geocodificação reversa via Nominatim
