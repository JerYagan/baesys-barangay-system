<?php
/**
 * Baesys — List Barangay Officials API
 * 
 * GET /api/officials/list.php
 * Optional params:
 *   active=(0|1)
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

    $sql = 'SELECT * FROM officials WHERE 1=1';
    $params = [];

    if (isset($_GET['active'])) {
        $sql .= ' AND is_active = ?';
        $params[] = (int)$_GET['active'];
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $officials = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'officials' => $officials
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred: ' . $e->getMessage()]);
}
