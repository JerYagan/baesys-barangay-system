<?php
/**
 * Baesys — Clinic Services API
 * 
 * GET /api/clinic/services.php - Fetch services
 * POST /api/clinic/services.php - Add/Edit service (Admin/Staff only)
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getDBConnection();

    if ($method === 'GET') {
        // Fetch clinic services
        // If staff/admin is requesting, show all services, otherwise show only active ones
        $payload = null;
        try {
            $payload = authenticate();
        } catch (Exception $e) {}

        if ($payload && in_array($payload['role'], ['admin', 'staff'])) {
            $stmt = $pdo->query('SELECT * FROM clinic_services ORDER BY name ASC');
        } else {
            $stmt = $pdo->query('SELECT * FROM clinic_services WHERE is_active = 1 ORDER BY name ASC');
        }
        
        $services = $stmt->fetchAll();
        echo json_encode(['success' => true, 'services' => $services]);
        exit;
    } 
    
    if ($method === 'POST') {
        // Staff/Admin only
        $payload = authenticate('staff');

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        $id = isset($input['id']) ? (int)$input['id'] : null;
        $name = isset($input['name']) ? trim($input['name']) : '';
        $description = isset($input['description']) ? trim($input['description']) : '';
        $estimated_duration = isset($input['estimated_duration_mins']) ? (int)$input['estimated_duration_mins'] : 30;
        $is_active = isset($input['is_active']) ? (int)$input['is_active'] : 1;

        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Service name is required.']);
            exit;
        }

        if ($id) {
            // Update Service
            $stmt = $pdo->prepare('
                UPDATE clinic_services 
                SET name = ?, description = ?, estimated_duration_mins = ?, is_active = ? 
                WHERE id = ?
            ');
            $stmt->execute([$name, $description, $estimated_duration, $is_active, $id]);
            echo json_encode(['success' => true, 'message' => 'Service updated successfully.']);
        } else {
            // Create Service
            $stmt = $pdo->prepare('
                INSERT INTO clinic_services (name, description, estimated_duration_mins, is_active) 
                VALUES (?, ?, ?, ?)
            ');
            $stmt->execute([$name, $description, $estimated_duration, $is_active]);
            echo json_encode(['success' => true, 'message' => 'Service created successfully.']);
        }
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error: ' . $e->getMessage()]);
}
?>
