/* Publicação com fonte única no banco: nunca revelar dados despublicados via cache local. */
window.SC_DATA_READY = (async () => {
  const config = window.SC_SUPABASE || {};
  const url = String(config.url || '').replace(/\/+$/, '');
  const key = String(config.publishableKey || '');
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) || !key.startsWith('sb_publishable_')) {
    window.SC_PLACES = [];
    window.SC_DATA_ERROR = true;
    console.warn('Santa Cruz Conecta: configuração pública do Supabase inválida.');
    return;
  }
  window.SC_PLACES = []; // fail closed: nada de restauração de registros removidos
  window.SC_DATA_ERROR = false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);
    let response;
    try {
      response = await fetch(`${url}/rest/v1/places?select=id,name,category,description,logo_url,website_url,link_type,featured,subtitle,address,phone,tags,mark,source_url,created_at,updated_at&is_published=eq.true&order=name.asc&limit=1000`, {
        headers: { apikey: key },
        signal: controller.signal,
        cache: 'no-store'
      });
    } finally { clearTimeout(timeout); }
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      const errorCode = typeof body?.code === 'string' ? body.code : 'unknown';
      throw new Error(`Supabase REST: HTTP ${response.status} (${errorCode})`);
    }
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('Resposta inválida do catálogo');
    const validCategories = new Set(Object.keys(window.SC_CATEGORIES || {}));
    const places = rows.filter(p => p && typeof p.id === 'string' && validCategories.has(p.category)
        && /^https:\/\//.test(p.website_url || ''))
      .map(p => ({
        id: p.id, name: p.name, category: p.category, description: p.description || '', logoUrl: p.logo_url || '',
        url: p.website_url, linkType: p.link_type || 'site', featured: !!p.featured,
        subtitle: p.subtitle || '', address: p.address || '', phone: p.phone || '',
        tags: Array.isArray(p.tags) ? p.tags : [], mark: p.mark || '',
        source: p.source_url || '',
        createdAt: p.created_at || null, updatedAt: p.updated_at || null
      }));
    window.SC_PLACES = places;
    window.SC_SUPABASE_LOADED = true;
  } catch (error) {
    window.SC_PLACES = [];
    window.SC_DATA_ERROR = true;
    console.warn('Santa Cruz Conecta: falha ao carregar catálogo; não mostrando dados antigos', error);
  }
})();
