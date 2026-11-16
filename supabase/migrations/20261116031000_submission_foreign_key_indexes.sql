-- Chaves estrangeiras da fila: evitar varreduras integrais quando registros vinculados mudarem.
create index if not exists bs_reviewed_by_idx on public.business_submissions(reviewed_by) where reviewed_by is not null;
create index if not exists bs_published_place_id_idx on public.business_submissions(published_place_id) where published_place_id is not null;
