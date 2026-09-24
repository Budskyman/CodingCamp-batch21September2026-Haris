/**
 * E-CANTEEN - MAIN APPLICATION SCRIPT (LENGKAP)
 * Bahasa Indonesia | Mata Uang Rupiah | CRUD Lengkap
 */

// ==================== GLOBAL VARIABLES ====================
let products = [];
let currentCart = [];
let currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
let currentMenuFilter = 'Semua';

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    loadProductsFromStorage();
    initPageBasedOnCurrentURL();
});

function initPageBasedOnCurrentURL() {
    if (currentPage === 'dashboard.html') {
        initDashboard();
    } else if (currentPage === 'inventory.html') {
        initInventory();
    } else if (currentPage === 'payment.html') {
        initPayment();
    } else if (currentPage === 'history.html') {
        initHistory();
    } else if (currentPage === 'setting.html') {
        initSettings();
    }
}

// ==================== LOCAL STORAGE MANAGEMENT ====================
function loadProductsFromStorage() {
    const stored = localStorage.getItem('eCanteen_products');
    if (stored && JSON.parse(stored).length > 0) {
        products = JSON.parse(stored);
    } else {
        // Data default produk dengan variasi stok (ada yang stok menipis)
        products = [
            { id: 'PRD-9023', name: 'Nasi Ayam Geprek', category: 'Makanan', price: 19000, stock: 7, status: 'Stok Menipis', image: 'Styles/images/geprek.jpeg' },
            { id: 'PRD-3112', name: 'Le-Minerale', category: 'Minuman', price: 5000, stock: 12, status: 'Stok Menipis', image: 'Styles/images/LE-MINERAL FAIR-MINERAL-1500ml-BTL.jpg' },
            { id: 'PRD-3113', name: 'ABC Kopi Botol', category: 'Minuman', price: 4500, stock: 23, status: 'Tersedia', image: 'Styles/images/abc kopsu.jpg' },
            { id: 'PRD-4456', name: 'Aneka Gorengan', category: 'Makanan', price: 1500, stock: 82, status: 'Tersedia', image: 'Styles/images/gorengan.jpg' },
            { id: 'PRD-7782', name: 'Sari Gandum', category: 'Makanan', price: 2500, stock: 32, status: 'Tersedia', image: 'Styles/images/sari gandum.jpg' },
            { id: 'PRD-7783', name: 'Mie Cup', category: 'Makanan', price: 7000, stock: 20, status: 'Tersedia', image: 'Styles/images/pop mie.jpg' },
            { id: 'PRD-1102', name: 'Good Day', category: 'Minuman', price: 7500, stock: 32, status: 'Tersedia', image: 'Styles/images/good day.jpg' },
            { id: 'PRD-1103', name: 'Nasi Padang', category: 'Makanan', price: 19000, stock: 34, status: 'Tersedia', image: 'Styles/images/nasi-padang-bungkus.jpeg' },
            { id: 'PRD-5502', name: 'Nasi Uduk', category: 'Makanan', price: 10000, stock: 23, status: 'Tersedia', image: 'Styles/images/Nasi_uduk_netherlands.jpg' }
        ];
        saveProductsToStorage();
    }
}

function saveProductsToStorage() {
    localStorage.setItem('eCanteen_products', JSON.stringify(products));
}

function loadCartFromStorage() {
    const stored = localStorage.getItem('eCanteen_cart');
    if (stored) {
        currentCart = JSON.parse(stored);
    } else {
        currentCart = [];
    }
    return currentCart;
}

function saveCartToStorage() {
    localStorage.setItem('eCanteen_cart', JSON.stringify(currentCart));
}

function getTransactionsFromStorage() {
    const stored = localStorage.getItem('eCanteen_transactions');
    return stored ? JSON.parse(stored) : [];
}

function saveTransaction(transaction) {
    const transactions = getTransactionsFromStorage();
    transactions.unshift({
        ...transaction,
        date: transaction.date || new Date().toLocaleDateString('id-ID'),
        time: transaction.time || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    });
    localStorage.setItem('eCanteen_transactions', JSON.stringify(transactions.slice(0, 100)));
    
    // Update dashboard jika sedang di halaman dashboard
    if (currentPage === 'dashboard.html') {
        updateDashboardStats();
        loadRecentTransactions();
        loadLowStockItems();
    }
    
    // Update history jika sedang di halaman history
    if (currentPage === 'history.html') {
        loadTransactionHistory();
        updateDailyRevenue();
    }
}

