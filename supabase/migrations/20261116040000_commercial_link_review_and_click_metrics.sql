-- Revisão de links e métricas de saída (sem armazenar IP, e-mail ou identificador do visitante).
alter table public.places add column if not exists link_review_status text not null default 'pending';
alter table public.places add column if not exists last_link_reviewed_at timestamptz;
do $$ begin
 if not exists(select 1 from pg_constraint where conname='places_link_review_status_check' and conrelid='public.places'::regclass) then
   alter table public.places add constraint places_link_review_status_check check(link_review_status in ('pending','reviewed','needs_review'));
 end if;
end $$;
create table if not exists public.place_clicks (
 id bigint generated always as identity primary key,
 place_id text not null references public.places(id) on delete cascade,
 clicked_at timestamptz not null default now()
);
create index if not exists place_clicks_date_idx on public.place_clicks(clicked_at desc);
create index if not exists place_clicks_place_date_idx on public.place_clicks(place_id,clicked_at desc);
alter table public.place_clicks enable row level security;
revoke all on public.place_clicks from public,anon,authenticated;
grant insert(place_id) on public.place_clicks to anon;
grant select on public.place_clicks to authenticated;
drop policy if exists "visitor logs click on published place" on public.place_clicks;
create policy "visitor logs click on published place" on public.place_clicks
for insert to anon with check(exists(
 select 1 from public.places p where p.id=place_id and p.is_published=true
));
drop policy if exists "admins read click analytics" on public.place_clicks;
create policy "admins read click analytics" on public.place_clicks
for select to authenticated using(exists(
 select 1 from public.admin_users a where a.user_id=(select auth.uid())
));
create or replace view public.place_click_summary with(security_invoker=true) as
select p.id as place_id,p.name as place_name,p.category,
 count(c.id)::bigint as clicks_total,
 count(c.id) filter(where c.clicked_at>=now()-interval '7 days')::bigint as clicks_7d,
 count(c.id) filter(where c.clicked_at>=now()-interval '30 days')::bigint as clicks_30d,
 max(c.clicked_at) as last_clicked_at
from public.places p left join public.place_clicks c on c.place_id=p.id
group by p.id,p.name,p.category;
revoke all on public.place_click_summary from public,anon,authenticated;
grant select on public.place_click_summary to authenticated;
