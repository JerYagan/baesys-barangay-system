<?php
/**
 * Baesys — Dashboard Stats API
 * 
 * GET /api/dashboard/stats.php
 * 
 * Returns system statistics: total residents, total households, pending document requests,
 * open blotters, and completed requests this month.
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

// Authenticate staff/admin
$payload = authenticate('staff');

try {
    $pdo = getDBConnection();

    // 1. Total active (non-archived) residents
    $resStmt = $pdo->query('SELECT COUNT(*) as count FROM residents WHERE is_archived = 0');
    $totalResidents = (int)$resStmt->fetch()['count'];

    // 2. Total households
    $hhStmt = $pdo->query('SELECT COUNT(*) as count FROM households');
    $totalHouseholds = (int)$hhStmt->fetch()['count'];

    // 3. Pending document requests
    $reqStmt = $pdo->query("SELECT COUNT(*) as count FROM document_requests WHERE status = 'pending'");
    $pendingRequests = (int)$reqStmt->fetch()['count'];

    // 4. Open/Under Mediation blotter cases
    $blotterStmt = $pdo->query("SELECT COUNT(*) as count FROM blotter_records WHERE status IN ('open', 'under_mediation')");
    $openBlotters = (int)$blotterStmt->fetch()['count'];

    // 5. Completed (released) requests this month
    $completedStmt = $pdo->query("
        SELECT COUNT(*) as count 
        FROM document_requests 
        WHERE status = 'released' 
        AND MONTH(updated_at) = MONTH(CURRENT_DATE()) 
        AND YEAR(updated_at) = YEAR(CURRENT_DATE())
    ");
    $completedThisMonth = (int)$completedStmt->fetch()['count'];

    echo json_encode([
        'success' => true,
        'totalResidents' => $totalResidents,
        'totalHouseholds' => $totalHouseholds,
        'pendingRequests' => $pendingRequests,
        'openBlotters' => $openBlotters,
        'completedThisMonth' => $completedThisMonth
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch dashboard stats: ' . $e->getMessage()
    ]);
}
