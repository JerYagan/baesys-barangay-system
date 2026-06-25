<?php
/**
 * Baesys — Request Digital ID API
 * 
 * POST /api/digital-id/request.php
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

try {
    $payload = authenticate();
    $pdo = getDBConnection();

    // Find the resident record based on user_id
    $resStmt = $pdo->prepare('SELECT * FROM residents WHERE user_id = ? AND is_archived = 0');
    $resStmt->execute([$payload['sub']]);
    $resident = $resStmt->fetch();

    if (!$resident) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Resident profile not found.']);
        exit;
    }

    if (!empty($resident['barangay_id_no'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Digital ID has already been issued.']);
        exit;
    }

    if ($resident['digital_id_status'] === 'requested') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Digital ID request is already pending approval.']);
        exit;
    }

    // Update status to 'requested'
    $updateStmt = $pdo->prepare("UPDATE residents SET digital_id_status = 'requested' WHERE id = ?");
    $updateStmt->execute([$resident['id']]);

    echo json_encode([
        'success' => true,
        'message' => 'Digital ID request submitted successfully. Staff will review and issue your ID shortly.'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error: ' . $e->getMessage()]);
}
?>
