/* Auditoria passiva de URLs do catálogo, sem alterar o banco ou tentar login em sites terceiros. */
import {readFileSync,appendFileSync} from 'node:fs';
import {setTimeout as delay} from 'node:timers/promises';
const cfg=readFileSync(new URL('../assets/supabase-config.js',import.meta.url),'utf8');
const key=cfg.match(/publishableKey:\s*'([^']+)'/)?.[1];
const base=cfg.match(/url:\s*'([^']+)'/)?.[1];
if(!base?.startsWith('https://')||!key?.startsWith('sb_publishable_'))throw Error('Configuração pública ausente');
const request=await fetch(base+'/rest/v1/places?select=id,name,category,website_url,link_type&is_published=eq.true&limit=2000',{
  headers:{apikey:key},signal:AbortSignal.timeout(15000)
});
if(!request.ok)throw Error('Catálogo indisponível: HTTP '+request.status);
const rows=await request.json();
if(!Array.isArray(rows))throw Error('Resposta do catálogo inválida');
function validExternal(url){
  try{
    const u=new URL(url);
    if(u.protocol!=='https:')return false;
    const h=u.hostname.toLowerCase();
    return !['localhost','0.0.0.0','127.0.0.1','::1'].includes(h) &&
      !/^(?:10|127|169\.254|172\.(?:1[6-9]|2\d|3[01])|192\.168)\./.test(h) &&
      !h.endsWith('.local')&&!h.endsWith('.internal');
  }catch{return false}
}
async function check(row){
  if(!validExternal(row.website_url))return {...row,status:'revisar',detail:'URL HTTPS inválida'};
  let res;
  try{
    res=await fetch(row.website_url,{
      method:'HEAD',redirect:'follow',signal:AbortSignal.timeout(8500),
      headers:{'User-Agent':'SantaCruzConecta-LinkAudit/1.0'}
    });
    if(res.status===405||res.status===501){
      res=await fetch(row.website_url,{method:'GET',redirect:'follow',signal:AbortSignal.timeout(8500),
        headers:{'User-Agent':'SantaCruzConecta-LinkAudit/1.0'}});
    }
    const detail='HTTP '+res.status;
    if(res.body)await res.body.cancel().catch(()=>{});
    if(res.status>=200&&res.status<400)return {...row,status:'acessível',detail};
    if([404,410].includes(res.status))return {...row,status:'possivelmente quebrado',detail};
    return {...row,status:'revisão manual',detail};
  }catch(err){return {...row,status:'revisão manual',detail:err.name==='TimeoutError'?'Tempo esgotado':'Sem resposta (rede ou bloqueio anti-bot)'};}
}
const results=[];
const WORKERS=4;
for(let i=0;i<rows.length;i+=WORKERS){
  const batch=await Promise.all(rows.slice(i,i+WORKERS).map(check));
  results.push(...batch);
  await delay(125); // uma verificação leve, não rastreamento profundo
}
const count=status=>results.filter(r=>r.status===status).length;
const report=[
  '# Auditoria de links — Santa Cruz Conecta','',
  '> Inspeção técnica de disponibilidade; não comprova autenticidade do comércio, atualização do site ou qualidade do conteúdo.','',
  '| Estado | Quantidade |','|---|---:|',
  '| Acessível | '+count('acessível')+' |',
  '| Possivelmente quebrado (404/410) | '+count('possivelmente quebrado')+' |',
  '| Revisão manual (403, timeout, anti-bot etc.) | '+(count('revisão manual')+count('revisar'))+' |','',
  '| Estabelecimento | HTTP / observação | Estado |','|---|---|---|',
  ...results.map(r=>'| '+String(r.name).replaceAll('|','/')+' | '+r.detail+' | '+r.status+' |'),
  '','Gerado automaticamente para triagem. Não altera dados publicados nem indica indisponibilidade definitiva.'
].join('\n');
console.log(report);
if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,report+'\n');
