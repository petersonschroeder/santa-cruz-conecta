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


## Solicitações de novos comércios (fila de moderação)

A seção **Cadastre seu comércio** permite enviar o pedido diretamente pelo formulário, sem precisar abrir o WhatsApp. O WhatsApp continua disponível como alternativa.

**Fluxo:**
1. Visitante informa nome do negócio, categoria, endereço, nome e e-mail de contato. Pode incluir site, telefone comercial e descrição.
2. Após confirmar a autorização de uso dos dados, o navegador faz POST na tabela privada `business_submissions` com a chave pública Supabase e `Prefer: return=minimal`. O visitante não recebe uma cópia dos dados alheios.
3. O novo pedido entra como **pending**. Não é criado um estabelecimento automaticamente.
4. Em `/admin/`, o responsável filtra a fila de **Solicitações de comércios**, examina os dados e pode **Revisar e aprovar**, **Rejeitar** ou **Reabrir** um pedido.
5. Aprovar abre o editor e requer uma URL HTTPS válida; o RPC `approve_business_submission` cria o local e marca o pedido aprovado de forma atômica. A opção **Publicar no portal** determina se o local aparecerá imediatamente ou ficará como rascunho.
6. Rejeições permanecem na fila de histórico e podem ser reabertas.

**Segurança:** RLS impede que visitantes consultem a fila ou alterem solicitações; apenas admins explicitamente incluídos em `admin_users` visualizam os dados. O banco exige os campos permitidos, bloqueia pendências duplicadas por e-mail + negócio e limita o envio a três solicitações por e-mail a cada 24 horas. Essas medidas são proteção básica contra spam; para tráfego público maior, ativar Turnstile e limites de WAF na Cloudflare.

**Privacidade:** [Política de Privacidade](/privacidade.html) acessível no site; dados pessoais do solicitante não são copiados para os cartões públicos. Remoções podem ser realizadas via SQL Editor ou painel administrativo; não existe rotina automática de retenção nesta versão.

**Ativação da fila:** o banco já contém a migração `business_submission_review_queue`; código-fonte em `supabase/migrations/20261116030000_business_submission_review_queue.sql`. O painel exige um usuário Auth autorizado conforme [SECURITY.md](SECURITY.md).



## Dashboard de comércio e links — 16/11/2026

O painel em `/admin/` agora inclui **visão geral comercial**, total de estabelecimentos, publicados, rascunhos, solicitações, cliques registrados nos últimos 30 dias, distribuição por categoria e ranking dos sites mais acessados.

**Curadoria de lojas:** o catálogo foi ampliado com estabelecimentos pesquisados em Santa Cruz do Sul. São `52` locais no momento desta curadoria, incluindo `15` cadastrados em Comércio. A lista das 15 entradas adicionadas, acompanhada da URL fonte, pode ser restaurada pelo arquivo idempotente `supabase/seeds/20261116_comercio_curado.sql`; URLs de fontes ficam no campo `places.source_url`.

**Revisão manual:** cada `places` agora possui `link_review_status` (`pending`, `reviewed`, `needs_review`) e `last_link_reviewed_at`. O painel oferece filtros por categoria, situação de publicação e situação do link, além do botão para abrir a URL, editar a fonte e marcar a conferência. `reviewed` significa que a fonte/site foi conferido editorialmente no momento da curadoria, **não** garantia permanente de disponibilidade.

**Cliques externos:** somente o clique em links de estabelecimento a partir do portal é registrado. A tabela `place_clicks` armazena `place_id` e a data/hora (sem IP, e-mail ou identificador do visitante). O frontend reduz cliques repetidos no mesmo lugar por dez minutos via `sessionStorage`; o banco limita 30 eventos/minuto e 600/dia por estabelecimento como proteção contra consumo abusivo. O relatório `place_click_summary` é legível apenas por administradores. Os números são cliques técnicos, **não visitas únicas ou conversões/vendas**, e podem estar incompletos ou conter interações automatizadas.

**Auditoria recorrente:** o workflow `.github/workflows/audit-links.yml` roda semanalmente às terças e pode ser iniciado manualmente pelo GitHub Actions. Ele acessa com `HEAD` e, se necessário, `GET` os links do catálogo público, sem tentar login, rastrear páginas internas, alterar o Supabase ou marcar automaticamente empresas como fechadas. Os resultados aparecem no **Resumo da execução** do GitHub Actions. HTTP 403, 429, timeout e bloqueios anti-bot exigem conferência manual; só HTTP 404/410 é classificado como possível link quebrado.

Documentos relevantes:
- `supabase/migrations/20261116040000_commercial_link_review_and_click_metrics.sql`
- `supabase/migrations/20261116041000_restrict_click_summary_to_admins.sql`
- `supabase/migrations/20261116042000_click_metrics_public_rate_limits.sql`
- `supabase/seeds/20261116_comercio_curado.sql`
- `scripts/audit-links.mjs` (excluído da publicação pública pela `.assetsignore`)



## Aplicativo Android (beta)

O portal também está disponível em versão Android **beta** (`br.com.santacruzconecta.app`), construída com Java 17 e Android Gradle Plugin 8.9.2. A versão inicial abre o site publicado em uma WebView restrita ao domínio oficial, com HTTPS obrigatório e links de terceiros enviados ao navegador ou aplicativo externo.

- **Página para usuários:** https://santa-cruz-conecta.pepirocha123.workers.dev/baixar-app.html
- **APK beta direto:** https://github.com/petersonschroeder/santa-cruz-conecta/releases/download/android-v1.0.0-beta.1/SantaCruzConecta-beta.apk
- **Lançamento verificável:** https://github.com/petersonschroeder/santa-cruz-conecta/releases/tag/android-v1.0.0-beta.1
- **Código-fonte:** `android/`.
- **Compilação automática:** `.github/workflows/android-apk.yml` — Gradle `assembleDebug`, artefato temporário no Actions e APK beta no GitHub Releases.

Para instalar no Android 8.0 ou superior: abra a página de download, baixe o APK e confirme a instalação, autorizando a fonte do download somente quando solicitado. O app necessita de internet; não requer acesso à câmera, localização ou contatos.

**Importante:** o APK beta usa uma **assinatura de depuração criada pelo runner do GitHub**. Não é a versão final para Play Store, e futuras atualizações poderão exigir reinstalação. Para produção, gerar e guardar com segurança uma chave de assinatura permanente (fora do repositório e do chat) e configurar build assinado. Jamais compartilhar o arquivo keystore ou sua senha em mensagens.

### Indicadores do APK no painel administrativo

O dashboard mostra separadamente:
- **Downloads do APK no GitHub:** número da API pública GitHub Releases (`download_count` do arquivo). É mais próximo dos downloads do arquivo, mas não comprova que a instalação terminou.
- **Cliques em baixar na página:** solicitações iniciadas por visitantes pela página `/baixar-app.html`, registradas na tabela `android_download_events`, sem dados pessoais. Inclui total, últimos sete dias e últimos trinta dias. Um bloqueio de rede ou fechamento da página pode impedir registro. Um filtro de sessão reduz cliques duplicados por dois minutos.
- **Limites:** 60 eventos por minuto e 2.000 por dia por versão, via trigger em schema privado. Registro público por coluna e RLS, visualização somente de administradores. Não interpretar os dados como usuários únicos, instalações concluídas ou uso ativo do app.

Novas versões devem publicar um novo tag/asset no GitHub Releases com a assinatura definitiva. Ao atualizar a versão, revisar o link e o `app_version` em `baixar-app.html` e `assets/download.js`, a página do dashboard e sua integração com a API do GitHub.

