# SecureVault

Aplikasi manajemen kata sandi offline berbasis browser dengan enkripsi end-to-end. Semua data diproses secara lokal di browser tanpa koneksi server atau internet.

## Coba Sekarang

**[Akses aplikasi online](https://securevault-navy.vercel.app/)** — Tidak perlu instalasi, buka langsung di browser.

## Fitur

- Manajemen kredensial dalam sesi (label, username, password, URL, catatan)
- Enkripsi AES-GCM 256-bit untuk ekspor/impor file
- Pencarian dan salin cepat untuk username/password
- Kode recovery untuk pemulihan akses
- Interface responsif dan intuitif

## Prasyarat

- Node.js 16+ (unduh dari https://nodejs.org)

## Instalasi & Menjalankan

```bash
npm install
npm run dev
```

Buka browser ke `http://localhost:3000` (alamat akan ditampilkan di terminal).

## Penggunaan

1. Tambahkan kata sandi baru melalui tombol **+ Add Password**
2. Gunakan fitur pencarian untuk menemukan kredensial
3. Salin username atau password dengan sekali klik
4. **Ekspor** file vault terenkripsi secara berkala untuk backup
5. Gunakan **Import** untuk memulihkan vault dari file backup

**Penting:** Semua data hanya tersimpan di tab browser. Tutup atau refresh tab akan menghapus data. Selalu ekspor backup sebelum menutup aplikasi.

## 🔐 Keamanan

### Fitur Keamanan Bawaan

- **Enkripsi AES-GCM 256-bit** — Standar militer untuk keamanan data
- **Derivasi kunci PBKDF2** — 100,000 iterasi untuk resistance terhadap brute force
- **Pemrosesan lokal** — Semua operasi di browser, tidak ada data dikirim ke server
- **Validasi file ketat** — Deteksi file yang corrupted atau bukan SecureVault export
- **Password strength meter** — Indikator kekuatan password ekspor saat input
- **Warning mode weak password** — Peringatan otomatis jika password terlalu lemah

### Best Practices Keamanan

1. **Gunakan Password Ekspor yang Kuat**

   - Minimal 12 karakter
   - Campuran huruf besar, huruf kecil, angka, dan simbol (!@#$%^&\*)
   - Hindari kata-kata umum atau tanggal lahir

2. **Backup di Lokasi Aman**

   - Simpan file ekspor di USB atau cloud storage (OneDrive, Google Drive)
   - Gunakan beberapa lokasi backup
   - Jangan simpan password ekspor di file yang sama

3. **Hindari Perangkat Tidak Aman**

   - Jangan gunakan di komputer publik/internet cafe
   - Jangan gunakan di perangkat yang sudah terinfeksi malware
   - Gunakan perangkat pribadi yang terpercaya

4. **Proteksi Perangkat**

   - Gunakan Windows Defender atau antivirus yang up-to-date
   - Lock screen saat meninggalkan perangkat
   - Gunakan password/PIN di sistem operasi

5. **Manajemen File Ekspor**
   - Hanya bagikan file ekspor kepada orang yang sangat dipercaya
   - Hindari mengirim via email tanpa enkripsi
   - Hapus file ekspor dari Download folder setelah disimpan

### Limitasi & Catatan

- ⚠️ **Data volatile** — Data hilang jika tab ditutup tanpa ekspor
- ⚠️ **Tidak ada master password** — Setiap password punya keamanan independen
- ⚠️ **Tidak ada recovery** — Lupa password ekspor = data tidak bisa dikembalikan
- ⚠️ **Bergantung browser** — Keamanan tergantung integritas browser dan OS

### Tidak Ada Jaminan

Aplikasi ini disediakan "as-is" tanpa jaminan. Selalu maintain backup terpisah dan gunakan di lingkungan yang aman. Untuk data super sensitif, pertimbangkan hardware security key (YubiKey) atau password manager enterprise.

## Untuk Pengembang

- **Tech Stack:** React 19, TypeScript, Tailwind CSS, Web Crypto API
- **Build:** `npm run build` (output ke folder `dist`)
- **Struktur:**
  - `App.tsx` — Aplikasi utama
  - `components/Common.tsx` — Komponen modal reusable
  - `services/crypto.ts` — Fungsi enkripsi/dekripsi
