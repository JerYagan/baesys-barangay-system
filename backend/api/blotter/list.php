<?php
/**
 * Baesys — List Blotter Records API (Admin/Staff only)
 * 
 * GET /api/blotter/list.php
 * Params:
 *   page=N
 *   limit=N
 *   status=(open|under_mediation|resolved|referred)
 *   search=... (complainant first/last name, respondent name, or type)
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

// Authenticate user (staff/admin only)
$payload = authenticate('staff');

$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

try {
    $pdo = getDBConnection();

    // Base query
    $sql = 'FROM blotter_records br
            LEFT JOIN residents r ON br.complainant_id = r.id
            WHERE 1=1';
    
    $params = [];

    // Filter by status
    if (!empty($_GET['status'])) {
        $status = trim($_GET['status']);
        if (in_array($status, ['open', 'under_mediation', 'resolved', 'referred'])) {
            $sql .= ' AND br.status = ?';
            $params[] = $status;
        }
    }

    // Filter by search
    if (!empty($_GET['search'])) {
        $search = '%' . trim($_GET['search']) . '%';
        $sql .= ' AND (r.first_name LIKE ? OR r.last_name LIKE ? OR br.respondent_name LIKE ? OR br.incident_type LIKE ?)';
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
        $params[] = $search;
    }

    // Count total items
    $countStmt = $pdo->prepare("SELECT COUNT(*) $sql");
    $countStmt->execute($params);
    $totalItems = (int)$countStmt->fetchColumn();
    $totalPages = ceil($totalItems / $limit);

    // Fetch paginated results
    $selectSql = "SELECT br.*, 
                         r.first_name as complainant_first_name, 
                         r.last_name as complainant_last_name, 
                         r.contact_no as complainant_contact
                  $sql 
                  ORDER BY br.created_at DESC 
                  LIMIT $limit OFFSET $offset";

    $stmt = $pdo->prepare($selectSql);
    $stmt->execute($params);
    $blotters = $stmt->fetchAll();

    // Compute status stats counters
    $stats = [
        'total' => (int)$pdo->query('SELECT COUNT(*) FROM blotter_records')->fetchColumn(),
        'open' => (int)$pdo->query('SELECT COUNT(*) FROM blotter_records WHERE status = "open"')->fetchColumn(),
        'under_mediation' => (int)$pdo->query('SELECT COUNT(*) FROM blotter_records WHERE status = "under_mediation"')->fetchColumn(),
        'resolved' => (int)$pdo->query('SELECT COUNT(*) FROM blotter_records WHERE status = "resolved"')->fetchColumn(),
        'referred' => (int)$pdo->query('SELECT COUNT(*) FROM blotter_records WHERE status = "referred"')->fetchColumn(),
    ];

    echo json_encode([
        'success' => true,
        'blotters' => $blotters,
        'totalItems' => $totalItems,
        'totalPages' => $totalPages,
        'currentPage' => $page,
        'stats' => $stats
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
}
