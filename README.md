# ZYNORA v1.17.0 — WhatsApp Bot untuk Termux

ZYNORA adalah bot WhatsApp berbasis **Node.js** dan **Baileys** yang dapat dijalankan langsung dari HP Android menggunakan Termux. Bot menggunakan prefix titik (`.`), misalnya `.menu` atau `.ping`.

- **Nama bot:** ZYNORA
- **Pengembang:** SkyDev
- **Owner bawaan pada kode:** Alvarenza
- **Versi pada `index.js`:** 1.17.0
- **Platform panduan ini:** Android + Termux

> README ini disesuaikan dengan `index.js` yang ada di repository. Beberapa fitur membutuhkan program tambahan atau API key, jadi tidak semuanya aktif hanya dengan memasang Node.js.

---

## Daftar isi

1. [Fitur utama](#fitur-utama)
2. [Persyaratan](#persyaratan)
3. [Instalasi melalui Git Clone](#instalasi-melalui-git-clone)
4. [Mengatur nomor owner](#mengatur-nomor-owner)
5. [Menghubungkan WhatsApp](#menghubungkan-whatsapp)
6. [Menjalankan dan menghentikan bot](#menjalankan-dan-menghentikan-bot)
7. [Mengatur API key](#mengatur-api-key)
8. [Perintah bot](#perintah-bot)
9. [File dan data yang dibuat bot](#file-dan-data-yang-dibuat-bot)
10. [Pemecahan masalah](#pemecahan-masalah)
11. [Keamanan dan catatan](#keamanan-dan-catatan)

---

## Fitur utama

### Kreatif dan media
- Membuat stiker dari foto/video.
- Stiker teks Brat, Brat hijau, dan Brat animasi.
- Membuat quote bergaya iPhone, TikTok, dan Windows Media Player.
- Menggabungkan emoji, mengubah stiker menjadi gambar, dan membuat stiker meme.
- Mengubah audio/video, membuat voice note, TTS, serta efek audio.
- Mengunduh media dari TikTok, YouTube, dan tautan yang didukung layanan downloader.
- Membuat QR, screenshot situs, dan mengubah media menjadi tautan.

### AI dan alat bantu
- Tanya jawab AI dan melanjutkan percakapan.
- Menganalisis gambar, menerjemahkan pesan, dan merangkum PDF.
- Membantu memperbaiki kode.
- OCR untuk membaca teks dari gambar.
- Membuat gambar AI melalui layanan yang tersedia.
- Menghapus latar belakang dan memperjelas gambar; beberapa metode memerlukan API key.
- Kalkulator, cuaca, Wikipedia, kurs, informasi gempa, jadwal salat, dan utilitas lain.

### Produktivitas dan informasi
- Todo dengan deadline dan pengingat.
- Jadwal mingguan dan pelacak kebiasaan.
- Mengubah voice note/audio menjadi teks.
- Merangkum artikel atau video, memperbaiki ejaan, dan parafrase.
- Melacak paket, memeriksa ongkir, mencari kode pos, waktu kota lain, arti kata, resep, dan informasi kalori.
- Membuat kata sandi acak, memeriksa situs, memendekkan tautan, serta konversi satuan.

### Keuangan dan dokumen
- Mencatat pemasukan dan pengeluaran serta membuat laporan bulanan.
- Mencatat utang, pengingat tagihan, dan split bill.
- Kalkulator cicilan, zakat, dan estimasi pajak.
- Informasi harga emas dan BBM.
- Konversi, penggabungan, pemisahan, dan kompresi PDF.
- Membuat template surat dan CV.

### Grup dan hiburan
- Manajemen grup: tag anggota, moderasi tautan/spam, sambutan, aturan, dan pengelolaan anggota.
- Absensi, rekap absensi, pemanggil admin, undian, dan permainan grup.
- Kas grup, jadwal piket, pengumuman terjadwal, dan notulen rapat.
- Menfess/confess, permainan, tebak-tebakan, polling, jokes, dan fitur hiburan lainnya.

Daftar perintah terbaru dapat dilihat langsung dari WhatsApp dengan mengirim **`.menu`** atau **`.allmenu`**. Detail kategori dapat dibuka dengan `.menu <kategori>`.

---

## Persyaratan

- HP Android dengan koneksi internet.
- Termux dari sumber resmi F-Droid atau GitHub Releases Termux.
- Node.js dan npm.
- Git untuk mengambil repository.
- Ruang penyimpanan yang cukup. Instalasi paket dan pemrosesan media dapat membutuhkan ruang tambahan.

**Paket utama Termux:**

```bash
pkg update -y && pkg upgrade -y
pkg install -y nodejs git ffmpeg imagemagick python poppler
```

**Paket tambahan yang disarankan untuk fitur tertentu:**

```bash
pkg install -y yt-dlp ghostscript qpdf zbar tesseract
```

Keterangan:
- `nodejs`: menjalankan bot.
- `git`: mengunduh repository.
- `ffmpeg`: pemrosesan stiker, audio, dan video.
- `imagemagick`: pemrosesan gambar.
- `python`: kebutuhan beberapa alat media.
- `poppler`: membaca dan memproses PDF.
- `yt-dlp`: membantu pengunduhan media.
- `ghostscript` dan `qpdf`: dukungan tambahan untuk dokumen PDF.
- `zbar`: membaca QR dari gambar.
- `tesseract`: OCR lokal.

Tidak semua paket tambahan wajib untuk menjalankan bot. Fitur yang memerlukannya bisa tidak berfungsi jika program terkait belum terpasang.

Periksa Node.js dan npm:

```bash
node -v
npm -v
```

---


### 1. Clone repository

```bash
git clone https://github.com/alvarenza-skyy/ZYNORA-REPOSITORY.git
```

Masuk ke folder repository:

```bash
cd skybot
```

### 2. Pasang package Node.js

Jika repository belum menyediakan `package.json`, buat terlebih dahulu:

```bash
npm init -y
```

Pasang dependensi utama:

```bash
npm install @whiskeysockets/baileys pino @napi-rs/canvas qrcode
```

Opsional, untuk pembacaan QR melalui library JavaScript:

```bash
npm install jsqr
```

`@napi-rs/canvas` disarankan untuk fitur gambar. Jika tidak terpasang, beberapa fitur gambar dapat berjalan dalam mode terbatas.

### 3. Atur nomor owner

Buka file:

```bash
nano index.js
```

Cari baris:

```javascript
const OWNER = "628xxxxxxxxxx";
```

Ganti dengan nomor WhatsApp owner yang akan mengelola bot. Gunakan format internasional tanpa tanda `+` dan tanpa angka `0` di depan.

Contoh:

```javascript
const OWNER = "6281234567890";
```

Simpan file di nano dengan `CTRL + X`, tekan `Y`, lalu `Enter`.

> Setiap pengguna yang memasang bot dari repository ini harus mengatur nomor owner miliknya sendiri sebelum menjalankan bot.

### 4. Jalankan bot

```bash
node index.js
```

Saat pertama kali dijalankan, bot meminta pilihan metode koneksi:
- `1` untuk QR Code.
- `2` untuk kode pairing.

Ikuti petunjuk yang tampil di Termux.

---

## Menghubungkan WhatsApp

### Metode 1: QR Code

1. Jalankan `node index.js`.
2. Pilih `1`.
3. Tunggu QR Code muncul di Termux.
4. Buka WhatsApp pada nomor yang akan dijadikan akun bot.
5. Buka **Perangkat tertaut**.
6. Pilih **Tautkan perangkat**.
7. Pindai QR Code dari Termux.

### Metode 2: Kode pairing

1. Jalankan `node index.js`.
2. Pilih `2`.
3. Masukkan nomor WhatsApp akun bot dengan format internasional, misalnya `6281234567890`.
4. Tunggu kode pairing muncul.
5. Di WhatsApp, buka **Perangkat tertaut**.
6. Pilih **Tautkan dengan nomor telepon**.
7. Masukkan kode yang tampil di Termux.

Setelah berhasil, kredensial koneksi disimpan di folder `session/`. Pada proses berikutnya, bot biasanya tidak meminta pairing lagi selama sesi masih berlaku.

**Jangan pernah membagikan folder `session/` kepada orang lain.**

---

## Menjalankan dan menghentikan bot

Jalankan dari folder repository:

```bash
node index.js
```

Untuk menghentikan bot, tekan:

```text
CTRL + C
```

Agar Termux tidak mudah dihentikan Android ketika layar mati:

```bash
termux-wake-lock
```

Disarankan juga mengatur penggunaan baterai Termux menjadi **Tanpa batasan / Unrestricted** melalui pengaturan Android.

Bot memiliki mekanisme mencoba menyambung kembali ketika koneksi WhatsApp terputus. Namun, Android tetap dapat menghentikan proses jika Termux dibatasi oleh sistem atau aplikasi ditutup paksa.

---

## Mengatur API key

Fitur dasar bot dapat digunakan tanpa API key. Beberapa layanan AI dan pemrosesan media memerlukan key sendiri.

Owner dapat mengatur key melalui **chat pribadi dengan bot**:

```text
.setkey NAMA_KEY nilai_key
```

Contoh:

```text
.setkey GEMINI_API_KEY API_KEY_MILIKMU
```

Nama key yang dikenali oleh perintah `.setkey` pada kode saat ini:

| Nama key | Kegunaan umum |
|---|---|
| `GEMINI_API_KEY` | Fitur AI, analisis gambar, PDF, dan OCR berbantuan Gemini |
| `GEMINI_MODEL` | Memilih model Gemini tertentu |
| `REMOVEBG_API_KEY` | Menghapus background melalui remove.bg |
| `GEMINI_IMG_DAILY_MAX` | Pengaturan batas harian gambar Gemini |
| `GROQ_API_KEY` | Layanan AI cadangan |
| `GROQ_MODEL` | Memilih model Groq |
| `ANTHROPIC_API_KEY` | Integrasi layanan Anthropic yang tersedia pada kode |
| `HF_TOKEN` | Integrasi layanan Hugging Face yang tersedia pada kode |
| `CLOUDFLARE_ACCOUNT_ID` | Integrasi layanan Cloudflare |
| `CLOUDFLARE_API_TOKEN` | Integrasi layanan Cloudflare |
| `DEAPI_API_KEY` | Fitur peningkatan kualitas gambar AI |

Untuk melihat key yang sudah tersimpan, kirim:

```text
.setkey
```

Untuk menghapus key:

```text
.setkey GEMINI_API_KEY hapus
```

Key disimpan di file `keys.json`. Jangan mengunggah file tersebut ke GitHub.

Ketersediaan, batas gratis, dan biaya layanan API mengikuti kebijakan masing-masing penyedia. Periksa ketentuannya sebelum menggunakan.

---

## Perintah bot

Semua perintah menggunakan prefix titik (`.`).

### Perintah umum

| Perintah | Fungsi |
|---|---|
| `.menu` | Membuka menu bot |
| `.allmenu` | Menampilkan daftar perintah |
| `.ping` | Memeriksa respons bot |
| `.runtime` | Melihat lama bot berjalan |
| `.profile` | Melihat profil pengguna |
| `.limit` | Melihat sisa limit |
| `.owner` | Melihat kontak owner |

### Beberapa contoh perintah fitur

```text
.s
.brat Halo
.tiktok https://...
.ai Jelaskan tentang ESP32
.todo tambah Belajar coding
.catatuang +50000 uang saku
.laporanuang
.gempa
.cuaca Klaten
.qr https://github.com
```

Perintah lengkap dan format setiap fitur dapat dilihat melalui `.menu` di WhatsApp.

### Perintah khusus owner

Gunakan `.ownermenu` untuk melihat daftar perintah pengelolaan bot. Beberapa contohnya:

- `.ban` dan `.unban`: mengelola pengguna yang diblokir dari bot.
- `.addprem` dan `.delprem`: mengelola status premium.
- `.addlimit` dan `.setlimit`: mengatur limit pengguna.
- `.addowner` dan `.delowner`: mengelola owner tambahan.
- `.addadmin` dan `.deladmin`: mengelola admin bot.
- `.mode public/self`: mengatur mode bot.
- `.bc` dan `.bcgc`: broadcast.
- `.setkey`: menyimpan API key.
- `.diagnosa`: memeriksa beberapa komponen dan koneksi layanan.
- `.restart` dan `.off`: mengelola proses bot.

Jangan memberikan akses owner kepada orang yang tidak dipercaya.

---

## File dan data yang dibuat bot

Bot membuat beberapa file/folder saat digunakan:

| File/folder | Kegunaan |
|---|---|
| `index.js` | Kode utama ZYNORA |
| `session/` | Kredensial sesi WhatsApp |
| `database.json` | Data pengguna, limit, aktivitas, dan data fitur |
| `settings.json` | Pengaturan bot dan grup |
| `keys.json` | API key yang disimpan melalui `.setkey` |
| `node_modules/` | Package Node.js |
| `package.json` | Daftar dependensi Node.js |
| `package-lock.json` | Versi dependensi yang terpasang |

File data dibuat otomatis ketika diperlukan. Jangan menimpa atau menghapusnya jika ingin mempertahankan sesi dan data bot.

### File tambahan untuk Fake Lobby

Kode mengenali modul eksternal `fakelobby.js` dan folder `assets` untuk fitur `.fakeff` dan `.fakeml`. Jika file tersebut tidak disertakan di repository, fitur Fake Lobby akan menampilkan pemberitahuan bahwa modul belum aktif. Fitur utama lainnya tetap dapat digunakan.

---

## Pemecahan masalah

| Masalah | Solusi |
|---|---|
| `Cannot find module ...` | Jalankan kembali perintah `npm install` di folder repository. |
| Bot tidak bisa dimulai | Periksa `node -v`, dependensi, dan pesan error di Termux. |
| QR tidak tampil | Pastikan package `qrcode` terpasang, lalu jalankan ulang bot. |
| Kode pairing kedaluwarsa | Hentikan bot dan jalankan ulang untuk meminta kode baru. |
| Bot tidak membalas | Coba `.ping`, periksa mode bot, dan pastikan akun bot masih tertaut. |
| Fitur stiker/audio gagal | Pastikan `ffmpeg` dan `imagemagick` terpasang. |
| Fitur unduhan gagal | Perbarui `yt-dlp` dan periksa koneksi internet. |
| Fitur PDF gagal | Pasang paket `poppler`, serta `ghostscript` atau `qpdf` jika diperlukan. |
| OCR gagal | Pasang `tesseract`; beberapa metode OCR juga membutuhkan API key. |
| Fitur AI gagal | Periksa API key, kuota, koneksi, dan status penyedia layanan. |
| `.fakeff` / `.fakeml` tidak aktif | Pastikan `fakelobby.js` dan folder `assets` tersedia di samping `index.js`. |
| Bot sering berhenti | Aktifkan `termux-wake-lock` dan hilangkan pembatasan baterai Termux. |

Jika terjadi masalah, simpan pesan error dari Termux agar penyebabnya dapat diperiksa.

---

## Keamanan dan catatan penting

1. **Jangan unggah data pribadi ke repository publik.** Tambahkan file berikut ke `.gitignore`:

   ```gitignore
   node_modules/
   session/
   keys.json
   database.json
   settings.json
   .env
   *.log
   cookies.txt
   ```

2. Jangan pernah membagikan kode pairing, QR login, `session/`, atau API key.
3. Gunakan nomor WhatsApp cadangan jika memungkinkan. Bot tidak resmi berbasis WhatsApp Web dapat menimbulkan risiko pembatasan akun.
4. Jangan gunakan bot untuk spam, penipuan, atau mengirim pesan massal tanpa izin penerima.
5. Fitur AI dapat mengirim teks, gambar, audio, atau dokumen ke penyedia layanan pihak ketiga. Jangan mengirim informasi rahasia.
6. Fitur yang memakai API eksternal bergantung pada ketersediaan layanan tersebut dan dapat berubah sewaktu-waktu.
7. Hormati privasi orang lain ketika menggunakan fitur pengolahan media dan informasi WhatsApp.

### Catatan untuk kontributor

- Pastikan `index.js` dan README diperbarui bersamaan.
- Jangan memasukkan file sesi, database pengguna, atau API key ke commit.
- Uji instalasi dari hasil `git clone` yang bersih sebelum merilis perubahan.

---

**ZYNORA v1.17.0**  
Dikembangkan oleh **SkyDev** • Owner bawaan: **Alvarenza**
