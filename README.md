# Santa Cruz Conecta

Guia digital independente de **Santa Cruz do Sul (RS)**. Reúne estabelecimentos, turismo, notícias, gastronomia, hotéis, educação e serviços em um portal responsivo, com filtros, favoritos e links externos.

**Produção:** https://santa-cruz-conecta.pepirocha123.workers.dev/

**Admin (requer conta autorizada):** https://santa-cruz-conecta.pepirocha123.workers.dev/admin/

**Supabase:** projeto `vlsntcyvfdvaynxxstor`, São Paulo (`sa-east-1`).

## Arquitetura

```text
Cloudflare Workers + Static Assets
  ├─ /index.html           portal (11 categorias)
  ├─ /assets/             CSS, JavaScript, logo e ícones
  └─ /admin/              painel com Supabase Auth
              │
              ▼
Supabase PostgreSQL ─ tabela places, RLS, admin_users
Supabase Storage    ─ bucket brand-logos
Supabase Auth       ─ contas autorizadas
```

A tabela `places` contém 37 estabelecimentos iniciais publicados. O catálogo público é carregado **diretamente do Supabase**, sem uma cópia estática de registros removidos. Caso o banco não responda, o portal informa indisponibilidade do catálogo em vez de reexibir locais despublicados.

- **Visitante:** consulta somente estabelecimentos publicados, com links HTTPS.
- **Usuário autenticado comum:** também só consulta publicados.
- **Administrador:** após inclusão explícita na tabela `admin_users`, pode cadastrar, alterar, excluir, destacar e publicar/despublicar locais pelo painel.
- **Imagens:** o painel permite enviar PNG, JPG e WebP (máximo 2 MB). Quando não há logotipo enviado, o portal tenta buscar o favicon do domínio e usa monograma original como fallback.

## Ativar o primeiro administrador

Antes de fazer login em `/admin/`, é preciso **criar um usuário Auth** e **autorizar seu UID na tabela admin_users**. Veja o procedimento documentado em [SECURITY.md](SECURITY.md#habilitar-primeiro-administrador-ação-obrigatória).

Não crie o primeiro usuário diretamente em `auth.users` com SQL e não cole senhas, tokens ou chaves privadas em conversas.

## Desenvolvimento local

É um projeto estático, sem dependências de build; use um servidor para testar o Supabase no navegador:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000/`. Não é necessário executar Node para servir o site; o Node.js é utilizado apenas nos testes de qualidade.

```bash
node --test tests/security.test.mjs
```

## Publicação Cloudflare

O repositório possui `wrangler.jsonc` com o Worker `santa-cruz-conecta`, usando `assets.directory = "."`. O deploy existente é feito pela integração GitHub/Cloudflare com `npx wrangler deploy`. A cada commit na branch `main`, o serviço conectado pode disparar uma nova implantação.

- `_headers` define **CSP**, HSTS, `nosniff`, proteção contra iframe/clickjacking e outras políticas.
- `.assetsignore` exclui migrações SQL, docs, arquivos de trabalho e testes do pacote de assets públicos.
- `robots.txt` e cabeçalhos `/admin/*` evitam indexação do painel (isso não substitui login).
- `.github/workflows/security.yml` realiza testes automáticos em pushes e pull requests.

**Verifique sempre o último deploy da Cloudflare** e o navegador em `/admin/`. O GitHub Actions testa o código, mas não comprova sozinho que um deploy Cloudflare terminou.

## Estrutura resumida

```text
index.html
_headers
.assetsignore
wrangler.jsonc
robots.txt
assets/
  app.js                 interface e navegação
  styles.css             design responsivo
  data.js                categorias (sem cópia estática dos estabelecimentos)
  supabase-config.js     URL + chave publishable, dados públicos
  supabase-loader.js     consulta de places com leitura pública
  brands/*.svg           monogramas editoriais e fallback de imagem
admin/
  index.html
  admin.css
  admin.js
supabase/
  migrations/*.sql
.github/workflows/security.yml
tests/security.test.mjs
SECURITY.md
```

## Segurança e permissões

As autorizações de escrita são validadas pelo PostgreSQL com **Row Level Security (RLS)**; esconder o botão no frontend não confere segurança. O browser recebe exclusivamente a chave pública `sb_publishable_...`. **Nunca publicar** `sb_secret_...`, `service_role` ou senhas.

Consulte [SECURITY.md](SECURITY.md) para recomendações de Auth, testes, limites da auditoria, inspeção dos headers no Cloudflare e procedimento para revogar administradores.

## Curadoria e propriedade intelectual

O projeto começou com 37 locais em 11 categorias, com dados pesquisados em novembro de 2026. Não constitui uma lista completa ou continuamente atualizada de empresas do município. Muitos links levam a guias públicos, não a sites oficiais; revise URLs e endereços com frequência.

Os monogramas locais são editoriais, **não marcas oficiais**. Para utilizar logotipos completos das empresas, dê preferência a imagens autorizadas pelo titular ou a favicons disponibilizados pelos próprios sites e respeite direitos de uso e atribuição.

Referências da curadoria: [Prefeitura](https://www.santacruz.rs.gov.br/servicos/servicos-para-o-turista), [Turismo RS](https://www.turismo.rs.gov.br/turismo/municipio/visitar/328), [Oktoberfest](https://www.oktober.com.br/), [Rodoviária](https://rodoviariasantacruz.com.br/).

## Novo visual e atendimento (novembro de 2026)

O frontend foi refinado para computador e celular com maior contraste, novos estados de foco, cartões e categoria com mais destaque, seção editorial para comerciantes e botão flutuante de WhatsApp.

- **WhatsApp de atendimento:** `+55 (51) 99995-3049`, aberto por links `https://wa.me/5551999953049`.
- **Indique seu comércio:** botões no cabeçalho, menu mobile, rodapé e seção especial abrem `#businessDialog` (diálogo nativo).
- **Dados coletados no formulário:** nome, categoria, endereço, contato, rede social, telefone e descrição. Os campos obrigatórios são validados no navegador.
- **Fluxo de envio:** o botão abre o WhatsApp com uma mensagem preenchida. A pessoa precisa confirmar o envio no WhatsApp. O formulário **não** grava pedidos automaticamente no Supabase e **não** publica estabelecimento sem revisão editorial.
- **Privacidade:** sem cadastro público no Supabase; as informações preenchidas são processadas apenas no navegador até o usuário decidir enviar a mensagem pelo WhatsApp.
- **Manutenção do contato:** atualizar o telefone nos links de `index.html` e na constante `CONTACT_WHATSAPP` de `assets/app.js`, e executar `node --test tests/security.test.mjs`.
