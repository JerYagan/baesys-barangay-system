<?php
/**
 * Baesys — Fetch Digital ID Details API
 * 
 * GET /api/digital-id/get-id-details.php
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
    $payload = authenticate();
    $pdo = getDBConnection();

    $resident_id = null;

    if (in_array($payload['role'], ['admin', 'staff'])) {
        $resident_id = isset($_GET['resident_id']) ? (int)$_GET['resident_id'] : null;
    } else {
        // Resident requests their own ID
        $resStmt = $pdo->prepare('SELECT id FROM residents WHERE user_id = ? AND is_archived = 0');
        $resStmt->execute([$payload['sub']]);
        $resident = $resStmt->fetch();
        if ($resident) {
            $resident_id = (int)$resident['id'];
        }
    }

    if (empty($resident_id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Resident ID could not be identified.']);
        exit;
    }

    // Fetch resident profile
    $stmt = $pdo->prepare('SELECT * FROM residents WHERE id = ? AND is_archived = 0');
    $stmt->execute([$resident_id]);
    $resDetails = $stmt->fetch();

    if (!$resDetails) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Resident profile not found.']);
        exit;
    }

    if (empty($resDetails['barangay_id_no'])) {
        echo json_encode([
            'success' => false,
            'is_issued' => false,
            'digital_id_status' => $resDetails['digital_id_status'] ?? 'not_requested',
            'message' => 'Digital ID has not been generated for this resident yet.'
        ]);
        exit;
    }

    // Check expiration
    $is_expired = false;
    if ($resDetails['digital_id_expires_at'] && strtotime($resDetails['digital_id_expires_at']) < time()) {
        $is_expired = true;
    }

    // QR Verification URL
    // Point verification to checkpoint API scan path
    $verificationUrl = 'http://baesys.local/verify-id?hash=' . $resDetails['digital_id_secure_hash'];
    $qrUrl = 'https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=' . urlencode($verificationUrl);

    echo json_encode([
        'success' => true,
        'is_issued' => true,
        'is_expired' => $is_expired,
        'id_details' => [
            'id' => $resDetails['id'],
            'barangay_id_no' => $resDetails['barangay_id_no'],
            'first_name' => $resDetails['first_name'],
            'last_name' => $resDetails['last_name'],
            'middle_name' => $resDetails['middle_name'],
            'birthdate' => $resDetails['birthdate'],
            'sex' => $resDetails['sex'],
            'civil_status' => $resDetails['civil_status'],
            'contact_no' => $resDetails['contact_no'],
            'purok' => $resDetails['purok'],
            'address' => $resDetails['address'],
            'profile_path' => $resDetails['profile_path'],
            'digital_id_issued_at' => $resDetails['digital_id_issued_at'],
            'digital_id_expires_at' => $resDetails['digital_id_expires_at'],
            'digital_id_secure_hash' => $resDetails['digital_id_secure_hash'],
            'digital_id_status' => $resDetails['digital_id_status'] ?? 'issued',
            'qr_code_url' => $qrUrl,
            'verification_url' => $verificationUrl
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error: ' . $e->getMessage()]);
}
?>
