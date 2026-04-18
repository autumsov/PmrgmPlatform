<?php
require_once 'c:\laragon\www\api-toko\koneksi.php';

try {
    // Kosongkan tabel dulu
    $pdo->query("TRUNCATE TABLE barang");

    // Masukkan data barang
    $sql = "INSERT INTO barang (id, nama_barang, harga) VALUES 
            (1, 'Laptop ASUS ROG', 15000000),
            (2, 'Mouse Logitech M280', 150000),
            (3, 'Keyboard Mechanical Rexus', 350000),
            (4, 'Monitor Samsung 24 Inch', 1200000)";
    
    $pdo->exec($sql);
    echo "Seed data berhasil! Database sekarang berisi 4 barang.";
} catch (Exception $e) {
    echo "Gagal melakukan seeding: " . $e->getMessage();
}