// ==================== FORMATTERS ====================
function formatRupiah(amount) {
    if (isNaN(amount) || amount === null || amount === undefined) {
        amount = 0;
    }
    // Format dengan titik sebagai pemisah ribuan
    const formatted = Math.floor(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Rp ${formatted}`;
}

// ==================== DASHBOARD FUNCTIONS ====================
function initDashboard() {
    updateDashboardStats();
    loadRecentTransactions();
    loadLowStockItems();
}

function updateDashboardStats() {
    const transactions = getTransactionsFromStorage();
    const today = new Date().toLocaleDateString('id-ID');
    
    // 1. Total Sales Today (Penjualan Hari Ini)
    const todaySales = transactions
        .filter(t => t.date === today)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalSalesElement = document.querySelector('.col-md-4:first-child .kpi-value');
    if (totalSalesElement) {
        totalSalesElement.innerText = formatRupiah(todaySales);
    }
    
    // Update persentase perubahan dari kemarin
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('id-ID');
    const yesterdaySales = transactions
        .filter(t => t.date === yesterdayStr)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const percentageChange = yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales * 100).toFixed(0) : 0;
    const trendingSpan = document.querySelector('.col-md-4:first-child .trending-badge');
    if (trendingSpan) {
        const isPositive = percentageChange >= 0;
        trendingSpan.innerHTML = `
            <span class="material-symbols-outlined fs-6">${isPositive ? 'trending_up' : 'trending_down'}</span>
            ${isPositive ? '+' : ''}${percentageChange}%
        `;
        trendingSpan.style.backgroundColor = isPositive ? '#e6fcf5' : '#ffe6e6';
        trendingSpan.style.color = isPositive ? '#0ca678' : '#e03131';
    }
    
    // 2. Transactions Count (Jumlah Transaksi Hari Ini)
    const todayCount = transactions.filter(t => t.date === today).length;
    const transactionCountElement = document.querySelector('.col-md-4:nth-child(2) .kpi-value');
    if (transactionCountElement) {
        transactionCountElement.innerText = todayCount;
    }
    
    // Update average checkout time (simulasi dari data)
    const avgTimeElement = document.querySelector('.col-md-4:nth-child(2) .text-muted.small');
    if (avgTimeElement && transactions.length > 0) {
        const avgTime = (Math.random() * 2 + 0.5).toFixed(1);
        avgTimeElement.innerHTML = `Rata-rata waktu checkout: ${avgTime}m`;
    }
    
    // 3. Most Popular Item (Produk Terlaris)
    // Kumpulkan semua item dari transaksi
    const allItems = [];
    transactions.forEach(trx => {
        const items = trx.items.split(', ');
        items.forEach(item => {
            // Parse quantity dan nama item (contoh: "2x Burger Klasik")
            const match = item.match(/(\d+)x\s+(.+)/);
            if (match) {
                const quantity = parseInt(match[1]);
                const name = match[2];
                allItems.push({ name: name, quantity: quantity });
            } else {
                allItems.push({ name: item, quantity: 1 });
            }
        });
    });
    
    // Hitung total quantity per item
    const itemSales = {};
    allItems.forEach(item => {
        if (itemSales[item.name]) {
            itemSales[item.name] += item.quantity;
        } else {
            itemSales[item.name] = item.quantity;
        }
    });
    
    // Cari item terlaris
    let mostPopular = { name: 'Belum ada data', quantity: 0 };
    for (const [name, qty] of Object.entries(itemSales)) {
        if (qty > mostPopular.quantity) {
            mostPopular = { name: name, quantity: qty };
        }
    }
    
    const popularItemElement = document.querySelector('.col-md-4:last-child .h4');
    const popularItemQtyElement = document.querySelector('.col-md-4:last-child .text-muted.small.mt-2');
    
    if (popularItemElement && mostPopular.name !== 'Belum ada data') {
        popularItemElement.innerText = mostPopular.name;
        if (popularItemQtyElement) {
            popularItemQtyElement.innerHTML = `${mostPopular.quantity} unit terjual hari ini`;
        }
    } else if (popularItemElement) {
        popularItemElement.innerText = 'Classic Beef Burger';
        if (popularItemQtyElement) {
            popularItemQtyElement.innerHTML = '42 unit terjual hari ini (demo)';
        }
    }
}

function loadRecentTransactions() {
    const tbody = document.querySelector('.table-custom tbody');
    if (!tbody) return;
    
    const transactions = getTransactionsFromStorage();
    const recentTransactions = transactions.slice(0, 5);
    
    if (recentTransactions.length === 0) {
        // Data demo jika belum ada transaksi
        tbody.innerHTML = `
            <tr>
                <td class="fw-bold">#TRX-8842</td>
                <td class="fw-medium">Adi Wijaya</td>
                <td class="text-muted">Burger Klasik, Es Teh</td>
                <td class="fw-bold">${formatRupiah(65000)}</td>
                <td><span class="status-badge status-completed">Selesai</span></td>
                <td class="text-muted">14:22</td>
            </tr>
            <tr>
                <td class="fw-bold">#TRX-8841</td>
                <td class="fw-medium">Siti Aminah</td>
                <td class="text-muted">Nasi Goreng Spesial</td>
                <td class="fw-bold">${formatRupiah(35000)}</td>
                <td><span class="status-badge status-completed">Selesai</span></td>
                <td class="text-muted">14:18</td>
            </tr>
            <tr>
                <td class="fw-bold">#TRX-8840</td>
                <td class="fw-medium">Budi Santoso</td>
                <td class="text-muted">Cappuccino, Croissant</td>
                <td class="fw-bold">${formatRupiah(58000)}</td>
                <td><span class="status-badge status-completed">Selesai</span></td>
                <td class="text-muted">14:05</td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = '';
    recentTransactions.forEach(trx => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="fw-bold">${trx.id}</td>
            <td class="fw-medium">${trx.employee}</td>
            <td class="text-muted">${trx.items.substring(0, 35)}${trx.items.length > 35 ? '...' : ''}</td>
            <td class="fw-bold">${formatRupiah(trx.amount)}</td>
            <td><span class="status-badge status-completed">Selesai</span></td>
            <td class="text-muted">${trx.time}</td>
        `;
        tbody.appendChild(row);
    });
}

function loadLowStockItems() {
    console.log('Loading low stock items...', products); // Debug
    
    // Cari container low stock di dashboard
    const lowStockCard = document.querySelector('.col-lg-4 .card.p-4.mb-4');
    if (!lowStockCard) {
        console.log('Low stock card not found');
        return;
    }
    
    // Ambil produk dengan stok menipis (stok < 20) dan produk habis (stok === 0)
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < 20);
    const outOfStockProducts = products.filter(p => p.stock === 0);
    
    console.log('Low stock products:', lowStockProducts);
    console.log('Out of stock products:', outOfStockProducts);
    
    // Cari atau buat container untuk daftar low stock
    let lowStockList = lowStockCard.querySelector('.low-stock-list-container');
    
    if (!lowStockList) {
        // Hapus low-stock-item yang sudah ada (hardcoded dari HTML)
        const existingItems = lowStockCard.querySelectorAll('.low-stock-item');
        existingItems.forEach(item => item.remove());
        
        // Buat container baru
        lowStockList = document.createElement('div');
        lowStockList.className = 'low-stock-list-container';
        
        // Sisipkan setelah header (d-flex justify-content-between)
        const header = lowStockCard.querySelector('.d-flex.justify-content-between.align-items-center');
        if (header) {
            header.insertAdjacentElement('afterend', lowStockList);
        } else {
            lowStockCard.appendChild(lowStockList);
        }
    }
    
    // Kosongkan container
    lowStockList.innerHTML = '';
    
    // Jika tidak ada produk yang stoknya menipis atau habis
    if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
        lowStockList.innerHTML = `
            <div class="text-center text-muted py-4">
                <span class="material-symbols-outlined" style="font-size: 48px;">check_circle</span>
                <p class="mb-0 mt-2">Semua stok aman</p>
                <small class="text-muted">Tidak ada produk dengan stok menipis</small>
            </div>
        `;
        // Update badge count
        updateLowStockBadge(lowStockCard, 0);
        return;
    }
    
    // Tampilkan produk stok menipis (stok 1-19)
    lowStockProducts.forEach(product => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'low-stock-item';
        // Warna berdasarkan persentase stok
        const stockPercent = (product.stock / 100) * 100;
        let bgColor = '#fff3cd'; // kuning muda untuk stok menipis
        let borderColor = '#ffc107';
        
        if (product.stock < 10) {
            bgColor = '#fff0f0';
            borderColor = '#dc3545';
        }
        
        itemDiv.style.backgroundColor = bgColor;
        itemDiv.style.border = `1px solid ${borderColor}`;
        itemDiv.style.borderRadius = '8px';
        
        itemDiv.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <div class="fw-bold small" style="color: var(--primary);">${product.name}</div>
                    <div class="small text-muted">Sisa: ${product.stock} unit</div>
                    <div class="progress mt-1" style="height: 4px; width: 120px;">
                        <div class="progress-bar bg-warning" role="progressbar" style="width: ${stockPercent}%"></div>
                    </div>
                </div>
                <span class="badge text-uppercase" style="background-color: ${borderColor}; color: white; font-size: 9px;">
                    ${product.stock < 10 ? 'Kritis' : 'Stok Menipis'}
                </span>
            </div>
        `;
        lowStockList.appendChild(itemDiv);
    });
    
    // Tampilkan produk habis (stok === 0)
    outOfStockProducts.forEach(product => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'low-stock-item critical-alert';
        itemDiv.style.backgroundColor = '#f8d7da';
        itemDiv.style.border = '1px solid #dc3545';
        itemDiv.style.borderRadius = '8px';
        
        itemDiv.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <div class="fw-bold small">${product.name}</div>
                    <div class="small opacity-75">Sisa: 0 unit</div>
                </div>
                <span class="badge bg-danger text-uppercase" style="font-size: 9px;">Habis</span>
            </div>
            <div class="mt-2">
                <button class="btn btn-sm btn-outline-danger restock-btn" data-id="${product.id}" style="font-size: 10px; padding: 2px 8px;">
                    <span class="material-symbols-outlined" style="font-size: 12px;">inventory</span> Restock
                </button>
            </div>
        `;
        lowStockList.appendChild(itemDiv);
    });
    
    // Update badge jumlah alert
    const totalAlert = lowStockProducts.length + outOfStockProducts.length;
    updateLowStockBadge(lowStockCard, totalAlert);
    
    // Event listener untuk tombol restock
    document.querySelectorAll('.restock-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const productId = this.dataset.id;
            const product = products.find(p => p.id === productId);
            if (product) {
                showModal('Restock Produk', `
                    <div class="mb-3">
                        <label class="form-label fw-bold">Produk: ${product.name}</label>
                        <input type="number" id="restockQty" class="form-control" placeholder="Jumlah tambahan stok" min="1" max="100">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Stok saat ini: ${product.stock}</label>
                    </div>
                `, () => {
                    const qty = parseInt(document.getElementById('restockQty')?.value);
                    if (qty && qty > 0) {
                        product.stock = Math.min(product.stock + qty, 100);
                        product.status = product.stock === 0 ? 'Habis' : (product.stock < 20 ? 'Stok Menipis' : 'Tersedia');
                        saveProductsToStorage();
                        renderProductTable(); // Update inventory table jika ada
                        loadLowStockItems(); // Refresh low stock list
                        updateInventoryStats(); // Update stats di inventory
                        showToast(`${product.name} berhasil di-restock! Stok sekarang: ${product.stock}`, 'success');
                    } else {
                        showToast('Masukkan jumlah yang valid!', 'error');
                        return false;
                    }
                    return true;
                });
            }
        });
    });
}

function updateLowStockBadge(card, count) {
    // Cari atau buat badge untuk menampilkan jumlah
    const header = card.querySelector('.d-flex.justify-content-between.align-items-center');
    if (header) {
        let badge = header.querySelector('.low-stock-count-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'badge bg-danger rounded-pill low-stock-count-badge';
            badge.style.marginLeft = '8px';
            header.querySelector('h5, .h6').appendChild(badge);
        }
        if (count > 0) {
            badge.innerText = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

function loadRecentTransactions() {
    const tbody = document.querySelector('.table-custom tbody');
    if (!tbody) return;
    
    const transactions = getTransactionsFromStorage();
    const recentTransactions = transactions.slice(0, 5);
    
    if (recentTransactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Belum ada transaksi hari ini</td></tr>`;
        return;
    }
    
    tbody.innerHTML = '';
    recentTransactions.forEach(trx => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="fw-bold">${trx.id}</td>
            <td class="fw-medium">${trx.employee}</td>
            <td class="text-muted">${trx.items.substring(0, 30)}${trx.items.length > 30 ? '...' : ''}</td>
            <td class="fw-bold">${formatRupiah(trx.amount)}</td>
            <td><span class="status-badge status-completed">Selesai</span></td>
            <td class="text-muted">${trx.time}</td>
        `;
        tbody.appendChild(row);
    });
}

// ==================== INVENTORY FUNCTIONS (CRUD) ====================
function initInventory() {
    renderProductTable();
    updateInventoryStats();
    initAddProductModal();
    
    // Setup filter dan sort
    const filterBtn = document.querySelector('.btn-white.border:first-child');
    if (filterBtn) {
        filterBtn.addEventListener('click', () => showFilterModal());
    }
    
    const sortBtn = document.querySelectorAll('.btn-white.border')[1];
    if (sortBtn) {
        sortBtn.addEventListener('click', () => showSortModal());
    }
}

function renderProductTable() {
    const tbody = document.querySelector('.table-responsive table tbody');
    if (!tbody) return;
    
    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-5">Belum ada produk. Klik "Tambah Produk Baru" untuk memulai.</td></tr>`;
        return;
    }
    
    tbody.innerHTML = '';
    products.forEach((product, index) => {
        const row = document.createElement('tr');
        const stockPercent = (product.stock / 100) * 100;
        let stockColor = '#10b981';
        let statusColor = '#10b981';
        
        if (product.stock === 0) {
            stockColor = '#cbd5e1';
            statusColor = '#6c757d';
        } else if (product.stock < 20) {
            stockColor = 'var(--error)';
            statusColor = 'var(--error)';
        } else {
            stockColor = 'var(--primary-container)';
            statusColor = '#10b981';
        }
        
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-3">
                    <img alt="${product.name}" class="product-img" src="${product.image}">
                    <div>
                        <div class="fw-bold" style="color: var(--primary);">${product.name}</div>
                        <small class="text-muted">ID: ${product.id}</small>
                    </div>
                </div>
            </td>
            <td><span class="badge-category">${product.category}</span></td>
            <td class="fw-bold" style="color: var(--primary);">${formatRupiah(product.price)}</td>
            <td style="width: 140px;">
                <div class="d-flex justify-content-between small fw-bold text-muted mb-1">
                    <span>${product.stock}/100</span>
                </div>
                <div class="progress rounded-pill">
                    <div class="progress-bar" role="progressbar" style="width: ${Math.min(stockPercent, 100)}%; background-color: ${stockColor};"></div>
                </div>
            </td>
            <td>
                <div class="d-flex align-items-center gap-2 fw-bold small" style="color: ${statusColor};">
                    <span class="rounded-circle d-inline-block" style="width: 8px; height: 8px; background-color: ${statusColor};"></span>
                    ${product.status}
                </div>
            </td>
            <td class="text-end">
                <button class="btn btn-light btn-sm p-2 edit-product" data-index="${index}"><span class="material-symbols-outlined fs-5">edit</span></button>
                <button class="btn btn-light btn-sm p-2 text-danger delete-product" data-index="${index}"><span class="material-symbols-outlined fs-5">delete</span></button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', () => editProduct(parseInt(btn.dataset.index)));
    });
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', () => deleteProduct(parseInt(btn.dataset.index)));
    });
}

function updateInventoryStats() {
    const totalProducts = document.querySelector('.stat-card:first-child .fw-bold');
    if (totalProducts) totalProducts.innerText = products.length;
    
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 20).length;
    const lowStockElement = document.querySelector('.stat-card:nth-child(2) .fw-bold');
    if (lowStockElement) lowStockElement.innerText = lowStockCount;
}

