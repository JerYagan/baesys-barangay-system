<?php
/**
 * Baesys — Create Blotter Entry API
 * 
 * POST /api/blotter/create.php
 * 
 * Request body (JSON):
 *   {
 *     "complainant_id": 123 (optional for resident, required for staff),
 *     "respondent_name": "...",
 *     "incident_type": "...",
 *     "incident_date": "YYYY-MM-DD HH:MM:SS",
 *     "incident_location": "...",
 *     "description": "...",
 *     "witness_names": "..." (optional)
 *   }
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

// Authenticate user
$payload = authenticate();

// Parse JSON body
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['respondent_name']) || empty($input['incident_type']) || 
    empty($input['incident_date']) || empty($input['incident_location']) || empty($input['description'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All required fields must be filled.']);
    exit;
}

try {
    $pdo = getDBConnection();
    
    $complainantId = null;

    if ($payload['role'] === 'resident') {
        // If resident, automatically fetch their resident profile ID
        $resStmt = $pdo->prepare('SELECT id FROM residents WHERE user_id = ? AND is_archived = 0');
        $resStmt->execute([$payload['sub']]);
        $resident = $resStmt->fetch();

        if (!$resident) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Resident profile not found. Please contact the barangay hall.']);
            exit;
        }
        $complainantId = $resident['id'];
    } else {
        // If admin/staff, complainant_id is required
        if (empty($input['complainant_id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Complainant resident selection is required.']);
            exit;
        }
        $complainantId = (int)$input['complainant_id'];
    }

    // Verify complainant resident exists
    $compCheck = $pdo->prepare('SELECT id FROM residents WHERE id = ?');
    $compCheck->execute([$complainantId]);
    if (!$compCheck->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Complainant resident record not found.']);
        exit;
    }

    // Insert blotter record
    $stmt = $pdo->prepare('
        INSERT INTO blotter_records 
        (complainant_id, respondent_name, incident_type, incident_date, incident_location, description, witness_names, status, case_notes, filed_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    
    // Initialize case_notes as empty JSON array
    $emptyNotes = json_encode([]);
    
    $stmt->execute([
        $complainantId,
        trim($input['respondent_name']),
        trim($input['incident_type']),
        $input['incident_date'],
        trim($input['incident_location']),
        trim($input['description']),
        !empty($input['witness_names']) ? trim($input['witness_names']) : null,
        'open',
        $emptyNotes,
        $payload['sub']
    ]);

    $blotterId = $pdo->lastInsertId();

    // Log activity
    $logStmt = $pdo->prepare(
        'INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $logStmt->execute([
        $payload['sub'],
        'create_blotter',
        'blotter_records',
        $blotterId,
        'Filed new blotter case #' . $blotterId,
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Blotter complaint successfully filed.',
        'id' => $blotterId
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to create blotter record: ' . $e->getMessage()]);
}
