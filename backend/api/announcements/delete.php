<?php
/**
 * Baesys — Delete Announcement API (Admin/Staff only)
 * 
 * DELETE /api/announcements/delete.php?id=...
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Only allow DELETE
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Authenticate user (staff/admin only)
$payload = authenticate('staff');

if (empty($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Announcement ID is required']);
    exit;
}

$id = (int)$_GET['id'];

try {
    $pdo = getDBConnection();

    // Fetch details for logging
    $stmt = $pdo->prepare('SELECT title FROM announcements WHERE id = ?');
    $stmt->execute([$id]);
    $title = $stmt->fetchColumn();

    if (!$title) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Announcement not found.']);
        exit;
    }

    $deleteStmt = $pdo->prepare('DELETE FROM announcements WHERE id = ?');
    $deleteStmt->execute([$id]);

    // Log activity
    $logStmt = $pdo->prepare(
        'INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $logStmt->execute([
        $payload['sub'],
        'delete_announcement',
        'announcements',
        $id,
        "Deleted announcement '$title'",
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Announcement deleted successfully.'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to delete announcement: ' . $e->getMessage()]);
}
