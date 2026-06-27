// --- OFFLINE PWA SERVICE WORKER INJECTION ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => console.warn('PWA SW Registration Failed', err));
    });
}

// =============================================================================
// MULTI-USER CONFIGURATION
// Tambah atau ubah akun guru di sini. classId HARUS unik per guru.
// =============================================================================
const USERS = {
    'guru.kelasA': {
        password:  'passwordA123',
        classId:   'kelasA',
        className: 'Kelas A',
        guruName:  'Ibu Mei Ling'
    },
    'guru.kelasB': {
        password:  'passwordB123',
        classId:   'kelasB',
        className: 'Kelas B',
        guruName:  'Ibu Sri Wahyuni'
    }
};

// =============================================================================
// DATA SISWA DEFAULT — Terpisah per kelas
// =============================================================================
const DEFAULT_STUDENTS_A = [
    { id: 'S1A',  name: 'Felix Wijaya' },    { id: 'S2A',  name: 'Clara Amanda' },
    { id: 'S3A',  name: 'Tzu Ting' },        { id: 'S4A',  name: 'Kevin Sanjaya' },
    { id: 'S5A',  name: 'Vania Tjahyadi' },  { id: 'S6A',  name: 'Jason Susanto' },
    { id: 'S7A',  name: 'Jessica Lin' },     { id: 'S8A',  name: 'Aldi Gunawan' },
    { id: 'S9A',  name: 'Evelyn Chow' },     { id: 'S10A', name: 'Bobby Lim' },
    { id: 'S11A', name: 'Cynthia Ang' },     { id: 'S12A', name: 'Ryan Pratama' },
    { id: 'S13A', name: 'Michelle Tan' },    { id: 'S14A', name: 'Steven Lie' },
    { id: 'S15A', name: 'Gabriella Wong' }
];

const DEFAULT_STUDENTS_B = [
    { id: 'S1B',  name: 'Budi Santoso' },    { id: 'S2B',  name: 'Dewi Rahayu' },
    { id: 'S3B',  name: 'Eko Prasetyo' },    { id: 'S4B',  name: 'Fitria Sari' },
    { id: 'S5B',  name: 'Galih Wicaksono' }, { id: 'S6B',  name: 'Hana Putri' },
    { id: 'S7B',  name: 'Irfan Maulana' },   { id: 'S8B',  name: 'Julia Purnama' },
    { id: 'S9B',  name: 'Khairul Anwar' },   { id: 'S10B', name: 'Layla Nur' },
    { id: 'S11B', name: 'Mario Sirait' },    { id: 'S12B', name: 'Nadia Kusuma' },
    { id: 'S13B', name: 'Oscar Hidayat' },   { id: 'S14B', name: 'Putri Amalia' },
    { id: 'S15B', name: 'Qori Ramadhan' }
];

const DEFAULT_STUDENTS_MAP = { 'kelasA': DEFAULT_STUDENTS_A, 'kelasB': DEFAULT_STUDENTS_B };

function mapStudentsWithMeta(list) {
    return list.map(s => ({
        ...s,
        photo: `https://api.dicebear.com/7.x/initials/svg?seed=${s.name}&backgroundColor=008F5A&textColor=ffffff`,
        dateAdded: new Date().toISOString().split('T')[0]
    }));
}

// =============================================================================
// SEMESTER MANAGEMENT
// Semester Ganjil TA X/X+1 : 15 Jul  – 31 Des  (tahun X)
// Semester Genap  TA X/X+1 :  1 Jan  – 14 Jul  (tahun X+1)
// =============================================================================

