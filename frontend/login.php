<?php
// Turn off all error reporting to avoid any output
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Only POST requests allowed');
    }

    $input = file_get_contents('php://input');
    if (empty($input)) {
        throw new Exception('No data received');
    }

    $data = json_decode($input, true);
    if ($data === null) {
        throw new Exception('Invalid JSON data');
    }

    $email = trim($data['email'] ?? '');
    $password = trim($data['password'] ?? '');
    $user_type = $data['user_type'] ?? 'user';
    $interests = $data['interests'] ?? [];
    $budget = $data['budget'] ?? '';

    if (empty($email) || empty($password)) {
        throw new Exception('Email and password required');
    }

    require_once 'config.php';
    
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        throw new Exception('Database connection failed');
    }

    $query = "SELECT * FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        throw new Exception('User not found');
    }

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($password !== $user['password']) {
        throw new Exception('Invalid password');
    }

    // Update preferences without the problematic json_encode in bindParam
    if (!empty($interests)) {
        $interests_json = json_encode($interests);
        $update_query = "UPDATE users SET interests = :interests, budget_range = :budget WHERE id = :id";
        $update_stmt = $db->prepare($update_query);
        $update_stmt->bindParam(':interests', $interests_json);
        $update_stmt->bindParam(':budget', $budget);
        $update_stmt->bindParam(':id', $user['id']);
        $update_stmt->execute();
    }

    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['user_type'] = $user['user_type'];
    $_SESSION['logged_in'] = true;

    echo json_encode([
        'success' => true,
        'message' => 'Login successful!',
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'user_type' => $user['user_type']
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>