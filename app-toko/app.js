const API_URL = '../api-toko/get_barang.php';

// ===== ELEMEN DOM =====
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
      <td class="px-6 py-4 whitespace-nowrap text-center">
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
  const avg = hargaList.reduce((a,b) => a+b, 0) / (hargaList.length || 1);

  statTotal.textContent = data.length;
  statAvg.textContent   = formatRupiah(avg);
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
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

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
  if (!q) { renderTable(allData); return; }
  const filtered = allData.filter(item => {
    const nama = (item.nama_barang || item.nama || item.name || '').toLowerCase();
    const kat  = (item.kategori || item.category || '').toLowerCase();
    return nama.includes(q) || kat.includes(q);
  });
  renderTable(filtered);
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
    } else {
      formInlineWrapper.style.display = 'none';
    }
  });
}

// ===== INLINE FORM BARANG LOGIC =====
const INLINE_API_URL = '../api-toko/tambah_barang.php';
const formInline = document.getElementById('form-tambah-inline');
const submitInlineSpinner = document.getElementById('submit-spinner-inline');

if(formInline) {
  formInline.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(submitInlineSpinner) submitInlineSpinner.classList.remove('hidden');
    
    const formData = new FormData(formInline);
    const dataObj = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(INLINE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataObj)
      });
      const json = await response.json();
      
      if(response.ok && json.status === 'success') {
        alert('Sukses menambah data baru!');
        formInline.reset();
        fetchBarang(); // Refresh data tanpa blinking
      } else {
        alert('Gagal: ' + (json.message || 'Error server'));
      }
    } catch (err) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      if(submitInlineSpinner) submitInlineSpinner.classList.add('hidden');
    }
  });
}

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
      const response = await fetch('../api-toko/delete_barang.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dbId })
      });
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

// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[SW] Registered:', reg.scope))
      .catch(err => console.error('[SW] Registration failed:', err));
  });
}
