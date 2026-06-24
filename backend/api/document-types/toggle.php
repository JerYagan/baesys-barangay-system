<?php
/**
 * Baesys — Toggle Document Type Active/Inactive API (Admin only)
 * 
 * PATCH /api/document-types/toggle.php
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PATCH' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$payload = authenticate('admin');

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['id']) || !isset($input['is_active'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID and is_active status are required.']);
    exit;
}

$id = (int)$input['id'];
$isActive = (int)$input['is_active'];

try {
    $pdo = getDBConnection();

    $stmt = $pdo->prepare('UPDATE document_types SET is_active = ?, updated_at = NOW() WHERE id = ?');
    $stmt->execute([$isActive, $id]);

    // Log activity
    $logStmt = $pdo->prepare(
        'INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $logStmt->execute([
        $payload['sub'],
        'toggle_document_type',
        'document_types',
        $id,
        "Changed document type #$id active status to " . ($isActive ? 'Active' : 'Inactive'),
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Document type status updated.'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to toggle document type: ' . $e->getMessage()]);
}
