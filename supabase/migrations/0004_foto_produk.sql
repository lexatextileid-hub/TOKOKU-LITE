-- Penyimpanan foto produk (publik untuk dibaca, hanya pemilik aktif yang boleh unggah/ganti/hapus).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('foto-produk', 'foto-produk', true, 524288, array['image/jpeg','image/webp','image/png'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "foto produk: unggah oleh pemilik" on storage.objects for insert to authenticated
  with check (bucket_id = 'foto-produk' and (select public.saya_pemilik()));
create policy "foto produk: ubah oleh pemilik" on storage.objects for update to authenticated
  using (bucket_id = 'foto-produk' and (select public.saya_pemilik()))
  with check (bucket_id = 'foto-produk' and (select public.saya_pemilik()));
create policy "foto produk: hapus oleh pemilik" on storage.objects for delete to authenticated
  using (bucket_id = 'foto-produk' and (select public.saya_pemilik()));
create policy "foto produk: baca oleh pengguna aktif" on storage.objects for select to authenticated
  using (bucket_id = 'foto-produk' and (select public.saya_aktif()));
