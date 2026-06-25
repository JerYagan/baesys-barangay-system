<?php
/**
 * Baesys — Update Official Details API (Admin/Staff only)
 * 
 * POST /api/officials/update.php
 * Multipart Form Data:
 *   id, first_name, last_name, position, term_start, term_end, contact_no (optional), photo (file upload, optional)
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

if (empty($_POST['id']) || empty($_POST['first_name']) || empty($_POST['last_name']) || 
    empty($_POST['position']) || empty($_POST['term_start']) || empty($_POST['term_end'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'All required fields must be filled.']);
    exit;
}

$id = (int)$_POST['id'];

try {
    $pdo = getDBConnection();

    // Fetch existing official details
    $stmt = $pdo->prepare('SELECT * FROM officials WHERE id = ?');
    $stmt->execute([$id]);
    $official = $stmt->fetch();

    if (!$official) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Official not found.']);
        exit;
    }

    $photoPath = $official['photo_path'];

    if (!empty($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['photo'];
        $tmpName = $file['tmp_name'];
        $name = basename($file['name']);

        // Enforce max 5MB size limit
        if ($file['size'] > 5 * 1024 * 1024) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Photo size exceeds the limit of 5MB.']);
            exit;
        }
        
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
            // Delete old photo if exists
            if ($official['photo_path']) {
                $oldFile = __DIR__ . '/../..' . $official['photo_path'];
                if (file_exists($oldFile)) {
                    unlink($oldFile);
                }
            }
            $photoPath = '/uploads/officials/' . $uniqueName;
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to save uploaded photo file.']);
            exit;
        }
    }

    // Update query
    $updateStmt = $pdo->prepare('
        UPDATE officials 
        SET first_name = ?, last_name = ?, position = ?, term_start = ?, term_end = ?, contact_no = ?, photo_path = ?, updated_at = NOW() 
        WHERE id = ?
    ');
    
    $updateStmt->execute([
        trim($_POST['first_name']),
        trim($_POST['last_name']),
        trim($_POST['position']),
        $_POST['term_start'],
        $_POST['term_end'],
        !empty($_POST['contact_no']) ? trim($_POST['contact_no']) : null,
        $photoPath,
        $id
    ]);

    // Log activity
    $logStmt = $pdo->prepare(
        'INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $logStmt->execute([
        $payload['sub'],
        'update_official',
        'officials',
        $id,
        "Updated HON. " . trim($_POST['first_name']) . " " . trim($_POST['last_name']) . " record details",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Official details updated successfully.'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to update official details: ' . $e->getMessage()]);
}
