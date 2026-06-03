const allRestaurants = [
    { id: 1, name: "Warung Koh Ray", distance: 0.8, rating: 4.8, sold: 120, food: "Mie Ayam Spesial", price: 18000, imgResto: "kohray.png", imgFood: "mieayam.png" },
    { id: 2, name: "Warung Bu Tini", distance: 12.0, rating: 5.0, sold: 50, food: "Ayam Geprek", price: 28000, imgResto: "butini.png", imgFood: "ayamgeprek.png" }
];

let cart = {}; 
let isPromoApplied = false;
let selectedPayment = 'tunai';
let currentDetailId = null; 
let activeFilters = { terdekat: false, rating: null, harga: null };

let notifData = [];
let unreadNotifCount = 0;
let lastPageSebelumNotif = 'page-home';

showPage('page-home');
renderHomeList(allRestaurants);

function showPage(pageId) {
    if(pageId !== 'page-notifikasi') {
        lastPageSebelumNotif = pageId;
    }
    
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
}

function goToHome() { 
    showPage('page-home'); 
    updateCartBadge(); 
    document.querySelectorAll('#stars-driver span, #stars-resto span').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tip-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('search-input-home').value = '';
    document.getElementById('search-input').value = '';
    resetFilter();
}

function goToCart() { showPage('cart-page'); renderCartPage(); }
function goToCheckout() { showPage('checkout-page'); renderCheckoutPage(); }
function goToLokasi() { showPage('page-lokasi'); }
function goToPromo() { showPage('page-promo'); }

function goToNotifikasi() {
    showPage('page-notifikasi');
    unreadNotifCount = 0;
    updateNotifBadge();
    renderNotifikasi();
}

function goBackFromNotif() {
    showPage(lastPageSebelumNotif);
}

function pushNotif(text, icon) {
    const now = new Date();
    const time = String(now.getHours()).padStart(2, '0') + '.' + String(now.getMinutes()).padStart(2, '0');
    notifData.unshift({ text, icon, time }); 
    unreadNotifCount++;
    updateNotifBadge();
    
    // Auto-update jika sedang buka halaman notifikasi
    if (document.getElementById('page-notifikasi').classList.contains('active')) {
        renderNotifikasi();
        unreadNotifCount = 0;
        updateNotifBadge();
    }
}

function renderNotifikasi() {
    const container = document.getElementById('notif-list-container');
    container.innerHTML = '';
    if (notifData.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#888; margin-top:20px;">Belum ada notifikasi.</p>';
        return;
    }
    notifData.forEach(notif => {
        container.innerHTML += `
            <div class="notif-card">
                <div class="notif-icon">${notif.icon}</div>
                <div class="notif-info">
                    <span class="notif-time">${notif.time}</span>
                    <span class="notif-text">${notif.text}</span>
                </div>
            </div>
        `;
    });
}

function updateNotifBadge() {
    const badges = document.querySelectorAll('.notif-badge');
    badges.forEach(badge => {
        if (unreadNotifCount > 0) {
            badge.style.display = 'flex';
            badge.innerText = unreadNotifCount;
        } else {
            badge.style.display = 'none';
        }
    });
}

function pilihLokasi(alamatText) {
    document.getElementById('checkout-address-text').innerText = "Antar ke " + alamatText;
    document.getElementById('home-address-text').innerText = alamatText;
    document.getElementById('input-cari-lokasi').value = ''; 
    showPage('checkout-page');
}

function searchLokasiInput(event) {
    if (event.key === 'Enter') {
        pilihLokasi(event.target.value);
    }
}

function handleSearchHome(event) {
    if (event.key === 'Enter') {
        let val = document.getElementById('search-input-home').value;
        document.getElementById('search-input').value = val;
        showPage('page-search');
        filterProduk();
    }
}

function toggleFilter(type) {
    if (document.getElementById('page-home').classList.contains('active')) {
        showPage('page-search');
    }

    if (type === 'terdekat') activeFilters.terdekat = !activeFilters.terdekat;
    else if (type === 'rating-tinggi') activeFilters.rating = (activeFilters.rating === 'tinggi') ? null : 'tinggi';
    else if (type === 'rating-rendah') activeFilters.rating = (activeFilters.rating === 'rendah') ? null : 'rendah';
    else if (type === 'harga-tinggi') activeFilters.harga = (activeFilters.harga === 'tinggi') ? null : 'tinggi';
    else if (type === 'harga-rendah') activeFilters.harga = (activeFilters.harga === 'rendah') ? null : 'rendah';
    
    updateFilterUI(); 
    filterProduk();
}

