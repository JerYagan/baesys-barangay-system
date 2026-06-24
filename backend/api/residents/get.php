<?php
/**
 * Baesys — Get Resident Profile API
 * 
 * GET /api/residents/get.php?id=...
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

// Authenticate staff/admin
$payload = authenticate('staff');

if (empty($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Resident ID is required']);
    exit;
}

$id = (int)$_GET['id'];

try {
    $pdo = getDBConnection();

    // Fetch resident details
    $stmt = $pdo->prepare('
        SELECT r.*, u.email as account_email, u.status as account_status 
        FROM residents r 
        LEFT JOIN users u ON r.user_id = u.id 
        WHERE r.id = ?
    ');
    $stmt->execute([$id]);
    $resident = $stmt->fetch();

    if (!$resident) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Resident not found']);
        exit;
    }

    // Fetch household details if associated
    $household = null;
    if ($resident['household_id']) {
        $hhStmt = $pdo->prepare('
            SELECT h.*, r.first_name as head_first_name, r.last_name as head_last_name 
            FROM households h 
            LEFT JOIN residents r ON h.head_resident_id = r.id 
            WHERE h.id = ?
        ');
        $hhStmt->execute([$resident['household_id']]);
        $household = $hhStmt->fetch();
    }

    echo json_encode([
        'success' => true,
        'resident' => $resident,
        'household' => $household
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch resident: ' . $e->getMessage()
    ]);
}
