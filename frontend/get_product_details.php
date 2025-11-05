<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

$product_id = $_GET['product_id'] ?? 0;

if ($product_id <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid product ID']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception('Database connection failed');
    }

    // Get product details with seller information
    $query = "
        SELECT 
            p.*,
            u.email as seller_email,
            u.phone as seller_phone,
            u.shop_name,
            u.address as seller_address
        FROM products p
        JOIN users u ON p.seller_id = u.id
        WHERE p.id = ?
    ";
    
    $stmt = $db->prepare($query);
    $stmt->execute([$product_id]);
    
    if ($stmt->rowCount() === 0) {
        echo json_encode(['success' => false, 'message' => 'Product not found']);
        exit;
    }
    
    $product = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Format the response
    $response = [
        'success' => true,
        'product' => [
            'id' => $product['id'],
            'title' => $product['title'],
            'description' => $product['description'] ?: 'No description available.',
            'price' => (float)$product['price'],
            'brand' => $product['brand'],
            'category' => $product['category'],
            'image_url' => $product['image_url'],
            'rating' => (float)$product['rating'],
            'condition' => $product['condition'] ?: 'good',
            'used_duration' => $product['used_duration'] ?: 'Not specified',
            'original_price' => $product['original_price'] ? (float)$product['original_price'] : null,
            'warranty_remaining' => $product['warranty_remaining'] ?: 'No warranty',
            'accessories_included' => $product['accessories_included'] ?: 'Charger, Original Box',
            'seller' => [
                'email' => $product['seller_email'],
                'phone' => $product['seller_phone'] ?: 'Not provided',
                'shop_name' => $product['shop_name'] ?: 'Individual Seller',
                'address' => $product['seller_address'] ?: 'Location not specified'
            ]
        ]
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>