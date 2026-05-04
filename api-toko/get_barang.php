<?php
// Set header agar browser/client tahu response-nya adalah JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Sertakan file koneksi
require_once 'koneksi.php';

try {
    // Query ambil semua data barang (diurutkan berdasarkan ID)
    $stmt = $pdo->query('SELECT * FROM barang ORDER BY id ASC');
    $barang = $stmt->fetchAll();

    // Kembalikan response JSON dengan status success (menggunakan JSON_PRETTY_PRINT agar rapi)
    echo json_encode([
        'status'  => 'success',
        'message' => 'Data barang berhasil diambil',
        'data'    => $barang
    ], JSON_PRETTY_PRINT);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Query gagal: ' . $e->getMessage()
    ]);
}