-- Pengguna aplikasi (terhubung ke auth.users)
create table public.pengguna (
  id uuid primary key references auth.users(id) on delete cascade,
  nama text not null,
  username text not null unique check (username ~ '^[a-z0-9._-]{3,20}$'),
  peran text not null check (peran in ('pemilik','admin')),
  aktif boolean not null default true,
  dibuat timestamptz not null default now()
);
alter table public.pengguna enable row level security;

create or replace function public.saya_aktif() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.pengguna where id = (select auth.uid()) and aktif) $$;

create or replace function public.saya_pemilik() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.pengguna where id = (select auth.uid()) and aktif and peran = 'pemilik') $$;

revoke execute on function public.saya_aktif() from public, anon;
revoke execute on function public.saya_pemilik() from public, anon;
grant execute on function public.saya_aktif() to authenticated;
grant execute on function public.saya_pemilik() to authenticated;

create policy "pengguna aktif membaca daftar pengguna" on public.pengguna
  for select to authenticated using ((select public.saya_aktif()));
-- tulis pengguna hanya lewat edge function "pengguna" (service role)

-- Tabel dokumen: satu baris = satu dokumen JSON
do $$
declare t text;
begin
  foreach t in array array['produk','pelanggan','nota','bayar','retur','pengaturan'] loop
    execute format('create table public.%I (id text primary key, data jsonb not null default ''{}''::jsonb, diubah timestamptz not null default now())', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "baca %1$s" on public.%1$I for select to authenticated using ((select public.saya_aktif()))', t);
    execute format('create policy "tambah %1$s" on public.%1$I for insert to authenticated with check ((select public.saya_aktif()))', t);
    execute format('create policy "ubah %1$s" on public.%1$I for update to authenticated using ((select public.saya_aktif())) with check ((select public.saya_aktif()))', t);
    execute format('alter publication supabase_realtime add table public.%I', t);
  end loop;
end $$;

-- Gabungkan sebagian isi dokumen (data = data || isi)
create or replace function public.patch_doc(tbl text, doc_id text, isi jsonb) returns void
language plpgsql security invoker set search_path = ''
as $$
begin
  if tbl not in ('produk','pelanggan','nota','bayar','retur','pengaturan') then
    raise exception 'tabel tidak dikenal: %', tbl;
  end if;
  execute format('update public.%I set data = data || $1, diubah = now() where id = $2', tbl) using isi, doc_id;
end $$;
revoke execute on function public.patch_doc(text, text, jsonb) from public, anon;
grant execute on function public.patch_doc(text, text, jsonb) to authenticated;

create index nota_status_idx on public.nota ((data->>'status'));