function initAddProductModal() {
    const addBtn = document.querySelector('.btn-primary-sc');
    if (!addBtn) return;
    
    addBtn.addEventListener('click', () => {
        showModal('Tambah Produk Baru', `
            <div class="mb-3">
                <label class="form-label fw-bold">Nama Produk</label>
                <input type="text" id="prodName" class="form-control" placeholder="Contoh: Nasi Goreng">
            </div>
            <div class="mb-3">
                <label class="form-label fw-bold">Kategori</label>
                <select id="prodCategory" class="form-select">
                    <option>Makanan</option>
                    <option>Minuman</option>
                    <option>Makanan Ringan</option>
                    <option>Lain-lain</option>
                </select>
            </div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Harga (Rp)</label>
                    <input type="number" id="prodPrice" class="form-control" placeholder="0">
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Stok</label>
                    <input type="number" id="prodStock" class="form-control" placeholder="0-100">
                </div>
            </div>
        `, () => {
            const name = document.getElementById('prodName')?.value;
            const category = document.getElementById('prodCategory')?.value;
            const price = parseInt(document.getElementById('prodPrice')?.value);
            const stock = parseInt(document.getElementById('prodStock')?.value);
            
            if (!name || isNaN(price) || isNaN(stock)) {
                showToast('Mohon isi semua field dengan benar!', 'error');
                return false;
            }
            
            const newProduct = {
                id: `PRD-${Math.floor(Math.random() * 9000 + 1000)}`,
                name: name,
                category: category,
                price: price,
                stock: stock,
                status: stock === 0 ? 'Habis' : (stock < 20 ? 'Stok Menipis' : 'Tersedia'),
                image: 'https://placehold.co/100x80?text=Product'
            };
            
            products.push(newProduct);
            saveProductsToStorage();
            renderProductTable();
            updateInventoryStats();
            showToast('Produk berhasil ditambahkan!', 'success');
            return true;
        });
    });
}

function showFilterModal() {
    showModal('Filter Produk', `
        <div class="mb-3">
            <label class="form-label fw-bold">Kategori</label>
            <select id="filterCategory" class="form-select">
                <option value="">Semua</option>
                <option>Makanan</option>
                <option>Minuman</option>
                <option>Makanan Ringan</option>
                <option>Lain-lain</option>
            </select>
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Status</label>
            <select id="filterStatus" class="form-select">
                <option value="">Semua</option>
                <option>Tersedia</option>
                <option>Stok Menipis</option>
                <option>Habis</option>
            </select>
        </div>
    `, () => {
        showToast('Filter diterapkan!', 'success');
        return true;
    });
}

function showSortModal() {
    showModal('Urutkan Produk', `
        <div class="mb-3">
            <label class="form-label fw-bold">Urutkan berdasarkan</label>
            <select id="sortBy" class="form-select">
                <option value="name">Nama (A-Z)</option>
                <option value="price-asc">Harga (Terendah)</option>
                <option value="price-desc">Harga (Tertinggi)</option>
                <option value="stock">Stok (Terbanyak)</option>
            </select>
        </div>
    `, () => {
        showToast('Pengurutan diterapkan!', 'success');
        return true;
    });
}

function editProduct(index) {
    const product = products[index];
    showModal('Edit Produk', `
        <div class="mb-3">
            <label class="form-label fw-bold">Nama Produk</label>
            <input type="text" id="prodName" class="form-control" value="${product.name}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Kategori</label>
            <select id="prodCategory" class="form-select">
                <option ${product.category === 'Makanan' ? 'selected' : ''}>Makanan</option>
                <option ${product.category === 'Minuman' ? 'selected' : ''}>Minuman</option>
                <option ${product.category === 'Makanan Ringan' ? 'selected' : ''}>Makanan Ringan</option>
                <option ${product.category === 'Lain-lain' ? 'selected' : ''}>Lain-lain</option>
            </select>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Harga (Rp)</label>
                <input type="number" id="prodPrice" class="form-control" value="${product.price}">
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Stok</label>
                <input type="number" id="prodStock" class="form-control" value="${product.stock}">
            </div>
        </div>
    `, () => {
        product.name = document.getElementById('prodName')?.value || product.name;
        product.category = document.getElementById('prodCategory')?.value || product.category;
        product.price = parseInt(document.getElementById('prodPrice')?.value) || product.price;
        product.stock = parseInt(document.getElementById('prodStock')?.value) || product.stock;
        product.status = product.stock === 0 ? 'Habis' : (product.stock < 20 ? 'Stok Menipis' : 'Tersedia');
        
        saveProductsToStorage();
        renderProductTable();
        showToast('Produk berhasil diupdate!', 'success');
        return true;
    });
}

function deleteProduct(index) {
    const product = products[index];
    showConfirmDialog(`Hapus Produk`, `Apakah Anda yakin ingin menghapus "${product.name}"?`, () => {
        products.splice(index, 1);
        saveProductsToStorage();
        renderProductTable();
        updateInventoryStats();
        showToast('Produk berhasil dihapus!', 'success');
    });
}

// ==================== PAYMENT / CHECKOUT FUNCTIONS ====================
function initPayment() {
    loadCart();
    updateCartDisplay();
    renderMenuItems();
    initCategoryFilters();
    initKeypad();
    initPaymentMethods();
}

function renderMenuItems() {
    const menuContainer = document.querySelector('.row.g-3');
    if (!menuContainer) return;
    
    let filteredProducts = products.filter(p => p.stock > 0);
    
    if (currentMenuFilter !== 'Semua') {
        filteredProducts = filteredProducts.filter(p => p.category === currentMenuFilter);
    }
    
    if (filteredProducts.length === 0) {
        menuContainer.innerHTML = `
            <div class="col-12 text-center text-muted py-5">
                <span class="material-symbols-outlined" style="font-size: 48px;">restaurant_menu</span>
                <p class="mt-2">Tidak ada menu untuk kategori ini</p>
            </div>
        `;
        return;
    }
    
    menuContainer.innerHTML = '';
    
    filteredProducts.forEach(product => {
        const col = document.createElement('div');
        col.className = 'col-6 col-sm-4';
        col.innerHTML = `
            <div class="item-card position-relative" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">
                <div class="price-badge">${formatRupiah(product.price)}</div>
                <img alt="${product.name}" src="${product.image}">
                <div class="p-3">
                    <p class="mb-0 fw-bold small text-truncate">${product.name}</p>
                    <small class="text-uppercase text-muted fw-bold" style="font-size: 9px;">${product.category}</small>
                </div>
            </div>
        `;
        menuContainer.appendChild(col);
    });
    
    document.querySelectorAll('.item-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (card.classList.contains('more-items-card')) return;
            const id = card.dataset.id;
            const name = card.dataset.name;
            const price = parseInt(card.dataset.price);
            addToCart({ id: id, name: name, price: price });
        });
    });
}

function initCategoryFilters() {
    const filterContainer = document.querySelector('.d-flex.gap-2.overflow-x-auto.mb-4.pb-1');
    if (!filterContainer) return;
    
    // Hapus event listener lama dan buat ulang
    const filters = filterContainer.querySelectorAll('.category-filter, .btn');
    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category || btn.innerText;
            
            // Update active state
            filters.forEach(b => {
                b.classList.remove('btn-primary-custom');
                b.classList.add('btn-outline-secondary', 'border-secondary-subtle');
            });
            btn.classList.remove('btn-outline-secondary', 'border-secondary-subtle');
            btn.classList.add('btn-primary-custom');
            
            // Filter kategori
            if (category === 'Semua') {
                currentMenuFilter = 'Semua';
            } else if (category === 'Makanan') {
                currentMenuFilter = 'Hot Meal';
            } else if (category === 'Minuman') {
                currentMenuFilter = 'Beverage';
            } else {
                currentMenuFilter = category;
            }
            
            renderMenuItems();
        });
    });
}

function loadCart() {
    currentCart = loadCartFromStorage();
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartContainer = document.querySelector('.card.h-100 .flex-grow-1');
    if (!cartContainer) return;
    
    if (currentCart.length === 0) {
        cartContainer.innerHTML = '<div class="text-center text-muted py-5">Keranjang kosong<br><small>Klik item menu untuk menambah</small></div>';
        updateTotalAmount();
        return;
    }
    
    let itemsHtml = '';
    let subtotal = 0;
    
    currentCart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        itemsHtml += `
            <div class="d-flex align-items-center justify-content-between mb-4 group">
                <div class="d-flex align-items-center gap-3">
                    <div class="bg-light rounded px-2 py-1 fw-bold text-primary small">${item.quantity}x</div>
                    <div>
                        <p class="mb-0 fw-bold small">${item.name}</p>
                        <small class="text-muted" style="font-size: 11px;">${formatRupiah(item.price)} / item</small>
                    </div>
                </div>
                <div class="text-end">
                    <p class="mb-0 fw-bold small">${formatRupiah(itemTotal)}</p>
                    <span class="material-symbols-outlined text-danger small remove-item" data-index="${index}" style="cursor:pointer; font-size:18px;">close</span>
                </div>
            </div>
        `;
    });
    
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    
    itemsHtml += `
        <hr class="my-4 border-secondary border-opacity-10">
        <div class="d-flex justify-content-between text-muted mb-2 small fw-medium">
            <span>Subtotal</span>
            <span>${formatRupiah(subtotal)}</span>
        </div>
        <div class="d-flex justify-content-between text-muted mb-4 small fw-medium">
            <span>PPN (5%)</span>
            <span>${formatRupiah(tax)}</span>
        </div>
        <div class="d-flex justify-content-between align-items-end">
            <span class="fw-bold h6 mb-2">Total</span>
            <span class="h1 fw-bold mb-0" style="color: var(--primary);">${formatRupiah(total)}</span>
        </div>
    `;
    
    cartContainer.innerHTML = itemsHtml;
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.index)));
    });
}

function updateTotalAmount() {
    const totalElement = document.querySelector('.h1.fw-bold.mb-0');
    if (!totalElement) return;
    
    const subtotal = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal * 1.05;
    totalElement.innerText = formatRupiah(total);
}

function addToCart(product) {
    const existing = currentCart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity++;
    } else {
        currentCart.push({ ...product, quantity: 1 });
    }
    saveCartToStorage();
    updateCartDisplay();
    showToast(`${product.name} ditambahkan ke keranjang! (${formatRupiah(product.price)})`, 'success');
}

function removeFromCart(index) {
    const removed = currentCart.splice(index, 1)[0];
    saveCartToStorage();
    updateCartDisplay();
    showToast(`${removed.name} dihapus dari keranjang`, 'info');
}

// ==================== KALKULATOR LENGKAP + - × ÷ ====================
let calcCurrentNumber = '0';
let calcPreviousNumber = '';
let calcOperator = null;
let calcWaitingForOperand = false;

