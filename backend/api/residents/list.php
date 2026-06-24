<?php
/**
 * Baesys — List Residents API
 * 
 * GET /api/residents/list.php
 * 
 * Params (GET):
 *   page: int (default 1)
 *   limit: int (default 10)
 *   search: string (searches by first/last/middle name)
 *   purok: string (filters by purok)
 *   status: string ('active' | 'archived' | 'all', default 'active')
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Authenticate staff/admin
$payload = authenticate('staff');

$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$limit = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 10;
$offset = ($page - 1) * $limit;

$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$purok = isset($_GET['purok']) ? trim($_GET['purok']) : '';
$status = isset($_GET['status']) ? trim($_GET['status']) : 'active';

try {
    $pdo = getDBConnection();

    // Build query conditions
    $conditions = [];
    $params = [];

    // Filter by archived status
    if ($status === 'active') {
        $conditions[] = 'r.is_archived = 0';
    } elseif ($status === 'archived') {
        $conditions[] = 'r.is_archived = 1';
    }

    // Purok filter
    if ($purok !== '') {
        $conditions[] = 'r.purok = ?';
        $params[] = $purok;
    }

    // Search filter (searches full name)
    if ($search !== '') {
        $conditions[] = '(r.first_name LIKE ? OR r.last_name LIKE ? OR r.middle_name LIKE ?)';
        $searchParam = "%$search%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $params[] = $searchParam;
    }

    $whereClause = !empty($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';

    // Get total items count
    $countQuery = "SELECT COUNT(*) as count FROM residents r $whereClause";
    $countStmt = $pdo->prepare($countQuery);
    $countStmt->execute($params);
    $totalItems = (int)$countStmt->fetch()['count'];
    $totalPages = ceil($totalItems / $limit);

    // Get paginated items
    // Join with households to show household_no if available
    $query = "
        SELECT r.*, h.household_no 
        FROM residents r 
        LEFT JOIN households h ON r.household_id = h.id 
        $whereClause 
        ORDER BY r.last_name ASC, r.first_name ASC 
        LIMIT ? OFFSET ?
    ";
    
    $stmt = $pdo->prepare($query);
    
    // Bind parameters for LIMIT and OFFSET as integers
    $bindIdx = 1;
    foreach ($params as $paramVal) {
        $stmt->bindValue($bindIdx++, $paramVal);
    }
    $stmt->bindValue($bindIdx++, $limit, PDO::PARAM_INT);
    $stmt->bindValue($bindIdx++, $offset, PDO::PARAM_INT);
    
    $stmt->execute();
    $residents = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'residents' => $residents,
        'totalItems' => $totalItems,
        'totalPages' => $totalPages,
        'currentPage' => $page,
        'itemsPerPage' => $limit
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch residents: ' . $e->getMessage()
    ]);
}
