<?php
// Deteksi environment (Local vs Production)
$is_local = in_array($_SERVER['HTTP_HOST'], ['localhost', '127.0.0.1', '::1']);

if ($is_local) {
    // Konfigurasi Local (Laragon)
    $host = 'localhost';
    $db   = 'db_toko'; 
    $user = 'root';
    $pass = ''; 
} else {
    // === KONFIGURASI CLOUD (InfinityFree / cPanel) ===
    // Silakan ganti sesuai data di Control Panel Hosting kamu!
    $host = 'sql111.infinityfree.com'; // Contoh: sql123.infinityfree.com
    $db   = 'if0_41694521_db_toko';    // Contoh: if0_12345678_dbtoko
    $user = 'if0_41694521';           // Contoh: if0_12345678
    $pass = 'Ownwnwn56';              // Masukkan Password Hosting kamu!
}

$charset = 'utf8mb4';
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
}
catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Koneksi database gagal. Silakan cek konfigurasi hosting.'
    ]);
    exit;
}
?>
