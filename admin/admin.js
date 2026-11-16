/* Santa Cruz Conecta — administração sem dependências; Auth + PostgREST + Storage. */
(() => {
'use strict';
const config = window.SC_SUPABASE || {};
const base = String(config.url || '').replace(/\/+$/, '');
const key = String(config.publishableKey || '');
const $ = id => document.getElementById(id);
const SESSION_KEY = 'santacruzconecta:admin:v1';
const cats = window.SC_CATEGORIES || {};
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let session = null, places = [], submissions = [], clickStats = [], clicksLoaded = false, currentId = null, currentSubmissionId = null, busy = false;
const loadStored = () => { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; } };
const saveSession = value => { session = value; if (value) sessionStorage.setItem(SESSION_KEY, JSON.stringify(value)); else sessionStorage.removeItem(SESSION_KEY); };
const message = (id,text,error=false) => { const el=$(id); el.textContent=text; el.classList.toggle('error',!!error); };
const validHttps = text => { try { const u=new URL(text); return u.protocol==='https:' && !!u.hostname; } catch { return false; } };
function logoFor(p) {
  if (validHttps(p.logo_url)) return p.logo_url;
  if (p.link_type === 'site' && validHttps(p.website_url)) {
    try { return 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(new URL(p.website_url).hostname) + '&sz=128'; } catch {}
  }
  return '/assets/brands/' + encodeURIComponent(p.id) + '.svg';
}
function fail(response, json) {
  let detail = json?.msg || json?.error_description || json?.message || json?.details || json?.hint || json?.error || 'Erro de comunicação';
  if (typeof detail !== 'string') detail = 'Erro de comunicação';
  throw Error(detail + ' (HTTP ' + response.status + ')');
}
async function request(path, {method='GET', payload, token, headers={}, raw=false, allowRefresh=true} = {}) {
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(base) || !key.startsWith('sb_publishable_')) throw Error('Supabase não configurado.');
  if (token !== false && session && allowRefresh) await ensureFresh();
  const h = {'apikey':key, ...headers};
  if (token !== false && session?.access_token) h.Authorization='Bearer ' + session.access_token;
  if (payload !== undefined && !raw) h['Content-Type']='application/json';
  const res = await fetch(base + path, {method, headers:h, body:payload===undefined?undefined:raw?payload:JSON.stringify(payload),cache:'no-store'});
  const text = await res.text();
  let result = null;
  try { result = text?JSON.parse(text):null; } catch { result = text; }
  if (!res.ok) fail(res,result);
  return result;
}
async function ensureFresh() {
  if (!session || !session.refresh_token) return;
  if (session.expires_at && session.expires_at > Date.now()/1000+90) return;
  const data=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',payload:{refresh_token:session.refresh_token},token:false,allowRefresh:false});
  saveSession({...data, expires_at:Math.floor(Date.now()/1000)+(data.expires_in||3600)});
}
async function signIn(email,password) {
  const data=await request('/auth/v1/token?grant_type=password',{method:'POST',payload:{email,password},token:false});
  saveSession({...data,expires_at:Math.floor(Date.now()/1000)+(data.expires_in||3600)});
}
async function isAdmin() {
  await ensureFresh();
  const user=await request('/auth/v1/user');
  if (!user?.id) return false;
  const rows=await request('/rest/v1/admin_users?select=user_id&user_id=eq.'+encodeURIComponent(user.id)+'&limit=1');
  if (!Array.isArray(rows) || !rows.length) return false;
  $('account').textContent=user.email||'Administrador';
  return true;
}
function showDashboard() { $('authView').hidden=true; $('panelView').hidden=false; $('logout').hidden=false; }
function showLogin() { $('authView').hidden=false; $('panelView').hidden=true; $('logout').hidden=true; $('account').textContent=''; }
async function activate() {
  if (!(await isAdmin())) { saveSession(null); showLogin(); message('loginMessage','Esta conta ainda não tem permissão de administrador.',true); return; }
  showDashboard(); await Promise.all([loadPlaces(), loadSubmissions(), loadClicks()]);
}
async function logout() {
  try { if (session) await request('/auth/v1/logout',{method:'POST',allowRefresh:false}); } catch {}
  saveSession(null); showLogin(); $('password').value=''; message('loginMessage','Sessão encerrada.');
}
async function loadPlaces() {
  try {
    const rows=await request('/rest/v1/places?select=*&order=name.asc&limit=2000');
    places=Array.isArray(rows)?rows:[];
    updateStats(); render(); renderOverview(); renderQuality();
    message('panelMessage','');
  } catch(e){message('panelMessage','Não foi possível carregar os dados: '+e.message,true);}
}
async function loadSubmissions(){
  try {
    const rows=await request('/rest/v1/business_submissions?select=*&order=created_at.desc&limit=1000');
    submissions=Array.isArray(rows)?rows:[];
    $('statPending').textContent=submissions.filter(r=>r.status==='pending').length;
    $('requestsCount').textContent=submissions.filter(r=>r.status==='pending').length+' pendentes';
    renderSubmissions();
    message('requestsMessage','');
  }catch(err){ message('requestsMessage','Não foi possível carregar solicitações: '+err.message,true); }
}
function renderSubmissions(){
  const term=$('requestSearch').value.toLocaleLowerCase('pt-BR').trim();
  const status=$('requestStatusFilter').value;
  const filtered=submissions.filter(r=>
    (status==='all'||r.status===status) &&
    [r.business_name,r.address,r.contact_name,r.contact_email,r.category,r.social_url].join(' ').toLocaleLowerCase('pt-BR').includes(term)
  );
  $('requestsEmpty').hidden=filtered.length>0;
  $('requestRows').innerHTML=filtered.map(r=>{
    const date=new Date(r.created_at);
    const dateLabel=Number.isNaN(date.getTime())?'—':date.toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});
    const statusLabel={pending:'Pendente',approved:'Aprovada',rejected:'Rejeitada'}[r.status]||r.status;
    const statusClass=r.status==='approved'?'live':r.status==='rejected'?'rejected':'';
    const website=validHttps(r.social_url) ? '<a href="'+esc(r.social_url)+'" target="_blank" rel="noopener noreferrer">Ver site indicado ↗</a>':'';
    return '<article class="request-card"><div class="request-main">'+
      '<div class="request-top"><span class="status '+statusClass+'">'+esc(statusLabel)+'</span><time datetime="'+esc(r.created_at)+'">'+esc(dateLabel)+'</time></div>'+
      '<h3>'+esc(r.business_name)+'</h3>'+
      '<p class="request-meta">'+esc(cats[r.category]?.label||r.category)+' · '+esc(r.address)+'</p>'+
      '<div class="request-contact"><span><strong>Contato:</strong> '+esc(r.contact_name)+'</span><span><strong>E-mail:</strong> '+esc(r.contact_email)+'</span></div>'+
      (r.phone?'<p><strong>Telefone informado:</strong> '+esc(r.phone)+'</p>':'')+
      (r.social_url?'<p><strong>Site ou perfil informado:</strong> '+esc(r.social_url)+' '+website+'</p>':'')+
      (r.details?'<p><strong>Sobre:</strong> '+esc(r.details)+'</p>':'')+
      (r.review_notes?'<p class="request-note"><strong>Observações da análise:</strong> '+esc(r.review_notes)+'</p>':'')+
      (r.published_place_id?'<p class="request-note">Estabelecimento criado: '+esc(r.published_place_id)+'</p>':'')+
      '</div><div class="request-actions">'+
      (r.status==='pending'?'<button type="button" class="primary" data-request-approve="'+esc(r.id)+'">Revisar e aprovar</button><button type="button" class="danger" data-request-reject="'+esc(r.id)+'">Rejeitar</button>':'')+
      (r.status==='rejected'?'<button type="button" class="ghost" data-request-reopen="'+esc(r.id)+'">Reabrir</button>':'')+
      '</div></article>';
  }).join('');
}
function openSubmission(id){
  const r=submissions.find(v=>v.id===id && v.status==='pending');
  if(!r)return;
  openForm();
  currentSubmissionId=r.id;
  const form=$('placeForm');
  form.elements.name.value=r.business_name;
  form.elements.category.value=r.category;
  form.elements.address.value=r.address;
  form.elements.phone.value=r.phone||'';
  form.elements.description.value=r.details||('Conheça '+r.business_name+' em Santa Cruz do Sul.');
  form.elements.subtitle.value=(cats[r.category]?.label||'Comércio')+' · Santa Cruz do Sul';
  const original=String(r.social_url||'').trim();
  const website=validHttps(original)?original:/^[\w.-]+\.[a-z]{2,}\b/i.test(original)?'https://'+original:'';
  form.elements.website_url.value=website;
  form.elements.link_type.value=website && /(?:instagram|facebook|linktr\.ee|wa\.me)/i.test(website)?'canais':'site';
  form.elements.is_published.checked=true;
  $('formTitle').textContent='Aprovar '+r.business_name;
  $('saveButton').textContent='Aprovar e salvar no catálogo';
  $('placeForm').elements.name.focus();
}
async function updateSubmissionStatus(id,status,review_notes=''){
  if(!session?.user?.id)throw Error('Sessão de administrador inválida.');
  await request('/rest/v1/business_submissions?id=eq.'+encodeURIComponent(id)+'&status=eq.'+(status==='rejected'?'pending':'rejected'),{
    method:'PATCH',
    payload:{status,review_notes,reviewed_by:status==='pending'?null:session.user.id,reviewed_at:status==='pending'?null:new Date().toISOString()},
    headers:{Prefer:'return=minimal'}
  });
  await loadSubmissions();
}
async function rejectSubmission(id){
  const r=submissions.find(v=>v.id===id && v.status==='pending');
  if(!r)return;
  const reason=prompt('Motivo da rejeição (opcional; será visível somente para administradores):','');
  if(reason===null)return;
  if(!confirm('Rejeitar a solicitação de '+r.business_name+'?'))return;
  try{
    await updateSubmissionStatus(id,'rejected',reason.slice(0,600));
    message('requestsMessage','Solicitação rejeitada.');
  }catch(err){message('requestsMessage','Erro ao rejeitar: '+err.message,true);}
}
async function reopenSubmission(id){
  if(!confirm('Reabrir esta solicitação para análise?'))return;
  try{
    await updateSubmissionStatus(id,'pending','');
    message('requestsMessage','Solicitação reaberta.');
  }catch(err){message('requestsMessage','Erro ao reabrir: '+err.message,true);}
}


