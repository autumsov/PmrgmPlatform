<?php
require_once 'koneksi.php';

$log = [];

// =====================================================================
// TABEL USERS
// =====================================================================
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id       INT(11)      AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50)  NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        token    VARCHAR(255) NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $log[] = "✅ Tabel <b>users</b> siap.";
} catch (PDOException $e) {
    $log[] = "❌ Tabel users: " . $e->getMessage();
}

// Seed user admin default jika belum ada
try {
    $pdo->exec("INSERT INTO users (username, password)
                SELECT 'admin', '12345'
                WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')");
    $log[] = "✅ User admin default dicek/ditambahkan.";
} catch (PDOException $e) {
    $log[] = "⚠️ User insert: " . $e->getMessage();
}

// =====================================================================
// TABEL BARANG — Buat dengan SEMUA kolom lengkap
// =====================================================================
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS barang (
        id           INT(11)       AUTO_INCREMENT PRIMARY KEY,
        nama_barang  VARCHAR(255)  NOT NULL,
        harga        DECIMAL(15,2) NOT NULL DEFAULT 0,
        gambar       VARCHAR(255)  NULL,
        kode_qr      VARCHAR(255)  NULL,
        latitude     VARCHAR(50)   NULL,
        longitude    VARCHAR(50)   NULL,
        created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    $log[] = "✅ Tabel <b>barang</b> siap (dibuat dengan semua kolom).";
} catch (PDOException $e) {
    $log[] = "❌ Tabel barang CREATE: " . $e->getMessage();
}

// =====================================================================
// PATCH KOLOM — Tambahkan kolom yang mungkin belum ada di tabel lama
// =====================================================================
$patch_columns = [
    'gambar'    => "ALTER TABLE barang ADD COLUMN gambar    VARCHAR(255) NULL",
    'kode_qr'   => "ALTER TABLE barang ADD COLUMN kode_qr   VARCHAR(255) NULL",
    'latitude'  => "ALTER TABLE barang ADD COLUMN latitude  VARCHAR(50)  NULL",
    'longitude' => "ALTER TABLE barang ADD COLUMN longitude VARCHAR(50)  NULL",
];

foreach ($patch_columns as $col => $sql) {
    try {
        $pdo->exec($sql);
        $log[] = "✅ Kolom <b>$col</b> berhasil ditambahkan.";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            $log[] = "✔️ Kolom <b>$col</b> sudah ada (dilewati).";
        } else {
            $log[] = "❌ Kolom $col: " . $e->getMessage();
        }
    }
}

// =====================================================================
// VERIFIKASI — Cek struktur tabel akhir
// =====================================================================
$log[] = "<br><b>--- Struktur Tabel Barang (Final) ---</b>";
try {
    $stmt = $pdo->query("DESCRIBE barang");
    $cols = $stmt->fetchAll();
    foreach ($cols as $c) {
        $log[] = "&nbsp;&nbsp;<code>" . $c['Field'] . " " . $c['Type'] . " " . ($c['Null'] === 'YES' ? 'NULL' : 'NOT NULL') . "</code>";
    }
} catch (PDOException $e) {
    $log[] = "❌ DESCRIBE barang: " . $e->getMessage();
}

// =====================================================================
// OUTPUT
// =====================================================================
echo "<!DOCTYPE html><html><head><meta charset='utf-8'><title>DB Setup</title>";
echo "<style>body{font-family:monospace;background:#1e1e2e;color:#cdd6f4;padding:30px}
      h2{color:#89dceb} .ok{color:#a6e3a1} .err{color:#f38ba8}</style></head><body>";
echo "<h2>🗄️ Cloud Database Setup — tokobarang.free.nf</h2>";
echo "<ul>";
foreach ($log as $line) {
    echo "<li>$line</li>";
}
echo "</ul>";
echo "<br><b style='color:#a6e3a1'>✅ SETUP SELESAI. Semua kolom database sudah disinkronkan!</b>";
echo "</body></html>";
?>
