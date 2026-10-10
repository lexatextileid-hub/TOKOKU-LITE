# Keputusan Desain — TOKOKU Lite

Aplikasi terpisah dari TOKOKU versi full. Prinsip: **ambil dari versi full yang dibutuhkan saja**, dengan tampilan, cara kerja, dan struktur data yang sama, supaya bisa naik ke versi full tanpa belajar ulang dan tanpa pindah data.

## Alur kerja toko

Pembeli datang → **admin** input pesanan di POS (perangkat admin) → **slip pesanan tercetak otomatis di printer kasir** → **helper** menyiapkan barang dari slip kertas → **kasir** mencocokkan dan menerima bayar (tunai / transfer / hutang / campuran) → **struk tercetak**. Pembeli kecil bisa langsung ke kasir (jual langsung). Akhir hari: **cetak laporan harian**.

- Helper tidak memegang HP; cukup kertas.
- **Tidak ada stok** di Lite (tanpa FIFO, faktur, barang masuk, opname).
- **Tidak ada buka/tutup shift dan tidak ada hitung uang laci.**

## Perangkat & printer

- **Dua perangkat**: satu untuk **admin**, satu untuk **kasir** (pemilik). Perangkat kasir: **tablet Android, Chrome**. Tata letak POS dirancang untuk tablet (keranjang di samping daftar barang).
- **Satu printer thermal Bluetooth, tersambung ke perangkat kasir** (langsung dari Chrome, tanpa stasiun printer terpisah).
- Perangkat kasir mencetak **dua jenis kertas**:
  1. **Slip pesanan** — **otomatis** setiap kali admin menyimpan nota (perangkat kasir mendengarkan Antrian). Bila perangkat kasir sedang mati/offline, slip yang tertunda tercetak saat aplikasi dibuka lagi; bisa juga cetak ulang dari Antrian.
  2. **Struk** — saat pembayaran selesai. Struk juga bisa dikirim lewat WA.
- Perangkat admin tidak mencetak.

## Tampilan

- **Sama persis dengan TOKOKU versi full**: menu samping (logo, nama toko, pilihan mode **Kasir | Back Office**, menu berikon dengan sub-menu), bilah judul (ikon + judul / sub, tanggal, akun, peran), menu bawah di HP. CSS diambil dari repo versi full.
- Layar Penjualan sama dengan versi full (ketuk kartu barang → pop-up **Atur Barang** → keranjang → dialog **Bayar** dengan Tunai / Transfer / Hutang / Campuran, uang cepat, kembalian, "jadikan potongan / hutang"). **Satu-satunya tambahan: tab bar Jual | Antrian** di atas Penjualan.

## Susunan menu

**Mode Kasir**
1. **Kasir** — tab bar **Jual | Antrian (n) | Riwayat**. Riwayat pindah ke sini (hanya pemilik).
2. **Hutang**
3. **Laporan Penjualan** — laporan uang & penjualan (tanpa margin): periode, kartu kecil, penjualan per cara bayar, uang masuk, omzet harian, terlaris, barang kosong, tombol **Cetak laporan harian**.

Mode Kasir punya **periode sendiri** (dipakai bersama Riwayat, Hutang, Laporan Penjualan; bawaan Hari ini). Kartu di mode Kasir dibuat **kecil satu baris** (kartu mini), bukan kartu besar seperti Back Office.

**Mode Back Office (pemilik):** Laporan, Produk, Pelanggan, Pengaturan.

## Masuk (login) & pengguna

- Aplikasi dibuka dengan layar **Masuk**: nama pengguna + **PIN** (4–6 angka) dengan papan angka besar untuk tablet. Login diingat per perangkat sampai menekan **Keluar** (di bilah judul).
- Akun awal: **kasir / 1234** (peran Pemilik · Kasir). PIN bisa diganti di Pengaturan.
- **Pengaturan → Pengguna** (pemilik): tambah pengguna (nama, nama pengguna unik huruf kecil, PIN + ulangi, peran Pemilik · Kasir atau Admin), ubah, ganti PIN, nonaktifkan / aktifkan. Minimal satu Pemilik aktif; tidak bisa menonaktifkan diri sendiri. Akun nonaktif tidak bisa masuk.
- Nama pengguna yang masuk tercatat di nota (dicatat oleh / kasir), pembayaran hutang, retur; slip mencetak "Dicatat", struk mencetak "Kasir".