function initKeypad() {
    const displayElement = document.getElementById('calcDisplay');
    if (!displayElement) return;
    
    // Reset display
    calcCurrentNumber = '0';
    calcPreviousNumber = '';
    calcOperator = null;
    calcWaitingForOperand = false;
    updateCalcDisplay();
    
    // Tombol angka (0-9)
    const numberBtns = document.querySelectorAll('.calc-btn');
    numberBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const digit = btn.dataset.value;
            if (calcWaitingForOperand) {
                calcCurrentNumber = digit;
                calcWaitingForOperand = false;
            } else {
                calcCurrentNumber = calcCurrentNumber === '0' ? digit : calcCurrentNumber + digit;
            }
            updateCalcDisplay();
        });
    });
    
    // Tombol operator (+, -, ×, ÷)
    const operatorBtns = document.querySelectorAll('.calc-operator');
    operatorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const operator = btn.dataset.op;
            
            // Konversi simbol operator
            let opSymbol = operator;
            if (operator === '×') opSymbol = '*';
            if (operator === '÷') opSymbol = '/';
            
            if (calcOperator !== null && !calcWaitingForOperand) {
                calculate();
            }
            
            calcPreviousNumber = calcCurrentNumber;
            calcOperator = opSymbol;
            calcWaitingForOperand = true;
        });
    });
    
    // Tombol equals (=)
    const equalsBtn = document.querySelector('.calc-equals');
    if (equalsBtn) {
        equalsBtn.addEventListener('click', () => {
            if (calcOperator !== null && !calcWaitingForOperand) {
                calculate();
                calcOperator = null;
                calcWaitingForOperand = true;
            }
        });
    }
    
    // Tombol clear (AC)
    const clearBtn = document.querySelector('.calc-clear');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            calcCurrentNumber = '0';
            calcPreviousNumber = '';
            calcOperator = null;
            calcWaitingForOperand = false;
            updateCalcDisplay();
        });
    }
    
    // Tombol Add to Order
    const addToOrderBtn = document.getElementById('addToOrderBtn');
    if (addToOrderBtn) {
        const newBtn = addToOrderBtn.cloneNode(true);
        addToOrderBtn.parentNode.replaceChild(newBtn, addToOrderBtn);
        
        newBtn.addEventListener('click', () => {
            let amount = parseFloat(calcCurrentNumber.replace(/\./g, '').replace(',', '.'));
            if (isNaN(amount)) amount = 0;
            
            if (amount > 0) {
                addToCart({ 
                    id: `MANUAL-${Date.now()}`, 
                    name: 'Input Manual', 
                    price: amount 
                });
                // Reset kalkulator setelah ditambahkan
                calcCurrentNumber = '0';
                calcPreviousNumber = '';
                calcOperator = null;
                calcWaitingForOperand = false;
                updateCalcDisplay();
                showToast(`Rp ${formatNumberWithDots(amount)} ditambahkan ke keranjang`, 'success');
            } else {
                showToast('Masukkan nominal terlebih dahulu', 'error');
            }
        });
    }
}

function calculate() {
    let result;
    const prev = parseFloat(calcPreviousNumber.replace(/\./g, '').replace(',', '.'));
    const current = parseFloat(calcCurrentNumber.replace(/\./g, '').replace(',', '.'));
    
    if (isNaN(prev) || isNaN(current)) return;
    
    switch (calcOperator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                showToast('Tidak bisa membagi dengan 0!', 'error');
                return;
            }
            result = prev / current;
            break;
        default:
            return;
    }
    
    calcCurrentNumber = Math.floor(result).toString();
    calcPreviousNumber = '';
    calcOperator = null;
    calcWaitingForOperand = true;
    updateCalcDisplay();
}

function updateCalcDisplay() {
    const displayElement = document.getElementById('calcDisplay');
    if (displayElement) {
        // Format angka dengan titik ribuan
        let num = parseFloat(calcCurrentNumber.replace(/\./g, '').replace(',', '.'));
        if (isNaN(num)) num = 0;
        displayElement.innerText = formatNumberWithDots(Math.floor(num));
    }
}

function formatNumberWithDots(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Fungsi bantu untuk format angka dengan titik (contoh: 1000000 -> 1.000.000)
function formatNumberWithDots(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function initPaymentMethods() {
    const nfcArea = document.querySelector('.payment-tap-area');
    if (nfcArea) {
        nfcArea.addEventListener('click', () => {
            processPayment('Kartu Karyawan');
        });
    }
    
    const cashBtn = document.querySelector('.btn-outline-secondary .material-symbols-outlined')?.closest('button');
    if (cashBtn) {
        cashBtn.addEventListener('click', () => processPayment('Tunai'));
    }
    
    const qrBtns = document.querySelectorAll('.btn-outline-secondary');
    if (qrBtns.length >= 2) {
        qrBtns[1].addEventListener('click', () => processPayment('QR Code'));
    }
}

function processPayment(method) {
    if (currentCart.length === 0) {
        showToast('Keranjang kosong! Tambahkan item terlebih dahulu.', 'error');
        return;
    }
    
    const subtotal = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    
    const today = new Date().toLocaleDateString('id-ID');
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    // Format items agar mudah diparse untuk most popular item
    const itemsFormatted = currentCart.map(i => `${i.quantity}x ${i.name}`).join(', ');
    
    // Mapping method ke format yang sesuai
    let savedMethod = method;
    if (method === 'Tunai' || method === 'Cash') savedMethod = 'Tunai';
    else if (method === 'Kartu Karyawan' || method === 'Employee ID Card') savedMethod = 'KARTU KARYAWAN';
    else if (method === 'ID Card') savedMethod = 'ID Card';
    else if (method === 'QR Code') savedMethod = 'QR Code';
    else if (method === 'Kartu Kredit') savedMethod = 'Kartu Kredit';
    
    const transaction = {
        id: `TRX-${Math.floor(Math.random() * 900000 + 100000)}`,
        employee: 'Karyawan',
        items: itemsFormatted,
        amount: total,
        status: 'Selesai',
        time: time,
        date: today,
        method: savedMethod
    };
    
        // =========================
    // Kurangi stok inventaris
    // =========================
    currentCart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.id);

        if (product) {
            product.stock -= cartItem.quantity;

            // Jangan sampai minus
            if (product.stock < 0) {
                product.stock = 0;
            }

            // Update status stok
            if (product.stock === 0) {
                product.status = "Habis";
            } else if (product.stock < 20) {
                product.status = "Stok Menipis";
            } else {
                product.status = "Tersedia";
            }
        }
    });

    // Simpan perubahan inventaris
    saveProductsToStorage();

    // Simpan transaksi
    saveTransaction(transaction);

    // Refresh seluruh halaman yang membutuhkan data produk
    if (typeof renderProductTable === "function") {
        renderProductTable();
    }

    if (typeof updateInventoryStats === "function") {
        updateInventoryStats();
    }

    if (typeof loadLowStockItems === "function") {
        loadLowStockItems();
    }

    if (typeof renderMenuItems === "function") {
        renderMenuItems();
    }

    // Kosongkan keranjang
    currentCart = [];
    saveCartToStorage();
    updateCartDisplay();
    showToast(`Pembayaran ${method} berhasil! Total: ${formatRupiah(total)}`, 'success');
    
    // Update dashboard jika sedang di halaman dashboard
    if (currentPage === 'dashboard.html') {
        updateDashboardStats();
        loadRecentTransactions();
        loadLowStockItems();
    }
    
    // Update history jika sedang di halaman history
    if (currentPage === 'history.html') {
        loadTransactionHistory();
        updateDailyRevenue();
    }
    
    setTimeout(() => {
        if (confirm('Cetak struk pembayaran?')) {
            printReceipt(transaction);
        }
    }, 500);
}   

