-- Executado no Supabase em 16/11/2026: painel editorial e armazenamento de logotipos
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
revoke all on public.admin_users from public, anon, authenticated;
grant select on public.admin_users to authenticated;
drop policy if exists "admins read own membership" on public.admin_users;
create policy "admins read own membership" on public.admin_users
for select to authenticated using ((select auth.uid()) = user_id);

alter table public.places add column if not exists logo_url text not null default '';
do $$
begin
 if not exists (select 1 from pg_constraint where conname='places_logo_url_https') then
  alter table public.places add constraint places_logo_url_https
  check (logo_url = '' or logo_url ~ '^https://');
 end if;
end $$;
revoke all on public.places from anon, authenticated;
grant select on public.places to anon, authenticated;
grant insert, update, delete on public.places to authenticated;
drop policy if exists "admins see all places" on public.places;
create policy "admins see all places" on public.places for select to authenticated
using (exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));
drop policy if exists "admins create places" on public.places;
create policy "admins create places" on public.places for insert to authenticated
with check (exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));
drop policy if exists "admins update places" on public.places;
create policy "admins update places" on public.places for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())))
with check (exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));
drop policy if exists "admins delete places" on public.places;
create policy "admins delete places" on public.places for delete to authenticated
using (exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('brand-logos','brand-logos',true,2097152,array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public=true,file_size_limit=2097152,
  allowed_mime_types=array['image/png','image/jpeg','image/webp'];
drop policy if exists "admins upload brand logos" on storage.objects;
create policy "admins upload brand logos" on storage.objects
for insert to authenticated with check (
 bucket_id='brand-logos' and exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));
drop policy if exists "admins see brand logos" on storage.objects;
create policy "admins see brand logos" on storage.objects
for select to authenticated using (
 bucket_id='brand-logos' and exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));
drop policy if exists "admins update brand logos" on storage.objects;
create policy "admins update brand logos" on storage.objects
for update to authenticated using (
 bucket_id='brand-logos' and exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())))
with check (
 bucket_id='brand-logos' and exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));
drop policy if exists "admins delete brand logos" on storage.objects;
create policy "admins delete brand logos" on storage.objects
for delete to authenticated using (
 bucket_id='brand-logos' and exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));
