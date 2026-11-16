/* Prioriza catálogo publicado no Supabase; mantém curadoria local como fallback. */
window.SC_DATA_READY = (async () => {
  const config = window.SC_SUPABASE || {};
  const url = String(config.url || '').replace(/\/+$/, '');
  const key = String(config.publishableKey || '');
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url) || !key) return;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);
    let response;
    try {
      response = await fetch(`${url}/rest/v1/places?select=*&is_published=eq.true&order=name.asc&limit=1000`, {
        headers: { apikey: key },
        signal: controller.signal,
        cache: 'no-store'
      });
    } finally { clearTimeout(timeout); }
    if (!response.ok) throw new Error(`Supabase REST: ${response.status}`);
    const rows = await response.json();
    if (!Array.isArray(rows) || rows.length === 0) return;
    const validCategories = new Set(Object.keys(window.SC_CATEGORIES || {}));
    const places = rows.filter(p => p && typeof p.id === 'string' && validCategories.has(p.category)
        && /^https:\/\//.test(p.website_url || ''))
      .map(p => ({
        id: p.id, name: p.name, category: p.category, description: p.description || '',
        url: p.website_url, linkType: p.link_type || 'site', featured: !!p.featured,
        subtitle: p.subtitle || '', address: p.address || '', phone: p.phone || '',
        tags: Array.isArray(p.tags) ? p.tags : [], mark: p.mark || '',
        palette: p.palette || null, source: p.source_url || ''
      }));
    if (places.length) window.SC_PLACES = places;
  } catch (error) {
    console.warn('Santa Cruz Conecta: mantendo catálogo local', error);
  }
})();
