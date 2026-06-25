<?php
/**
 * Baesys — Generate Digital ID API (Staff/Admin only)
 * 
 * POST /api/digital-id/generate.php
 * Params (JSON/POST):
 *   resident_id
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

try {
    // Authenticate staff/admin
    $payload = authenticate('staff');

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $resident_id = isset($input['resident_id']) ? (int)$input['resident_id'] : null;

    if (empty($resident_id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Resident ID is required.']);
        exit;
    }

    $pdo = getDBConnection();

    // Fetch resident details
    $resStmt = $pdo->prepare('SELECT * FROM residents WHERE id = ? AND is_archived = 0');
    $resStmt->execute([$resident_id]);
    $resident = $resStmt->fetch();

    if (!$resident) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Resident profile not found or is archived.']);
        exit;
    }

    // Generate unique ID number: BAESA-YYYY-XXXX (e.g. BAESA-2026-0003)
    $year = date('Y');
    $barangay_id_no = 'BAESA-' . $year . '-' . sprintf('%04d', $resident_id);

    // Compute secure validation SHA-256 hash using resident details + server salt
    $salt = 'BaesysBarangayBaesaSecureID2026';
    $hashSource = $barangay_id_no . '|' . $resident['first_name'] . '|' . $resident['last_name'] . '|' . $resident['birthdate'] . '|' . $salt;
    $digital_id_secure_hash = hash('sha256', $hashSource);

    $issued_at = date('Y-m-d');
    $expires_at = date('Y-m-d', strtotime('+1 year'));

    // Update resident profile
    $updateStmt = $pdo->prepare('
        UPDATE residents 
        SET barangay_id_no = ?, 
            digital_id_issued_at = ?, 
            digital_id_expires_at = ?, 
            digital_id_secure_hash = ?,
            digital_id_status = \'issued\'
        WHERE id = ?
    ');
    $updateStmt->execute([
        $barangay_id_no,
        $issued_at,
        $expires_at,
        $digital_id_secure_hash,
        $resident_id
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Digital ID issued successfully!',
        'barangay_id_no' => $barangay_id_no,
        'digital_id_issued_at' => $issued_at,
        'digital_id_expires_at' => $expires_at
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error: ' . $e->getMessage()]);
}
?>
