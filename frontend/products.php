<?php
header('Content-Type: application/json');
require_once 'config.php';

$database = new Database();
$db = $database->getConnection();

try {
    $brand = $_GET['brand'] ?? '';
    
    $query = "SELECT * FROM products WHERE 1=1";
    
    if (!empty($brand) && $brand !== 'all') {
        $query .= " AND brand = :brand";
    }
    
    $stmt = $db->prepare($query);
    
    if (!empty($brand) && $brand !== 'all') {
        $stmt->bindParam(':brand', $brand);
    }
    
    $stmt->execute();
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'products' => $products
    ]);
    
} catch(PDOException $exception) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $exception->getMessage()
    ]);
}
?>