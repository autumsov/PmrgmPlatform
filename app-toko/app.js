// === 1. KONFIGURASI API & DETEKSI OTOMATIS ===
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BASE_URL = isLocal 
    ? '../api-toko' 
    : '/api-toko'; 

const API_URL = `${BASE_URL}/get_barang.php`;

// === GUARD PENGECEKAN LOGIN ===
const API_TOKEN = localStorage.getItem('token_toko');
if (!API_TOKEN) {
    // Redirect langsung + parameter untuk notifikasi keamanan di halaman login
    window.location.replace('login.html?denied=1');
    throw new Error('[Auth] No token found — redirecting to login.');
}

// Tambahkan Fungsi Logout ke global scope
window.logout = async function() {
    const result = await Swal.fire({
        icon: 'question',
        title: 'Yakin Logout?',
        text: 'Sesi Anda akan diakhiri dan Anda harus login kembali.',
        showCancelButton: true,
        confirmButtonText: 'Ya, Logout',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#94a3b8',
        customClass: { popup: 'rounded-3xl' }
    });

    if (result.isConfirmed) {
        localStorage.removeItem('token_toko');
        await Swal.fire({
            icon: 'success',
            title: 'Berhasil Logout!',
            text: 'Anda telah keluar dari sistem dengan aman.',
            timer: 1500,
            showConfirmButton: false,
            customClass: { popup: 'rounded-3xl' }
        });
        window.location.replace('login.html');
    }
};
// ===============================

// === 2. PWA INSTALLATION LOGIC (RUNS FIRST) ===
console.log('[PWA] UI Version 8.0.1 Loaded');

let deferredPrompt;
const pwaInstallBtn = document.getElementById('pwa-install-btn');

// Deteksi platform
const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || 
             (navigator.userAgent.includes("Mac") && "ontouchend" in document);
const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

// === Chromium: Tangkap event install prompt (jika tersedia) ===
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('[PWA] beforeinstallprompt captured!');
});

// === Fungsi untuk trigger native install (Chromium only) ===
function triggerNativeInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') {
        console.log('[PWA] User installed via native prompt');
        if (pwaInstallBtn) pwaInstallBtn.classList.add('hidden');
      }
      deferredPrompt = null;
    });
  }
}

// === Panduan iOS (Safari Add to Home Screen) ===
function showIOSGuide() {
  Swal.fire({
    title: '📱 Install di iPhone',
    html: `
      <div class="text-left text-sm space-y-3 p-2">
        <p>Aplikasi ini bisa dipasang di iPhone kamu tanpa App Store!</p>
        <div class="flex items-center gap-3">
           <div class="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg font-bold shrink-0">1</div>
           <p>Tekan tombol <strong>'Share'</strong> (ikon kotak panah atas di bawah Safari).</p>
        </div>
        <div class="flex items-center gap-3">
           <div class="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg font-bold shrink-0">2</div>
           <p>Scroll ke bawah, pilih <strong>'Add to Home Screen'</strong>.</p>
        </div>
        <div class="flex items-center gap-3">
           <div class="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg font-bold shrink-0">3</div>
           <p>Tekan <strong>'Add'</strong> di pojok kanan atas.</p>
        </div>
      </div>
    `,
    icon: 'info',
    confirmButtonText: 'Siap, Mengerti!',
    confirmButtonColor: '#3b82f6',
    customClass: { popup: 'rounded-3xl' }
  });
}

// === Panduan untuk browser desktop (Edge, Firefox, dll.) ===
function showDesktopGuide() {
  Swal.fire({
    title: '🖥️ Install Aplikasi Ini',
    html: `
      <div class="text-left text-sm space-y-3 p-2">
        <p>Kamu bisa memasang aplikasi ini langsung dari browser!</p>
        <div class="flex items-center gap-3">
           <div class="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg font-bold shrink-0">1</div>
           <p>Klik ikon <strong>titik tiga (⋮)</strong> atau <strong>menu (≡)</strong> di pojok kanan atas browser.</p>
        </div>
        <div class="flex items-center gap-3">
           <div class="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg font-bold shrink-0">2</div>
           <p>Pilih <strong>"Install App"</strong>, <strong>"Install Toko Barang"</strong>, atau <strong>"Add to Home Screen"</strong>.</p>
        </div>
        <div class="flex items-center gap-3">
           <div class="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg font-bold shrink-0">3</div>
           <p>Konfirmasi <strong>'Install'</strong>. Ikon app akan muncul di desktop/home screen!</p>
        </div>
      </div>
    `,
    icon: 'info',
    confirmButtonText: 'Oke, Siap!',
    confirmButtonColor: '#10b981',
    customClass: { popup: 'rounded-3xl' }
  });
}

