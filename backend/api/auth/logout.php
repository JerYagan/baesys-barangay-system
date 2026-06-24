<?php
/**
 * Baesys — Logout API
 * 
 * POST /api/auth/logout
 * 
 * Since JWT is stateless, logout is primarily handled client-side
 * by removing the token. This endpoint confirms the action and
 * logs it for audit purposes.
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

try {
    // Try to authenticate to log the action, but don't fail if token is invalid
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!empty($authHeader) && str_starts_with($authHeader, 'Bearer ')) {
        $token = substr($authHeader, 7);
        $payload = verifyJWT($token);

        if ($payload) {
            $pdo = getDBConnection();
            $logStmt = $pdo->prepare(
                'INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
            );
            $logStmt->execute([
                $payload['sub'],
                'logout',
                'users',
                $payload['sub'],
                'User logged out',
                $_SERVER['REMOTE_ADDR'] ?? null
            ]);
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);

} catch (Exception $e) {
    // Even if logging fails, confirm logout
    echo json_encode([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);
}
