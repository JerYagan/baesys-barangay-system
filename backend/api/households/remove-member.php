<?php
/**
 * Baesys — Remove Household Member API
 * 
 * POST /api/households/remove-member.php
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

// Authenticate staff/admin
$payload = authenticate('staff');

// Parse JSON body
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['resident_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'resident_id is required']);
    exit;
}

$residentId = (int)$input['resident_id'];

try {
    $pdo = getDBConnection();

    // Verify resident exists
    $resCheck = $pdo->prepare('SELECT id, first_name, last_name, household_id FROM residents WHERE id = ?');
    $resCheck->execute([$residentId]);
    $resident = $resCheck->fetch();

    if (!$resident) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Resident not found']);
        exit;
    }

    $householdId = $resident['household_id'];
    if ($householdId === null) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Resident is not a member of any household']);
        exit;
    }

    $pdo->beginTransaction();

    // If resident is the head of household, clear head resident pointer
    $clearHead = $pdo->prepare('UPDATE households SET head_resident_id = NULL WHERE head_resident_id = ? AND id = ?');
    $clearHead->execute([$residentId, $householdId]);

    // Update resident's household_id to NULL
    $stmt = $pdo->prepare('UPDATE residents SET household_id = NULL WHERE id = ?');
    $stmt->execute([$residentId]);

    // Log action
    $logStmt = $pdo->prepare('
        INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) 
        VALUES (?, ?, ?, ?, ?, ?)
    ');
    $fullName = $resident['first_name'] . ' ' . $resident['last_name'];
    $logStmt->execute([
        $payload['sub'],
        'remove_household_member',
        'households',
        $householdId,
        "Removed resident $fullName from household ID $householdId",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Resident removed from household successfully'
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to remove member: ' . $e->getMessage()
    ]);
}
