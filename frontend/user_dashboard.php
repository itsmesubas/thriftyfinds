<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

session_start();
require_once 'config.php';

// Check if user is logged in
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'user') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

$user_id = $_SESSION['user_id'];
$action = $_GET['action'] ?? '';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception('Database connection failed');
    }

    switch ($action) {
      
        case 'get_stats':
            getUserStats($db, $user_id);
            break;
            
        case 'get_orders':
            getUserOrders($db, $user_id);
            break;
            
       
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}




function getUserStats($db, $user_id) {
    // Get total orders
    $stmt = $db->prepare("SELECT COUNT(*) as total_orders FROM orders WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $total_orders = $stmt->fetchColumn();

    // Get pending orders
    $stmt = $db->prepare("SELECT COUNT(*) as pending_orders FROM orders WHERE user_id = ? AND status IN ('pending', 'confirmed', 'shipped')");
    $stmt->execute([$user_id]);
    $pending_orders = $stmt->fetchColumn();

    // Get total spent
    $stmt = $db->prepare("SELECT COALESCE(SUM(total_amount), 0) as total_spent FROM orders WHERE user_id = ? AND status != 'cancelled'");
    $stmt->execute([$user_id]);
    $total_spent = $stmt->fetchColumn();

    

    $stats = [
        'total_orders' => (int)$total_orders,
        'pending_orders' => (int)$pending_orders,
        'total_spent' => (float)$total_spent,
        
    ];
    
    echo json_encode(['success' => true, 'stats' => $stats]);
}

function getUserOrders($db, $user_id) {
    $stmt = $db->prepare("
        SELECT o.*, p.title as product_title, p.image_url 
        FROM orders o 
        JOIN products p ON o.product_id = p.id 
        WHERE o.user_id = ? 
        ORDER BY o.created_at DESC
    ");
    $stmt->execute([$user_id]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get order items for each order
    foreach ($orders as &$order) {
        $stmt = $db->prepare("
            SELECT oi.*, p.title as product_title, p.image_url 
            FROM order_items oi 
            JOIN products p ON oi.product_id = p.id 
            WHERE oi.order_id = ?
        ");
        $stmt->execute([$order['id']]);
        $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo json_encode(['success' => true, 'orders' => $orders]);
}




?>