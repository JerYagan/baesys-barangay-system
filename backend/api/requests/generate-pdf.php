<?php
/**
 * Baesys — PDF Certificate Generator API
 * 
 * GET /api/requests/generate-pdf.php?id=...
 */

// Load Composer Autoloader
require_once __DIR__ . '/../../vendor/autoload.php';

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Authenticate user (staff, admin or the resident who requested it)
$payload = authenticate();

if (empty($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Request ID is required']);
    exit;
}

$id = (int)$_GET['id'];

try {
    $pdo = getDBConnection();

    // Fetch request details
    $stmt = $pdo->prepare('
        SELECT dr.*, 
               r.first_name as resident_first_name, 
               r.last_name as resident_last_name, 
               r.middle_name as resident_middle_name,
               r.birthdate as resident_birthdate,
               r.sex as resident_sex,
               r.civil_status as resident_civil_status,
               r.contact_no as resident_contact_no,
               r.purok as resident_purok,
               r.address as resident_address,
               dt.name as document_name, 
               dt.fee as document_fee,
               dt.processing_days
        FROM document_requests dr 
        LEFT JOIN residents r ON dr.resident_id = r.id 
        LEFT JOIN document_types dt ON dr.document_type_id = dt.id 
        WHERE dr.id = ?
    ');
    $stmt->execute([$id]);
    $request = $stmt->fetch();

    if (!$request) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Request not found']);
        exit;
    }

    // Role check: Residents can only generate their own released/ready requests
    if ($payload['role'] === 'resident') {
        // Fetch resident ID linked to user
        $resStmt = $pdo->prepare('SELECT id FROM residents WHERE user_id = ? AND is_archived = 0');
        $resStmt->execute([$payload['sub']]);
        $resident = $resStmt->fetch();

        if (!$resident || (int)$request['resident_id'] !== (int)$resident['id']) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Access denied. You do not have permission to view this request.']);
            exit;
        }

        // Residents can only download released or ready requests
        if (!in_array($request['status'], ['ready_for_pickup', 'released'])) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Access denied. Document is not ready or released yet.']);
            exit;
        }
    }

    // Fetch system settings for certificate header
    $settingsStmt = $pdo->query('SELECT setting_key, setting_value FROM settings');
    $settingsRaw = $settingsStmt->fetchAll();
    $settings = [];
    foreach ($settingsRaw as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    // Extract settings values
    $barangay_name = $settings['barangay_name'] ?? 'Barangay Sample';
    $barangay_address = $settings['barangay_address'] ?? '123 Main Street, Municipality, Province';
    $barangay_contact = $settings['barangay_contact'] ?? '(012) 345-6789';
    $barangay_email = $settings['barangay_email'] ?? 'barangay@sample.gov.ph';
    
    // Fallback chairperson name
    $chairman_name = $settings['barangay_chairman'] ?? 'HON. JOSE A. PEREZ';

    // Compile variables for templates
    $middleInitial = $request['resident_middle_name'] ? trim($request['resident_middle_name'])[0] . '.' : '';
    $resident_name = trim($request['resident_first_name']) . ' ' . ($middleInitial ? $middleInitial . ' ' : '') . trim($request['resident_last_name']);
    
    // Age calculation
    $today = new DateTime();
    $birthDate = new DateTime($request['resident_birthdate']);
    $age = date_diff($birthDate, $today)->y;

    $civil_status = $request['resident_civil_status'];
    $sex = $request['resident_sex'];
    $purok = $request['resident_purok'];
    $address = $request['resident_address'];
    $purpose = $request['purpose'];
    $fee = number_format((float)$request['document_fee'], 2);
    $date_issued = date('F d, Y');
    $or_number = 'OR-' . date('Ymd') . '-' . sprintf('%04d', $id);

    // Map template
    $docName = $request['document_name'];
    $templateFile = '';
    if ($docName === 'Barangay Clearance') {
        $templateFile = 'clearance.php';
    } elseif ($docName === 'Certificate of Indigency') {
        $templateFile = 'indigency.php';
    } elseif ($docName === 'Certificate of Residency') {
        $templateFile = 'residency.php';
    } elseif ($docName === 'Certificate of Good Moral Character') {
        $templateFile = 'good_moral.php';
    } elseif ($docName === 'Business Clearance') {
        $templateFile = 'business_clearance.php';
    } elseif ($docName === 'First Time Job Seeker Certification') {
        $templateFile = 'first_time_jobseeker.php';
    } else {
        throw new Exception("No PDF template defined for: $docName");
    }

    $templatePath = __DIR__ . '/templates/' . $templateFile;
    if (!file_exists($templatePath)) {
        throw new Exception("Template file not found: $templateFile");
    }

    // Render template using output buffering
    ob_start();
    include $templatePath;
    $html = ob_get_clean();

    // Initialize mPDF
    // Setup margin values
    $mpdf = new \Mpdf\Mpdf([
        'margin_left' => 15,
        'margin_right' => 15,
        'margin_top' => 15,
        'margin_bottom' => 15,
        'format' => 'Letter'
    ]);

    $mpdf->SetTitle($docName . ' - ' . $resident_name);
    $mpdf->WriteHTML($html);

    // Stream PDF
    $fileName = str_replace(' ', '_', $docName) . '_' . str_replace(' ', '_', $resident_name) . '.pdf';
    $mpdf->Output($fileName, \Mpdf\Output\Destination::INLINE);

} catch (Exception $e) {
    http_response_code(500);
    // If it's a PDF stream request, we should echo error as JSON or HTML
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'success' => false,
        'message' => 'Failed to generate PDF: ' . $e->getMessage()
    ]);
}
