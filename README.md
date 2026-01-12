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

## Untuk Pengembang

- **Tech Stack:** React 19, TypeScript, Tailwind CSS, Web Crypto API
- **Build:** `npm run build` (output ke folder `dist`)
- **Struktur:**
  - `App.tsx` — Aplikasi utama
  - `components/Common.tsx` — Komponen modal reusable
  - `services/crypto.ts` — Fungsi enkripsi/dekripsi
