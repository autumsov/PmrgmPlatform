// === 1. KONFIGURASI API & DETEKSI OTOMATIS ===
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BASE_URL = isLocal 
    ? '../api-toko' 
    : 'https://tokobarang.free.nf/api-toko'; 

const API_URL = `${BASE_URL}/get_barang.php`;

// === 2. PWA INSTALLATION LOGIC (RUNS FIRST) ===
console.log('[PWA] UI Version 8.0.0 Loaded');

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
          // Chromium: trigger native install
          triggerNativeInstall();
        } else if (isIOS) {
          // iOS: tampilkan panduan Safari
          showIOSGuide();
        } else {
          // Desktop/browser lain: panduan manual
          showDesktopGuide();
        }
      }
    });
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

// Stats
const statTotal = document.getElementById('stat-total');
const statAvg   = document.getElementById('stat-avg');

// ===== STATE =====
let allData = [];
let editingId = null; // Menyimpan ID data yang sedang diedit

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
    tr.className = 'hover:bg-gray-50/80 transition-colors cursor-default row-fade-in group';
    tr.style.animationDelay = `${index * 40}ms`;

    const nama       = item.nama_barang  || item.nama  || item.name  || '—';
    const harga      = item.harga        || item.price || 0;
    const realId     = item.id           || item.id_barang || (index + 1);
    const displayId  = item.displayId    || (index + 1);

    tr.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-400 font-mono">#${String(displayId).padStart(3,'0')}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs border border-gray-200 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
            ${nama.charAt(0).toUpperCase()}
          </div>
          <div>
            <span class="block text-sm font-bold text-gray-800 tracking-tight">${nama}</span>
            <span class="block text-[10px] text-gray-400 uppercase tracking-widest font-bold">Standard SKU</span>
          </div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right font-black text-gray-900 text-sm">
        ${formatRupiah(harga)}
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
}

// ===== UPDATE STATS =====
function updateStats(data) {
  if (data.length === 0) {
    statTotal.textContent = '0';
    statAvg.textContent   = '-';
    return;
  }

  const hargaList  = data.map(d => parseFloat(d.harga || d.price || 0)).filter(h => !isNaN(h));
  const totalValue = hargaList.reduce((a,b) => a+b, 0);
  
  statTotal.textContent = data.length;
  statAvg.textContent   = formatRupiah(totalValue);
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

// ===== FETCH DATA =====
async function fetchBarang() {
  showState('loading');
  footerInfoEl.textContent = '';
  btnRefresh.disabled = true;
  btnRefresh.classList.add('opacity-60');

  try {
    const response = await fetch(API_URL);
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server tidak mengirim data JSON. Silakan refresh halaman (F5) untuk melewati sistem keamanan hosting.');
    }

    const json = await response.json();

    if (json.status !== 'success') throw new Error(json.message || 'Response tidak valid');

    allData = (json.data || []).map((item, idx) => ({
      ...item,
      displayId: idx + 1
    }));
    updateStats(allData);
    renderTable(allData);

    const now = new Date().toLocaleTimeString('id-ID');
    footerInfoEl.textContent = `✓ ${allData.length} data berhasil dimuat · Terakhir diperbarui: ${now}`;

  } catch (err) {
    showState('error');
    errorMsgEl.textContent = err.message;
    console.error('[app.js] Fetch error:', err);
  } finally {
    btnRefresh.disabled = false;
    btnRefresh.classList.remove('opacity-60');
  }
}

// ===== SEARCH =====
searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase().trim();
  if (!q) { 
    renderTable(allData); 
    updateStats(allData);
    return; 
  }
  const filtered = allData.filter(item => {
    const nama = (item.nama_barang || item.nama || item.name || '').toLowerCase();
    const kat  = (item.kategori || item.category || '').toLowerCase();
    return nama.includes(q) || kat.includes(q);
  });
  renderTable(filtered);
  updateStats(filtered);
});

// ===== REFRESH BUTTON =====
btnRefresh.addEventListener('click', () => {
  searchInput.value = '';
  fetchBarang();
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
    const dataObj = Object.fromEntries(formData.entries());

    let apiUrl = INLINE_API_URL;
    if (editingId) {
      apiUrl = UPDATE_API_URL;
      dataObj.id = editingId;
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataObj)
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Gagal memproses JSON. Hosting sedang memblokir akses sementara, silakan refresh halaman.');
      }

      const json = await response.json();
      
      if(response.ok && json.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: editingId ? 'Data berhasil diupdate!' : 'Sukses menambah data baru!',
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: 'rounded-3xl' }
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dbId })
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Gagal menghapus. Respons server bukan JSON.');
      }

      const json = await response.json();
      
      if (response.ok && json.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: `Produk #${formattedUid} telah dihapus.`,
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: 'rounded-3xl' }
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

// (PWA Logic moved to top)
