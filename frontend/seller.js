// Seller Dashboard Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Image Preview Functionality
    const productImage = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');

    productImage.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.addEventListener('load', function() {
                previewImage.style.display = 'block';
                previewImage.setAttribute('src', this.result);
                imagePreview.querySelector('p').style.display = 'none';
            });
            
            reader.readAsDataURL(file);
        } else {
            previewImage.style.display = 'none';
            previewImage.setAttribute('src', '#');
            imagePreview.querySelector('p').style.display = 'block';
        }
    });

    // Form Submission
    const productForm = document.getElementById('productForm');
    const productList = document.getElementById('productList');
    
    // Load existing products from localStorage
    let products = JSON.parse(localStorage.getItem('sellerProducts')) || [];
    updateProductList();
    updateStats();

    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const brand = document.getElementById('productBrand').value;
        const model = document.getElementById('productModel').value;
        const price = document.getElementById('productPrice').value;
        const storage = document.getElementById('productStorage').value;
        const description = document.getElementById('productDescription').value;
        const imageFile = productImage.files[0];
        
        // Create product object
        const product = {
            id: Date.now(),
            brand,
            model,
            price,
            storage,
            description,
            image: imageFile ? URL.createObjectURL(imageFile) : '',
            date: new Date().toLocaleDateString()
        };
        
        // Add to products array
        products.push(product);
        
        // Save to localStorage
        localStorage.setItem('sellerProducts', JSON.stringify(products));
        
        // Update UI
        updateProductList();
        updateStats();
        
        // Reset form
        productForm.reset();
        previewImage.style.display = 'none';
        imagePreview.querySelector('p').style.display = 'block';
        
        // Show success message
        alert('Product added successfully!');
    });

    // Update product list in UI
    function updateProductList() {
        if (products.length === 0) {
            productList.innerHTML = '<div class="no-products"><p>You haven\'t added any products yet.</p></div>';
            return;
        }
        
        productList.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.brand} ${product.model}">
                </div>
                <div class="product-info">
                    <h3>${product.brand} ${product.model}</h3>
                    <p class="product-storage">${product.storage}</p>
                    <p class="product-price">Rs. ${product.price}</p>
                    <p class="product-description">${product.description}</p>
                    <p class="product-date">Added: ${product.date}</p>
                </div>
                <div class="product-actions">
                    <button class="btn btn-edit"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-delete"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;
            productList.appendChild(productCard);
        });
    }

    // Update dashboard stats
    function updateStats() {
        document.getElementById('totalProducts').textContent = products.length;
        // In a real app, you would calculate these from actual data
        document.getElementById('totalOrders').textContent = '12';
        document.getElementById('totalEarnings').textContent = 'Rs. 1,84,999';
    }

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function() {
        // In a real app, you would clear the session/token
        localStorage.removeItem('sellerToken');
        window.location.href = 'index.html';
    });
});