<?php
/**
 * Baesys — Register API
 * 
 * POST /api/auth/register
 * 
 * Request body (JSON):
 *   {
 *     "email": "...",
 *     "password": "...",
 *     "first_name": "...",
 *     "last_name": "...",
 *     "contact_no": "...",       // optional
 *     "purok": "...",
 *     "address": "...",
 *     "birthdate": "YYYY-MM-DD",
 *     "sex": "Male|Female",
 *     "civil_status": "Single|Married|Widowed|Separated|Divorced"
 *   }
 * 
 * Creates both a user account (status: pending) and a resident record.
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Parse JSON body
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required = ['email', 'password', 'first_name', 'last_name', 'purok', 'address', 'birthdate', 'sex'];
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

// Validate email format
if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address format']);
    exit;
}

// Validate password length
if (strlen($input['password']) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
    exit;
}

// Validate sex
if (!in_array($input['sex'], ['Male', 'Female'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Sex must be Male or Female']);
    exit;
}

try {
    $pdo = getDBConnection();

    // Check if email already exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([trim($input['email'])]);
    
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'An account with this email already exists']);
        exit;
    }

    // Begin transaction — create user + resident in one atomic operation
    $pdo->beginTransaction();

    // Create user account
    $passwordHash = password_hash($input['password'], PASSWORD_DEFAULT);
    
    $userStmt = $pdo->prepare(
        'INSERT INTO users (email, password_hash, first_name, last_name, role, status) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $userStmt->execute([
        trim($input['email']),
        $passwordHash,
        trim($input['first_name']),
        trim($input['last_name']),
        'resident',
        'pending'
    ]);
    $userId = $pdo->lastInsertId();

    // Create resident record
    $residentStmt = $pdo->prepare(
        'INSERT INTO residents (user_id, first_name, last_name, middle_name, birthdate, sex, civil_status, contact_no, purok, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $residentStmt->execute([
        $userId,
        trim($input['first_name']),
        trim($input['last_name']),
        trim($input['middle_name'] ?? ''),
        $input['birthdate'],
        $input['sex'],
        $input['civil_status'] ?? 'Single',
        trim($input['contact_no'] ?? ''),
        trim($input['purok']),
        trim($input['address'])
    ]);

    // Log the registration
    $logStmt = $pdo->prepare(
        'INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $logStmt->execute([
        $userId,
        'register',
        'users',
        $userId,
        'New resident registration (pending approval)',
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    $pdo->commit();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful! Your account is pending approval by the barangay staff. You will be able to log in once your account is activated.'
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()]);
}
