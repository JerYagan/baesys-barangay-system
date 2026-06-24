<?php
/**
 * Baesys — List Published Announcements API
 * 
 * GET /api/announcements/list.php
 * Optional params:
 *   limit=N (number of items)
 *   category=(event|advisory|notice)
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $pdo = getDBConnection();

    $showAll = false;
    if (isset($_GET['all']) && (int)$_GET['all'] === 1) {
        // Authenticate staff/admin
        require_once __DIR__ . '/../../middleware/auth.php';
        authenticate('staff');
        $showAll = true;
    }

    $sql = 'SELECT a.*, CONCAT(u.first_name, " ", u.last_name) AS author_name 
            FROM announcements a
            LEFT JOIN users u ON a.posted_by = u.id
            WHERE 1=1';
    if (!$showAll) {
        $sql .= ' AND a.is_published = 1';
    }
            
    $params = [];

    // Filter by category
    if (!empty($_GET['category'])) {
        $category = trim($_GET['category']);
        if (in_array($category, ['event', 'advisory', 'notice'])) {
            $sql .= ' AND a.category = ?';
            $params[] = $category;
        }
    }

    // Order by newest
    $sql .= ' ORDER BY a.created_at DESC';

    // Limit
    if (!empty($_GET['limit'])) {
        $limit = (int)$_GET['limit'];
        if ($limit > 0) {
            $sql .= ' LIMIT ' . $limit;
        }
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $announcements = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'announcements' => $announcements
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
}
