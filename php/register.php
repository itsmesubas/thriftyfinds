<?php
require_once 'auth_functions.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$userType = $data['user_type'] ?? 'user';
$interests = $data['interests'] ?? null;
$budget = $data['budget'] ?? null;

$result = registerUser($email, $password, $userType, $interests, $budget);

if ($result['success']) {
    echo json_encode(['success' => true, 'user_id' => $result['user_id']]);
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $result['message']]);
}
?>