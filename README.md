# Toko Barang — Client-Server Application

An implementation of a simple store management system using a **PHP API (Backend)** and a **Vanilla JS + Tailwind CSS (Frontend)**. This project demonstrates the Client-Server architecture by fetching data from a MySQL database and rendering it dynamically without hardcoded values.


## 👤 Identitas Mahasiswa

| Informasi | Keterangan |
| :--- | :--- |
| **Nama Lengkap** | Muhammad Hasbih Akbar |
| **NIM** | `231220075` |
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

---


*<div align="center">Developed as part of the PjBL Project</div>*
