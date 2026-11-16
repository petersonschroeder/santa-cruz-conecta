# Segurança e operação — Santa Cruz Conecta

## Modelo de acesso
- **Visitantes (anon)** podem ler **apenas** estabelecimentos com `is_published = true`; não podem editar nada.
- **Usuários logados comuns** só podem ler registros publicados.
- **Administradores** precisam estar no Supabase Auth **e** possuir uma linha em `public.admin_users`. O painel faz a verificação de UI, mas quem realmente autoriza INSERT/UPDATE/DELETE são as políticas RLS do banco.
- `public.admin_users` só permite que o próprio usuário consulte sua associação; escrita via API pública não é permitida.
- **Logos**: bucket público `brand-logos` com uploads limitados a PNG, JPG e WebP (2 MB), graváveis apenas por administradores. Não envie fotos pessoais com metadados EXIF ou arquivos de terceiros sem permissão.
- Chave `sb_publishable_...` no JS é pública por design. **Nunca** publique `sb_secret_...`, `service_role`, senha do banco, token do Cloudflare ou cookies de sessão.

## Habilitar primeiro administrador (ação obrigatória)
No momento da implementação o projeto estava sem usuários Auth. O cadastro de login exige uma ação do proprietário; não há credenciais compartilhadas por chat.

1. Abra [Supabase Authentication → Users](https://supabase.com/dashboard/project/vlsntcyvfdvaynxxstor/auth/users) e clique em **Add user** / **Invite user**. Cadastre seu e-mail pessoal autorizado, configure uma senha longa/única ou siga o convite.
2. Verifique se a conta foi realmente criada na lista de usuários. O e-mail precisa estar confirmado conforme suas configurações de Auth.
3. Abra [SQL Editor](https://supabase.com/dashboard/project/vlsntcyvfdvaynxxstor/sql/new) com a conta proprietária do projeto e execute **somente após substituir** o e-mail:

```sql
insert into public.admin_users (user_id)
select id from auth.users
where lower(email) = lower('SEU_EMAIL_AQUI')
on conflict (user_id) do nothing;
```

4. Confirme que o comando inseriu 1 linha, ou consulte:
```sql
select u.email, a.created_at
from public.admin_users a
join auth.users u on u.id=a.user_id;
```
5. Entre por [Painel /admin/](https://santa-cruz-conecta.pepirocha123.workers.dev/admin/).

**Para revogar um administrador**, use o SQL Editor:
```sql
delete from public.admin_users where user_id = (
  select id from auth.users where lower(email)=lower('EMAIL_A_REVOGAR')
);
```
Depois revogue também as sessões na interface Authentication, quando disponível. Revogar o papel bloqueia as políticas RLS imediatamente para as próximas requisições.

## Configurações adicionais no painel Supabase (não controláveis pelo conector usado)
- Authentication → Providers / Email: desabilitar **cadastro público de novas contas**, caso o portal não ofereça cadastro a visitantes; usar convites administrativos.
- Habilitar confirmação por e-mail e limitar expiração de links/OTP a 1 hora ou menos.
- Senha forte, autenticação multifator na conta que administra o dashboard Supabase. MFA no login interno do portal exigirá uma etapa de interface adicional, caso você decida exigi-la.
- Revisar rate limits do Supabase Auth e ajustar política de proteção de dados antes do crescimento. Não colocar service role em secrets públicos.
- Utilizar SMTP próprio apenas quando enviar convites/e-mails de Auth em produção com maior volume.

## Proteções Cloudflare aplicadas no repositório
- `_headers`: CSP sem scripts inline arbitrários ou `eval`, proteção contra clickjacking, HSTS, política de permissões do navegador e `nosniff`.
- `/admin/*`: `X-Robots-Tag: noindex` e `Cache-Control: no-store`.
- `.assetsignore`: não publicar via Workers arquivos de migração, README, testes, configuração do Wrangler, pastas de CI e segredos.
- `wrangler.jsonc`: Worker de assets estáticos (com mesmo nome de serviço).
- `.github/workflows/security.yml`: testes no push e PR, usando checkout fixado por SHA e token de leitura.
- O HTML e JS de `/admin/` são públicos, **mas o acesso a dados e ações é protegido pelo Supabase Auth + RLS**. Não confunda página de login pública com autorização.

## Verificações operacionais após o deploy
1. Em DevTools → Network, confira **`Content-Security-Policy`**, `X-Frame-Options`, `X-Content-Type-Options` e `Strict-Transport-Security` na resposta HTML da página principal.
2. Confira o mesmo para `/admin/` e o cabeçalho `X-Robots-Tag: noindex`.
3. Verifique que `/supabase/migrations/20261116020000_harden_directory_public_access.sql` e `/README.md` respondem 404 na Cloudflare (mesmo sendo arquivos do repositório GitHub).
4. Despublique um lugar de teste na tabela e confirme que ele desaparece do portal em uma atualização da página.
5. Rode o [Security Advisor](https://supabase.com/dashboard/project/vlsntcyvfdvaynxxstor/advisors/security) periodicamente.
6. Consulte o [GitHub Actions](https://github.com/petersonschroeder/santa-cruz-conecta/actions) após cada alteração.

## Limites desta auditoria
Foram analisados código-fonte, grants/RLS, configuração do deploy e checks automatizados. Isso **não é um pentest completo**: não houve varredura ativa do endpoint público com scanner DAST, pentest autenticado no navegador com uma conta admin real, checagem de vulnerabilidades de todos os domínios externos, nem comprovação dos cabeçalhos finais em todos os pontos da rede Cloudflare. Revalide após atualizar os deploys.

Referências: [Supabase Production Checklist](https://supabase.com/docs/guides/security/production-checklist), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) e [Cloudflare Workers Headers](https://developers.cloudflare.com/workers/static-assets/headers/).


## Entrada pública de solicitações (novembro/2026)

- Tabela `public.business_submissions`: `RLS ENABLED`. O papel `anon` recebe somente `INSERT` nas colunas de formulário, sem `SELECT`, `UPDATE` ou `DELETE`.
- Usuários autenticados que **não** estão em `admin_users` não podem visualizar os pedidos. Somente administradores podem listar e moderar.
- Aprovação acontece pelo RPC **SECURITY INVOKER** `public.approve_business_submission`, sem uso de `service_role`; valida vínculo com `admin_users`, exige pedido pendente e publica o novo estabelecimento na mesma transação.
- Trigger de inserção bloqueia mais de três indicações por e-mail em 24 horas, e índice único evita pedidos pendentes duplicados do mesmo e-mail para o mesmo comércio. Isso não é uma defesa completa contra bots que usam vários e-mails.
- Página `/privacidade.html` descreve os dados, as finalidades e o contato para acesso/correção/exclusão. A equipe deve revisar e eliminar dados que não precisem mais permanecer.
- **Antes de ampliar o tráfego**, configurar Cloudflare Turnstile com validação **server-side**, regras de rate limiting no WAF e monitoramento de abuso. Não considerar uma validação somente client-side como proteção eficaz.
- Nunca incluir e-mail/nome do solicitante no catálogo público. O formulário indica o telefone como sendo do comércio, sujeito a revisão pelo administrador.

### Verificação funcional sugerida

1. Enviar uma indicação teste pelo site.
2. Confirmar que a linha está em `business_submissions` com `status='pending'` e que **não** aparece em `places`.
3. Fazer login com um administrador cadastrado e revisar a indicação.
4. Rejeitar ou aprovar a indicação; ao aprovar, fornecer site HTTPS válido e escolher publicação.
5. Confirmar que o status e o identificador do novo local foram preenchidos após a aprovação.
6. Testar conta sem permissão e leitura anônima: ambas devem receber acesso negado à fila.
7. Apagar os dados de teste.



## Curadoria comercial e contagem de cliques

- O banco `place_clicks` usa RLS: visitantes podem apenas inserir o `place_id` de estabelecimento publicado. Não podem consultar, corrigir ou excluir eventos.
- A visão `place_click_summary` usa `security_invoker=true`, está disponível apenas para sessões autenticadas e devolve linhas somente quando o usuário consta em `admin_users`. Não há `service_role` no JavaScript público.
- Eventos gravam apenas código de estabelecimento e horário do clique. Não representam pessoas, visualizações únicas nem vendas. Deduplicação client-side é apenas aproximada. A função de guarda de inserções está no schema **não exposto** `app_private` e impõe limites de 30/minuto e 600/dia por loja.
- URLs são conferidas manualmente pelo administrador ou pelo relatório da auditoria semanal passiva; resultados HTTP 403/429 podem ser causados por bloqueios e não provam indisponibilidade.
- O relatório de links automatizado tem acesso somente de leitura às URLs e à API pública, usando chave `sb_publishable_`. Não possui credenciais privilegiadas ou permissão para publicar/ocultar estabelecimentos.
- A política de privacidade informa a contagem agregada de cliques. Se o projeto crescer, criar política de retenção dos eventos e avaliar mecanismos anti-bot e relatórios escaláveis.
- **Conferir em Supabase Auth → Security:** o Security Advisor detectou proteção contra senhas vazadas desabilitada. Avalie habilitá-la quando disponível no seu plano e mantenha MFA na conta administradora.

