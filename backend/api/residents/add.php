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

    $email = isset($input['email']) ? trim($input['email']) : '';
    $password = isset($input['password']) ? $input['password'] : '';
    $userId = null;

    if ($email !== '') {
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid email format']);
            exit;
        }

        // Check if email is already taken
        $emailCheck = $pdo->prepare('SELECT COUNT(*) as count FROM users WHERE email = ?');
        $emailCheck->execute([$email]);
        if ((int)$emailCheck->fetch()['count'] > 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email address is already in use']);
            exit;
        }

        if (strlen($password) < 6) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters long']);
            exit;
        }
    }

    $pdo->beginTransaction();

    // If credentials are provided, create the user account first
    if ($email !== '') {
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $userStmt = $pdo->prepare('
            INSERT INTO users (email, password_hash, first_name, last_name, role, status) 
            VALUES (?, ?, ?, ?, \'resident\', \'active\')
        ');
        $userStmt->execute([
            $email,
            $passwordHash,
            trim($input['first_name']),
            trim($input['last_name'])
        ]);
        $userId = $pdo->lastInsertId();
    }

    // Insert resident record
    $stmt = $pdo->prepare('
        INSERT INTO residents (user_id, first_name, last_name, middle_name, birthdate, sex, civil_status, contact_no, purok, address, household_id, profile_path) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    
    $householdId = !empty($input['household_id']) ? (int)$input['household_id'] : null;

    $stmt->execute([
        $userId,
        trim($input['first_name']),
        trim($input['last_name']),
        trim($input['middle_name'] ?? ''),
        $input['birthdate'],
        $input['sex'],
        $civilStatus,
        trim($input['contact_no'] ?? ''),
        trim($input['purok']),
        trim($input['address']),
        $householdId,
        !empty($input['profile_path']) ? trim($input['profile_path']) : null
    ]);

    $residentId = $pdo->lastInsertId();

    // Log action
    $logStmt = $pdo->prepare('
        INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) 
        VALUES (?, ?, ?, ?, ?, ?)
    ');
    $fullName = trim($input['first_name']) . ' ' . trim($input['last_name']);
    $logDetails = "Created new resident record: $fullName";
    if ($userId !== null) {
        $logDetails .= " with login account ($email)";
    }
    $logStmt->execute([
        $payload['sub'],
        'create_resident',
        'residents',
        $residentId,
        $logDetails,
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Resident record created successfully',
        'resident_id' => $residentId
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to create resident: ' . $e->getMessage()
    ]);
}
