<?php
/**
 * Baesys — Update Household API
 * 
 * PUT /api/households/update.php
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Only allow PUT
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Authenticate staff/admin
$payload = authenticate('staff');

// Parse JSON body
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Household ID is required']);
    exit;
}

$id = (int)$input['id'];

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

    // Check if household exists
    $checkStmt = $pdo->prepare('SELECT id, household_no FROM households WHERE id = ?');
    $checkStmt->execute([$id]);
    $existing = $checkStmt->fetch();

    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Household not found']);
        exit;
    }

    // Check if household number is unique (if changed)
    if (strtolower($existing['household_no']) !== strtolower($householdNo)) {
        $uniqueStmt = $pdo->prepare('SELECT id FROM households WHERE household_no = ?');
        $uniqueStmt->execute([$householdNo]);
        if ($uniqueStmt->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Household number already exists']);
            exit;
        }
    }

    $pdo->beginTransaction();

    // Update household details
    $stmt = $pdo->prepare('
        UPDATE households 
        SET household_no = ?, address = ?, purok = ?, head_resident_id = ? 
        WHERE id = ?
    ');
    $stmt->execute([$householdNo, $address, $purok, $headResidentId, $id]);

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

        // If the resident was the head of another household, clear that association
        if ($resident['household_id'] !== null && (int)$resident['household_id'] !== $id) {
            $clearHead = $pdo->prepare('UPDATE households SET head_resident_id = NULL WHERE head_resident_id = ? AND id = ?');
            $clearHead->execute([$headResidentId, $resident['household_id']]);
        }

        // Update the resident's household link to this one
        $updateRes = $pdo->prepare('UPDATE residents SET household_id = ? WHERE id = ?');
        $updateRes->execute([$id, $headResidentId]);
    }

    // Log action
    $logStmt = $pdo->prepare('
        INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) 
        VALUES (?, ?, ?, ?, ?, ?)
    ');
    $logStmt->execute([
        $payload['sub'],
        'update_household',
        'households',
        $id,
        "Updated household record: $householdNo",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Household record updated successfully'
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update household: ' . $e->getMessage()
    ]);
}
