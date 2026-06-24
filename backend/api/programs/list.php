<?php
/**
 * Baesys — List Programs/Projects API
 * 
 * GET /api/programs/list.php
 * Optional params:
 *   status=(upcoming|ongoing|completed)
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

// Authenticate user
$payload = authenticate();

try {
    $pdo = getDBConnection();

    $sql = 'SELECT * FROM programs WHERE 1=1';
    $params = [];

    if (!empty($_GET['status'])) {
        $status = trim($_GET['status']);
        if (in_array($status, ['upcoming', 'ongoing', 'completed'])) {
            $sql .= ' AND status = ?';
            $params[] = $status;
        }
    }

    $sql .= ' ORDER BY created_at DESC';

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $programs = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'programs' => $programs
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
}
