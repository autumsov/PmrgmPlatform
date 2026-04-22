# Toko Barang — Client-Server Application

An implementation of a simple store management system using a **PHP API (Backend)** and a **Vanilla JS + Tailwind CSS (Frontend)**. This project demonstrates the Client-Server architecture by fetching data from a MySQL database and rendering it dynamically without hardcoded values.


## 👤 Identitas Mahasiswa

| Informasi | Keterangan |
| :--- | :--- |
| **Nama Lengkap** | Muhammad Fajriska Maulana |
| **NIM** | `231220044` |
| **Kelas** | 31 |
| **Program Studi** | Teknik Informatika |
| **Instansi** | Universitas Muhammadiyah Pontianak |
| **Dosen Pengampu** | Sucipto, M.Kom |

## 🏗️ Architecture

- **Backend**: PHP PDO API with JSON responses.
- **Frontend**: Single Page Application (SPA) using `fetch()` and Tailwind CSS.
- **Database**: MySQL.

## 📁 Repository Structure

- `api-toko/`: Contains PHP scripts for database connection and API endpoints.
- `app-toko/`: Contains the frontend UI (`index.html`, `app.js`).
- `database.sql`: SQL script to initialize the database schema and sample data.

## 🚀 Getting Started

### 1. Database Setup
1. Open your MySQL manager (e.g., phpMyAdmin).
2. Create a new database named `db_toko`.
3. Import the `database.sql` file provided in this repository.

### 2. Configuration
- Ensure `api-toko/koneksi.php` has the correct database credentials:
  ```php
  $host   = 'localhost';
  $db     = 'db_toko';
  $user   = 'root';
  $pass   = '';
  ```

### 3. Running the App
1. Place both folders (`api-toko` and `app-toko`) in your web server root (e.g., `htdocs` or `www` in Laragon).
2. Start your Apache and MySQL services.
3. Open `http://localhost/app-toko/index.html` in your browser.

## ✨ Features
- **Dynamic Fetch**: Data is loaded automatically via JS `fetch()`.
- **Modern UI**: Styled with Tailwind CSS (Glassmorphism effect).
- **Real-time Stats**: Automatically calculates total items, total stock, and price ranges.
- **Search**: Live filter to search for items by name.
- **PWA (Progressive Web App)**: Dapat diinstall sebagai aplikasi native di Desktop/Mobile.

---

## 📱 Tugas Praktikum Pertemuan 4 — Progressive Web App (PWA)

Pada pertemuan ini, aplikasi **Toko Barang** ditingkatkan menjadi **Progressive Web App (PWA)** sehingga dapat diinstall sebagai aplikasi native.

### Apa yang Ditambahkan

| File | Keterangan |
| :--- | :--- |
| `app-toko/icons/icon-192x192.png` | Ikon aplikasi 192×192 px |
| `app-toko/icons/icon-512x512.png` | Ikon aplikasi 512×512 px |
| `app-toko/manifest.json` | Manifest PWA (nama, ikon, warna tema, display mode) |
| `app-toko/sw.js` | Service Worker dengan caching Install & Fetch |

### File yang Dimodifikasi

| File | Perubahan |
| :--- | :--- |
| `app-toko/index.html` | Ditambahkan `<link rel="manifest">`, `<meta name="theme-color">`, dan favicon |
| `app-toko/app.js` | Ditambahkan script registrasi Service Worker |

### Cara Kerja Service Worker (`sw.js`)

1. **Install Event** — Meng-cache file-file utama (app shell): `index.html`, `app.js`, `style.css`, ikon, dan CDN resources.
2. **Activate Event** — Membersihkan cache lama saat versi baru tersedia.
3. **Fetch Event** — Menggunakan strategi *cache-first* untuk aset statis dan *network-first* untuk API calls.

### Cara Verifikasi

1. Pastikan **Laragon** (Apache + MySQL) berjalan.
2. Buka `http://localhost/app-toko/` di **Google Chrome**.
3. Buka **DevTools (F12)** → tab **Application**:
   - **Manifest** — Pastikan nama dan ikon tampil.
   - **Service Workers** — Pastikan `sw.js` berstatus *activated*.
   - **Cache Storage** — Pastikan file-file ter-cache.
4. Lihat **Address Bar** Chrome — akan muncul ikon **Install App** (🖥️⬇️).
5. Klik ikon tersebut → Aplikasi web akan terinstall sebagai **aplikasi Desktop/Mobile**.

*<div align="center">Developed as part of the PjBL Project</div>*
