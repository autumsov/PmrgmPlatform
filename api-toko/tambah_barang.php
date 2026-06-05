<?php
// Set header agar browser/client tahu response-nya adalah JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed. Use POST.']);
    exit;
}

// Sertakan file koneksi database
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
    echo json_encode(['status' => 'error', 'message' => 'Akses Ditolak!']);
    exit;
}

try {
    $cek_token = $pdo->prepare("SELECT * FROM users WHERE token = :token");
    $cek_token->bindParam(':token', $token);
    $cek_token->execute();

    if ($cek_token->rowCount() === 0) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Akses Ditolak!']);
        exit;
    }
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Kesalahan DB saat cek token: ' . $e->getMessage()]);
    exit;
}
// ======================================

try {
    $data_json = json_decode(file_get_contents("php://input"), true);
    
    $nama_barang = isset($data_json['nama_barang']) ? $data_json['nama_barang'] : (isset($_POST['nama_barang']) ? $_POST['nama_barang'] : '');
    $harga = isset($data_json['harga']) ? $data_json['harga'] : (isset($_POST['harga']) ? $_POST['harga'] : '');

    if (empty($nama_barang) || empty($harga)) {
        http_response_code(400); // Bad Request
        echo json_encode(['status' => 'error', 'message' => 'Parameter nama_barang dan harga tidak boleh kosong.']);
        exit;
    }

    if (!is_numeric($harga)) {
        http_response_code(400); // Bad Request
        echo json_encode(['status' => 'error', 'message' => 'Parameter harga harus berupa angka.']);
        exit;
    }

    $sql = "INSERT INTO barang (nama_barang, harga) VALUES (:nama_barang, :harga)";
    $stmt = $pdo->prepare($sql);
    
    $stmt->bindParam(':nama_barang', $nama_barang);
    $stmt->bindParam(':harga', $harga);
    
    if ($stmt->execute()) {
        http_response_code(201); // Created
        echo json_encode([
            'status' => 'success',
            'message' => 'Data barang berhasil ditambahkan!',
            'data' => [
                'id' => $pdo->lastInsertId(),
                'nama_barang' => $nama_barang,
                'harga' => $harga
            ]
        ], JSON_PRETTY_PRINT);
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode([
            'status' => 'error',
            'message' => 'Gagal menyimpan data ke database.'
        ]);
    }
} catch (\PDOException $e) {
    http_response_code(500); // Internal Server Error
    echo json_encode([
        'status' => 'error',
        'message' => 'Kesalahan database: ' . $e->getMessage()
    ]);
}
?>
