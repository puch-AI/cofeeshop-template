// admin.js - Cloudinary for images + LocalStorage for data
console.log("Admin.js loaded - Cloudinary + LocalStorage");

// Cloudinary Configuration - GANTI DENGAN CLOUD NAME ANDA
const cloudinaryConfig = {
    cloudName: 'dyxw1w0sh',
    uploadPreset: 'brew_bean_products'
};

// ==================== DATA MANAGEMENT ====================
function getProducts() {
    return JSON.parse(localStorage.getItem('brewBeanProducts')) || [];
}

function saveProducts(products) {
    localStorage.setItem('brewBeanProducts', JSON.stringify(products));
}

function getHeroData() {
    return JSON.parse(localStorage.getItem('brewBeanHero')) || {};
}

function saveHeroData(heroData) {
    localStorage.setItem('brewBeanHero', JSON.stringify(heroData));
}

// ==================== CLOUDINARY UPLOAD ====================
async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('cloud_name', cloudinaryConfig.cloudName);

    try {
        showAlert('Mengupload gambar ke Cloudinary...', 'info');
        
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload gagal: ' + response.statusText);
        }

        const data = await response.json();
        console.log('Cloudinary upload success:', data);
        showAlert('✅ Gambar berhasil diupload!', 'success');
        return data.secure_url;

    } catch (error) {
        console.error('Cloudinary upload error:', error);
        showAlert('❌ Error upload gambar: ' + error.message, 'error');
        throw error;
    }
}

// ==================== GLOBAL FUNCTIONS ====================
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update active menu
    document.querySelectorAll('.admin-menu a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

function previewImage(input, previewId) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(previewId);
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
}

function showAlert(message, type = 'success') {
    const alert = document.getElementById('alertMessage');
    alert.textContent = message;
    alert.className = `alert alert-${type}`;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 4000);
}

// ==================== HERO SECTION FUNCTIONS ====================
function saveHeroSection() {
    const heroData = {
        title: document.getElementById('heroTitle').value,
        description: document.getElementById('heroDescription').value,
        button1: document.getElementById('heroButton1').value,
        button2: document.getElementById('heroButton2').value,
        image: document.getElementById('heroImagePreview').src || '',
        updatedAt: new Date()
    };

    saveHeroData(heroData);
    showAlert('✅ Hero section berhasil disimpan!');
}

function loadHeroData() {
    const heroData = getHeroData();
    if (heroData.title) document.getElementById('heroTitle').value = heroData.title;
    if (heroData.description) document.getElementById('heroDescription').value = heroData.description;
    if (heroData.button1) document.getElementById('heroButton1').value = heroData.button1;
    if (heroData.button2) document.getElementById('heroButton2').value = heroData.button2;
    if (heroData.image) {
        document.getElementById('heroImagePreview').src = heroData.image;
        document.getElementById('heroImagePreview').style.display = 'block';
    }
}

// ==================== PRODUCT MANAGEMENT FUNCTIONS ====================
function showAddProductForm() {
    document.getElementById('addProductForm').style.display = 'block';
}

function hideAddProductForm() {
    document.getElementById('addProductForm').style.display = 'none';
    resetProductForm();
}

function resetProductForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productCategory').value = 'coffee';
    document.getElementById('productDescription').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productOriginalPrice').value = '';
    document.getElementById('productBadge').value = '';
    document.getElementById('productImagePreview').style.display = 'none';
    document.getElementById('productImagePreview').src = '';
    document.getElementById('productImageUpload').value = '';
}

