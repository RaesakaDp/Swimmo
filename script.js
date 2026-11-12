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
    let baseRate = currentType === 'private' ? 115000 : 85000;
    let total = baseRate * currentSession * currentPersons;
    if (currentSession === 8) total = total * 0.9;
    document.getElementById('totalPrice').innerText = 'Rp ' + total.toLocaleString('id-ID');
}

function selectProgram(progName) {
    document.getElementById('programSelect').value = progName;
}

function bookWithCalculator() {
    const bookingSec = document.getElementById('booking');
    if (bookingSec) bookingSec.scrollIntoView({ behavior: 'smooth' });
}

// Pengiriman Formulir ke Booking Inbox & Tampilkan Modal Konfirmasi
function sendToWhatsApp(e) {
    e.preventDefault();
    const name = document.getElementById('fullName').value;
    const age = document.getElementById('age').value;
    const program = document.getElementById('programSelect').value;
    const location = document.getElementById('locationSelect').value;
    const time = document.getElementById('preferredTime').value || 'Fleksibel';

    // Buat Kode Booking Unik (contoh: #SWM-4821)
    const bookingCode = '#SWM-' + Math.floor(1000 + Math.random() * 9000);

    // 1. Simpan otomatis ke Antrian Booking Inbox Admin (LocalStorage)
    const inbox = JSON.parse(localStorage.getItem('swimmo_inbox')) || [];
    inbox.unshift({
        id: Date.now(),
        code: bookingCode,
        date: new Date().toISOString().slice(0, 10),
        name: `${name} (${age})`,
        program: program,
        pool: location.replace(' Pool', ''),
        preferredTime: time,
        wa: '628'
    });
    localStorage.setItem('swimmo_inbox', JSON.stringify(inbox));

    // 2. Isi data ke dalam Modal Konfirmasi
    document.getElementById('modalBookingCode').innerText = bookingCode;
    document.getElementById('modalBookingName').innerText = `${name} (${age})`;
    document.getElementById('modalBookingProgram').innerText = program;
    document.getElementById('modalBookingPool').innerText = location;
    document.getElementById('modalBookingTime').innerText = time;

    // 3. Siapkan link WhatsApp dengan Kode Booking
    const text = `Halo Admin Swimmo Malang 👋%0A%0ASaya sudah mengisi formulir pendaftaran online dengan rincian:%0A- *Kode Booking*: ${bookingCode}%0A- *Nama*: ${name}%0A- *Usia*: ${age}%0A- *Program*: ${program}%0A- *Lokasi Kolam*: ${location}%0A- *Rencana Jadwal*: ${time}%0A%0AMohon info ketersediaan jadwal pelatihnya ya, terima kasih!`;
    document.getElementById('modalWaDirectBtn').href = `https://wa.me/6285196284611?text=${text}`;

    // 4. Tampilkan Modal & Reset Form
    document.getElementById('bookingSuccessModal').classList.remove('hidden');
    lucide.createIcons();
    document.getElementById('bookingForm').reset();
}

function closeBookingModal() {
    document.getElementById('bookingSuccessModal').classList.add('hidden');
}