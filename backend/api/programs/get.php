<?php
/**
 * Baesys — Get Program Details API
 * 
 * GET /api/programs/get.php?id=...
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Authenticate user
$payload = authenticate();

if (empty($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Program ID is required']);
    exit;
}

$id = (int)$_GET['id'];

try {
    $pdo = getDBConnection();

    $stmt = $pdo->prepare('SELECT * FROM programs WHERE id = ?');
    $stmt->execute([$id]);
    $program = $stmt->fetch();

    if (!$program) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Program not found.']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'program' => $program
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
}
