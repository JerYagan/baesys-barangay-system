<?php
/**
 * Baesys — Get Official Details API
 * 
 * GET /api/officials/get.php?id=...
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

if (empty($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Official ID is required']);
    exit;
}

$id = (int)$_GET['id'];

try {
    $pdo = getDBConnection();

    $stmt = $pdo->prepare('SELECT * FROM officials WHERE id = ?');
    $stmt->execute([$id]);
    $official = $stmt->fetch();

    if (!$official) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Official not found']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'official' => $official
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
}
