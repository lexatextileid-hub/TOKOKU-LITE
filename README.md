# TOKOKU Lite

Versi sederhana TOKOKU untuk toko kelontong: admin mencatat pesanan di POS, slip pesanan tercetak otomatis di printer kasir, pemilik menerima bayar (tunai / transfer / hutang / campuran).

Tampilan dan cara kerja mengikuti TOKOKU versi full (`lexatextileid-hub/Retail-kelontong`), ditambah tab **Jual | Antrian** di Penjualan.

## Isi

- **Kasir:** Penjualan (Jual | Antrian), Hutang, Riwayat (termasuk Retur)
- **Back Office:** Laporan, Produk, Pelanggan, Pengaturan — dengan periode (kalender) dan kartu ringkasan

Keputusan desain lengkap: [`docs/keputusan-desain-lite.md`](docs/keputusan-desain-lite.md)

## Status

Prototipe satu file (`index.html`), tanpa build. Bisa langsung di-deploy ke Vercel sebagai situs statis.

- Data di prototipe ini hanya tersimpan selama halaman terbuka bila dibuka di luar claude.ai (belum ada database).
- Cetak masih berupa pratinjau; belum ada PIN, unduh PDF, import Excel.

Langkah berikutnya: pindah ke Vite + React + Supabase seperti TOKOKU versi full.
