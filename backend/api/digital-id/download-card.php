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
    // Fetch QR Base64
    $qrBase64 = '';
    try {
        $qrContent = file_get_contents($qrUrl);
        if ($qrContent) {
            $qrBase64 = 'data:image/png;base64,' . base64_encode($qrContent);
        }
    } catch(Exception $e) {}

    // Compile HTML Card Template (Portrait Layout matching DigitalID.jsx)
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
                background-color: #f8fafc;
            }
            .page-container {
                width: 100%;
                text-align: center;
                padding-top: 10px;
            }
            .card-wrapper {
                display: block;
                width: 240px;
                height: 380px;
                border: 2px solid #0284c7;
                border-radius: 12px;
                padding: 12px;
                background-color: #ffffff;
                text-align: left;
                margin: 15px auto;
                position: relative;
            }
            .header-table {
                width: 100%;
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 5px;
                margin-bottom: 10px;
            }
            .header-title {
                font-size: 8px;
                font-weight: 900;
                color: #0369a1;
                text-transform: uppercase;
                margin: 0;
                line-height: 1.1;
            }
            .header-subtitle {
                font-size: 9px;
                font-weight: bold;
                color: #0f172a;
                text-transform: uppercase;
                margin: 2px 0 0 0;
            }
            .header-region {
                font-size: 6px;
                color: #94a3b8;
                margin: 0;
            }
            .body-content {
                text-align: center;
                margin: 15px 0;
            }
            .avatar-container {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                border: 2px solid #cbd5e1;
                margin: 0 auto 10px auto;
                overflow: hidden;
            }
            .avatar-img {
                width: 80px;
                height: 80px;
                border-radius: 50%;
            }
            .no-avatar {
                width: 80px;
                height: 80px;
                line-height: 80px;
                border-radius: 50%;
                background-color: #f1f5f9;
                color: #94a3b8;
                font-size: 8px;
                font-weight: bold;
            }
            .resident-name-label {
                font-size: 8px;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 2px;
            }
            .resident-name-value {
                font-size: 13px;
                font-weight: 900;
                color: #0f172a;
                text-transform: uppercase;
                margin: 0;
            }
            .meta-grid {
                width: 100%;
                border-top: 1px solid #e2e8f0;
                padding-top: 8px;
                margin-top: 10px;
            }
            .meta-label {
                font-size: 7px;
                color: #94a3b8;
                text-transform: uppercase;
            }
            .meta-value {
                font-size: 9px;
                font-weight: bold;
                color: #334155;
            }
            .id-tag {
                background-color: #0369a1;
                color: #ffffff;
                border-radius: 6px;
                padding: 6px 0;
                text-align: center;
                font-size: 10px;
                font-weight: 900;
                margin-top: 10px;
                letter-spacing: 1px;
            }
            .back-title {
                font-size: 9px;
                font-weight: 900;
                color: #0369a1;
                text-transform: uppercase;
                text-align: center;
                border-bottom: 1px solid #e2e8f0;
                padding-bottom: 5px;
                margin-bottom: 8px;
            }
            .cert-text {
                font-size: 8px;
                color: #475569;
                text-align: center;
                line-height: 1.3;
                margin-bottom: 8px;
                font-weight: bold;
            }
            .qr-container {
                text-align: center;
                margin-bottom: 5px;
            }
            .qr-img {
                width: 80px;
                height: 80px;
            }
            .qr-label {
                font-size: 6px;
                color: #94a3b8;
                margin-top: 2px;
            }
            .signatures-table {
                width: 100%;
                border-top: 1px solid #e2e8f0;
                padding-top: 5px;
                margin-top: 5px;
            }
            .sig-line {
                border-top: 1px solid #94a3b8;
                margin-top: 12px;
                padding-top: 2px;
                font-size: 7px;
                color: #64748b;
                text-transform: uppercase;
                text-align: center;
                font-weight: bold;
            }
            .officer-name {
                font-size: 8px;
                font-weight: 900;
                color: #0f172a;
            }
            .officer-title {
                font-size: 6px;
                color: #94a3b8;
                text-transform: uppercase;
            }
            .details-list {
                border-top: 1px solid #e2e8f0;
                padding-top: 5px;
                margin-top: 5px;
            }
            .detail-row {
                width: 100%;
                margin-bottom: 2px;
            }
            .detail-lbl {
                font-size: 7px;
                color: #94a3b8;
                text-transform: uppercase;
                float: left;
            }
            .detail-val {
                font-size: 7px;
                font-weight: bold;
                color: #334155;
                float: right;
            }
            .hash-value {
                font-family: monospace;
                font-size: 5px;
                color: #94a3b8;
                word-break: break-all;
                margin-top: 2px;
            }
            .back-footer {
                border-top: 1px solid #e2e8f0;
                padding-top: 5px;
                margin-top: 5px;
                font-size: 6px;
                color: #94a3b8;
                text-align: center;
                font-style: italic;
                line-height: 1.2;
            }
            .print-guide {
                font-size: 8px;
                color: #94a3b8;
                text-align: center;
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="page-container">
            <!-- FRONT CARD -->
            <div class="card-wrapper">
                <div class="header-table">
                    <table style="width: 100%; border: none; border-collapse: collapse;">
                        <tr>
                            <td style="width: 25px; vertical-align: middle;">
                                <img src="' . __DIR__ . '/../../../frontend/public/images/logo-light.png" style="width: 22px; height: 22px;" />
                            </td>
                            <td style="vertical-align: middle; padding-left: 5px; line-height: 1;">
                                <div class="header-title">Republic of the Philippines</div>
                                <div class="header-subtitle">Brgy. ' . htmlspecialchars($barangay_name) . '</div>
                                <div class="header-region">National Capital Region</div>
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="body-content">
                    <div class="avatar-container">
                        ' . ($avatarFile ? '<img src="' . $avatarFile . '" class="avatar-img" />' : '<div class="no-avatar">NO PHOTO</div>') . '
                    </div>
                    <div class="resident-name-label">Resident Name</div>
                    <div class="resident-name-value">' . htmlspecialchars($resDetails['last_name'] . ', ' . $resDetails['first_name'] . ' ' . $resDetails['middle_name']) . '</div>
                </div>

                <table class="meta-grid" style="width: 100%;">
                    <tr>
                        <td style="width: 50%;">
                            <div class="meta-label">Purok / Area</div>
                            <div class="meta-value">' . htmlspecialchars($resDetails['purok']) . '</div>
                        </td>
                        <td style="width: 50%; text-align: right;">
                            <div class="meta-label">Expiration</div>
                            <div class="meta-value" style="color: #dc2626;">' . date('F d, Y', strtotime($resDetails['digital_id_expires_at'])) . '</div>
                        </td>
                    </tr>
                </table>

                <div class="id-tag">
                    ID NO: ' . htmlspecialchars($resDetails['barangay_id_no']) . '
                </div>
            </div>

            <div class="print-guide">✂️ CUT HERE & FOLD MIDDLE TO LAMINATE BACK-TO-BACK</div>

            <!-- BACK CARD -->
            <div class="card-wrapper">
                <div class="back-title">Terms & Verification</div>
                
                <div class="cert-text">
                    This certifies that the bearer whose name, photo, and signature appear on this card is a registered resident of Barangay ' . htmlspecialchars($barangay_name) . '.
                </div>

                <div class="qr-container">
                    ' . ($qrBase64 ? '<img src="' . $qrBase64 . '" class="qr-img" />' : '<div style="font-size: 6px; color: #cbd5e1;">NO QR</div>') . '
                    <div class="qr-label">Scan code to verify ID authenticity</div>
                </div>

                <table class="signatures-table">
                    <tr>
                        <td style="width: 50%; padding-right: 5px; vertical-align: bottom;">
                            <div class="sig-line">Resident Signature</div>
                        </td>
                        <td style="width: 50%; padding-left: 5px; text-align: center; vertical-align: bottom;">
                            <div class="officer-name">' . htmlspecialchars($chairman_name) . '</div>
                            <div class="officer-title">Barangay Captain</div>
                            <div class="sig-line" style="margin-top: 2px;">Authorized Officer</div>
                        </td>
                    </tr>
                </table>

                <table class="details-list" style="width: 100%;">
                    <tr>
                        <td style="font-size: 7px; color: #94a3b8; text-transform: uppercase;">Issued Date:</td>
                        <td style="font-size: 7px; font-weight: bold; color: #334155; text-align: right;">' . date('F d, Y', strtotime($resDetails['digital_id_issued_at'])) . '</td>
                    </tr>
                    <tr>
                        <td style="font-size: 7px; color: #94a3b8; text-transform: uppercase;">Emergency Contact:</td>
                        <td style="font-size: 7px; font-weight: bold; color: #334155; text-align: right;">' . htmlspecialchars($barangay_contact) . '</td>
                    </tr>
                </table>
                
                <div class="hash-value">HASH: ' . htmlspecialchars($resDetails['digital_id_secure_hash']) . '</div>

                <div class="back-footer">
                    If found, please return to: Barangay Hall, ' . htmlspecialchars($barangay_address) . '.
                </div>
            </div>
        </div>
    </body>
    </html>
    ';

    $mpdf = new \Mpdf\Mpdf([
        'margin_left' => 15,
        'margin_right' => 15,
        'margin_top' => 10,
        'margin_bottom' => 10,
        'format' => 'Letter',
        'orientation' => 'P'
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
