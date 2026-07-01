<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed. Use GET.']);
    exit;
}

require_once 'koneksi.php';

// === Validasi Token (Memakai Database) ===
$auth_header = '';

if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
} else if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $auth_header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
} else if (function_exists('apache_request_headers')) {
    $requestHeaders = apache_request_headers();
    if (isset($requestHeaders['Authorization'])) {
        $auth_header = $requestHeaders['Authorization'];
    }
}

$token = '';
if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
    $token = $matches[1];
} else if ($auth_header !== '') {
    $token = $auth_header;
}

if ($token === '') {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Akses Ditolak! Token tidak ditemukan.']);
    exit;
}

try {
    $cek_token = $pdo->prepare("SELECT * FROM users WHERE token = :token");
    $cek_token->bindParam(':token', $token);
    $cek_token->execute();

    if ($cek_token->rowCount() === 0) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Akses Ditolak! Token tidak valid.']);
        exit;
    }
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Kesalahan DB saat cek token: ' . $e->getMessage()]);
    exit;
}
// ======================================

try {
    $stmt = $pdo->query('SELECT * FROM barang ORDER BY id ASC');
    $barang = $stmt->fetchAll();

    $total_aset = 0;
    foreach ($barang as $bar) {
        $total_aset += (int)$bar['harga'];
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Data untuk laporan berhasil diambil',
        'data' => $barang,
        'kalkulasi' => [
            'total_aset' => $total_aset
        ]
    ], JSON_PRETTY_PRINT);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Query gagal: ' . $e->getMessage()]);
}
