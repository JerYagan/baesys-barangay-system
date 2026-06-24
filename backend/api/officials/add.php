<?php
/**
 * Baesys — Add Official API (Admin/Staff only)
 * 
 * POST /api/officials/add.php
 * Multipart Form Data:
 *   first_name, last_name, position, term_start, term_end, contact_no (optional), photo (file upload, optional)
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

// Authenticate user (staff/admin only)
$payload = authenticate('staff');

if (empty($_POST['first_name']) || empty($_POST['last_name']) || empty($_POST['position']) || 
    empty($_POST['term_start']) || empty($_POST['term_end'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All required fields must be filled.']);
    exit;
}

try {
    $pdo = getDBConnection();
    
    $photoPath = null;

    // Handle photo file upload
    if (!empty($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['photo'];
        $tmpName = $file['tmp_name'];
        $name = basename($file['name']);
        
        // Validate MIME type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $tmpName);
        finfo_close($finfo);

        if (!in_array($mimeType, $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid photo type. Only JPG, PNG, and WEBP images are allowed.']);
            exit;
        }

        // Get extension
        $ext = pathinfo($name, PATHINFO_EXTENSION);
        $uniqueName = 'official_' . uniqid() . '.' . $ext;

        $uploadDir = __DIR__ . '/../../uploads/officials/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $destPath = $uploadDir . $uniqueName;
        if (move_uploaded_file($tmpName, $destPath)) {
            $photoPath = '/uploads/officials/' . $uniqueName;
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to save uploaded photo file.']);
            exit;
        }
    }

    $stmt = $pdo->prepare('
        INSERT INTO officials (first_name, last_name, position, term_start, term_end, contact_no, photo_path, is_active) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    ');
    $stmt->execute([
        trim($_POST['first_name']),
        trim($_POST['last_name']),
        trim($_POST['position']),
        $_POST['term_start'],
        $_POST['term_end'],
        !empty($_POST['contact_no']) ? trim($_POST['contact_no']) : null,
        $photoPath
    ]);

    $id = $pdo->lastInsertId();

    // Log activity
    $logStmt = $pdo->prepare(
        'INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $logStmt->execute([
        $payload['sub'],
        'add_official',
        'officials',
        $id,
        "Registered official HON. " . trim($_POST['first_name']) . " " . trim($_POST['last_name']) . " as " . trim($_POST['position']),
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Official roster registered successfully.',
        'id' => $id
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to register official: ' . $e->getMessage()]);
}
