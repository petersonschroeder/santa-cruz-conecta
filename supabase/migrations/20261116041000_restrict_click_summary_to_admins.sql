
-- Restringir também a visão agregada: contas sem perfil admin não recebem linhas.
create or replace view public.place_click_summary
with (security_invoker = true) as
select
  p.id as place_id, p.name as place_name, p.category,
  count(c.id)::bigint as clicks_total,
  count(c.id) filter (where c.clicked_at >= now()-interval '7 days')::bigint as clicks_7d,
  count(c.id) filter (where c.clicked_at >= now()-interval '30 days')::bigint as clicks_30d,
  max(c.clicked_at) as last_clicked_at
from public.places p
left join public.place_clicks c on c.place_id=p.id
where exists (select 1 from public.admin_users a where a.user_id=(select auth.uid()))
group by p.id,p.name,p.category;
revoke all on public.place_click_summary from public,anon,authenticated;
grant select on public.place_click_summary to authenticated;
