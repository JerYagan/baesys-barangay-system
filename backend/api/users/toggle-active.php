<?php
/**
 * Baesys — Toggle User Active Status API (Admin only)
 * 
 * PATCH /api/users/toggle-active.php
 * Body JSON: { "id": 123, "status": "active" | "inactive" }
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PATCH' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$payload = authenticate('admin');

$input = json_decode(file_get_contents('php://input'), true);
$userId = isset($input['id']) ? (int)$input['id'] : 0;
$status = isset($input['status']) ? trim($input['status']) : '';

if ($userId <= 0 || !in_array($status, ['active', 'inactive'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Valid user ID and status (active/inactive) are required.']);
    exit;
}

try {
    $pdo = getDBConnection();

    // Check user
    $stmt = $pdo->prepare('SELECT id, first_name, last_name, email, status FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found.']);
        exit;
    }

    // Prevent deactivating oneself
    if ($userId === (int)$payload['sub']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'You cannot deactivate your own account.']);
        exit;
    }

    $pdo->beginTransaction();

    // Update status
    $updateStmt = $pdo->prepare("UPDATE users SET status = ? WHERE id = ?");
    $updateStmt->execute([$status, $userId]);

    // Log activity
    $logStmt = $pdo->prepare(
        'INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $logStmt->execute([
        $payload['sub'],
        'toggle_user_status',
        'users',
        $userId,
        "Changed status of {$user['first_name']} {$user['last_name']} ({$user['email']}) from {$user['status']} to {$status}",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => "User account status updated to {$status}."
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to update user status: ' . $e->getMessage()]);
}
?>
