<?php
/**
 * Baesys — Add Household API
 * 
 * POST /api/households/add.php
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

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
    exit;
}

// Validate required fields
$required = ['household_no', 'address', 'purok'];
$missing = [];
foreach ($required as $field) {
    if (empty($input[$field])) {
        $missing[] = $field;
    }
}

if (!empty($missing)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields: ' . implode(', ', $missing)
    ]);
    exit;
}

$householdNo = trim($input['household_no']);
$address = trim($input['address']);
$purok = trim($input['purok']);
$headResidentId = !empty($input['head_resident_id']) ? (int)$input['head_resident_id'] : null;

try {
    $pdo = getDBConnection();

    // Check if household number is unique
    $checkStmt = $pdo->prepare('SELECT id FROM households WHERE household_no = ?');
    $checkStmt->execute([$householdNo]);
    if ($checkStmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Household number already exists']);
        exit;
    }

    $pdo->beginTransaction();

    // Insert household
    $stmt = $pdo->prepare('
        INSERT INTO households (household_no, address, purok, head_resident_id) 
        VALUES (?, ?, ?, ?)
    ');
    $stmt->execute([$householdNo, $address, $purok, $headResidentId]);
    $householdId = $pdo->lastInsertId();

    if ($headResidentId !== null) {
        // Verify resident exists
        $resCheck = $pdo->prepare('SELECT id, household_id FROM residents WHERE id = ? AND is_archived = 0');
        $resCheck->execute([$headResidentId]);
        $resident = $resCheck->fetch();

        if (!$resident) {
            $pdo->rollBack();
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Assigned head resident not found or is archived']);
            exit;
        }

        // If the resident was the head of a different household, clear it
        if ($resident['household_id'] !== null && (int)$resident['household_id'] !== $householdId) {
            $clearHead = $pdo->prepare('UPDATE households SET head_resident_id = NULL WHERE head_resident_id = ? AND id = ?');
            $clearHead->execute([$headResidentId, $resident['household_id']]);
        }

        // Update the resident's household link
        $updateRes = $pdo->prepare('UPDATE residents SET household_id = ? WHERE id = ?');
        $updateRes->execute([$householdId, $headResidentId]);
    }

    // Log action
    $logStmt = $pdo->prepare('
        INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) 
        VALUES (?, ?, ?, ?, ?, ?)
    ');
    $logStmt->execute([
        $payload['sub'],
        'create_household',
        'households',
        $householdId,
        "Created household record: $householdNo",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Household record created successfully',
        'household_id' => $householdId
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to create household: ' . $e->getMessage()
    ]);
}