/** Hasilkan daftar semester ±2 tahun dari sekarang, diurutkan terbaru duluan */
function generateSemesters() {
    const semesters = [];
    const cy = new Date().getFullYear(); // current year

    for (let y = cy - 2; y <= cy + 1; y++) {
        // Semester Genap TA (y-1)/y  →  1 Jan y – 14 Jul y
        semesters.push({
            id:         `genap_${y-1}_${y}`,
            label:      `Semester Genap ${y-1}/${y}`,
            shortLabel: `Genap ${y-1}/${y}`,
            taYear:     `${y-1}/${y}`,
            jenis:      'genap',
            startDate:  `${y}-01-01`,
            endDate:    `${y}-07-14`
        });
        // Semester Ganjil TA y/(y+1)  →  15 Jul y – 31 Des y
        semesters.push({
            id:         `ganjil_${y}_${y+1}`,
            label:      `Semester Ganjil ${y}/${y+1}`,
            shortLabel: `Ganjil ${y}/${y+1}`,
            taYear:     `${y}/${y+1}`,
            jenis:      'ganjil',
            startDate:  `${y}-07-15`,
            endDate:    `${y}-12-31`
        });
    }
    return semesters.sort((a, b) => b.startDate.localeCompare(a.startDate));
}

/** Deteksi ID semester berdasarkan tanggal hari ini */
function detectCurrentSemesterId() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year  = today.getFullYear();
    return month >= 7
        ? `ganjil_${year}_${year + 1}`
        : `genap_${year - 1}_${year}`;
}

/** Ambil objek semester aktif untuk guru yang sedang login */
function getActiveSemester() {
    const classId    = getCurrentClassId();
    const semesters  = generateSemesters();
    const storedId   = localStorage.getItem(`paud_semester_${classId}`) || detectCurrentSemesterId();
    return semesters.find(s => s.id === storedId) || semesters[0];
}

/** Simpan pilihan semester ke localStorage */
function setActiveSemester(semId) {
    const classId = getCurrentClassId();
    localStorage.setItem(`paud_semester_${classId}`, semId);
}

/** Inisialisasi: jika belum ada pilihan semester, auto-detect. Lalu render dropdown. */
function initActiveSemester() {
    const classId = getCurrentClassId();
    if (!localStorage.getItem(`paud_semester_${classId}`)) {
        setActiveSemester(detectCurrentSemesterId());
    }
    renderSemesterSelector();
    updateSemesterChip();
}

/** Populate `<select id="semesterSelect">` dengan daftar semester */
function renderSemesterSelector() {
    const sel = document.getElementById('semesterSelect');
    if (!sel) return;
    const semesters = generateSemesters();
    const active    = getActiveSemester();
    sel.innerHTML   = '';
    semesters.forEach(s => {
        const opt      = document.createElement('option');
        opt.value      = s.id;
        opt.textContent = s.label;
        if (s.id === active.id) opt.selected = true;
        sel.appendChild(opt);
    });
}

/** Perbarui chip semester kecil di section Absensi */
function updateSemesterChip() {
    const sem  = getActiveSemester();
    const chip = document.getElementById('semesterChip');
    if (chip && sem) chip.textContent = `📚 ${sem.shortLabel}`;

    // Label periode di header rekap
    const periodeEl = document.getElementById('rekapPeriodeLabel');
    if (periodeEl && sem) {
        const fmt = d => new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        periodeEl.textContent = `Periode: ${fmt(sem.startDate)} — ${fmt(sem.endDate)}`;
    }
}

/** Dipanggil saat user mengubah dropdown semester */
function onSemesterChange(semId) {
    setActiveSemester(semId);
    updateSemesterChip();
    renderRekap();
    renderAbsensi(); // refresh status absensi hari ini (chip saja yang berubah)
}

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================
function getCurrentUser() {
    const username = localStorage.getItem('paud_current_user');
    if (!username || !USERS[username]) return null;
    return { username, ...USERS[username] };
}

function getCurrentClassId() {
    const user = getCurrentUser();
    return user ? user.classId : null;
}

// =============================================================================
// AUTHENTICATION LOGIC
// =============================================================================
const loginScreen = document.getElementById('loginScreen');
const mainApp     = document.getElementById('mainApp');

function checkAuth() {
    const user = getCurrentUser();
    if (user) {
        loginScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        initApp(user);
    }
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value.trim();

    const matchedUser = USERS[u];
    if (matchedUser && p === matchedUser.password) {
        localStorage.setItem('paud_current_user', u);
        loginScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        showToast(`Selamat datang, ${matchedUser.guruName}!`, 'success');
        initApp({ username: u, ...matchedUser });
    } else {
        showToast('Username atau password salah!', 'error');
    }
});

