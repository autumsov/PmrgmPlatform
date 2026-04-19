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
    tr.className = 'data-row border-t border-white/5 transition-colors duration-150 row-animate animate-fade-in-up';
    tr.style.animationDelay = `${index * 60}ms`;

    const nama  = item.nama_barang  || item.nama  || item.name  || '—';
    const harga = item.harga        || item.price || 0;
    const id    = item.id_barang    || item.id    || (index + 1);

    tr.innerHTML = `
      <td class="px-6 py-4 text-slate-500 font-mono text-xs">${String(id).padStart(3,'0')}</td>
      <td class="px-6 py-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500/30 to-brand-700/30 flex items-center justify-center flex-shrink-0 text-brand-300 font-bold text-xs">
            ${nama.charAt(0).toUpperCase()}
          </div>
          <span class="font-medium text-slate-100">${nama}</span>
        </div>
      </td>
      <td class="px-6 py-4 text-right font-semibold text-emerald-300">${formatRupiah(harga)}</td>
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

    allData = json.data || [];
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

// ===== INIT =====
fetchBarang();
