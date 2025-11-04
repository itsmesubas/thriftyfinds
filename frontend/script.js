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


  // User login form submission
document.getElementById('userLoginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const interests = [];
    document.querySelectorAll('input[name="interests"]:checked').forEach(checkbox => {
        interests.push(checkbox.value);
    });
    const budget = document.getElementById('userBudget').value;

    console.log('Login attempt:', { 
        email: email, 
        password: password, 
        interests: interests, 
        budget: budget 
    });

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
        
        console.log('Response status:', response.status);
        
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error('Server returned invalid JSON: ' + responseText);
        }
        
        console.log('Parsed data:', data);
        
        if (data.success) {
            alert('Login successful! Welcome ' + email);
            simulateUserLogin(email, interests, budget);
            closeModal(userLoginModal);
            setTimeout(loadRecommendations, 1000);
        } else {
            alert('Login failed: ' + data.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login error: ' + error.message);
    }
});
// Seller login form submission
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
        
        const data = await response.json();
        console.log('Seller login response:', data);
        
        if (data.success) {
            simulateSellerLogin(email);
            closeModal(sellerLoginModal);
        } else {
            alert('Seller login failed: ' + data.message);
        }
    } catch (error) {
        console.error('Seller login error:', error);
        alert('Seller login failed: ' + error.message);
    }
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
            <p>Based on your interests in ${interests.join(', ')} and budget (${budget}), here are personalized recommendations:</p>
        </div>
    `;
    
    // Update UI for logged in user
    updateUIForUser();
}

// Load recommendations from server
async function loadRecommendations() {
    try {
        const response = await fetch('recommendations.php');
        const data = await response.json();
        
        if (data.success && data.recommendations.length > 0) {
            const recommendationGrid = document.querySelector('.recommendation-grid');
            data.recommendations.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card animate-pop-in';
                productCard.innerHTML = `
                    <div class="product-image">
                        <img src="${product.image_url}" alt="${product.title}" loading="lazy">
                    </div>
                    <div class="product-info">
                        <h3 class="product-title">${product.title}</h3>
                        <div class="product-price">Rs. ${product.price.toLocaleString()}</div>
                        <div class="product-rating">${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5-Math.floor(product.rating))}</div>
                        <div class="product-actions">
                            <button class="add-to-cart">Buy Now</button>
                        </div>
                    </div>
                `;
                recommendationGrid.appendChild(productCard);
            });
        }
    } catch (error) {
        console.error('Error loading recommendations:', error);
    }
}

// Simulate seller login
function simulateSellerLogin(email) {
    alert(`Seller ${email} logged in successfully! Redirecting to seller dashboard...`);
    // In a real application, redirect to seller dashboard
}

// Update UI for logged in user
function updateUIForUser() {
    const authButtons = document.querySelector('.auth-buttons');
    authButtons.innerHTML = `
        <button class="btn"><i class="fas fa-user"></i> My Account</button>
        <button id="logoutBtn" class="btn btn-outline"><i class="fas fa-sign-out-alt"></i> Logout</button>
    `;
    
    // Add event listener to the logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

// Handle logout
function handleLogout() {
    // Reset the UI to logged out state
    const authButtons = document.querySelector('.auth-buttons');
    authButtons.innerHTML = `
        <button id="userLoginBtn" class="btn">Log in</button>
        <button id="sellerLoginBtn" class="btn btn-outline">Seller ?</button>
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
    
    // Clear session (you might want to call a logout.php endpoint)
    fetch('logout.php');
}

// Product filtering
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