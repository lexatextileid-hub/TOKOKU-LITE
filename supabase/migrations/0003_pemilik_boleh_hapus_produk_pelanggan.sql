create policy "hapus produk oleh pemilik" on public.produk for delete to authenticated using ((select public.saya_pemilik()));
create policy "hapus pelanggan oleh pemilik" on public.pelanggan for delete to authenticated using ((select public.saya_pemilik()));
