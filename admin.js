// Proteksi Login
if (localStorage.getItem('swimmo_auth') !== 'true') {
    window.location.href = 'login.html';
}

lucide.createIcons();

// ==================== DATA DEFAULT DEMO ====================
const defaultStudents = [
    {
        id: 1,
        name: "Alya Putri (6 Thn)",
        wa: "6281234567890",
        program: "Toddler & Kids",
        pool: "BBS Pool",
        coach: "Coach Dimas",
        coachFee: 60000,
        day: "Sabtu",
        time: "08:00",
        totalSessions: 4,
        remainingSessions: 3,
        fee: 460000,
        paid: "Lunas",
        logs: [
            { date: "2026-11-07", note: "Pengenalan air & latihan meniup gelembung di dalam air. Anak sangat antusias." }
        ]
    },
    {
        id: 2,
        name: "Raka Pratama (24 Thn)",
        wa: "6285196284611",
        program: "Private Dewasa",
        pool: "Tsurraya Flexy",
        coach: "Coach Rizal",
        coachFee: 65000,
        day: "Minggu",
        time: "09:30",
        totalSessions: 8,
        remainingSessions: 1,
        fee: 828000,
        paid: "Lunas",
        logs: [
            { date: "2026-10-25", note: "Meluncur & gerakan kaki gaya bebas." },
            { date: "2026-11-01", note: "Koordinasi tangan & ambil napas samping kanan." }
        ]
    },
    {
        id: 3,
        name: "Naufal & Zahra",
        wa: "6289876543210",
        program: "Group Swim Class",
        pool: "Thursina IIBS",
        coach: "Coach Nisa",
        coachFee: 75000,
        day: "Sabtu",
        time: "15:30",
        totalSessions: 4,
        remainingSessions: 4,
        fee: 680000,
        paid: "Belum Lunas",
        logs: []
    }
];

const defaultExpenses = [
    { id: 101, date: "2026-11-07", desc: "Tiket masuk kolam BBS Coach Dimas", cat: "Tiket Kolam", amount: 25000 },
    { id: 102, date: "2026-11-05", desc: "Beli 2 papan seluncur (Kickboard)", cat: "Alat Renang", amount: 110000 }
];

// Load State dari LocalStorage
let students = JSON.parse(localStorage.getItem('swimmo_students_v2')) || defaultStudents;
let expenses = JSON.parse(localStorage.getItem('swimmo_expenses_v2')) || defaultExpenses;
let coachLogs = JSON.parse(localStorage.getItem('swimmo_coach_logs')) || [
    { coach: "Coach Dimas", sessions: 1, feePerSession: 60000 },
    { coach: "Coach Rizal", sessions: 7, feePerSession: 65000 }
];

function saveAll() {
    localStorage.setItem('swimmo_students_v2', JSON.stringify(students));
    localStorage.setItem('swimmo_expenses_v2', JSON.stringify(expenses));
    localStorage.setItem('swimmo_coach_logs', JSON.stringify(coachLogs));
    renderAll();
}

function renderAll() {
    renderTable();
    renderScheduleBoard();
    renderCoachPayroll();
    renderExpenses();
    updateStats();
}

// ==================== NAVIGASI TAB ====================
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById('tab-' + tabName).classList.remove('hidden');

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.className = 'tab-btn px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-2 whitespace-nowrap transition-all';
    });
    document.getElementById('tabBtn-' + tabName).className = 'tab-btn px-4 py-2.5 rounded-xl text-sm font-bold bg-brandPink text-white flex items-center gap-2 whitespace-nowrap transition-all';
}

