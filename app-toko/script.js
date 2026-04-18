// URL API yang sudah kita buat sebelumnya
const API_URL = 'http://localhost/api-toko/';

// Referensi elemen DOM
const productContainer = document.getElementById('product-container');
const loadingContainer = document.getElementById('loading-container');
const errorContainer = document.getElementById('error-container');
const apiStatus = document.getElementById('api-status');

// Helper function untuk memformat mata uang Rupiah
const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
};

// Map kategori ke ikon Phosphor
const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
        case 'elektronik':
            return 'ph-laptop';
        case 'fashion':
            return 'ph-sneaker';
        case 'makanan & minuman':
            return 'ph-coffee';
        default:
            return 'ph-package';
    }
};

// Fungsi utama untuk mengambil data dari API
async function fetchProducts() {
    try {
        // Tampilkan status loading
        apiStatus.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Mengambil data...';
        apiStatus.className = 'status-badge';

        // Lakukan request ke Backend API
        const response = await fetch(API_URL);
        
        // Cek apakah response sukses (HTTP 200)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Sembunyikan skeleton loading
        loadingContainer.style.display = 'none';

        if (result.status === 'success' && result.data && result.data.products) {
            // Update status badge menjadi sukses
            apiStatus.innerHTML = '<i class="ph-fill ph-check-circle"></i> Terhubung (' + result.data.products.length + ' produk)';
            apiStatus.className = 'status-badge success';

            // Tampilkan container dan render data produk
            productContainer.style.display = 'grid';
            renderProducts(result.data.products);
        } else {
            throw new Error('Format data tidak sesuai ekspektasi');
        }

    } catch (error) {
        console.error('Ada masalah saat fetch API:', error);
        
        // Update status UI jika error
        apiStatus.innerHTML = '<i class="ph-fill ph-x-circle"></i> Gagal Terhubung';
        apiStatus.className = 'status-badge error';
        
        loadingContainer.style.display = 'none';
        errorContainer.style.display = 'block';
    }
}

// Fungsi untuk me-render produk ke dalam HTML
function renderProducts(products) {
    productContainer.innerHTML = ''; // Kosongkan container

    products.forEach(product => {
        const iconClass = getCategoryIcon(product.category);
        
        // Buat elemen card untuk setiap produk
        const cardHTML = `
            <div class="product-card">
                <span class="category-tag">${product.category}</span>
                <div class="product-icon">
                    <i class="ph ${iconClass}"></i>
                </div>
                <h4 class="product-name">${product.name}</h4>
                <div class="product-price">${formatRupiah(product.price)}</div>
                
                <div class="product-footer">
                    <span class="product-stock">
                        <i class="ph-fill ph-package"></i> Sisa: ${product.stock}
                    </span>
                    <button class="btn-add" onclick="alert('Anda menambahkan ${product.name} ke keranjang!')">
                        + Keranjang
                    </button>
                </div>
            </div>
        `;
        
        // Append ke container utama
        productContainer.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// Jalankan fungsi fetchProducts saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', fetchProducts);