// === POPUP OTOMATIS: SELALU muncul setelah 3 detik (semua browser) ===
if (!isStandalone) {
  // Tombol Install selalu terlihat
  if (pwaInstallBtn) pwaInstallBtn.classList.remove('hidden');

  // Ubah teks tombol untuk iOS
  if (isIOS && pwaInstallBtn) {
    pwaInstallBtn.innerHTML = `
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
      Install App
    `;
  }

  // Popup otomatis 3 detik
  setTimeout(() => {
    try {
      if (typeof Swal === 'undefined') throw new Error('Swal not loaded');
      Swal.fire({
        title: '🚀 Dapatkan Aplikasi!',
        text: 'Pasang di layar utama HP/Desktop kamu untuk akses instan tanpa buka browser!',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: '✅ Install Sekarang',
        cancelButtonText: 'Nanti Saja',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#94a3b8',
        customClass: { popup: 'rounded-3xl' }
      }).then((result) => {
        if (result.isConfirmed) {
          if (deferredPrompt) {
            triggerNativeInstall();
          } else if (isIOS) {
            showIOSGuide();
          } else {
            showDesktopGuide();
          }
        }
      });
    } catch (err) {
      console.warn('[PWA] SweetAlert failed, using fallback:', err);
      if (window.confirm('Install aplikasi ini ke layar utama? Klik OK untuk panduan instalasi.')) {
        if (deferredPrompt) {
          triggerNativeInstall();
        } else {
          alert('Buka menu browser (⋮) -> Pilih "Install App" atau "Add to Home Screen"');
        }
      }
    }
  }, 3000);
} else {
  // Sudah dalam mode standalone (PWA installed), sembunyikan tombol
  if (pwaInstallBtn) pwaInstallBtn.classList.add('hidden');
  console.log('[PWA] Already in standalone mode — Install UI hidden.');
}

// === Tombol Install (manual click) ===
if (pwaInstallBtn) {
  pwaInstallBtn.addEventListener('click', () => {
    if (deferredPrompt) {
      triggerNativeInstall();
    } else if (isIOS) {
      showIOSGuide();
    } else {
      showDesktopGuide();
    }
  });
}

// === Service Worker Registration ===
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[SW] Registered:', reg.scope))
      .catch(err => console.error('[SW] Registration failed:', err));
  });
}

// === 3. ELEMEN DOM ===
const tbodyEl       = document.getElementById('tabel-barang');
const loadingEl     = document.getElementById('loading-state');
const errorEl       = document.getElementById('error-state');
const errorMsgEl    = document.getElementById('error-msg');
const tableWrapEl   = document.getElementById('table-wrapper');
const emptyEl       = document.getElementById('empty-state');
const footerInfoEl  = document.getElementById('footer-info');
const searchInput   = document.getElementById('search-input');
const btnRefresh    = document.getElementById('btn-refresh');

// Pagination DOM
const paginationBar  = document.getElementById('pagination-bar');
const paginationInfo = document.getElementById('pagination-info');
const btnPrev        = document.getElementById('btn-prev');
const btnNext        = document.getElementById('btn-next');
const pageDots       = document.getElementById('page-dots');

// Stats
const statTotal = document.getElementById('stat-total');
const statAvg   = document.getElementById('stat-avg');

// ===== STATE =====
let allData       = [];
let editingId     = null;   // ID data yang sedang diedit
let currentPage   = 1;      // Halaman aktif saat ini
let totalPages    = 1;      // Total halaman dari server
let totalData     = 0;      // Total item keseluruhan
let currentSearch = '';     // Kata kunci pencarian aktif

// ===== HELPER: Format Rupiah =====
function formatRupiah(angka) {
  const num = parseFloat(angka);
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(num);
}

