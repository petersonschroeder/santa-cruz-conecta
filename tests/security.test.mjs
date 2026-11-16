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
  assert.doesNotMatch(headers,/script-src[^\n]*'unsafe-inline'/);
  assert.doesNotMatch(headers,/script-src[^\n]*'unsafe-eval'/);
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
