<?php
/**
 * Baesys — Update Resident API
 * 
 * PUT /api/residents/update.php
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Only allow PUT or POST (for simplicity, we handle PUT via client)
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Authenticate staff/admin
$payload = authenticate('staff');

// Parse JSON body
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Resident ID is required']);
    exit;
}

$id = (int)$input['id'];

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

    // Check if resident exists
    $checkStmt = $pdo->prepare('SELECT id, first_name, last_name, household_id, user_id FROM residents WHERE id = ?');
    $checkStmt->execute([$id]);
    $existing = $checkStmt->fetch();

    if (!$existing) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Resident not found']);
        exit;
    }

    $email = isset($input['email']) ? trim($input['email']) : '';
    $password = isset($input['password']) ? $input['password'] : '';
    $userId = $existing['user_id'];

    if ($email !== '') {
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid email format']);
            exit;
        }

        // Check duplicates
        if ($userId === null) {
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
        } else {
            $emailCheck = $pdo->prepare('SELECT COUNT(*) as count FROM users WHERE email = ? AND id != ?');
            $emailCheck->execute([$email, $userId]);
            if ((int)$emailCheck->fetch()['count'] > 0) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Email address is already in use']);
                exit;
            }
            if ($password !== '' && strlen($password) < 6) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters long']);
                exit;
            }
        }
    }

    $householdId = !empty($input['household_id']) ? (int)$input['household_id'] : null;

    // Begin Transaction to handle Household Head update check
    $pdo->beginTransaction();

    // If resident has no linked account, but email/password are provided now
    if ($userId === null && $email !== '') {
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
    // If resident already has a linked account, update it
    else if ($userId !== null && $email !== '') {
        if ($password !== '') {
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            $userStmt = $pdo->prepare('
                UPDATE users 
                SET email = ?, password_hash = ?, first_name = ?, last_name = ? 
                WHERE id = ?
            ');
            $userStmt->execute([
                $email,
                $passwordHash,
                trim($input['first_name']),
                trim($input['last_name']),
                $userId
            ]);
        } else {
            $userStmt = $pdo->prepare('
                UPDATE users 
                SET email = ?, first_name = ?, last_name = ? 
                WHERE id = ?
            ');
            $userStmt->execute([
                $email,
                trim($input['first_name']),
                trim($input['last_name']),
                $userId
            ]);
        }
    }

    // If resident was household head but is now unlinked or moved to another household,
    // clear the head resident id in their old household.
    if ($existing['household_id'] !== null && $existing['household_id'] !== $householdId) {
        $clearHeadStmt = $pdo->prepare('
            UPDATE households 
            SET head_resident_id = NULL 
            WHERE id = ? AND head_resident_id = ?
        ');
        $clearHeadStmt->execute([$existing['household_id'], $id]);
    }

    // Update resident details
    $stmt = $pdo->prepare('
        UPDATE residents 
        SET user_id = ?, first_name = ?, last_name = ?, middle_name = ?, birthdate = ?, sex = ?, 
            civil_status = ?, contact_no = ?, purok = ?, address = ?, household_id = ?, profile_path = ?
        WHERE id = ?
    ');

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
        !empty($input['profile_path']) ? trim($input['profile_path']) : null,
        $id
    ]);

    // Log action
    $logStmt = $pdo->prepare('
        INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) 
        VALUES (?, ?, ?, ?, ?, ?)
    ');
    $fullName = trim($input['first_name']) . ' ' . trim($input['last_name']);
    $logStmt->execute([
        $payload['sub'],
        'update_resident',
        'residents',
        $id,
        "Updated resident record: $fullName",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Resident record updated successfully'
    ]);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to update resident: ' . $e->getMessage()
    ]);
}
