<?php
$host = 'localhost';
$dbname = 'thriftyfinds';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    echo "Database connected successfully!";
    
    // Test if users table exists
    $stmt = $conn->query("SELECT COUNT(*) FROM users");
    $count = $stmt->fetchColumn();
    echo "Users in database: " . $count;
    
} catch(PDOException $e) {
    echo "Database error: " . $e->getMessage();
}
?>