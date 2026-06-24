<?php
/**
 * Baesys — Update Blotter Case Status and Timeline API (Admin/Staff only)
 * 
 * PATCH /api/blotter/update.php
 * 
 * Request body (JSON):
 *   {
 *     "id": 1,
 *     "status": "under_mediation",
 *     "note": "Scheduled hearing for next Tuesday"
 *   }
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Only allow PATCH or POST
if ($_SERVER['REQUEST_METHOD'] !== 'PATCH' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Authenticate user (staff/admin only)
$payload = authenticate('staff');

// Parse JSON body
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['id']) || empty($input['status'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID and status are required.']);
    exit;
}

$id = (int)$input['id'];
$status = trim($input['status']);
$note = !empty($input['note']) ? trim($input['note']) : '';

if (!in_array($status, ['open', 'under_mediation', 'resolved', 'referred'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid status value.']);
    exit;
}

try {
    $pdo = getDBConnection();

    // Fetch existing record
    $stmt = $pdo->prepare('SELECT status, case_notes FROM blotter_records WHERE id = ?');
    $stmt->execute([$id]);
    $record = $stmt->fetch();

    if (!$record) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Blotter case not found.']);
        exit;
    }

    // Decode existing case notes timeline or default to empty array
    $timeline = [];
    if (!empty($record['case_notes'])) {
        $decoded = json_decode($record['case_notes'], true);
        if (is_array($decoded)) {
            $timeline = $decoded;
        }
    }

    // Append new history node
    $editorName = $payload['first_name'] . ' ' . $payload['last_name'];
    $event = [
        'date' => date('Y-m-d H:i:s'),
        'by' => $editorName,
        'status' => $status,
        'note' => $note
    ];
    $timeline[] = $event;

    // Update DB
    $updateStmt = $pdo->prepare('UPDATE blotter_records SET status = ?, case_notes = ?, updated_at = NOW() WHERE id = ?');
    $updateStmt->execute([
        $status,
        json_encode($timeline),
        $id
    ]);

    // Log activity
    $logStmt = $pdo->prepare(
        'INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $logStmt->execute([
        $payload['sub'],
        'update_blotter',
        'blotter_records',
        $id,
        "Updated blotter #$id status to '$status'",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Blotter case updated successfully.',
        'timeline' => $timeline
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to update blotter case: ' . $e->getMessage()]);
}
