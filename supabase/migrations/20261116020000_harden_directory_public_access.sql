-- Banco já atualizado pela integração Supabase: migration versionada para reimplantações.
drop policy if exists "public read published places" on public.places;
create policy "public read published places" on public.places
  for select to anon using (is_published = true);

drop policy if exists "admins see all places" on public.places;
drop policy if exists "authenticated read published or admin" on public.places;
create policy "authenticated read published or admin" on public.places
  for select to authenticated using (
    is_published = true
    or exists (select 1 from public.admin_users a where a.user_id = (select auth.uid()))
  );

do $$
begin
 if not exists(select 1 from pg_constraint where conname='places_safe_values_check' and conrelid='public.places'::regclass) then
   alter table public.places add constraint places_safe_values_check check (
     id ~ '^[a-z0-9][a-z0-9-]{0,79}$'
     and char_length(btrim(name)) between 2 and 140
     and char_length(description) <= 700
     and char_length(subtitle) <= 150
     and char_length(address) <= 200
     and char_length(phone) <= 50
     and category in ('mercados','farmacias','restaurantes','bares','turismo','hoteis','comercio','educacao','noticias','eventos','servicos')
     and website_url ~* '^https://[a-z0-9.-]+(:443)?([/?#][^[:space:]]*)?$'
     and char_length(website_url) <= 2048
     and (source_url = '' or (source_url ~* '^https://[a-z0-9.-]+(:443)?([/?#][^[:space:]]*)?$' and char_length(source_url)<=2048))
     and (logo_url = '' or (logo_url ~* '^https://[a-z0-9.-]+(:443)?([/?#][^[:space:]]*)?$' and char_length(logo_url)<=2048))
     and cardinality(tags) <= 25
     and char_length(mark) <= 10
   );
 end if;
end $$;

drop policy if exists "admins upload brand logos" on storage.objects;
create policy "admins upload brand logos" on storage.objects for insert to authenticated
with check (bucket_id = 'brand-logos' and
 name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(png|jpg|webp)$'
 and exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));

drop policy if exists "admins update brand logos" on storage.objects;
create policy "admins update brand logos" on storage.objects for update to authenticated
using (bucket_id='brand-logos' and exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())))
with check (bucket_id='brand-logos'
 and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(png|jpg|webp)$'
 and exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));
