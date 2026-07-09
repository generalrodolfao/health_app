# language: pt-BR
Funcionalidade: Mapa de Unidades de Saúde Próximas
  Como um usuário
  Eu quero encontrar farmácias, hospitais e clínicas reais perto de mim
  Para ter acesso rápido a serviços de saúde

  Cenário: Ver mapa com unidades reais do OpenStreetMap
    Dado que permiti acesso à minha localização
    Quando acesso a página do mapa
    Então o sistema consulta a Overpass API (OpenStreetMap)
    E vejo um mapa com marcadores para unidades reais:
      | Tipo       | Cor   | Ícone |
      | Hospital   | Verm. | 🏥    |
      | Farmácia   | Verde | 💊    |
      | Clínica    | Azul  | 🏨    |
    E vejo um marcador "Você está aqui" na minha localização
    E cada marcador tem popup com nome, endereço e distância

  Cenário: Filtrar por tipo de unidade
    Dado que estou no mapa
    Quando seleciono o filtro "Farmácias"
    Então apenas farmácias aparecem no mapa e na lista
    E o filtro ativo fica destacado

  Cenário: Lista de unidades ordenada por distância
    Dado que há unidades próximas
    Então vejo uma lista lateral com:
      - Nome da unidade
      - Tipo (badge colorido)
      - Distância em km
      - Telefone (se disponível)
      - Selo "24h" (se aplicável)
    E a lista está ordenada da mais próxima para a mais distante

  Cenário: Modo Emergência
    Dado que estou no mapa
    Quando clico em "Emergência"
    Então o sistema busca o hospital mais próximo num raio de 20km
    E destaca o hospital no mapa com um marcador especial
    E mostra um banner com:
      - Nome e endereço do hospital
      - Distância
      - Botão "Ligar SAMU 192"
    E o hospital destacado NÃO é sobrescrito pela lista normal

  Cenário: Sem geolocalização — buscar por endereço
    Dado que não permiti acesso à localização
    Quando vejo o mapa
    Então vejo um aviso "Localização desativada"
    E vejo um campo de busca por endereço/CEP
    Quando digito "Rua Augusta, São Paulo"
    Então o mapa centraliza no endereço buscado
    E mostra unidades ao redor

  Cenário: Popup do marcador com detalhes
    Dado que vejo marcadores no mapa
    Quando clico em um marcador
    Então vejo um popup com:
      - Nome
      - Endereço completo
      - Telefone (se disponível)
      - Horário de funcionamento (se disponível)
      - Distância
      - Selo 24h (se aplicável)

  Cenário: Erro ao carregar — fallback gracioso
    Dado que a Overpass API está indisponível
    Quando carrego o mapa
    Então vejo as unidades do banco local (se houver)
    E uma mensagem "Alguns resultados podem estar indisponíveis"

  Cenário: Estado vazio — sem unidades próximas
    Dado que não há unidades num raio de 10km
    Então vejo um estado vazio "Nenhuma unidade encontrada"
    E um botão "Aumentar raio de busca"

  @critical
  Cenário: Performance — não travar o mapa
    Dado que há muitas unidades próximas
    Então o sistema limita a 50 resultados
    E o mapa renderiza sem travar
