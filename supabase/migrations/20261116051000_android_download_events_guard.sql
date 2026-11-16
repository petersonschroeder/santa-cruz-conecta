-- Limite de eventos de download público: apenas contagem sem identificadores pessoais.
create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;
create or replace function app_private.guard_android_download_event()
returns trigger language plpgsql security definer
set search_path=''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(new.app_version));
  if (select count(*) from public.android_download_events e
      where e.app_version=new.app_version and e.created_at > now()-interval '1 minute') >= 60
    or (select count(*) from public.android_download_events e
      where e.app_version=new.app_version and e.created_at > now()-interval '1 day') >= 2000
  then
    raise exception 'Limite temporário de registros de download atingido.' using errcode='23514';
  end if;
  return new;
end;
$$;
revoke all on function app_private.guard_android_download_event() from public,anon,authenticated;
drop trigger if exists android_download_guard on public.android_download_events;
create trigger android_download_guard before insert on public.android_download_events
  for each row execute function app_private.guard_android_download_event();