// ===== RENDER TABEL =====
function renderTable(data) {
  tbodyEl.innerHTML = '';

  if (data.length === 0) {
    showState('empty');
    return;
  }

  showState('table');

  data.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50/80 transition-colors cursor-default group';

    const nama       = item.nama_barang  || item.nama  || item.name  || '—';
    const harga      = item.harga        || item.price || 0;
    const realId     = item.id           || item.id_barang || (index + 1);
    const displayId  = item.displayId    || (index + 1);
    const gambar     = item.gambar       || null;
    const kode_qr    = item.kode_qr      || '';
    const lat        = item.latitude     || '';
    const lng        = item.longitude    || '';

    let btnLokasi = `<span class="text-xs text-gray-300">-</span>`;
    if (lat && lng) {
        btnLokasi = `<a href="https://maps.google.com/?q=${lat},${lng}" target="_blank" class="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-md font-bold hover:bg-blue-100 transition hover:text-blue-700 text-xs shadow-sm"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> Peta</a>`;
    }

    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-400 font-mono">#${String(displayId).padStart(3,'0')}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs border border-gray-200 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors overflow-hidden">
            ${gambar ? `<img src="${BASE_URL}/uploads/${gambar}" class="w-full h-full object-cover">` : nama.charAt(0).toUpperCase()}
          </div>
          <div>
            <span class="block text-sm font-bold text-gray-800 tracking-tight">${nama}</span>
            <span class="block text-[10px] text-gray-400 uppercase tracking-widest font-bold">Standard SKU ${kode_qr ? `· QR: ${kode_qr}` : ''}</span>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right font-black text-gray-900 text-sm">
        ${formatRupiah(harga)}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-center">
        ${btnLokasi}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-center flex items-center justify-center gap-2">
        <button onclick="editBarang('${realId}')" class="text-gray-300 hover:text-blue-500 hover:bg-blue-50 p-2 rounded-xl transition-all active:scale-90" title="Edit Item">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
        </button>
        <button onclick="deleteBarang('${realId}', '${displayId}', '${nama}')" class="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all active:scale-90" title="Remove Item">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </td>
    `;
    tbodyEl.appendChild(tr);
  });

  // GSAP animation for table rows (Staggered fade-in & slide-up)
  if (typeof gsap !== 'undefined') {
    gsap.fromTo(tbodyEl.children, 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out", clearProps: "all" }
    );
  }
}

// ===== UPDATE STATS =====
function updateStats(totalItems, totalAsset) {
  if (totalItems === 0) {
    statTotal.textContent = '0';
    statAvg.textContent   = 'Rp 0';
    return;
  }
  
  statTotal.textContent = totalItems;
  statAvg.textContent   = formatRupiah(totalAsset);
}

// ===== SHOW STATE =====
function showState(state) {
  loadingEl.classList.add('hidden');    loadingEl.classList.remove('flex');
  errorEl.classList.add('hidden');      errorEl.classList.remove('flex');
  tableWrapEl.classList.add('hidden');
  emptyEl.classList.add('hidden');      emptyEl.classList.remove('flex');

  if (state === 'loading') { loadingEl.classList.remove('hidden'); loadingEl.classList.add('flex'); }
  if (state === 'error')   { errorEl.classList.remove('hidden');   errorEl.classList.add('flex'); }
  if (state === 'table')   { tableWrapEl.classList.remove('hidden'); }
  if (state === 'empty')   { emptyEl.classList.remove('hidden');   emptyEl.classList.add('flex'); }
}

// ===== FETCH DATA (Server-Side: cari + page) =====
async function fetchBarang(page = 1, cari = '') {
  // Update state
  currentPage   = page;
  currentSearch = cari;

  showState('loading');
  paginationBar.classList.add('hidden');
  footerInfoEl.textContent = '';
  btnRefresh.disabled = true;
  btnRefresh.classList.add('opacity-60');

  try {
    // Bangun URL dengan parameter cari & page
    const params = new URLSearchParams({ page: currentPage, limit: 5 });
    if (currentSearch) params.append('cari', currentSearch);
    const url = `${API_URL}?${params.toString()}`;

    const response = await fetch(url);
    const contentType = response.headers.get('content-type');

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server tidak mengirim data JSON. Silakan refresh halaman (F5) untuk melewati sistem keamanan hosting.');
    }

    const json = await response.json();
    if (json.status !== 'success') throw new Error(json.message || 'Response tidak valid');

    // Simpan data halaman ini & metadata paginasi
    allData    = (json.data || []).map((item, idx) => ({
      ...item,
      displayId: (currentPage - 1) * 5 + idx + 1  // nomor urut global
    }));
    totalPages = json.pagination?.total_pages ?? 1;
    totalData  = json.pagination?.total_data  ?? allData.length;

    updateStats(totalData, json.pagination?.total_asset || 0);
    renderTable(allData);
    renderPagination();

    const now = new Date().toLocaleTimeString('id-ID');
    footerInfoEl.textContent =
      `✓ Menampilkan ${allData.length} dari ${totalData} data · Halaman ${currentPage}/${totalPages} · ${now}`;

  } catch (err) {
    showState('error');
    errorMsgEl.textContent = err.message;
    console.error('[app.js] Fetch error:', err);
  } finally {
    btnRefresh.disabled = false;
    btnRefresh.classList.remove('opacity-60');
  }
}

// ===== RENDER PAGINASI =====
function renderPagination() {
  if (totalPages <= 1) {
    paginationBar.classList.add('hidden');
    return;
  }

  // Tampilkan bar
  paginationBar.classList.remove('hidden');

  // Info teks
  const start = (currentPage - 1) * 5 + 1;
  const end   = Math.min(currentPage * 5, totalData);
  paginationInfo.textContent =
    `Menampilkan ${start}–${end} dari ${totalData} item · Halaman ${currentPage} dari ${totalPages}`;

  // === Tombol Prev ===
  btnPrev.disabled = (currentPage <= 1);

  // === Tombol Next ===
  btnNext.disabled = (currentPage >= totalPages);

  // === Page dots (number pills) ===
  pageDots.innerHTML = '';
  const maxDots = 5;
  let startDot = Math.max(1, currentPage - Math.floor(maxDots / 2));
  let endDot   = Math.min(totalPages, startDot + maxDots - 1);
  if (endDot - startDot < maxDots - 1) startDot = Math.max(1, endDot - maxDots + 1);

  for (let i = startDot; i <= endDot; i++) {
    const btn = document.createElement('button');
    const isActive = i === currentPage;
    btn.textContent = i;
    btn.className = isActive
      ? 'w-8 h-8 rounded-lg text-xs font-extrabold bg-blue-600 text-white shadow shadow-blue-500/30 scale-110 transition-all'
      : 'w-8 h-8 rounded-lg text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all';
    btn.disabled = isActive;
    btn.addEventListener('click', () => fetchBarang(i, currentSearch));
    pageDots.appendChild(btn);
  }
}

// ===== SEARCH — onkeyup: real-time, reset ke halaman 1 =====
let searchDebounceTimer = null;
searchInput.addEventListener('keyup', () => {
  // Debounce 300ms agar tidak terlalu banyak request saat mengetik cepat
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    const q = searchInput.value.trim();
    fetchBarang(1, q);  // Selalu mulai dari halaman 1 saat pencarian baru
  }, 300);
});

// ===== TOMBOL PREV / NEXT =====
btnPrev.addEventListener('click', () => {
  if (currentPage > 1) fetchBarang(currentPage - 1, currentSearch);
});

btnNext.addEventListener('click', () => {
  if (currentPage < totalPages) fetchBarang(currentPage + 1, currentSearch);
});

// ===== REFRESH BUTTON =====
btnRefresh.addEventListener('click', () => {
  searchInput.value = '';
  fetchBarang(1, '');  // Reset ke halaman 1 tanpa filter
});

// ===== HIDE MODAL LOGIC (We are no longer using this full-page modal) =====
// ===== INLINE FORM TOGGLE LOGIC =====
const btnAddModal = document.getElementById('btn-add-modal');
const formInlineWrapper = document.getElementById('form-inline-wrapper');

if(btnAddModal) {
  btnAddModal.addEventListener('click', () => {
    if(formInlineWrapper.style.display === 'none') {
      formInlineWrapper.style.display = 'block';
      cancelEdit(); // Reset form when explicitly opening it
    } else {
      formInlineWrapper.style.display = 'none';
      cancelEdit();
    }
  });
}

// ===== INLINE FORM BARANG LOGIC =====
const INLINE_API_URL = `${BASE_URL}/tambah_barang.php`;
const UPDATE_API_URL = `${BASE_URL}/update_barang.php`;
const formInline = document.getElementById('form-tambah-inline');
const submitInlineSpinner = document.getElementById('submit-spinner-inline');
const btnCancelInline = document.getElementById('btn-cancel-inline');
const textSubmitInline = document.getElementById('text-submit-inline');
const inlineNama = document.getElementById('inline-nama');
const inlineHarga = document.getElementById('inline-harga');
const btnSubmitInline = document.getElementById('btn-submit-inline');

if(formInline) {
  formInline.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(submitInlineSpinner) submitInlineSpinner.classList.remove('hidden');
    
    const formData = new FormData(formInline);

    let apiUrl = INLINE_API_URL;
    if (editingId) {
      apiUrl = UPDATE_API_URL;
      formData.append('id', editingId);
    }
    
    // Tambakan token ke FormData sebagai fallback jika header Authorization dihapus hosting
    formData.append('token', API_TOKEN);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${API_TOKEN}`
        },
        body: formData
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Gagal memproses JSON. Hosting sedang memblokir akses sementara, silakan refresh halaman.');
      }

      const json = await response.json();
      
      if(response.ok && json.status === 'success') {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: editingId ? 'Barang diupdate!' : 'Barang ditambahkan!',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true
        });
        cancelEdit();
        fetchBarang(); // Refresh data tanpa blinking
      } else {
        Swal.fire({
           icon: 'error',
           title: 'Gagal!',
           text: json.message || 'Error server',
           customClass: { popup: 'rounded-3xl' }
        });
      }
    } catch (err) {
      Swal.fire({
          icon: 'error',
          title: 'Terjadi kesalahan!',
          text: err.message,
          customClass: { popup: 'rounded-3xl' }
      });
    } finally {
      if(submitInlineSpinner) submitInlineSpinner.classList.add('hidden');
    }
  });
}

