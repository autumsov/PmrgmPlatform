<?php
// Set header untuk CORS dan JSON Response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Tangani Preflight Request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'koneksi.php';

$json_data = file_get_contents("php://input");
$data = json_decode($json_data, true);

if(isset($data['username']) && isset($data['password'])) {
    $username = $data['username'];
    $password = $data['password'];

    try {
        // Karena koneksi.php menggunakan PDO, ini disesuaikan ke PDO
        $query = "SELECT * FROM users WHERE username = :username AND password = :password";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $password);
        $stmt->execute();
        
        if($stmt->rowCount() > 0) {
            $user = $stmt->fetch();
            
            // 1. GENERATE TOKEN ACAK 
            $token = md5(uniqid(rand(), true));
            $user_id = $user['id'];

            // 2. Simpan token ini ke database user tersebut
            $update = "UPDATE users SET token = :token WHERE id = :id";
            $updateStmt = $pdo->prepare($update);
            $updateStmt->bindParam(':token', $token);
            $updateStmt->bindParam(':id', $user_id);
            $updateStmt->execute();

            // 3. Kembalikan token ke Frontend PWA
            echo json_encode([
                "status" => "success", 
                "pesan" => "Login Berhasil", 
                "token" => $token
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "pesan" => "Username atau Password Salah!"]);
        }
    } catch (\PDOException $e) {
        http_response_code(500);
        echo json_encode(["status" => "error", "pesan" => "Error DB: Pastikan tabel users sudah terbuat! " . $e->getMessage()]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "pesan" => "Akses Ditolak"]);
}
?>
