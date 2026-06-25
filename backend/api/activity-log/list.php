<?php
/**
 * Baesys — List Activity Logs API (Admin only)
 * 
 * GET /api/activity-log/list.php
 * 
 * Params (GET):
 *   page: int (default 1)
 *   limit: int (default 15)
 *   search: string (searches operator name or details)
 *   action: string (filter by specific action type)
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$payload = authenticate('admin');

$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 15;
$offset = ($page - 1) * $limit;

$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$action = isset($_GET['action']) ? trim($_GET['action']) : '';

try {
    $pdo = getDBConnection();

    $conditions = [];
    $params = [];

    if ($search !== '') {
        $conditions[] = '(u.first_name LIKE ? OR u.last_name LIKE ? OR a.details LIKE ? OR a.action LIKE ?)';
        $searchParam = "%$search%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $params[] = $searchParam;
        $params[] = $searchParam;
    }

    if ($action !== '') {
        $conditions[] = 'a.action = ?';
        $params[] = $action;
    }

    $whereClause = !empty($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';

    // Count query
    $countQuery = "
        SELECT COUNT(*) as count 
        FROM activity_logs a
        LEFT JOIN users u ON a.user_id = u.id
        $whereClause
    ";
    $countStmt = $pdo->prepare($countQuery);
    $countStmt->execute($params);
    $totalItems = (int)$countStmt->fetch()['count'];
    $totalPages = ceil($totalItems / $limit);

    // List query
    $query = "
        SELECT a.*, u.first_name, u.last_name, u.email
        FROM activity_logs a
        LEFT JOIN users u ON a.user_id = u.id
        $whereClause
        ORDER BY a.created_at DESC, a.id DESC
        LIMIT ? OFFSET ?
    ";
    
    $stmt = $pdo->prepare($query);
    
    $bindIdx = 1;
    foreach ($params as $paramVal) {
        $stmt->bindValue($bindIdx++, $paramVal);
    }
    $stmt->bindValue($bindIdx++, $limit, PDO::PARAM_INT);
    $stmt->bindValue($bindIdx++, $offset, PDO::PARAM_INT);
    
    $stmt->execute();
    $logs = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'logs' => $logs,
        'totalItems' => $totalItems,
        'totalPages' => $totalPages,
        'currentPage' => $page,
        'itemsPerPage' => $limit
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch activity logs: ' . $e->getMessage()]);
}
?>