// ==================== TAB 1: TABEL SISWA & PRESENSI ====================
function renderTable() {
    const tbody = document.getElementById('studentTableBody');
    const search = document.getElementById('searchInput').value.toLowerCase();
    const filterPool = document.getElementById('filterPool').value;

    tbody.innerHTML = '';

    const filtered = students.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search) || s.coach.toLowerCase().includes(search);
        const matchPool = filterPool === 'ALL' || s.pool === filterPool;
        return matchSearch && matchPool;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-400">Data siswa tidak ditemukan.</td></tr>`;
        return;
    }

    filtered.forEach(s => {
        const isLow = s.remainingSessions <= 1;
        const sessionBadge = isLow 
            ? `<span class="bg-red-100 text-red-600 font-bold px-2.5 py-1 rounded-full text-xs">${s.remainingSessions} / ${s.totalSessions} Sesi</span>`
            : `<span class="bg-cyan-100 text-cyan-700 font-bold px-2.5 py-1 rounded-full text-xs">${s.remainingSessions} / ${s.totalSessions} Sesi</span>`;

        const payBadge = s.paid === 'Lunas'
            ? `<button onclick="togglePayment(${s.id})" class="bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1 rounded-lg text-xs hover:bg-emerald-200">✓ Lunas</button>`
            : `<button onclick="togglePayment(${s.id})" class="bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-lg text-xs hover:bg-amber-200">⏳ Belum Lunas</button>`;

        tbody.innerHTML += `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="py-4 px-4">
                    <div class="font-bold text-slate-900">${s.name}</div>
                    <div class="text-xs text-slate-400">Paket: Rp ${s.fee.toLocaleString('id-ID')}</div>
                </td>
                <td class="py-4 px-4">
                    <div class="font-medium text-slate-700">${s.program}</div>
                    <div class="text-xs text-brandAqua font-semibold">${s.pool}</div>
                </td>
                <td class="py-4 px-4">
                    <div class="font-medium text-slate-700">${s.coach}</div>
                    <div class="text-xs text-slate-500">${s.day}, ${s.time}</div>
                </td>
                <td class="py-4 px-4 text-center">${sessionBadge}</td>
                <td class="py-4 px-4">${payBadge}</td>
                <td class="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                    <button onclick="openAttendanceModal(${s.id})" ${s.remainingSessions === 0 ? 'disabled' : ''} class="bg-brandPink hover:bg-brandPinkHover disabled:bg-slate-300 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                        Hadir (-1)
                    </button>
                    <button onclick="openHistoryModal(${s.id})" title="Log Progres" class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg">
                        Log (${s.logs ? s.logs.length : 0})
                    </button>
                    <button onclick="remindWa('${s.name}', '${s.wa}', ${s.remainingSessions})" title="Reminder WA" class="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-lg inline-flex items-center">
                        <i data-lucide="message-circle" class="w-4 h-4"></i>
                    </button>
                    <button onclick="deleteStudent(${s.id})" title="Hapus" class="text-slate-400 hover:text-red-500 p-1.5 rounded-lg inline-flex items-center">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    lucide.createIcons();
}

// Presensi & Catatan Progres
function openAttendanceModal(id) {
    const s = students.find(st => st.id === id);
    if (!s) return;
    document.getElementById('attStudentId').value = s.id;
    document.getElementById('attStudentName').innerText = `${s.name} • ${s.coach} (${s.pool})`;
    document.getElementById('attDate').valueAsDate = new Date();
    document.getElementById('attNotes').value = '';
    openModal('attendanceModal');
}

function submitAttendance(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('attStudentId').value);
    const date = document.getElementById('attDate').value;
    const note = document.getElementById('attNotes').value;

    const idx = students.findIndex(s => s.id === id);
    if (idx !== -1 && students[idx].remainingSessions > 0) {
        students[idx].remainingSessions -= 1;
        if (!students[idx].logs) students[idx].logs = [];
        students[idx].logs.unshift({ date, note });

        // Tambah otomatis ke honor pelatih
        const coachName = students[idx].coach;
        const feeRate = students[idx].coachFee || 60000;
        const cIdx = coachLogs.findIndex(c => c.coach.toLowerCase() === coachName.toLowerCase());
        if (cIdx !== -1) {
            coachLogs[cIdx].sessions += 1;
        } else {
            coachLogs.push({ coach: coachName, sessions: 1, feePerSession: feeRate });
        }

        saveAll();
        closeModal('attendanceModal');
    }
}

// Lihat Riwayat & Kirim WA Laporan
function openHistoryModal(id) {
    const s = students.find(st => st.id === id);
    if (!s) return;

    document.getElementById('histStudentTitle').innerText = `${s.name} — Sisa ${s.remainingSessions} dari ${s.totalSessions} Sesi`;
    const listEl = document.getElementById('historyList');
    listEl.innerHTML = '';

    if (!s.logs || s.logs.length === 0) {
        listEl.innerHTML = `<p class="text-sm text-slate-400 text-center py-6">Belum ada riwayat pertemuan tercatat.</p>`;
    } else {
        s.logs.forEach((log, i) => {
            listEl.innerHTML += `
                <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div class="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>Pertemuan #${s.logs.length - i}</span>
                        <span class="text-brandPink">${log.date}</span>
                    </div>
                    <p class="text-xs text-slate-600 leading-relaxed">${log.note}</p>
                </div>
            `;
        });
    }

    document.getElementById('btnShareProgressWa').onclick = () => {
        const lastLog = s.logs && s.logs.length > 0 ? s.logs[0] : null;
        const text = lastLog 
            ? `Halo Wali/Peserta *${s.name}* 👋,%0A%0ABerikut laporan progres latihan renang bersama *Swimmo Malang* (${lastLog.date}):%0A📝 *Catatan Pelatih:* "${lastLog.note}"%0A📊 *Sisa Paket:* ${s.remainingSessions} sesi lagi.%0A%0ATerima kasih & tetap semangat berlatih! 🏊‍♂️`
            : `Halo Wali/Peserta *${s.name}* 👋,%0A%0ASisa paket latihan renang Anda di *Swimmo Malang* saat ini: *${s.remainingSessions} sesi*. Terima kasih! 🏊‍♂️`;
        window.open(`https://wa.me/${s.wa}?text=${text}`, '_blank');
    };

    openModal('historyModal');
}