function logout() {
    localStorage.removeItem('paud_current_user');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    mainApp.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    loginScreen.classList.add('flex');
    const el = document.getElementById('guruInfoDisplay');
    if (el) el.textContent = '';
    showToast('Anda telah logout.', 'success');
}

function togglePassword() {
    const el   = document.getElementById('password');
    const icon = document.getElementById('eyeIcon');
    if (el.type === 'password') {
        el.type = 'text'; icon.className = 'fa-solid fa-eye-slash';
    } else {
        el.type = 'password'; icon.className = 'fa-solid fa-eye';
    }
}

// =============================================================================
// DATA SEEDING — Per kelas berdasarkan classId
// =============================================================================
function checkAndSeedData() {
    const classId  = getCurrentClassId();
    const defaults = DEFAULT_STUDENTS_MAP[classId];
    if (!defaults) return;

    const storedStudents = localStorage.getItem(`paud_students_${classId}`);
    if (!storedStudents) {
        const mapped = mapStudentsWithMeta(defaults);
        localStorage.setItem(`paud_students_${classId}`, JSON.stringify(mapped));

        // Generate 14 hari histori absensi (data jatuh di semester Genap 2025/2026)
        const today = new Date();
        let count   = 0;
        for (let i = 1; i <= 30 && count < 14; i++) {
            let d = new Date(today);
            d.setDate(d.getDate() - i);
            if (d.getDay() === 0) continue;

            const dStr     = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            const dailyMock = {};
            mapped.forEach(s => {
                const rnd = Math.random() * 100;
                let st = 'Hadir';
                if (rnd > 85 && rnd <= 90) st = 'Sakit';
                else if (rnd > 90 && rnd <= 95) st = 'Izin';
                else if (rnd > 95) st = 'Alpa';
                dailyMock[s.id] = { status: st, p: '' };
            });
            localStorage.setItem(`paud_att_${classId}_${dStr}`, JSON.stringify(dailyMock));
            count++;
        }
    }
}

// =============================================================================
// CORE APP DATA HELPERS — Semua scope ke classId & semester aktif
// =============================================================================
function getStudents() {
    const classId = getCurrentClassId();
    return JSON.parse(localStorage.getItem(`paud_students_${classId}`)) || [];
}

function saveStudents(d) {
    const classId = getCurrentClassId();
    localStorage.setItem(`paud_students_${classId}`, JSON.stringify(d));
}

function getTodayDateStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getAtt(dStr) {
    const classId = getCurrentClassId();
    return JSON.parse(localStorage.getItem(`paud_att_${classId}_${dStr}`)) || {};
}

/** Ambil semua absensi yang MASUK dalam rentang semester aktif */
function getAllAtt() {
    const classId = getCurrentClassId();
    const prefix  = `paud_att_${classId}_`;
    const sem     = getActiveSemester();

    const k = Object.keys(localStorage).filter(x => {
        if (!x.startsWith(prefix)) return false;
        const dateStr = x.replace(prefix, '');
        return dateStr >= sem.startDate && dateStr <= sem.endDate;
    });

    const h = {};
    k.forEach(x => h[x.replace(prefix, '')] = JSON.parse(localStorage.getItem(x)));
    return h;
}

// =============================================================================
// INIT APP
// =============================================================================
function initApp(user) {
    checkAndSeedData();
    initActiveSemester(); // ← semester init

    // Badge info guru di navbar
    const infoEl = document.getElementById('guruInfoDisplay');
    if (infoEl) {
        infoEl.innerHTML = `
            <i class="fa-solid fa-chalkboard-user text-tzu"></i>
            <span class="font-bold text-slate-800">${user.guruName}</span>
            <span class="text-slate-400">—</span>
            <span class="font-semibold text-tzu">${user.className}</span>`;
    }

    document.getElementById('currentDateDisplay').innerText =
        new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const tabs     = document.querySelectorAll('.tab-btn');
    const sections = {
        absensi:   document.getElementById('sect-absensi'),
        manajemen: document.getElementById('sect-manajemen'),
        rekap:     document.getElementById('sect-rekap')
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => { t.classList.remove('bg-white','shadow-sm','text-tzu'); t.classList.add('text-slate-500'); });
            tab.classList.remove('text-slate-500');
            tab.classList.add('bg-white','shadow-sm','text-tzu');

            Object.values(sections).forEach(s => s.style.display = 'none');
            const target = tab.dataset.tab;
            sections[target].style.display = 'block';

            if (target === 'absensi')   renderAbsensi();
            if (target === 'manajemen') renderManajemen();
            if (target === 'rekap')     { renderSemesterSelector(); renderRekap(); }
        });
    });

    renderAbsensi();
    renderManajemen();
    renderRekap();
}

