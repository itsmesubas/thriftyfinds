<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];
$database = new Database();
$db = $database->getConnection();

try {
    // Get user preferences
    $user_query = "SELECT interests, budget_range FROM users WHERE id = :user_id";
    $user_stmt = $db->prepare($user_query);
    $user_stmt->bindParam(':user_id', $user_id);
    $user_stmt->execute();
    $user = $user_stmt->fetch(PDO::FETCH_ASSOC);
    
    $interests = json_decode($user['interests'] ?? '[]', true);
    $budget_range = $user['budget_range'] ?? '';
    
    // Build recommendation query based on interests
    $product_query = "SELECT * FROM products WHERE 1=1";
    
    if (!empty($interests)) {
        $placeholders = implode(',', array_fill(0, count($interests), '?'));
        $product_query .= " AND brand IN ($placeholders)";
    }
    
    // Filter by budget if available
    if (!empty($budget_range)) {
        switch($budget_range) {
            case '0-20':
                $product_query .= " AND price <= 20";
                break;
            case '20-50':
                $product_query .= " AND price BETWEEN 20 AND 50";
                break;
            case '50-100':
                $product_query .= " AND price BETWEEN 50 AND 100";
                break;
            case '100+':
                $product_query .= " AND price >= 100";
                break;
        }
    }
    
    $product_query .= " ORDER BY rating DESC LIMIT 6";
    
    $product_stmt = $db->prepare($product_query);
    
    if (!empty($interests)) {
        $product_stmt->execute($interests);
    } else {
        $product_stmt->execute();
    }
    
    $recommendations = $product_stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'recommendations' => $recommendations
    ]);
    
} catch(PDOException $exception) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $exception->getMessage()
    ]);
}
?>