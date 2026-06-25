<?php
/**
 * Baesys — Clinic Schedules API
 * 
 * GET /api/clinic/schedules.php - Get schedules / slots
 * POST /api/clinic/schedules.php - Create schedules (Staff only)
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getDBConnection();

    if ($method === 'GET') {
        $service_id = isset($_GET['service_id']) ? (int)$_GET['service_id'] : null;
        $date = isset($_GET['date']) ? trim($_GET['date']) : '';

        $conditions = [];
        $params = [];

        if ($service_id) {
            $conditions[] = 'cs.service_id = ?';
            $params[] = $service_id;
        }

        if ($date !== '') {
            $conditions[] = 'cs.schedule_date = ?';
            $params[] = $date;
        } else {
            // By default only show future or today's schedules for residents
            $payload = null;
            try { $payload = authenticate(); } catch (Exception $e) {}
            
            if (!$payload || !in_array($payload['role'], ['admin', 'staff'])) {
                $conditions[] = 'cs.schedule_date >= CURDATE()';
            }
        }

        $whereClause = !empty($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';
        
        $query = "
            SELECT cs.*, s.name as service_name, s.estimated_duration_mins
            FROM clinic_schedules cs
            LEFT JOIN clinic_services s ON cs.service_id = s.id
            $whereClause
            ORDER BY cs.schedule_date ASC, cs.start_time ASC
        ";

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $schedules = $stmt->fetchAll();

        echo json_encode(['success' => true, 'schedules' => $schedules]);
        exit;
    }

    if ($method === 'POST') {
        // Staff/Admin only
        $payload = authenticate('staff');

        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        $service_id = isset($input['service_id']) ? (int)$input['service_id'] : null;
        $schedule_date = isset($input['schedule_date']) ? trim($input['schedule_date']) : '';
        $start_time = isset($input['start_time']) ? trim($input['start_time']) : '';
        $end_time = isset($input['end_time']) ? trim($input['end_time']) : '';
        $max_slots = isset($input['max_slots']) ? (int)$input['max_slots'] : 10;

        if (empty($service_id) || empty($schedule_date) || empty($start_time) || empty($end_time)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Service, date, start time, and end time are required.']);
            exit;
        }

        // Validate service exists
        $srvStmt = $pdo->prepare('SELECT id FROM clinic_services WHERE id = ?');
        $srvStmt->execute([$service_id]);
        if (!$srvStmt->fetch()) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Selected clinic service does not exist.']);
            exit;
        }

        // Insert new schedule
        $stmt = $pdo->prepare('
            INSERT INTO clinic_schedules (service_id, schedule_date, start_time, end_time, max_slots, filled_slots) 
            VALUES (?, ?, ?, ?, ?, 0)
        ');
        $stmt->execute([$service_id, $schedule_date, $start_time, $end_time, $max_slots]);

        echo json_encode(['success' => true, 'message' => 'Clinic schedule created successfully.']);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error: ' . $e->getMessage()]);
}
?>
