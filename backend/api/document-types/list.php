<?php
/**
 * Baesys — List Document Types API
 * 
 * GET /api/document-types/list.php
 * Optional: ?all=1 (admin only — includes inactive types)
 * 
 * Returns document types in the system.
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

$showAll = false;
if (isset($_GET['all']) && (int)$_GET['all'] === 1) {
    // Only admin can see inactive types
    if ($payload['role'] === 'admin') {
        $showAll = true;
    }
}

try {
    $pdo = getDBConnection();

    $sql = 'SELECT id, name, description, fee, processing_days, is_active, created_at, updated_at FROM document_types';
    if (!$showAll) {
        $sql .= ' WHERE is_active = 1';
    }
    $sql .= ' ORDER BY name ASC';

    $stmt = $pdo->query($sql);
    $types = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'document_types' => $types
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch document types: ' . $e->getMessage()
    ]);
}