// =============================================================================
// RENDER ROUTINES
// =============================================================================
function renderAbsensi() {
    const students = getStudents();
    const att      = getAtt(getTodayDateStr());
    const grid     = document.getElementById('attendanceGrid');
    grid.innerHTML = '';

    students.forEach(s => {
        const rec  = att[s.id] || { status: 'Hadir', p: '' };
        const card = `
            <div class="glass-card p-5 relative overflow-hidden group">
                <div class="flex items-center gap-4 mb-5 relative z-10">
                    <div class="w-14 h-14 rounded-full border-2 border-white/80 shadow-sm overflow-hidden shrink-0"><img src="${s.photo}" class="w-full h-full object-cover"></div>
                    <div class="min-w-0">
                        <h4 class="font-bold text-[16px] truncate text-slate-800 leading-tight mb-1">${s.name}</h4>
                        <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ID: ${s.id}</p>
                    </div>
                </div>
                <div class="flex rounded-xl overflow-hidden shadow-inner bg-slate-100/60 mb-4 border border-white/60 relative z-10 w-full p-1">
                    <input type="radio" name="status_${s.id}" id="h_${s.id}" value="Hadir" class="radio-status hidden" ${rec.status==='Hadir'?'checked':''}>
                    <label for="h_${s.id}" class="status-hadir flex-1 py-2.5 text-center text-xs font-bold text-slate-500 cursor-pointer hover:bg-white rounded-lg transition">Hadir</label>
                    <input type="radio" name="status_${s.id}" id="s_${s.id}" value="Sakit" class="radio-status hidden" ${rec.status==='Sakit'?'checked':''}>
                    <label for="s_${s.id}" class="status-sakit flex-1 py-2.5 text-center text-xs font-bold text-slate-500 cursor-pointer hover:bg-white rounded-lg transition">Sakit</label>
                    <input type="radio" name="status_${s.id}" id="i_${s.id}" value="Izin" class="radio-status hidden" ${rec.status==='Izin'?'checked':''}>
                    <label for="i_${s.id}" class="status-izin flex-1 py-2.5 text-center text-xs font-bold text-slate-500 cursor-pointer hover:bg-white rounded-lg transition">Izin</label>
                    <input type="radio" name="status_${s.id}" id="a_${s.id}" value="Alpa" class="radio-status hidden" ${rec.status==='Alpa'?'checked':''}>
                    <label for="a_${s.id}" class="status-alpa flex-1 py-2.5 text-center text-xs font-bold text-slate-500 cursor-pointer hover:bg-white rounded-lg transition">Alpa</label>
                </div>
                <div class="relative z-10 mt-auto">
                    <i class="fa-solid fa-car-side absolute left-3.5 top-3 text-slate-400 text-xs"></i>
                    <select id="p_${s.id}" class="w-full pl-9 pr-3 py-2.5 bg-white/70 border border-white rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-tzu shadow-sm appearance-none cursor-pointer">
                        <option value=""       ${rec.p===''?'selected':''}>Penjemput Pribadi (Default)</option>
                        <option value="Ibu"    ${rec.p==='Ibu'?'selected':''}>Ibu</option>
                        <option value="Ayah"   ${rec.p==='Ayah'?'selected':''}>Ayah</option>
                        <option value="Suster" ${rec.p==='Suster'?'selected':''}>Suster</option>
                        <option value="Lainnya"${rec.p==='Lainnya'?'selected':''}>Lainnya</option>
                    </select>
                </div>
            </div>`;
        grid.insertAdjacentHTML('beforeend', card);
    });
}