// ===== EDIT BARANG LOGIC =====
window.editBarang = function(id) {
  const item = allData.find(d => d.id == id || d.id_barang == id);
  if (!item) return;

  editingId = item.id || item.id_barang;
  inlineNama.value = item.nama_barang || item.nama || item.name || '';
  inlineHarga.value = item.harga || item.price || '';
  
  const inKodeQr = document.getElementById('inline-kode_qr');
  if(inKodeQr) inKodeQr.value = item.kode_qr || '';
  const inLat = document.getElementById('inline-latitude');
  if(inLat) inLat.value = item.latitude || '';
  const inLng = document.getElementById('inline-longitude');
  if(inLng) inLng.value = item.longitude || '';

  // Tampilkan form jika sedang disembunyikan
  if(formInlineWrapper) {
    formInlineWrapper.style.display = 'block';
  }

  // Ubah tampilan tombol
  if(textSubmitInline) textSubmitInline.textContent = 'Update Data';
  if(btnCancelInline) btnCancelInline.classList.remove('hidden');
  
  // Ubah warna tombol ke biru cerah (sesuai instruksi PjBL)
  if(btnSubmitInline) {
    btnSubmitInline.classList.remove('bg-brand-600', 'hover:bg-brand-700');
    btnSubmitInline.classList.add('bg-blue-600', 'hover:bg-blue-700');
  }
  
  // Scroll ke atas (ke form)
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ===== CANCEL EDIT LOGIC =====
window.cancelEdit = function() {
  editingId = null;
  if(formInline) formInline.reset();
  if(textSubmitInline) textSubmitInline.textContent = 'Simpan Data';
  if(btnCancelInline) btnCancelInline.classList.add('hidden');

  // Kembalikan warna tombol ke navy (brand)
  if(btnSubmitInline) {
    btnSubmitInline.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    btnSubmitInline.classList.add('bg-brand-600', 'hover:bg-brand-700');
  }
};

// ===== DELETE BARANG LOGIC =====
window.deleteBarang = async function(dbId, displayId, nama) {
  const formattedUid = String(displayId).padStart(3, '0');
  
  const result = await Swal.fire({
    title: `Hapus #${formattedUid}?`,
    text: `Produk "${nama}" akan dihapus permanen.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal',
    background: '#ffffff',
    customClass: {
      popup: 'rounded-3xl border border-slate-100',
      confirmButton: 'rounded-xl px-6 py-2.5 font-bold',
      cancelButton: 'rounded-xl px-6 py-2.5 font-bold'
    }
  });

  if (result.isConfirmed) {
    // Show loading toast
    Swal.fire({
      title: 'Menghapus...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      const response = await fetch(`${BASE_URL}/delete_barang.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify({ id: dbId, token: API_TOKEN })
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Gagal menghapus. Respons server bukan JSON.');
      }

      const json = await response.json();
      
      if (response.ok && json.status === 'success') {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `Produk dihapus!`,
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true
        });
        fetchBarang(); // Refresh data table
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal!',
          text: json.message || 'Error server',
          customClass: { popup: 'rounded-3xl' }
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Terjadi kesalahan: ' + err.message,
        customClass: { popup: 'rounded-3xl' }
      });
    }
  }
};

