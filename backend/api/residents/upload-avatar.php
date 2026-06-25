<?php
/**
 * Baesys — Resident Profile Picture Upload API
 * 
 * POST /api/residents/upload-avatar.php
 * Multipart Form Data:
 *   avatar (file upload)
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';

// Allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

if (empty($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No image file uploaded or upload error occurred.']);
    exit;
}

try {
    $file = $_FILES['avatar'];
    $tmpName = $file['tmp_name'];
    $name = basename($file['name']);

    // Enforce max 5MB size limit
    if ($file['size'] > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Avatar image size exceeds the limit of 5MB.']);
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
    $uniqueName = 'avatar_' . uniqid() . '.' . $ext;

    $uploadDir = __DIR__ . '/../../uploads/avatars/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $destPath = $uploadDir . $uniqueName;
    if (move_uploaded_file($tmpName, $destPath)) {
        echo json_encode([
            'success' => true,
            'message' => 'Avatar uploaded successfully.',
            'profile_path' => '/uploads/avatars/' . $uniqueName
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to save uploaded photo file.']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to upload photo: ' . $e->getMessage()]);
}
?>
