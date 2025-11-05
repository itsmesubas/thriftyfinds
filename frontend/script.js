// Mobile menu toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navbar = document.querySelector('.navbar');

mobileMenuBtn.addEventListener('click', () => {
    navbar.classList.toggle('active');
    mobileMenuBtn.innerHTML = navbar.classList.contains('active') ? 
        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
});

// Scroll header effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    header.classList.toggle('scrolled', window.scrollY > 50);
});

// Modal functionality
const userLoginBtn = document.getElementById('userLoginBtn');
const sellerLoginBtn = document.getElementById('sellerLoginBtn');
const recLoginBtn = document.getElementById('recLoginBtn');
const userLoginModal = document.getElementById('userLoginModal');
const sellerLoginModal = document.getElementById('sellerLoginModal');
const closeModalButtons = document.querySelectorAll('.close-modal');
const switchToSeller = document.getElementById('switchToSeller');
const switchToUser = document.getElementById('switchToUser');

function openModal(modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

if (userLoginBtn) {
    userLoginBtn.addEventListener('click', () => openModal(userLoginModal));
}
if (sellerLoginBtn) {
    sellerLoginBtn.addEventListener('click', () => openModal(sellerLoginModal));
}
if (recLoginBtn) {
    recLoginBtn.addEventListener('click', () => openModal(userLoginModal));
}

closeModalButtons.forEach(button => {
    button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        closeModal(modal);
    });
});

if (switchToSeller) {
    switchToSeller.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(userLoginModal);
        openModal(sellerLoginModal);
    });
}

if (switchToUser) {
    switchToUser.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(sellerLoginModal);
        openModal(userLoginModal);
    });
}

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target);
    }
});

// Check authentication status when page loads
function checkAuthStatus() {
    const userEmail = localStorage.getItem('user_email');
    const sellerEmail = localStorage.getItem('seller_email');
    const userType = localStorage.getItem('user_type');
    
    console.log('Auth check - User:', userEmail, 'Seller:', sellerEmail, 'Type:', userType);
    
    if (userEmail && userType === 'user') {
        updateUIForUser(userEmail);
        loadRecommendations();
    } else if (sellerEmail && userType === 'seller') {
        updateUIForSeller(sellerEmail);
    }
}

// User login form submission
if (document.getElementById('userLoginForm')) {
    document.getElementById('userLoginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('userEmail').value;
        const password = document.getElementById('userPassword').value;
        const interests = [];
        document.querySelectorAll('input[name="interests"]:checked').forEach(checkbox => {
            interests.push(checkbox.value);
        });
        const budget = document.getElementById('userBudget').value;

        console.log('User login attempt:', { email, password, interests, budget });

        try {
            const response = await fetch('login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    user_type: 'user',
                    interests: interests,
                    budget: budget
                })
            });
            
            const responseText = await response.text();
            console.log('Raw user login response:', responseText);
            
            // Clean the response if there are PHP notices
            const cleanResponse = responseText.replace(/<br \/>\s*<b>.*?<\/b><br \/>/g, '').trim();
            
            let data;
            try {
                data = JSON.parse(cleanResponse);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                // Try to extract JSON from the response
                const jsonMatch = responseText.match(/\{.*\}/);
                if (jsonMatch) {
                    data = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('Server returned invalid response');
                }
            }
            
            console.log('Parsed user login data:', data);
            
            if (data.success) {
                // Store user session
                localStorage.setItem('user_email', email);
                localStorage.setItem('user_type', 'user');
                localStorage.setItem('user_interests', JSON.stringify(interests));
                localStorage.setItem('user_budget', budget);
                
                simulateUserLogin(email, interests, budget);
                closeModal(userLoginModal);
                setTimeout(loadRecommendations, 1000);
            } else {
                alert('Login failed: ' + data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        }
    });
}

