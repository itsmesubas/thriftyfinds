// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navbar = document.querySelector('.navbar');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navbar.classList.toggle('active');
        mobileMenuBtn.innerHTML = navbar.classList.contains('active') ? 
            '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });
}

// Tab functionality
document.querySelectorAll('.tab-header').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-header').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    });
});

// Check if seller is logged in
function checkSellerAuth() {
    console.log('Checking seller authentication...');
    
    // Check localStorage first (for immediate access)
    const sellerEmail = localStorage.getItem('seller_email');
    const userType = localStorage.getItem('user_type');
    
    console.log('LocalStorage - Email:', sellerEmail, 'Type:', userType);
    
    if (sellerEmail && userType === 'seller') {
        // Update UI with seller email
        const emailDisplay = document.getElementById('sellerEmailDisplay');
        if (emailDisplay) {
            emailDisplay.textContent = sellerEmail;
        }
        return true;
    }
    
    console.log('No seller found in localStorage, checking server session...');
    
    // If no localStorage, check with server session
    checkServerSession();
    return false;
}

// Check server session with seller info
async function checkServerSession() {
    try {
        const sellerEmail = localStorage.getItem('seller_email');
        
        const response = await fetch('check_session.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                seller_email: sellerEmail
            })
        });
        
        const data = await response.json();
        
        console.log('Session check response:', data);
        
        if (data.success && data.user_type === 'seller') {
            // Session exists, update localStorage
            localStorage.setItem('seller_email', data.email);
            localStorage.setItem('user_type', data.user_type);
            
            const emailDisplay = document.getElementById('sellerEmailDisplay');
            if (emailDisplay) {
                emailDisplay.textContent = data.email;
            }
            return true;
        } else {
            // No valid session, redirect to login
            console.log('No valid seller session, redirecting to login...');
            alert('Please login as seller first');
            window.location.href = 'index.html';
            return false;
        }
    } catch (error) {
        console.error('Error checking session:', error);
        alert('Please login as seller first');
        window.location.href = 'index.html';
        return false;
    }
}

// Load seller dashboard data
async function loadDashboardData() {
    console.log('Loading dashboard data...');
    
    if (!checkSellerAuth()) {
        console.log('Authentication failed, waiting for session check...');
        return;
    }

    try {
        // Show loading state
        showLoadingState(true);
        
        const response = await fetch('seller_dashboard.php?action=get_stats');
        const data = await response.json();
        
        console.log('Dashboard stats response:', data);
        
        if (data.success) {
            updateDashboardStats(data.stats);
            await loadSellerProducts();
            await loadSellerOrders();
        } else {
            console.error('Failed to load dashboard stats:', data.message);
            alert('Failed to load dashboard data: ' + data.message);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Error loading dashboard data: ' + error.message);
    } finally {
        // Hide loading state
        showLoadingState(false);
    }
}

// Show/hide loading state
function showLoadingState(show) {
    const statNumbers = document.querySelectorAll('.stat-number');
    const productList = document.getElementById('productsList');
    const ordersList = document.getElementById('ordersList');
    
    if (show) {
        // Show loading placeholders
        statNumbers.forEach(stat => {
            stat.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        });
        if (productList) productList.innerHTML = '<div class="loading">Loading products...</div>';
        if (ordersList) ordersList.innerHTML = '<div class="loading">Loading orders...</div>';
    }
}

// Update dashboard statistics
function updateDashboardStats(stats) {
    if (document.getElementById('totalProducts')) {
        document.getElementById('totalProducts').textContent = stats.total_products || 0;
    }
    if (document.getElementById('totalOrders')) {
        document.getElementById('totalOrders').textContent = stats.total_orders || 0;
    }
    if (document.getElementById('totalRevenue')) {
        document.getElementById('totalRevenue').textContent = '₹' + (stats.total_revenue || 0).toLocaleString();
    }
    if (document.getElementById('averageRating')) {
        document.getElementById('averageRating').textContent = stats.average_rating || '0.0';
    }
    if (document.getElementById('weeklySales')) {
        document.getElementById('weeklySales').textContent = stats.weekly_sales || 0;
    }
    if (document.getElementById('monthlySales')) {
        document.getElementById('monthlySales').textContent = stats.monthly_sales || 0;
    }
    if (document.getElementById('productViews')) {
        document.getElementById('productViews').textContent = stats.product_views || 0;
    }
    if (document.getElementById('conversionRate')) {
        document.getElementById('conversionRate').textContent = (stats.conversion_rate || 0) + '%';
    }
}

// Load seller products
async function loadSellerProducts() {
    try {
        const response = await fetch('seller_dashboard.php?action=get_products');
        const data = await response.json();
        
        console.log('Products response:', data);
        
        const productsList = document.getElementById('productsList');
        
        if (data.success && data.products && data.products.length > 0) {
            productsList.innerHTML = data.products.map(product => `
                <div class="product-item" data-product-id="${product.id}">
                    <img src="${product.image_url || 'images/placeholder.jpg'}" alt="${product.title}" class="product-thumbnail" onerror="this.src='images/placeholder.jpg'">
                    <div class="product-info">
                        <h4>${product.title}</h4>
                        <p>Brand: ${product.brand} | Category: ${product.category}</p>
                        <p class="product-price">₹${product.price ? product.price.toLocaleString() : '0'}</p>
                        <p class="product-status">Status: <span class="status-${product.status || 'active'}">${product.status || 'active'}</span></p>
                    </div>
                    <div class="product-rating">${'★'.repeat(Math.floor(product.rating || 0))}${'☆'.repeat(5-Math.floor(product.rating || 0))}</div>
                    <div class="product-actions">
                        <button class="btn btn-sm edit-product-btn" data-product-id="${product.id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-product-btn" data-product-id="${product.id}">Delete</button>
                    </div>
                </div>
            `).join('');

            // Add event listeners to the new buttons
            addProductEventListeners();
        } else {
            productsList.innerHTML = '<div class="no-products">No products found. Add your first product!</div>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Add event listeners to product action buttons
function addProductEventListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-product-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            console.log('Edit button clicked for product:', productId);
            editProduct(productId);
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-product-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            console.log('Delete button clicked for product:', productId);
            deleteProduct(productId);
        });
    });
}