function saveAttendance() {
    const classId  = getCurrentClassId();
    const students = getStudents();
    const res      = {};
    students.forEach(s => {
        const r = document.querySelector(`input[name="status_${s.id}"]:checked`);
        res[s.id] = { status: r ? r.value : 'Hadir', p: document.getElementById(`p_${s.id}`).value };
    });
    localStorage.setItem(`paud_att_${classId}_${getTodayDateStr()}`, JSON.stringify(res));
    showToast('✅ Absensi hari ini sukses disimpan.', 'success');
    renderRekap();
}

function renderManajemen() {
    const user = getCurrentUser();
    const tb   = document.getElementById('studentTableBody');
    tb.innerHTML = '';
    const students = getStudents();

    const subtitle = document.getElementById('manajemenSubtitle');
    if (subtitle && user) subtitle.textContent = `Kelola daftar siswa aktif di ${user.className}.`;

    if (students.length === 0) {
        tb.innerHTML = `<tr><td colspan="3" class="p-8 text-center text-slate-500">Data kosong.</td></tr>`;
        return;
    }
    students.forEach(s => {
        const dtObj = new Date(s.dateAdded);
        const dt    = isNaN(dtObj) ? '-' : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(dtObj);
        tb.innerHTML += `
            <tr class="hover:bg-white/40 transition">
                <td class="p-5 pl-7 flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full overflow-hidden border border-white shadow-sm shrink-0"><img src="${s.photo}" class="w-full h-full object-cover"></div>
                    <div><span class="font-bold text-slate-800">${s.name}</span><p class="text-[10px] uppercase font-bold text-slate-400 mt-0.5">${s.id}</p></div>
                </td>
                <td class="p-5 text-slate-500 font-semibold text-sm">${dt}</td>
                <td class="p-5 text-right pr-7">
                    <button onclick="openModal('edit','${s.id}')" class="w-9 h-9 rounded-xl bg-indigo-50/80 border border-indigo-100 text-indigo-500 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 mr-1 shadow-sm transition inline-flex items-center justify-center"><i class="fa-solid fa-pen text-xs"></i></button>
                    <button onclick="deleteStudent('${s.id}')" class="w-9 h-9 rounded-xl bg-rose-50/80 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 shadow-sm transition inline-flex items-center justify-center"><i class="fa-solid fa-trash text-xs"></i></button>
                </td>
            </tr>`;
    });
}

function renderRekap() {
    const students = getStudents();
    const h        = getAllAtt(); // ← sudah difilter berdasarkan semester aktif
    const keys     = Object.keys(h);
    const tb       = document.getElementById('rekapTableBody');

    // Perbarui chip & label periode
    updateSemesterChip();

    let th = 0, ts = 0, ta = 0, expected = 0;
    const agg = {};
    students.forEach(s => agg[s.id] = { nm: s.name, ph: s.photo, h: 0, s: 0, i: 0, a: 0, t: 0 });

    keys.forEach(k => {
        for (let sid in h[k]) {
            if (agg[sid]) {
                agg[sid].t++; expected++;
                const st = h[k][sid].status;
                if (st === 'Hadir') { agg[sid].h++; th++; }
                if (st === 'Sakit') { agg[sid].s++; ts++; }
                if (st === 'Izin')  { agg[sid].i++; ts++; }
                if (st === 'Alpa')  { agg[sid].a++; ta++; }
            }
        }
    });

    document.getElementById('rekapTotalDays').innerText    = keys.length;
    document.getElementById('rekapAvgRate').innerText      = expected > 0 ? Math.round((th / expected) * 100) + '%' : '0%';
    document.getElementById('rekapTotalExcused').innerText = ts;
    document.getElementById('rekapTotalAlpa').innerText    = ta;

    tb.innerHTML = '';
    if (keys.length === 0) {
        tb.innerHTML = `<tr><td colspan="6" class="p-10 text-center text-slate-400 font-semibold">Belum ada data absensi untuk semester ini.</td></tr>`;
        return;
    }
    Object.values(agg).forEach(s => {
        const rt = s.t > 0 ? Math.round((s.h / s.t) * 100) : 0;
        let c = 'bg-emerald-500', tc = 'text-emerald-600';
        if (rt < 75) { c = 'bg-rose-500'; tc = 'text-rose-600'; }
        else if (rt < 90) { c = 'bg-amber-400'; tc = 'text-amber-500'; }

        tb.innerHTML += `
            <tr class="hover:bg-white/40 transition">
                <td class="p-5 pl-7 flex items-center gap-3">
                    <img src="${s.ph}" class="w-10 h-10 rounded-full border border-white shadow-sm shrink-0">
                    <span class="font-bold text-slate-800">${s.nm}</span>
                </td>
                <td class="p-5 text-center font-bold text-slate-600">${s.h}</td>
                <td class="p-5 text-center font-bold text-slate-600">${s.s}</td>
                <td class="p-5 text-center font-bold text-slate-600">${s.i}</td>
                <td class="p-5 text-center font-bold ${s.a > 0 ? 'text-rose-500' : 'text-slate-600'}">${s.a}</td>
                <td class="p-5 pr-7">
                    <div class="flex items-center gap-4">
                        <span class="w-12 font-black ${tc} text-right text-base">${rt}%</span>
                        <div class="flex-grow h-2.5 bg-slate-200/50 rounded-full overflow-hidden shadow-inner border border-white/50">
                            <div class="h-full ${c} rounded-full" style="width:${rt}%"></div>
                        </div>
                    </div>
                </td>
            </tr>`;
    });
}