async function saveProduct() {
    const productName = document.getElementById('productName').value;
    const productPrice = parseInt(document.getElementById('productPrice').value);
    
    if (!productName || !productPrice) {
        showAlert('❌ Nama produk dan harga harus diisi!', 'error');
        return;
    }

    let imageUrl = '';
    const imageFile = document.getElementById('productImageUpload').files[0];

    // Upload image to Cloudinary if exists
    if (imageFile) {
        try {
            imageUrl = await uploadToCloudinary(imageFile);
        } catch (error) {
            // Jika Cloudinary gagal, gunakan Base64 sebagai fallback
            imageUrl = document.getElementById('productImagePreview').src;
            showAlert('⚠️ Gambar disimpan secara lokal (Cloudinary gagal)', 'info');
        }
    }

    const product = {
        id: Date.now().toString(),
        name: productName,
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDescription').value,
        price: productPrice,
        originalPrice: parseInt(document.getElementById('productOriginalPrice').value) || null,
        image: imageUrl,
        badge: document.getElementById('productBadge').value || '',
        createdAt: new Date(),
        status: 'active'
    };

    // Save to localStorage
    const products = getProducts();
    products.push(product);
    saveProducts(products);
    
    showAlert('✅ Produk berhasil disimpan!');
    loadProducts();
    hideAddProductForm();
    loadDashboardStats();
}

function loadProducts() {
    const products = getProducts();
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--gray-dark);">
                <i class="fas fa-coffee" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>Belum ada produk.</p>
                <p>Klik "Tambah Produk Baru" untuk menambah produk pertama!</p>
            </div>
        `;
        return;
    }

    products.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card-admin';
        productCard.innerHTML = `
            <img src="${product.image || 'https://images.unsplash.com/photo-1561047029-3000c68339ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}" 
                 class="product-image-admin" alt="${product.name}"
                 onerror="this.src='https://via.placeholder.com/300x150/8B4513/FFFFFF?text=No+Image'">
            <h4>${product.name}</h4>
            <p style="color: var(--gray-dark); margin: 0.5rem 0; font-size: 0.9rem;">${product.description}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 1rem 0;">
                <strong style="color: var(--primary); font-size: 1.1rem;">Rp ${product.price.toLocaleString()}</strong>
                ${product.badge ? `<span style="background: var(--primary); color: white; padding: 0.25rem 0.75rem; border-radius: var(--radius); font-size: 0.8rem; font-weight: 600;">${product.badge}</span>` : ''}
            </div>
            <div style="color: var(--gray); font-size: 0.8rem; margin-bottom: 1rem;">
                ${product.category} • ${new Date(product.createdAt).toLocaleDateString('id-ID')}
            </div>
            <div class="product-actions">
                <button class="btn-admin" onclick="editProduct(${index})" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-admin btn-secondary" onclick="deleteProduct(${index})" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

function editProduct(index) {
    const products = getProducts();
    const product = products[index];
    
    // Isi form dengan data produk yang akan diedit
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productOriginalPrice').value = product.originalPrice || '';
    document.getElementById('productBadge').value = product.badge || '';
    
    if (product.image) {
        document.getElementById('productImagePreview').src = product.image;
        document.getElementById('productImagePreview').style.display = 'block';
    }
    
    // Hapus produk lama
    products.splice(index, 1);
    saveProducts(products);
    
    // Tampilkan form edit
    showAddProductForm();
    showAlert('✏️ Edit produk - isi form dan klik simpan', 'info');
}

function deleteProduct(index) {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
        const products = getProducts();
        products.splice(index, 1);
        saveProducts(products);
        loadProducts();
        loadDashboardStats();
        showAlert('🗑️ Produk berhasil dihapus!');
    }
}

// ==================== DASHBOARD FUNCTIONS ====================
function loadDashboardStats() {
    const products = getProducts();
    document.getElementById('totalProducts').textContent = products.length;
}

function exportData() {
    const data = {
        products: getProducts(),
        hero: getHeroData(),
        exportedAt: new Date()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `brewbean-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showAlert('📥 Data berhasil diexport!');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.products) {
                    saveProducts(data.products);
                }
                if (data.hero) {
                    saveHeroData(data.hero);
                }
                
                loadProducts();
                loadHeroData();
                loadDashboardStats();
                showAlert('📤 Data berhasil diimport!');
            } catch (error) {
                showAlert('❌ Error import data: File tidak valid', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log("Admin dashboard initialized!");
    
    // Load all data
    loadDashboardStats();
    loadHeroData();
    loadProducts();
    
    // Add sample data if empty
    const products = getProducts();
    if (products.length === 0) {
        showAlert('✨ Selamat datang! Tambah produk pertama Anda.', 'info');
    }
});