## Peran akun

- **Kasir di toko ini adalah pemilik.** Lite cukup dua peran:
  - **Pemilik** (sekaligus kasir): semua menu; tidak perlu PIN untuk batal, retur, hutang lama.
  - **Admin**: hanya Penjualan tab **Jual** (simpan pesanan) dan **Antrian** (lihat, minta cetak ulang slip). **Tidak boleh menerima bayar**, tidak melihat harga beli, margin, laporan.
- Semua pembayaran lewat pemilik.
- Peran Kasir terpisah ditunda; bisa ditambah nanti (struktur peran sama dengan versi full).

## 1. Penjualan

- **Tab Jual**:
  - Admin: **Simpan & cetak slip** → nota masuk Antrian, status *Menunggu*, slip tercetak otomatis di printer kasir.
  - Kasir: **Bayar** untuk jual langsung, atau **Antrian** untuk menyimpan.
- **Kepala keranjang**: **Nota** (nomor), **Nama pelanggan**, lalu **Pesanan** (daftar barang).
- **Tab Antrian**: daftar nota *Menunggu* (nomor, jam, pelanggan, total, pembuat). Ketuk → terbuka di tab Jual → cocokkan / edit → **Bayar** → *Dibayar* → struk (cetak / WA). Bisa cetak ulang slip atau **Batal** (alasan).
- **Status hanya dua: Menunggu → Dibayar** (plus Batal).
- Kasir bebas mengedit nota sebelum bayar (ubah jumlah, satuan, harga, hapus, tambah barang).

### Ubah harga

- Pop-up Atur Barang punya kolom **Harga per satuan** (isian awal: harga bawaan / harga grosir).
- Harga yang diketik **lebih murah** dari harga bawaan → selisihnya otomatis dicatat sebagai **diskon** (selisih × jumlah); keranjang menampilkan "Harga diubah ke Rp X · diskon". Laporan dan margin tetap benar.
- Harga yang diketik **lebih mahal** → dicatat sebagai harga dinaikkan (ditandai).
- Alasan: sering lebih mudah mengetik harga daripada menghitung diskon. Kolom diskon Rp (per satuan / total) tetap ada; mengisi salah satu mengosongkan yang lain.

### Pesan vs Ada

- Baris nota di kasir punya kolom **Pesan** (dari admin, terkunci, hanya catatan) dan **Ada** (terisi = Pesan, diubah kasir bila beda). **Tagihan dan struk memakai Ada.**
- Bila Ada ≠ Pesan, **keterangan wajib**: Barang kosong, Stok kurang, Pembeli batal, Ganti barang, Salah input, Lainnya (+catatan). Barang tambahan dari kasir: Pesan "–", ditandai *tambahan*.
- Rekap "Barang kosong / Stok kurang" di Laporan sebagai bahan belanja ke distributor.

### Slip pesanan untuk helper (dicetak otomatis)

Kepala: nama toko, no. nota, **nama pelanggan** (dan alamat bila diantar), jam. Kolom **Barang | Pesan | Ada | Ket.** — helper menulis tangan kolom Ada dan Ket. Di bawah: **Disiapkan: ____** (nama helper).

### Nama pelanggan

- **Tidak ada pilihan "Umum".** Kolom **Nama pelanggan** diketik; saran pelanggan terdaftar muncul saat mengetik. Nama yang tidak terdaftar disimpan sebagai nama ketik bebas (tetap bisa dicari di Riwayat).
- **Nama pelanggan wajib diisi** sebelum Simpan atau Bayar; boleh diisi **"-"** bila tidak tahu. Tidak ada teks petunjuk di bawah kolom.
- Hutang dan diskon khusus hanya untuk pelanggan terdaftar; nama yang belum terdaftar bisa langsung **didaftarkan** dari keranjang.
- Slip dan struk selalu mencetak nama pelanggan.

## 2. Hutang

