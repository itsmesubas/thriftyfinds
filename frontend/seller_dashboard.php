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

// Check if user is logged in as seller
if (!isset($_SESSION['user_id']) || $_SESSION['user_type'] !== 'seller') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized access']);
    exit;
}

$seller_id = $_SESSION['user_id'];
$action = $_GET['action'] ?? '';

// Log the action for debugging
error_log("Seller Dashboard Action: " . $action);

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception('Database connection failed');
    }

    switch ($action) {
        case 'get_stats':
            getSellerStats($db, $seller_id);
            break;
            
        case 'get_products':
            getSellerProducts($db, $seller_id);
            break;
            
        case 'add_product':
            addSellerProduct($db, $seller_id);
            break;
            
        case 'delete_product':
            deleteSellerProduct($db, $seller_id);
            break;
            
        case 'get_orders':
            getSellerOrders($db, $seller_id);
            break;
            
        case 'get_product':
            getSellerProduct($db, $seller_id);
            break;
            
        case 'update_product':
            updateSellerProduct($db, $seller_id);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid action: ' . $action]);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

function getSellerStats($db, $seller_id) {
    // Get total products (real count)
    $stmt = $db->prepare("SELECT COUNT(*) as total_products FROM products WHERE seller_id = ?");
    $stmt->execute([$seller_id]);
    $total_products = $stmt->fetchColumn();

    // Get total orders and revenue (real data)
    $stmt = $db->prepare("
        SELECT 
            COUNT(DISTINCT o.id) as total_orders,
            COALESCE(SUM(o.total_amount), 0) as total_revenue,
            COALESCE(AVG(r.rating), 0) as average_rating
        FROM orders o 
        LEFT JOIN reviews r ON o.id = r.order_id 
        WHERE o.seller_id = ? AND o.status != 'cancelled'
    ");
    $stmt->execute([$seller_id]);
    $order_stats = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get weekly sales (last 7 days)
    $stmt = $db->prepare("
        SELECT COUNT(*) as weekly_sales 
        FROM orders 
        WHERE seller_id = ? 
        AND status != 'cancelled'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    ");
    $stmt->execute([$seller_id]);
    $weekly_sales = $stmt->fetchColumn();

    // Get monthly sales (last 30 days)
    $stmt = $db->prepare("
        SELECT COUNT(*) as monthly_sales 
        FROM orders 
        WHERE seller_id = ? 
        AND status != 'cancelled'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    ");
    $stmt->execute([$seller_id]);
    $monthly_sales = $stmt->fetchColumn();

    // Get product views (real count)
    $stmt = $db->prepare("
        SELECT COUNT(*) as product_views 
        FROM product_views pv 
        JOIN products p ON pv.product_id = p.id 
        WHERE p.seller_id = ?
    ");
    $stmt->execute([$seller_id]);
    $product_views = $stmt->fetchColumn();

    // Calculate conversion rate (orders / product views)
    $conversion_rate = 0;
    if ($product_views > 0) {
        $conversion_rate = round(($order_stats['total_orders'] / $product_views) * 100, 1);
    }

    $stats = [
        'total_products' => (int)$total_products,
        'total_orders' => (int)$order_stats['total_orders'],
        'total_revenue' => (float)$order_stats['total_revenue'],
        'average_rating' => round((float)$order_stats['average_rating'], 1),
        'weekly_sales' => (int)$weekly_sales,
        'monthly_sales' => (int)$monthly_sales,
        'product_views' => (int)$product_views,
        'conversion_rate' => $conversion_rate
    ];
    
    echo json_encode(['success' => true, 'stats' => $stats]);
}

function getSellerProducts($db, $seller_id) {
    $stmt = $db->prepare("SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC");
    $stmt->execute([$seller_id]);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'products' => $products]);
}

function addSellerProduct($db, $seller_id) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $title = $input['title'] ?? '';
    $brand = $input['brand'] ?? '';
    $price = $input['price'] ?? 0;
    $category = $input['category'] ?? '';
    $description = $input['description'] ?? '';
    $image_url = $input['image_url'] ?? '';
    
    if (empty($title) || empty($brand) || $price <= 0) {
        echo json_encode(['success' => false, 'message' => 'Please fill all required fields']);
        return;
    }
    
    // Check if seller_id column exists, if not add it
    try {
        $check_stmt = $db->query("SHOW COLUMNS FROM products LIKE 'seller_id'");
        if ($check_stmt->rowCount() == 0) {
            $db->exec("ALTER TABLE products ADD COLUMN seller_id INT AFTER id");
        }
    } catch (Exception $e) {
        // Column might already exist
    }
    
    $stmt = $db->prepare("INSERT INTO products (seller_id, title, description, price, brand, category, image_url, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    
    // Set a default rating of 4.0 for new products
    $default_rating = 4.0;
    
    $success = $stmt->execute([
        $seller_id,
        $title,
        $description,
        $price,
        $brand,
        $category,
        $image_url,
        $default_rating
    ]);
    
    if ($success) {
        echo json_encode(['success' => true, 'message' => 'Product added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add product']);
    }
}

function deleteSellerProduct($db, $seller_id) {
    $input = json_decode(file_get_contents('php://input'), true);
    $product_id = $input['product_id'] ?? 0;
    
    if ($product_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid product ID']);
        return;
    }
    
    $stmt = $db->prepare("DELETE FROM products WHERE id = ? AND seller_id = ?");
    $success = $stmt->execute([$product_id, $seller_id]);
    
    if ($success && $stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Product deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Product not found or unauthorized']);
    }
}

function getSellerOrders($db, $seller_id) {
    $stmt = $db->prepare("
        SELECT o.*, p.title as product_title 
        FROM orders o 
        JOIN products p ON o.product_id = p.id 
        WHERE o.seller_id = ? 
        ORDER BY o.created_at DESC 
        LIMIT 10
    ");
    $stmt->execute([$seller_id]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'orders' => $orders]);
}

// Get single product for editing
function getSellerProduct($db, $seller_id) {
    $product_id = $_GET['product_id'] ?? 0;
    
    error_log("Getting product details - Product ID: " . $product_id . ", Seller ID: " . $seller_id);
    
    if ($product_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid product ID']);
        return;
    }
    
    $stmt = $db->prepare("SELECT * FROM products WHERE id = ? AND seller_id = ?");
    $stmt->execute([$product_id, $seller_id]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($product) {
        echo json_encode(['success' => true, 'product' => $product]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Product not found or unauthorized']);
    }
}

// Update seller product
function updateSellerProduct($db, $seller_id) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $product_id = $input['product_id'] ?? 0;
    $title = $input['title'] ?? '';
    $brand = $input['brand'] ?? '';
    $price = $input['price'] ?? 0;
    $category = $input['category'] ?? '';
    $description = $input['description'] ?? '';
    $image_url = $input['image_url'] ?? '';
    $status = $input['status'] ?? 'active';
    
    error_log("Updating product - Product ID: " . $product_id . ", Seller ID: " . $seller_id);
    
    if ($product_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid product ID']);
        return;
    }
    
    if (empty($title) || empty($brand) || $price <= 0) {
        echo json_encode(['success' => false, 'message' => 'Please fill all required fields']);
        return;
    }
    
    // First check if product belongs to this seller
    $check_stmt = $db->prepare("SELECT id FROM products WHERE id = ? AND seller_id = ?");
    $check_stmt->execute([$product_id, $seller_id]);
    
    if ($check_stmt->rowCount() === 0) {
        echo json_encode(['success' => false, 'message' => 'Product not found or unauthorized']);
        return;
    }
    
    // Update the product
    $stmt = $db->prepare("
        UPDATE products 
        SET title = ?, description = ?, price = ?, brand = ?, category = ?, image_url = ?, status = ?
        WHERE id = ? AND seller_id = ?
    ");
    
    $success = $stmt->execute([
        $title,
        $description,
        $price,
        $brand,
        $category,
        $image_url,
        $status,
        $product_id,
        $seller_id
    ]);
    
    if ($success) {
        echo json_encode(['success' => true, 'message' => 'Product updated successfully']);
    } else {
        $error = $stmt->errorInfo();
        error_log("Database error: " . $error[2]);
        echo json_encode(['success' => false, 'message' => 'Failed to update product: ' . $error[2]]);
    }
}
?>