// Load seller orders
async function loadSellerOrders() {
    try {
        const response = await fetch('seller_dashboard.php?action=get_orders');
        const data = await response.json();
        
        console.log('Orders response:', data);
        
        const ordersList = document.getElementById('ordersList');
        
        if (data.success && data.orders && data.orders.length > 0) {
            ordersList.innerHTML = data.orders.map(order => `
                <div class="order-item">
                    <div class="order-header">
                        <strong>Order #${order.id}</strong>
                        <span class="order-status status-${order.status}">${order.status}</span>
                    </div>
                    <p>Product: ${order.product_title}</p>
                    <p>Customer: ${order.customer_email}</p>
                    <p>Amount: ₹${order.amount ? order.amount.toLocaleString() : '0'} | Date: ${new Date(order.created_at).toLocaleDateString()}</p>
                </div>
            `).join('');
        } else {
            ordersList.innerHTML = '<div class="no-orders">No orders yet.</div>';
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Add product form submission
const addProductForm = document.getElementById('addProductForm');
if (addProductForm) {
    addProductForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('productTitle').value,
            brand: document.getElementById('productBrand').value,
            price: parseFloat(document.getElementById('productPrice').value),
            category: document.getElementById('productCategory').value,
            description: document.getElementById('productDescription').value,
            image_url: document.getElementById('productImage').value || 'images/placeholder.jpg'
        };

        console.log('Adding product:', formData);

        try {
            // Show loading
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
            submitBtn.disabled = true;

            const response = await fetch('seller_dashboard.php?action=add_product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            console.log('Add product response:', data);
            
            if (data.success) {
                alert('Product added successfully!');
                this.reset();
                
                // Reload all data to get updated stats
                await loadDashboardData();
                
                // Switch to products tab
                document.querySelector('[data-tab="products"]').click();
            } else {
                alert('Error adding product: ' + data.message);
            }
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Error adding product: ' + error.message);
        } finally {
            // Reset button
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.innerHTML = 'Add Product';
            submitBtn.disabled = false;
        }
    });
}

// EDIT PRODUCT FUNCTIONALITY

// Edit product - Show edit form
async function editProduct(productId) {
    console.log('Editing product:', productId);
    
    try {
        // Show loading
        showEditLoading(true);
        
        const response = await fetch(`seller_dashboard.php?action=get_product&product_id=${productId}`);
        const data = await response.json();
        
        console.log('Product data response:', data);
        
        if (data.success) {
            populateEditForm(data.product);
            openEditModal();
        } else {
            alert('Error loading product: ' + data.message);
        }
    } catch (error) {
        console.error('Error loading product:', error);
        alert('Error loading product details');
    } finally {
        showEditLoading(false);
    }
}

// Show/hide loading in edit form
function showEditLoading(show) {
    const submitBtn = document.querySelector('#editProductForm button[type="submit"]');
    if (submitBtn) {
        if (show) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            submitBtn.disabled = true;
        } else {
            submitBtn.innerHTML = 'Update Product';
            submitBtn.disabled = false;
        }
    }
}

