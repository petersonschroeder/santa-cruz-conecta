-- Retornar estatísticas somente para perfis explicitamente cadastrados como admin.
create or replace view public.android_download_summary with (security_invoker=true) as
select
  count(e.id)::bigint as initiated_total,
  count(e.id) filter (where e.created_at>=now()-interval '7 days')::bigint as initiated_7d,
  count(e.id) filter (where e.created_at>=now()-interval '30 days')::bigint as initiated_30d,
  max(e.created_at) as last_initiated_at
from public.admin_users a
left join public.android_download_events e on true
where a.user_id=(select auth.uid())
group by a.user_id;
revoke all on public.android_download_summary from public,anon,authenticated;
grant select on public.android_download_summary to authenticated;