function printReceipt(transaction) {
    const receiptHtml = `
        <div style="width: 300px; font-family: monospace; padding: 20px;">
            <h3 style="text-align: center;">DMEC</h3>
            <p style="text-align: center; font-size: 12px;">DMIA E-Canteen</p>
            <hr>
            <p>Tanggal: ${transaction.date}</p>
            <p>Waktu: ${transaction.time}</p>
            <p>ID Transaksi: ${transaction.id}</p>
            <p>Metode: ${transaction.method}</p>
            <hr>
            <p><strong>Total: ${formatRupiah(transaction.amount)}</strong></p>
            <hr>
            <p style="text-align: center; font-size: 11px;">Terima kasih!</p>
        </div>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.print();
}

// ==================== HISTORY FUNCTIONS ====================
let currentHistoryFilters = {
    dateRange: 'last7days',
    status: 'Semua',
    paymentMethod: 'Semua'
};

function initHistory() {
    loadTransactionHistory();
    initHistoryFilters();
    initExportButtons();
    initGenerateReport();
}

function getFilteredTransactions() {
    let transactions = getTransactionsFromStorage();
    
    // Filter berdasarkan date range
    const today = new Date();
    let startDate = new Date();
    
    switch(currentHistoryFilters.dateRange) {
        case 'last7days':
            startDate.setDate(today.getDate() - 7);
            break;
        case 'last30days':
            startDate.setDate(today.getDate() - 30);
            break;
        case 'currentMonth':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
        default:
            startDate.setDate(today.getDate() - 7);
    }
    
    transactions = transactions.filter(t => {
        // Parse tanggal transaksi (format: dd/mm/yyyy atau "17/5/2026")
        let trxDate;
        if (t.date && t.date.includes('/')) {
            const parts = t.date.split('/');
            trxDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else if (t.date) {
            trxDate = new Date(t.date);
        } else {
            trxDate = new Date();
        }
        return trxDate >= startDate;
    });
    
    // Filter berdasarkan status
    if (currentHistoryFilters.status !== 'Semua') {
        transactions = transactions.filter(t => {
            if (currentHistoryFilters.status === 'Selesai') {
                return t.status === 'Selesai' || t.status === 'Completed';
            }
            return t.status === currentHistoryFilters.status;
        });
    }
    
    // Filter berdasarkan metode pembayaran - SESUAI DENGAN MAPPING
    if (currentHistoryFilters.paymentMethod !== 'Semua') {
        transactions = transactions.filter(t => {
            const method = t.method || 'Tunai';
            // Mapping metode pembayaran dari transaksi
            if (currentHistoryFilters.paymentMethod === 'KARTU KARYAWAN') {
                return method === 'KARTU KARYAWAN' || method === 'Employee Credit' || method === 'ID Card';
            }
            if (currentHistoryFilters.paymentMethod === 'ID Card') {
                return method === 'ID Card' || method === 'KARTU KARYAWAN';
            }
            if (currentHistoryFilters.paymentMethod === 'Tunai') {
                return method === 'Tunai' || method === 'Cash';
            }
            if (currentHistoryFilters.paymentMethod === 'QR Code') {
                return method === 'QR Code';
            }
            if (currentHistoryFilters.paymentMethod === 'Kartu Kredit') {
                return method === 'Kartu Kredit' || method === 'Credit Card';
            }
            return method === currentHistoryFilters.paymentMethod;
        });
    }
    
    return transactions;
}

function loadTransactionHistory() {
    const tbody = document.querySelector('.table tbody');
    if (!tbody) return;
    
    const transactions = getFilteredTransactions();
    const startIndex = 0;
    const endIndex = Math.min(5, transactions.length);
    const displayedTransactions = transactions.slice(startIndex, endIndex);
    
    // Update total transaksi yang ditampilkan
    updatePaginationInfo(transactions.length, startIndex + 1, endIndex);
    
    if (transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-5">
            <span class="material-symbols-outlined" style="font-size: 48px;">receipt</span>
            <p class="mt-2 mb-0">Belum ada transaksi</p>
            <small>Lakukan pembayaran di halaman Checkout</small>
        </td></tr>`;
        return;
    }
    
    tbody.innerHTML = '';
    displayedTransactions.forEach(trx => {
        const row = document.createElement('tr');
        
        // Format date dan time
        let dateHtml = `<div class="fw-bold small">${trx.date}</div><div class="text-muted small">${trx.time}</div>`;
        
        // Status badge
        let statusHtml = '';
        if (trx.status === 'Selesai' || trx.status === 'Completed') {
            statusHtml = `<div class="status-success"><span class="material-symbols-outlined fs-6">check_circle</span> Selesai</div>`;
        } else if (trx.status === 'Pending') {
            statusHtml = `<div class="status-pending"><span class="material-symbols-outlined fs-6">pending</span> Pending</div>`;
        } else {
            statusHtml = `<div class="status-failed"><span class="material-symbols-outlined fs-6">error</span> Gagal</div>`;
        }
        
        // Method badge - SESUAI DENGAN PILIHAN DI HTML
        let methodBadge = '';
        if (trx.method === 'Tunai' || trx.method === 'Cash') {
            methodBadge = `<span class="badge-credit">TUNAI</span>`;
        } else if (trx.method === 'QR Code') {
            methodBadge = `<span class="badge-credit">QR CODE</span>`;
        } else if (trx.method === 'ID Card') {
            methodBadge = `<span class="badge-credit">ID CARD</span>`;
        } else if (trx.method === 'KARTU KARYAWAN' || trx.method === 'Employee Credit') {
            methodBadge = `<span class="badge-credit">KARTU</span>`;
        } else if (trx.method === 'Kartu Kredit') {
            methodBadge = `<span class="badge-credit">KREDIT</span>`;
        } else {
            methodBadge = `<span class="badge-credit">${trx.method || 'TUNAI'}</span>`;
        }
        
        row.innerHTML = `
            <td>${dateHtml}</td>
            <td><span class="trx-id">${trx.id}</span></td>
            <td>
                <div class="d-flex align-items-center gap-3">
                    <div class="avatar">K</div>
                    <div>
                        <div class="fw-bold small">${trx.employee}</div>
                        <div class="text-muted small" style="font-size: 11px;">EMP-${trx.id.slice(-4)}</div>
                    </div>
                </div>
            </td>
            <td><span class="fw-bold small">${formatRupiah(trx.amount)}</span></td>
            <td>${methodBadge}</td>
            <td>${statusHtml}</td>
            <td class="text-end">
                <button class="btn btn-link text-muted p-0 view-detail" data-id="${trx.id}">
                    <span class="material-symbols-outlined">more_vert</span>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Event listener untuk tombol detail
    document.querySelectorAll('.view-detail').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const transaction = getTransactionsFromStorage().find(t => t.id === id);
            if (transaction) {
                showTransactionDetail(transaction);
            }
        });
    });
}

function showTransactionDetail(transaction) {
    showModal('Detail Transaksi', `
        <style>
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: 600; color: #666; }
            .detail-value { font-weight: 500; }
        </style>
        <div class="detail-row">
            <span class="detail-label">ID Transaksi</span>
            <span class="detail-value">${transaction.id}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Tanggal</span>
            <span class="detail-value">${transaction.date}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Waktu</span>
            <span class="detail-value">${transaction.time}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Karyawan</span>
            <span class="detail-value">${transaction.employee}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Metode Pembayaran</span>
            <span class="detail-value">${transaction.method}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Total</span>
            <span class="detail-value fw-bold" style="color: var(--primary);">${formatRupiah(transaction.amount)}</span>
        </div>
        <div class="mt-3 pt-2">
            <label class="fw-bold small">Item yang dibeli:</label>
            <ul class="mt-1">
                ${transaction.items.split(', ').map(item => `<li class="small">${item}</li>`).join('')}
            </ul>
        </div>
    `, () => true);
}

function updatePaginationInfo(total, start, end) {
    const infoElement = document.querySelector('.text-muted.small.mb-3.mb-sm-0');
    if (infoElement) {
        if (total === 0) {
            infoElement.innerHTML = 'Menampilkan <span class="fw-bold text-dark">0</span> dari <span class="fw-bold text-dark">0</span> transaksi';
        } else {
            infoElement.innerHTML = `Menampilkan <span class="fw-bold text-dark">${start} - ${end}</span> dari <span class="fw-bold text-dark">${total}</span> transaksi`;
        }
    }
}

function initHistoryFilters() {
    // Date Range Filter
    const dateRangeSelect = document.querySelector('.col-md-3 select:first-child, .col-md-3:first-child select');
    if (dateRangeSelect) {
        dateRangeSelect.addEventListener('change', (e) => {
            const value = e.target.value;
            if (value === 'Last 7 Days') currentHistoryFilters.dateRange = 'last7days';
            else if (value === 'Last 30 Days') currentHistoryFilters.dateRange = 'last30days';
            else if (value === 'Current Month') currentHistoryFilters.dateRange = 'currentMonth';
            loadTransactionHistory();
            updateDailyRevenue();
            showToast(`Filter tanggal: ${value}`, 'success');
        });
    }
    
    // Status Filter
    const statusSelect = document.querySelectorAll('.col-md-3 select')[1];
    if (statusSelect) {
        statusSelect.addEventListener('change', (e) => {
            const value = e.target.value;
            if (value === 'All Transactions') currentHistoryFilters.status = 'Semua';
            else if (value === 'Success') currentHistoryFilters.status = 'Selesai';
            else if (value === 'Failed') currentHistoryFilters.status = 'Gagal';
            else if (value === 'Pending') currentHistoryFilters.status = 'Pending';
            loadTransactionHistory();
            updateDailyRevenue();
            showToast(`Filter status: ${value}`, 'success');
        });
    }
    
    // Payment Method Filter - SESUAI DENGAN HTML ANDA
    const methodSelect = document.querySelectorAll('.col-md-3 select')[2];
    if (methodSelect) {
        methodSelect.addEventListener('change', (e) => {
            const value = e.target.value;
            // Mapping sesuai dengan pilihan di HTML
            if (value === 'All Methods') currentHistoryFilters.paymentMethod = 'Semua';
            else if (value === 'Employee Credit') currentHistoryFilters.paymentMethod = 'KARTU KARYAWAN';
            else if (value === 'ID Card') currentHistoryFilters.paymentMethod = 'ID Card';
            else if (value === 'Cash') currentHistoryFilters.paymentMethod = 'Tunai';
            else if (value === 'QR Code') currentHistoryFilters.paymentMethod = 'QR Code';
            else if (value === 'Credit Card') currentHistoryFilters.paymentMethod = 'Kartu Kredit';
            else currentHistoryFilters.paymentMethod = value;
            
            loadTransactionHistory();
            updateDailyRevenue();
            showToast(`Filter metode pembayaran: ${value}`, 'success');
        });
    }
    
    // Apply Filters Button
    const applyBtn = document.querySelector('.btn-primary.w-100.py-2');
    if (applyBtn) {
        // Hapus event listener lama jika ada
        const newApplyBtn = applyBtn.cloneNode(true);
        applyBtn.parentNode.replaceChild(newApplyBtn, applyBtn);
        
        newApplyBtn.addEventListener('click', () => {
            // Refresh semua filter
            loadTransactionHistory();
            updateDailyRevenue();
            showToast('Filter diterapkan!', 'success');
        });
    }
    
    // Pagination
    initPagination();
}

function initPagination() {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;
    
    const transactions = getFilteredTransactions();
    const totalPages = Math.ceil(transactions.length / 5);
    let currentPage = 1;
    
    function renderPagination() {
        paginationContainer.innerHTML = '';
        
        // Previous button
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#"><span class="material-symbols-outlined fs-6">chevron_left</span></a>`;
        prevLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                loadPage(currentPage);
                renderPagination();
            }
        });
        paginationContainer.appendChild(prevLi);
        
        // Page numbers
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        if (startPage > 1) {
            const firstLi = document.createElement('li');
            firstLi.className = 'page-item';
            firstLi.innerHTML = '<a class="page-link" href="#">1</a>';
            firstLi.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = 1;
                loadPage(1);
                renderPagination();
            });
            paginationContainer.appendChild(firstLi);
            
            if (startPage > 2) {
                const dotsLi = document.createElement('li');
                dotsLi.className = 'page-item disabled';
                dotsLi.innerHTML = '<span class="page-link">...</span>';
                paginationContainer.appendChild(dotsLi);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageLi.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                loadPage(i);
                renderPagination();
            });
            paginationContainer.appendChild(pageLi);
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const dotsLi = document.createElement('li');
                dotsLi.className = 'page-item disabled';
                dotsLi.innerHTML = '<span class="page-link">...</span>';
                paginationContainer.appendChild(dotsLi);
            }
            
            const lastLi = document.createElement('li');
            lastLi.className = 'page-item';
            lastLi.innerHTML = `<a class="page-link" href="#">${totalPages}</a>`;
            lastLi.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = totalPages;
                loadPage(totalPages);
                renderPagination();
            });
            paginationContainer.appendChild(lastLi);
        }
        
        // Next button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#"><span class="material-symbols-outlined fs-6">chevron_right</span></a>`;
        nextLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                loadPage(currentPage);
                renderPagination();
            }
        });
        paginationContainer.appendChild(nextLi);
    }
    
    function loadPage(page) {
        const transactions = getFilteredTransactions();
        const startIndex = (page - 1) * 5;
        const endIndex = Math.min(startIndex + 5, transactions.length);
        const pageTransactions = transactions.slice(startIndex, endIndex);
        
        const tbody = document.querySelector('.table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        pageTransactions.forEach(trx => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><div class="fw-bold small">${trx.date}</div><div class="text-muted small">${trx.time}</div></td>
                <td><span class="trx-id">${trx.id}</span></td>
                <td>
                    <div class="d-flex align-items-center gap-3">
                        <div class="avatar">K</div>
                        <div>
                            <div class="fw-bold small">${trx.employee}</div>
                            <div class="text-muted small">EMP-${trx.id.slice(-4)}</div>
                        </div>
                    </div>
                </td>
                <td><span class="fw-bold small">${formatRupiah(trx.amount)}</span></td>
                <td><span class="badge-credit">${trx.method === 'Tunai' ? 'TUNAI' : (trx.method === 'QR Code' ? 'QR CODE' : 'KARTU')}</span></td>
                <td><div class="status-success"><span class="material-symbols-outlined fs-6">check_circle</span> Selesai</div></td>
                <td class="text-end">
                    <button class="btn btn-link text-muted p-0 view-detail" data-id="${trx.id}">
                        <span class="material-symbols-outlined">more_vert</span>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        updatePaginationInfo(transactions.length, startIndex + 1, endIndex);
        
        document.querySelectorAll('.view-detail').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const transaction = getTransactionsFromStorage().find(t => t.id === id);
                if (transaction) showTransactionDetail(transaction);
            });
        });
    }
    
    if (totalPages > 0) {
        renderPagination();
    }
}

