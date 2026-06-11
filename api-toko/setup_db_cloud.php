<?php
require_once 'koneksi.php';
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
      id INT(11) AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      password VARCHAR(255) NOT NULL,
      token VARCHAR(255)
    )");
    
    $pdo->exec("INSERT INTO users (username, password) SELECT 'admin', '12345' WHERE NOT EXISTS (SELECT * FROM users WHERE username='admin')");
    
    // Add gambar column to barang if not exists
    try {
        $pdo->exec("ALTER TABLE barang ADD COLUMN gambar VARCHAR(255) NULL");
        echo "Gambar column added or exists.<br>";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "Column gambar already exists.<br>";
        } else {
            throw $e;
        }
    }

    echo "DB CLOUD SETUP OK";
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