function resetFilter() {
    activeFilters = { terdekat: false, rating: null, harga: null };
    updateFilterUI();
    filterProduk();
}

function updateFilterUI() {
    document.querySelectorAll('.chip, .filter-pill').forEach(btn => btn.classList.remove('active'));
    
    if (activeFilters.terdekat) document.getElementById('btn-terdekat').classList.add('active');
    if (activeFilters.rating === 'tinggi') document.getElementById('btn-rating-tinggi').classList.add('active');
    if (activeFilters.rating === 'rendah') document.getElementById('btn-rating-rendah').classList.add('active');
    if (activeFilters.harga === 'tinggi') document.getElementById('btn-harga-tinggi').classList.add('active');
    if (activeFilters.harga === 'rendah') document.getElementById('btn-harga-rendah').classList.add('active');
}

function filterProduk() {
    let input = document.getElementById('search-input').value.toLowerCase().trim();
    let filteredData = allRestaurants.filter(r => 
        r.name.toLowerCase().includes(input) || r.food.toLowerCase().includes(input)
    );
    
    filteredData.sort((a, b) => {
        if (activeFilters.terdekat && a.distance !== b.distance) return a.distance - b.distance; 
        if (activeFilters.rating && a.rating !== b.rating) return activeFilters.rating === 'tinggi' ? b.rating - a.rating : a.rating - b.rating;
        if (activeFilters.harga && a.price !== b.price) return activeFilters.harga === 'tinggi' ? b.price - a.price : a.price - b.price;
        return 0; 
    });

    renderSearchList(filteredData);
}

