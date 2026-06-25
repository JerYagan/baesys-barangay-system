<?php
/**
 * Baesys — Scan Verify Digital ID API (Used at checkpoints)
 * 
 * GET /api/digital-id/scan-verify.php?hash=...
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

try {
    // Authenticate staff/admin to use scanner
    $payload = authenticate('staff');

    $hash = isset($_GET['hash']) ? trim($_GET['hash']) : '';

    if (empty($hash)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Verification hash is required.']);
        exit;
    }

    $pdo = getDBConnection();

    // Query resident by secure hash
    $stmt = $pdo->prepare('SELECT * FROM residents WHERE digital_id_secure_hash = ? AND is_archived = 0');
    $stmt->execute([$hash]);
    $resident = $stmt->fetch();

    if (!$resident) {
        echo json_encode([
            'success' => true,
            'verified' => false,
            'message' => 'INVALID ID CARD. This security signature is not registered in the system.'
        ]);
        exit;
    }

    // Check expiration
    $is_expired = false;
    if ($resident['digital_id_expires_at'] && strtotime($resident['digital_id_expires_at']) < time()) {
        $is_expired = true;
    }

    if ($is_expired) {
        echo json_encode([
            'success' => true,
            'verified' => false,
            'message' => 'EXPIRED ID CARD. This card expired on ' . date('F d, Y', strtotime($resident['digital_id_expires_at'])) . '.'
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'verified' => true,
        'message' => 'ID VERIFIED SUCCESSFULLY!',
        'resident' => [
            'id' => $resident['id'],
            'barangay_id_no' => $resident['barangay_id_no'],
            'first_name' => $resident['first_name'],
            'last_name' => $resident['last_name'],
            'middle_name' => $resident['middle_name'],
            'sex' => $resident['sex'],
            'civil_status' => $resident['civil_status'],
            'purok' => $resident['purok'],
            'address' => $resident['address'],
            'contact_no' => $resident['contact_no'],
            'profile_path' => $resident['profile_path'],
            'digital_id_issued_at' => $resident['digital_id_issued_at'],
            'digital_id_expires_at' => $resident['digital_id_expires_at']
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error: ' . $e->getMessage()]);
}
?>
