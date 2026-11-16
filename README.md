# Santa Cruz Conecta

Portal-guia independente de **Santa Cruz do Sul (RS)**, responsivo, sem dependências de compilação e com links externos pesquisados em novembro de 2026.

## Como executar

**Mais simples:** abra `index.html` no Chrome, Firefox, Edge ou Safari. A busca, os filtros, as categorias e os favoritos já funcionam sem servidor.

**Servidor local (opcional):** dentro da pasta do projeto, rode:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## Estrutura

```text
santa-cruz-conecta/
├── index.html                  # Página, SEO, navegação, semântica e seções
├── assets/
│   ├── styles.css              # Design responsivo desktop/tablet/celular
│   ├── app.js                  # Busca, filtros, favoritos e renderização
│   ├── data.js                 # Catálogo editável e categorias
│   ├── logo.svg                # Identidade visual original do portal
│   ├── catedral.svg            # Ilustração autoral da Catedral
│   ├── tunel.svg               # Ilustração autoral do Túnel Verde
│   └── brands/                 # 37 ícones/monogramas editoriais originais
└── README.md
```

### Recursos já funcionais

- Layout fluido para celular, tablet e desktop.
- Pesquisa com normalização de acentos; filtra nome, descrição, endereço e palavras-chave.
- Filtros por **11 categorias** e ordenação.
- Destaques editoriais, links externos e caminhos para visualizar locais no Google Maps quando um endereço está disponível.
- Favoritos no navegador (`localStorage`) e filtro de favoritos.
- Navegação por teclado, links externos seguros (`rel="noopener noreferrer"`), URLs HTTPS e `aria-labels`.
- Catálogo com **37 entradas** selecionadas; indica quando um link é de um **guia público**, em vez de fingir ser site próprio do estabelecimento.
- Ilustrações e identidade visual original; sem dependência de banco de dados, sem cookies analíticos.

### Cadastrando um novo local

Edite `assets/data.js` e acrescente um objeto ao array `window.SC_PLACES`. Campos essenciais:

```js
{
  "id": "meu-negocio",
  "name": "Meu Negócio",
  "category": "restaurantes",
  "description": "Descrição breve, informativa e verificada.",
  "url": "https://www.exemplo.com.br/",
  "linkType": "site", // ou "guia" / "canais"
  "featured": false,
  "subtitle": "Restaurante • Santa Cruz do Sul",
  "address": "Rua Exemplo, 100, Centro",
  "phone": "",
  "tags": ["almoço", "jantar"],
  "mark": "MN"
}
```

Crie também `assets/brands/meu-negocio.svg`; use `assets/brands/miller.svg` como base e personalize as letras. Para adicionar categoria, acrescente uma chave em `window.SC_CATEGORIES` (em `data.js`) e seu ícone em `iconPaths` (em `app.js`).

### Cloudflare Pages + Supabase (recomendado)

**Cloudflare Pages**: importe `petersonschroeder/santa-cruz-conecta`, selecione branch `main` e use **Framework preset: None**, **Build command: em branco**, **Build output directory: `/`** (raiz do repositório). O arquivo `index.html` está na raiz; não precisa de Node ou build. A cada commit na `main`, o Pages publica novamente.

**Supabase**: use um projeto dedicado e siga o [guia do banco](supabase/README.md). Os arquivos públicos `assets/supabase-config.js` e `assets/supabase-loader.js` permitem ativar o banco sem alterar o layout. Enquanto não configurar a chave pública, o diretório usa os 37 registros locais.

Não insira no GitHub chaves secretas, `service_role`, senhas ou tokens administrativos. As políticas RLS permitem somente consulta pública dos locais publicados.

### Publicar na internet

**GitHub Pages:** crie um repositório, envie o conteúdo da pasta (com `index.html` na raiz), vá em **Settings → Pages → Build and deployment → Deploy from a branch** e selecione `main`/`root`.

**Netlify:** arraste a pasta para a área de deploy do Netlify; não precisa rodar `npm install`.

**Vercel:** importe o repositório como projeto estático e use os padrões da plataforma, sem `build`.

## Limitações e cuidados

Esta é uma **primeira curadoria, não o cadastro completo de todos os negócios da cidade**. A presença de redes nacionais indica unidades em Santa Cruz do Sul, não que a sede nacional esteja na cidade. Links e páginas externas podem mudar a qualquer momento; revalide periodicamente. Nem todos os estabelecimentos têm um site próprio: nesses casos, o botão direciona para um guia público ou canais oficiais, assim identificado.

Os mini-logotipos criados aqui são **monogramas editoriais originais** para identificar os cartões; **não são logotipos oficiais** nem implicam parceria com as marcas. Para exibir logotipos oficiais em uma versão comercial, use ativos autorizados pelos titulares.

Não coletamos dados pessoais ou favoritos em servidor: as preferências ficam no navegador do visitante.

## Evolução para uma plataforma maior

1. Migrar catálogo para banco de dados (Supabase/PostgreSQL) e criar painel de aprovação editorial.
2. Cadastrar campos de geolocalização, contatos, horário, acessibilidade e proveniência verificáveis.
3. Desenvolver formulários de indicação e correção com moderação e política de privacidade.
4. Implementar checagem agendada de links quebrados e datas de última verificação.
5. Adicionar mapa com dados geocodificados, páginas de detalhes, sitemap dinâmico e busca de produção.
6. Definir regras de destaque/monetização identificando claramente conteúdos patrocinados.

## Fontes de referência principais

- Prefeitura e Turismo: https://www.santacruz.rs.gov.br/servicos/servicos-para-o-turista
- Guia estadual: https://www.turismo.rs.gov.br/turismo/municipio/visitar/328
- Guia gastronômico estadual: https://www.turismo.rs.gov.br/turismo/municipio/comer/328
- Rodoviária: https://rodoviariasantacruz.com.br/
- Oktoberfest: https://www.oktober.com.br/
- Comércio e outros setores: sites listados no próprio catálogo em `assets/data.js`.

**Data da curadoria inicial:** 15 de novembro de 2026.
