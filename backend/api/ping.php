<?php
/**
 * Baesys — API Health Check
 * 
 * GET /api/ping
 * Verifies that the PHP backend is running and can connect to MySQL.
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

try {
    $pdo = getDBConnection();
    $stmt = $pdo->query('SELECT 1');
    
    echo json_encode([
        'success' => true,
        'message' => 'Baesys API is running',
        'database' => 'connected',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'API is running but database connection failed',
        'error' => $e->getMessage()
    ]);
}
