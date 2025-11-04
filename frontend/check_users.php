<?php
header('Content-Type: text/plain');

$host = 'localhost';
$dbname = 'thriftyfinds';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    echo "=== DATABASE USERS ===\n\n";
    
    // Get all users
    $stmt = $conn->query("SELECT id, email, password, user_type FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach($users as $user) {
        echo "ID: " . $user['id'] . "\n";
        echo "Email: " . $user['email'] . "\n";
        echo "Password: " . $user['password'] . "\n";
        echo "Type: " . $user['user_type'] . "\n";
        echo "---\n";
    }
    
    if (empty($users)) {
        echo "No users found in database!\n";
    }
    
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>