// Seller login form submission
if (document.getElementById('sellerLoginForm')) {
    document.getElementById('sellerLoginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('sellerEmail').value;
        const password = document.getElementById('sellerPassword').value;

        console.log('Seller login attempt:', { email, password });

        try {
            const response = await fetch('login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    user_type: 'seller'
                })
            });
            
            const responseText = await response.text();
            console.log('Raw seller login response:', responseText);
            
            // Clean the response if there are PHP notices
            const cleanResponse = responseText.replace(/<br \/>\s*<b>.*?<\/b><br \/>/g, '').trim();
            
            let data;
            try {
                data = JSON.parse(cleanResponse);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                // Try to extract JSON from the response
                const jsonMatch = responseText.match(/\{.*\}/);
                if (jsonMatch) {
                    data = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('Server returned invalid response');
                }
            }
            
            console.log('Parsed seller login data:', data);
            
            if (data.success) {
                simulateSellerLogin(email);
            } else {
                alert('Seller login failed: ' + data.message);
            }
        } catch (error) {
            console.error('Seller login error:', error);
            alert('Seller login failed: ' + error.message);
        }
    });
}

// Simulate user login and show recommendations
function simulateUserLogin(email, interests, budget) {
    console.log('User login successful for:', email);
    
    // Hide login prompt in recommendations
    const loginPrompt = document.querySelector('.login-prompt');
    if (loginPrompt) {
        loginPrompt.style.display = 'none';
    }
    
    // Show welcome message
    const recommendationGrid = document.querySelector('.recommendation-grid');
    if (recommendationGrid) {
        recommendationGrid.innerHTML = `
            <div class="welcome-message">
                <h3>Welcome back, ${email.split('@')[0]}!</h3>
                <p>Based on your interests in ${interests.join(', ')} and budget (${budget}), here are personalized recommendations:</p>
            </div>
        `;
    }
    
    // Update UI for logged in user
    updateUIForUser(email);
}

// Simulate seller login
function simulateSellerLogin(email) {
    console.log('Seller login successful for:', email);
    
    // Store seller info in localStorage
    localStorage.setItem('seller_email', email);
    localStorage.setItem('user_type', 'seller');
    
    // Close the modal first
    closeModal(sellerLoginModal);
    
    // Update UI immediately if on home page
    updateUIForSeller(email);
    
    // Show success message and redirect
    alert(`Seller ${email} logged in successfully! Redirecting to dashboard...`);
    
    // Redirect to seller dashboard after a short delay
    setTimeout(() => {
        window.location.href = 'seller_dashboard.html';
    }, 1500);
}

// Update UI for logged in user
function updateUIForUser(email) {
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        authButtons.innerHTML = `
            <span style="margin-right: 15px; color: var(--primary-color);">
                <i class="fas fa-user"></i> ${email}
            </span>
            <button onclick="goToUserDashboard()" class="btn"><i class="fas fa-tachometer-alt"></i> My Account</button>
            <button id="logoutBtn" class="btn btn-outline"><i class="fas fa-sign-out-alt"></i> Logout</button>
        `;
                // Add event listener to the logout button
        document.getElementById('logoutBtn').addEventListener('click', handleUserLogout);
    }
}
// Go to user dashboard
function goToUserDashboard() {
    window.location.href = 'user_dashboard.html';
}

// Update UI for logged in seller
function updateUIForSeller(email) {
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        authButtons.innerHTML = `
            <span style="margin-right: 15px; color: var(--primary-color);">
                <i class="fas fa-store"></i> ${email}
            </span>
            <button onclick="goToSellerDashboard()" class="btn"><i class="fas fa-tachometer-alt"></i> Dashboard</button>
            <button onclick="sellerLogout()" class="btn btn-outline"><i class="fas fa-sign-out-alt"></i> Logout</button>
        `;
    }
}

// Go to seller dashboard from home page
function goToSellerDashboard() {
    window.location.href = 'seller_dashboard.html';
}

// Seller logout from home page
function sellerLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('seller_email');
        localStorage.removeItem('user_type');
        window.location.href = 'index.html';
    }
}

