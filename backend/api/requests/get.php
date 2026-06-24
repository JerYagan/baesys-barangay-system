<?php
/**
 * Baesys — Get Document Request Detail API
 * 
 * GET /api/requests/get.php?id=...
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
    echo json_encode(['success' => false, 'message' => 'Request ID is required']);
    exit;
}

$id = (int)$_GET['id'];

try {
    $pdo = getDBConnection();

    // Fetch request details
    $stmt = $pdo->prepare('
        SELECT dr.*, 
               r.first_name as resident_first_name, 
               r.last_name as resident_last_name, 
               r.middle_name as resident_middle_name,
               r.birthdate as resident_birthdate,
               r.sex as resident_sex,
               r.civil_status as resident_civil_status,
               r.contact_no as resident_contact_no,
               r.purok as resident_purok,
               r.address as resident_address,
               dt.name as document_name, 
               dt.fee as document_fee,
               dt.processing_days
        FROM document_requests dr 
        LEFT JOIN residents r ON dr.resident_id = r.id 
        LEFT JOIN document_types dt ON dr.document_type_id = dt.id 
        WHERE dr.id = ?
    ');
    $stmt->execute([$id]);
    $request = $stmt->fetch();

    if (!$request) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Request not found']);
        exit;
    }

    // Role check: Residents can only view their own requests
    if ($payload['role'] === 'resident') {
        // Fetch resident ID linked to user
        $resStmt = $pdo->prepare('SELECT id FROM residents WHERE user_id = ? AND is_archived = 0');
        $resStmt->execute([$payload['sub']]);
        $resident = $resStmt->fetch();

        if (!$resident || (int)$request['resident_id'] !== (int)$resident['id']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Access denied. You do not have permission to view this request.']);
            exit;
        }
    }

    echo json_encode([
        'success' => true,
        'request' => $request
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch request detail: ' . $e->getMessage()
    ]);
}