// =============================================================================
// EXPORT CSV — Nama file menyertakan semester aktif
// =============================================================================
function exportCSV() {
    const user     = getCurrentUser();
    const sem      = getActiveSemester();
    const keys     = Object.keys(getAllAtt());
    if (keys.length === 0) return showToast('Tidak ada data history untuk diexport pada semester ini.', 'error');

    const students = getStudents(), h = getAllAtt(), agg = {};
    students.forEach(s => agg[s.id] = { nm: s.name, h: 0, s: 0, i: 0, a: 0, t: 0 });
    keys.forEach(k => {
        for (let sid in h[k]) {
            if (agg[sid]) {
                agg[sid].t++;
                const st = h[k][sid].status;
                if (st === 'Hadir') agg[sid].h++;
                else if (st === 'Sakit') agg[sid].s++;
                else if (st === 'Izin')  agg[sid].i++;
                else agg[sid].a++;
            }
        }
    });

    // Header mencantumkan info semester
    const semLabel = sem ? sem.label : 'Semua';
    let csv = `\uFEFFSemester;${semLabel}\r\n`;
    csv    += `Periode;${sem ? sem.startDate : ''} s.d. ${sem ? sem.endDate : ''}\r\n`;
    csv    += `\r\nID Siswa;Nama Lengkap;Hadir;Sakit;Izin;Alpa;Persentase Kehadiran\r\n`;
    students.forEach(s => {
        const a = agg[s.id], r = a.t > 0 ? Math.round((a.h / a.t) * 100) : 0;
        csv += `"${s.id}";"${a.nm}";${a.h};${a.s};${a.i};${a.a};"${r}%"\r\n`;
    });

    const className = user ? user.className.replace(/\s+/g, '') : 'Kelas';
    const semSlug   = sem  ? sem.id : 'semua';
    const url  = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href     = url;
    link.download = `Rekap_TzuChi_${className}_${semSlug}_${getTodayDateStr()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('📥 Report CSV berhasil didownload.', 'success');
}

// =============================================================================
// RESET HISTORY — Hanya hapus data dalam rentang semester aktif
// =============================================================================
function resetHistory() {
    const classId = getCurrentClassId();
    const sem     = getActiveSemester();
    const semLabel = sem ? sem.label : 'semester ini';
    if (!confirm(`🚨 PERINGATAN: Hapus SEMUA riwayat absensi "${semLabel}"?\nData semester lain dan data siswa tidak terhapus.`)) return;

    const prefix = `paud_att_${classId}_`;
    const keys   = Object.keys(localStorage).filter(k => {
        if (!k.startsWith(prefix)) return false;
        const dateStr = k.replace(prefix, '');
        return dateStr >= sem.startDate && dateStr <= sem.endDate;
    });
    keys.forEach(k => localStorage.removeItem(k));
    showToast(`🗑️ Riwayat "${semLabel}" telah direset.`, 'success');
    renderRekap();
    renderAbsensi();
}

// =============================================================================
// CRUD MODAL LOGIC
// =============================================================================
let tempImg = null;

function openModal(mode, id = '') {
    const m  = document.getElementById('studentModal');
    const bx = document.getElementById('modalBox');
    tempImg  = null;
    document.getElementById('fileUpload').value      = '';
    document.getElementById('modalActionMode').value = mode;

    if (mode === 'edit') {
        const s = getStudents().find(x => x.id === id);
        document.getElementById('modalTitle').innerText   = 'Edit Profile Siswa';
        document.getElementById('modalStudentId').value   = s.id;
        document.getElementById('modalStudentName').value = s.name;
        document.getElementById('modalPreviewImg').src    = s.photo;
    } else {
        document.getElementById('modalTitle').innerText   = 'Tambah Siswa Baru';
        document.getElementById('modalStudentId').value   = '';
        document.getElementById('modalStudentName').value = '';
        document.getElementById('modalPreviewImg').src    = `https://api.dicebear.com/7.x/initials/svg?seed=Kids&backgroundColor=008F5A`;
    }
    m.classList.remove('hidden');
    m.classList.add('flex');
    void bx.offsetWidth;
    bx.classList.remove('scale-95', 'opacity-0');
}