// ==================== TAB 2: JADWAL MINGGUAN ====================
function renderScheduleBoard() {
    const board = document.getElementById('scheduleBoard');
    const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
    board.innerHTML = '';

    days.forEach(day => {
        const dayStudents = students
            .filter(s => s.day === day && s.remainingSessions > 0)
            .sort((a, b) => a.time.localeCompare(b.time));

        let cardsHtml = dayStudents.length === 0 
            ? `<p class="text-xs text-slate-400 italic py-4 text-center">Tidak ada jadwal</p>`
            : dayStudents.map(s => `
                <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <div class="flex justify-between items-center">
                        <span class="text-xs font-extrabold text-brandPink">${s.time} WIB</span>
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800">${s.pool}</span>
                    </div>
                    <div class="text-xs font-bold text-slate-800">${s.name}</div>
                    <div class="text-[11px] text-slate-500">Pelatih: ${s.coach}</div>
                </div>
            `).join('');

        board.innerHTML += `
            <div class="border border-slate-200 rounded-2xl p-4 bg-white flex flex-col">
                <div class="flex justify-between items-center pb-3 mb-3 border-b border-slate-100">
                    <h4 class="font-bold text-slate-800 text-sm">${day}</h4>
                    <span class="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">${dayStudents.length} Kelas</span>
                </div>
                <div class="space-y-2.5 flex-1">${cardsHtml}</div>
            </div>
        `;
    });
}

