
-- Limite operacional para eventos públicos anônimos: impede crescimento irrestrito por loja.
create schema if not exists app_private;
revoke all on schema app_private from public,anon,authenticated;

create or replace function app_private.limit_place_clicks()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(new.place_id));
  if (select count(*) from public.place_clicks c
       where c.place_id=new.place_id and c.clicked_at > now()-interval '1 minute') >= 30
     or (select count(*) from public.place_clicks c
         where c.place_id=new.place_id and c.clicked_at > now()-interval '24 hours') >= 600 then
    raise exception 'Limite temporario de cliques atingido' using errcode='23514';
  end if;
  return new;
end;
$$;
revoke all on function app_private.limit_place_clicks() from public,anon,authenticated;
drop trigger if exists place_click_limit_guard on public.place_clicks;
create trigger place_click_limit_guard before insert on public.place_clicks
for each row execute function app_private.limit_place_clicks();
