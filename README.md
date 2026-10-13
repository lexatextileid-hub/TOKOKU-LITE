# TOKOKU Lite

Versi sederhana TOKOKU untuk toko kelontong: admin mencatat pesanan di POS, slip pesanan tercetak otomatis di printer kasir, pemilik menerima bayar (tunai / transfer / hutang / campuran).

Tampilan dan cara kerja mengikuti TOKOKU versi full (`lexatextileid-hub/Retail-kelontong`), ditambah tab **Jual | Antrian** di Penjualan.

## Masuk

Akun awal: **kasir** / PIN **1234** (Pemilik · Kasir). Tambah pengguna lain di Back Office → Pengaturan → Pengguna.

## Isi

- **Kasir:** Kasir (Jual | Antrian | Riwayat — lihat, edit, hapus, retur), Hutang, Laporan Penjualan
- **Back Office:** Laporan, Produk, Pelanggan, Pengaturan — dengan periode (kalender) dan kartu ringkasan

Keputusan desain lengkap: [`docs/keputusan-desain-lite.md`](docs/keputusan-desain-lite.md)

## Data & login (Supabase)

- Project Supabase **TOKOKU Lite** (`kubvpobndqhixtucwcdg`). Data toko disimpan di tabel `produk`, `pelanggan`, `nota`, `bayar`, `retur`, `pengaturan` (satu baris = satu dokumen JSON) dengan RLS: hanya pengguna aktif yang sudah masuk yang bisa membaca/menulis. Perubahan tersebar realtime ke semua perangkat.
- Login memakai Supabase Auth: nama pengguna + PIN. Akun awal **kasir / 1234** dibuat otomatis saat pertama masuk.
- Pengguna dikelola lewat edge function `pengguna` (tambah, ubah, ganti PIN, nonaktifkan) — hanya pemilik.
- Skema: `supabase/migrations/`. Fungsi: `supabase/functions/pengguna/`.

## Membangun

`index.html` dibangun dari sumber prototipe dengan `python3 build.py <sumber.html>` (menambahkan supabase-js dan kunci publishable). Tanpa langkah build di Vercel.

Belum ada: cetak langsung ke printer Bluetooth (masih pratinjau), unduh PDF, import Excel.
