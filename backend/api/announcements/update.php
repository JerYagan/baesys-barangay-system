<?php
/**
 * Baesys — Update Announcement API (Admin/Staff only)
 * 
 * PUT /api/announcements/update.php
 * POST /api/announcements/update.php
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Allow POST or PUT
if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Authenticate user (staff/admin only)
$payload = authenticate('staff');

// Parse JSON body
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['id']) || empty($input['title']) || empty($input['body']) || empty($input['category'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID, title, body, and category are required fields.']);
    exit;
}

$id = (int)$input['id'];
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

    // Verify it exists
    $checkStmt = $pdo->prepare('SELECT id FROM announcements WHERE id = ?');
    $checkStmt->execute([$id]);
    if (!$checkStmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Announcement not found.']);
        exit;
    }

    $stmt = $pdo->prepare('
        UPDATE announcements 
        SET title = ?, body = ?, category = ?, is_published = ?, updated_at = NOW() 
        WHERE id = ?
    ');
    $stmt->execute([
        $title,
        $body,
        $category,
        $isPublished,
        $id
    ]);

    // Log activity
    $logStmt = $pdo->prepare(
        'INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $logStmt->execute([
        $payload['sub'],
        'update_announcement',
        'announcements',
        $id,
        "Updated announcement details for '$title'",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Announcement updated successfully.'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to update announcement: ' . $e->getMessage()]);
}
