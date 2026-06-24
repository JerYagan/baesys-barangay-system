<?php
/**
 * Baesys — JWT Authentication Middleware
 * 
 * Include this file in any protected endpoint.
 * It validates the JWT from the Authorization header and returns the decoded user data.
 * 
 * Usage:
 *   require_once __DIR__ . '/../../middleware/auth.php';
 *   $user = authenticate(); // Returns user data or sends 401 and exits
 */

require_once __DIR__ . '/../config/db.php';

// JWT Secret — in production, move this to an environment variable
define('JWT_SECRET', 'baesys_jwt_secret_key_change_in_production_2024');
define('JWT_ALGORITHM', 'HS256');
define('JWT_EXPIRY', 86400); // 24 hours in seconds

/**
 * Base64url encode
 */
function base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

/**
 * Base64url decode
 */
function base64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

/**
 * Generate a JWT token for a user.
 */
function generateJWT(array $user): string {
    $header = json_encode([
        'typ' => 'JWT',
        'alg' => JWT_ALGORITHM
    ]);

    $payload = json_encode([
        'iss' => 'baesys',
        'iat' => time(),
        'exp' => time() + JWT_EXPIRY,
        'sub' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name']
    ]);

    $base64Header = base64url_encode($header);
    $base64Payload = base64url_encode($payload);

    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    $base64Signature = base64url_encode($signature);

    return "$base64Header.$base64Payload.$base64Signature";
}

/**
 * Verify and decode a JWT token.
 * Returns the payload as an associative array, or null if invalid.
 */
function verifyJWT(string $token): ?array {
    $parts = explode('.', $token);
    
    if (count($parts) !== 3) {
        return null;
    }

    [$base64Header, $base64Payload, $base64Signature] = $parts;

    // Verify signature
    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    $expectedSignature = base64url_encode($signature);

    if (!hash_equals($expectedSignature, $base64Signature)) {
        return null;
    }

    // Decode payload
    $payload = json_decode(base64url_decode($base64Payload), true);

    if (!$payload) {
        return null;
    }

    // Check expiry
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return null;
    }

    return $payload;
}

/**
 * Authenticate the current request.
 * Extracts the JWT from the Authorization header, validates it,
 * and returns the user data.
 * 
 * Sends a 401 response and exits if authentication fails.
 * 
 * @param string|null $requiredRole  Optional role to enforce (e.g., 'admin', 'staff')
 * @return array  The decoded JWT payload (user data)
 */
function authenticate(?string $requiredRole = null): array {
    // Get the Authorization header
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    $token = '';
    if (!empty($authHeader) && str_starts_with($authHeader, 'Bearer ')) {
        $token = substr($authHeader, 7);
    } elseif (!empty($_GET['token'])) {
        $token = $_GET['token'];
    }

    if (empty($token)) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Authentication required. No valid token provided.'
        ]);
        exit;
    }

    $payload = verifyJWT($token);

    if (!$payload) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid or expired token. Please log in again.'
        ]);
        exit;
    }

    // Check role if required
    if ($requiredRole !== null) {
        $userRole = $payload['role'] ?? '';
        
        // Admin has access to everything
        if ($userRole !== 'admin' && $userRole !== $requiredRole) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'message' => 'Access denied. Insufficient permissions.'
            ]);
            exit;
        }
    }

    return $payload;
}

/**
 * Check if the authenticated user has one of the allowed roles.
 * 
 * @param array $payload  The decoded JWT payload
 * @param array $allowedRoles  Array of allowed roles (e.g., ['admin', 'staff'])
 */
function requireRole(array $payload, array $allowedRoles): void {
    $userRole = $payload['role'] ?? '';

    if (!in_array($userRole, $allowedRoles)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Access denied. This action requires one of: ' . implode(', ', $allowedRoles)
        ]);
        exit;
    }
}
