<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception('Database connection failed');
    }

    $brand = $_GET['brand'] ?? '';
    $category = $_GET['category'] ?? '';
    $search = $_GET['search'] ?? '';
    
    // Build query to get only active products
    $query = "SELECT p.*, u.email as seller_email 
              FROM products p 
              JOIN users u ON p.seller_id = u.id 
              WHERE p.status = 'active'";
    
    $params = [];
    
    if (!empty($brand) && $brand !== 'all') {
        $query .= " AND p.brand = ?";
        $params[] = $brand;
    }
    
    if (!empty($category) && $category !== 'all') {
        $query .= " AND p.category = ?";
        $params[] = $category;
    }
    
    if (!empty($search)) {
        $query .= " AND (p.title LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }
    
    $query .= " ORDER BY p.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'products' => $products,
        'total' => count($products)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>