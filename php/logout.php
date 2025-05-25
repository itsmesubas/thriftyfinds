<?php
require_once 'auth_functions.php';

header('Content-Type: application/json');

logout();
echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
?>