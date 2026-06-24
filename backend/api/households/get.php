<?php
/**
 * Baesys — Get Household details API
 * 
 * GET /api/households/get.php?id=...
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
    echo json_encode(['success' => false, 'message' => 'Household ID is required']);
    exit;
}

$id = (int)$_GET['id'];

try {
    $pdo = getDBConnection();

    // Fetch household details
    $stmt = $pdo->prepare('
        SELECT h.*, 
               r.first_name as head_first_name, 
               r.last_name as head_last_name 
        FROM households h 
        LEFT JOIN residents r ON h.head_resident_id = r.id 
        WHERE h.id = ?
    ');
    $stmt->execute([$id]);
    $household = $stmt->fetch();

    if (!$household) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Household not found']);
        exit;
    }

    // Fetch members of the household (non-archived)
    $membersStmt = $pdo->prepare('
        SELECT id, first_name, last_name, middle_name, birthdate, sex, civil_status, contact_no, purok, address, is_archived 
        FROM residents 
        WHERE household_id = ? AND is_archived = 0 
        ORDER BY last_name ASC, first_name ASC
    ');
    $membersStmt->execute([$id]);
    $members = $membersStmt->fetchAll();

    echo json_encode([
        'success' => true,
        'household' => $household,
        'members' => $members
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch household details: ' . $e->getMessage()
    ]);
}
