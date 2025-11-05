<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

session_start();
require_once 'config.php';

// Check if user is logged in
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'user') {
    echo json_encode(['success' => false, 'message' => 'Please login first']);
    exit;
}

$user_id = $_SESSION['user_id'];
$input = json_decode(file_get_contents('php://input'), true);

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception('Database connection failed');
    }

    $product_id = $input['product_id'] ?? null;
    $product_title = $input['product_title'] ?? '';
    $total_amount = $input['total_amount'] ?? 0;
    $quantity = $input['quantity'] ?? 1;
    $payment_method = $input['payment_method'] ?? 'esewa';
    $shipping_details = $input['shipping_details'] ?? [];

    // Get seller_id from product
    $seller_stmt = $db->prepare("SELECT seller_id FROM products WHERE id = ?");
    $seller_stmt->execute([$product_id]);
    $product = $seller_stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$product) {
        // For demo, use a default seller
        $seller_id = 2; // seller@example.com
    } else {
        $seller_id = $product['seller_id'];
    }

    // Create order
    $stmt = $db->prepare("
        INSERT INTO orders 
        (user_id, seller_id, product_id, quantity, total_amount, payment_method, payment_status, 
         customer_name, customer_email, customer_phone, shipping_address) 
        VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
    ");

    $success = $stmt->execute([
        $user_id,
        $seller_id,
        $product_id,
        $quantity,
        $total_amount,
        $payment_method,
        $shipping_details['name'] ?? '',
        $shipping_details['email'] ?? '',
        $shipping_details['phone'] ?? '',
        $shipping_details['address'] ?? ''
    ]);

    if ($success) {
        $order_id = $db->lastInsertId();
        echo json_encode([
            'success' => true,
            'order_id' => $order_id,
            'message' => 'Order created successfully'
        ]);
    } else {
        throw new Exception('Failed to create order');
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>