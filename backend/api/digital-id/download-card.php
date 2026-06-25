<?php
/**
 * Baesys — Download Digital ID Card PDF
 * 
 * GET /api/digital-id/download-card.php?resident_id=...
 */

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

try {
    $payload = authenticate();
    $pdo = getDBConnection();

    $resident_id = null;

    if (in_array($payload['role'], ['admin', 'staff'])) {
        $resident_id = isset($_GET['resident_id']) ? (int)$_GET['resident_id'] : null;
    } else {
        // Resident
        $resStmt = $pdo->prepare('SELECT id FROM residents WHERE user_id = ? AND is_archived = 0');
        $resStmt->execute([$payload['sub']]);
        $resident = $resStmt->fetch();
        if ($resident) {
            $resident_id = (int)$resident['id'];
        }
    }

    if (empty($resident_id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Resident ID is required.']);
        exit;
    }

    // Fetch resident details
    $stmt = $pdo->prepare('SELECT * FROM residents WHERE id = ? AND is_archived = 0');
    $stmt->execute([$resident_id]);
    $resDetails = $stmt->fetch();

    if (!$resDetails || empty($resDetails['barangay_id_no'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID Card has not been issued to this resident yet.']);
        exit;
    }

    // Fetch system settings
    $settingsStmt = $pdo->query('SELECT setting_key, setting_value FROM settings');
    $settingsRaw = $settingsStmt->fetchAll();
    $settings = [];
    foreach ($settingsRaw as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    $barangay_name = $settings['barangay_name'] ?? 'Baesa';
    $barangay_address = $settings['barangay_address'] ?? '22 Saklolo St., Manotoc Subdivision, Brgy. Baesa, Quezon City';
    $barangay_contact = $settings['barangay_contact'] ?? '7-3393-122 / 0962-715-0979';
    $chairman_name = $settings['barangay_chairman'] ?? 'HON. JOSE A. PEREZ';

    // Image / Avatar setup
    // Since this runs server-side on php, we check if the avatar exists locally
    $avatarFile = '';
    if ($resDetails['profile_path']) {
        $path = __DIR__ . '/../..' . $resDetails['profile_path'];
        if (file_exists($path)) {
            $avatarFile = 'data:image/' . pathinfo($path, PATHINFO_EXTENSION) . ';base64,' . base64_encode(file_get_contents($path));
        }
    }

    // Google Chart QR Verification url
    $verificationUrl = 'http://baesys.local/verify-id?hash=' . $resDetails['digital_id_secure_hash'];
    $qrUrl = 'https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=' . urlencode($verificationUrl);
    // Fetch QR Base64 to bypass remote fetch errors in mPDF
    $qrBase64 = '';
    try {
        $qrContent = file_get_contents($qrUrl);
        if ($qrContent) {
            $qrBase64 = 'data:image/png;base64,' . base64_encode($qrContent);
        }
    } catch(Exception $e) {}

    // Compile HTML Card Template
    $html = '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {
                font-family: "Helvetica", "Arial", sans-serif;
                color: #0f172a;
                margin: 0;
                padding: 0;
            }
            .id-card-sheet {
                width: 100%;
                text-align: center;
                margin-top: 100px;
            }
            .card-wrapper {
                display: inline-block;
                width: 320px;
                height: 200px;
                border: 2px solid #1e3a8a;
                border-radius: 8px;
                padding: 10px;
                background-color: #ffffff;
                text-align: left;
                vertical-align: top;
                margin: 0 15px;
            }
            .header {
                border-bottom: 2px solid #1e3a8a;
                padding-bottom: 5px;
                margin-bottom: 8px;
            }
            .header-text {
                font-size: 10px;
                font-weight: bold;
                color: #1e3a8a;
                text-transform: uppercase;
                margin: 0;
            }
            .sub-header-text {
                font-size: 7px;
                color: #64748b;
                margin: 0;
            }
            .card-body {
                font-size: 9px;
            }
            .photo-box {
                float: left;
                width: 70px;
                height: 70px;
                border: 1px solid #94a3b8;
                border-radius: 4px;
                background-color: #f8fafc;
                text-align: center;
                overflow: hidden;
            }
            .photo-box img {
                width: 100%;
                height: 100%;
                object-cover: cover;
            }
            .details-box {
                margin-left: 80px;
                height: 70px;
            }
            .label {
                font-size: 7px;
                color: #64748b;
                text-transform: uppercase;
                margin-bottom: 1px;
            }
            .value {
                font-weight: bold;
                font-size: 9px;
                margin-bottom: 4px;
            }
            .id-number-tag {
                margin-top: 5px;
                background-color: #1e3a8a;
                color: #ffffff;
                padding: 3px 6px;
                font-size: 10px;
                font-weight: bold;
                border-radius: 3px;
                text-align: center;
            }
            .back-card {
                position: relative;
            }
            .qr-box {
                float: left;
                width: 60px;
                height: 60px;
                margin-top: 10px;
            }
            .back-details {
                margin-left: 70px;
                font-size: 8px;
                margin-top: 5px;
            }
            .footer-signature {
                margin-top: 15px;
                text-align: center;
                border-top: 1px solid #475569;
                font-size: 7px;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="id-card-sheet">
            <!-- Front Card -->
            <div class="card-wrapper">
                <div class="header">
                    <table style="width: 100%; border: none;">
                        <tr>
                            <td style="width: 25px; vertical-align: middle;">
                                <img src="' . __DIR__ . '/../../../frontend/public/images/logo-light.png" style="width: 20px; height: 20px;" />
                            </td>
                            <td style="vertical-align: middle; padding-left: 5px;">
                                <div class="header-text">Brgy. ' . htmlspecialchars($barangay_name) . '</div>
                                <div class="sub-header-text">Official Digital Barangay Pass</div>
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="card-body">
                    <div class="photo-box">
                        ' . ($avatarFile ? '<img src="' . $avatarFile . '" />' : '<div style="padding-top: 25px; font-weight: bold; color: #cbd5e1; font-size: 8px;">NO PHOTO</div>') . '
                    </div>
                    <div class="details-box">
                        <div class="label">Full Name</div>
                        <div class="value" style="font-size: 10px; text-transform: uppercase;">' . htmlspecialchars($resDetails['last_name'] . ', ' . $resDetails['first_name'] . ' ' . $resDetails['middle_name']) . '</div>
                        <div class="label">Purok / Area</div>
                        <div class="value">' . htmlspecialchars($resDetails['purok']) . '</div>
                    </div>
                    <div style="clear: both;"></div>
                    
                    <div class="id-number-tag">
                        ID NO: ' . htmlspecialchars($resDetails['barangay_id_no']) . '
                    </div>
                </div>
            </div>

            <!-- Back Card -->
            <div class="card-wrapper back-card">
                <div class="header" style="border-bottom: 1px solid #cbd5e1;">
                    <div style="font-size: 8px; font-weight: bold; color: #1e3a8a;">OFFICIAL VALIDATION DETAILS</div>
                </div>
                
                <div class="card-body">
                    <div class="qr-box">
                        ' . ($qrBase64 ? '<img src="' . $qrBase64 . '" style="width: 100%; height: 100%;" />' : '<div style="font-size: 6px; color: #e2e8f0; padding-top: 25px;">NO QR</div>') . '
                    </div>
                    <div class="back-details">
                        <div class="label">Issued Date</div>
                        <div class="value" style="font-size: 8px;">' . date('F d, Y', strtotime($resDetails['digital_id_issued_at'])) . '</div>
                        
                        <div class="label">Expiration Date</div>
                        <div class="value" style="font-size: 8px; color: #dc2626;">' . date('F d, Y', strtotime($resDetails['digital_id_expires_at'])) . '</div>

                        <div class="label">Emergency Contact</div>
                        <div class="value" style="font-size: 7px; color: #334155;">Brgy Hall: ' . htmlspecialchars($barangay_contact) . '</div>
                    </div>
                    <div style="clear: both;"></div>
                    
                    <div class="footer-signature">
                        ' . htmlspecialchars($chairman_name) . '<br>
                        <span style="font-weight: normal; font-size: 6px; color: #64748b;">Barangay Chairperson Signature</span>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    ';

    $mpdf = new \Mpdf\Mpdf([
        'margin_left' => 10,
        'margin_right' => 10,
        'margin_top' => 10,
        'margin_bottom' => 10,
        'format' => 'Letter',
        'orientation' => 'L'
    ]);

    $mpdf->SetTitle('Barangay ID - ' . $resDetails['first_name'] . ' ' . $resDetails['last_name']);
    $mpdf->WriteHTML($html);

    $fileName = 'Barangay_ID_' . $resDetails['last_name'] . '.pdf';
    $mpdf->Output($fileName, \Mpdf\Output\Destination::INLINE);

} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode([
        'success' => false,
        'message' => 'Failed to generate ID Card: ' . $e->getMessage()
    ]);
}
?>
