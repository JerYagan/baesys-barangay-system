<?php
/**
 * Baesys — Approve User API (Admin only)
 * 
 * PATCH /api/users/approve.php
 * Body JSON: { "id": 123 }
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

if ($userId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Valid user ID is required.']);
    exit;
}

try {
    $pdo = getDBConnection();

    // Check if user exists and is pending
    $stmt = $pdo->prepare('SELECT id, first_name, last_name, email, status FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found.']);
        exit;
    }

    if ($user['status'] !== 'pending') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'User is not in pending status.']);
        exit;
    }

    $pdo->beginTransaction();

    // Update user status
    $updateStmt = $pdo->prepare("UPDATE users SET status = 'active' WHERE id = ?");
    $updateStmt->execute([$userId]);

    // Log activity
    $logStmt = $pdo->prepare(
        'INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $logStmt->execute([
        $payload['sub'],
        'approve_user',
        'users',
        $userId,
        "Approved user registration: {$user['first_name']} {$user['last_name']} ({$user['email']})",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'User account approved and activated successfully.'
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to approve user: ' . $e->getMessage()]);
}
