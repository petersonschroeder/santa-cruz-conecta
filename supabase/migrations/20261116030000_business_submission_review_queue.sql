-- Santa Cruz Conecta | Fila de indicações com privacidade e moderação.
-- Migração já aplicada no projeto de produção (business_submission_review_queue).
create table if not exists public.business_submissions (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  category text not null,
  address text not null,
  contact_name text not null,
  contact_email text not null,
  social_url text not null default '',
  phone text not null default '',
  details text not null default '',
  consent boolean not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  review_notes text not null default '',
  published_place_id text references public.places(id) on delete set null,
  constraint bs_valid_fields check (
    char_length(btrim(business_name)) between 2 and 120
    and category in ('mercados','farmacias','restaurantes','bares','turismo','hoteis','comercio','educacao','noticias','eventos','servicos')
    and char_length(btrim(address)) between 3 and 180
    and char_length(btrim(contact_name)) between 2 and 90
    and char_length(contact_email) between 5 and 160
    and contact_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
    and char_length(social_url) <= 220 and char_length(phone) <= 30
    and char_length(details) <= 450 and char_length(review_notes) <= 600
    and consent = true and status in ('pending','approved','rejected')
  )
);
create index if not exists bs_status_created_idx on public.business_submissions(status,created_at desc);
create index if not exists bs_email_created_idx on public.business_submissions(contact_email,created_at desc);
create unique index if not exists bs_one_pending_per_business_idx
  on public.business_submissions(lower(btrim(contact_email)),lower(btrim(business_name)))
  where status='pending';
alter table public.business_submissions enable row level security;
revoke all on public.business_submissions from public,anon,authenticated;
grant insert (business_name,category,address,contact_name,contact_email,social_url,phone,details,consent)
  on public.business_submissions to anon;
grant select,update,delete on public.business_submissions to authenticated;
drop policy if exists "visitor submits a request without reading it" on public.business_submissions;
create policy "visitor submits a request without reading it" on public.business_submissions
  for insert to anon with check (
    status='pending' and consent=true and reviewed_at is null
    and reviewed_by is null and published_place_id is null);
drop policy if exists "only admins can read requests" on public.business_submissions;
create policy "only admins can read requests" on public.business_submissions
  for select to authenticated using (
    exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));
drop policy if exists "only admins can update requests" on public.business_submissions;
create policy "only admins can update requests" on public.business_submissions
  for update to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())))
  with check (exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));
drop policy if exists "only admins can delete requests" on public.business_submissions;
create policy "only admins can delete requests" on public.business_submissions
  for delete to authenticated using (
    exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));

create or replace function public.guard_business_submission()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  new.contact_email:=lower(pg_catalog.btrim(new.contact_email));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(new.contact_email));
  if (select count(*) from public.business_submissions s
       where s.contact_email=new.contact_email and s.created_at>now()-interval '24 hours')>=3 then
    raise exception 'Limite de 3 indicacoes por email a cada 24 horas.' using errcode='23514';
  end if;
  return new;
end;
$$;
revoke all on function public.guard_business_submission() from public,anon,authenticated;
drop trigger if exists bs_guard_insert on public.business_submissions;
create trigger bs_guard_insert before insert on public.business_submissions
  for each row execute function public.guard_business_submission();

create or replace function public.approve_business_submission(
  p_request_id uuid, p_name text, p_description text, p_website_url text,
  p_link_type text, p_subtitle text, p_phone text, p_logo_url text, p_publish boolean
) returns text language plpgsql security invoker set search_path=''
as $$
declare item public.business_submissions%rowtype; new_id text;
begin
  if (select auth.uid()) is null or not exists(
    select 1 from public.admin_users a where a.user_id=(select auth.uid())
  ) then
    raise exception 'Acesso restrito a administradores.' using errcode='42501';
  end if;
  select * into item from public.business_submissions
    where id=p_request_id and status='pending' for update;
  if not found then
    raise exception 'Solicitacao nao encontrada ou ja processada.' using errcode='P0002';
  end if;
  new_id:='indicado-'||replace(item.id::text,'-','');
  insert into public.places(id,name,category,description,website_url,link_type,featured,
    subtitle,address,phone,tags,mark,logo_url,source_url,is_published)
  values(new_id,p_name,item.category,p_description,p_website_url,p_link_type,false,
    coalesce(p_subtitle,''),item.address,coalesce(p_phone,''),array[]::text[],
    left(upper(left(p_name,2)),10),coalesce(p_logo_url,''),p_website_url,coalesce(p_publish,false));
  update public.business_submissions set status='approved',reviewed_at=now(),
    reviewed_by=(select auth.uid()),published_place_id=new_id where id=item.id;
  return new_id;
end;
$$;
revoke all on function public.approve_business_submission(uuid,text,text,text,text,text,text,text,boolean)
  from public,anon;
grant execute on function public.approve_business_submission(uuid,text,text,text,text,text,text,text,boolean)
  to authenticated;
