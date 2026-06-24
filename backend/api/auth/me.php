<?php
/**
 * Baesys — Get Current User API
 * 
 * GET /api/auth/me
 * 
 * Returns the current authenticated user's data from the database.
 * Requires a valid JWT in the Authorization header.
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Authenticate the request
$payload = authenticate();

try {
    $pdo = getDBConnection();

    // Get fresh user data from database
    $stmt = $pdo->prepare(
        'SELECT id, email, first_name, last_name, role, status, created_at, updated_at FROM users WHERE id = ?'
    );
    $stmt->execute([$payload['sub']]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }

    // If the user is a resident, also fetch their resident profile
    $resident = null;
    if ($user['role'] === 'resident') {
        $resStmt = $pdo->prepare(
            'SELECT id, first_name, last_name, middle_name, birthdate, sex, civil_status, contact_no, purok, address, household_id FROM residents WHERE user_id = ?'
        );
        $resStmt->execute([$user['id']]);
        $resident = $resStmt->fetch();
    }

    echo json_encode([
        'success' => true,
        'user' => $user,
        'resident' => $resident
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch user data: ' . $e->getMessage()]);
}