function renderSearchList(data) {
    const container = document.getElementById('results-wrapper');
    if(!container) return;
    container.innerHTML = ''; 
    let ada = false;
    
    data.forEach(resto => {
        ada = true;
        const formattedPrice = "Rp." + resto.price.toLocaleString('id-ID');
        const cardHTML = `
            <div class="warung-section" onclick="openDetail(${resto.id})">
                <div class="warung-header">
                    <img src="${resto.imgResto}" class="warung-img">
                    <div>
                        <h3 style="margin: 0 0 5px 0; font-size: 16px;">${resto.name}</h3>
                        <p style="color:#aaa; font-size:12px; margin:0;">${resto.distance} km | ⭐ ${resto.rating.toFixed(1)} | <span style="color:#ffeb00;">${resto.sold}</span> terjual</p>
                    </div>
                </div>
                <div class="product-card">
                    <img src="${resto.imgFood}">
                    <h4 style="font-size: 14px; margin-top: 8px; margin-bottom: 4px; color: #fff;">${resto.food}</h4>
                    <p style="color: #ffeb00; font-size: 13px; font-weight: bold; margin:0;">${formattedPrice}</p>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
    
    let noResultEl = document.getElementById('no-result');
    if(noResultEl) noResultEl.style.display = ada ? "none" : "block";
}

function renderHomeList(data) {
    const container = document.getElementById('recommendation-wrapper');
    if(!container) return;
    container.innerHTML = ''; 
    
    data.forEach(resto => {
        const formattedPrice = "Rp." + resto.price.toLocaleString('id-ID');
        const cardHTML = `
            <div class="home-card" onclick="openDetail(${resto.id})">
                <img src="${resto.imgFood}" alt="${resto.food}">
                <div class="home-card-info">
                    <h2>${resto.food}</h2>
                    <p>${formattedPrice}</p>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

function openDetail(id) {
    currentDetailId = id; const resto = allRestaurants.find(r => r.id === id);
    document.getElementById('detail-bg').src = resto.imgResto; document.getElementById('detail-resto-img').src = resto.imgResto;
    document.getElementById('detail-resto-name').innerText = resto.name; document.getElementById('detail-resto-dist').innerText = resto.distance + " km";
    document.getElementById('detail-resto-rating').innerText = resto.rating.toFixed(1); document.getElementById('detail-resto-sold').innerText = resto.sold + " terjual";
    document.getElementById('detail-food-img').src = resto.imgFood; document.getElementById('detail-food-name').innerText = resto.food;
    document.getElementById('detail-food-price').innerText = "Rp." + resto.price.toLocaleString('id-ID');
    updateQtyUI(); showPage('detail-page');
}

function changeQty(amount) {
    let currentQty = cart[currentDetailId] || 0; currentQty += amount;
    if (currentQty <= 0) delete cart[currentDetailId]; else cart[currentDetailId] = currentQty;
    updateQtyUI();
}

function changeQtyCheckout(id, amount) {
    let currentQty = cart[id] || 0; currentQty += amount;
    if (currentQty <= 0) delete cart[id]; else cart[id] = currentQty;
    if (Object.keys(cart).length === 0) goToHome(); else renderCheckoutPage(); 
}

function updateQtyUI() {
    const qty = cart[currentDetailId] || 0; const resto = allRestaurants.find(r => r.id === currentDetailId);
    document.getElementById('qty-display').innerText = qty; const checkoutBar = document.getElementById('checkout-bar');
    if (qty > 0) { checkoutBar.style.display = 'block'; checkoutBar.querySelector('.checkout-btn').innerText = `Beli Sekarang - Rp${(qty * resto.price).toLocaleString('id-ID')}`; } 
    else { checkoutBar.style.display = 'none'; }
}

function updateCartBadge() {
    const totalItems = Object.keys(cart).length;
    const badges = [document.getElementById('cart-badge-home'), document.getElementById('cart-badge-search')];
    badges.forEach(badge => {
        if(badge) {
            if(totalItems > 0) { badge.style.display = 'flex'; badge.innerText = totalItems; } 
            else { badge.style.display = 'none'; }
        }
    });
}

function renderCartPage() {
    const container = document.getElementById('cart-list-container'); container.innerHTML = '';
    const cartIds = Object.keys(cart);
    if (cartIds.length === 0) { container.innerHTML = '<p style="text-align:center; margin-top: 50px; color: black;">Keranjang kosong.</p>'; return; }
    cartIds.forEach(id => {
        const resto = allRestaurants.find(r => r.id == id);
        container.innerHTML += `<div class="cart-item-card"><img src="${resto.imgFood}" class="cart-item-img"><div class="cart-item-info"><div><h4>${resto.food}</h4><p>${resto.name}</p><div class="price">Rp.${resto.price.toLocaleString('id-ID')}</div></div><div class="btn-lanjut-pesan" onclick="goToCheckout()">Lanjutkan pemesanan>></div></div></div>`;
    });
}

function renderCheckoutPage() {
    const itemContainer = document.getElementById('checkout-items'); itemContainer.innerHTML = '';
    let subtotal = 0; let totalItems = 0;
    Object.keys(cart).forEach(id => {
        const resto = allRestaurants.find(r => r.id == id); const qty = cart[id]; subtotal += (resto.price * qty); totalItems += qty;
        itemContainer.innerHTML += `<div class="co-item-card"><img src="${resto.imgFood}" class="co-item-img"><div class="co-item-info"><h4>${resto.food}</h4><p>${resto.name}</p><div class="co-item-price-row"><div class="price">Rp ${resto.price.toLocaleString('id-ID')}</div><div class="qty-controls"><button class="btn-qty btn-minus" style="width:24px;height:24px;font-size:14px;" onclick="changeQtyCheckout(${id}, -1)">−</button><span class="qty-num" style="font-size:14px; color: black;">${qty}</span><button class="btn-qty btn-plus" style="width:24px;height:24px;font-size:14px;" onclick="changeQtyCheckout(${id}, 1)">+</button></div></div></div></div>`;
    });
    const ongkir = 8000; const diskon = isPromoApplied ? 12000 : 0; const totalBayar = subtotal + ongkir - diskon;
    document.getElementById('co-qty-text').innerText = `Subtotal(${totalItems} item)`; document.getElementById('co-subtotal').innerText = `Rp. ${subtotal.toLocaleString('id-ID')}`;
    document.getElementById('summary-discount').style.display = isPromoApplied ? 'flex' : 'none';
    document.getElementById('co-total-bayar').innerText = `Rp. ${totalBayar.toLocaleString('id-ID')}`;
}

function selectPayment(method) {
    selectedPayment = method; document.getElementById('radio-kaspro').classList.remove('selected'); document.getElementById('radio-tunai').classList.remove('selected'); document.getElementById(`radio-${method}`).classList.add('selected');
}

function applyPromo() {
    const input = document.getElementById('promo-code-input').value.toUpperCase();
    if (input === 'MAXIM20') { isPromoApplied = true; document.getElementById('promo-success-msg').style.display = 'flex'; renderCheckoutPage(); } else { alert("Kode promo tidak valid"); }
}

function goToTracking() {
    showPage('tracking-page');
    notifData = []; 
    updateNotifBadge();
    
    const firstCartId = Object.keys(cart)[0] || 2;
    const resto = allRestaurants.find(r => r.id == firstCartId);
    const qty = cart[firstCartId] || 1;
    
    document.getElementById('tracking-food-item').innerHTML = `
        <div style="display: flex; gap: 15px; align-items: center; width: 100%;">
            <img src="${resto.imgFood}" style="width: 70px; height: 70px; border-radius: 8px; object-fit: cover;">
            <div style="flex: 1;">
                <h4 style="font-size: 14px; font-weight: bold; margin: 0 0 3px 0; color: #000;">${resto.food}</h4>
                <p style="font-size: 11px; color: #666; margin: 0 0 5px 0;">${resto.name}</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: bold; font-size: 14px; color: #000;">Rp ${resto.price.toLocaleString('id-ID')}</div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: bold; font-size: 14px; color: #000; margin: 0 5px;">Jumlah: ${qty}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('rating-resto-card').innerHTML = `
        <div class="card-resto">
            <img src="${resto.imgResto}" alt="${resto.name}" class="img-resto-sm">
            <div class="resto-info" style="text-align: left;">
                <h4>${resto.name}</h4>
                <p>${resto.distance} km</p>
                <div class="stars" style="color:#FFFF00;">★★★★★</div>
            </div>
        </div>
    `;

    startTrackingRealtime();
}

function startTrackingRealtime() {
    document.getElementById('tracking-title-text').innerText = "Estimasi";
    document.getElementById('tracking-state-1').style.display = 'block'; 
    document.getElementById('tracking-state-2').style.display = 'none';  
    
    document.getElementById('prog-step-2').classList.remove('active');
    document.getElementById('prog-step-3').classList.remove('active');
    document.getElementById('prog-step-4').classList.remove('active');
    document.getElementById('prog-line-2').classList.remove('active');
    document.getElementById('prog-line-3').classList.remove('active');
    
    document.getElementById('tracking-status-text').innerText = "Mencari driver...";
    document.getElementById('driver-card').style.display = 'none'; 

    pushNotif('Mencari driver', 'Ⓜ️');

    setTimeout(() => {
        document.getElementById('prog-step-2').classList.add('active'); 
        document.getElementById('prog-line-2').classList.add('active'); 
        document.getElementById('tracking-status-text').innerText = "Menunggu makananmu";
        document.getElementById('driver-card').style.display = 'flex'; 
        
        pushNotif('Mendapatkan driver', '👤');
        setTimeout(() => pushNotif('Driver sampai di resto', '🍴'), 500);
        setTimeout(() => pushNotif('Menunggu makananmu', '🍳'), 1000);
    }, 2000); 

    setTimeout(() => {
        document.getElementById('tracking-title-text').innerText = "Tepat waktu";
        document.getElementById('tracking-state-1').style.display = 'none'; 
        document.getElementById('tracking-state-2').style.display = 'block'; 
        document.getElementById('tracking-status-text').innerText = "Driver menuju lokasi mu";
        
        pushNotif('Makananmu sudah selesai', '🛎️');
        setTimeout(() => pushNotif('Driver menuju lokasimu', '🛵'), 500);
    }, 5000); 

    setTimeout(() => {
        pushNotif('Pesanan selesai', '🏠');
        showPage('page-rating-driver');
    }, 10000); 
}

function rateDriver(num) {
    const stars = document.querySelectorAll('#stars-driver span');
    stars.forEach((star, index) => star.classList.toggle('active', index < num));
    setTimeout(() => { showPage('page-tip-driver'); }, 500);
}

function selectTip(element) {
    document.querySelectorAll('.tip-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
}

function submitTip() { showPage('page-rating-resto'); }
function skipTip() { showPage('page-rating-resto'); }
function goBackToTip() { showPage('page-tip-driver'); }

function rateResto(num) {
    const stars = document.querySelectorAll('#stars-resto span');
    stars.forEach((star, index) => star.classList.toggle('active', index < num));
    setTimeout(() => { 
        cart = {}; 
        isPromoApplied = false;
        notifData = []; 
        goToHome(); 
    }, 500);
}