// ==================== TAB 3: REKAP HONOR PELATIH ====================
function renderCoachPayroll() {
    const tbody = document.getElementById('coachTableBody');
    tbody.innerHTML = '';

    if (coachLogs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-slate-400">Belum ada catatan mengajar bulan ini.</td></tr>`;
        return;
    }

    coachLogs.forEach((c, idx) => {
        const totalHonor = c.sessions * c.feePerSession;
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50">
                <td class="py-3.5 px-4 font-bold text-slate-900">${c.coach}</td>
                <td class="py-3.5 px-4 text-center font-bold text-brandAqua">${c.sessions} Sesi</td>
                <td class="py-3.5 px-4 text-slate-600">Rp ${c.feePerSession.toLocaleString('id-ID')}</td>
                <td class="py-3.5 px-4 font-extrabold text-emerald-600">Rp ${totalHonor.toLocaleString('id-ID')}</td>
                <td class="py-3.5 px-4 text-right">
                    <button onclick="addManualCoachSession(${idx})" class="text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg font-semibold">+1 Sesi</button>
                </td>
            </tr>
        `;
    });
}

function addManualCoachSession(idx) {
    coachLogs[idx].sessions += 1;
    saveAll();
}

function resetCoachPayroll() {
    if (confirm('Reset hitungan sesi seluruh pelatih menjadi 0 untuk tutup buku bulan ini?')) {
        coachLogs.forEach(c => c.sessions = 0);
        saveAll();
    }
}

// ==================== TAB 4: PENGELUARAN OPERASIONAL ====================
function renderExpenses() {
    const tbody = document.getElementById('expenseTableBody');
    tbody.innerHTML = '';

    if (expenses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-slate-400">Belum ada catatan pengeluaran.</td></tr>`;
        return;
    }

    expenses.forEach(ex => {
        tbody.innerHTML += `
            <tr class="hover:bg-slate-50">
                <td class="py-3.5 px-4 text-xs text-slate-500">${ex.date}</td>
                <td class="py-3.5 px-4 font-semibold text-slate-800">${ex.desc}</td>
                <td class="py-3.5 px-4"><span class="text-xs bg-slate-100 px-2.5 py-1 rounded-lg font-medium">${ex.cat}</span></td>
                <td class="py-3.5 px-4 font-bold text-red-600">- Rp ${ex.amount.toLocaleString('id-ID')}</td>
                <td class="py-3.5 px-4 text-right">
                    <button onclick="deleteExpense(${ex.id})" class="text-slate-400 hover:text-red-500 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </td>
            </tr>
        `;
    });
    lucide.createIcons();
}

function addExpense(e) {
    e.preventDefault();
    expenses.unshift({
        id: Date.now(),
        date: document.getElementById('expDate').value,
        desc: document.getElementById('expDesc').value,
        cat: document.getElementById('expCat').value,
        amount: parseInt(document.getElementById('expAmount').value)
    });
    saveAll();
    e.target.reset();
    closeModal('expenseModal');
}

function deleteExpense(id) {
    if (confirm('Hapus catatan pengeluaran ini?')) {
        expenses = expenses.filter(ex => ex.id !== id);
        saveAll();
    }
}

// ==================== STATISTIK KEUANGAN & LABA BERSIH ====================
function updateStats() {
    document.getElementById('statTotalStudents').innerText = students.length;

    const totalRevenue = students.filter(s => s.paid === 'Lunas').reduce((sum, s) => sum + s.fee, 0);
    const totalCoachHonor = coachLogs.reduce((sum, c) => sum + (c.sessions * c.feePerSession), 0);
    const totalOpsExpense = expenses.reduce((sum, ex) => sum + ex.amount, 0);
    const totalAllExpense = totalCoachHonor + totalOpsExpense;
    const netProfit = totalRevenue - totalAllExpense;

    document.getElementById('statRevenue').innerText = 'Rp ' + totalRevenue.toLocaleString('id-ID');
    document.getElementById('statExpense').innerText = 'Rp ' + totalAllExpense.toLocaleString('id-ID');
    document.getElementById('statNetProfit').innerText = 'Rp ' + netProfit.toLocaleString('id-ID');
}

// ==================== CRUD SISWA & EXPORT / BACKUP ====================
function addStudent(e) {
    e.preventDefault();
    const sessions = parseInt(document.getElementById('inSessions').value);
    students.unshift({
        id: Date.now(),
        name: document.getElementById('inName').value,
        wa: document.getElementById('inWa').value,
        program: document.getElementById('inProgram').value,
        pool: document.getElementById('inPool').value,
        coach: document.getElementById('inCoach').value,
        coachFee: parseInt(document.getElementById('inCoachFee').value),
        day: document.getElementById('inDay').value,
        time: document.getElementById('inTime').value,
        totalSessions: sessions,
        remainingSessions: sessions,
        fee: parseInt(document.getElementById('inFee').value),
        paid: document.getElementById('inPaid').value,
        logs: []
    });
    saveAll();
    e.target.reset();
    closeModal('addModal');
}

function togglePayment(id) {
    const idx = students.findIndex(s => s.id === id);
    if (idx !== -1) {
        students[idx].paid = students[idx].paid === 'Lunas' ? 'Belum Lunas' : 'Lunas';
        saveAll();
    }
}

function deleteStudent(id) {
    if (confirm('Hapus data siswa ini secara permanen?')) {
        students = students.filter(s => s.id !== id);
        saveAll();
    }
}

function remindWa(name, wa, rem) {
    const msg = rem <= 1 
        ? `Halo Wali/Peserta *${name}* 👋,%0A%0AKami dari *Swimmo Malang* menginfokan bahwa paket les renang Anda tersisa *${rem} sesi*. Apakah ingin melanjutkan perpanjangan paket? Terima kasih 🙏`
        : `Halo Wali/Peserta *${name}* 👋,%0A%0APengingat jadwal les renang bersama *Swimmo Malang*. Sisa paket Anda: *${rem} sesi*. Sampai jumpa di kolam! 🏊‍♂️`;
    window.open(`https://wa.me/${wa}?text=${msg}`, '_blank');
}

// Export Excel (.CSV)
function exportToCSV() {
    let csv = "Nama Siswa,Program,Kolam,Pelatih,Hari,Jam,Sisa Sesi,Total Paket,Biaya,Status Bayar\n";
    students.forEach(s => {
        csv += `"${s.name}","${s.program}","${s.pool}","${s.coach}","${s.day}","${s.time}",${s.remainingSessions},${s.totalSessions},${s.fee},"${s.paid}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_Swimmo_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
}

// Backup & Restore JSON
function backupJSON() {
    const data = { students, expenses, coachLogs };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Backup_Swimmo_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
}

function restoreJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const parsed = JSON.parse(event.target.result);
            if (parsed.students) {
                students = parsed.students;
                expenses = parsed.expenses || [];
                coachLogs = parsed.coachLogs || [];
                saveAll();
                alert('Data berhasil dipulihkan!');
            }
        } catch (err) {
            alert('Format file backup tidak valid.');
        }
    };
    reader.readAsText(file);
}

function resetDemoData() {
    if (confirm('Kembalikan seluruh data ke pengaturan awal demo?')) {
        localStorage.removeItem('swimmo_students_v2');
        localStorage.removeItem('swimmo_expenses_v2');
        localStorage.removeItem('swimmo_coach_logs');
        location.reload();
    }
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function logout() { localStorage.removeItem('swimmo_auth'); window.location.href = 'login.html'; }

// Init
renderAll();