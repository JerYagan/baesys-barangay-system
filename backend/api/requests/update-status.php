<?php
/**
 * Baesys — Update Document Request Status API
 * 
 * PATCH /api/requests/update-status.php
 * 
 * Request body (JSON):
 *   { "id": 1, "status": "processing", "notes": "Please bring a valid ID when picking up." }
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Only allow PATCH or PUT
if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Authenticate staff/admin
$payload = authenticate('staff');

// Parse JSON body
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['id']) || empty($input['status'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'id and status are required']);
    exit;
}

$id = (int)$input['id'];
$status = trim($input['status']);
$notes = isset($input['notes']) ? trim($input['notes']) : null;

// Validate status
$validStatuses = ['pending', 'processing', 'ready_for_pickup', 'released'];
if (!in_array($status, $validStatuses)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid status value']);
    exit;
}

try {
    $pdo = getDBConnection();

    // Verify request exists
    $checkStmt = $pdo->prepare('
        SELECT dr.*, dt.name as document_name, r.first_name, r.last_name 
        FROM document_requests dr 
        LEFT JOIN document_types dt ON dr.document_type_id = dt.id 
        LEFT JOIN residents r ON dr.resident_id = r.id 
        WHERE dr.id = ?
    ');
    $checkStmt->execute([$id]);
    $request = $checkStmt->fetch();

    if (!$request) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Request not found']);
        exit;
    }

    // Update request
    $stmt = $pdo->prepare('
        UPDATE document_requests 
        SET status = ?, notes = ?, processed_by = ? 
        WHERE id = ?
    ');
    $stmt->execute([$status, $notes, $payload['sub'], $id]);

    // Log action
    $logStmt = $pdo->prepare('
        INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) 
        VALUES (?, ?, ?, ?, ?, ?)
    ');
    $fullName = $request['first_name'] . ' ' . $request['last_name'];
    $docName = $request['document_name'];
    $logStmt->execute([
        $payload['sub'],
        'update_request_status',
        'document_requests',
        $id,
        "Updated request status to '$status' for $fullName ($docName)",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Request status updated successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update request status: ' . $e->getMessage()
    ]);
}
