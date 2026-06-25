<?php
/**
 * Baesys — Update My Profile Picture API
 * 
 * POST /api/residents/update-my-avatar.php
 * Body: { "profile_path": "..." }
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

$payload = authenticate(); // Authenticate any logged-in user

// Parse JSON body
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['profile_path'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Profile path is required']);
    exit;
}

try {
    $pdo = getDBConnection();
    
    // Update profile_path in residents table where user_id matches
    $stmt = $pdo->prepare('UPDATE residents SET profile_path = ? WHERE user_id = ?');
    $stmt->execute([
        trim($input['profile_path']),
        $payload['sub']
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Profile picture updated successfully.'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to update profile picture: ' . $e->getMessage()]);
}
?>
