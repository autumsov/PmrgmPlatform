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

## 🔒 Tugas Praktikum Pertemuan 9 — API Security & Token-Based Authentication
Aplikasi telah menggunakan sistem pengamanan *"Gembok Cerdas"* (Token-based Auth) untuk melindungi API dari akses luar atau pencurian data.
- **Login Endpoint (`login.php`)**: Memverifikasi kombinasi `username` dan `password` (PDO) melalui database `users`, lalu me-return Token autentikasi unik.
- **Frontend Guard**: Skrip `app.js` memeriksa keberadaan *token* pada `localStorage`. Jika kosong, _user_ diusir secara otomatis (Redirect) menuju `login.html`.
- **API Lockdown**: Akses mutasi data (`tambah_barang.php`, `update_barang.php`, `delete_barang.php`) sekarang membutuhkan Header `Authorization: Bearer <TOKEN>`. Token tersebut divalidasi ke dalam Database dan ditolak secara instan (HTTP 401) jika tak sah.
- **UI Login Aesthetics**: Antarmuka `login.html` dibangun bergaya *premium glassmorphism* lengkap dengan *micro-animations* yang nampak profesional.

---

## 🏆 Misi PjBL Selesai (Fullstack API Platform Modern)

Proyek ini telah resmi menyelesaikan kurikulum **Fullstack API Platform Modern** dengan implementasi sistem **Create, Read, Update, Delete (CRUD)** murni menggunakan **Javascript Fetch** dan **PHP JSON Endpoint**.

### 🛠️ Fitur CRUD & UI/UX Requirements (Update Hari Ini):
1.  **Dynamic Update Logic**:
    - **Auto-Fill Data**: Form entri otomatis terisi dengan data produk saat tombol Edit diklik.
    - **Smart Button States**: Tombol "Simpan Data" secara dinamis berubah menjadi **"Update Data"** dengan warna **Biru Cerah** saat dalam mode edit untuk memudahkan navigasi user.
    - **Auto-Scroll Navigation**: Layar otomatis melakukan *scroll* ke atas menuju area formulir saat user menekan tombol edit, memastikan alur kerja yang lancar.
2.  **Robust API Engine**:
    - **PHP PDO JSON Backend**: Menggunakan `update_barang.php`, `tambah_barang.php`, dan `delete_barang.php` sebagai RESTful API yang mengembalikan response JSON murni.
    - **Content-Type Validation**: Implementasi pengecekan `application/json` pada frontend untuk menangani hambatan keamanan (AES Challenge) pada hosting InfinityFree secara elegan.
3.  **PWA & Service Worker Resilience**:
    - Perbaikan pada `sw.js` untuk mencegah *error caching* pada endpoint API, memastikan sinkronisasi data tetap akurat dan tidak terjebak pada halaman error HTML.
4.  **Zero-Reload SPA Workflow**:
    - Seluruh proses penambahan, pengubahan, dan penghapusan data dilakukan tanpa mengedipkan (*refresh*) halaman browser satu pun, memberikan pengalaman aplikasi desktop di dalam web.

---

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