async function loadClicks(){
  try {
    const rows=await request('/rest/v1/place_click_summary?select=place_id,place_name,category,clicks_7d,clicks_30d,clicks_total,last_clicked_at&limit=1500');
    clickStats=Array.isArray(rows)?rows:[];
    clicksLoaded=true;
    renderOverview(); render(); updateStats();
  }catch(err){
    clicksLoaded=false;
    $('topStores').textContent='Métricas indisponíveis: '+err.message;
    $('statClicks30').textContent='—';
  }
}
function clicksFor(id){
  return Number(clickStats.find(v=>v.place_id===id)?.clicks_30d||0);
}
function renderOverview(){
  const totals=Object.entries(cats).map(([id,category])=>({
    id,label:category.label,count:places.filter(p=>p.category===id).length
  })).filter(x=>x.count>0).sort((a,b)=>b.count-a.count);
  const max=Math.max(1,...totals.map(x=>x.count));
  $('categoryBars').innerHTML=totals.map(x=>
    '<div class="bar-item"><div class="bar-label"><span>'+esc(x.label)+'</span><strong>'+x.count+'</strong></div>'+
    '<div class="bar-track"><div class="bar-fill" style="width:'+Math.round(x.count/max*100)+'%"></div></div></div>'
  ).join('')||'<p class="muted">Nenhuma categoria cadastrada.</p>';
  if(!clicksLoaded)return;
  const top=clickStats.filter(x=>Number(x.clicks_30d)>0)
    .sort((a,b)=>Number(b.clicks_30d)-Number(a.clicks_30d)).slice(0,8);
  const maxClicks=Math.max(1,...top.map(x=>Number(x.clicks_30d)));
  $('topStores').innerHTML=top.length?top.map(x=>
    '<div class="bar-item"><div class="bar-label"><span>'+esc(x.place_name)+'</span><strong>'+
    Number(x.clicks_30d).toLocaleString('pt-BR')+'</strong></div><div class="bar-track"><div class="bar-fill bar-fill-gold" style="width:'+
    Math.round(Number(x.clicks_30d)/maxClicks*100)+'%"></div></div></div>'
  ).join(''):'<p class="muted">Ainda não há cliques registrados. Esta medição começa a partir da atualização do portal.</p>';
}
function qualityScore(p){
  let score=0;
  if(p.link_review_status==='needs_review')score+=5;
  if(p.link_review_status!=='reviewed')score+=2;
  if(!p.address)score+=2;
  if(p.link_type!=='site')score+=1;
  if(!p.source_url)score+=1;
  return score;
}
function renderQuality(){
  const counts={
    pending:places.filter(p=>p.link_review_status!=='reviewed').length,
    missing:places.filter(p=>!p.address).length,
    guides:places.filter(p=>p.link_type!=='site').length,
    reviewed:places.filter(p=>p.link_review_status==='reviewed').length
  };
  $('statNeedsReview').textContent=counts.pending;
  $('qualityStats').innerHTML=[
    ['A conferir',counts.pending],['Endereços ausentes',counts.missing],
    ['Guias/redes',counts.guides],['Links conferidos',counts.reviewed]
  ].map(([name,n])=>'<div class="quality-kpi"><strong>'+n+'</strong><span>'+esc(name)+'</span></div>').join('');
  const priority=[...places].filter(p=>qualityScore(p)>0)
    .sort((a,b)=>qualityScore(b)-qualityScore(a)||a.name.localeCompare(b.name,'pt-BR')).slice(0,10);
  $('auditItems').innerHTML=priority.length?priority.map(p=>{
    const issues=[
      p.link_review_status==='needs_review'?'Solicita revisão':p.link_review_status!=='reviewed'?'Não conferido':'',
      !p.address?'Sem endereço':'',
      p.link_type!=='site'?'Página de guia/rede':'',
      !p.source_url?'Sem fonte':''
    ].filter(Boolean).join(' · ');
    return '<div class="audit-item"><div><strong>'+esc(p.name)+'</strong><small>'+esc(issues)+'</small></div>'+
      '<div class="audit-actions"><a href="'+esc(validHttps(p.website_url)?p.website_url:'#')+'" target="_blank" rel="noopener noreferrer">Abrir site ↗</a>'+
      '<button type="button" data-edit="'+esc(p.id)+'">Editar</button><button type="button" data-mark-review="'+esc(p.id)+'">Conferi o link ✓</button></div></div>';
  }).join(''):'<p class="muted">Todos os registros estão conferidos e completos segundo os dados atuais.</p>';
}
async function setLinkReview(id,status){
  const place=places.find(x=>x.id===id);if(!place)return;
  if(status==='reviewed'&&!confirm('Você abriu e conferiu manualmente o endereço '+place.website_url+' e confirmou que ele corresponde ao estabelecimento?'))return;
  try{
    await request('/rest/v1/places?id=eq.'+encodeURIComponent(id),{
      method:'PATCH',
      payload:{
        link_review_status:status,
        last_link_reviewed_at:status==='reviewed'?new Date().toISOString():null
      },
      headers:{Prefer:'return=minimal'}
    });
    await loadPlaces();
    message('panelMessage',status==='reviewed'?'Link marcado como conferido.':'Link sinalizado para revisão.');
  }catch(e){message('panelMessage','Erro ao alterar a revisão: '+e.message,true);}
}

