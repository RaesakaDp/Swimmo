// Cek Sesi & Role Login
const currentUser = JSON.parse(localStorage.getItem('swimmo_session'));
if (!currentUser) {
    window.location.href = 'login.html';
}

lucide.createIcons();

// Terapkan Pembatasan Hak Akses (Role-Based Access)
document.getElementById('navRoleTitle').innerText = currentUser.role === 'owner' ? 'SWIMMO OWNER PANEL' : 'SWIMMO COACH PANEL';
document.getElementById('navUserSub').innerText = `Login sebagai: ${currentUser.name}`;

if (currentUser.role !== 'owner') {
    document.querySelectorAll('.owner-only').forEach(el => el.style.display = 'none');
}

// ==================== DATA DEFAULT ====================
const defaultStudents = [
    {
        id: 1, name: "Alya Putri (6 Thn)", wa: "6281234567890", program: "Toddler & Kids", pool: "BBS Pool",
        coach: "Coach Dimas", coachFee: 60000, day: "Sabtu", time: "08:00", totalSessions: 4, remainingSessions: 3, fee: 460000, paid: "Lunas",
        logs: [{ type: "Hadir", date: "2026-11-07", note: "Pengenalan air & meniup gelembung. Anak sangat antusias." }]
    },
    {
        id: 2, name: "Raka Pratama (24 Thn)", wa: "6285196284611", program: "Private Dewasa", pool: "Tsurraya Flexy",
        coach: "Coach Rizal", coachFee: 65000, day: "Minggu", time: "09:30", totalSessions: 8, remainingSessions: 1, fee: 828000, paid: "Lunas",
        logs: [{ type: "Hadir", date: "2026-11-01", note: "Koordinasi tangan & ambil napas gaya bebas." }]
    },
    {
        id: 3, name: "Naufal & Zahra", wa: "6289876543210", program: "Group Swim Class", pool: "Thursina IIBS",
        coach: "Coach Rizal", coachFee: 75000, day: "Sabtu", time: "15:30", totalSessions: 4, remainingSessions: 4, fee: 680000, paid: "Belum Lunas", logs: []
    }
];

const defaultInbox = [
    { id: 901, date: "2026-11-12", name: "Bima Sakti (8 Thn)", program: "Toddler & Kids", pool: "Wagir City Pool", preferredTime: "Sabtu Pagi", wa: "628123456789" }
];

const defaultCoaches = [
    {
        id: 1,
        coach: "Coach Rizal",
        wa: "6285196284611",
        spec: "All Level (Toddler & Adult)",
        bank: "BCA 4480123456 a.n. Ahmad Rizal",
        feePerSession: 65000,
        sessions: 7,
        status: "Aktif"
    },
    {
        id: 2,
        coach: "Coach Dimas",
        wa: "6281234567890",
        spec: "Toddler & Kids",
        bank: "Mandiri 144001234567 a.n. Dimas Saputra",
        feePerSession: 60000,
        sessions: 1,
        status: "Aktif"
    },
    {
        id: 3,
        coach: "Coach Nisa",
        wa: "6289876543210",
        spec: "Dewasa & Pemula (Khusus Wanita)",
        bank: "BRI 005101234567 a.n. Khairunnisa",
        feePerSession: 65000,
        sessions: 0,
        status: "Aktif"
    }
];

let students = JSON.parse(localStorage.getItem('swimmo_students_v3')) || defaultStudents;
let inbox = JSON.parse(localStorage.getItem('swimmo_inbox')) || defaultInbox;
let expenses = JSON.parse(localStorage.getItem('swimmo_expenses_v3')) || [
    { id: 101, date: "2026-11-07", desc: "Tiket kolam BBS Coach Dimas", cat: "Tiket Kolam", amount: 25000 }
];
let coachLogs = JSON.parse(localStorage.getItem('swimmo_coaches_db')) || defaultCoaches;

