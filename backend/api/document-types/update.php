<?php
/**
 * Baesys — Update Document Type API (Admin only)
 * 
 * PUT /api/document-types/update.php
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$payload = authenticate('admin');

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['id']) || empty($input['name'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID and name are required.']);
    exit;
}

$id = (int)$input['id'];
$name = trim($input['name']);
$description = !empty($input['description']) ? trim($input['description']) : null;
$fee = isset($input['fee']) ? (float)$input['fee'] : 0.00;
$processingDays = isset($input['processing_days']) ? (int)$input['processing_days'] : 1;

try {
    $pdo = getDBConnection();

    $stmt = $pdo->prepare('
        UPDATE document_types 
        SET name = ?, description = ?, fee = ?, processing_days = ?, updated_at = NOW() 
        WHERE id = ?
    ');
    $stmt->execute([$name, $description, $fee, $processingDays, $id]);

    // Log activity
    $logStmt = $pdo->prepare(
        'INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $logStmt->execute([
        $payload['sub'],
        'update_document_type',
        'document_types',
        $id,
        "Updated document type '$name' (Fee: ₱$fee, Processing: {$processingDays} day(s))",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Document type updated successfully.'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to update document type: ' . $e->getMessage()]);
}