// Handle user logout
function handleUserLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear localStorage
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_type');
        localStorage.removeItem('user_interests');
        localStorage.removeItem('user_budget');
        
        // Reset the UI to logged out state
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.innerHTML = `
                <button id="userLoginBtn" class="btn">Log in</button>
                <button id="sellerLoginBtn" class="btn btn-outline">Seller ?</button>
            `;
        }
        
        // Reset recommendations section
        const recommendationGrid = document.querySelector('.recommendation-grid');
        if (recommendationGrid) {
            recommendationGrid.innerHTML = `
                <div class="login-prompt">
                    <p>Login to see personalized recommendations!</p>
                    <button id="recLoginBtn" class="btn">Login Now</button>
                </div>
            `;
        }
        
        // Re-attach event listeners to the new buttons
        document.getElementById('userLoginBtn').addEventListener('click', () => openModal(userLoginModal));
        document.getElementById('sellerLoginBtn').addEventListener('click', () => openModal(sellerLoginModal));
        if (document.getElementById('recLoginBtn')) {
            document.getElementById('recLoginBtn').addEventListener('click', () => openModal(userLoginModal));
        }
        
        // Clear session from server (optional)
        fetch('logout.php');
    }
}

// Load recommendations
async function loadRecommendations() {
    try {
        const userEmail = localStorage.getItem('user_email');
        const interests = JSON.parse(localStorage.getItem('user_interests') || '[]');
        const budget = localStorage.getItem('user_budget');
        
        if (!userEmail) {
            console.log('User not logged in, skipping recommendations');
            return;
        }

        const response = await fetch('recommendations.php');
        const data = await response.json();
        
        console.log('Recommendations response:', data);
        
        const recommendationGrid = document.querySelector('.recommendation-grid');
        
        if (data.success && data.recommendations && data.recommendations.length > 0) {
            // Clear existing content but keep welcome message
            const welcomeMessage = document.querySelector('.welcome-message');
            if (welcomeMessage) {
                recommendationGrid.innerHTML = welcomeMessage.outerHTML;
            }
            
            data.recommendations.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card animate-pop-in';
                productCard.innerHTML = `
                    <div class="product-image">
                        <img src="${product.image_url || 'images/placeholder.jpg'}" alt="${product.title}" loading="lazy" onerror="this.src='images/placeholder.jpg'">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.title}</h3>
                        <div class="product-price">₹${product.price ? product.price.toLocaleString() : '0'}</div>
                        <div class="product-rating">${'★'.repeat(Math.floor(product.rating || 0))}${'☆'.repeat(5-Math.floor(product.rating || 0))}</div>
                        <div class="product-actions">
                            <button class="add-to-cart">Buy Now</button>
                        </div>
                    </div>
                `;
                recommendationGrid.appendChild(productCard);
            });
        } else if (data.success && (!data.recommendations || data.recommendations.length === 0)) {
            // No recommendations found, show fallback
            if (recommendationGrid && !recommendationGrid.querySelector('.no-results')) {
                recommendationGrid.innerHTML += `
                    <div class="no-results">
                        <p>We couldn't find recommendations matching your exact criteria. Here are some popular items:</p>
                    </div>
                `;
                // You can add fallback products here
            }
        }
    } catch (error) {
        console.error('Error loading recommendations:', error);
    }
}

// Generate products (initial page load)
function generateProducts() {
    // This function can be used for initial product loading
    console.log('Generating products...');
}

// Search functionality
const searchBox = document.querySelector('.search-box input');
const searchButton = document.querySelector('.search-box button');

