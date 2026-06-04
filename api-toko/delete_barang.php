<?php
// Set header untuk CORS dan JSON Response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Tangani Preflight Request untuk metode POST/OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed. Use POST.']);
    exit;
}

require_once 'koneksi.php';

// === Validasi Token (Memakai Database) ===
$auth_header = '';

if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
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
    echo json_encode(['status' => 'error', 'message' => 'Akses Ditolak! Token Kosong.']);
    exit;
}

try {
    $cek_token = $pdo->prepare("SELECT * FROM users WHERE token = :token");
    $cek_token->bindParam(':token', $token);
    $cek_token->execute();

    if ($cek_token->rowCount() === 0) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Akses Ditolak! Token Invalid.']);
        exit;
    }
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Kesalahan DB saat cek token: ' . $e->getMessage()]);
    exit;
}
// ======================================

try {
    // Ambil input JSON payload jika tersedia, atau ambil lewat $_POST
    $data_json = json_decode(file_get_contents("php://input"), true);
    $id = isset($data_json['id']) ? $data_json['id'] : (isset($_POST['id']) ? $_POST['id'] : null);

    if (empty($id)) {
        http_response_code(400); // Bad Request
        echo json_encode(['status' => 'error', 'message' => 'Parameter ID barang tidak boleh kosong.']);
        exit;
    }

    // Eksekusi query delete (Hanya gunakan kolom 'id' yang terverifikasi ada)
    $sql = "DELETE FROM barang WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':id', $id);
    
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => "Barang dengan ID $id berhasil dihapus."
            ]);
        } else {
            http_response_code(404); // Not Found
            echo json_encode([
                'status' => 'error',
                'message' => 'Barang tidak ditemukan.'
            ]);
        }
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode([
            'status' => 'error',
            'message' => 'Gagal menghapus data dari database.'
        ]);
    }
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Kesalahan database: ' . $e->getMessage()
    ]);
}
