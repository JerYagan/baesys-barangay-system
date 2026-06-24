<?php
/**
 * Baesys — Get Announcement Details API
 * 
 * GET /api/announcements/get.php?id=...
 * Optional: ?all=1 (staff/admin only — allows fetching drafts)
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

if (empty($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Announcement ID is required']);
    exit;
}

$id = (int)$_GET['id'];

$showAll = false;
if (isset($_GET['all']) && (int)$_GET['all'] === 1) {
    require_once __DIR__ . '/../../middleware/auth.php';
    authenticate('staff');
    $showAll = true;
}

try {
    $pdo = getDBConnection();

    $sql = '
        SELECT a.*, CONCAT(u.first_name, " ", u.last_name) AS author_name 
        FROM announcements a
        LEFT JOIN users u ON a.posted_by = u.id
        WHERE a.id = ?
    ';
    if (!$showAll) {
        $sql .= ' AND a.is_published = 1';
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    $announcement = $stmt->fetch();

    if (!$announcement) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Announcement not found']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'announcement' => $announcement
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
}
