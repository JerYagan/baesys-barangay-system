<?php
/**
 * Baesys — List Users API (Admin only)
 * 
 * GET /api/users/list.php
 * 
 * Params (GET):
 *   page: int (default 1)
 *   limit: int (default 10)
 *   search: string (searches first_name, last_name, email)
 *   role: string ('admin' | 'staff' | 'resident' | '')
 *   status: string ('pending' | 'active' | 'inactive' | '')
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
$limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 10;
$offset = ($page - 1) * $limit;

$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$role = isset($_GET['role']) ? trim($_GET['role']) : '';
$status = isset($_GET['status']) ? trim($_GET['status']) : '';

try {
    $pdo = getDBConnection();

    $conditions = [];
    $params = [];

    if ($search !== '') {
        $conditions[] = '(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
        $searchParam = "%$search%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $params[] = $searchParam;
    }

    if ($role !== '') {
        $conditions[] = 'role = ?';
        $params[] = $role;
    }

    if ($status !== '') {
        $conditions[] = 'status = ?';
        $params[] = $status;
    }

    $whereClause = !empty($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';

    // Count query
    $countQuery = "SELECT COUNT(*) as count FROM users $whereClause";
    $countStmt = $pdo->prepare($countQuery);
    $countStmt->execute($params);
    $totalItems = (int)$countStmt->fetch()['count'];
    $totalPages = ceil($totalItems / $limit);

    // List query
    $query = "
        SELECT id, email, first_name, last_name, role, status, created_at, updated_at 
        FROM users 
        $whereClause 
        ORDER BY created_at DESC 
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
    $users = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'users' => $users,
        'totalItems' => $totalItems,
        'totalPages' => $totalPages,
        'currentPage' => $page,
        'itemsPerPage' => $limit
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch users: ' . $e->getMessage()]);
}
