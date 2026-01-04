# SecureVault (offline)

SecureVault adalah aplikasi vault kata sandi berbasis sesi yang berjalan sepenuhnya di browser, tanpa koneksi AI atau server. Data hanya disimpan di memori tab yang sedang terbuka; tutup/refresh tab akan menghapus data kecuali Anda mengekspor terlebih dulu.

## Fitur singkat

- Menyimpan kredensial sementara (label, username, password, URL, catatan) di memori tab.
- Impor/ekspor berkas vault terenkripsi dengan kata sandi (AES-GCM di browser).
- Pencarian cepat di daftar dan tombol salin username/password.
- Peringatan sebelum tab ditutup jika ada data belum diekspor.

## Cara mendapatkan aplikasi (untuk pengguna umum)

1. Pastikan Node.js sudah terpasang (unduh dari https://nodejs.org, pilih LTS, klik Next sampai selesai).
2. Unduh sumber aplikasi:
   - Jika dari GitHub: klik tombol **Code** > **Download ZIP**, lalu ekstrak ZIP ke folder apa saja.
   - Jika Anda menerima folder siap pakai, cukup ekstrak jika masih berbentuk ZIP.
3. Buka terminal/Command Prompt di dalam folder hasil ekstrak.
4. Jalankan perintah pemasangan dependensi: `npm install`
5. Jalankan aplikasi: `npm run dev`
6. Buka browser ke alamat yang ditampilkan (misal http://localhost:3000). Aplikasi berjalan offline di tab tersebut.

> Catatan penting: semua data hanya hidup di tab ini. Selalu gunakan menu **Export** untuk menyimpan file terenkripsi sebelum menutup tab atau mematikan komputer.

## Untuk pengembang

- Prasyarat: Node.js
- Instal dependensi: `npm install`
- Menjalankan dev server: `npm run dev`
- Build produksi (jika diperlukan): `npm run build` lalu sajikan folder `dist` dengan server statis pilihan Anda.
