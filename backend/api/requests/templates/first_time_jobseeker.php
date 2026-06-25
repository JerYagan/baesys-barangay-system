<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #1e293b;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }
        .border-container {
            border: 4px double #334155;
            padding: 25px;
            height: 90%;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #475569;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .header h3 {
            margin: 0;
            font-size: 14px;
            font-weight: normal;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #64748b;
        }
        .header h2 {
            margin: 4px 0;
            font-size: 18px;
            font-weight: bold;
            color: #0f172a;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .title-container {
            text-align: center;
            margin: 25px 0;
        }
        .title {
            font-size: 18px;
            font-weight: 800;
            text-transform: uppercase;
            color: #1e3a8a;
            border-bottom: 2px solid #1e3a8a;
            display: inline-block;
            padding-bottom: 4px;
            letter-spacing: 1px;
        }
        .content {
            font-size: 14px;
            text-align: justify;
            margin-bottom: 25px;
            text-indent: 40px;
        }
        .highlight {
            font-weight: bold;
            color: #0f172a;
        }
        .footer-section {
            margin-top: 40px;
        }
        .seal-box {
            float: left;
            width: 140px;
            height: 140px;
            border: 1px dashed #cbd5e1;
            border-radius: 50%;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            padding-top: 60px;
            margin-top: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .signature-box {
            float: right;
            width: 240px;
            text-align: center;
            margin-top: 20px;
        }
        .signature-line {
            border-top: 1px solid #0f172a;
            margin-top: 40px;
            padding-top: 5px;
        }
        .officer-name {
            font-weight: bold;
            text-transform: uppercase;
            color: #0f172a;
            font-size: 13px;
        }
        .officer-title {
            font-size: 11px;
            color: #64748b;
        }
        .meta-info {
            margin-top: 45px;
            font-size: 10px;
            color: #64748b;
            line-height: 1.6;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
        }
    </style>
</head>
<body>
    <div class="border-container">
        <!-- Header -->
        <div class="header">
            <h3>Republic of the Philippines</h3>
            <h3>National Capital Region</h3>
            <h2>QUEZON CITY</h2>
            <h1>BARANGAY <?php echo htmlspecialchars($barangay_name); ?></h1>
            <div style="font-size: 11px; color: #64748b; margin-top: 5px;">
                <?php echo htmlspecialchars($barangay_address); ?> | Tel: <?php echo htmlspecialchars($barangay_contact); ?>
            </div>
        </div>

        <!-- Title -->
        <div class="title-container">
            <span class="title">First Time Job Seeker Certification</span><br>
            <span style="font-size: 11px; font-weight: bold; color: #64748b;">(Republic Act No. 11261)</span>
        </div>

        <div style="font-size: 13px; margin-bottom: 15px;">
            <strong>TO WHOM IT MAY CONCERN:</strong>
        </div>

        <!-- Body -->
        <div class="content">
            This is to certify that <span class="highlight"><?php echo htmlspecialchars($resident_name); ?></span>, 
            <?php echo htmlspecialchars($age); ?> years old, <?php echo htmlspecialchars($sex); ?>, 
            and with a civil status of <span class="highlight"><?php echo htmlspecialchars($civil_status); ?></span>, 
            is a bonafide resident of <span class="highlight"><?php echo htmlspecialchars($purok); ?>, <?php echo htmlspecialchars($address); ?></span>, 
            Barangay <?php echo htmlspecialchars($barangay_name); ?>.
        </div>

        <div class="content">
            This is to certify further that the above-named resident is a <span class="highlight">first-time job seeker</span> 
            actively seeking employment, and is qualified to avail of the benefits, privileges, and exemptions from fees and charges 
            as provided under <span class="highlight">Republic Act No. 11261</span>, otherwise known as the "First Time Jobseekers Assistance Act".
        </div>

        <div class="content">
            By signing below, the applicant pledges that they will use this certification solely for the purpose of seeking 
            employment for the first time, and that any violation or misuse will forfeit their right to avail of these privileges.
        </div>

        <div class="content">
            Issued this <span class="highlight"><?php echo htmlspecialchars($date_issued); ?></span> at the Office of the Barangay Chairperson, 
            Barangay <?php echo htmlspecialchars($barangay_name); ?>.
        </div>

        <!-- Pledge & Signatures -->
        <div class="footer-section">
            <div style="float: left; width: 220px; font-size: 11px; margin-top: 20px;">
                <div style="height: 35px; border-bottom: 1px solid #94a3b8; width: 100%;"></div>
                <div style="text-align: center; margin-top: 4px; font-weight: bold;">Applicant's Signature</div>
                <div style="margin-top: 15px;">
                    Date: _________________<br>
                    Thumbprint: [ L ] [ R ]
                </div>
            </div>

            <div class="signature-box">
                <div class="officer-name"><?php echo htmlspecialchars($chairman_name); ?></div>
                <div class="officer-title">Barangay Chairperson</div>
                <div class="signature-line"></div>
                <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Signature over Printed Name</div>
            </div>
            <div style="clear: both;"></div>
        </div>

        <!-- Receipt / Meta info -->
        <div class="meta-info">
            <table style="width: 100%; border: none;">
                <tr>
                    <td style="width: 60%;">
                        <strong>O.R. Number:</strong> Exempted (RA 11261)<br>
                        <strong>Amount Paid:</strong> PHP 0.00 (Exempted)<br>
                        <strong>Document Purpose:</strong> <?php echo htmlspecialchars($purpose); ?>
                    </td>
                    <td style="text-align: right; vertical-align: bottom;">
                        * Valid for one (1) year from date of issue.
                    </td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>
