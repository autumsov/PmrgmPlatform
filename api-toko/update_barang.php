<?php
// Set header agar browser/client tahu response-nya adalah JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed. Use POST or PUT.']);
    exit;
}

// Sertakan file koneksi database
require_once 'koneksi.php';

try {
    $data_json = json_decode(file_get_contents("php://input"), true);
    
    $id = isset($data_json['id']) ? $data_json['id'] : (isset($_POST['id']) ? $_POST['id'] : '');
    $nama_barang = isset($data_json['nama_barang']) ? $data_json['nama_barang'] : (isset($_POST['nama_barang']) ? $_POST['nama_barang'] : '');
    $harga = isset($data_json['harga']) ? $data_json['harga'] : (isset($_POST['harga']) ? $_POST['harga'] : '');

    if (empty($id) || empty($nama_barang) || empty($harga)) {
        http_response_code(400); // Bad Request
        echo json_encode(['status' => 'error', 'message' => 'Parameter id, nama_barang, dan harga tidak boleh kosong.']);
        exit;
    }

    if (!is_numeric($harga)) {
        http_response_code(400); // Bad Request
        echo json_encode(['status' => 'error', 'message' => 'Parameter harga harus berupa angka.']);
        exit;
    }

    $sql = "UPDATE barang SET nama_barang = :nama_barang, harga = :harga WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':nama_barang', $nama_barang);
    $stmt->bindParam(':harga', $harga);
    
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            http_response_code(200); // OK
            echo json_encode([
                'status' => 'success',
                'message' => 'Data barang berhasil diupdate!',
                'data' => [
                    'id' => $id,
                    'nama_barang' => $nama_barang,
                    'harga' => $harga
                ]
            ], JSON_PRETTY_PRINT);
        } else {
             // RowCount 0 might mean the data was exactly the same, or ID not found.
            // We can treat it as success if no error occurred, but notify the user
            http_response_code(200); 
            echo json_encode([
                'status' => 'success',
                'message' => 'Tidak ada perubahan pada data penyimpan / barang dengan ID tersebut.',
                'data' => [
                    'id' => $id,
                     'nama_barang' => $nama_barang,
                    'harga' => $harga
                ]
            ], JSON_PRETTY_PRINT);
        }

    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode([
            'status' => 'error',
            'message' => 'Gagal mengupdate data di database.'
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
