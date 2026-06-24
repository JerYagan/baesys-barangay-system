<?php
/**
 * Baesys — Create Document Request API
 * 
 * POST /api/requests/create.php
 * 
 * Request body (JSON):
 *   { "document_type_id": 1, "purpose": "Employment requirement" }
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Authenticate user (needs to be resident or have a resident profile)
$payload = authenticate();

// Parse JSON body
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['document_type_id']) || empty($input['purpose'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'document_type_id and purpose are required']);
    exit;
}

$documentTypeId = (int)$input['document_type_id'];
$purpose = trim($input['purpose']);

try {
    $pdo = getDBConnection();

    // 1. Fetch resident ID associated with current user
    $resStmt = $pdo->prepare('SELECT id, first_name, last_name FROM residents WHERE user_id = ? AND is_archived = 0');
    $resStmt->execute([$payload['sub']]);
    $resident = $resStmt->fetch();

    if (!$resident) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'No active resident profile linked to this account']);
        exit;
    }

    $residentId = $resident['id'];

    // 2. Verify document type is active
    $typeStmt = $pdo->prepare('SELECT id, name FROM document_types WHERE id = ? AND is_active = 1');
    $typeStmt->execute([$documentTypeId]);
    $docType = $typeStmt->fetch();

    if (!$docType) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Document type not found or is inactive']);
        exit;
    }

    // 3. Insert document request
    $stmt = $pdo->prepare('
        INSERT INTO document_requests (resident_id, document_type_id, purpose, status) 
        VALUES (?, ?, ?, "pending")
    ');
    $stmt->execute([$residentId, $documentTypeId, $purpose]);
    $requestId = $pdo->lastInsertId();

    // 4. Log the action
    $logStmt = $pdo->prepare('
        INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) 
        VALUES (?, ?, ?, ?, ?, ?)
    ');
    $fullName = $resident['first_name'] . ' ' . $resident['last_name'];
    $docName = $docType['name'];
    $logStmt->execute([
        $payload['sub'],
        'create_request',
        'document_requests',
        $requestId,
        "Resident $fullName requested a $docName",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Document request submitted successfully',
        'request_id' => $requestId
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to submit document request: ' . $e->getMessage()
    ]);
}
