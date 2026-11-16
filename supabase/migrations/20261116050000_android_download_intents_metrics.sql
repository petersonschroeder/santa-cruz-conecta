-- Métricas do aplicativo: contabilizam inícios de download, não instalações concluídas.
create table if not exists public.android_download_events(
  id bigint generated always as identity primary key,
  app_version text not null,
  source text not null default 'site',
  created_at timestamptz not null default now(),
  constraint ade_version_format check (app_version ~ '^android-v[0-9]+\.[0-9]+\.[0-9]+(-beta\.[0-9]+)?$'),
  constraint ade_valid_source check (source in ('site','admin','qrcode'))
);
create index if not exists ade_created_at_idx on public.android_download_events(created_at desc);
alter table public.android_download_events enable row level security;
revoke all on public.android_download_events from public, anon, authenticated;
grant insert(app_version,source) on public.android_download_events to anon;
grant select on public.android_download_events to authenticated;

drop policy if exists "public may register a download intent" on public.android_download_events;
create policy "public may register a download intent"
on public.android_download_events for insert to anon with check (
  app_version ~ '^android-v[0-9]+\.[0-9]+\.[0-9]+(-beta\.[0-9]+)?$'
  and source in ('site','admin','qrcode')
);
drop policy if exists "only admins may see download events" on public.android_download_events;
create policy "only admins may see download events"
on public.android_download_events for select to authenticated using (
  exists (select 1 from public.admin_users a where a.user_id=(select auth.uid()))
);

create or replace view public.android_download_summary with (security_invoker = true) as
select
  count(e.id)::bigint as initiated_total,
  count(e.id) filter (where e.created_at>=now()-interval '7 days')::bigint as initiated_7d,
  count(e.id) filter (where e.created_at>=now()-interval '30 days')::bigint as initiated_30d,
  max(e.created_at) as last_initiated_at
from public.android_download_events e
where exists (select 1 from public.admin_users a where a.user_id=(select auth.uid()));
revoke all on public.android_download_summary from public, anon, authenticated;
grant select on public.android_download_summary to authenticated;
