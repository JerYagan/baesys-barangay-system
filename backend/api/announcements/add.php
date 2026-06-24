<?php
/**
 * Baesys — Create Announcement API (Admin/Staff only)
 * 
 * POST /api/announcements/add.php
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

// Parse JSON body
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['title']) || empty($input['body']) || empty($input['category'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Title, body, and category are required fields.']);
    exit;
}

$title = trim($input['title']);
$body = trim($input['body']);
$category = trim($input['category']);
$isPublished = isset($input['is_published']) ? (int)$input['is_published'] : 0;

if (!in_array($category, ['event', 'advisory', 'notice'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid category value.']);
    exit;
}

try {
    $pdo = getDBConnection();

    $stmt = $pdo->prepare('
        INSERT INTO announcements (title, body, category, posted_by, is_published) 
        VALUES (?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $title,
        $body,
        $category,
        $payload['sub'],
        $isPublished
    ]);

    $id = $pdo->lastInsertId();

    // Log activity
    $logStmt = $pdo->prepare(
        'INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $logStmt->execute([
        $payload['sub'],
        'create_announcement',
        'announcements',
        $id,
        "Created announcement '$title' (Status: " . ($isPublished ? 'Published' : 'Draft') . ")",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Announcement created successfully.',
        'id' => $id
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to create announcement: ' . $e->getMessage()]);
}
