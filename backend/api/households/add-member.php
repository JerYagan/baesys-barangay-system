<?php
/**
 * Baesys — Add Household Member API
 * 
 * POST /api/households/add-member.php
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

if (!$input || empty($input['household_id']) || empty($input['resident_id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'household_id and resident_id are required']);
    exit;
}

$householdId = (int)$input['household_id'];
$residentId = (int)$input['resident_id'];

try {
    $pdo = getDBConnection();

    // Verify household exists
    $hhCheck = $pdo->prepare('SELECT id, household_no FROM households WHERE id = ?');
    $hhCheck->execute([$householdId]);
    $household = $hhCheck->fetch();

    if (!$household) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Household not found']);
        exit;
    }

    // Verify resident exists and is not archived
    $resCheck = $pdo->prepare('SELECT id, first_name, last_name, household_id FROM residents WHERE id = ? AND is_archived = 0');
    $resCheck->execute([$residentId]);
    $resident = $resCheck->fetch();

    if (!$resident) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Resident not found or is archived']);
        exit;
    }

    $pdo->beginTransaction();

    // If resident is already linked to another household and was its head, clear that head pointer
    if ($resident['household_id'] !== null && (int)$resident['household_id'] !== $householdId) {
        $clearHead = $pdo->prepare('UPDATE households SET head_resident_id = NULL WHERE head_resident_id = ? AND id = ?');
        $clearHead->execute([$residentId, $resident['household_id']]);
    }

    // Update resident's household_id
    $stmt = $pdo->prepare('UPDATE residents SET household_id = ? WHERE id = ?');
    $stmt->execute([$householdId, $residentId]);

    // Log action
    $logStmt = $pdo->prepare('
        INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) 
        VALUES (?, ?, ?, ?, ?, ?)
    ');
    $fullName = $resident['first_name'] . ' ' . $resident['last_name'];
    $hhNo = $household['household_no'];
    $logStmt->execute([
        $payload['sub'],
        'add_household_member',
        'households',
        $householdId,
        "Added resident $fullName to household $hhNo",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Resident added to household successfully'
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to add member: ' . $e->getMessage()
    ]);
}
