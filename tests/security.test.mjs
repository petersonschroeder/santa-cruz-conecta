import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Script } from 'node:vm';

const read=path=>readFileSync(new URL('../'+path, import.meta.url),'utf8');

test('scripts públicos são JavaScript válido',()=>{
  for(const path of ['assets/data.js','assets/supabase-config.js','assets/supabase-loader.js','assets/app.js','admin/admin.js']) {
    assert.doesNotThrow(()=>new Script(read(path),{filename:path}),path);
  }
});

test('CSP forte e hash válido para dados estruturados',()=>{
  const headers=read('_headers');
  const html=read('index.html');
  const match=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match,'dados estruturados JSON-LD');
  const hash=createHash('sha256').update(match[1],'utf8').digest('base64');
  assert.ok(headers.includes("'sha256-"+hash+"'"),'hash CSP deve corresponder ao HTML');
  for(const rule of ["default-src 'none'","frame-ancestors 'none'","object-src 'none'","connect-src 'self' https://vlsntcyvfdvaynxxstor.supabase.co","X-Frame-Options: DENY","Strict-Transport-Security:"]) assert.ok(headers.includes(rule),rule);
  assert.doesNotMatch(headers,/script-src[^;]*'unsafe-inline'/);
  assert.doesNotMatch(headers,/script-src[^;]*'unsafe-eval'/);
  assert.match(headers,/\/admin\/\*[\s\S]*X-Robots-Tag: noindex/);
});

