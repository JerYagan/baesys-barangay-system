<?php
/**
 * Baesys — Login API
 * 
 * POST /api/auth/login
 * 
 * Request body (JSON):
 *   { "email": "...", "password": "..." }
 * 
 * Response:
 *   { "success": true, "token": "...", "user": { ... } }
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

// Parse JSON body
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['email']) || empty($input['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email and password are required']);
    exit;
}

$email = trim($input['email']);
$password = $input['password'];

try {
    $pdo = getDBConnection();

    // Find user by email
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit;
    }

    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
        exit;
    }

    // Check account status
    if ($user['status'] === 'pending') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Your account is pending approval. Please wait for an administrator to activate your account.'
        ]);
        exit;
    }

    if ($user['status'] === 'inactive') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Your account has been deactivated. Please contact the barangay office.'
        ]);
        exit;
    }

    // Generate JWT
    $token = generateJWT($user);

    // Log the login activity
    $logStmt = $pdo->prepare(
        'INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $logStmt->execute([
        $user['id'],
        'login',
        'users',
        $user['id'],
        'User logged in',
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    // Return success with token and user info (excluding password hash)
    unset($user['password_hash']);

    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'token' => $token,
        'user' => $user
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
}
