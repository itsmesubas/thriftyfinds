<?php
require_once 'config.php';

function registerUser($email, $password, $userType, $interests = null, $budget = null) {
    global $pdo;
    
    // Validate input
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return ['success' => false, 'message' => 'Invalid email format'];
    }
    
    if (strlen($password) < 8) {
        return ['success' => false, 'message' => 'Password must be at least 8 characters'];
    }

    // Check if email exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->rowCount() > 0) {
        return ['success' => false, 'message' => 'Email already exists'];
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert user
    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("INSERT INTO users (email, password, user_type) VALUES (?, ?, ?)");
        $stmt->execute([$email, $hashedPassword, $userType]);
        $userId = $pdo->lastInsertId();
        
        // For regular users, save preferences
        if ($userType === 'user' && $interests && $budget) {
            $stmt = $pdo->prepare("INSERT INTO user_preferences (user_id, interests, budget_range) VALUES (?, ?, ?)");
            $stmt->execute([$userId, json_encode($interests), $budget]);
        }
        
        $pdo->commit();
        
        return ['success' => true, 'user_id' => $userId];
    } catch(PDOException $e) {
        $pdo->rollBack();
        return ['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()];
    }
}

function loginUser($email, $password) {
    global $pdo;
    
    // Get user by email
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || !password_verify($password, $user['password'])) {
        return ['success' => false, 'message' => 'Invalid email or password'];
    }
    
    // Get preferences for users
    $preferences = null;
    if ($user['user_type'] === 'user') {
        $stmt = $pdo->prepare("SELECT interests, budget_range FROM user_preferences WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $preferences = $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    // Create session
    $_SESSION['user'] = [
        'id' => $user['id'],
        'email' => $user['email'],
        'user_type' => $user['user_type'],
        'preferences' => $preferences
    ];
    
    return ['success' => true, 'user' => $_SESSION['user']];
}

function isLoggedIn() {
    return isset($_SESSION['user']);
}

function logout() {
    session_unset();
    session_destroy();
}

function getUserPrefs($userId) {
    global $pdo;
    
    $stmt = $pdo->prepare("SELECT interests, budget_range FROM user_preferences WHERE user_id = ?");
    $stmt->execute([$userId]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}
?>