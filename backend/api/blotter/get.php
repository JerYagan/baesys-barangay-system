<?php
/**
 * Baesys — Get Blotter Case Details API
 * 
 * GET /api/blotter/get.php?id=...
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
    echo json_encode(['success' => false, 'message' => 'Blotter Case ID is required']);
    exit;
}

$id = (int)$_GET['id'];

try {
    $pdo = getDBConnection();

    // Fetch case details
    $stmt = $pdo->prepare('
        SELECT br.*, 
               r.first_name as complainant_first_name, 
               r.last_name as complainant_last_name, 
               r.middle_name as complainant_middle_name,
               r.contact_no as complainant_contact_no,
               r.purok as complainant_purok,
               r.address as complainant_address,
               u.first_name as reporter_first_name,
               u.last_name as reporter_last_name
        FROM blotter_records br 
        LEFT JOIN residents r ON br.complainant_id = r.id 
        LEFT JOIN users u ON br.filed_by = u.id
        WHERE br.id = ?
    ');
    $stmt->execute([$id]);
    $blotter = $stmt->fetch();

    if (!$blotter) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Blotter case not found']);
        exit;
    }

    // Role check: Residents can only view if they are the complainant
    if ($payload['role'] === 'resident') {
        // Fetch resident ID linked to user
        $resStmt = $pdo->prepare('SELECT id FROM residents WHERE user_id = ? AND is_archived = 0');
        $resStmt->execute([$payload['sub']]);
        $resident = $resStmt->fetch();

        if (!$resident || (int)$blotter['complainant_id'] !== (int)$resident['id']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Access denied. You do not have permission to view this record.']);
            exit;
        }
    }

    echo json_encode([
        'success' => true,
        'blotter' => $blotter
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch blotter case detail: ' . $e->getMessage()
    ]);
}
