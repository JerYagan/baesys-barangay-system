<?php
/**
 * Baesys — Appointments API
 * 
 * GET /api/clinic/appointments.php - List appointments
 * PUT /api/clinic/appointments.php - Update status / staff notes (Staff only)
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = getDBConnection();
    $payload = authenticate();

    if ($method === 'GET') {
        if ($payload['role'] === 'resident') {
            // Find resident ID
            $resStmt = $pdo->prepare('SELECT id FROM residents WHERE user_id = ? AND is_archived = 0');
            $resStmt->execute([$payload['sub']]);
            $resident = $resStmt->fetch();
            if (!$resident) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Resident profile not found.']);
                exit;
            }
            $resident_id = (int)$resident['id'];

            // Fetch resident's appointments
            $stmt = $pdo->prepare("
                SELECT a.*, cs.schedule_date, cs.start_time, cs.end_time, s.name as service_name
                FROM appointments a
                LEFT JOIN clinic_schedules cs ON a.schedule_id = cs.id
                LEFT JOIN clinic_services s ON a.service_id = s.id
                WHERE a.resident_id = ?
                ORDER BY cs.schedule_date DESC, a.appointment_time ASC
            ");
            $stmt->execute([$resident_id]);
            $appointments = $stmt->fetchAll();

            echo json_encode(['success' => true, 'appointments' => $appointments]);
            exit;
        } 
        
        // Staff/Admin view
        if (in_array($payload['role'], ['staff', 'admin'])) {
            $status = isset($_GET['status']) ? trim($_GET['status']) : '';
            $date = isset($_GET['date']) ? trim($_GET['date']) : '';
            $service_id = isset($_GET['service_id']) ? (int)$_GET['service_id'] : null;

            $conditions = [];
            $params = [];

            if ($status !== '') {
                $conditions[] = 'a.status = ?';
                $params[] = $status;
            }
            if ($date !== '') {
                $conditions[] = 'cs.schedule_date = ?';
                $params[] = $date;
            }
            if ($service_id) {
                $conditions[] = 'a.service_id = ?';
                $params[] = $service_id;
            }

            $whereClause = !empty($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';

            $query = "
                SELECT a.*, 
                       cs.schedule_date, cs.start_time, cs.end_time,
                       s.name as service_name,
                       r.first_name, r.last_name, r.middle_name, r.contact_no, r.purok
                FROM appointments a
                LEFT JOIN clinic_schedules cs ON a.schedule_id = cs.id
                LEFT JOIN clinic_services s ON a.service_id = s.id
                LEFT JOIN residents r ON a.resident_id = r.id
                $whereClause
                ORDER BY cs.schedule_date DESC, a.appointment_time ASC
            ";

            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $appointments = $stmt->fetchAll();

            echo json_encode(['success' => true, 'appointments' => $appointments]);
            exit;
        }

        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied.']);
        exit;
    }

    if ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            $input = $_POST;
        }

        $id = isset($input['id']) ? (int)$input['id'] : null;
        $status = isset($input['status']) ? trim($input['status']) : '';
        $staff_notes = isset($input['staff_notes']) ? trim($input['staff_notes']) : null;

        if (empty($id) || empty($status)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Appointment ID and status are required.']);
            exit;
        }

        // Fetch current appointment
        $apptStmt = $pdo->prepare('SELECT * FROM appointments WHERE id = ?');
        $apptStmt->execute([$id]);
        $appt = $apptStmt->fetch();

        if (!$appt) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Appointment not found.']);
            exit;
        }

        // Access validation:
        if ($payload['role'] === 'resident') {
            // Find resident ID
            $resStmt = $pdo->prepare('SELECT id FROM residents WHERE user_id = ? AND is_archived = 0');
            $resStmt->execute([$payload['sub']]);
            $resident = $resStmt->fetch();
            if (!$resident || (int)$appt['resident_id'] !== (int)$resident['id']) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Access denied. You can only cancel your own appointments.']);
                exit;
            }
            if ($status !== 'cancelled') {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Residents can only cancel their own appointments.']);
                exit;
            }
        } elseif (!in_array($payload['role'], ['staff', 'admin'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Access denied.']);
            exit;
        }

        $oldStatus = $appt['status'];
        $scheduleId = (int)$appt['schedule_id'];

        $pdo->beginTransaction();

        // Update appointment status and staff notes
        $updateStmt = $pdo->prepare('
            UPDATE appointments 
            SET status = ?, staff_notes = ? 
            WHERE id = ?
        ');
        $updateStmt->execute([$status, $staff_notes, $id]);

        // Adjust filled slots if cancelled
        if ($status === 'cancelled' && $oldStatus !== 'cancelled') {
            $decStmt = $pdo->prepare('
                UPDATE clinic_schedules 
                SET filled_slots = GREATEST(0, filled_slots - 1) 
                WHERE id = ?
            ');
            $decStmt->execute([$scheduleId]);
        }
        // If restored from cancelled to something else (unlikely but safe to handle)
        elseif ($oldStatus === 'cancelled' && $status !== 'cancelled') {
            $incStmt = $pdo->prepare('
                UPDATE clinic_schedules 
                SET filled_slots = filled_slots + 1 
                WHERE id = ?
            ');
            $incStmt->execute([$scheduleId]);
        }

        $pdo->commit();

        echo json_encode(['success' => true, 'message' => 'Appointment updated successfully.']);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error: ' . $e->getMessage()]);
}
?>