if (searchButton) {
    searchButton.addEventListener('click', performSearch);
}
if (searchBox) {
    searchBox.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

function performSearch() {
    const searchTerm = searchBox.value.trim().toLowerCase();
    if (searchTerm) {
        alert(`Searching for: ${searchTerm}`);
        // In a real app, you would filter products or make an API call
    }
}

// Product filtering
document.addEventListener('DOMContentLoaded', function() {
    const brandFilter = document.getElementById('brand-filter');
    const productCards = document.querySelectorAll('.product-card');

    if (brandFilter) {
        brandFilter.addEventListener('change', function() {
            const selectedBrand = this.value;
            
            productCards.forEach(card => {
                if (selectedBrand === 'all' || card.dataset.brand === selectedBrand) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });

        // Initialize all products as visible
        productCards.forEach(card => {
            card.style.display = 'block';
        });
    }

    // Check authentication status when page loads
    checkAuthStatus();
    
    // Initialize products
    generateProducts();
});

// Initialize the page
generateProducts();

// Product Details Functionality
const productDetailsModal = document.getElementById('productDetailsModal');

// Function to open product details
function openProductDetails(productId) {
    console.log('Opening product details for:', productId);
    
    // Show loading state
    document.getElementById('productDetailsContent').innerHTML = `
        <div class="loading-details">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading product details...</p>
        </div>
    `;
    
    openModal(productDetailsModal);
    
    // Fetch product details
    fetchProductDetails(productId);
}

// Fetch product details from server
async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`get_product_details.php?product_id=${productId}`);
        const data = await response.json();
        
        console.log('Product details response:', data);
        
        if (data.success) {
            displayProductDetails(data.product);
        } else {
            document.getElementById('productDetailsContent').innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error loading product details: ${data.message}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching product details:', error);
        document.getElementById('productDetailsContent').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error loading product details. Please try again.</p>
            </div>
        `;
    }
}

// Display product details in modal
function displayProductDetails(product) {
    const conditionClass = `condition-${product.condition}`;
    const savings = product.original_price ? product.original_price - product.price : 0;
    
    const detailsHTML = `
        <div class="product-details-image">
            <img src="${product.image_url || 'images/placeholder.jpg'}" alt="${product.title}" onerror="this.src='images/placeholder.jpg'">
        </div>
        <div class="product-details-info">
            <h1 class="product-details-title">${product.title}</h1>
            <div class="product-details-price">Rs. ${product.price.toLocaleString()}</div>
            <div class="product-details-rating">
                ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5-Math.floor(product.rating))}
                <span style="margin-left: 10px; color: var(--gray-color);">(${product.rating}/5)</span>
            </div>
            
            <div class="product-details-meta">
                <div class="meta-item">
                    <span class="meta-label">Condition:</span>
                    <span class="meta-value ${conditionClass}">${product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Used Duration:</span>
                    <span class="meta-value">${product.used_duration}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Warranty:</span>
                    <span class="meta-value">${product.warranty_remaining}</span>
                </div>
                ${product.original_price ? `
                <div class="meta-item">
                    <span class="meta-label">Original Price:</span>
                    <span class="meta-value" style="text-decoration: line-through; color: var(--gray-color);">
                        Rs. ${product.original_price.toLocaleString()}
                    </span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">You Save:</span>
                    <span class="meta-value" style="color: var(--success-color);">
                        Rs. ${savings.toLocaleString()}
                    </span>
                </div>
                ` : ''}
                <div class="meta-item">
                    <span class="meta-label">Accessories:</span>
                    <span class="meta-value">${product.accessories_included}</span>
                </div>
            </div>
            
            <div class="product-details-description">
                <h4>Description</h4>
                <p>${product.description}</p>
            </div>
            
            <div class="seller-info">
                <h4><i class="fas fa-store"></i> Seller Information</h4>
                <div class="seller-contact">
                    <div class="contact-item">
                        <i class="fas fa-user"></i>
                        <span>${product.seller.shop_name}</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${product.seller.address}</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <span>${product.seller.email}</span>
                    </div>
                    ${product.seller.phone !== 'Not provided' ? `
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <span>${product.seller.phone}</span>
                    </div>
                    <a href="tel:${product.seller.phone}" class="contact-phone">
                        <i class="fas fa-phone"></i>
                        Call Seller
                    </a>
                    ` : `
                    <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <span style="color: var(--gray-color);">Phone number not provided</span>
                    </div>
                    `}
                </div>
            </div>
            
            <div class="product-actions-detailed">
                <button class="add-to-cart" style="flex: 2;">
                    <i class="fas fa-shopping-cart"></i>
                    Buy Now - Rs. ${product.price.toLocaleString()}
                </button>
               
            </div>
        </div>
    `;
    
    document.getElementById('productDetailsContent').innerHTML = detailsHTML;
}

// Add event listeners to view details buttons
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners to existing view details buttons
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            openProductDetails(productId);
        });
    });
    
    // For dynamically loaded products, use event delegation
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('view-details')) {
            const productId = e.target.getAttribute('data-product-id');
            openProductDetails(productId);
        }
    });
});

// Khalti Payment Integration
async function initiateKhaltiPayment(productId, quantity = 1) {
    console.log('Initiating Khalti payment for product:', productId);
    
    // Check if user is logged in
    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) {
        alert('Please login to make a purchase');
        openModal(userLoginModal);
        return;
    }

    try {
        // Show loading
        const buyButton = event.target;
        const originalText = buyButton.innerHTML;
        buyButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        buyButton.disabled = true;

        const response = await fetch('initiate_payment.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: quantity
            })
        });

        const data = await response.json();
        console.log('Payment initiation response:', data);

        if (data.success) {
            // Redirect to Khalti payment page
            window.location.href = data.payment_url;
        } else {
            alert('Payment initiation failed: ' + data.message);
        }
    } catch (error) {
        console.error('Payment initiation error:', error);
        alert('Payment initiation failed. Please try again.');
    } finally {
        // Reset button
        if (event && event.target) {
            event.target.innerHTML = originalText;
            event.target.disabled = false;
        }
    }
}

// Update all Buy Now buttons to use Khalti
function updateBuyNowButtons() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        // Remove existing click events
        button.replaceWith(button.cloneNode(true));
    });

    // Add new event listeners
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Find the product card
            const productCard = this.closest('.product-card');
            const productId = productCard ? productCard.dataset.productId : null;
            
            if (productId) {
                initiateKhaltiPayment(productId, 1);
            } else {
                alert('Product information not found');
            }
        });
    });
}

// Update product cards to include data-product-id
function updateProductCards() {
    document.querySelectorAll('.product-card').forEach((card, index) => {
        if (!card.dataset.productId) {
            // Assign a temporary ID based on position
            // In real implementation, this should come from your database
            card.dataset.productId = index + 1;
        }
    });
}

// Initialize payment functionality
document.addEventListener('DOMContentLoaded', function() {
    updateProductCards();
    updateBuyNowButtons();
});
// Global variables for product management
let currentPage = 1;
let currentBrand = 'all';
let currentCategory = 'all';
let allProducts = [];
let displayedProducts = [];
const PRODUCTS_PER_PAGE = 8;

// Load products from server
async function loadProducts(page = 1, brand = 'all', category = 'all', append = false) {
    try {
        console.log(`Loading products - Page: ${page}, Brand: ${brand}, Category: ${category}`);
        
        // Show loading state
        const productsGrid = document.getElementById('productsGrid');
        if (!append) {
            productsGrid.innerHTML = '<div class="loading-products"><i class="fas fa-spinner fa-spin"></i> Loading products...</div>';
        }

        // Build query parameters
        const params = new URLSearchParams({
            page: page,
            brand: brand,
            category: category
        });

        const response = await fetch(`products.php?${params}`);
        const data = await response.json();
        
        console.log('Products response:', data);

        if (data.success && data.products && data.products.length > 0) {
            if (append) {
                // Append to existing products
                allProducts = [...allProducts, ...data.products];
            } else {
                // Replace existing products
                allProducts = data.products;
                currentPage = 1;
            }
            
            displayProducts(allProducts);
            updateLoadMoreButton(data.products.length);
        } else {
            if (!append) {
                productsGrid.innerHTML = `
                    <div class="no-products">
                        <i class="fas fa-box-open"></i>
                        <h3>No products found</h3>
                        <p>Try changing your filters or check back later for new items.</p>
                    </div>
                `;
            }
            document.getElementById('loadMoreContainer').style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = `
            <div class="error-loading">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading products</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

// Display products in the grid
function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <h3>No products found</h3>
                <p>Try changing your filters or check back later for new items.</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = products.map(product => `
        <div class="product-card animate-pop-in" data-brand="${product.brand}" data-category="${product.category}">
            <div class="product-image">
                <img src="${product.image_url || 'images/placeholder.jpg'}" 
                     alt="${product.title}" 
                     loading="lazy"
                     onerror="this.src='images/placeholder.jpg'">
                ${product.stock_quantity === 0 ? '<div class="out-of-stock">Out of Stock</div>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.description || 'No description available'}</p>
                <div class="product-seller">
                    <small>Sold by: ${product.seller_email || 'Unknown Seller'}</small>
                </div>
                <div class="product-price">₹${product.price ? product.price.toLocaleString() : '0'}</div>
                <div class="product-rating">
                    ${'★'.repeat(Math.floor(product.rating || 0))}${'☆'.repeat(5-Math.floor(product.rating || 0))}
                    <span class="rating-value">(${product.rating || 0})</span>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart" ${product.stock_quantity === 0 ? 'disabled' : ''}>
                        ${product.stock_quantity === 0 ? 'Out of Stock' : 'Buy Now'}
                    </button>
                    
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners to new product cards
    addProductEventListeners();
}

// Add event listeners to product actions
function addProductEventListeners() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productCard = this.closest('.product-card');
            const productTitle = productCard.querySelector('.product-title').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            
            // Check if user is logged in
            const userEmail = localStorage.getItem('user_email');
            if (!userEmail) {
                alert('Please login to add items to cart');
                openModal(userLoginModal);
                return;
            }
            
            alert(`Added to cart: ${productTitle} - ${productPrice}`);
            // In a real app, you would make an API call to add to cart
        });
    });

  
}

// Update load more button visibility
function updateLoadMoreButton(productsCount) {
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    if (productsCount >= PRODUCTS_PER_PAGE) {
        loadMoreContainer.style.display = 'block';
    } else {
        loadMoreContainer.style.display = 'none';
    }
}

// Filter products
function setupProductFilters() {
    const brandFilter = document.getElementById('brand-filter');
    const categoryFilter = document.getElementById('category-filter');
    const resetFilters = document.getElementById('resetFilters');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    if (brandFilter) {
        brandFilter.addEventListener('change', function() {
            currentBrand = this.value;
            currentCategory = document.getElementById('category-filter').value;
            loadProducts(1, currentBrand, currentCategory, false);
        });
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            currentCategory = this.value;
            currentBrand = document.getElementById('brand-filter').value;
            loadProducts(1, currentBrand, currentCategory, false);
        });
    }

    if (resetFilters) {
        resetFilters.addEventListener('click', function() {
            document.getElementById('brand-filter').value = 'all';
            document.getElementById('category-filter').value = 'all';
            currentBrand = 'all';
            currentCategory = 'all';
            loadProducts(1, 'all', 'all', false);
        });
    }

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            currentPage++;
            loadProducts(currentPage, currentBrand, currentCategory, true);
        });
    }
}

// Real-time search functionality
function setupSearch() {
    const searchBox = document.querySelector('.search-box input');
    let searchTimeout;

    if (searchBox) {
        searchBox.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const searchTerm = this.value.trim();
            
            if (searchTerm.length >= 2 || searchTerm.length === 0) {
                searchTimeout = setTimeout(() => {
                    if (searchTerm.length === 0) {
                        // If search is cleared, reload all products
                        loadProducts(1, currentBrand, currentCategory, false);
                    } else {
                        // Perform search
                        performSearch(searchTerm);
                    }
                }, 500);
            }
        });
    }
}

// Perform search
async function performSearch(searchTerm) {
    try {
        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = '<div class="loading-products"><i class="fas fa-spinner fa-spin"></i> Searching products...</div>';

        const response = await fetch(`products.php?search=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();

        if (data.success && data.products && data.products.length > 0) {
            displayProducts(data.products);
        } else {
            productsGrid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-search"></i>
                    <h3>No products found for "${searchTerm}"</h3>
                    <p>Try different keywords or check back later.</p>
                </div>
            `;
        }
        
        document.getElementById('loadMoreContainer').style.display = 'none';
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Initialize product system
function initializeProductSystem() {
    setupProductFilters();
    setupSearch();
    loadProducts(1, 'all', 'all', false);
}

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    const brandFilter = document.getElementById('brand-filter');
    const productCards = document.querySelectorAll('.product-card');

    if (brandFilter) {
        brandFilter.addEventListener('change', function() {
            const selectedBrand = this.value;
            
            productCards.forEach(card => {
                if (selectedBrand === 'all' || card.dataset.brand === selectedBrand) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });

        // Initialize all products as visible
        productCards.forEach(card => {
            card.style.display = 'block';
        });
    }

    // Check authentication status when page loads
    checkAuthStatus();
    
    // Initialize products system
    initializeProductSystem();
    
    // Initialize static products (fallback)
    generateProducts();
});