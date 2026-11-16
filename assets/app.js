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
  const safeUrl = (val) => /^https:\/\//i.test(val||'') ? val : '#';
  function readFavs(){try{const data=JSON.parse(localStorage.getItem(FAVORITES_KEY)||'[]');return new Set(Array.isArray(data)?data.filter(x=>typeof x==='string'):[])}catch{return new Set()}}
  let favorites = readFavs();
  function storeFavs(){try{localStorage.setItem(FAVORITES_KEY,JSON.stringify([...favorites]))}catch{/* Navegação privada: sessão atual ainda funciona */}}
  const categoryLabel = id => categories[id]?.label || 'Outros';
  function getMark(place){return `assets/brands/${encodeURIComponent(place.id)}.svg`}
  function linkTitle(place){return place.linkType==='guia'?'Ver guia oficial':place.linkType==='canais'?'Ver canais oficiais':place.id==='passagens'?'Consultar passagens':'Visitar site'}
  function getMapUrl(place){return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([place.name,place.address,'Santa Cruz do Sul, RS, Brasil'].filter(Boolean).join(', '))}`}
  function matching(){
    const terms=normalize(state.search).split(/\s+/).filter(Boolean);
    const filtered=places.filter(p=>{
      if(state.category!=='todos'&&p.category!==state.category)return false;
      if(state.favoritesOnly&&!favorites.has(p.id))return false;
      if(terms.length){const hay=normalize([p.name,p.description,p.subtitle,p.address,p.category,categoryLabel(p.category),...(p.tags||[])].join(' '));if(!terms.every(t=>hay.includes(t)))return false}
      return true;
    });
    if(state.sort==='name')filtered.sort((a,b)=>a.name.localeCompare(b.name,locale));
    if(state.sort==='category')filtered.sort((a,b)=>categoryLabel(a.category).localeCompare(categoryLabel(b.category),locale)||a.name.localeCompare(b.name,locale));
    return filtered;
  }
  function favoriteButton(p){const pressed=favorites.has(p.id);return `<button type="button" class="bookmark" data-favorite="${escapeHtml(p.id)}" aria-pressed="${pressed}" aria-label="${pressed?'Remover '+escapeHtml(p.name)+' dos favoritos':'Salvar '+escapeHtml(p.name)+' nos favoritos'}" title="${pressed?'Remover dos favoritos':'Salvar nos favoritos'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.4 5.4 0 0 0-7.6 0L12 5.8l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l7.6-7.6 1.2-1.2a5.4 5.4 0 0 0 0-7.6Z"/></svg></button>`}
  function placeCard(p){
    const isGuide=p.linkType==='guia';
    const map=p.address?`<a href="${escapeHtml(getMapUrl(p))}" class="map-link" target="_blank" rel="noopener noreferrer" aria-label="Ver ${escapeHtml(p.name)} no mapa">Ver no mapa ↗</a>`:'';
    return `<article class="place-card"><div class="place-top"><img class="place-mark" src="${getMark(p)}" alt="Ícone de ${escapeHtml(p.name)}" width="51" height="51" loading="lazy"><div class="place-name-block"><div class="place-category">${escapeHtml(categoryLabel(p.category))}</div><h3>${escapeHtml(p.name)}</h3></div>${favoriteButton(p)}</div><p class="place-description">${escapeHtml(p.description)}</p><div class="place-bottom">${p.address?`<span class="place-address" title="${escapeHtml(p.address)}">⌖ ${escapeHtml(p.address)}</span>`:`<span class="place-address">${escapeHtml(p.subtitle)}</span>`}<div class="place-actions"><a href="${escapeHtml(safeUrl(p.url))}" class="place-link" target="_blank" rel="noopener noreferrer" aria-label="${linkTitle(p)}: ${escapeHtml(p.name)} (abre em nova guia)">${linkTitle(p)} <span aria-hidden="true">↗</span></a>${map||`<span class="place-type">${isGuide?'Guia público':'Link externo'}</span>`}</div></div></article>`;
  }
  function featuredCard(p){return `<a href="${escapeHtml(safeUrl(p.url))}" class="feature-card" target="_blank" rel="noopener noreferrer" aria-label="Conhecer ${escapeHtml(p.name)} (abre em nova guia)"><div class="feature-top"><img class="place-mark" src="${getMark(p)}" alt="" loading="lazy" width="56" height="56"><span class="feature-arrow" aria-hidden="true">↗</span></div><span class="feature-cat">${escapeHtml(categoryLabel(p.category))}</span><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.subtitle)}</p></a>`}
  function renderCategories(){const grid=$('categoryGrid');grid.innerHTML=Object.entries(categories).map(([id,c])=>`<button type="button" class="category-tile" data-category="${escapeHtml(id)}" aria-label="Ver ${escapeHtml(c.label)}"><span class="category-symbol" style="--tint:${escapeHtml(c.tint)}">${icon(c.icon)}</span><strong>${escapeHtml(c.label)}</strong><span>${escapeHtml(c.description)}</span></button>`).join('')}
  function renderChips(){const counts=Object.fromEntries(Object.keys(categories).map(k=>[k,places.filter(p=>p.category===k).length]));const list=[['todos','Todos',places.length],...Object.entries(categories).map(([k,v])=>[k,v.label,counts[k]])];$('filterChips').innerHTML=list.map(([id,label,count])=>`<button type="button" class="filter-chip" data-filter="${id}" aria-pressed="${id===state.category}">${escapeHtml(label)} <span class="chip-count">${count}</span></button>`).join('')}
  function updateBadges(){const n=favorites.size;$('favoriteCount').textContent=n;$('favoriteCount').hidden=!n;$('favoritesFilter').setAttribute('aria-pressed',String(state.favoritesOnly));$('favoritesFilter').setAttribute('aria-label',state.favoritesOnly?'Exibindo favoritos; clique para mostrar todos':'Mostrar somente favoritos');$('clearSearch').hidden=!state.search}
  function render(){
    const filtered=matching(),visible=filtered.slice(0,state.limit);
    $('directoryGrid').innerHTML=visible.map(placeCard).join('');
    $('resultsInfo').innerHTML=filtered.length?`Exibindo <strong>${visible.length}</strong> de <strong>${filtered.length}</strong> ${filtered.length===1?'local':'locais'}`:'Nenhum local encontrado';
    $('emptyState').hidden=Boolean(filtered.length);
    $('loadMoreWrap').hidden=filtered.length<=state.limit;
    $('totalCount').textContent=`${places.length} lugares para descobrir`;
    renderChips();updateBadges();
  }
  let toastTimer;
  function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2500)}
  function selectCategory(id,scroll=true){state.category=Object.hasOwn(categories,id)?id:'todos';state.limit=9;state.favoritesOnly=false;render();if(scroll)$('catalogo').scrollIntoView({behavior:'smooth',block:'start'})}
  function setSearch(term,scroll=false){state.search=term;$('directoryInput').value=term;$('heroInput').value=term;state.limit=9;render();if(scroll)$('catalogo').scrollIntoView({behavior:'smooth',block:'start'})}
  function reset(){state.category='todos';state.search='';state.favoritesOnly=false;state.sort='recommended';state.limit=9;$('heroInput').value='';$('directoryInput').value='';$('sortBy').value='recommended';render()}
  if(!places.length){$('resultsInfo').textContent='Não foi possível carregar o catálogo.';return}
  renderCategories();
  $('featuredGrid').innerHTML=places.filter(p=>p.featured).slice(0,6).map(featuredCard).join('');
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
  $('resetFilters').addEventListener('click',reset);
  $('directoryGrid').addEventListener('click',e=>{const btn=e.target.closest('[data-favorite]');if(!btn)return;const id=btn.dataset.favorite;const p=places.find(x=>x.id===id);if(!p)return;if(favorites.has(id)){favorites.delete(id);toast(`${p.name} removido dos favoritos`)}else{favorites.add(id);toast(`${p.name} salvo nos favoritos`)}storeFavs();render()});
  $('favoritesFilter').addEventListener('click',()=>{state.favoritesOnly=!state.favoritesOnly;state.limit=9;render()});
  $('favoritesTop').addEventListener('click',()=>{state.favoritesOnly=true;state.category='todos';state.search='';state.limit=9;$('heroInput').value='';$('directoryInput').value='';render();$('catalogo').scrollIntoView({behavior:'smooth',block:'start'});if(!favorites.size)toast('Toque no coração de um local para salvá-lo')});
  document.querySelectorAll('[data-quick]').forEach(btn=>btn.addEventListener('click',()=>selectCategory(btn.dataset.quick)));
  const menu=$('mobileNav'),menuBtn=$('menuBtn');
  menuBtn.addEventListener('click',()=>{const open=menu.hasAttribute('hidden');if(open)menu.removeAttribute('hidden');else menu.setAttribute('hidden','');menuBtn.setAttribute('aria-expanded',String(open));menuBtn.setAttribute('aria-label',open?'Fechar menu':'Abrir menu')});
  menu.addEventListener('click',e=>{if(e.target.closest('a')){menu.setAttribute('hidden','');menuBtn.setAttribute('aria-expanded','false')}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hasAttribute('hidden')){menu.setAttribute('hidden','');menuBtn.setAttribute('aria-expanded','false')}if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!/input|textarea/i.test(document.activeElement?.tagName||'')){e.preventDefault();$('directoryInput').focus();$('catalogo').scrollIntoView({behavior:'smooth',block:'start'})}});
})();
