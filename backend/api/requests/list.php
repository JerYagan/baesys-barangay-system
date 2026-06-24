<?php
/**
 * Baesys — List All Document Requests API
 * 
 * GET /api/requests/list.php
 * 
 * Params (GET):
 *   page: int (default 1)
 *   limit: int (default 10)
 *   status: string ('pending'|'processing'|'ready_for_pickup'|'released'|'all', default 'all')
 *   type: int (document type filter)
 *   search: string (resident name filter)
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

$status = isset($_GET['status']) ? trim($_GET['status']) : 'all';
$type = isset($_GET['type']) ? (int)$_GET['type'] : 0;
$search = isset($_GET['search']) ? trim($_GET['search']) : '';

try {
    $pdo = getDBConnection();

    // Build conditions
    $conditions = [];
    $params = [];

    if ($status !== 'all') {
        $conditions[] = 'dr.status = ?';
        $params[] = $status;
    }

    if ($type > 0) {
        $conditions[] = 'dr.document_type_id = ?';
        $params[] = $type;
    }

    if ($search !== '') {
        $conditions[] = '(r.first_name LIKE ? OR r.last_name LIKE ? OR r.middle_name LIKE ?)';
        $searchParam = "%$search%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $params[] = $searchParam;
    }

    $whereClause = !empty($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';

    // Get total count
    $countQuery = "
        SELECT COUNT(*) as count 
        FROM document_requests dr 
        LEFT JOIN residents r ON dr.resident_id = r.id 
        $whereClause
    ";
    $countStmt = $pdo->prepare($countQuery);
    $countStmt->execute($params);
    $totalItems = (int)$countStmt->fetch()['count'];
    $totalPages = ceil($totalItems / $limit);

    // Fetch requests
    $query = "
        SELECT dr.*, 
               r.first_name as resident_first_name, 
               r.last_name as resident_last_name, 
               r.middle_name as resident_middle_name,
               dt.name as document_name, 
               dt.fee as document_fee
        FROM document_requests dr 
        LEFT JOIN residents r ON dr.resident_id = r.id 
        LEFT JOIN document_types dt ON dr.document_type_id = dt.id 
        $whereClause 
        ORDER BY dr.requested_at DESC 
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
    $requests = $stmt->fetchAll();

    // Get tab counts
    $countsQuery = "
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
            SUM(CASE WHEN status = 'ready_for_pickup' THEN 1 ELSE 0 END) as ready,
            SUM(CASE WHEN status = 'released' THEN 1 ELSE 0 END) as released
        FROM document_requests
    ";
    $countsRes = $pdo->query($countsQuery)->fetch();

    echo json_encode([
        'success' => true,
        'requests' => $requests,
        'totalItems' => $totalItems,
        'totalPages' => $totalPages,
        'currentPage' => $page,
        'itemsPerPage' => $limit,
        'stats' => [
            'total' => (int)$countsRes['total'],
            'pending' => (int)$countsRes['pending'],
            'processing' => (int)$countsRes['processing'],
            'ready' => (int)$countsRes['ready'],
            'released' => (int)$countsRes['released']
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch document requests: ' . $e->getMessage()
    ]);
}
