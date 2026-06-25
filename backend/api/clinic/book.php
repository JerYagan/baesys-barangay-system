<?php
/**
 * Baesys — Book Clinic Appointment API (Resident only)
 * 
 * POST /api/clinic/book.php
 */

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

try {
    // Authenticate resident
    $payload = authenticate('resident');
    $userId = $payload['sub'];

    $pdo = getDBConnection();

    // Fetch resident profile linked to user_id
    $resStmt = $pdo->prepare('SELECT id FROM residents WHERE user_id = ? AND is_archived = 0');
    $resStmt->execute([$userId]);
    $resident = $resStmt->fetch();

    if (!$resident) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Resident profile not found or is archived.']);
        exit;
    }
    $resident_id = (int)$resident['id'];

    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        $input = $_POST;
    }

    $schedule_id = isset($input['schedule_id']) ? (int)$input['schedule_id'] : null;
    $appointment_time = isset($input['appointment_time']) ? trim($input['appointment_time']) : '';
    $purpose = isset($input['purpose']) ? trim($input['purpose']) : '';

    if (empty($schedule_id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Schedule ID is required.']);
        exit;
    }

    // Fetch schedule and verify capacity
    $schedStmt = $pdo->prepare('SELECT * FROM clinic_schedules WHERE id = ?');
    $schedStmt->execute([$schedule_id]);
    $schedule = $schedStmt->fetch();

    if (!$schedule) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Selected schedule slot not found.']);
        exit;
    }

    if ((int)$schedule['filled_slots'] >= (int)$schedule['max_slots']) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'This schedule slot is already full. Please pick another date/time.']);
        exit;
    }

    // If no specific appointment_time passed, default to start_time of schedule
    if (empty($appointment_time)) {
        $appointment_time = $schedule['start_time'];
    }

    // Start transaction to prevent slot overbooking
    $pdo->beginTransaction();

    // Insert appointment
    $bookStmt = $pdo->prepare('
        INSERT INTO appointments (resident_id, service_id, schedule_id, appointment_time, purpose, status) 
        VALUES (?, ?, ?, ?, ?, "pending")
    ');
    $bookStmt->execute([
        $resident_id,
        $schedule['service_id'],
        $schedule_id,
        $appointment_time,
        $purpose
    ]);

    // Increment filled slots
    $updateStmt = $pdo->prepare('
        UPDATE clinic_schedules 
        SET filled_slots = filled_slots + 1 
        WHERE id = ?
    ');
    $updateStmt->execute([$schedule_id]);

    $pdo->commit();

    echo json_encode(['success' => true, 'message' => 'Appointment booked successfully!']);

} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error: ' . $e->getMessage()]);
}
?>
