<?php
/**
 * Baesys — Change User Role API (Admin only)
 * 
 * PATCH /api/users/change-role.php
 * Body JSON: { "id": 123, "role": "staff" | "admin" | "resident" }
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
$role = isset($input['role']) ? trim($input['role']) : '';

if ($userId <= 0 || !in_array($role, ['admin', 'staff', 'resident'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Valid user ID and role (admin/staff/resident) are required.']);
    exit;
}

try {
    $pdo = getDBConnection();

    // Check user
    $stmt = $pdo->prepare('SELECT id, first_name, last_name, email, role FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found.']);
        exit;
    }

    // Prevent changing own role (or at least warning, let's block to prevent lockout)
    if ($userId === (int)$payload['sub']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'You cannot change your own role.']);
        exit;
    }

    $pdo->beginTransaction();

    // Update role
    $updateStmt = $pdo->prepare("UPDATE users SET role = ? WHERE id = ?");
    $updateStmt->execute([$role, $userId]);

    // Log activity
    $logStmt = $pdo->prepare(
        'INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $logStmt->execute([
        $payload['sub'],
        'change_role',
        'users',
        $userId,
        "Changed role of {$user['first_name']} {$user['last_name']} ({$user['email']}) from {$user['role']} to {$role}",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'User role updated successfully.'
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to update role: ' . $e->getMessage()]);
}
?>
