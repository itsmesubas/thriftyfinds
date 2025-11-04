<?php
header('Content-Type: text/plain');

$host = 'localhost';
$dbname = 'thriftyfinds';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    echo "Database connected successfully!\n";
    
    // Check tables
    $tables = $conn->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables: " . implode(', ', $tables) . "\n";
    
    // Check users
    $users = $conn->query("SELECT COUNT(*) as count FROM users")->fetch(PDO::FETCH_ASSOC);
    echo "Users in database: " . $users['count'] . "\n";
    
} catch(PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
}
?>