- **Tanpa batas hutang** dan **tanpa tempo bayar**. Yang ditampilkan cukup tanggal nota tertua.
- **Pelanggan baru dari kasir boleh langsung hutang.** Pembeli yang tidak terdaftar (nama ketik bebas atau "-") harus bayar lunas.
- **Daftar hutang**: satu baris per pelanggan (sisa hutang, jumlah nota belum lunas, tanggal nota tertua). Kartu ringkasan: total hutang semua pelanggan, jumlah pelanggan berhutang.
- **Bayar hutang** (pola "terima pembayaran"): daftar nota belum lunas dengan centang dan kolom bayar; ketik jumlah → menutup nota tertua dulu, atau centang nota tertentu. Tunai atau transfer (nama bank sebagai keterangan). Status nota: Belum lunas → Sebagian → Lunas.
- Bisa **bayar hutang sekalian belanja** di dialog Bayar (diambil dari tunai dulu).
- **Hutang lama** (sebelum memakai aplikasi): tanpa rincian barang — pelanggan, tanggal, jumlah, keterangan. Hanya pemilik.

## 3. Riwayat (tab di Kasir)

- **Lihat, Edit, Hapus** nota yang sudah dibayar (pola daftar struk Loyverse / detail transaksi Majoo).
  - **Edit**: nota dibuka lagi di Jual dengan isi yang sama; kasir mengubah barang, lalu **Simpan**. Uang yang sudah dibayar terbawa ("Sudah dibayar di N…"); selisih ditagih atau dikembalikan. Nota lama ditandai batal ("Diedit → N…-E") dan nota baru bernomor **N…-E** (edit berikutnya -E2, -E3). Struk mencetak "Edit dari … / Dibayar sebelumnya".
  - **Hapus**: nota ditandai batal dengan alasan, tetap terlihat di Riwayat (filter Batal), tidak dihitung di laporan; hutang nota itu ikut terhapus.
  - Edit/Hapus **ditolak** bila hutang nota sudah dicicil, sudah ada retur, atau nota hasil tukar retur — pakai Retur.
- Kartu mini di atas daftar: Semua · Penjualan · Bayar hutang · Retur · Batal (jumlah + total), sekaligus filter.

- **Kasir di toko ini adalah pemilik**, jadi Riwayat dibuka penuh (semua hari).
- Dikelompokkan per hari dengan total harian; cari no. nota / nama.
- Kolom: no. nota, jam, pelanggan (bisa diketuk), total, cara bayar, tanda selisih Pesan–Ada atau retur.
- Buka nota: isi dengan Pesan | Ada | Ket.; cetak ulang (SALINAN), kirim WA, Retur, Batal.

## Retur

- Dari **Riwayat**: cari nota (nama / no. nota / tanggal) → **Retur** → pilih barang & jumlah (maks. yang dibayar dan belum diretur).
- **Tanpa batas waktu retur**; pemilik memutuskan di tempat.
- **Nilai retur = harga yang dulu dibayar** di nota asli (setelah diskon), bukan harga sekarang.
- Penyelesaian: **Uang kembali** (tunai / transfer), **Potong hutang** (bila masih berhutang), **Tukar sama** (harga nota lama, selisih nol), **Ganti barang lain** (harga jual sekarang).
- Tukar sama dan ganti barang **otomatis membuat nota baru di Antrian (Menunggu)** dengan baris *"Retur dari N…: −Rp X"*. Selisih diselesaikan kasir: plus → pembeli tambah bayar; minus → toko kembalikan (tunai / transfer / potong hutang); nol → lunas.
- Retur mengurangi omzet dan margin di Laporan.

## Keterhubungan Riwayat – Pelanggan – Retur

- Detail pelanggan punya tab **Belanja | Hutang | Retur | Diskon**.
- Di **Riwayat**, nama pelanggan bisa diketuk: pelanggan terdaftar → detail pelanggan; nama ketik bebas → Riwayat difilter dengan nama itu.
- Di detail pelanggan, nomor nota bisa diketuk → buka nota (cetak ulang, Retur).

## Laporan harian (cetak thermal, akhir hari)

Tanpa buka/tutup shift dan tanpa hitung laci: tombol **Cetak laporan harian**. Isi: penjualan (jumlah nota, tunai / transfer / hutang, potongan, retur, omzet bersih); uang masuk tunai & transfer; hutang (baru, dibayar, dipotong retur, total semua pelanggan); retur; terjual per kategori + 10 terlaris; barang kosong / kurang; estimasi margin.

## Periode (Kasir & Back Office)

