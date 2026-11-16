// Catálogo inicial pesquisado em novembro de 2026.
// Para incluir um local, adicione um novo objeto com id único.
window.SC_CATEGORIES = {
  "mercados": {
    "label": "Mercados",
    "icon": "shopping-cart",
    "description": "Compras e ofertas",
    "tint": "#f1ebda"
  },
  "farmacias": {
    "label": "Farmácias",
    "icon": "plus",
    "description": "Saúde e bem-estar",
    "tint": "#f9e6e2"
  },
  "restaurantes": {
    "label": "Restaurantes",
    "icon": "utensils",
    "description": "Onde comer bem",
    "tint": "#fff0db"
  },
  "bares": {
    "label": "Bares & cafés",
    "icon": "coffee",
    "description": "Encontros e sabores",
    "tint": "#f1e5fa"
  },
  "turismo": {
    "label": "Turismo",
    "icon": "compass",
    "description": "Explore a cidade",
    "tint": "#e5f4e5"
  },
  "hoteis": {
    "label": "Hotéis",
    "icon": "bed",
    "description": "Onde se hospedar",
    "tint": "#e3f1f8"
  },
  "comercio": {
    "label": "Comércio",
    "icon": "store",
    "description": "Lojas e shopping",
    "tint": "#f3ebdd"
  },
  "educacao": {
    "label": "Educação",
    "icon": "graduation",
    "description": "Aprendizado",
    "tint": "#e9eaf9"
  },
  "noticias": {
    "label": "Notícias",
    "icon": "newspaper",
    "description": "Fique por dentro",
    "tint": "#fce9e4"
  },
  "eventos": {
    "label": "Eventos",
    "icon": "calendar",
    "description": "O que acontece",
    "tint": "#eef3dd"
  },
  "servicos": {
    "label": "Serviços",
    "icon": "landmark",
    "description": "Tudo que ajuda",
    "tint": "#e7f1f1"
  }
};
window.SC_PLACES = [
  {
    "id": "miller",
    "name": "Miller Supermercados",
    "category": "mercados",
    "description": "Compras de mercado, ofertas e praticidade em uma rede com lojas em Santa Cruz.",
    "url": "https://milleronline.com.br/",
    "linkType": "site",
    "featured": true,
    "subtitle": "Supermercado • Compras online",
    "address": "R. Ramiro Barcelos, 747, Centro",
    "phone": "(51) 2106-1350",
    "tags": [
      "compras",
      "entrega",
      "alimentos"
    ],
    "mark": "MI",
    "palette": null,
    "source": "https://milleronline.com.br/"
  },
  {
    "id": "imec",
    "name": "Imec Supermercados",
    "category": "mercados",
    "description": "Loja no Centro para compras do dia a dia, hortifruti, açougue e mercearia.",
    "url": "https://home.superimec.com.br/supermercados/",
    "linkType": "site",
    "featured": false,
    "subtitle": "Supermercado • Loja Centro",
    "address": "R. Borges de Medeiros, 950, Centro",
    "phone": "",
    "tags": [
      "compras",
      "alimentos"
    ],
    "mark": "IM",
    "palette": null,
    "source": "https://home.superimec.com.br/supermercados/"
  },
  {
    "id": "comercial-zaffari",
    "name": "Comercial Zaffari",
    "category": "mercados",
    "description": "Rede de supermercados com unidade na Avenida do Imigrante.",
    "url": "https://comercialzaffari.com.br/",
    "linkType": "site",
    "featured": false,
    "subtitle": "Supermercado • Loja local",
    "address": "Av. do Imigrante, 500, Centro",
    "phone": "",
    "tags": [
      "compras",
      "alimentos"
    ],
    "mark": "CZ",
    "palette": null,
    "source": "https://comercialzaffari.com.br/"
  },
  {
    "id": "tischler",
    "name": "Tischler Supermercados",
    "category": "mercados",
    "description": "Rede regional com presença no Centro de Santa Cruz do Sul.",
    "url": "https://www.tischler.com.br/",
    "linkType": "site",
    "featured": false,
    "subtitle": "Supermercado • Rede regional",
    "address": "R. Assis Brasil, 731, Centro",
    "phone": "",
    "tags": [
      "compras",
      "alimentos"
    ],
    "mark": "TI",
    "palette": null,
    "source": "https://www.tischler.com.br/"
  },
  {
    "id": "panvel",
    "name": "Panvel Farmácias",
    "category": "farmacias",
    "description": "Encontre lojas da cidade, medicamentos, cuidados pessoais e produtos de beleza.",
    "url": "https://www.panvel.com/panvel/nossas-lojas/RS/Santa-Cruz-Do-Sul/Av-Deputado-Euclydes-Nicolau-Kliemann-721/796",
    "linkType": "site",
    "featured": true,
    "subtitle": "Farmácia • Localizador de lojas",
    "address": "",
    "phone": "",
    "tags": [
      "saude",
      "remedios",
      "medicamentos"
    ],
    "mark": "PA",
    "palette": null,
    "source": "https://www.panvel.com/panvel/nossas-lojas/RS/Santa-Cruz-Do-Sul/Av-Deputado-Euclydes-Nicolau-Kliemann-721/796"
  },
  {
    "id": "sao-joao",
    "name": "Farmácias São João",
    "category": "farmacias",
    "description": "Rede de farmácias com catálogo de medicamentos e produtos para a rotina.",
    "url": "https://www.saojoaofarmacias.com.br/",
    "linkType": "site",
    "featured": false,
    "subtitle": "Farmácia • Loja online",
    "address": "",
    "phone": "",
    "tags": [
      "saude",
      "remedios"
    ],
    "mark": "SJ",
    "palette": null,
    "source": "https://www.saojoaofarmacias.com.br/"
  },
  {
    "id": "agafarma",
    "name": "Agafarma",
    "category": "farmacias",
    "description": "Encontre unidades da rede e consulte suas ofertas e serviços.",
    "url": "https://agafarma.com.br/buscarlojas",
    "linkType": "site",
    "featured": false,
    "subtitle": "Farmácia • Encontre uma loja",
    "address": "",
    "phone": "",
    "tags": [
      "saude",
      "remedios"
    ],
    "mark": "AG",
    "palette": null,
    "source": "https://agafarma.com.br/buscarlojas"
  },
  {
    "id": "associadas",
    "name": "Farmácias Associadas",
    "category": "farmacias",
    "description": "Rede associativa com lojas e informações sobre produtos e serviços.",
    "url": "https://www.farmaciasassociadas.com.br/",
    "linkType": "site",
    "featured": false,
    "subtitle": "Farmácia • Rede associativa",
    "address": "",
    "phone": "",
    "tags": [
      "saude",
      "remedios"
    ],
    "mark": "FA",
    "palette": null,
    "source": "https://www.farmaciasassociadas.com.br/"
  },
  {
    "id": "la-fiamma",
    "name": "La Fiamma",
    "category": "restaurantes",
    "description": "Restaurante e pizzaria com sabores italianos, pizzas artesanais e reservas.",
    "url": "https://www.lafiamma.com.br/",
    "linkType": "site",
    "featured": true,
    "subtitle": "Restaurante • Pizzaria",
    "address": "R. Borges de Medeiros, 580, Centro",
    "phone": "(51) 3715-9387",
    "tags": [
      "pizza",
      "gastronomia",
      "delivery"
    ],
    "mark": "LF",
    "palette": null,
    "source": "https://www.lafiamma.com.br/"
  },
  {
    "id": "centenario",
    "name": "Churrascaria Centenário",
    "category": "restaurantes",
    "description": "Tradicional endereço gastronômico no Centro; consulte o guia estadual.",
    "url": "https://www.turismo.rs.gov.br/turismo/municipio/comer/328",
    "linkType": "guia",
    "featured": false,
    "subtitle": "Churrascaria • Guia estadual",
    "address": "R. Tenente Coronel Brito, 405, Centro",
    "phone": "(51) 3713-1495",
    "tags": [
      "churrasco",
      "almoço"
    ],
    "mark": "CC",
    "palette": null,
    "source": "https://www.turismo.rs.gov.br/turismo/municipio/comer/328"
  },
  {
    "id": "guto350",
    "name": "Guto 350",
    "category": "restaurantes",
    "description": "Restaurante da Rua Rio Branco listado no guia oficial de turismo do RS.",
    "url": "https://www.turismo.rs.gov.br/turismo/municipio/comer/328",
    "linkType": "guia",
    "featured": false,
    "subtitle": "Restaurante • Guia estadual",
    "address": "R. Rio Branco, 350",
    "phone": "",
    "tags": [
      "gastronomia"
    ],
    "mark": "G3",
    "palette": null,
    "source": "https://www.turismo.rs.gov.br/turismo/municipio/comer/328"
  },
  {
    "id": "lisaruth",
    "name": "Lisaruth",
    "category": "restaurantes",
    "description": "Opção gastronômica na Linha Pinheiral; veja detalhes no guia estadual.",
    "url": "https://www.turismo.rs.gov.br/turismo/municipio/comer/328",
    "linkType": "guia",
    "featured": false,
    "subtitle": "Restaurante • Guia estadual",
    "address": "RSC-287, km 92, Linha Pinheiral",
    "phone": "",
    "tags": [
      "gastronomia",
      "interior"
    ],
    "mark": "LI",
    "palette": null,
    "source": "https://www.turismo.rs.gov.br/turismo/municipio/comer/328"
  },
  {
    "id": "heilige",
    "name": "Cervejaria Heilige",
    "category": "bares",
    "description": "Cervejaria nascida em Santa Cruz com links para visitas, loja e redes sociais.",
    "url": "https://linktr.ee/cervejariaheilige",
    "linkType": "canais",
    "featured": true,
    "subtitle": "Cervejaria • Canais oficiais",
    "address": "",
    "phone": "",
    "tags": [
      "cerveja",
      "pub",
      "tour"
    ],
    "mark": "HE",
    "palette": null,
    "source": "https://linktr.ee/cervejariaheilige"
  },
  {
    "id": "agridoce",
    "name": "Agridoce Tap Room",
    "category": "bares",
    "description": "Tap room listado no guia turístico estadual; saiba mais sobre o estabelecimento.",
    "url": "https://www.turismo.rs.gov.br/turismo/municipio/comer/328",
    "linkType": "guia",
    "featured": false,
    "subtitle": "Tap room • Guia estadual",
    "address": "R. Marechal Floriano, 248",
    "phone": "",
    "tags": [
      "bar",
      "gastronomia"
    ],
    "mark": "AT",
    "palette": null,
    "source": "https://www.turismo.rs.gov.br/turismo/municipio/comer/328"
  },
  {
    "id": "proeza",
    "name": "Proeza Food & Beer",
    "category": "bares",
    "description": "Gastronomia e ambiente de bar, com endereço no guia estadual.",
    "url": "https://www.turismo.rs.gov.br/turismo/municipio/comer/328",
    "linkType": "guia",
    "featured": false,
    "subtitle": "Bar e gastronomia • Guia estadual",
    "address": "R. Borges de Medeiros, 299",
    "phone": "",
    "tags": [
      "bar",
      "comida"
    ],
    "mark": "PB",
    "palette": null,
    "source": "https://www.turismo.rs.gov.br/turismo/municipio/comer/328"
  },
  {
    "id": "turismo-oficial",
    "name": "Santa Cruz Mais Turística",
    "category": "turismo",
    "description": "Portal oficial para conhecer roteiros, atrativos, hospedagem e experiências.",
    "url": "https://santacruzmaisturistica.com.br/",
    "linkType": "site",
    "featured": true,
    "subtitle": "Turismo • Portal oficial",
    "address": "",
    "phone": "",
    "tags": [
      "atracoes",
      "passeios",
      "roteiros"
    ],
    "mark": "SC",
    "palette": null,
    "source": "https://santacruzmaisturistica.com.br/"
  },
  {
    "id": "catedral",
    "name": "Catedral São João Batista",
    "category": "turismo",
    "description": "Um dos símbolos da cidade: torres imponentes e arquitetura neogótica.",
    "url": "https://www.santacruz.rs.gov.br/municipio/catedral-sao-joao-batista",
    "linkType": "guia",
    "featured": false,
    "subtitle": "Patrimônio • Página da Prefeitura",
    "address": "R. Ramiro Barcelos, s/n, Centro",
    "phone": "",
    "tags": [
      "igreja",
      "historia",
      "arquitetura"
    ],
    "mark": "CB",
    "palette": null,
    "source": "https://www.santacruz.rs.gov.br/municipio/catedral-sao-joao-batista"
  },
  {
    "id": "parque-oktoberfest",
    "name": "Parque da Oktoberfest",
    "category": "turismo",
    "description": "Espaço central de encontros, esportes e grandes eventos da cidade.",
    "url": "https://www.santacruz.rs.gov.br/conteudo/parque-da-oktoberfest",
    "linkType": "guia",
    "featured": false,
    "subtitle": "Parque • Página da Prefeitura",
    "address": "R. Galvão Costa, 755, Centro",
    "phone": "",
    "tags": [
      "eventos",
      "lazer"
    ],
    "mark": "PO",
    "palette": null,
    "source": "https://www.santacruz.rs.gov.br/conteudo/parque-da-oktoberfest"
  },
  {
    "id": "tunel-verde",
    "name": "Túnel Verde",
    "category": "turismo",
    "description": "O corredor de árvores da Rua Marechal Floriano, um cartão-postal da cidade.",
    "url": "https://santacruz.rs.gov.br/conteudo/tunel-verde",
    "linkType": "guia",
    "featured": false,
    "subtitle": "Passeio • Página da Prefeitura",
    "address": "R. Marechal Floriano, Centro",
    "phone": "",
    "tags": [
      "natureza",
      "centro",
      "passeio"
    ],
    "mark": "TV",
    "palette": null,
    "source": "https://santacruz.rs.gov.br/conteudo/tunel-verde"
  },
  {
    "id": "lago-dourado",
    "name": "Lago Dourado",
    "category": "turismo",
    "description": "Área para caminhadas, corridas e pedaladas ao redor do reservatório.",
    "url": "https://www.santacruz.rs.gov.br/municipio/lago-dourado",
    "linkType": "guia",
    "featured": false,
    "subtitle": "Natureza • Página da Prefeitura",
    "address": "ERS-409, saída para Vera Cruz",
    "phone": "",
    "tags": [
      "natureza",
      "esporte",
      "passeio"
    ],
    "mark": "LD",
    "palette": null,
    "source": "https://www.santacruz.rs.gov.br/municipio/lago-dourado"
  },
  {
    "id": "fritz-frida",
    "name": "Bonecos Fritz e Frida",
    "category": "turismo",
    "description": "Personagens que celebram as tradições germânicas e a Oktoberfest.",
    "url": "https://www.santacruz.rs.gov.br/conteudo/bonecos-fritz-e-frida",
    "linkType": "guia",
    "featured": false,
    "subtitle": "Cultura • Página da Prefeitura",
    "address": "Acesso Grasel, RS-287",
    "phone": "",
    "tags": [
      "cultura",
      "historia",
      "oktoberfest"
    ],
    "mark": "FF",
    "palette": null,
    "source": "https://www.santacruz.rs.gov.br/conteudo/bonecos-fritz-e-frida"
  },
  {
    "id": "parque-santa-cruz",
    "name": "Parque da Santa Cruz",
    "category": "turismo",
    "description": "Natureza, paredões e mirante com vista para a cidade.",
    "url": "https://www.santacruz.rs.gov.br/municipio/parque-da-santa-cruz",
    "linkType": "guia",
    "featured": false,
    "subtitle": "Mirante • Página da Prefeitura",
    "address": "R. Guatambú, Monte Verde",
    "phone": "",
    "tags": [
      "trilha",
      "natureza",
      "mirante"
    ],
    "mark": "PC",
    "palette": null,
    "source": "https://www.santacruz.rs.gov.br/municipio/parque-da-santa-cruz"
  },
  {
    "id": "atracoes-rs",
    "name": "Atrações de Santa Cruz",
    "category": "turismo",
    "description": "Veja outras atrações cadastradas no portal de turismo do Rio Grande do Sul.",
    "url": "https://www.turismo.rs.gov.br/turismo/municipio/visitar/328",
    "linkType": "guia",
    "featured": false,
    "subtitle": "Turismo • Guia estadual",
    "address": "",
    "phone": "",
    "tags": [
      "passeios",
      "atracoes"
    ],
    "mark": "RS",
    "palette": null,
    "source": "https://www.turismo.rs.gov.br/turismo/municipio/visitar/328"
  },
  {
    "id": "charrua",
    "name": "Charrua Hotel",
    "category": "hoteis",
    "description": "Hospedagem no Centro, na Rua Marechal Floriano, perto de atrações da cidade.",
    "url": "https://www.charruahotel.com.br/",
    "linkType": "site",
    "featured": true,
    "subtitle": "Hospedagem • Hotel",
    "address": "R. Marechal Floriano, 230, Centro",
    "phone": "(51) 3715-6533",
    "tags": [
      "hospedagem",
      "reservas"
    ],
    "mark": "CH",
    "palette": null,
    "source": "https://www.charruahotel.com.br/"
  },
  {
    "id": "aguas-claras",
    "name": "Hotel Águas Claras",
    "category": "hoteis",
    "description": "Hotel em região arborizada da cidade, com opções de lazer e hospedagem.",
    "url": "https://www.hotelaguasclaras.com.br/",
    "linkType": "site",
    "featured": false,
    "subtitle": "Hospedagem • Hotel",
    "address": "R. Capitão Pedro Werlang, 420",
    "phone": "(51) 3713-3144",
    "tags": [
      "hospedagem",
      "reservas"
    ],
    "mark": "AC",
    "palette": null,
    "source": "https://www.hotelaguasclaras.com.br/"
  },
  {
    "id": "hospedagem-rs",
    "name": "Onde ficar em Santa Cruz",
    "category": "hoteis",
    "description": "Outras opções de pousadas e hospedagens no catálogo turístico estadual.",
    "url": "https://www.turismo.rs.gov.br/turismo/municipio/ficar/328",
    "linkType": "guia",
    "featured": false,
    "subtitle": "Hospedagem • Guia estadual",
    "address": "",
    "phone": "",
    "tags": [
      "hospedagem",
      "pousadas"
    ],
    "mark": "RS",
    "palette": null,
    "source": "https://www.turismo.rs.gov.br/turismo/municipio/ficar/328"
  },
  {
    "id": "shopping",
    "name": "Shopping Santa Cruz",
    "category": "comercio",
    "description": "Lojas, alimentação, cinema e lazer em um só centro de compras.",
    "url": "https://www.shoppingsantacruz.com.br/",
    "linkType": "site",
    "featured": false,
    "subtitle": "Comércio • Shopping",
    "address": "Av. Senador Alberto Pasqualini, 18",
    "phone": "",
    "tags": [
      "lojas",
      "cinema",
      "compras"
    ],
    "mark": "SH",
    "palette": null,
    "source": "https://www.shoppingsantacruz.com.br/"
  },
  {
    "id": "unisc",
    "name": "Universidade de Santa Cruz do Sul",
    "category": "educacao",
    "description": "Instituição comunitária de ensino, pesquisa e extensão com sede na cidade.",
    "url": "https://www.unisc.br/pt/",
    "linkType": "site",
    "featured": false,
    "subtitle": "Educação • Universidade",
    "address": "Av. Independência, 2293, Universitário",
    "phone": "",
    "tags": [
      "universidade",
      "faculdade",
      "cursos"
    ],
    "mark": "UN",
    "palette": null,
    "source": "https://www.unisc.br/pt/"
  },
  {
    "id": "gaz",
    "name": "Portal GAZ",
    "category": "noticias",
    "description": "Jornalismo e notícias de Santa Cruz do Sul e dos Vales do Rio Pardo e Taquari.",
    "url": "https://www.gaz.com.br/",
    "linkType": "site",
    "featured": false,
    "subtitle": "Notícias • Imprensa regional",
    "address": "",
    "phone": "",
    "tags": [
      "jornal",
      "informacao",
      "gazeta"
    ],
    "mark": "GZ",
    "palette": null,
    "source": "https://www.gaz.com.br/"
  },
  {
    "id": "arauto",
    "name": "Portal Arauto",
    "category": "noticias",
    "description": "Notícias, acontecimentos e cobertura da região de Santa Cruz.",
    "url": "https://portalarauto.com.br/",
    "linkType": "site",
    "featured": false,
    "subtitle": "Notícias • Imprensa regional",
    "address": "",
    "phone": "",
    "tags": [
      "jornal",
      "informacao"
    ],
    "mark": "AR",
    "palette": null,
    "source": "https://portalarauto.com.br/"
  },
  {
    "id": "oktoberfest",
    "name": "Oktoberfest Santa Cruz",
    "category": "eventos",
    "description": "Conheça a grande celebração cultural germânica e a programação oficial.",
    "url": "https://www.oktober.com.br/",
    "linkType": "site",
    "featured": true,
    "subtitle": "Evento • Site oficial",
    "address": "R. Galvão Costa, 755, Centro",
    "phone": "",
    "tags": [
      "festa",
      "cultura",
      "oktoberfest",
      "shows"
    ],
    "mark": "OK",
    "palette": null,
    "source": "https://www.oktober.com.br/"
  },
  {
    "id": "prefeitura",
    "name": "Prefeitura de Santa Cruz",
    "category": "servicos",
    "description": "Acesse serviços públicos, notícias, secretarias e atendimento ao cidadão.",
    "url": "https://www.santacruz.rs.gov.br/",
    "linkType": "site",
    "featured": false,
    "subtitle": "Serviços públicos • Portal oficial",
    "address": "",
    "phone": "",
    "tags": [
      "governo",
      "municipio",
      "cidade"
    ],
    "mark": "PM",
    "palette": null,
    "source": "https://www.santacruz.rs.gov.br/"
  },
  {
    "id": "hospital-santa-cruz",
    "name": "Hospital Santa Cruz",
    "category": "servicos",
    "description": "Informações sobre atendimentos, especialidades e serviços de saúde.",
    "url": "https://www.hospitalstacruz.com.br/",
    "linkType": "site",
    "featured": false,
    "subtitle": "Saúde • Hospital",
    "address": "R. Fernando Abott, 174, Centro",
    "phone": "(51) 3713-7400",
    "tags": [
      "hospital",
      "saude",
      "emergencia"
    ],
    "mark": "HS",
    "palette": null,
    "source": "https://www.hospitalstacruz.com.br/"
  },
  {
    "id": "rodoviaria",
    "name": "Rodoviária de Santa Cruz",
    "category": "servicos",
    "description": "Horários, contatos e informações da estação rodoviária da cidade.",
    "url": "https://rodoviariasantacruz.com.br/",
    "linkType": "site",
    "featured": false,
    "subtitle": "Transporte • Rodoviária",
    "address": "",
    "phone": "",
    "tags": [
      "onibus",
      "viagem",
      "transporte"
    ],
    "mark": "RO",
    "palette": null,
    "source": "https://rodoviariasantacruz.com.br/"
  },
  {
    "id": "passagens",
    "name": "Passagens da Rodoviária",
    "category": "servicos",
    "description": "Consulte viagens intermunicipais e compre passagens pelo portal.",
    "url": "https://santacruz.passagensweb.com.br/Principal",
    "linkType": "site",
    "featured": false,
    "subtitle": "Transporte • Venda de passagens",
    "address": "",
    "phone": "",
    "tags": [
      "onibus",
      "passagens",
      "viagem"
    ],
    "mark": "PV",
    "palette": null,
    "source": "https://santacruz.passagensweb.com.br/Principal"
  },
  {
    "id": "cdl",
    "name": "CDL Santa Cruz do Sul",
    "category": "servicos",
    "description": "Câmara de Dirigentes Lojistas: iniciativas, campanhas e oportunidades.",
    "url": "https://cdlsantacruzdosul.com.br/",
    "linkType": "site",
    "featured": false,
    "subtitle": "Entidade • Comércio local",
    "address": "",
    "phone": "",
    "tags": [
      "comercio",
      "negocios",
      "empresas"
    ],
    "mark": "CD",
    "palette": null,
    "source": "https://cdlsantacruzdosul.com.br/"
  },
  {
    "id": "aci",
    "name": "ACI Santa Cruz",
    "category": "servicos",
    "description": "Associação Comercial e Industrial: informações, eventos e conexões empresariais.",
    "url": "https://acisantacruz.org.br/",
    "linkType": "site",
    "featured": false,
    "subtitle": "Entidade • Negócios",
    "address": "",
    "phone": "",
    "tags": [
      "empresa",
      "empreendedorismo"
    ],
    "mark": "AI",
    "palette": null,
    "source": "https://acisantacruz.org.br/"
  }
];
