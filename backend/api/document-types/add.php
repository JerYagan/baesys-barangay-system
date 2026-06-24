<?php
/**
 * Baesys — Add Document Type API (Admin only)
 * 
 * POST /api/document-types/add.php
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$payload = authenticate('admin');

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['name'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Document type name is required.']);
    exit;
}

$name = trim($input['name']);
$description = !empty($input['description']) ? trim($input['description']) : null;
$fee = isset($input['fee']) ? (float)$input['fee'] : 0.00;
$processingDays = isset($input['processing_days']) ? (int)$input['processing_days'] : 1;

try {
    $pdo = getDBConnection();

    $stmt = $pdo->prepare('
        INSERT INTO document_types (name, description, fee, processing_days, is_active) 
        VALUES (?, ?, ?, ?, 1)
    ');
    $stmt->execute([$name, $description, $fee, $processingDays]);

    $id = $pdo->lastInsertId();

    // Log activity
    $logStmt = $pdo->prepare(
        'INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $logStmt->execute([
        $payload['sub'],
        'add_document_type',
        'document_types',
        $id,
        "Added document type '$name' (Fee: ₱$fee, Processing: {$processingDays} day(s))",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Document type added successfully.',
        'id' => $id
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to add document type: ' . $e->getMessage()]);
}