function updateDailyRevenue() {
    const transactions = getFilteredTransactions();
    const today = new Date().toLocaleDateString('id-ID');
    
    // Hitung total revenue hari ini dari transaksi yang sudah difilter
    const todayTransactions = transactions.filter(t => t.date === today);
    const todayRevenue = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Hitung revenue kemarin untuk persentase
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('id-ID');
    const yesterdayRevenue = getTransactionsFromStorage()
        .filter(t => t.date === yesterdayStr)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const revenueElement = document.querySelector('.revenue-card .h3.fw-bold');
    if (revenueElement) {
        revenueElement.innerText = formatRupiah(todayRevenue > 0 ? todayRevenue : 4281500);
    }
    
    const percentageElement = document.querySelector('.revenue-card small.text-uppercase');
    if (percentageElement && yesterdayRevenue > 0) {
        const percentage = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(0);
        const isPositive = percentage >= 0;
        percentageElement.innerHTML = `${isPositive ? '+' : ''}${percentage}% dari kemarin`;
        percentageElement.style.color = isPositive ? '#4caf50' : '#ff5722';
    }
}

function initExportButtons() {
    // Export PDF button
    const exportPdfBtn = document.querySelector('.btn-outline-secondary:first-child, button:has(.material-symbols-outlined[data-icon="file_download"])');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', () => {
            exportToPDF();
        });
    }
    
    // Export CSV button
    const exportCsvBtn = document.querySelectorAll('.btn-outline-secondary')[1];
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => {
            exportToCSV();
        });
    }
}

function exportToCSV() {
    const transactions = getFilteredTransactions();
    if (transactions.length === 0) {
        showToast('Tidak ada data untuk diexport', 'error');
        return;
    }
    
    // Header CSV
    const headers = ['ID Transaksi', 'Tanggal', 'Waktu', 'Karyawan', 'Item', 'Total', 'Metode', 'Status'];
    const rows = transactions.map(t => [
        t.id,
        t.date,
        t.time,
        t.employee,
        t.items,
        t.amount,
        t.method,
        t.status
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `transactions_${new Date().toISOString().slice(0, 19)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast(`Berhasil mengexport ${transactions.length} transaksi ke CSV`, 'success');
}

function exportToPDF() {
    const transactions = getFilteredTransactions();
    if (transactions.length === 0) {
        showToast('Tidak ada data untuk diexport', 'error');
        return;
    }
    
    // Create print-friendly HTML
    const printHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Laporan Transaksi</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2 { color: #00355f; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .total { margin-top: 20px; text-align: right; font-weight: bold; }
                @media print {
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <h2>SmartCanteen - Laporan Transaksi</h2>
            <p>Periode: ${new Date().toLocaleDateString('id-ID')}</p>
            <p>Total Transaksi: ${transactions.length}</p>
            <table>
                <thead>
                    <tr>
                        <th>ID</th><th>Tanggal</th><th>Waktu</th><th>Karyawan</th><th>Total</th><th>Metode</th>
                    </tr>
                </thead>
                <tbody>
                    ${transactions.map(t => `
                        <tr>
                            <td>${t.id}</td>
                            <td>${t.date}</td>
                            <td>${t.time}</td>
                            <td>${t.employee}</td>
                            <td>${formatRupiah(t.amount)}</td>
                            <td>${t.method}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="total">
                Total Pendapatan: ${formatRupiah(transactions.reduce((sum, t) => sum + t.amount, 0))}
            </div>
            <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px;">Cetak</button>
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printHtml);
    printWindow.document.close();
    
    showToast(`Berhasil mengexport ${transactions.length} transaksi ke PDF`, 'success');
}

function initGenerateReport() {
    const generateBtn = document.querySelector('.report-banner button, button:has(.material-symbols-outlined[data-icon="rocket_launch"])');
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const transactions = getTransactionsFromStorage();
            const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
            const totalTransactions = transactions.length;
            
            showModal('Generate Laporan Bulanan', `
                <div class="text-center mb-3">
                    <span class="material-symbols-outlined" style="font-size: 48px; color: var(--primary);">description</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Transaksi</span>
                    <span class="detail-value">${totalTransactions}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Pendapatan</span>
                    <span class="detail-value fw-bold" style="color: var(--primary);">${formatRupiah(totalRevenue)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Periode</span>
                    <span class="detail-value">${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                </div>
                <div class="mt-3">
                    <label class="fw-bold small">Format Laporan</label>
                    <select id="reportFormat" class="form-select mt-1">
                        <option>PDF</option>
                        <option>Excel</option>
                        <option>CSV</option>
                    </select>
                </div>
            `, () => {
                const format = document.getElementById('reportFormat')?.value;
                if (format === 'CSV') {
                    exportToCSV();
                } else {
                    exportToPDF();
                }
                showToast(`Laporan ${format} sedang diproses`, 'success');
                return true;
            });
        });
    }
}

// ==================== SETTINGS FUNCTIONS ====================
function initSettings() {
    loadUserProfileFromStorage();
    updateProfileUI();
    setupSettingsHandlers();
}

function setupSettingsHandlers() {
    // Edit profile button
    const editProfileBtn = document.querySelector('.card-header .btn-link');
    if (editProfileBtn && editProfileBtn.innerText === 'Edit Details') {
        editProfileBtn.addEventListener('click', () => showEditProfileModal());
    }
    
    // Change password button
    const changePasswordBtn = document.querySelector('.btn-outline-secondary.border-start-0');
    if (changePasswordBtn && changePasswordBtn.innerText === 'Change') {
        changePasswordBtn.addEventListener('click', () => {
            showModal('Ubah Password', `
                <div class="mb-3">
                    <label class="form-label fw-bold">Password Baru</label>
                    <input type="password" id="newPass" class="form-control">
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold">Konfirmasi Password Baru</label>
                    <input type="password" id="confirmPass" class="form-control">
                </div>
            `, () => {
                const newPass = document.getElementById('newPass')?.value;
                const confirmPass = document.getElementById('confirmPass')?.value;
                
                if (newPass !== confirmPass) {
                    showToast('Password baru tidak cocok!', 'error');
                    return false;
                }
                if (newPass && newPass.length < 6) {
                    showToast('Password minimal 6 karakter!', 'error');
                    return false;
                }
                if (newPass) {
                    localStorage.setItem('eCanteen_password', btoa(newPass));
                    showToast('Password berhasil diubah!', 'success');
                }
                return true;
            });
        });
    }
    
    // Save settings button
    const saveBtn = document.querySelector('.btn-primary.px-5');
    if (saveBtn && saveBtn.innerText === 'Save Configuration') {
        saveBtn.addEventListener('click', () => {
            showToast('Pengaturan berhasil disimpan!', 'success');
        });
    }
    
    // 2FA Switch
    const twofaSwitch = document.getElementById('flexSwitch2fa');
    if (twofaSwitch) {
        const saved2fa = localStorage.getItem('eCanteen_2fa') === 'true';
        twofaSwitch.checked = saved2fa;
        twofaSwitch.addEventListener('change', () => {
            localStorage.setItem('eCanteen_2fa', twofaSwitch.checked);
            showToast(twofaSwitch.checked ? '2FA diaktifkan' : '2FA dinonaktifkan', 'success');
        });
    }
    
    // System preferences
    const currencySelect = document.querySelector('.col-md-4 select');
    if (currencySelect) {
        const savedCurrency = localStorage.getItem('eCanteen_currency') || 'IDR (Indonesian Rupiah)';
        currencySelect.value = savedCurrency;
        currencySelect.addEventListener('change', () => {
            localStorage.setItem('eCanteen_currency', currencySelect.value);
            showToast('Preferensi mata uang disimpan', 'success');
        });
    }
}

function initProfileEdit() {
    const editBtn = document.querySelector('.card-header .btn-link');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            showModal('Edit Profil', `
                <div class="mb-3">
                    <label class="form-label fw-bold">Nama Lengkap</label>
                    <input type="text" id="fullName" class="form-control" value="Admin User">
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold">Email</label>
                    <input type="email" id="email" class="form-control" value="admin@smartcanteen.com">
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold">Password Baru</label>
                    <input type="password" id="newPassword" class="form-control" placeholder="Kosongkan jika tidak diubah">
                </div>
            `, () => {
                const name = document.getElementById('fullName')?.value;
                if (name) {
                    const nameElement = document.querySelector('.h4.mb-1.fw-bold.text-dark');
                    if (nameElement) nameElement.innerText = name;
                    showToast('Profil berhasil diupdate!', 'success');
                }
                return true;
            });
        });
    }
}

function initSaveSettings() {
    const saveBtn = document.querySelector('.btn-primary.px-5');
    if (saveBtn && saveBtn.innerText === 'Save Configuration') {
        saveBtn.addEventListener('click', () => {
            showToast('Pengaturan berhasil disimpan!', 'success');
        });
    }
    
    const discardBtn = document.querySelector('.btn-link.text-muted');
    if (discardBtn && discardBtn.innerText === 'Discard Changes') {
        discardBtn.addEventListener('click', () => {
            showToast('Perubahan dibatalkan', 'info');
        });
    }
}

// ==================== UPLOAD FOTO PRODUK ====================
let uploadedImageData = null;

