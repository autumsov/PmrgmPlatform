# Toko Barang — Inventory Management System (PjBL Project)

An implementation of a professional **Inventory Management Dashboard** using a **PHP PDO API (Backend)** and a **Vanilla JS + Tailwind CSS (Frontend)**. This project follows a Client-Server architecture with a focus on Single Page Application (SPA) experience and Progressive Web App (PWA) capabilities.

---

## 👤 Identitas Mahasiswa

| Informasi | Keterangan |
| :--- | :--- |
| **Nama Lengkap** | Muhammad Fajriska Maulana |
| **NIM** | `231220044` |
| **Kelas** | 31 |
| **Program Studi** | Teknik Informatika |
| **Instansi** | Universitas Muhammadiyah Pontianak |
| **Dosen Pengampu** | Sucipto, M.Kom |

---

## 🎨 Update Dashboard Terbaru (Professional Redesign)
Aplikasi telah melalui perombakan total UI/UX menjadi sebuah **Inventory Console** yang profesional:
- **UI Modern**: Menggunakan Tailwind CSS dengan font *Plus Jakarta Sans*. Desain berbasis kartu (*card-based*) dengan *hover effects* dan mikro-animasi.
- **Auto-Environment Detection**: `koneksi.php` secara otomatis mendeteksi apakah aplikasi berjalan di **Local (Laragon)** atau **Production (InfinityFree)** tanpa perlu ubah kode manual.
- **Real-time Statistics**: Panel evaluasi otomatis yang menghitung **Total SKU** dan **Total Nilai Produk (Inventory Worth)**.
- **Smart Search**: Filter produk yang langsung memperbarui tabel dan statistik secara real-time.
- **Sequential UID**: Logika UID tampilan yang rapi (001, 002, dst) yang tetap stabil meskipun data difilter.

---

## 📱 Tugas Praktikum Pertemuan 4 — Progressive Web App (PWA)
Aplikasi telah dioptimalkan menjadi PWA sehingga dapat diinstall secara native di Desktop maupun Mobile.
- **Service Worker (sw.js)**: Mendukung *Offline Caching* (v3) untuk aset inti aplikasi.
- **Web Manifest**: Konfigurasi ikon (192, 512) dan skema warna untuk integrasi OS.
- **Installability**: Muncul tombol "Install App" di Chrome Address Bar (via HTTPS).

---

## 🛠️ Tugas Praktikum Pertemuan 5 & Tantangan Mandiri — CRUD Lengkap (API Berbasis Data)

Aplikasi telah menyelesaikan siklus penuh manipulasi data (CRUD) menggunakan method HTTP:

### Apa yang Diimplementasikan:
1. **Endpoint Backend (`tambah_barang.php`, `delete_barang.php`, `update_barang.php`)**: Memproses data JSON via POST/PUT dan menjaga data dengan menggunakan PDO Prepared Statements (aman dari SQL Injection).
2. **Inline Form Entry & Edit (Dinamis)**: Form tambah produk diletakkan secara terintegrasi di atas tabel (menggunakan sistem *show/hide* toggle). Ketika fitur Edit digunakan, teks tombol berubah dan API mengalihkan mode dari Create menjadi Update.
3. **Konfirmasi Hapus**: Integrasi SweetAlert2 sebagai pengganti `confirm()` dasar untuk UX proses Hapus yang jauh lebih baik dan aman.
4. **SPA & Sinkronisasi Tanpa Refresh**:
   - `fetch()` API mencegah reload halaman.
   - Tabel diperbarui otomatis setiap kali data di Edit, Dihapus, atau Ditambah (*No Blinking*).

---

## 🚀 Live Demo & Repository
- **GitHub Repository**: [https://github.com/autumsov/PmrgmPlatform](https://github.com/autumsov/PmrgmPlatform)
- **Live Hosting**: [https://tokobarang.free.nf/app-toko/index.html](https://tokobarang.free.nf/app-toko/index.html)

---

## 📁 Repository Structure
- `api-toko/`: PHP PDO API endpoints (`get_barang.php`, `tambah_barang.php`, `delete_barang.php`, `update_barang.php`).
- `app-toko/`: Frontend assets (`index.html`, `app.js`, `manifest.json`, `sw.js`).
- `database.sql`: MySQL Schema and Sample Data.

*<div align="center">Developed for PjBL Project — © 2026</div>*
