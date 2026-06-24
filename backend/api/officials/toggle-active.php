<?php
/**
 * Baesys — Toggle Official Active Status API (Admin/Staff only)
 * 
 * PATCH /api/officials/toggle-active.php
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

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['id']) || !isset($input['is_active'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID and active status are required.']);
    exit;
}

$id = (int)$input['id'];
$isActive = (int)$input['is_active'];

try {
    $pdo = getDBConnection();

    $stmt = $pdo->prepare('UPDATE officials SET is_active = ?, updated_at = NOW() WHERE id = ?');
    $stmt->execute([$isActive, $id]);

    // Log activity
    $logStmt = $pdo->prepare(
        'INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $logStmt->execute([
        $payload['sub'],
        'toggle_official_active',
        'officials',
        $id,
        "Changed official #$id active status to '$isActive'",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Official status updated successfully.'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to update status: ' . $e->getMessage()]);
}