test('admin não incorpora JavaScript/CSS inline',()=>{
  const html=read('admin/index.html');
  assert.doesNotMatch(html,/<script(?![^>]*\bsrc=)[^>]*>/i);
  assert.doesNotMatch(html,/<style\b/i);
  assert.doesNotMatch(html,/\sstyle="/i);
  assert.match(html,/\/admin\/admin\.css/);
  assert.match(html,/\/admin\/admin\.js/);
});

test('nunca expor registros retirados do banco por meio do catálogo local',()=>{
  assert.match(read('assets/data.js'),/window\.SC_PLACES\s*=\s*\[\s*\];/);
  const loader=read('assets/supabase-loader.js');
  assert.match(loader,/window\.SC_PLACES = \[\];/);
  assert.match(loader,/window\.SC_DATA_ERROR = true;/);
  assert.doesNotMatch(loader,/mantendo catálogo local/);
});

test('deploy publica apenas o site e seus recursos',()=>{
  const ignore=read('.assetsignore');
  for(const pattern of ['/supabase/','*.md','/tests/','.github/','wrangler.jsonc']) assert.ok(ignore.includes(pattern),'ignorar '+pattern);
  const cfg=JSON.parse(read('wrangler.jsonc'));
  assert.equal(cfg.assets.directory,'.');
  assert.equal(cfg.name,'santa-cruz-conecta');
});

test('chaves de administração nunca são colocadas no navegador',()=>{
  for(const path of ['assets/supabase-config.js','admin/admin.js','assets/app.js','index.html','admin/index.html']){
    const txt=read(path);
    assert.doesNotMatch(txt,/sb_secret_[A-Za-z0-9_-]{8,}/);
    assert.doesNotMatch(txt,/['"]service_role['"]\s*:\s*['"]/);
  }
  assert.match(read('assets/supabase-config.js'),/sb_publishable_/);
});

test('políticas de leitura e escrita seguem privilégios mínimos',()=>{
  const schema=read('supabase/migrations/20261116010000_admin_dashboard_and_brand_logos.sql');
  const harden=read('supabase/migrations/20261116020000_harden_directory_public_access.sql');
  assert.match(schema,/alter table public\.admin_users enable row level security/i);
  assert.match(schema,/create policy "admins create places"/i);
  assert.match(schema,/create policy "admins update places"/i);
  assert.match(harden,/for select to anon using \(is_published = true\)/);
  assert.match(harden,/for select to authenticated using/);
  assert.match(harden,/places_safe_values_check/);
  assert.match(harden,/bucket_id='brand-logos'/);
});

test('botões de atendimento e cadastro usam telefone autorizado e avaliação editorial',()=>{
  const html=read('index.html');
  const js=read('assets/app.js');
  assert.match(html,/https:\/\/wa\.me\/5551999953049/);
  assert.match(html,/id="businessDialog"/);
  assert.match(html,/id="businessForm"/);
  assert.match(html,/data-open-submission/);
  assert.match(html,/name="permission" required/);
  assert.match(js,/const CONTACT_WHATSAPP = '5551999953049'/);
  assert.match(js,/encodeURIComponent\(lines\.join\(/);
  assert.match(js,/businessForm\.reportValidity\(\)/);
  assert.doesNotMatch(js,/request\('\/rest\/v1\/places[^\n]*method:\s*'POST'/);
});

test('interface preserva responsividade e o formulário não usa script inline',()=>{
  const css=read('assets/styles.css');
  const html=read('index.html');
  assert.match(css,/@media\(max-width:540px\)/);
  assert.match(css,/\.community-card\{/);
  assert.match(css,/\.business-dialog\{/);
  assert.match(css,/\.contact-whatsapp\{/);
  assert.doesNotMatch(html,/on(click|submit|load)=/i);
  assert.ok(!html.includes('javascript:'),'não usar javascript: em links');
  assert.ok(!html.includes('<script type="module">'),'sem script inline novo fora do JSON-LD');
});

test('solicitações vão para fila privada, sem publicação direta ou uso obrigatório do WhatsApp',()=>{
  const html=read('index.html'),js=read('assets/app.js');
  assert.match(html,/name="email" type="email"/);
  assert.match(html,/id="businessSubmitButton"/);
  assert.match(html,/id="businessWhatsappFallback"/);
  assert.match(html,/href="\/privacidade\.html"/);
  assert.match(html,/id="businessResult"/);
  assert.match(js,/fetch\(base\+'\/rest\/v1\/business_submissions'/);
  assert.match(js,/Prefer:'return=minimal'/);
  assert.match(js,/contact_email:v\.email/);
  assert.match(js,/response\.ok/);
  assert.doesNotMatch(js,/fetch\(base\+'\/rest\/v1\/places'/);
});
test('somente administradores podem consultar ou aprovar indicações',()=>{
  const migration=read('supabase/migrations/20261116030000_business_submission_review_queue.sql');
  const admin=read('admin/admin.js');
  assert.match(migration,/alter table public\.business_submissions enable row level security/);
  assert.match(migration,/grant insert \(business_name,category,address,contact_name,contact_email,social_url,phone,details,consent\)/);
  assert.doesNotMatch(migration,/grant select[^;]+to anon/i);
  assert.match(migration,/create policy "only admins can read requests"/);
  assert.match(migration,/create policy "only admins can update requests"/);
  assert.match(migration,/security invoker/);
  assert.match(migration,/bs_one_pending_per_business_idx/);
  assert.match(admin,/loadSubmissions\(\)/);
  assert.match(admin,/renderSubmissions\(\)/);
  assert.match(admin,/rpc\/approve_business_submission/);
  assert.match(admin,/data-request-reject/);
  assert.match(admin,/data-request-approve/);
});

test('dashboard reúne relatórios de cliques e curadoria sem revelar dados para visitantes',()=>{
  const html=read('admin/index.html'),admin=read('admin/admin.js');
  for(const id of ['statClicks30','statNeedsReview','categoryBars','topStores','auditItems','categoryFilter','reviewFilter'])
    assert.ok(html.includes('id="'+id+'"'),id+' deve existir');
  assert.match(admin,/place_click_summary/);
  assert.match(admin,/function renderQuality/);
  assert.match(admin,/function renderOverview/);
  assert.match(admin,/data-mark-review/);
  assert.match(admin,/link_review_status/);
  const schema=read('supabase/migrations/20261116040000_commercial_link_review_and_click_metrics.sql');
  const summary=read('supabase/migrations/20261116041000_restrict_click_summary_to_admins.sql');
  const throttling=read('supabase/migrations/20261116042000_click_metrics_public_rate_limits.sql');
  assert.match(schema,/enable row level security/);
  assert.match(schema,/grant insert\(place_id\) on public\.place_clicks to anon/);
  assert.match(schema,/with\(security_invoker = true\)/);
  assert.match(summary,/from public\.admin_users/);
  assert.match(summary,/auth\.uid\(\)/);
  assert.match(throttling,/app_private\.limit_place_clicks/);
  assert.match(throttling,/interval '24 hours'/);
});

test('site mede só clique no link externo e não coleta dados pessoais',()=>{
  const app=read('assets/app.js'),privacy=read('privacidade.html');
  assert.match(app,/data-place-visit/);
  assert.match(app,/rest\/v1\/place_clicks/);
  assert.match(app,/keepalive:true/);
  assert.match(app,/sessionStorage\.setItem\(dedupKey/);
  assert.doesNotMatch(app,/place_clicks[\s\S]{0,140}localStorage/);
  assert.match(privacy,/Cliques em links de estabelecimentos/);
});

test('curadoria de novas lojas é versionada e auditoria semanal não tem credenciais administrativas',()=>{
  const seed=read('supabase/seeds/20261116_comercio_curado.sql');
  const audit=read('scripts/audit-links.mjs');
  const workflow=read('.github/workflows/audit-links.yml');
  const ignore=read('.assetsignore');
  assert.match(seed,/yes-feminina-masculina/);
  assert.match(seed,/infomaxy-tecnologia/);
  assert.match(seed,/joalheria-esmeralda/);
  assert.match(seed,/hoffmann-spode/);
  assert.match(seed,/on conflict \(id\) do nothing/);
  assert.match(audit,/method:'HEAD'/);
  assert.match(audit,/response\.ok/);
  assert.doesNotMatch(audit,/sb_secret_/);
  assert.match(workflow,/schedule:/);
  assert.match(workflow,/contents: read/);
  assert.match(ignore,/\/scripts\//);
});
