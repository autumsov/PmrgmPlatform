<?php
// Set header agar browser/client tahu response-nya adalah JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Sertakan file koneksi
require_once 'koneksi.php';

try {
    // === PARAMETER PENCARIAN & PAGINASI ===
    $cari    = isset($_GET['cari'])  ? trim($_GET['cari'])  : '';
    $kode_qr = isset($_GET['kode_qr']) ? trim($_GET['kode_qr']) : '';
    $page    = isset($_GET['page'])  ? (int) $_GET['page']  : 1;
    $perPage = isset($_GET['limit']) ? (int) $_GET['limit'] : 5; // Default 5 item per halaman

    if ($kode_qr !== '') {
        $stmt = $pdo->prepare('SELECT * FROM barang WHERE kode_qr = :kode_qr LIMIT 1');
        $stmt->execute([':kode_qr' => $kode_qr]);
        $barang = $stmt->fetch();
        if ($barang) {
            echo json_encode(['status' => 'success', 'data' => $barang]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Barang tidak ditemukan']);
        }
        exit;
    }

    // Pastikan page minimal 1
    if ($page < 1) $page = 1;

    // === HITUNG TOTAL DATA & ASET ===
    if ($cari !== '') {
        $stmtCount = $pdo->prepare('SELECT COUNT(*) as total_items, COALESCE(SUM(harga), 0) as total_harga FROM barang WHERE nama_barang LIKE :cari');
        $stmtCount->execute([':cari' => '%' . $cari . '%']);
    } else {
        $stmtCount = $pdo->query('SELECT COUNT(*) as total_items, COALESCE(SUM(harga), 0) as total_harga FROM barang');
    }
    $rowCount = $stmtCount->fetch(PDO::FETCH_ASSOC);
    $totalData = (int) $rowCount['total_items'];
    $totalAsset = (float) $rowCount['total_harga'];

    // Hitung total halaman (minimal 1 halaman)
    $totalPages = ($totalData > 0) ? (int) ceil($totalData / $perPage) : 1;

    // Pastikan page tidak melebihi total halaman
    if ($page > $totalPages) $page = $totalPages;

    // Hitung offset (posisi awal data)
    $offset = ($page - 1) * $perPage;

    // === AMBIL DATA DENGAN FILTER & LIMIT ===
    if ($cari !== '') {
        $stmt = $pdo->prepare(
            'SELECT * FROM barang WHERE nama_barang LIKE :cari ORDER BY id ASC LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':cari',   '%' . $cari . '%', PDO::PARAM_STR);
    } else {
        $stmt = $pdo->prepare(
            'SELECT * FROM barang ORDER BY id ASC LIMIT :limit OFFSET :offset'
        );
    }
    $stmt->bindValue(':limit',  $perPage, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset,  PDO::PARAM_INT);
    $stmt->execute();
    $barang = $stmt->fetchAll();

    // === KEMBALIKAN RESPONSE JSON ===
    echo json_encode([
        'status'      => 'success',
        'message'     => 'Data barang berhasil diambil',
        'data'        => $barang,
        'pagination'  => [
            'page'        => $page,
            'per_page'    => $perPage,
            'total_data'  => $totalData,
            'total_pages' => $totalPages,
            'total_asset' => $totalAsset
        ]
    ], JSON_PRETTY_PRINT);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => 'Query gagal: ' . $e->getMessage()
    ]);
}