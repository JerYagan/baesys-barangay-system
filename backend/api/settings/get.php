<?php
/**
 * Baesys — Get All Settings API (Admin only)
 * 
 * GET /api/settings/get.php
 * Returns all settings as key-value pairs.
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

try {
    $pdo = getDBConnection();

    $stmt = $pdo->query('SELECT setting_key, setting_value FROM settings ORDER BY setting_key ASC');
    $rows = $stmt->fetchAll();

    $settings = [];
    foreach ($rows as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    echo json_encode([
        'success' => true,
        'settings' => $settings
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to fetch settings: ' . $e->getMessage()]);
}
