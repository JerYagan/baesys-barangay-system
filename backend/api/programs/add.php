<?php
/**
 * Baesys — Create Program/Project API (Admin/Staff only)
 * 
 * POST /api/programs/add.php
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

// Authenticate user (staff/admin only)
$payload = authenticate('staff');

// Parse JSON body
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['name']) || empty($input['status'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Program name and status are required fields.']);
    exit;
}

$name = trim($input['name']);
$description = !empty($input['description']) ? trim($input['description']) : null;
$status = trim($input['status']);
$startDate = !empty($input['start_date']) ? $input['start_date'] : null;
$endDate = !empty($input['end_date']) ? $input['end_date'] : null;
$budget = isset($input['budget']) ? (float)$input['budget'] : null;
$beneficiaries = !empty($input['target_beneficiaries']) ? trim($input['target_beneficiaries']) : null;

if (!in_array($status, ['upcoming', 'ongoing', 'completed'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid status value.']);
    exit;
}

try {
    $pdo = getDBConnection();

    $stmt = $pdo->prepare('
        INSERT INTO programs (name, description, status, start_date, end_date, budget, target_beneficiaries) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $name,
        $description,
        $status,
        $startDate,
        $endDate,
        $budget,
        $beneficiaries
    ]);

    $id = $pdo->lastInsertId();

    // Log activity
    $logStmt = $pdo->prepare(
        'INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $logStmt->execute([
        $payload['sub'],
        'create_program',
        'programs',
        $id,
        "Created program/project '$name' (Status: $status)",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Program recorded successfully.',
        'id' => $id
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to create program: ' . $e->getMessage()]);
}
