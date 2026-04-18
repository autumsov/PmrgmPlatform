<?php
require_once 'c:\laragon\www\api-toko\koneksi.php';

try {
    $stmt = $pdo->query("DESCRIBE barang");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Columns in barang:\n";
    print_r($columns);

    $stmt2 = $pdo->query("SELECT * FROM barang");
    $data = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    echo "\nData in barang:\n";
    print_r($data);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
