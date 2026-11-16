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
    "label": "Lojas & comércio",
    "icon": "store",
    "description": "Moda, casa e tecnologia",
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
// Dados dos estabelecimentos são carregados do banco com RLS. Não manter cache estático de registros despublicados.
window.SC_PLACES = [];