function closeModal() {
    const m  = document.getElementById('studentModal');
    const bx = document.getElementById('modalBox');
    bx.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { m.classList.remove('flex'); m.classList.add('hidden'); }, 300);
}

function handleImageUpload(e) {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = x => {
        tempImg = x.target.result;
        document.getElementById('modalPreviewImg').src = tempImg;
    };
    r.readAsDataURL(f);
}

function saveStudentData() {
    const mode = document.getElementById('modalActionMode').value;
    const id   = document.getElementById('modalStudentId').value;
    const nm   = document.getElementById('modalStudentName').value.trim();
    if (!nm) return showToast('Nama siswa tidak boleh kosong!', 'error');

    const s = getStudents();
    if (mode === 'edit') {
        const i = s.findIndex(x => x.id === id);
        s[i].name = nm;
        if (tempImg) s[i].photo = tempImg;
        else if (s[i].photo.includes('dicebear')) s[i].photo = `https://api.dicebear.com/7.x/initials/svg?seed=${nm}&backgroundColor=008F5A&textColor=ffffff`;
        showToast('Profil siswa berhasil diperbarui.', 'success');
    } else {
        const classId = getCurrentClassId();
        s.push({
            id:        `S${Date.now()}${classId}`,
            name:      nm,
            photo:     tempImg || `https://api.dicebear.com/7.x/initials/svg?seed=${nm}&backgroundColor=008F5A&textColor=ffffff`,
            dateAdded: getTodayDateStr()
        });
        showToast('Siswa baru ditambahkan.', 'success');
    }
    saveStudents(s);
    closeModal();
    renderAbsensi();
    renderManajemen();
    renderRekap();
}

function deleteStudent(id) {
    if (!confirm('🚨 Apakah Anda yakin ingin menghapus siswa ini?')) return;
    saveStudents(getStudents().filter(x => x.id !== id));
    showToast('🗑️ Data siswa dihapus.', 'success');
    renderAbsensi();
    renderManajemen();
    renderRekap();
}

// =============================================================================
// TOAST
// =============================================================================
function showToast(m, t) {
    const c  = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = `glass-card ${t === 'success' ? 'bg-emerald-600/90' : 'bg-rose-600/90'} text-white px-6 py-4 shadow-lg flex items-center gap-3 toast-animate border-none min-w-[280px]`;
    el.innerHTML = `<i class="fa-solid ${t === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'} text-xl"></i> <span class="text-sm font-bold tracking-wide">${m}</span>`;
    c.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

// =============================================================================
// BOOT
// =============================================================================
window.addEventListener('DOMContentLoaded', checkAuth);