function saveAll() {
    localStorage.setItem('swimmo_students_v3', JSON.stringify(students));
    localStorage.setItem('swimmo_inbox', JSON.stringify(inbox));
    localStorage.setItem('swimmo_expenses_v3', JSON.stringify(expenses));
    localStorage.setItem('swimmo_coach_logs_v3', JSON.stringify(coachLogs));
    renderAll();
}

// Filter siswa berdasarkan role (Coach hanya melihat muridnya sendiri)
function getVisibleStudents() {
    if (currentUser.role === 'owner') return students;
    return students.filter(s => s.coach.toLowerCase() === currentUser.name.toLowerCase());
}

function renderAll() {
    renderTable();
    renderInbox();
    renderScheduleBoard();
    renderCoachPayroll();
    renderExpenses();
    updateStats();
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById('tab-' + tabName).classList.remove('hidden');

    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.style.display !== 'none') {
            btn.className = 'tab-btn px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-2 whitespace-nowrap';
        }
    });
    document.getElementById('tabBtn-' + tabName).className = 'tab-btn px-4 py-2.5 rounded-xl text-sm font-bold bg-brandPink text-white flex items-center gap-2 whitespace-nowrap';
}

// ==================== TAB 1: SISWA & PRESENSI ====================
function renderTable() {
    const tbody = document.getElementById('studentTableBody');
    const search = document.getElementById('searchInput').value.toLowerCase();
    const filterPool = document.getElementById('filterPool').value;

    tbody.innerHTML = '';
    const visibleList = getVisibleStudents().filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search) || s.coach.toLowerCase().includes(search);
        const matchPool = filterPool === 'ALL' || s.pool === filterPool;
        return matchSearch && matchPool;
    });

    if (visibleList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-400">Belum ada data siswa.</td></tr>`;
        return;
    }

    visibleList.forEach(s => {
        const isLow = s.remainingSessions <= 1;
        const sessionBadge = isLow 
            ? `<span class="bg-red-100 text-red-600 font-bold px-2.5 py-1 rounded-full text-xs">${s.remainingSessions}/${s.totalSessions} Sesi</span>`
            : `<span class="bg-cyan-100 text-cyan-700 font-bold px-2.5 py-1 rounded-full text-xs">${s.remainingSessions}/${s.totalSessions} Sesi</span>`;

        const payCell = currentUser.role === 'owner' ? `
            <td class="py-4 px-4 space-x-1 whitespace-nowrap">
                <button onclick="togglePayment(${s.id})" class="${s.paid === 'Lunas' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} font-semibold px-2.5 py-1 rounded-lg text-xs">
                    ${s.paid === 'Lunas' ? '✓ Lunas' : '⏳ Belum'}
                </button>
                ${s.paid === 'Lunas' ? `<button onclick="openReceipt(${s.id})" title="Cetak Kuitansi" class="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg inline-flex"><i data-lucide="receipt" class="w-3.5 h-3.5"></i></button>` : ''}
            </td>` : '';

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50">
                <td class="py-4 px-4">
                    <div class="font-bold text-slate-900">${s.name}</div>
                    <div class="text-xs text-slate-400">${s.program}</div>
                </td>
                <td class="py-4 px-4">
                    <div class="text-xs font-bold text-brandAqua">${s.pool}</div>
                    <div class="text-xs text-slate-500">${s.day}, ${s.time}</div>
                </td>
                <td class="py-4 px-4 font-medium text-slate-700">${s.coach}</td>
                <td class="py-4 px-4 text-center">${sessionBadge}</td>
                ${payCell}
                <td class="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                    <button onclick="openAttendanceModal(${s.id}, 'hadir')" ${s.remainingSessions === 0 ? 'disabled' : ''} class="bg-brandPink hover:bg-brandPinkHover disabled:bg-slate-300 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg">
                        Hadir (-1)
                    </button>
                    <button onclick="openAttendanceModal(${s.id}, 'reschedule')" title="Izin Hujan / Reschedule" class="bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold px-2 py-1.5 rounded-lg">
                        Reschedule
                    </button>
                    <button onclick="openHistoryModal(${s.id})" class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-2 py-1.5 rounded-lg">
                        Log (${s.logs ? s.logs.length : 0})
                    </button>
                    <button onclick="openCertificate(${s.id})" title="Cetak E-Sertifikat" class="bg-purple-100 hover:bg-purple-200 text-purple-700 p-1.5 rounded-lg inline-flex">
                        <i data-lucide="award" class="w-4 h-4"></i>
                    </button>
                    ${currentUser.role === 'owner' ? `<button onclick="deleteStudent(${s.id})" class="text-slate-400 hover:text-red-500 p-1.5 inline-flex"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : ''}
                </td>
            </tr>
        `;
    });
    lucide.createIcons();
}

