<?php
header('Content-Type: application/json');
// Enable CORS for development
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}
// Start session at the beginning
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Log the received data for debugging
    error_log("Received login data: " . print_r($data, true));
    
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $user_type = $data['user_type'] ?? 'user';
    $interests = $data['interests'] ?? [];
    $budget = $data['budget'] ?? '';
    
    error_log("Login attempt: $email, user_type: $user_type");
    
    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Email and password are required']);
        exit;
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    if ($db === null) {
        echo json_encode(['success' => false, 'message' => 'Database connection failed']);
        exit;
    }
    
    try {
        // Check if user exists
        $query = "SELECT * FROM users WHERE email = :email";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            error_log("User found: " . print_r($user, true));
            
            // Simple password verification (for demo purposes)
            // In production, use password_verify() with hashed passwords
            if ($password === $user['password']) {
                // Update user preferences if provided
                if (!empty($interests)) {
                    $update_query = "UPDATE users SET interests = :interests, budget_range = :budget WHERE id = :id";
                    $update_stmt = $db->prepare($update_query);
                    $update_stmt->bindParam(':interests', json_encode($interests));
                    $update_stmt->bindParam(':budget', $budget);
                    $update_stmt->bindParam(':id', $user['id']);
                    $update_stmt->execute();
                }
                
                // Set session variables
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['email'] = $user['email'];
                $_SESSION['user_type'] = $user['user_type'];
                $_SESSION['logged_in'] = true;
                
                error_log("Login successful for user: " . $user['email']);
                
                echo json_encode([
                    'success' => true, 
                    'message' => 'Login successful',
                    'user' => [
                        'id' => $user['id'],
                        'email' => $user['email'],
                        'user_type' => $user['user_type']
                    ]
                ]);
            } else {
                error_log("Password mismatch for user: $email");
                echo json_encode(['success' => false, 'message' => 'Invalid password']);
            }
        } else {
            // Auto-register new user (for demo purposes)
            error_log("User not found, creating new user: $email");
            $insert_query = "INSERT INTO users (email, password, user_type, interests, budget_range) 
                           VALUES (:email, :password, :user_type, :interests, :budget)";
            $insert_stmt = $db->prepare($insert_query);
            $insert_stmt->bindParam(':email', $email);
            $insert_stmt->bindParam(':password', $password);
            $insert_stmt->bindParam(':user_type', $user_type);
            $insert_stmt->bindParam(':interests', json_encode($interests));
            $insert_stmt->bindParam(':budget', $budget);
            
            if ($insert_stmt->execute()) {
                $new_user_id = $db->lastInsertId();
                
                $_SESSION['user_id'] = $new_user_id;
                $_SESSION['email'] = $email;
                $_SESSION['user_type'] = $user_type;
                $_SESSION['logged_in'] = true;
                
                echo json_encode([
                    'success' => true, 
                    'message' => 'Registration successful',
                    'user' => [
                        'id' => $new_user_id,
                        'email' => $email,
                        'user_type' => $user_type
                    ]
                ]);
            } else {
                $error_info = $insert_stmt->errorInfo();
                error_log("Registration failed: " . print_r($error_info, true));
                echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $error_info[2]]);
            }
        }
    } catch(PDOException $exception) {
        error_log("Database error: " . $exception->getMessage());
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $exception->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method. Expected POST.']);
}
?>