// Populate edit form with product data
function populateEditForm(product) {
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductTitle').value = product.title || '';
    document.getElementById('editProductBrand').value = product.brand || '';
    document.getElementById('editProductPrice').value = product.price || '';
    document.getElementById('editProductCategory').value = product.category || 'mobile';
    document.getElementById('editProductDescription').value = product.description || '';
    document.getElementById('editProductImage').value = product.image_url || '';
    document.getElementById('editProductStatus').value = product.status || 'active';
}

// Open edit modal
function openEditModal() {
    const modal = document.getElementById('editProductModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        console.log('Edit modal opened');
    }
}

// Close edit modal
function closeEditModal() {
    const modal = document.getElementById('editProductModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        console.log('Edit modal closed');
    }
}

// Edit product form submission
const editProductForm = document.getElementById('editProductForm');
if (editProductForm) {
    editProductForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const productId = document.getElementById('editProductId').value;
        const formData = {
            product_id: productId,
            title: document.getElementById('editProductTitle').value,
            brand: document.getElementById('editProductBrand').value,
            price: parseFloat(document.getElementById('editProductPrice').value),
            category: document.getElementById('editProductCategory').value,
            description: document.getElementById('editProductDescription').value,
            image_url: document.getElementById('editProductImage').value || 'images/placeholder.jpg',
            status: document.getElementById('editProductStatus').value
        };

        console.log('Updating product:', formData);

        try {
            // Show loading
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            submitBtn.disabled = true;

            const response = await fetch('seller_dashboard.php?action=update_product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            console.log('Update product response:', data);
            
            if (data.success) {
                alert('Product updated successfully!');
                closeEditModal();
                loadSellerProducts(); // Refresh the products list
                loadDashboardData(); // Refresh stats
            } else {
                alert('Error updating product: ' + data.message);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Error updating product: ' + error.message);
        } finally {
            // Reset button
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.innerHTML = 'Update Product';
            submitBtn.disabled = false;
        }
    });
}

// Close modal when clicking X
const editModalClose = document.querySelector('#editProductModal .close-modal');
if (editModalClose) {
    editModalClose.addEventListener('click', closeEditModal);
}

// Close modal when clicking outside
const editModal = document.getElementById('editProductModal');
if (editModal) {
    editModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeEditModal();
        }
    });
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch('seller_dashboard.php?action=delete_product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ product_id: productId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Product deleted successfully!');
            // Reload all data to get updated stats
            await loadDashboardData();
        } else {
            alert('Error deleting product: ' + data.message);
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product: ' + error.message);
    }
}

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('seller_email');
            localStorage.removeItem('user_type');
            window.location.href = 'index.html';
        }
    });
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Seller dashboard loaded');
    
    if (window.location.pathname.includes('seller_dashboard.html')) {
        console.log('Initializing seller dashboard...');
        loadDashboardData();
    }
});

// Make functions globally available
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.closeEditModal = closeEditModal;

// Event delegation as fallback
document.addEventListener('click', function(e) {
    // Edit button clicked
    if (e.target.classList.contains('edit-product-btn')) {
        const productId = e.target.getAttribute('data-product-id');
        console.log('Edit product clicked (delegation):', productId);
        editProduct(productId);
    }
    
    // Delete button clicked
    if (e.target.classList.contains('delete-product-btn')) {
        const productId = e.target.getAttribute('data-product-id');
        console.log('Delete product clicked (delegation):', productId);
        deleteProduct(productId);
    }
});