- **Satu tombol** periode (mis. "📅 Bulan ini · 1 Okt – 10 Okt 2026 ▾"). Diketuk → panel kalender: **pilihan cepat di kiri** (Hari ini, Kemarin, 7 hari terakhir, Bulan ini, Bulan lalu — sekali ketuk), **kalender di kanan** (pola Majoo / date range picker).
  - Rentang tanggal: ketuk tanggal awal lalu tanggal akhir (urutan ditukar otomatis; ketuk dua kali = satu hari).
  - Pilih bulan: kotak Jan–Des dengan ‹ › tahun. **Tanpa mengetik.**
  - Tanggal/bulan yang belum terjadi tidak bisa dipilih.

## Back Office: periode & kartu informasi

- **Satu periode bersama** untuk Laporan, Produk, dan Pelanggan (bawaan: **Bulan ini**); tombol aksi halaman di kanan tombol periode. Pindah halaman, periode tetap.
- Setiap halaman Back Office punya **kartu informasi** (pola KartuRingkas versi full). Kartu bisa diketuk untuk menyaring daftar.
  - **Laporan**: Omzet bersih · Estimasi margin · Uang masuk · Hutang pelanggan.
  - **Produk**: Barang aktif · Terjual di periode · Tidak terjual (aktif tapi tidak laku) · Untung tipis (< 5% atau rugi). Tiap barang menampilkan penjualan, jumlah terjual, dan margin di periode.
  - **Pelanggan**: Pelanggan terdaftar (+ baru di periode) · Belanja di periode · Berhutang · Pembeli tidak terdaftar. Tabel: nota & belanja periode, terakhir belanja, sisa hutang, baris total.
  - **Pengaturan** (tanpa periode): Toko · Produk · Pelanggan terdaftar · Printer kasir.

## Back Office: Laporan

Khusus pemilik. **Bisa diunduh sebagai PDF** (di aplikasi asli).

- **Ringkasan** (kartu): omzet bersih, estimasi margin Rp & % (dari harga beli yang tercatat saat nota dibayar), uang masuk tunai & transfer, total hutang pelanggan.
- **Rincian**: penjualan per cara bayar; omzet harian; per kategori; 10 terlaris; potongan (diskon pelanggan, diskon baris/ubah harga, potongan akhir); retur per alasan; barang sering kosong; hutang per pelanggan.

## Back Office: Produk

- Nama, kategori (bawaan versi full), **SKU otomatis** (kode kategori + nomor urut), kode cepat opsional, aktif / nonaktif.
- Satuan dasar + satuan besar berantai ("Karton isi 10 Renteng"); satuan dipilih dari Master Satuan.
- Tiap satuan: harga beli, harga jual, untung %. Tanda ⚠ bila satuan besar lebih mahal per satuan dasar.
- **Harga bertingkat per jumlah** dan **diskon khusus per pelanggan per barang**: dipakai, sama dengan versi full.
- Ubah harga cepat per kategori; import Excel untuk isi awal (di aplikasi asli).
- Tidak masuk Lite: stok, minimum/maksimum, letak, FIFO, harga beli per distributor, status gerak.

## Back Office: Pelanggan

- Data: **nama, no. telepon, alamat**. Cek ganda dari nama dan no. telepon; data ganda bisa digabung.
- Detail pelanggan: tab **Belanja | Hutang | Retur | Diskon**. Diskon per barang hanya diubah pemilik.
- Admin boleh mendaftarkan pelanggan baru dari Penjualan; diskon diisi pemilik.
- Golongan pelanggan tidak dipakai.

## Back Office: Pengaturan

- **Toko**: nama, alamat, no. telepon, catatan kaki struk.
- **Akun**: pemilik + admin (jumlah bebas), masing-masing dengan PIN.
- **Data induk**: kategori dan satuan (bawaan versi full, bisa ditambah pemilik).
- **Printer**: pasangkan printer thermal Bluetooth di perangkat kasir; sakelar **cetak slip pesanan otomatis** (bawaan: nyala).

## Prototipe

Prototipe HTML ada sebagai artifact "TOKOKU Lite" (data tersimpan bersama untuk dua perangkat; cetak masih berupa pratinjau; belum ada PIN, unduh PDF, import Excel, gabung pelanggan, ubah harga cepat).
