-- PWA instalada pelo navegador: métrica aproximada sem identificadores pessoais.
create table if not exists public.pwa_install_events (
  id bigint generated always as identity primary key,
  platform text not null check (platform in ('android','desktop','other')),
  created_at timestamptz not null default now()
);
create index if not exists pwa_install_events_created_at_idx on public.pwa_install_events(created_at desc);
alter table public.pwa_install_events enable row level security;
revoke all on public.pwa_install_events from public,anon,authenticated;
grant insert(platform) on public.pwa_install_events to anon;
grant select on public.pwa_install_events to authenticated;

drop policy if exists "visitor may register browser installation" on public.pwa_install_events;
create policy "visitor may register browser installation" on public.pwa_install_events
  for insert to anon with check (platform in ('android','desktop','other'));
drop policy if exists "admins read browser installations" on public.pwa_install_events;
create policy "admins read browser installations" on public.pwa_install_events
  for select to authenticated using (
    exists(select 1 from public.admin_users a where a.user_id=(select auth.uid()))
  );

create or replace view public.pwa_install_summary with (security_invoker = true) as
select
  count(e.id)::bigint as installs_total,
  count(e.id) filter (where e.created_at >= now()-interval '7 days')::bigint as installs_7d,
  count(e.id) filter (where e.created_at >= now()-interval '30 days')::bigint as installs_30d,
  count(e.id) filter (where e.platform = 'android')::bigint as android_total,
  max(e.created_at) as last_installed_at
from public.admin_users a
left join public.pwa_install_events e on true
where a.user_id=(select auth.uid())
group by a.user_id;
revoke all on public.pwa_install_summary from public,anon,authenticated;
grant select on public.pwa_install_summary to authenticated;

create schema if not exists app_private;
revoke all on schema app_private from public,anon,authenticated;
create or replace function app_private.limit_pwa_installs()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(new.platform));
  if (select count(*) from public.pwa_install_events x
      where x.platform=new.platform and x.created_at > now()-interval '1 minute') >= 30
    or (select count(*) from public.pwa_install_events x
      where x.platform=new.platform and x.created_at > now()-interval '24 hours') >= 800
  then
    raise exception 'Temporariamente indisponivel' using errcode='23514';
  end if;
  return new;
end;
$$;
revoke all on function app_private.limit_pwa_installs() from public,anon,authenticated;
drop trigger if exists pwa_install_guard on public.pwa_install_events;
create trigger pwa_install_guard before insert on public.pwa_install_events
  for each row execute function app_private.limit_pwa_installs();
