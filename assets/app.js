/* Santa Cruz Conecta — frontend sem frameworks ou build. */
(async () => {
  'use strict';
  if (window.SC_DATA_READY) await window.SC_DATA_READY;
  const places = Array.isArray(window.SC_PLACES) ? window.SC_PLACES : [];
  const categories = window.SC_CATEGORIES || {};
  const $ = (id) => document.getElementById(id);
  const locale = 'pt-BR';
  const state = { category: 'todos', search: '', sort: 'recommended', favoritesOnly: false, limit: 9 };
  const FAVORITES_KEY = 'santacruzconecta:favoritos:v1';
  const CONTACT_WHATSAPP = '5551999953049';
  const iconPaths = {
    'shopping-cart':'<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.8 13.5h12L22 6H6"/>',
    plus:'<path d="M12 4v16M4 12h16"/>',
    utensils:'<path d="M4 3v7a4 4 0 0 0 8 0V3M8 3v18M20 3v18M20 3a6 6 0 0 0-6 6v3h6"/>',
    coffee:'<path d="M4 8h14v5a7 7 0 0 1-14 0V8ZM18 9h2a3 3 0 0 1 0 6h-2M3 21h17"/>',
    compass:'<circle cx="12" cy="12" r="10"/><path d="m16 8-2.8 6.2L7 17l2.8-6.2L16 8Z"/>',
    bed:'<path d="M3 18V6m18 12V9a3 3 0 0 0-3-3H3v12h18ZM3 14h18M7 10h4"/>',
    store:'<path d="M3 10h18M5 10v11h14V10M3 10l2-7h14l2 7M9 21v-7h6v7"/>',
    graduation:'<path d="m2 9 10-5 10 5-10 5L2 9Zm4 3v6c4 3 8 3 12 0v-6M22 9v7"/>',
    newspaper:'<path d="M5 3h15v16a2 2 0 0 1-2 2H6a3 3 0 0 1-3-3V7M3 18V7h3v11a3 3 0 0 1-3 3M9 7h8M9 11h8M9 15h5"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 15h3"/>',
    landmark:'<path d="m3 10 9-7 9 7M4 10h16M6 10v9m4-9v9m4-9v9m4-9v9M3 21h18M2 10h20"/>'
  };
  function icon(name){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.compass}</svg>`}
  const escapeHtml = (val) => String(val??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = (s) => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const safeUrl = (val) => {try{const url=new URL(String(val||''));return url.protocol==='https:'&&url.hostname.includes('.')?url.href:'#'}catch{return '#'}};
  function readFavs(){try{const data=JSON.parse(localStorage.getItem(FAVORITES_KEY)||'[]');return new Set(Array.isArray(data)?data.filter(x=>typeof x==='string'):[])}catch{return new Set()}}
  let favorites = new Set([...readFavs()].filter(id=>places.some(p=>p.id===id)));
  function storeFavs(){try{localStorage.setItem(FAVORITES_KEY,JSON.stringify([...favorites]))}catch{/* Navegação privada: sessão atual ainda funciona */}}
  const categoryLabel = id => categories[id]?.label || 'Outros';
  function getFallbackMark(place){
    // Monograma próprio: evita imagens quebradas quando um estabelecimento não tem logotipo.
    const letters=String(place.name||'SC').trim().split(/\s+/).filter(Boolean).slice(0,2).map(word=>word[0].toUpperCase()).join('').slice(0,2)||'SC';
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="27" fill="#d9f3bb"/><circle cx="96" cy="25" r="15" fill="#b8df8c"/><text x="60" y="75" fill="#1d503b" font-family="Arial,sans-serif" font-size="42" font-weight="800" text-anchor="middle">'+escapeHtml(letters)+'</text></svg>';
    return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
  }
  function getMark(place){
    if(/^https:\/\//i.test(place.logoUrl||'')) return place.logoUrl;
    if(place.linkType==='site' && /^https:\/\//i.test(place.url||'')){
      try {return 'https://www.google.com/s2/favicons?domain='+encodeURIComponent(new URL(place.url).hostname)+'&sz=128'} catch {}
    }
    return getFallbackMark(place);
  }
  function linkTitle(place){return place.linkType==='guia'?'Consultar guia':place.linkType==='canais'?'Ver canais':place.id==='passagens'?'Consultar passagens':'Visitar site'}
  function getMapUrl(place){return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([place.name,place.address,'Santa Cruz do Sul, RS, Brasil'].filter(Boolean).join(', '))}`}
  function matching(){
    const terms=normalize(state.search).split(/\s+/).filter(Boolean);
    const filtered=places.filter(p=>{
      if(state.category!=='todos'&&p.category!==state.category)return false;
      if(state.favoritesOnly&&!favorites.has(p.id))return false;
      if(terms.length){const hay=normalize([p.name,p.description,p.subtitle,p.address,p.category,categoryLabel(p.category),...(p.tags||[])].join(' '));if(!terms.every(t=>hay.includes(t)))return false}
      return true;
    });
    if(state.sort==='recent')filtered.sort((a,b)=>Date.parse(b.createdAt||0)-Date.parse(a.createdAt||0)||a.name.localeCompare(b.name,locale));
    if(state.sort==='name')filtered.sort((a,b)=>a.name.localeCompare(b.name,locale));
    if(state.sort==='category')filtered.sort((a,b)=>categoryLabel(a.category).localeCompare(categoryLabel(b.category),locale)||a.name.localeCompare(b.name,locale));
    return filtered;
  }
  function favoriteButton(p){const pressed=favorites.has(p.id);return `<button type="button" class="bookmark" data-favorite="${escapeHtml(p.id)}" aria-pressed="${pressed}" aria-label="${pressed?'Remover '+escapeHtml(p.name)+' dos favoritos':'Salvar '+escapeHtml(p.name)+' nos favoritos'}" title="${pressed?'Remover dos favoritos':'Salvar nos favoritos'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l7.6-7.6 1.2-1.2a5.4 5.4 0 0 0 0-7.6Z"/></svg></button>`}
  function placeCard(p,showNew=false){
    const isGuide=p.linkType==='guia';
    const phoneDigits=String(p.phone||'').replace(/\D/g,'');
    const phone=phoneDigits.length>=10&&phoneDigits.length<=13?'<a class="phone-link" href="tel:+'+(phoneDigits.startsWith('55')?phoneDigits:'55'+phoneDigits)+'" aria-label="Ligar para '+escapeHtml(p.name)+'">Ligar ↗</a>':'';
    const map=p.address?`<a href="${escapeHtml(getMapUrl(p))}" class="map-link" target="_blank" rel="noopener noreferrer" aria-label="Ver ${escapeHtml(p.name)} no mapa">Ver no mapa ↗</a>`:'';
    return `<article class="place-card"><div class="place-top"><img class="place-mark" src="${escapeHtml(getMark(p))}" data-fallback="${escapeHtml(getFallbackMark(p))}" alt="Ícone de ${escapeHtml(p.name)}" width="51" height="51" loading="lazy"><div class="place-name-block"><div class="place-category">${escapeHtml(categoryLabel(p.category))}${showNew?'<span class="new-place-badge">NOVO</span>':''}</div><h3>${escapeHtml(p.name)}</h3></div>${favoriteButton(p)}</div><p class="place-description">${escapeHtml(p.description)}</p><div class="place-bottom">${p.address?`<span class="place-address" title="${escapeHtml(p.address)}">⌖ ${escapeHtml(p.address)}</span>`:`<span class="place-address">${escapeHtml(p.subtitle)}</span>`}<div class="place-actions"><a href="${escapeHtml(safeUrl(p.url))}" class="place-link" data-place-visit="${escapeHtml(p.id)}" target="_blank" rel="noopener noreferrer" aria-label="${linkTitle(p)}: ${escapeHtml(p.name)} (abre em nova guia)">${linkTitle(p)} <span aria-hidden="true">↗</span></a>${phone}${map||`<span class="place-type">${isGuide?'Guia público':'Link externo'}</span>`}</div></div></article>`;
  }
  function featuredCard(p){return `<a href="${escapeHtml(safeUrl(p.url))}" class="feature-card" data-place-visit="${escapeHtml(p.id)}" target="_blank" rel="noopener noreferrer" aria-label="Conhecer ${escapeHtml(p.name)} (abre em nova guia)"><div class="feature-top"><img class="place-mark" src="${escapeHtml(getMark(p))}" data-fallback="${escapeHtml(getFallbackMark(p))}" alt="" loading="lazy" width="56" height="56"><span class="feature-arrow" aria-hidden="true">↗</span></div><span class="feature-cat">${escapeHtml(categoryLabel(p.category))}</span><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.subtitle)}</p></a>`}
  function renderCategories(){const grid=$('categoryGrid');grid.innerHTML=Object.entries(categories).map(([id,c])=>`<button type="button" class="category-tile" data-category="${escapeHtml(id)}" aria-label="Ver ${escapeHtml(c.label)}"><span class="category-symbol" style="--tint:${escapeHtml(c.tint)}">${icon(c.icon)}</span><strong>${escapeHtml(c.label)}</strong><span>${escapeHtml(c.description)}</span></button>`).join('')}
  function renderChips(){
    const grid=$('filterChips');
    if(!grid.dataset.initialized){
      const counts=Object.fromEntries(Object.keys(categories).map(k=>[k,places.filter(p=>p.category===k).length]));
      const list=[['todos','Todos',places.length],...Object.entries(categories).map(([k,v])=>[k,v.label,counts[k]])];
      grid.innerHTML=list.map(([id,label,count])=>'<button type="button" class="filter-chip" data-filter="'+escapeHtml(id)+'" aria-pressed="false">'+escapeHtml(label)+' <span class="chip-count">'+count+'</span></button>').join('');
      grid.dataset.initialized='true';
    }
    grid.querySelectorAll('[data-filter]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.filter===state.category)));
  }
  function updateBadges(){const n=favorites.size;$('favoriteCount').textContent=n;$('favoriteCount').hidden=!n;$('favoritesFilter').setAttribute('aria-pressed',String(state.favoritesOnly));$('favoritesFilter').setAttribute('aria-label',state.favoritesOnly?'Exibindo favoritos; clique para mostrar todos':'Mostrar somente favoritos');$('clearSearch').hidden=!state.search}
  function render(){
    const filtered=matching(),visible=filtered.slice(0,state.limit);
    $('directoryGrid').innerHTML=visible.map(placeCard).join('');
    $('resultsInfo').innerHTML=window.SC_DATA_ERROR?'Catálogo temporariamente indisponível. Tente atualizar a página.':(filtered.length?`Exibindo <strong>${visible.length}</strong> de <strong>${filtered.length}</strong> ${filtered.length===1?'local':'locais'}`:'Nenhum local encontrado');
    const failed=Boolean(window.SC_DATA_ERROR);
    $('emptyState').hidden=Boolean(filtered.length)&&!failed;
    $('emptyTitle').textContent=failed?'Catálogo temporariamente indisponível':'Nenhum resultado por aqui';
    $('emptyDescription').textContent=failed?'Não conseguimos carregar os estabelecimentos agora. Verifique sua conexão e tente novamente.':'Tente outro termo ou limpe os filtros para descobrir novos lugares.';
    $('resetFilters').textContent=failed?'Tentar novamente':'Limpar filtros';
    $('loadMoreWrap').hidden=filtered.length<=state.limit;
    $('totalCount').textContent=`${places.length} lugares para descobrir`;
    if ($('heroPlaceCount')) $('heroPlaceCount').textContent=String(places.length);
    renderChips();updateBadges();
  }
  function renderLatest(){
    const grid=$('latestGrid');
    if(!grid)return;
    const recent=[...places].sort((a,b)=>(Date.parse(b.createdAt||0)||0)-(Date.parse(a.createdAt||0)||0)||a.name.localeCompare(b.name,locale)).slice(0,6);
    grid.innerHTML=recent.map(p=>placeCard(p,true)).join('');
    grid.closest('.latest-section').hidden=recent.length===0;
  }
  let toastTimer;
  function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2500)}
  function selectCategory(id,scroll=true){state.category=Object.hasOwn(categories,id)?id:'todos';state.limit=9;state.favoritesOnly=false;render();if(scroll)$('catalogo').scrollIntoView({behavior:'smooth',block:'start'})}
  function setSearch(term,scroll=false){state.search=term;$('directoryInput').value=term;$('heroInput').value=term;state.limit=9;render();if(scroll)$('catalogo').scrollIntoView({behavior:'smooth',block:'start'})}
  function reset(){state.category='todos';state.search='';state.favoritesOnly=false;state.sort='recommended';state.limit=9;$('heroInput').value='';$('directoryInput').value='';$('sortBy').value='recommended';render()}
  document.addEventListener('error', e => {
    const image=e.target;
    if(!(image instanceof HTMLImageElement) || !image.classList.contains('place-mark')) return;
    if(image.dataset.fallback){
      const path=image.dataset.fallback;
      delete image.dataset.fallback;
      image.src=path;
    } else if(!image.src.endsWith('/assets/logo.svg')) image.src='assets/logo.svg';
  }, true);
  renderCategories();
  $('featuredGrid').innerHTML=places.filter(p=>p.featured).slice(0,6).map(featuredCard).join('');
  renderLatest();

  // Mede somente cliques nos links externos, sem identificar visitantes.
  // Deduplicação local de 10 minutos reduz contagens acidentais, não é proteção antibot.
  document.addEventListener('click', event => {
    const link=event.target.closest('a[data-place-visit]');
    if(!link)return;
    const placeId=link.dataset.placeVisit||'';
    if(!places.some(p=>p.id===placeId && /^https:\/\//i.test(p.url)))return;
    const config=window.SC_SUPABASE||{};
    const base=String(config.url||'').replace(/\/+$/,'');
    const pubKey=String(config.publishableKey||'');
    if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(base)||!pubKey.startsWith('sb_publishable_'))return;
    const dedupKey='scc:visit:'+placeId;
    try {
      const previous=Number(sessionStorage.getItem(dedupKey)||0);
      if(Date.now()-previous<600000)return;
      sessionStorage.setItem(dedupKey,String(Date.now()));
    } catch { /* Não bloquear a navegação se armazenamento indisponível */ }
    fetch(base+'/rest/v1/place_clicks',{
      method:'POST',
      headers:{'apikey':pubKey,'Content-Type':'application/json','Prefer':'return=minimal'},
      body:JSON.stringify({place_id:placeId}),
      keepalive:true
    }).catch(()=>{ /* Métrica auxiliar nunca impede a abertura do site externo */ });
  });
  $('year').textContent=new Date().getFullYear();
  render();
  $('categoryGrid').addEventListener('click',e=>{const btn=e.target.closest('[data-category]');if(btn)selectCategory(btn.dataset.category)});
  $('filterChips').addEventListener('click',e=>{const btn=e.target.closest('[data-filter]');if(btn)selectCategory(btn.dataset.filter,false)});
  $('heroSearch').addEventListener('submit',e=>{e.preventDefault();selectCategory('todos',false);setSearch($('heroInput').value,true)});
  $('heroInput').addEventListener('input',e=>{ /* Pesquisa do hero só é aplicada quando o visitante confirma */ });
  $('directoryInput').addEventListener('input',e=>setSearch(e.target.value));
  $('clearSearch').addEventListener('click',()=>{setSearch('');$('directoryInput').focus()});
  $('sortBy').addEventListener('change',e=>{state.sort=e.target.value;state.limit=9;render()});
  $('loadMore').addEventListener('click',()=>{state.limit+=9;render()});
  $('resetFilters').addEventListener('click',()=>window.SC_DATA_ERROR?window.location.reload():reset());
  document.addEventListener('click',event=>{
    const btn=event.target.closest('[data-favorite]');
    if(!btn)return;
    const id=btn.dataset.favorite;
    const p=places.find(item=>item.id===id);
    if(!p)return;
    const fromLatest=Boolean(btn.closest('#latestGrid'));
    if(favorites.has(id)){favorites.delete(id);toast(p.name+' removido dos favoritos')}
    else{favorites.add(id);toast(p.name+' salvo nos favoritos')}
    storeFavs();render();renderLatest();
    const container=$(fromLatest?'latestGrid':'directoryGrid');
    const target=[...container.querySelectorAll('[data-favorite]')].find(item=>item.dataset.favorite===id);
    if(target)target.focus({preventScroll:true});
  });
  $('favoritesFilter').addEventListener('click',()=>{state.favoritesOnly=!state.favoritesOnly;state.limit=9;render()});
  $('favoritesTop').addEventListener('click',()=>{state.favoritesOnly=true;state.category='todos';state.search='';state.limit=9;$('heroInput').value='';$('directoryInput').value='';render();$('catalogo').scrollIntoView({behavior:'smooth',block:'start'});if(!favorites.size)toast('Toque no coração de um local para salvá-lo')});
  document.querySelectorAll('[data-quick]').forEach(btn=>btn.addEventListener('click',()=>selectCategory(btn.dataset.quick)));
  const menu=$('mobileNav'),menuBtn=$('menuBtn');
  menuBtn.addEventListener('click',()=>{const open=menu.hasAttribute('hidden');if(open)menu.removeAttribute('hidden');else menu.setAttribute('hidden','');menuBtn.setAttribute('aria-expanded',String(open));menuBtn.setAttribute('aria-label',open?'Fechar menu':'Abrir menu')});
  const closeMobileMenu=()=>{
    menu.setAttribute('hidden','');
    menuBtn.setAttribute('aria-expanded','false');
    menuBtn.setAttribute('aria-label','Abrir menu');
  };
  menu.addEventListener('click',event=>{if(event.target.closest('a'))closeMobileMenu()});
  document.addEventListener('click',event=>{
    if(!menu.hasAttribute('hidden')&&!menu.contains(event.target)&&!menuBtn.contains(event.target))closeMobileMenu();
  });
  window.addEventListener('resize',()=>{if(window.innerWidth>=900)closeMobileMenu()});
  // Solicitações são guardadas em fila privada no Supabase e revisadas antes de publicar.
  // O WhatsApp é uma alternativa oferecida pelo próprio visitante.
  const businessDialog = $('businessDialog');
  const businessForm = $('businessForm');
  if (businessDialog && businessForm) {
    const categorySelect = $('businessCategory');
    Object.entries(categories).forEach(([id, category]) => {
      const option=document.createElement('option');
      option.value=id;
      option.textContent=category.label;
      categorySelect.appendChild(option);
    });
    let focusBeforeDialog=null;
    const closeBusinessDialog=()=>{
      if(businessDialog.open) businessDialog.close();
      if(focusBeforeDialog && typeof focusBeforeDialog.focus === 'function') focusBeforeDialog.focus();
    };
    document.querySelectorAll('[data-open-submission]').forEach(button=>button.addEventListener('click',()=>{
      focusBeforeDialog=document.activeElement;
      closeMobileMenu();
      if(!businessDialog.open) businessDialog.showModal();
      businessForm.elements.namedItem('name').focus();
    }));
    $('closeBusinessDialog').addEventListener('click',closeBusinessDialog);
    businessDialog.addEventListener('click',event=>{if(event.target===businessDialog)closeBusinessDialog()});
    businessDialog.addEventListener('close',()=>{
      if(focusBeforeDialog && typeof focusBeforeDialog.focus === 'function') focusBeforeDialog.focus();
    });
    const result=$('businessResult');
    const submit=$('businessSubmitButton');
    const notice=(text,error=false)=>{
      result.textContent=text;
      result.hidden=false;
      result.classList.toggle('is-error',error);
    };
    const getValues=()=>{
      const data=new FormData(businessForm);
      const v=(name,max)=>String(data.get(name)||'').trim().slice(0,max);
      return { name:v('name',120),category:v('category',80),address:v('address',180),
        contact:v('contact',90),email:v('email',160).toLowerCase(),
        site:v('site',220),phone:v('phone',30),details:v('details',450),
        consent:data.get('permission')==='on',honeypot:v('company_confirmation',200)};
    };
    const validateValues=values=>{
      if(!businessForm.reportValidity()) return false;
      if(!categories[values.category]||!values.consent) return false;
      return Boolean(values.name&&values.contact&&values.address&&values.email);
    };
    const whatsappMessage=values=>{
      const lines=[
        'Olá! Gostaria de indicar um comércio para o Santa Cruz Conecta.','',
        '🏪 Comércio: '+values.name,
        '📌 Categoria: '+(categories[values.category]?.label||'Outros'),
        '📍 Bairro/endereço: '+values.address,
        '👤 Contato: '+values.contact,
        '✉️ E-mail: '+values.email
      ];
      if(values.site) lines.push('🔗 Site/Instagram: '+values.site);
      if(values.phone) lines.push('📞 Telefone: '+values.phone);
      if(values.details) lines.push('📝 Sobre o negócio: '+values.details);
      lines.push('','Declaro ter autorização para indicar estes dados, sujeitos à análise editorial.');
      return 'https://wa.me/'+CONTACT_WHATSAPP+'?text='+encodeURIComponent(lines.join('\n'));
    };
    $('businessWhatsappFallback').addEventListener('click',()=>{
      const values=getValues();
      if(!validateValues(values))return;
      window.open(whatsappMessage(values),'_blank','noopener,noreferrer');
    });
    let submitting=false;
    businessForm.addEventListener('submit',async event=>{
      event.preventDefault();
      if(submitting)return;
      const v=getValues();
      if(!validateValues(v))return;
      if(v.honeypot){notice('Solicitação recebida para análise.');return;}
      const config=window.SC_SUPABASE||{};
      const base=String(config.url||'').replace(/\/+$/,'');
      const key=String(config.publishableKey||'');
      if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(base)||!key.startsWith('sb_publishable_')){
        notice('Cadastro temporariamente indisponível. Use a opção WhatsApp.',true);return;
      }
      submitting=true;
      submit.disabled=true;
      submit.textContent='Enviando...';
      result.hidden=true;
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),14000);
      try{
        const response=await fetch(base+'/rest/v1/business_submissions',{
          method:'POST',
          headers:{apikey:key,'Content-Type':'application/json',Prefer:'return=minimal'},
          body:JSON.stringify({
            business_name:v.name,category:v.category,address:v.address,
            contact_name:v.contact,contact_email:v.email,social_url:v.site,
            phone:v.phone,details:v.details,consent:true
          }),
          signal:controller.signal
        });
        if(!response.ok){
          const error=await response.json().catch(()=>({}));
          if(error.code==='23505')throw Error('Já existe uma solicitação pendente para este comércio e e-mail.');
          if(error.code==='23514')throw Error('Os dados são inválidos ou o limite de envios foi atingido. Tente mais tarde.');
          throw Error('Não foi possível registrar agora. Tente novamente ou use o WhatsApp.');
        }
        businessForm.reset();
        notice('Sua solicitação foi registrada! Nossa equipe poderá entrar em contato pelo e-mail informado. A publicação depende de aprovação.');
        toast('Pedido enviado para análise com sucesso.');
      }catch(error){
        notice(error.name==='AbortError'?'O envio demorou demais. Confira sua conexão antes de tentar novamente.':error.message,true);
      }finally{
        clearTimeout(timeout);
        submitting=false;
        submit.disabled=false;
        submit.textContent='Enviar solicitação ↗';
      }
    });
  }
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hasAttribute('hidden')){closeMobileMenu();menuBtn.focus()}if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!/input|textarea/i.test(document.activeElement?.tagName||'')){e.preventDefault();$('directoryInput').focus();$('catalogo').scrollIntoView({behavior:'smooth',block:'start'})}});
})();
