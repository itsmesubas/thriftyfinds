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

    userLoginBtn.addEventListener('click', () => openModal(userLoginModal));
    sellerLoginBtn.addEventListener('click', () => openModal(sellerLoginModal));
    recLoginBtn.addEventListener('click', () => openModal(userLoginModal));

    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });

    switchToSeller.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(userLoginModal);
        openModal(sellerLoginModal);
    });

    switchToUser.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(sellerLoginModal);
        openModal(userLoginModal);
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // Form submission
    const userLoginForm = document.getElementById('userLoginForm');
    const sellerLoginForm = document.getElementById('sellerLoginForm');

    userLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('userEmail').value;
        const password = document.getElementById('userPassword').value;
        
        // Get recommendation preferences
        const interests = [];
        document.querySelectorAll('input[name="interests"]:checked').forEach(checkbox => {
            interests.push(checkbox.value);
        });
        const budget = document.getElementById('userBudget').value;
        
        
        console.log('User login:', { email, password, interests, budget });
        
        // Simulate successful login
        simulateUserLogin(email, interests, budget);
        closeModal(userLoginModal);
    });

    sellerLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('sellerEmail').value;
        const password = document.getElementById('sellerPassword').value;
        
        
        console.log('Seller login:', { email, password });
        
        // Simulate successful login
        simulateSellerLogin(email);
        closeModal(sellerLoginModal);
    });

    // Simulate user login and show recommendations
    function simulateUserLogin(email, interests, budget) {
        // Hide login prompt in recommendations
        document.querySelector('.login-prompt').style.display = 'none';
        
        // Show welcome message
        const recommendationGrid = document.querySelector('.recommendation-grid');
        recommendationGrid.innerHTML = `
            <div class="welcome-message">
                <h3>Welcome back, ${email.split('@')[0]}!</h3>
                <p>Based on your interests in ${interests.join(', ')} and budget (${budget}), here are some recommendations:</p>
            </div>
        `;
        
        // Generate recommendations based on interests
        generateRecommendations(interests, budget);
        
        // Update UI for logged in user
        updateUIForUser();
    }

    // Simulate seller login
    function simulateSellerLogin(email) {
        alert(`Seller ${email} logged in successfully! Redirecting to seller dashboard...`);
       
    }

    // Update UI for logged in user
    function updateUIForUser() {
        const authButtons = document.querySelector('.auth-buttons');
        authButtons.innerHTML = `
            <button class="btn"><i class="fas fa-user"></i> My Account</button>
            <button class="btn btn-outline"><i class="fas fa-sign-out-alt"></i> Logout</button>
        `;
    }

   

      
    // Generate recommendations based on user interests
    function generateRecommendations(interests, budget) {
        const allProducts = [
            {
                id: 101,
                title: "Leather Crossbody Bag",
                price: "$28.99",
                rating: "★★★★☆",
                image: "https://images.unsplash.com/photo-1591561954555-607968c989ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                category: "clothing",
                priceRange: "20-50"
            },
            {
                id: 102,
                title: "Bluetooth Speaker",
                price: "$22.50",
                rating: "★★★★★",
                image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                category: "electronics",
                priceRange: "20-50"
            },
            {
                id: 103,
                title: "Antique Wooden Chair",
                price: "$65.00",
                rating: "★★★☆☆",
                image: "https://images.unsplash.com/photo-1503602642458-232111445657?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                category: "furniture",
                priceRange: "50-100"
            },
            {
                id: 104,
                title: "Science Fiction Bundle",
                price: "$15.99",
                rating: "★★★★☆",
                image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                category: "books",
                priceRange: "0-20"
            },
            {
                id: 105,
                title: "Vintage Sunglasses",
                price: "$18.00",
                rating: "★★★★★",
                image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                category: "clothing",
                priceRange: "0-20"
            },
            {
                id: 106,
                title: "Tablet Stand",
                price: "$12.99",
                rating: "★★★☆☆",
                image: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                category: "electronics",
                priceRange: "0-20"
            }
        ];

        // Filter products based on interests and budget
        const recommendedProducts = allProducts.filter(product => 
            interests.includes(product.category) && 
            product.priceRange === budget
        );

        const recommendationGrid = document.querySelector('.recommendation-grid');
        
        if (recommendedProducts.length > 0) {
            recommendedProducts.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card animate-pop-in';
                productCard.style.animationDelay = `${Math.random() * 0.5}s`;
                productCard.innerHTML = `
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.title}">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.title}</h3>
                        <div class="product-price">${product.price}</div>
                        <div class="product-rating">${product.rating}</div>
                        <div class="product-actions">
                            <button class="add-to-cart">Add to Cart</button>
                            <button class="wishlist"><i class="far fa-heart"></i></button>
                        </div>
                    </div>
                `;
                recommendationGrid.appendChild(productCard);
            });
        } else {
            recommendationGrid.innerHTML += `
                <div class="no-results">
                    <p>We couldn't find recommendations matching your exact criteria. Here are some other items you might like:</p>
                </div>
            `;
            
            // Show some fallback products
            const fallbackProducts = allProducts.filter(product => 
                interests.includes(product.category)
            ).slice(0, 3);
            
            fallbackProducts.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card animate-pop-in';
                productCard.style.animationDelay = `${Math.random() * 0.5}s`;
                productCard.innerHTML = `
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.title}">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.title}</h3>
                        <div class="product-price">${product.price}</div>
                        <div class="product-rating">${product.rating}</div>
                        <div class="product-actions">
                            <button class="add-to-cart">Add to Cart</button>
                            <button class="wishlist"><i class="far fa-heart"></i></button>
                        </div>
                    </div>
                `;
                recommendationGrid.appendChild(productCard);
            });
        }
    }

    // Initialize the page
    generateProducts();

    // Search functionality
    const searchBox = document.querySelector('.search-box input');
    const searchButton = document.querySelector('.search-box button');
    
    searchButton.addEventListener('click', performSearch);
    searchBox.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    function performSearch() {
        const searchTerm = searchBox.value.trim().toLowerCase();
        if (searchTerm) {
            alert(`Searching for: ${searchTerm}`);
            // In a real app, you would filter products or make an API call
        }
    }
