<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed. Use POST.']);
    exit;
}

require_once 'koneksi.php';

// =====================================================================
// BACA php://input SEKALI SAJA — simpan ke $raw_input
// =====================================================================
$raw_input  = file_get_contents("php://input");
$json_input = json_decode($raw_input, true);

// =====================================================================
// VALIDASI TOKEN — Header → POST → GET → JSON body
// =====================================================================
$auth_header = '';
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $auth_header = $_SERVER['HTTP_AUTHORIZATION'];
} elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $auth_header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
} elseif (function_exists('apache_request_headers')) {
    $h = apache_request_headers();
    if (isset($h['Authorization'])) $auth_header = $h['Authorization'];
}

$token = '';
if (preg_match('/Bearer\s(\S+)/', $auth_header, $m)) {
    $token = $m[1];
} elseif ($auth_header !== '') {
    $token = $auth_header;
}

// Fallback: cari token dari POST / GET / JSON body
if ($token === '') {
    if (isset($_POST['token']))           $token = $_POST['token'];
    elseif (isset($_GET['token']))        $token = $_GET['token'];
    elseif (isset($json_input['token'])) $token = $json_input['token'];
}

if ($token === '') {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Akses Ditolak! Token tidak ditemukan.']);
    exit;
}

try {
    $cek = $pdo->prepare("SELECT id FROM users WHERE token = :token LIMIT 1");
    $cek->execute([':token' => $token]);
    if ($cek->rowCount() === 0) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Akses Ditolak! Token tidak valid.']);
        exit;
    }
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'DB error cek token: ' . $e->getMessage()]);
    exit;
}

// =====================================================================
// AMBIL DATA — Prioritas: $_POST (form-data) → $json_input (JSON body)
// =====================================================================
$nama_barang = $_POST['nama_barang'] ?? $json_input['nama_barang'] ?? '';
$harga       = $_POST['harga']       ?? $json_input['harga']       ?? '';
$kode_qr     = $_POST['kode_qr']     ?? $json_input['kode_qr']     ?? null;
$latitude    = $_POST['latitude']    ?? $json_input['latitude']    ?? null;
$longitude   = $_POST['longitude']   ?? $json_input['longitude']   ?? null;

if (empty($nama_barang) || $harga === '') {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'nama_barang dan harga tidak boleh kosong.']);
    exit;
}
if (!is_numeric($harga)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'harga harus berupa angka.']);
    exit;
}

// Upload gambar
$gambar = null;
if (isset($_FILES['gambar']) && $_FILES['gambar']['error'] === UPLOAD_ERR_OK) {
    $upload_dir = __DIR__ . '/uploads/';
    if (!is_dir($upload_dir)) mkdir($upload_dir, 0755, true);
    $file_name = time() . '_' . basename($_FILES['gambar']['name']);
    if (move_uploaded_file($_FILES['gambar']['tmp_name'], $upload_dir . $file_name)) {
        $gambar = $file_name;
    }
}

try {
    $sql  = "INSERT INTO barang (nama_barang, harga, gambar, kode_qr, latitude, longitude)
             VALUES (:nama_barang, :harga, :gambar, :kode_qr, :latitude, :longitude)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nama_barang' => $nama_barang,
        ':harga'       => $harga,
        ':gambar'      => $gambar,
        ':kode_qr'     => $kode_qr,
        ':latitude'    => $latitude,
        ':longitude'   => $longitude,
    ]);

    http_response_code(201);
    echo json_encode([
        'status'  => 'success',
        'message' => 'Data barang berhasil ditambahkan!',
        'data'    => [
            'id'          => $pdo->lastInsertId(),
            'nama_barang' => $nama_barang,
            'harga'       => $harga,
            'gambar'      => $gambar,
            'kode_qr'     => $kode_qr,
            'latitude'    => $latitude,
            'longitude'   => $longitude,
        ]
    ]);
} catch (\PDOException $e) {
    // Auto-migrate jika kolom baru belum ada
    if (strpos($e->getMessage(), 'Unknown column') !== false) {
        try {
            $pdo->exec("ALTER TABLE barang ADD COLUMN IF NOT EXISTS kode_qr    VARCHAR(255) NULL");
            $pdo->exec("ALTER TABLE barang ADD COLUMN IF NOT EXISTS latitude   VARCHAR(50)  NULL");
            $pdo->exec("ALTER TABLE barang ADD COLUMN IF NOT EXISTS longitude  VARCHAR(50)  NULL");
            $pdo->exec("ALTER TABLE barang ADD COLUMN IF NOT EXISTS gambar     VARCHAR(255) NULL");
            echo json_encode(['status' => 'error', 'message' => 'Database diperbarui otomatis. Silakan klik Simpan sekali lagi!']);
            exit;
        } catch (\Exception $ex) {}
    }
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Kesalahan database: ' . $e->getMessage()]);
}
?>
