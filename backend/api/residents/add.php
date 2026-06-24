<?php
/**
 * Baesys — Add Resident API
 * 
 * POST /api/residents/add.php
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

// Authenticate staff/admin
$payload = authenticate('staff');

// Parse JSON body
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
    exit;
}

// Validate required fields
$required = ['first_name', 'last_name', 'birthdate', 'sex', 'purok', 'address'];
$missing = [];
foreach ($required as $field) {
    if (empty($input[$field])) {
        $missing[] = $field;
    }
}

if (!empty($missing)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields: ' . implode(', ', $missing)
    ]);
    exit;
}

// Validate sex
if (!in_array($input['sex'], ['Male', 'Female'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Sex must be Male or Female']);
    exit;
}

// Validate civil_status
$civilStatus = $input['civil_status'] ?? 'Single';
if (!in_array($civilStatus, ['Single', 'Married', 'Widowed', 'Separated', 'Divorced'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid civil status value']);
    exit;
}

try {
    $pdo = getDBConnection();

    // Insert resident record
    $stmt = $pdo->prepare('
        INSERT INTO residents (first_name, last_name, middle_name, birthdate, sex, civil_status, contact_no, purok, address, household_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    
    $householdId = !empty($input['household_id']) ? (int)$input['household_id'] : null;

    $stmt->execute([
        trim($input['first_name']),
        trim($input['last_name']),
        trim($input['middle_name'] ?? ''),
        $input['birthdate'],
        $input['sex'],
        $civilStatus,
        trim($input['contact_no'] ?? ''),
        trim($input['purok']),
        trim($input['address']),
        $householdId
    ]);

    $residentId = $pdo->lastInsertId();

    // Log action
    $logStmt = $pdo->prepare('
        INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) 
        VALUES (?, ?, ?, ?, ?, ?)
    ');
    $fullName = trim($input['first_name']) . ' ' . trim($input['last_name']);
    $logStmt->execute([
        $payload['sub'],
        'create_resident',
        'residents',
        $residentId,
        "Created new resident record: $fullName",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Resident record created successfully',
        'resident_id' => $residentId
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to create resident: ' . $e->getMessage()
    ]);
}
