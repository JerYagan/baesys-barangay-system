<?php
/**
 * Baesys — List Households API
 * 
 * GET /api/households/list.php
 * 
 * Params (GET):
 *   page: int (default 1)
 *   limit: int (default 10)
 *   search: string (filters by household_no or address)
 *   purok: string (filters by purok)
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

try {
    $pdo = getDBConnection();

    // Build conditions
    $conditions = [];
    $params = [];

    if ($purok !== '') {
        $conditions[] = 'h.purok = ?';
        $params[] = $purok;
    }

    if ($search !== '') {
        $conditions[] = '(h.household_no LIKE ? OR h.address LIKE ?)';
        $searchParam = "%$search%";
        $params[] = $searchParam;
        $params[] = $searchParam;
    }

    $whereClause = !empty($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';

    // Get total count
    $countQuery = "SELECT COUNT(*) as count FROM households h $whereClause";
    $countStmt = $pdo->prepare($countQuery);
    $countStmt->execute($params);
    $totalItems = (int)$countStmt->fetch()['count'];
    $totalPages = ceil($totalItems / $limit);

    // Get paginated households with head name and member count
    $query = "
        SELECT h.*, 
               r.first_name as head_first_name, 
               r.last_name as head_last_name, 
               (SELECT COUNT(*) FROM residents WHERE household_id = h.id AND is_archived = 0) as member_count
        FROM households h 
        LEFT JOIN residents r ON h.head_resident_id = r.id 
        $whereClause 
        ORDER BY h.household_no ASC 
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
    $households = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'households' => $households,
        'totalItems' => $totalItems,
        'totalPages' => $totalPages,
        'currentPage' => $page,
        'itemsPerPage' => $limit
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch households: ' . $e->getMessage()
    ]);
}
