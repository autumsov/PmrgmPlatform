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
    $kode_qr = isset($data_json['kode_qr']) ? $data_json['kode_qr'] : (isset($_POST['kode_qr']) ? $_POST['kode_qr'] : null);
    $latitude = isset($data_json['latitude']) ? $data_json['latitude'] : (isset($_POST['latitude']) ? $_POST['latitude'] : null);
    $longitude = isset($data_json['longitude']) ? $data_json['longitude'] : (isset($_POST['longitude']) ? $_POST['longitude'] : null);

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

    // Upload handling
    $gambar = null;
    if (isset($_FILES['gambar']) && $_FILES['gambar']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = __DIR__ . '/uploads/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0755, true);
        }
        $file_name = time() . '_' . basename($_FILES['gambar']['name']);
        if (move_uploaded_file($_FILES['gambar']['tmp_name'], $upload_dir . $file_name)) {
            $gambar = $file_name;
        }
    }

    $sql = "INSERT INTO barang (nama_barang, harga, gambar, kode_qr, latitude, longitude) VALUES (:nama_barang, :harga, :gambar, :kode_qr, :latitude, :longitude)";
    $stmt = $pdo->prepare($sql);
    
    $stmt->bindParam(':nama_barang', $nama_barang);
    $stmt->bindParam(':harga', $harga);
    $stmt->bindParam(':gambar', $gambar);
    $stmt->bindParam(':kode_qr', $kode_qr);
    $stmt->bindParam(':latitude', $latitude);
    $stmt->bindParam(':longitude', $longitude);
    
    if ($stmt->execute()) {
        http_response_code(201); // Created
        echo json_encode([
            'status' => 'success',
            'message' => 'Data barang berhasil ditambahkan!',
            'data' => [
                'id' => $pdo->lastInsertId(),
                'nama_barang' => $nama_barang,
                'harga' => $harga,
                'gambar' => $gambar,
                'kode_qr' => $kode_qr,
                'latitude' => $latitude,
                'longitude' => $longitude
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
