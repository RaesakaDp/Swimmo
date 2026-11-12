// Inisialisasi Lucide Icons
lucide.createIcons();

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Logika Kalkulator Interaktif
let currentType = 'private';
let currentSession = 4;
let currentPersons = 1;

function setCalcType(type) {
    currentType = type;
    document.getElementById('typePrivate').className = type === 'private' 
        ? 'calc-type-btn py-3 px-4 rounded-xl border-2 border-brandPink bg-pink-50 text-brandPink font-bold text-center transition-all'
        : 'calc-type-btn py-3 px-4 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-center hover:border-brandPink transition-all';
    
    document.getElementById('typeGroup').className = type === 'group' 
        ? 'calc-type-btn py-3 px-4 rounded-xl border-2 border-brandPink bg-pink-50 text-brandPink font-bold text-center transition-all'
        : 'calc-type-btn py-3 px-4 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-center hover:border-brandPink transition-all';

    calculateTotal();
}

function setCalcSession(session) {
    currentSession = session;
    const btn4 = document.getElementById('session4');
    const btn8 = document.getElementById('session8');
    const btn1 = document.getElementById('session1');

    [btn4, btn8, btn1].forEach(btn => {
        btn.className = 'calc-session-btn py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-center';
    });

    if(session === 4) btn4.className = 'calc-session-btn py-3 rounded-xl border-2 border-brandPink bg-pink-50 text-brandPink font-bold text-center';
    if(session === 8) btn8.className = 'calc-session-btn py-3 rounded-xl border-2 border-brandPink bg-pink-50 text-brandPink font-bold text-center';
    if(session === 1) btn1.className = 'calc-session-btn py-3 rounded-xl border-2 border-brandPink bg-pink-50 text-brandPink font-bold text-center';

    calculateTotal();
}

function updatePersonCount(val) {
    currentPersons = parseInt(val);
    document.getElementById('personCountText').innerText = val + ' Orang';
    calculateTotal();
}

function calculateTotal() {
    let baseRate = 100000; // Tarif dasar per sesi
    
    if (currentType === 'private') {
        baseRate = 115000;
    } else {
        baseRate = 85000;
    }

    let total = baseRate * currentSession * currentPersons;
    
    // Diskon 10% untuk paket 8 sesi
    if (currentSession === 8) {
        total = total * 0.9;
    }

    document.getElementById('totalPrice').innerText = 'Rp ' + total.toLocaleString('id-ID');
}

function selectProgram(progName) {
    document.getElementById('programSelect').value = progName;
}

function bookWithCalculator() {
    const bookingSec = document.getElementById('booking');
    if (bookingSec) {
        bookingSec.scrollIntoView({ behavior: 'smooth' });
    }
}

// Pengiriman Formulir Otomatis ke WhatsApp
function sendToWhatsApp(e) {
    e.preventDefault();
    const name = document.getElementById('fullName').value;
    const age = document.getElementById('age').value;
    const program = document.getElementById('programSelect').value;
    const location = document.getElementById('locationSelect').value;
    const time = document.getElementById('preferredTime').value;

    const text = `Halo Admin Swimmo Malang 👋%0A%0ASaya ingin mendaftar Les Renang dengan data berikut:%0A- *Nama*: ${name}%0A- *Usia*: ${age}%0A- *Program*: ${program}%0A- *Lokasi Kolam*: ${location}%0A- *Rencana Jadwal*: ${time}%0A%0AMohon info ketersediaan jadwalnya ya, terima kasih!`;

    window.open(`https://wa.me/6285196284611?text=${text}`, '_blank');
}