// Add this function to handle logout
function handleLogout() {
    // Reset the UI to logged out state
    const authButtons = document.querySelector('.auth-buttons');
    authButtons.innerHTML = `
        <button id="userLoginBtn" class="btn">User Login</button>
        <button id="sellerLoginBtn" class="btn btn-outline">Seller Login</button>
    `;
    
    // Reset recommendations section
    const recommendationGrid = document.querySelector('.recommendation-grid');
    recommendationGrid.innerHTML = `
        <div class="login-prompt">
            <p>Login to see personalized recommendations!</p>
            <button id="recLoginBtn" class="btn">Login Now</button>
        </div>
    `;
    
    // Re-attach event listeners to the new buttons
    document.getElementById('userLoginBtn').addEventListener('click', () => openModal(userLoginModal));
    document.getElementById('sellerLoginBtn').addEventListener('click', () => openModal(sellerLoginModal));
    document.getElementById('recLoginBtn').addEventListener('click', () => openModal(userLoginModal));
}

// Modify the updateUIForUser function to include logout functionality
function updateUIForUser() {
    const authButtons = document.querySelector('.auth-buttons');
    authButtons.innerHTML = `
        <button class="btn"><i class="fas fa-user"></i> My Account</button>
        <button id="logoutBtn" class="btn btn-outline"><i class="fas fa-sign-out-alt"></i> Logout</button>
    `;
    
    // Add event listener to the logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}
// Update the login function
async function loginUser(email, password, interests, budget) {
    try {
        const response = await fetch('http://localhost:8000/api/auth/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save token to localStorage
            localStorage.setItem('token', data.token);
            
            // Save user preferences
            await saveUserPreferences(data.user_id, interests, budget);
            
            // Update UI
            simulateUserLogin(email, interests, budget);
            closeModal(userLoginModal);
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed');
    }
}

// Save user preferences
async function saveUserPreferences(userId, interests, budget) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/preferences/', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify({
                interests: interests,
                budget_range: budget
            })
        });
        
        if (!response.ok) {
            console.error('Failed to save preferences');
        }
    } catch (error) {
        console.error('Error saving preferences:', error);
    }
}

// Get recommendations
async function getRecommendations() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8000/api/recommendations/', {
            headers: {
                'Authorization': `Token ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            displayRecommendations(data);
        }
    } catch (error) {
        console.error('Error getting recommendations:', error);
    }
}

// Search products
async function searchProducts(query) {
    try {
        const response = await fetch(`http://localhost:8000/api/search/?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        displaySearchResults(data);
    } catch (error) {
        console.error('Search error:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const brandFilter = document.getElementById('brand-filter');
    const productCards = document.querySelectorAll('.product-card');

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
});
// Update the simulateSellerLogin function
function simulateSellerLogin(email) {
    // In a real app, you would:
    // 1. Verify credentials with server
    // 2. Get a session token
    // 3. Redirect to dashboard
    
    // For demo purposes:
    localStorage.setItem('sellerToken', 'demo-seller-token');
    window.location.href = 'seller-dashboard.html';
}