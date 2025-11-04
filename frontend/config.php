<?php
class Database {
    private $host = "localhost";
    private $db_name = "thriftyfinds";
    private $username = "root";  // Change if different
    private $password = "";      // Change if you have a password
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            error_log("Database connected successfully");
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }
}

// Start session in config to ensure it's available everywhere
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
?>