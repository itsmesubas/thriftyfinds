<?php
header('Content-Type: application/json');

// Simple test - always return success
echo json_encode([
    'success' => true, 
    'message' => 'Test login successful'
]);
?>