// ===== INIT =====
fetchBarang();

// === 4. REAL-TIME AUTO-POLLING LOGIC ===
// Update data secara otomatis setiap 5 detik jika tab sedang aktif
let pollingInterval = setInterval(() => {
    // Only fetch if tab is visible to save battery/data
    if (document.visibilityState === 'visible') {
        const syncStatus = document.querySelector('.animate-pulse');
        if (syncStatus) {
            syncStatus.classList.replace('bg-emerald-500', 'bg-blue-500');
            setTimeout(() => syncStatus.classList.replace('bg-blue-500', 'bg-emerald-500'), 1500);
        }
        
        // Quietly fetch without showing the full-screen loading state
        fetchDataQuietly();
    }
}, 5000);

// Helper untuk fetch tanpa mengganggu UI (tanpa spinner tengah)
// Menghormati halaman & kata kunci yang sedang aktif
async function fetchDataQuietly() {
    // Jangan sync jika user sedang mengedit data
    if (editingId) return;

    try {
        const params = new URLSearchParams({ page: currentPage, limit: 5 });
        if (currentSearch) params.append('cari', currentSearch);
        const url = `${API_URL}?${params.toString()}`;

        const response = await fetch(url);
        if (response.ok) {
            const json = await response.json();
            if (json.status === 'success') {
                allData    = (json.data || []).map((item, idx) => ({
                    ...item,
                    displayId: (currentPage - 1) * 5 + idx + 1
                }));
                totalPages = json.pagination?.total_pages ?? 1;
                totalData  = json.pagination?.total_data  ?? allData.length;

                updateStats(totalData, json.pagination?.total_asset || 0);
                // Hanya render ulang jika user tidak sedang mengetik
                if (!searchInput.value.trim() || searchInput.value.trim() === currentSearch) {
                    renderTable(allData);
                    renderPagination();
                    const now = new Date().toLocaleTimeString('id-ID');
                    footerInfoEl.textContent = `✓ Auto-Synced · Hlm ${currentPage}/${totalPages} · ${now}`;
                }
            }
        }
    } catch (e) {
        console.warn('[Polling] Background sync failed');
    }
}

// Handler untuk visibility change
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        fetchDataQuietly();
    }
});

// === 5. CHART.JS LOGIC ===
let inventoryChartInstance = null;
let chartDataCache = null; // Caching chart data

