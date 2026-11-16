import test from 'node:test';
import assert from 'node:assert/strict';
const BASE=process.env.SANTA_CRUZ_URL||'https://santa-cruz-conecta.pepirocha123.workers.dev';
const fetchUrl=async (path)=>fetch(new URL(path,BASE),{
  redirect:'follow',
  signal:AbortSignal.timeout(16000),
  headers:{'User-Agent':'SantaCruzConecta-SecuritySmokeTest/1.0'}
});
const mustHeader=(response,name,value)=>{
  const got=response.headers.get(name)||'';
  assert.ok(got.toLowerCase().includes(value.toLowerCase()),name+' esperado: '+value+'; recebido: '+got);
};
test('site público retorna HTML com cabeçalhos de segurança',async()=>{
  const r=await fetchUrl('/');
  assert.equal(r.status,200,'site acessível');
  mustHeader(r,'content-type','text/html');
  mustHeader(r,'content-security-policy',"default-src 'none'");
  mustHeader(r,'content-security-policy',"frame-ancestors 'none'");
  mustHeader(r,'x-frame-options','DENY');
  mustHeader(r,'x-content-type-options','nosniff');
  mustHeader(r,'strict-transport-security','max-age=');
  const html=await r.text();
  assert.match(html,/Santa Cruz Conecta/i);
});
test('painel de login expõe apenas tela e headers de proteção',async()=>{
  const r=await fetchUrl('/admin/');
  assert.equal(r.status,200,'painel /admin/');
  mustHeader(r,'x-robots-tag','noindex');
  mustHeader(r,'cache-control','no-store');
  const html=await r.text();
  assert.match(html,/id="loginForm"/);
  assert.doesNotMatch(html,/sb_secret_[A-Za-z0-9_-]+/);
});
test('arquivos internos não são publicados por Cloudflare',async()=>{
  for (const path of ['/README.md','/SECURITY.md','/supabase/migrations/20261116020000_harden_directory_public_access.sql','/tests/security.test.mjs','/.github/workflows/security.yml']) {
    const r=await fetchUrl(path);
    assert.ok(r.status===404||r.status===403,path+' não deve ser público (HTTP '+r.status+')');
  }
});
test('JavaScript do site não contém cópia estática de locais ocultos',async()=>{
  const r=await fetchUrl('/assets/data.js');
  assert.equal(r.status,200);
  const js=await r.text();
  assert.match(js,/window\.SC_PLACES\s*=\s*\[\s*\];/);
  assert.doesNotMatch(js,/Miller Supermercados/);
});