function updateStats(){
  $('statTotal').textContent=places.length;
  $('statLive').textContent=places.filter(p=>p.is_published).length;
  $('statDraft').textContent=places.filter(p=>!p.is_published).length;
  $('statCategories').textContent=new Set(places.map(p=>p.category)).size;
  $('statClicks30').textContent=clicksLoaded?clickStats.reduce((sum,p)=>sum+Number(p.clicks_30d||0),0).toLocaleString('pt-BR'):'—';
}
function render() {
  const term=$('search').value.toLocaleLowerCase('pt-BR').trim();
  const filter=$('statusFilter').value;
  const category=$('categoryFilter').value;
  const review=$('reviewFilter').value;
  const filtered=places.filter(p=>
    (filter==='all'||(filter==='published')===!!p.is_published) &&
    (category==='all'||p.category===category) &&
    (review==='all'||(p.link_review_status||'pending')===review) &&
    [p.name,p.category,p.address,p.subtitle,p.website_url].join(' ').toLocaleLowerCase('pt-BR').includes(term)
  );
  $('empty').hidden=filtered.length>0;
  $('rows').innerHTML=filtered.map(p=>{
    const reviewStatus=p.link_review_status||'pending';
    const reviewLabel={pending:'Pendente',reviewed:'Conferido',needs_review:'Revisar'}[reviewStatus]||reviewStatus;
    const url=validHttps(p.website_url)?p.website_url:'#';
    return '<tr>'+
      '<td><div class="item"><img src="'+esc(logoFor(p))+'" data-fallback="/assets/brands/'+encodeURIComponent(p.id)+'.svg" alt="" loading="lazy"><span><strong>'+esc(p.name)+'</strong><span class="muted">'+esc(p.address||p.id)+'</span></span></div></td>'+
      '<td>'+esc(cats[p.category]?.label||p.category)+'</td>'+
      '<td><span class="status '+(p.is_published?'live':'')+'">'+(p.is_published?'Publicado':'Rascunho')+'</span></td>'+
      '<td><a class="admin-site-link" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(p.link_type==='site'?'Site oficial':p.link_type==='guia'?'Guia externo':'Canal externo')+' ↗</a></td>'+
      '<td><span class="status '+(reviewStatus==='reviewed'?'live':reviewStatus==='needs_review'?'rejected':'')+'">'+esc(reviewLabel)+'</span></td>'+
      '<td><strong class="click-number">'+(clicksLoaded?clicksFor(p.id).toLocaleString('pt-BR'):'—')+'</strong></td>'+
      '<td><div class="actions"><button type="button" data-edit="'+esc(p.id)+'">Editar</button>'+
      (reviewStatus!=='reviewed'?'<button type="button" data-mark-review="'+esc(p.id)+'">Conferir</button>':'<button type="button" data-flag-review="'+esc(p.id)+'">Revisar</button>')+
      '<button type="button" data-toggle="'+esc(p.id)+'">'+(p.is_published?'Ocultar':'Publicar')+'</button>'+
      '<button type="button" class="red" data-remove="'+esc(p.id)+'">Excluir</button></div></td>'+
    '</tr>';
  }).join('');
}
const slug = value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,66);
function openForm(id=null) {
  currentId=id;
  currentSubmissionId=null;
  const p=places.find(x=>x.id===id);
  $('placeForm').reset();
  $('placeForm').elements.is_published.checked=true;
  $('placeForm').elements.link_review_status.value='pending';
  $('formTitle').textContent=p?'Editar '+p.name:'Novo estabelecimento';
  $('saveButton').textContent='Salvar estabelecimento';
  if (p) {
    for (const field of ['name','category','description','subtitle','website_url','link_type','address','phone','logo_url','featured','is_published','source_url','link_review_status']) {
      const el=$('placeForm').elements.namedItem(field);
      if (el) { if(el.type==='checkbox')el.checked=!!p[field]; else el.value=p[field]??''; }
    }
    $('placeForm').elements.tags.value=(p.tags||[]).join(', ');
  }
  $('logoFile').value='';
  $('logoPreview').hidden=true;
  if (p?.logo_url && validHttps(p.logo_url)) { $('logoPreview').src=p.logo_url; $('logoPreview').hidden=false; }
  $('editDialog').showModal();
}
function closeForm() { if (!busy) $('editDialog').close(); }
async function uploadLogo(file) {
  const typeMap={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
  if (!typeMap[file.type]) throw Error('Formato inválido. Use PNG, JPG ou WebP.');
  if (file.size>2097152 || file.size<1) throw Error('A imagem deve ter no máximo 2 MB.');
  const objectName=crypto.randomUUID()+'.'+typeMap[file.type];
  await request('/storage/v1/object/brand-logos/'+objectName,{
    method:'POST',payload:file,raw:true,headers:{'Content-Type':file.type,'x-upsert':'false'}
  });
  return base+'/storage/v1/object/public/brand-logos/'+objectName;
}
async function save(e) {
  e.preventDefault(); if(busy) return;
  const form=$('placeForm');
  const v=name=>String(form.elements.namedItem(name)?.value||'').trim();
  const name=v('name'), site=v('website_url'), logo=v('logo_url'), source=v('source_url'), review=v('link_review_status');
  if (!name || !validHttps(site)) {alert('Informe um nome e um site HTTPS válido.');return;}
  if (logo && !validHttps(logo)) {alert('A URL do logotipo precisa começar com HTTPS.');return;}
  if (source && !validHttps(source)) {alert('A fonte de verificação precisa começar com HTTPS.');return;}
  let id=currentId;
  if (!id) {
    const start=slug(name)||'local';
    id=start;let n=2;
    while(places.some(p=>p.id===id)) id=start+'-'+n++;
  }
  const payload={
    id,name,category:v('category'),description:v('description'),subtitle:v('subtitle'),
    website_url:site,link_type:v('link_type'),address:v('address'),phone:v('phone'),
    tags:v('tags').split(',').map(s=>s.trim()).filter(Boolean).slice(0,25),
    featured:form.elements.featured.checked,is_published:form.elements.is_published.checked,
    logo_url:logo,mark:name.split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase(),
    source_url:source||site,link_review_status:review,
    last_link_reviewed_at:review==='reviewed'?new Date().toISOString():null,
    updated_at:new Date().toISOString()
  };
  busy=true; $('saveButton').disabled=true; $('saveButton').textContent='Salvando...';
  try {
    if ($('logoFile').files[0]) payload.logo_url=await uploadLogo($('logoFile').files[0]);
    if (currentSubmissionId) {
      await request('/rest/v1/rpc/approve_business_submission',{
        method:'POST',
        payload:{
          p_request_id:currentSubmissionId,p_name:payload.name,p_description:payload.description,
          p_website_url:payload.website_url,p_link_type:payload.link_type,
          p_subtitle:payload.subtitle,p_phone:payload.phone,p_logo_url:payload.logo_url,
          p_publish:payload.is_published
        }
      });
    } else if (currentId) {
      await request('/rest/v1/places?id=eq.'+encodeURIComponent(id),{
        method:'PATCH',payload,headers:{Prefer:'return=minimal'}
      });
    } else {
      await request('/rest/v1/places',{method:'POST',payload,headers:{Prefer:'return=minimal'}});
    }
    const approved=Boolean(currentSubmissionId);
    $('editDialog').close();
    currentSubmissionId=null;
    await Promise.all([loadPlaces(), loadSubmissions()]);
    message(approved?'requestsMessage':'panelMessage',approved?'Solicitação aprovada e estabelecimento incluído no catálogo.':'Estabelecimento salvo com sucesso!');
  } catch(err){alert('Não foi possível salvar: '+err.message);}
  finally{busy=false;$('saveButton').disabled=false;$('saveButton').textContent='Salvar estabelecimento';}
}
async function toggle(id) {
  const p=places.find(x=>x.id===id);if(!p)return;
  try {
    await request('/rest/v1/places?id=eq.'+encodeURIComponent(id),{
      method:'PATCH',payload:{is_published:!p.is_published,updated_at:new Date().toISOString()},
      headers:{Prefer:'return=minimal'}
    });
    await loadPlaces();
    message('panelMessage',p.is_published?'Local retirado da exibição pública.':'Local publicado com sucesso.');
  } catch(err){message('panelMessage','Erro ao alterar publicação: '+err.message,true);}
}
async function remove(id) {
  const p=places.find(x=>x.id===id);if(!p)return;
  if (!confirm('Excluir permanentemente "'+p.name+'"? Esta ação não pode ser desfeita.')) return;
  try {
    await request('/rest/v1/places?id=eq.'+encodeURIComponent(id),{method:'DELETE',headers:{Prefer:'return=minimal'}});
    await loadPlaces();message('panelMessage','Estabelecimento excluído.');
  } catch(err){message('panelMessage','Erro ao excluir: '+err.message,true);}
}
function init() {
  $('placeCategory').innerHTML=Object.entries(cats).map(([k,c])=>'<option value="'+esc(k)+'">'+esc(c.label)+'</option>').join('');
  $('loginForm').addEventListener('submit',async e=>{
    e.preventDefault();const btn=$('loginButton');btn.disabled=true;
    message('loginMessage','Verificando suas credenciais...');
    try { await signIn($('email').value.trim(),$('password').value);await activate(); }
    catch(err) {saveSession(null);showLogin();message('loginMessage','Não foi possível entrar: '+err.message,true);}
    finally {btn.disabled=false;}
  });
  $('logout').addEventListener('click',logout);
  $('search').addEventListener('input',render); $('statusFilter').addEventListener('change',render);
  $('categoryFilter').innerHTML='<option value="all">Todas as categorias</option>'+Object.entries(cats).map(([k,c])=>'<option value="'+esc(k)+'">'+esc(c.label)+'</option>').join('');
  $('categoryFilter').addEventListener('change',render); $('reviewFilter').addEventListener('change',render);
  $('refreshAudit').addEventListener('click',loadPlaces);
  $('auditItems').addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.edit)openForm(b.dataset.edit);
    else if(b.dataset.markReview)setLinkReview(b.dataset.markReview,'reviewed');
  });
  $('reload').addEventListener('click',loadPlaces); $('newPlace').addEventListener('click',()=>openForm());
  $('reloadRequests').addEventListener('click',loadSubmissions);
  $('requestSearch').addEventListener('input',renderSubmissions);
  $('requestStatusFilter').addEventListener('change',renderSubmissions);
  $('requestRows').addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.requestApprove)openSubmission(b.dataset.requestApprove);
    else if(b.dataset.requestReject)rejectSubmission(b.dataset.requestReject);
    else if(b.dataset.requestReopen)reopenSubmission(b.dataset.requestReopen);
  });
  $('rows').addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.edit)openForm(b.dataset.edit);
    else if(b.dataset.markReview)setLinkReview(b.dataset.markReview,'reviewed');
    else if(b.dataset.flagReview)setLinkReview(b.dataset.flagReview,'needs_review');
    else if(b.dataset.toggle)toggle(b.dataset.toggle);
    else if(b.dataset.remove)remove(b.dataset.remove);
  });
  $('placeForm').addEventListener('submit',save);
  $('closeDialog').addEventListener('click',closeForm);$('cancelDialog').addEventListener('click',closeForm);
  $('editDialog').addEventListener('cancel',e=>{if(busy)e.preventDefault();});
  $('logoFile').addEventListener('change',e=>{
    const file=e.target.files[0];if(!file)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>2097152){alert('Use PNG, JPG ou WebP de até 2 MB.');e.target.value='';return;}
    const old=$('logoPreview').dataset.preview;if(old)URL.revokeObjectURL(old);
    const u=URL.createObjectURL(file);$('logoPreview').src=u;$('logoPreview').dataset.preview=u;$('logoPreview').hidden=false;
  });
  document.addEventListener('error',e=>{
    const img=e.target;
    if(img instanceof HTMLImageElement&&img.dataset.fallback){
      const fallback=img.dataset.fallback; delete img.dataset.fallback;
      img.src=img.src.endsWith(fallback)?'/assets/logo.svg':fallback;
    }
  },true);
  session=loadStored();
  if(session)activate().catch(()=>{saveSession(null);showLogin();message('loginMessage','Sessão expirada. Entre novamente.',true);});
  else showLogin();
}
init();
})();