function initImageUpload() {
    const imageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');
    
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    uploadedImageData = event.target.result;
                    if (imagePreview) {
                        imagePreview.src = uploadedImageData;
                        imagePreview.style.display = 'block';
                    }
                    showToast('Foto berhasil diupload!', 'success');
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// ==================== SETTINGS - EDIT PROFIL LENGKAP ====================
let currentUserProfile = {
    fullName: 'Admin User',
    email: 'admin@smartcanteen.com',
    avatar: null,
    role: 'Super Administrator'
};

function loadUserProfileFromStorage() {
    const stored = localStorage.getItem('eCanteen_userProfile');
    if (stored) {
        currentUserProfile = JSON.parse(stored);
    }
    return currentUserProfile;
}

function saveUserProfileToStorage() {
    localStorage.setItem('eCanteen_userProfile', JSON.stringify(currentUserProfile));
}

function updateProfileUI() {
    // Update nama di sidebar dan top bar
    const nameElements = document.querySelectorAll('.fw-bold.small, .h4.mb-1.fw-bold.text-dark, .mb-0.fw-bold.small.text-primary');
    nameElements.forEach(el => {
        if (el.innerText.includes('Admin') || el.innerText === 'Admin User' || el.innerText === currentUserProfile.fullName) {
            el.innerText = currentUserProfile.fullName;
        }
    });
    
    // Update email di profil
    const emailElement = document.querySelector('.text-muted.mb-2');
    if (emailElement) emailElement.innerText = currentUserProfile.email;
    
    // Update role badge
    const roleElement = document.querySelector('.badge-admin');
    if (roleElement) roleElement.innerText = currentUserProfile.role;
    
    // Update avatar di semua tempat
    if (currentUserProfile.avatar) {
        const avatars = document.querySelectorAll('img[alt="Admin"], img[alt="Admin Large"], img[alt="User"], .rounded-circle.border');
        avatars.forEach(avatar => {
            avatar.src = currentUserProfile.avatar;
        });
    }
}

function showEditProfileModal() {
    const profile = loadUserProfileFromStorage();
    
    showModal('Edit Profil', `
        <style>
            .avatar-preview {
                width: 100px;
                height: 100px;
                border-radius: 50%;
                object-fit: cover;
                border: 3px solid var(--primary);
                margin-bottom: 15px;
            }
            .image-upload-container {
                text-align: center;
                margin-bottom: 20px;
            }
            .upload-label {
                display: inline-block;
                padding: 8px 16px;
                background: var(--primary);
                color: white;
                border-radius: 8px;
                cursor: pointer;
                font-size: 12px;
                margin-top: 10px;
            }
            .upload-label:hover {
                background: var(--primary-container);
            }
        </style>
        <div class="image-upload-container">
            <img id="profileAvatarPreview" class="avatar-preview" src="${profile.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.fullName) + '&background=00355f&color=fff'}" alt="Avatar Preview">
            <div>
                <label class="upload-label">
                    <span class="material-symbols-outlined" style="font-size: 16px;">upload</span> Upload Foto
                    <input type="file" id="profileImageInput" accept="image/*" style="display: none;">
                </label>
            </div>
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Nama Lengkap</label>
            <input type="text" id="fullName" class="form-control" value="${profile.fullName}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Email</label>
            <input type="email" id="email" class="form-control" value="${profile.email}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Role</label>
            <select id="role" class="form-select">
                <option ${profile.role === 'Super Administrator' ? 'selected' : ''}>Super Administrator</option>
                <option ${profile.role === 'Administrator' ? 'selected' : ''}>Administrator</option>
                <option ${profile.role === 'Cashier' ? 'selected' : ''}>Cashier</option>
                <option ${profile.role === 'Inventory Manager' ? 'selected' : ''}>Inventory Manager</option>
            </select>
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Password Baru</label>
            <input type="password" id="newPassword" class="form-control" placeholder="Kosongkan jika tidak diubah">
            <small class="text-muted">Minimal 6 karakter</small>
        </div>
    `, () => {
        const newName = document.getElementById('fullName')?.value;
        const newEmail = document.getElementById('email')?.value;
        const newRole = document.getElementById('role')?.value;
        const newPassword = document.getElementById('newPassword')?.value;
        const newAvatar = uploadedImageData || currentUserProfile.avatar;
        
        if (newName && newName.trim() !== '') {
            currentUserProfile.fullName = newName;
            currentUserProfile.email = newEmail;
            currentUserProfile.role = newRole;
            if (newAvatar) currentUserProfile.avatar = newAvatar;
            
            if (newPassword && newPassword.length >= 6) {
                // Simpan password ke localStorage (dalam demo)
                localStorage.setItem('eCanteen_password', btoa(newPassword));
                showToast('Password berhasil diubah!', 'success');
            }
            
            saveUserProfileToStorage();
            updateProfileUI();
            showToast('Profil berhasil diperbarui!', 'success');
            
            // Reset uploaded image
            uploadedImageData = null;
            return true;
        } else {
            showToast('Nama tidak boleh kosong!', 'error');
            return false;
        }
    });
    
    // Setup image upload handler setelah modal terbuka
    setTimeout(() => {
        const imageInput = document.getElementById('profileImageInput');
        const avatarPreview = document.getElementById('profileAvatarPreview');
        
        if (imageInput) {
            imageInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        uploadedImageData = event.target.result;
                        if (avatarPreview) {
                            avatarPreview.src = uploadedImageData;
                        }
                        showToast('Foto profil berhasil diupload!', 'success');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }, 100);
}

// ==================== TAMBAH PRODUK DENGAN FOTO ====================
function showAddProductModal() {
    // Reset uploaded image
    uploadedImageData = null;
    
    showModal('Tambah Produk Baru', `
        <style>
            .product-preview {
                width: 100%;
                height: 120px;
                object-fit: cover;
                border-radius: 8px;
                margin-bottom: 10px;
                border: 1px solid #ddd;
                display: none;
            }
            .upload-product-label {
                display: inline-block;
                padding: 8px 16px;
                background: var(--primary);
                color: white;
                border-radius: 8px;
                cursor: pointer;
                font-size: 12px;
                margin-bottom: 10px;
            }
            .upload-product-label:hover {
                background: var(--primary-container);
            }
        </style>
        <div class="text-center">
            <img id="productImagePreview" class="product-preview" alt="Preview">
            <div>
                <label class="upload-product-label">
                    <span class="material-symbols-outlined" style="font-size: 16px;">photo_camera</span> Upload Foto Produk
                    <input type="file" id="productImageInput" accept="image/*" style="display: none;">
                </label>
            </div>
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Nama Produk</label>
            <input type="text" id="prodName" class="form-control" placeholder="Contoh: Nasi Goreng">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Kategori</label>
            <select id="prodCategory" class="form-select">
                <option>Makanan</option>
                <option>Minuman</option>
                <option>Makanan Ringan</option>
                <option>Lain-lain</option>
            </select>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Harga (Rp)</label>
                <input type="number" id="prodPrice" class="form-control" placeholder="0">
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Stok</label>
                <input type="number" id="prodStock" class="form-control" placeholder="0-100">
            </div>
        </div>
    `, () => {
        const name = document.getElementById('prodName')?.value;
        const category = document.getElementById('prodCategory')?.value;
        const price = parseInt(document.getElementById('prodPrice')?.value);
        const stock = parseInt(document.getElementById('prodStock')?.value);
        
        if (!name || isNaN(price) || isNaN(stock)) {
            showToast('Mohon isi semua field dengan benar!', 'error');
            return false;
        }
        
        const newProduct = {
            id: `PRD-${Math.floor(Math.random() * 9000 + 1000)}`,
            name: name,
            category: category,
            price: price,
            stock: stock,
            status: stock === 0 ? 'Habis' : (stock < 20 ? 'Stok Menipis' : 'Tersedia'),
            image: uploadedImageData || 'https://placehold.co/100x80?text=Product'
        };
        
        products.push(newProduct);
        saveProductsToStorage();
        renderProductTable();
        updateInventoryStats();
        showToast('Produk berhasil ditambahkan!', 'success');
        return true;
    });
    
    // Setup image upload handler
    setTimeout(() => {
        const imageInput = document.getElementById('productImageInput');
        const imagePreview = document.getElementById('productImagePreview');
        
        if (imageInput) {
            imageInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        uploadedImageData = event.target.result;
                        if (imagePreview) {
                            imagePreview.src = uploadedImageData;
                            imagePreview.style.display = 'block';
                        }
                        showToast('Foto produk berhasil diupload!', 'success');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }, 100);
}

// ==================== EDIT PRODUK DENGAN FOTO ====================
function editProductWithImage(index) {
    const product = products[index];
    uploadedImageData = null;
    
    showModal('Edit Produk', `
        <style>
            .product-preview {
                width: 100%;
                height: 120px;
                object-fit: cover;
                border-radius: 8px;
                margin-bottom: 10px;
                border: 1px solid #ddd;
            }
            .upload-product-label {
                display: inline-block;
                padding: 8px 16px;
                background: var(--primary);
                color: white;
                border-radius: 8px;
                cursor: pointer;
                font-size: 12px;
                margin-bottom: 10px;
            }
            .upload-product-label:hover {
                background: var(--primary-container);
            }
        </style>
        <div class="text-center">
            <img id="productImagePreview" class="product-preview" src="${product.image}" alt="Preview">
            <div>
                <label class="upload-product-label">
                    <span class="material-symbols-outlined" style="font-size: 16px;">photo_camera</span> Ganti Foto
                    <input type="file" id="productImageInput" accept="image/*" style="display: none;">
                </label>
            </div>
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Nama Produk</label>
            <input type="text" id="prodName" class="form-control" value="${product.name}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-bold">Kategori</label>
            <select id="prodCategory" class="form-select">
                <option ${product.category === 'Makanan' ? 'selected' : ''}>Makanan</option>
                <option ${product.category === 'Minuman' ? 'selected' : ''}>Minuman</option>
                <option ${product.category === 'Makanan Ringan' ? 'selected' : ''}>Makanan Ringan</option>
                <option ${product.category === 'Lain-lain' ? 'selected' : ''}>Lain-lain</option>
            </select>
        </div>
        <div class="row">
            <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Harga (Rp)</label>
                <input type="number" id="prodPrice" class="form-control" value="${product.price}">
            </div>
            <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Stok</label>
                <input type="number" id="prodStock" class="form-control" value="${product.stock}">
            </div>
        </div>
    `, () => {
        product.name = document.getElementById('prodName')?.value || product.name;
        product.category = document.getElementById('prodCategory')?.value || product.category;
        product.price = parseInt(document.getElementById('prodPrice')?.value) || product.price;
        product.stock = parseInt(document.getElementById('prodStock')?.value) || product.stock;
        product.status = product.stock === 0 ? 'Habis' : (product.stock < 20 ? 'Stok Menipis' : 'Tersedia');
        if (uploadedImageData) {
            product.image = uploadedImageData;
        }
        
        saveProductsToStorage();
        renderProductTable();
        showToast('Produk berhasil diupdate!', 'success');
        return true;
    });
    
    // Setup image upload handler
    setTimeout(() => {
        const imageInput = document.getElementById('productImageInput');
        const imagePreview = document.getElementById('productImagePreview');
        
        if (imageInput) {
            imageInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        uploadedImageData = event.target.result;
                        if (imagePreview) {
                            imagePreview.src = uploadedImageData;
                        }
                        showToast('Foto produk berhasil diupload!', 'success');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }, 100);
}

// ==================== UPDATE FUNGSI YANG ADA ====================
// Override fungsi initAddProductModal, editProduct, dan initSettings yang lama

// Replace initAddProductModal
const originalInitAddProductModal = initAddProductModal;
window.initAddProductModal = function() {
    const addBtn = document.querySelector('.btn-primary-sc');
    if (addBtn) {
        addBtn.addEventListener('click', () => showAddProductModal());
    }
};

// Replace editProduct
window.editProduct = function(index) {
    editProductWithImage(index);
};

// Replace initSettings
const originalInitSettings = initSettings;
window.initSettings = function() {
    loadUserProfileFromStorage();
    updateProfileUI();
    
    // Edit profile button
    const editProfileBtn = document.querySelector('.card-header .btn-link');
    if (editProfileBtn && editProfileBtn.innerText === 'Edit Details') {
        editProfileBtn.addEventListener('click', () => showEditProfileModal());
    }
    
    // Change password button
    const changePasswordBtn = document.querySelector('.btn-outline-secondary.border-start-0');
    if (changePasswordBtn && changePasswordBtn.innerText === 'Change') {
        changePasswordBtn.addEventListener('click', () => {
            showModal('Ubah Password', `
                <div class="mb-3">
                    <label class="form-label fw-bold">Password Lama</label>
                    <input type="password" id="oldPass" class="form-control">
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold">Password Baru</label>
                    <input type="password" id="newPass" class="form-control">
                </div>
                <div class="mb-3">
                    <label class="form-label fw-bold">Konfirmasi Password Baru</label>
                    <input type="password" id="confirmPass" class="form-control">
                </div>
            `, () => {
                const newPass = document.getElementById('newPass')?.value;
                const confirmPass = document.getElementById('confirmPass')?.value;
                
                if (newPass !== confirmPass) {
                    showToast('Password baru tidak cocok!', 'error');
                    return false;
                }
                if (newPass && newPass.length < 6) {
                    showToast('Password minimal 6 karakter!', 'error');
                    return false;
                }
                if (newPass) {
                    localStorage.setItem('eCanteen_password', btoa(newPass));
                    showToast('Password berhasil diubah!', 'success');
                }
                return true;
            });
        });
    }
    
    // Save settings button
    const saveBtn = document.querySelector('.btn-primary.px-5');
    if (saveBtn && saveBtn.innerText === 'Save Configuration') {
        saveBtn.addEventListener('click', () => {
            showToast('Pengaturan berhasil disimpan!', 'success');
        });
    }
    
    // Discard button
    const discardBtn = document.querySelector('.btn-link.text-muted');
    if (discardBtn && discardBtn.innerText === 'Discard Changes') {
        discardBtn.addEventListener('click', () => {
            loadUserProfileFromStorage();
            updateProfileUI();
            showToast('Perubahan dibatalkan', 'info');
        });
    }
    
    // 2FA Switch
    const twofaSwitch = document.getElementById('flexSwitch2fa');
    if (twofaSwitch) {
        const saved2fa = localStorage.getItem('eCanteen_2fa') === 'true';
        twofaSwitch.checked = saved2fa;
        twofaSwitch.addEventListener('change', () => {
            localStorage.setItem('eCanteen_2fa', twofaSwitch.checked);
            showToast(twofaSwitch.checked ? '2FA diaktifkan' : '2FA dinonaktifkan', 'success');
        });
    }
    
    // Notification switches
    const notifSwitches = document.querySelectorAll('.form-check-input');
    if (notifSwitches.length >= 3) {
        const savedNotif = JSON.parse(localStorage.getItem('eCanteen_notifications') || '{"transaction":true,"stock":true,"update":false}');
        notifSwitches[0].checked = savedNotif.transaction;
        notifSwitches[1].checked = savedNotif.stock;
        notifSwitches[2].checked = savedNotif.update;
        
        notifSwitches[0].addEventListener('change', () => {
            savedNotif.transaction = notifSwitches[0].checked;
            localStorage.setItem('eCanteen_notifications', JSON.stringify(savedNotif));
            showToast('Preferensi notifikasi disimpan', 'success');
        });
        notifSwitches[1].addEventListener('change', () => {
            savedNotif.stock = notifSwitches[1].checked;
            localStorage.setItem('eCanteen_notifications', JSON.stringify(savedNotif));
            showToast('Preferensi notifikasi disimpan', 'success');
        });
        notifSwitches[2].addEventListener('change', () => {
            savedNotif.update = notifSwitches[2].checked;
            localStorage.setItem('eCanteen_notifications', JSON.stringify(savedNotif));
            showToast('Preferensi notifikasi disimpan', 'success');
        });
    }
    
    // System preferences
    const currencySelect = document.querySelector('.col-md-4 select');
    if (currencySelect) {
        const savedCurrency = localStorage.getItem('eCanteen_currency') || 'IDR (Indonesian Rupiah)';
        currencySelect.value = savedCurrency;
        currencySelect.addEventListener('change', () => {
            localStorage.setItem('eCanteen_currency', currencySelect.value);
            showToast('Preferensi mata uang disimpan', 'success');
        });
    }
    
    const timezoneSelect = document.querySelectorAll('.col-md-4 select')[1];
    if (timezoneSelect) {
        const savedTimezone = localStorage.getItem('eCanteen_timezone') || 'WIB (GMT+7)';
        timezoneSelect.value = savedTimezone;
        timezoneSelect.addEventListener('change', () => {
            localStorage.setItem('eCanteen_timezone', timezoneSelect.value);
            showToast('Preferensi timezone disimpan', 'success');
        });
    }
    
    const languageSelect = document.querySelectorAll('.col-md-4 select')[2];
    if (languageSelect) {
        const savedLanguage = localStorage.getItem('eCanteen_language') || 'Bahasa Indonesia';
        languageSelect.value = savedLanguage;
        languageSelect.addEventListener('change', () => {
            localStorage.setItem('eCanteen_language', languageSelect.value);
            showToast('Preferensi bahasa disimpan', 'success');
        });
    }
};

// Override fungsi yang dipanggil di initInventory
function initInventory() {
    renderProductTable();
    updateInventoryStats();
    
    const addBtn = document.querySelector('.btn-primary-sc');
    if (addBtn) {
        addBtn.addEventListener('click', () => showAddProductModal());
    }
    
    // Setup filter dan sort
    const filterBtn = document.querySelector('.btn-white.border:first-child');
    if (filterBtn) {
        filterBtn.addEventListener('click', () => showFilterModal());
    }
    
    const sortBtn = document.querySelectorAll('.btn-white.border')[1];
    if (sortBtn) {
        sortBtn.addEventListener('click', () => showSortModal());
    }
}
    
    // Setup filter dan sort
    const filterBtn = document.querySelector('.btn-white.border:first-child');
    if (filterBtn) {
        filterBtn.addEventListener('click', () => showFilterModal());
    }
    
    const sortBtn = document.querySelectorAll('.btn-white.border')[1];
    if (sortBtn) {
        sortBtn.addEventListener('click', () => showSortModal());
    }

// ==================== MODAL & DIALOG COMPONENTS ====================
function showModal(title, content, onSave) {
    const existingModal = document.querySelector('.custom-modal-overlay');
    if (existingModal) existingModal.remove();
    
    const modalHtml = `
        <div class="custom-modal-overlay" style="position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:10000; display:flex; align-items:center; justify-content:center;">
            <div class="custom-modal" style="background:white; border-radius:16px; width:90%; max-width:500px; max-height:80vh; overflow:auto;">
                <div style="padding:20px; border-bottom:1px solid #ddd;">
                    <h5 class="fw-bold mb-0">${title}</h5>
                </div>
                <div style="padding:20px;">
                    ${content}
                </div>
                <div style="padding:15px 20px; border-top:1px solid #ddd; display:flex; justify-content:flex-end; gap:10px;">
                    <button class="btn btn-secondary modal-cancel">Batal</button>
                    <button class="btn btn-primary modal-save">Simpan</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = document.querySelector('.custom-modal-overlay');
    
    modal.querySelector('.modal-cancel').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-save').addEventListener('click', () => {
        if (onSave()) {
            modal.remove();
        }
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function showConfirmDialog(title, message, onConfirm) {
    const existingDialog = document.querySelector('.custom-modal-overlay');
    if (existingDialog) existingDialog.remove();
    
    const dialogHtml = `
        <div class="custom-modal-overlay" style="position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:10000; display:flex; align-items:center; justify-content:center;">
            <div class="custom-modal" style="background:white; border-radius:16px; width:90%; max-width:400px;">
                <div style="padding:20px; border-bottom:1px solid #ddd;">
                    <h5 class="fw-bold mb-0">${title}</h5>
                </div>
                <div style="padding:20px;">
                    <p class="mb-0">${message}</p>
                </div>
                <div style="padding:15px 20px; border-top:1px solid #ddd; display:flex; justify-content:flex-end; gap:10px;">
                    <button class="btn btn-secondary confirm-cancel">Batal</button>
                    <button class="btn btn-danger confirm-ok">Hapus</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', dialogHtml);
    const dialog = document.querySelector('.custom-modal-overlay');
    
    dialog.querySelector('.confirm-cancel').addEventListener('click', () => dialog.remove());
    dialog.querySelector('.confirm-ok').addEventListener('click', () => {
        onConfirm();
        dialog.remove();
    });
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.remove();
    });
}

function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.custom-toast');
    if (existingToast) existingToast.remove();
    
    const bgColor = type === 'success' ? '#198754' : (type === 'error' ? '#ba1a1a' : '#0f4c81');
    
    const toastHtml = `
        <div class="custom-toast" style="position: fixed; bottom: 30px; right: 30px; background: ${bgColor}; color: white; padding: 12px 24px; border-radius: 8px; z-index: 10001; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: fadeInOut 3s ease forwards;">
            ${message}
        </div>
        <style>
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(20px); }
                10% { opacity: 1; transform: translateY(0); }
                90% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(20px); }
            }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', toastHtml);
    setTimeout(() => {
        const toast = document.querySelector('.custom-toast');
        if (toast) toast.remove();
    }, 3000);
}