async function initChart() {
    try {
        const response = await fetch(`${BASE_URL}/statistik.php`);
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) return;
        
        const json = await response.json();
        
        if (json.status === 'success') {
            chartDataCache = json; // Caching the data for re-rendering
            const typeSelect = document.getElementById('chartTypeSelect');
            const initialType = typeSelect ? typeSelect.value : 'doughnut';
            renderChart(initialType, json);
        }
    } catch (e) {
        console.error('Error loading chart:', e);
    }
}

function renderChart(type, json) {
    const ctx = document.getElementById('inventoryChart').getContext('2d');
    
    if (inventoryChartInstance) {
        inventoryChartInstance.destroy(); // Hancurkan instance lama
    }
    
    inventoryChartInstance = new Chart(ctx, {
        type: type, 
        data: {
            labels: json.labels,
            datasets: [{
                label: 'Nilai Dasar (Rp)',
                data: json.values,
                borderColor: type === 'line' ? '#3b82f6' : '#ffffff',
                borderWidth: type === 'line' ? 3 : (type === 'bar' ? 0 : 2),
                hoverOffset: 4,
                tension: 0.4, // Smooth curve for line charts
                fill: type === 'line' ? { target: 'origin', above: 'rgba(59, 130, 246, 0.1)' } : false,
                backgroundColor: type === 'line' ? 'rgba(59, 130, 246, 0.1)' : [
                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
                    '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: (type === 'bar' || type === 'line') ? 'top' : 'right',
                    labels: {
                        font: {
                            family: "'Plus Jakarta Sans', sans-serif",
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// Event Listener untuk Select Option
document.getElementById('chartTypeSelect')?.addEventListener('change', (e) => {
    if (chartDataCache) {
        renderChart(e.target.value, chartDataCache);
    }
});

// Panggil inisialisasi chart saat aplikasi dimuat
initChart();

// ================================================
// ===== PERTEMUAN 14: SMART QR GATEWAY GUDANG =====
// ================================================

// ===== 6. FUNGSI GEOLOKASI (GPS) =====
// Menggunakan HTML5 Geolocation API untuk mendapatkan koordinat pengguna
window.dapatkanLokasi = function() {
    // Cek dukungan browser
    if (!navigator.geolocation) {
        Swal.fire({ icon: 'error', title: 'Tidak Didukung', text: 'Browser ini tidak mendukung Geolocation.' });
        return;
    }

    // Referensi tombol GPS untuk feedback visual
    const btnGps = document.querySelector('button[title="Dapatkan Lokasi GPS"]');
    if (btnGps) btnGps.textContent = '⏳ Melacak...';

    navigator.geolocation.getCurrentPosition(
        // SUCCESS: Koordinat didapatkan
        (pos) => {
            document.getElementById('inline-latitude').value  = pos.coords.latitude;
            document.getElementById('inline-longitude').value = pos.coords.longitude;
            if (btnGps) btnGps.textContent = '✅ Terlacak!';
            // Reset teks tombol setelah 2 detik
            setTimeout(() => { if (btnGps) btnGps.textContent = '+ Lacak GPS Saya'; }, 2000);
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Lokasi GPS didapatkan!', timer: 1500, showConfirmButton: false });
        },
        // ERROR: Gagal mendapatkan koordinat
        (err) => {
            if (btnGps) btnGps.textContent = '+ Lacak GPS Saya';
            Swal.fire({ icon: 'error', title: 'Gagal Melacak', text: 'Izin lokasi ditolak atau GPS tidak tersedia. Pastikan izin lokasi aktif.' });
            console.error('[GPS] Error:', err.message);
        },
        // OPTIONS: Akurasi tinggi, timeout 10 detik
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
};

// ===== 7. QR SCANNER — STATE & VARIABEL GLOBAL =====
let html5QrCode       = null;   // Instance scanner untuk Modal utama
let html5QrCodeInline = null;   // Instance scanner untuk form inline
let isMainScanning    = false;  // Flag: apakah modal scanner sedang aktif
let isInlineScanning  = false;  // Flag: apakah inline scanner sedang aktif
let scannedQrCode     = '';     // Menyimpan hasil scan QR terakhir

// ===== 7a. HELPER: Start kamera dengan auto-fallback =====
// Mencoba kamera belakang ("environment") dulu, jika gagal fallback ke depan ("user")
function startCameraWithFallback(scannerInstance, elementId, config, onSuccess, onError) {
    const tryStart = (facingMode) => {
        scannerInstance.start(
            { facingMode: facingMode },
            config,
            onSuccess,        // Callback saat QR terbaca
            () => {}          // Error per-frame (diabaikan)
        ).then(() => {
            console.log(`[QR] Kamera "${facingMode}" berhasil diaktifkan.`);
        }).catch((err) => {
            if (facingMode === 'environment') {
                console.warn('[QR] Kamera belakang gagal, mencoba kamera depan...');
                tryStart('user'); // Fallback ke kamera depan (webcam laptop)
            } else {
                console.error('[QR] Semua kamera gagal:', err);
                if (onError) onError(err);
            }
        });
    };
    tryStart('environment');
}

// ===== 7b. HELPER: Stop kamera dengan aman =====
function stopCameraSafely(scannerInstance) {
    return new Promise((resolve) => {
        if (!scannerInstance) return resolve();
        scannerInstance.stop()
            .then(() => { scannerInstance.clear(); resolve(); })
            .catch(() => { 
                try { scannerInstance.clear(); } catch(e) {}
                resolve(); 
            });
    });
}

// ===== 8. MODAL QR SCANNER (Tombol "Scan QR" header) =====

// Fungsi shared untuk mengecek QR Code ke Server
window.checkQrInServer = async function(decodedText) {
    tampilQrStatus('loading');
    try {
        const resp = await fetch(`${API_URL}?kode_qr=${encodeURIComponent(decodedText)}`);
        const json = await resp.json();

        if (json.status === 'success' && json.data) {
            // ✅ BARANG DITEMUKAN
            const item = json.data;
            document.getElementById('qr-found-detail').innerHTML = `
                <p><strong>${item.nama_barang}</strong></p>
                <p>${formatRupiah(item.harga)}</p>
                <p class="text-xs text-green-600 mt-2 font-mono">Kode: ${decodedText}</p>
            `;
            tampilQrStatus('found');
        } else {
            // ⚠️ TIDAK DITEMUKAN
            document.getElementById('qr-notfound-code').textContent = `Kode QR: ${decodedText}`;
            tampilQrStatus('notfound');
        }
    } catch (e) {
        document.getElementById('qr-notfound-code').textContent = `Jaringan error · Kode: ${decodedText}`;
        tampilQrStatus('notfound');
    }
};

// Buka modal dan mulai scanning
window.bukaModalQrScan = function(mode) {
    const modal = document.getElementById('qr-modal');
    modal.classList.remove('hidden');
    tampilQrStatus('init'); // Reset semua status card
    initMainQrScanner();    // Nyalakan kamera
};

// Tutup modal dan matikan kamera
window.tutupModalQrScan = function() {
    document.getElementById('qr-modal').classList.add('hidden');
    if (isMainScanning) {
        stopCameraSafely(html5QrCode).then(() => { isMainScanning = false; });
    }
};

// Inisialisasi kamera scanner di dalam modal
window.initMainQrScanner = function() {
    const readerEl = document.getElementById('qr-reader');
    if (!readerEl) return;
    if (isMainScanning) return; // Sudah aktif, skip

    // Buat instance baru jika belum ada
    if (!html5QrCode) html5QrCode = new Html5Qrcode('qr-reader');

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    startCameraWithFallback(html5QrCode, 'qr-reader', config,
        // === ON QR CODE DETECTED ===
        async (decodedText) => {
            if (!isMainScanning) return; // Guard duplikat
            isMainScanning = false;

            // Stop kamera segera setelah QR terbaca
            await stopCameraSafely(html5QrCode);

            scannedQrCode = decodedText;
            checkQrInServer(decodedText);
        },
        // === ON CAMERA ERROR (semua kamera gagal) ===
        (err) => {
            isMainScanning = false;
            Swal.fire({ icon: 'error', title: 'Kamera Gagal', text: 'Tidak dapat mengakses kamera. Pastikan izin kamera aktif.' });
        }
    );
    isMainScanning = true;
};

// ===== 8a. TOGGLE 3 STATUS CARD DI MODAL =====
// Status: 'init' (semua hidden), 'loading', 'found', 'notfound'
window.tampilQrStatus = function(status) {
    const els = {
        loading:  document.getElementById('qr-status-loading'),
        found:    document.getElementById('qr-status-found'),
        notfound: document.getElementById('qr-status-notfound')
    };
    // Sembunyikan semua dulu
    Object.values(els).forEach(el => el.classList.add('hidden'));
    // Tampilkan yang diminta
    if (els[status]) els[status].classList.remove('hidden');
};

// ===== 8b. BRIDGE: QR "Tidak Ditemukan" → Buka Form Tambah =====
window.lanjutTambahDariQR = function() {
    tutupModalQrScan(); // Tutup modal scanner

    // Buka form inline
    const wrapper = document.getElementById('form-inline-wrapper');
    if (wrapper) wrapper.style.display = 'block';
    cancelEdit(); // Reset form ke mode "Tambah"

    // Auto-fill kode QR dari hasil scan
    const inputQr = document.getElementById('inline-kode_qr');
    if (inputQr) inputQr.value = scannedQrCode;

    // Auto-dapatkan lokasi GPS
    setTimeout(() => dapatkanLokasi(), 500);

    // Scroll ke form
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ===== 9. INLINE QR SCANNER (Di dalam Card Form) =====
// Scanner yang tertanam langsung di form Tambah/Edit, bukan di modal

window.toggleInlineQrScanner = function() {
    const readerDiv = document.getElementById('qr-reader-inline');
    const btnEl     = document.getElementById('btn-toggle-camera-inline');
    const btnText   = btnEl ? (btnEl.querySelector('span') || btnEl) : null;

    if (!readerDiv) return;

    // === JIKA SEDANG AKTIF: Matikan ===
    if (isInlineScanning) {
        if (btnText) btnText.textContent = 'Menutup...';
        stopCameraSafely(html5QrCodeInline).then(() => {
            readerDiv.classList.add('hidden');
            if (btnText) btnText.textContent = 'Buka Kamera';
            isInlineScanning = false;
        });
        return;
    }

    // === JIKA TIDAK AKTIF: Nyalakan ===
    readerDiv.classList.remove('hidden');
    if (btnText) btnText.textContent = 'Memulai...';

    // Buat instance baru jika belum ada
    if (!html5QrCodeInline) html5QrCodeInline = new Html5Qrcode('qr-reader-inline');

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    startCameraWithFallback(html5QrCodeInline, 'qr-reader-inline', config,
        // === ON QR CODE DETECTED ===
        (decodedText) => {
            if (!isInlineScanning) return;
            isInlineScanning = false;

            // Stop kamera
            stopCameraSafely(html5QrCodeInline).then(() => {
                readerDiv.classList.add('hidden');
                if (btnText) btnText.textContent = 'Buka Kamera';
            });

            // Isi input kode QR di form
            const inputQr = document.getElementById('inline-kode_qr');
            if (inputQr) inputQr.value = decodedText;
        },
        // === ON CAMERA ERROR ===
        (err) => {
            readerDiv.classList.add('hidden');
            if (btnText) btnText.textContent = 'Buka Kamera';
            isInlineScanning = false;
            Swal.fire({ icon: 'error', title: 'Kamera Gagal', text: 'Kamera diblokir atau tidak tersedia.' });
        }
    );
    isInlineScanning = true;
    if (btnText) btnText.textContent = 'X Tutup Kamera';
};

// ===== 10. UPLOAD / DRAG & DROP GAMBAR QR =====

window.processQrImage = async function(file, mode) {
    if (!file) return;

    // Siapkan UI
    const readerId = mode === 'main' ? 'qr-reader' : 'qr-reader-inline';
    let localScanner = mode === 'main' ? html5QrCode : html5QrCodeInline;
    
    if (!localScanner) {
        localScanner = new Html5Qrcode(readerId);
        if (mode === 'main') html5QrCode = localScanner;
        else html5QrCodeInline = localScanner;
    }
    
    // Hentikan kamera jika sedang aktif berjalan
    if (mode === 'main' && isMainScanning) {
        await stopCameraSafely(html5QrCode);
        isMainScanning = false;
    } else if (mode === 'inline' && isInlineScanning) {
        await stopCameraSafely(html5QrCodeInline);
        isInlineScanning = false;
        const btnText = document.querySelector('#btn-toggle-camera-inline span') || document.getElementById('btn-toggle-camera-inline');
        if (btnText) btnText.textContent = 'Buka Kamera';
        document.getElementById('qr-reader-inline').classList.add('hidden');
    }

    // Ekstrak QR Code dari file gambar secara statis
    try {
        if (mode === 'main') tampilQrStatus('loading');
        
        const decodedText = await localScanner.scanFile(file, true);
        
        // Hasil dari pembacaan gambar
        if (mode === 'main') {
            scannedQrCode = decodedText;
            checkQrInServer(decodedText);
        } else {
            const inputInline = document.getElementById('inline-kode_qr');
            if(inputInline) inputInline.value = decodedText;
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Berhasil scan dari gambar!', timer: 2000, showConfirmButton: false });
        }
    } catch (err) {
        console.warn("[QR Image] failed to read: ", err);
        if (mode === 'main') {
            document.getElementById('qr-notfound-code').textContent = `QR tidak terdeteksi di gambar ini.`;
            tampilQrStatus('notfound');
        } else {
            Swal.fire({ icon: 'error', title: 'Gagal', text: 'Tidak ada kode QR yang jelas terdeteksi di gambar.' });
        }
    }
    
    // Reset file input value
    const inputEl = mode === 'main' ? document.getElementById('qr-file-input') : document.getElementById('qr-file-input-inline');
    if (inputEl) inputEl.value = '';
};

// Drag and drop event listeners untuk form Modal
document.addEventListener('DOMContentLoaded', () => {
    const dropzone = document.getElementById('qr-dropzone');
    if(!dropzone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => dropzone.classList.add('border-blue-500', 'bg-blue-50'));
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => dropzone.classList.remove('border-blue-500', 'bg-blue-50'));
    });

    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if(files && files.length > 0) processQrImage(files[0], 'main');
    });
});
