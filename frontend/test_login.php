<?php
header('Content-Type: application/json');

// Test the login logic directly
$test_email = "user@example.com";
$test_password = "password123";

require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

$query = "SELECT * FROM users WHERE email = :email";
$stmt = $db->prepare($query);
$stmt->bindParam(':email', $test_email);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "Testing login:\n";
    echo "Input password: '$test_password'\n";
    echo "DB password: '{$user['password']}'\n";
    echo "Match: " . ($test_password === $user['password'] ? 'YES' : 'NO') . "\n";
    
    if ($test_password === $user['password']) {
        echo "SUCCESS: Password matches!\n";
    } else {
        echo "FAIL: Password doesn't match!\n";
    }
} else {
    echo "User not found!\n";
}
?>