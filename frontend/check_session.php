<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

session_start();

if (isset($_SESSION['user_id']) && isset($_SESSION['email']) && isset($_SESSION['user_type'])) {
    echo json_encode([
        'success' => true,
        'email' => $_SESSION['email'],
        'user_type' => $_SESSION['user_type'],
        'user_id' => $_SESSION['user_id']
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'No active session'
    ]);
}
?>