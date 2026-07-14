<?php
require_once 'koneksi.php';
try {
    $pdo->exec("ALTER TABLE barang ADD COLUMN kode_qr VARCHAR(255) NULL, ADD COLUMN latitude VARCHAR(50) NULL, ADD COLUMN longitude VARCHAR(50) NULL;");
    echo "SUCCESS";
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "SUCCESS (already exists)";
    } else {
        echo "ERROR: " . $e->getMessage();
    }
}
