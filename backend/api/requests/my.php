<?php
/**
 * Baesys — List Resident's Document Requests API
 * 
 * GET /api/requests/my.php
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

try {
    $pdo = getDBConnection();

    // 1. Fetch resident ID linked to user
    $resStmt = $pdo->prepare('SELECT id FROM residents WHERE user_id = ? AND is_archived = 0');
    $resStmt->execute([$payload['sub']]);
    $resident = $resStmt->fetch();

    if (!$resident) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Resident profile not found']);
        exit;
    }

    $residentId = $resident['id'];

    // 2. Fetch requests submitted by this resident
    $stmt = $pdo->prepare('
        SELECT dr.*, dt.name as document_name, dt.fee as document_fee, dt.processing_days
        FROM document_requests dr 
        LEFT JOIN document_types dt ON dr.document_type_id = dt.id 
        WHERE dr.resident_id = ? 
        ORDER BY dr.requested_at DESC
    ');
    $stmt->execute([$residentId]);
    $requests = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'requests' => $requests
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch your requests: ' . $e->getMessage()
    ]);
}
