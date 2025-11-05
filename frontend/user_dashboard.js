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

// Check if user is logged in
function checkUserAuth() {
    console.log('Checking user authentication...');
    
    const userEmail = localStorage.getItem('user_email');
    const userType = localStorage.getItem('user_type');
    
    console.log('LocalStorage - Email:', userEmail, 'Type:', userType);
    
    if (!userEmail || userType !== 'user') {
        console.log('No user found in localStorage, redirecting to login...');
        alert('Please login as user first');
        window.location.href = 'index.html';
        return false;
    }
    
    // Update UI with user email
    const emailDisplay = document.getElementById('userEmailDisplay');
    if (emailDisplay) {
        emailDisplay.textContent = userEmail;
    }
    
    // Load profile information
    loadProfileInfo();
    
    return true;
}

// Load user dashboard data
async function loadDashboardData() {
    console.log('Loading user dashboard data...');
    
    if (!checkUserAuth()) return;

    try {
        const response = await fetch('user_dashboard.php?action=get_stats');
        const data = await response.json();
        
        console.log('User dashboard stats response:', data);
        
        if (data.success) {
            updateDashboardStats(data.stats);
            loadUserOrders();
            loadUserAddresses();
           
        }
    } catch (error) {
        console.error('Error loading user dashboard data:', error);
    }
}

// Update dashboard statistics
function updateDashboardStats(stats) {
    if (document.getElementById('totalOrders')) {
        document.getElementById('totalOrders').textContent = stats.total_orders || 0;
    }
    if (document.getElementById('pendingOrders')) {
        document.getElementById('pendingOrders').textContent = stats.pending_orders || 0;
    }
    
    if (document.getElementById('totalSpent')) {
        document.getElementById('totalSpent').textContent = '₹' + (stats.total_spent || 0).toLocaleString();
    }
}

// Load user orders
async function loadUserOrders() {
    try {
        const response = await fetch('user_dashboard.php?action=get_orders');
        const data = await response.json();
        
        console.log('User orders response:', data);
        
        const ordersList = document.getElementById('ordersList');
        
        if (data.success && data.orders && data.orders.length > 0) {
            ordersList.innerHTML = data.orders.map(order => `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <div class="order-id">Order #${order.id}</div>
                            <div class="order-date">Placed on ${new Date(order.created_at).toLocaleDateString()}</div>
                        </div>
                        <span class="order-status status-${order.status}">${order.status}</span>
                    </div>
                    
                    <div class="order-items">
                        ${order.items ? order.items.map(item => `
                            <div class="order-item">
                                <img src="${item.image_url || 'images/placeholder.jpg'}" alt="${item.product_title}" class="item-image" onerror="this.src='images/placeholder.jpg'">
                                <div class="item-details">
                                    <div class="item-name">${item.product_title}</div>
                                    <div class="item-price">₹${item.unit_price ? item.unit_price.toLocaleString() : '0'}</div>
                                    <div class="item-quantity">Quantity: ${item.quantity}</div>
                                </div>
                            </div>
                        `).join('') : `
                            <div class="order-item">
                                <div class="item-details">
                                    <div class="item-name">${order.product_title || 'Product'}</div>
                                    <div class="item-price">₹${order.total_amount ? order.total_amount.toLocaleString() : '0'}</div>
                                    <div class="item-quantity">Quantity: ${order.quantity || 1}</div>
                                </div>
                            </div>
                        `}
                    </div>
                    
                    <div class="order-footer">
                        <div class="order-total">Total: ₹${order.total_amount ? order.total_amount.toLocaleString() : '0'}</div>
                        <div class="order-actions">
                            ${order.status === 'delivered' ? `
                                <button class="btn btn-sm" onclick="rateOrder(${order.id})">Rate Product</button>
                                <button class="btn btn-sm btn-outline" onclick="reorder(${order.id})">Reorder</button>
                            ` : ''}
                            ${order.status === 'pending' ? `
                                <button class="btn btn-sm btn-danger" onclick="cancelOrder(${order.id})">Cancel Order</button>
                            ` : ''}
                            <button class="btn btn-sm btn-outline" onclick="viewOrderDetails(${order.id})">View Details</button>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            ordersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>No Orders Yet</h3>
                    <p>You haven't placed any orders yet.</p>
                    <a href="index.html" class="btn">Start Shopping</a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading user orders:', error);
    }
}



// Order actions
function viewOrderDetails(orderId) {
    alert(`Viewing details for order #${orderId}`);
    // In real implementation, show order details modal
}

function cancelOrder(orderId) {
    if (confirm('Are you sure you want to cancel this order?')) {
        alert(`Order #${orderId} cancellation requested`);
        // In real implementation, call API to cancel order
    }
}

function reorder(orderId) {
    alert(`Reordering items from order #${orderId}`);
    // In real implementation, add items to cart
}
// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_type');
        localStorage.removeItem('user_interests');
        localStorage.removeItem('user_budget');
        window.location.href = 'index.html';
    }
});

// Close modal when clicking outside
document.getElementById('addAddressModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeAddressModal();
    }
});

function goToUserDashboard() {
    window.location.href = 'user_dashboard.html';
}
// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('user_dashboard.html')) {
        loadDashboardData();
    }
});