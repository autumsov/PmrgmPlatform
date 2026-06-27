<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'koneksi.php';

try {
    $stmt = $pdo->query('SELECT nama_barang, harga FROM barang ORDER BY id ASC');
    $barang = $stmt->fetchAll();

    $labels = [];
    $values = [];

    foreach ($barang as $item) {
        $labels[] = $item['nama_barang'];
        $values[] = (int) $item['harga']; // Menggunakan harga sebagai nilai kontribusi
    }

    echo json_encode([
        'status' => 'success',
        'labels' => $labels,
        'values' => $values
    ]);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Query gagal: ' . $e->getMessage()
    ]);
}
