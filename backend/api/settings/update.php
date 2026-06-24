<?php
/**
 * Baesys — Update Settings API (Admin only)
 * 
 * PUT /api/settings/update.php
 * Body JSON: { "settings": { "key1": "value1", "key2": "value2", ... } }
 * Upserts each key-value pair into the settings table.
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$payload = authenticate('admin');

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['settings']) || !is_array($input['settings'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Settings object is required.']);
    exit;
}

try {
    $pdo = getDBConnection();

    $stmt = $pdo->prepare('
        INSERT INTO settings (setting_key, setting_value) 
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()
    ');

    $pdo->beginTransaction();
    foreach ($input['settings'] as $key => $value) {
        $stmt->execute([trim($key), $value]);
    }
    $pdo->commit();

    // Log activity
    $logStmt = $pdo->prepare(
        'INSERT INTO activity_logs (user_id, action, target_table, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)'
    );
    $logStmt->execute([
        $payload['sub'],
        'update_settings',
        'settings',
        null,
        'Updated system settings (' . count($input['settings']) . ' key(s))',
        $_SERVER['REMOTE_ADDR'] ?? null
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Settings updated successfully.'
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to update settings: ' . $e->getMessage()]);
}
