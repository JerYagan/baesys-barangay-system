<?php
/**
 * Baesys — List Resident's Filed Complaints API
 * 
 * GET /api/blotter/my.php
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

    // 2. Fetch blotter reports filed by this resident
    $stmt = $pdo->prepare('
        SELECT br.*, 
               r.first_name as complainant_first_name, 
               r.last_name as complainant_last_name
        FROM blotter_records br 
        LEFT JOIN residents r ON br.complainant_id = r.id 
        WHERE br.complainant_id = ? 
        ORDER BY br.created_at DESC
    ');
    $stmt->execute([$residentId]);
    $records = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'records' => $records
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch your complaints: ' . $e->getMessage()
    ]);
}
