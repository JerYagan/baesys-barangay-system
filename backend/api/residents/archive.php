<?php
/**
 * Baesys — Archive Resident API
 * 
 * PATCH /api/residents/archive.php
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Only allow PATCH
if ($_SERVER['REQUEST_METHOD'] !== 'PATCH') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Authenticate staff/admin
$payload = authenticate('staff');

// Parse JSON body
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['id']) || !isset($input['is_archived'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Resident ID and is_archived status are required']);
    exit;
}

$id = (int)$input['id'];
$isArchived = (int)$input['is_archived'] ? 1 : 0;

try {
    $pdo = getDBConnection();

    // Check if resident exists
    $checkStmt = $pdo->prepare('SELECT id, first_name, last_name, household_id FROM residents WHERE id = ?');
    $checkStmt->execute([$id]);
    $resident = $checkStmt->fetch();

    if (!$resident) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Resident not found']);
        exit;
    }

    $pdo->beginTransaction();

    // Update archive status
    $stmt = $pdo->prepare('UPDATE residents SET is_archived = ? WHERE id = ?');
    $stmt->execute([$isArchived, $id]);

    // If archiving a resident, handle household head and membership
    if ($isArchived === 1) {
        // 1. If they were the head of household, remove them as head
        $clearHead = $pdo->prepare('UPDATE households SET head_resident_id = NULL WHERE head_resident_id = ?');
        $clearHead->execute([$id]);

        // 2. Disassociate from household entirely to prevent orphan records in active list
        $clearHh = $pdo->prepare('UPDATE residents SET household_id = NULL WHERE id = ?');
        $clearHh->execute([$id]);
    }

    // Log action
    $logStmt = $pdo->prepare('
        INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) 
        VALUES (?, ?, ?, ?, ?, ?)
    ');
    $actionText = $isArchived ? 'archived' : 'restored';
    $fullName = $resident['first_name'] . ' ' . $resident['last_name'];
    $logStmt->execute([
        $payload['sub'],
        $isArchived ? 'archive_resident' : 'restore_resident',
        'residents',
        $id,
        "Resident record $actionText: $fullName",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => "Resident record successfully $actionText"
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to toggle archive status: ' . $e->getMessage()
    ]);
}