// ==================== TAB 2: BOOKING INBOX ====================
function renderInbox() {
    document.getElementById('inboxBadge').innerText = inbox.length;
    const tbody = document.getElementById('inboxTableBody');
    tbody.innerHTML = '';

    if (inbox.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-slate-400">Belum ada pendaftar baru dari website.</td></tr>`;
        return;
    }

    inbox.forEach(item => {
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50">
                <td class="py-3.5 px-4 text-xs text-slate-500">${item.date}</td>
                <td class="py-3.5 px-4 font-bold text-slate-900">${item.name}</td>
                <td class="py-3.5 px-4"><span class="font-medium">${item.program}</span> • <span class="text-brandAqua text-xs font-bold">${item.pool}</span></td>
                <td class="py-3.5 px-4 text-xs text-slate-600">${item.preferredTime}</td>
                <td class="py-3.5 px-4 text-right space-x-1">
                    <button onclick="approveInbox(${item.id})" class="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                        ✓ Terima & Jadwalkan
                    </button>
                    <button onclick="deleteInbox(${item.id})" class="text-slate-400 hover:text-red-500 p-1.5"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </td>
            </tr>
        `;
    });
    lucide.createIcons();
}

function approveInbox(id) {
    const item = inbox.find(i => i.id === id);
    if (!item) return;
    document.getElementById('addModalTitle').innerText = 'Verifikasi & Jadwalkan Pendaftar';
    document.getElementById('fromInboxId').value = item.id;
    document.getElementById('inName').value = item.name;
    document.getElementById('inWa').value = item.wa;
    document.getElementById('inProgram').value = item.program;
    openModal('addModal');
}

function deleteInbox(id) {
    if (confirm('Hapus antrian pendaftar ini?')) {
        inbox = inbox.filter(i => i.id !== id);
        saveAll();
    }
}

// ==================== PRESENSI & RESCHEDULE ====================
function openAttendanceModal(id, mode) {
    const s = students.find(st => st.id === id);
    if (!s) return;
    document.getElementById('attStudentId').value = s.id;
    document.getElementById('attMode').value = mode;
    document.getElementById('attStudentName').innerText = `${s.name} • ${s.pool}`;
    document.getElementById('attDate').valueAsDate = new Date();
    document.getElementById('attNotes').value = '';

    if (mode === 'reschedule') {
        document.getElementById('attModalTitle').innerText = 'Catat Reschedule / Izin Hujan';
        document.getElementById('attNotesLabel').innerText = 'Alasan Penundaan & Rencana Hari Pengganti';
        document.getElementById('attSubmitBtn').innerText = 'Simpan Reschedule (Kuota Utuh)';
        document.getElementById('attSubmitBtn').className = 'px-5 py-2 text-sm font-bold bg-amber-500 text-white rounded-xl';
    } else {
        document.getElementById('attModalTitle').innerText = 'Catat Kehadiran & Progres';
        document.getElementById('attNotesLabel').innerText = 'Catatan Progres Pelatih';
        document.getElementById('attSubmitBtn').innerText = 'Simpan Hadir (-1 Sesi)';
        document.getElementById('attSubmitBtn').className = 'px-5 py-2 text-sm font-bold bg-brandPink text-white rounded-xl';
    }
    openModal('attendanceModal');
}

function submitAttendance(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('attStudentId').value);
    const mode = document.getElementById('attMode').value;
    const date = document.getElementById('attDate').value;
    const note = document.getElementById('attNotes').value;

    const idx = students.findIndex(s => s.id === id);
    if (idx !== -1) {
        if (!students[idx].logs) students[idx].logs = [];

        if (mode === 'hadir' && students[idx].remainingSessions > 0) {
            students[idx].remainingSessions -= 1;
            students[idx].logs.unshift({ type: 'Hadir', date, note });

            // Tambah Honor Pelatih
            const cIdx = coachLogs.findIndex(c => c.coach.toLowerCase() === students[idx].coach.toLowerCase());
            if (cIdx !== -1) coachLogs[cIdx].sessions += 1;
            else coachLogs.push({ coach: students[idx].coach, sessions: 1, feePerSession: students[idx].coachFee || 60000 });
        } else if (mode === 'reschedule') {
            students[idx].logs.unshift({ type: 'Reschedule', date, note });
        }
        saveAll();
        closeModal('attendanceModal');
    }
}

// ==================== RIWAYAT LOG ====================
function openHistoryModal(id) {
    const s = students.find(st => st.id === id);
    if (!s) return;
    document.getElementById('histStudentTitle').innerText = `${s.name} — Sisa ${s.remainingSessions}/${s.totalSessions} Sesi`;
    const listEl = document.getElementById('historyList');
    listEl.innerHTML = (!s.logs || s.logs.length === 0)
        ? `<p class="text-sm text-slate-400 text-center py-6">Belum ada riwayat pertemuan.</p>`
        : s.logs.map(log => `
            <div class="p-3.5 rounded-2xl ${log.type === 'Reschedule' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'} border">
                <div class="flex justify-between text-xs font-bold mb-1">
                    <span class="${log.type === 'Reschedule' ? 'text-amber-700' : 'text-brandPink'}">${log.type || 'Hadir'}</span>
                    <span class="text-slate-500">${log.date}</span>
                </div>
                <p class="text-xs text-slate-600">${log.note}</p>
            </div>`).join('');

    document.getElementById('btnShareProgressWa').onclick = () => {
        const lastLog = s.logs && s.logs.length > 0 ? s.logs[0] : null;
        const text = lastLog 
            ? `Halo Wali/Peserta *${s.name}* 👋,%0A%0AUpdate *Swimmo Malang* (${lastLog.date} - ${lastLog.type || 'Hadir'}):%0A📝 "${lastLog.note}"%0A📊 Sisa Paket: *${s.remainingSessions} sesi*. Terima kasih! 🏊‍♂️`
            : `Halo Wali/Peserta *${s.name}* 👋, sisa paket renang Anda di *Swimmo Malang*: *${s.remainingSessions} sesi*.`;
        window.open(`https://wa.me/${s.wa}?text=${text}`, '_blank');
    };
    openModal('historyModal');
}

// ==================== KUITANSI & E-SERTIFIKAT ====================
function openReceipt(id) {
    const s = students.find(st => st.id === id);
    if (!s) return;
    document.getElementById('recNo').innerText = `INV-${s.id.toString().slice(-5)}`;
    document.getElementById('recDate').innerText = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    document.getElementById('recName').innerText = s.name;
    document.getElementById('recProgram').innerText = s.program;
    document.getElementById('recPool').innerText = s.pool;
    document.getElementById('recSessions').innerText = `${s.totalSessions} Sesi Pertemuan`;
    document.getElementById('recAmount').innerText = `Rp ${s.fee.toLocaleString('id-ID')}`;
    openModal('receiptModal');
}

function openCertificate(id) {
    const s = students.find(st => st.id === id);
    if (!s) return;
    document.getElementById('certStudentName').innerText = s.name.replace(/\s*\(.*?\)\s*/g, '');
    document.getElementById('certCoachName').innerText = s.coach;
    document.getElementById('certDate').innerText = `Malang, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    openModal('certModal');
}

function updateCertLevel(val) {
    document.getElementById('certLevelText').innerText = val;
}

// ==================== JADWAL, HONOR & KEUANGAN ====================
function renderScheduleBoard() {
    const board = document.getElementById('scheduleBoard');
    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
    board.innerHTML = '';
    const visibleList = getVisibleStudents();

    days.forEach(day => {
        const dayStudents = visibleList.filter(s => s.day === day && s.remainingSessions > 0).sort((a, b) => a.time.localeCompare(b.time));
        const cardsHtml = dayStudents.length === 0 
            ? `<p class="text-xs text-slate-400 italic py-4 text-center">Kosong</p>`
            : dayStudents.map(s => `
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div class="flex justify-between"><span class="text-xs font-extrabold text-brandPink">${s.time}</span><span class="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">${s.pool}</span></div>
                    <div class="text-xs font-bold text-slate-800">${s.name}</div>
                    <div class="text-[11px] text-slate-500">${s.coach}</div>
                </div>`).join('');

        board.innerHTML += `
            <div class="border border-slate-200 rounded-2xl p-4 bg-white">
                <div class="flex justify-between items-center pb-2 mb-3 border-b border-slate-100">
                    <h4 class="font-bold text-slate-800 text-sm">${day}</h4>
                    <span class="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded-full">${dayStudents.length}</span>
                </div>
                <div class="space-y-2">${cardsHtml}</div>
            </div>`;
    });
}

function renderCoachPayroll() {
    const tbody = document.getElementById('coachTableBody');
    const selectCoach = document.getElementById('inCoach');
    tbody.innerHTML = '';
    if (selectCoach) selectCoach.innerHTML = '';

    coachLogs.forEach((c, idx) => {
        // Isi dropdown pelatih pada form Tambah Siswa (hanya yang status Aktif)
        if (selectCoach && c.status === 'Aktif') {
            selectCoach.innerHTML += `<option value="${c.coach}" data-fee="${c.feePerSession}">${c.coach} (${c.spec})</option>`;
        }

        const totalHonor = c.sessions * c.feePerSession;
        const statusBadge = c.status === 'Aktif'
            ? `<span class="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">Aktif</span>`
            : `<span class="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full">Cuti</span>`;

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50">
                <td class="py-3.5 px-4">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-900">${c.coach}</span>
                        ${statusBadge}
                    </div>
                    <div class="text-xs text-slate-500">${c.spec} • WA: ${c.wa}</div>
                </td>
                <td class="py-3.5 px-4 text-xs font-medium text-slate-700">
                    ${c.bank}
                </td>
                <td class="py-3.5 px-4 text-center">
                    <span class="font-bold text-brandAqua bg-cyan-50 px-3 py-1 rounded-full text-xs">${c.sessions} Sesi</span>
                </td>
                <td class="py-3.5 px-4 text-slate-600 text-xs">
                    Rp ${c.feePerSession.toLocaleString('id-ID')}
                </td>
                <td class="py-3.5 px-4 font-extrabold text-emerald-600">
                    Rp ${totalHonor.toLocaleString('id-ID')}
                </td>
                <td class="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                    <button onclick="coachLogs[${idx}].sessions++; saveAll();" title="Tambah 1 Sesi Manual" class="text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg font-bold">+1</button>
                    <button onclick="sendCoachSlipWa(${idx})" title="Kirim Slip Honor ke WA Pelatih" class="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-lg inline-flex">
                        <i data-lucide="send" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="openCoachModal(${c.id})" title="Edit Profil Pelatih" class="bg-amber-100 hover:bg-amber-200 text-amber-800 p-1.5 rounded-lg inline-flex">
                        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="deleteCoach(${c.id})" title="Hapus Pelatih" class="text-slate-400 hover:text-red-500 p-1.5 inline-flex">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    autoFillCoachFee();
    lucide.createIcons();
}

// Otomatis mengisi nominal Fee Pelatih saat memilih nama pelatih di form siswa
function autoFillCoachFee() {
    const select = document.getElementById('inCoach');
    const feeInput = document.getElementById('inCoachFee');
    if (select && feeInput && select.selectedOptions.length > 0) {
        const fee = select.selectedOptions[0].getAttribute('data-fee');
        if (fee) feeInput.value = fee;
    }
}

// Buka Modal Tambah / Edit Pelatih
function openCoachModal(id = null) {
    if (id) {
        const c = coachLogs.find(x => x.id === id);
        if (!c) return;
        document.getElementById('coachModalTitle').innerText = 'Edit Profil Pelatih';
        document.getElementById('editCoachId').value = c.id;
        document.getElementById('cName').value = c.coach;
        document.getElementById('cWa').value = c.wa;
        document.getElementById('cSpec').value = c.spec;
        document.getElementById('cFee').value = c.feePerSession;
        document.getElementById('cStatus').value = c.status;
        document.getElementById('cBank').value = c.bank;
    } else {
        document.getElementById('coachModalTitle').innerText = 'Tambah Pelatih Baru';
        document.getElementById('editCoachId').value = '';
        document.getElementById('cName').value = '';
        document.getElementById('cWa').value = '';
        document.getElementById('cFee').value = 60000;
        document.getElementById('cBank').value = '';
    }
    openModal('coachModal');
}

// Simpan Data Pelatih Baru / Hasil Edit
function saveCoach(e) {
    e.preventDefault();
    const editId = document.getElementById('editCoachId').value;
    const coachData = {
        coach: document.getElementById('cName').value,
        wa: document.getElementById('cWa').value,
        spec: document.getElementById('cSpec').value,
        feePerSession: parseInt(document.getElementById('cFee').value),
        status: document.getElementById('cStatus').value,
        bank: document.getElementById('cBank').value
    };

    if (editId) {
        const idx = coachLogs.findIndex(c => c.id === parseInt(editId));
        if (idx !== -1) coachLogs[idx] = { ...coachLogs[idx], ...coachData };
    } else {
        coachLogs.push({ id: Date.now(), sessions: 0, ...coachData });
    }

    localStorage.setItem('swimmo_coaches_db', JSON.stringify(coachLogs));
    renderAll();
    closeModal('coachModal');
}

function resetCoachPayroll() {
    if (confirm('Reset sesi mengajar pelatih ke 0?')) { coachLogs.forEach(c => c.sessions = 0); saveAll(); }
}

function deleteCoach(id) {
    if (confirm('Hapus data pelatih ini dari database klub?')) {
        coachLogs = coachLogs.filter(c => c.id !== id);
        localStorage.setItem('swimmo_coaches_db', JSON.stringify(coachLogs));
        renderAll();
    }
}

// Kirim Slip Honor via WhatsApp ke Pelatih
function sendCoachSlipWa(idx) {
    const c = coachLogs[idx];
    const total = c.sessions * c.feePerSession;
    const text = `Halo *${c.coach}* 👋,%0A%0ABerikut rekap honor mengajar Anda di *Swimmo Malang*:%0A- *Total Mengajar*: ${c.sessions} Sesi%0A- *Tarif per Sesi*: Rp ${c.feePerSession.toLocaleString('id-ID')}%0A- *Total Honor*: *Rp ${total.toLocaleString('id-ID')}*%0A- *Tujuan Transfer*: ${c.bank}%0A%0ATerima kasih atas dedikasinya melatih bersama Swimmo! 🏊‍♂️`;
    window.open(`https://wa.me/${c.wa}?text=${text}`, '_blank');
}


function renderExpenses() {
    const tbody = document.getElementById('expenseTableBody');
    tbody.innerHTML = expenses.map(ex => `
        <tr>
            <td class="py-3.5 px-4 text-xs text-slate-500">${ex.date}</td>
            <td class="py-3.5 px-4 font-semibold">${ex.desc}</td>
            <td class="py-3.5 px-4"><span class="text-xs bg-slate-100 px-2 py-1 rounded-lg">${ex.cat}</span></td>
            <td class="py-3.5 px-4 font-bold text-red-600">- Rp ${ex.amount.toLocaleString('id-ID')}</td>
            <td class="py-3.5 px-4 text-right"><button onclick="expenses = expenses.filter(e => e.id !== ${ex.id}); saveAll();" class="text-slate-400 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button></td>
        </tr>`).join('');
    lucide.createIcons();
}

function addExpense(e) {
    e.preventDefault();
    expenses.unshift({ id: Date.now(), date: document.getElementById('expDate').value, desc: document.getElementById('expDesc').value, cat: document.getElementById('expCat').value, amount: parseInt(document.getElementById('expAmount').value) });
    saveAll(); e.target.reset(); closeModal('expenseModal');
}

function updateStats() {
    const visible = getVisibleStudents();
    document.getElementById('statTotalStudents').innerText = visible.length;
    document.getElementById('statRemainingSessions').innerText = visible.reduce((s, x) => s + x.remainingSessions, 0) + ' Sesi';

    if (currentUser.role === 'owner') {
        const rev = students.filter(s => s.paid === 'Lunas').reduce((s, x) => s + x.fee, 0);
        const honor = coachLogs.reduce((s, c) => s + (c.sessions * c.feePerSession), 0);
        const ops = expenses.reduce((s, x) => s + x.amount, 0);
        document.getElementById('statRevenue').innerText = 'Rp ' + rev.toLocaleString('id-ID');
        document.getElementById('statNetProfit').innerText = 'Rp ' + (rev - honor - ops).toLocaleString('id-ID');
    }
}

function addStudent(e) {
    e.preventDefault();
    const sessions = parseInt(document.getElementById('inSessions').value);
    const inboxId = document.getElementById('fromInboxId').value;

    students.unshift({
        id: Date.now(), name: document.getElementById('inName').value, wa: document.getElementById('inWa').value,
        program: document.getElementById('inProgram').value, pool: document.getElementById('inPool').value,
        coach: document.getElementById('inCoach').value, coachFee: parseInt(document.getElementById('inCoachFee').value),
        day: document.getElementById('inDay').value, time: document.getElementById('inTime').value,
        totalSessions: sessions, remainingSessions: sessions, fee: parseInt(document.getElementById('inFee').value),
        paid: document.getElementById('inPaid').value, logs: []
    });

    if (inboxId) inbox = inbox.filter(i => i.id !== parseInt(inboxId));
    document.getElementById('fromInboxId').value = '';
    saveAll(); e.target.reset(); closeModal('addModal');
}

function togglePayment(id) {
    const idx = students.findIndex(s => s.id === id);
    if (idx !== -1) { students[idx].paid = students[idx].paid === 'Lunas' ? 'Belum Lunas' : 'Lunas'; saveAll(); }
}

function deleteStudent(id) {
    if (confirm('Hapus data siswa ini?')) { students = students.filter(s => s.id !== id); saveAll(); }
}

function exportToCSV() {
    let csv = "Nama,Program,Kolam,Pelatih,Hari,Jam,Sisa Sesi,Biaya,Status\n";
    students.forEach(s => csv += `"${s.name}","${s.program}","${s.pool}","${s.coach}","${s.day}","${s.time}",${s.remainingSessions},${s.fee},"${s.paid}"\n`);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = `Laporan_Swimmo_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
}

function backupJSON() {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([JSON.stringify({ students, inbox, expenses, coachLogs }, null, 2)], { type: 'application/json' }));
    link.download = `Backup_Swimmo_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
}

function restoreJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        const d = JSON.parse(ev.target.result);
        if (d.students) { students = d.students; inbox = d.inbox || []; expenses = d.expenses || []; coachLogs = d.coachLogs || []; saveAll(); alert('Data berhasil dipulihkan!'); }
    };
    reader.readAsText(file);
}

function resetDemoData() {
    if (confirm('Reset semua data ke kondisi awal demo?')) {
        localStorage.removeItem('swimmo_students_v3'); localStorage.removeItem('swimmo_inbox');
        localStorage.removeItem('swimmo_expenses_v3'); localStorage.removeItem('swimmo_coach_logs_v3');
        location.reload();
    }
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function logout() { localStorage.removeItem('swimmo_session'); window.location.href = 'login.html'; }

renderAll();