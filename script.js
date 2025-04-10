// Form steps navigation
const steps = document.querySelectorAll('.step');
const formSteps = document.querySelectorAll('.form-step');
const nextButtons = document.querySelectorAll('.next-step');
const prevButtons = document.querySelectorAll('.prev-step');
let currentStep = 0;

// Inisialisasi tanggal minimum (hari ini)
const today = new Date();
const todayFormatted = today.toISOString().split('T')[0];

// Setup input tanggal dengan jam
window.addEventListener('DOMContentLoaded', function() {
    // Ubah tipe input dari 'date' menjadi 'datetime-local'
    const tanggalSewa = document.getElementById('tanggal_sewa');
    const tanggalKembali = document.getElementById('tanggal_kembali');
    
    if(tanggalSewa && tanggalKembali) {
        // Ubah tipe input dan tambahkan minimum date
        tanggalSewa.type = 'datetime-local';
        tanggalKembali.type = 'datetime-local';
        
        // Set tanggal minimum ke hari ini
        const todayWithTime = today.toISOString().slice(0, 16);
        tanggalSewa.min = todayWithTime;
        tanggalKembali.min = todayWithTime;
        
        // Event listener untuk memastikan tanggal kembali > tanggal sewa
        tanggalSewa.addEventListener('change', function() {
            tanggalKembali.min = this.value;
            if(tanggalKembali.value && tanggalKembali.value < this.value) {
                tanggalKembali.value = this.value;
            }
        });
    }
});

// Update steps
function updateSteps(stepIndex) {
    steps.forEach((step, index) => {
        if (index <= stepIndex) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    formSteps.forEach((step, index) => {
        if (index === stepIndex) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    currentStep = stepIndex;
}

// Next step buttons
nextButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Simple validation for current step
        const currentFormStep = formSteps[currentStep];
        const inputs = currentFormStep.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value) {
                isValid = false;
                input.classList.add('is-invalid');
                
                // Tambahkan animasi shake untuk input yang tidak valid
                input.classList.add('animate__animated', 'animate__headShake');
                setTimeout(() => {
                    input.classList.remove('animate__animated', 'animate__headShake');
                }, 1000);
            } else {
                input.classList.remove('is-invalid');
            }
        });
        
        if (isValid) {
            updateSteps(currentStep + 1);
        } else {
            // Tampilkan pesan error jika ada field yang kosong
            const errorAlert = document.createElement('div');
            errorAlert.className = 'alert alert-danger mt-3 animate__animated animate__fadeIn';
            errorAlert.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i> Harap isi semua field yang wajib diisi';
            
            // Hapus pesan error sebelumnya jika ada
            const existingAlert = currentFormStep.querySelector('.alert.alert-danger');
            if (existingAlert) {
                existingAlert.remove();
            }
            
            currentFormStep.appendChild(errorAlert);
            
            // Hapus pesan error setelah 3 detik
            setTimeout(() => {
                errorAlert.classList.add('animate__fadeOut');
                setTimeout(() => {
                    errorAlert.remove();
                }, 500);
            }, 3000);
        }
    });
});

// Previous step buttons
prevButtons.forEach(button => {
    button.addEventListener('click', () => {
        updateSteps(currentStep - 1);
    });
});

// Check document checkboxes
const dokumenCheckboxes = document.querySelectorAll('input[name="dokumen"]');
const dokumenValidMessage = document.getElementById('dokumenValidMessage');
const dokumenInvalidMessage = document.getElementById('dokumenInvalidMessage');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');

function checkDokumenSelection() {
    const checked = Array.from(dokumenCheckboxes).filter(cb => cb.checked);
    if (checked.length >= 3) {
        dokumenValidMessage.style.display = 'block';
        dokumenInvalidMessage.style.display = 'none';
        return true;
    } else {
        dokumenValidMessage.style.display = 'none';
        if (checked.length > 0) {
            dokumenInvalidMessage.style.display = 'block';
        } else {
            dokumenInvalidMessage.style.display = 'none';
        }
        return false;
    }
}

dokumenCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', checkDokumenSelection);
});

// Ambil data checkbox yang dipilih
function getDokumenTerpilih() {
    const checked = Array.from(document.querySelectorAll('input[name="dokumen"]:checked'));
    return checked.map(item => item.value).join(', ');
}

// Format tanggal untuk pesan WhatsApp
function formatDateTimeForMessage(dateTimeString) {
    if (!dateTimeString) return '-';
    const dt = new Date(dateTimeString);
    return `${dt.toLocaleDateString('id-ID')} pukul ${dt.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}`;
}

// Form submission handler
document.getElementById('sewaForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    if (!checkDokumenSelection()) {
        dokumenInvalidMessage.style.display = 'block';
        return;
    }

    const submitButton = document.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Mengirim...';

    try {
        // Format data
        const formData = {
            nama: document.getElementById('nama').value,
            telepon: document.getElementById('telepon').value,
            alamat: document.getElementById('alamat').value,
            instagram: document.getElementById('instagram').value || '-',
            tiktok: document.getElementById('tiktok').value || '-',
            facebook: document.getElementById('facebook').value || '-',
            jenis_sewa: document.getElementById('jenis_sewa').value,
            tipe: document.getElementById('tipe').value,
            tanggal_sewa: document.getElementById('tanggal_sewa').value,
            tanggal_kembali: document.getElementById('tanggal_kembali').value,
            acara: document.getElementById('acara').value,
            dp: document.getElementById('dp').value,
            dokumen: getDokumenTerpilih()
        };

        // Siapkan pesan WhatsApp
        const whatsappNumber = '6281332346025';
        const message = `Halo saya ${formData.nama}\n\n*Detail Penyewaan:*\nNama: ${formData.nama}\nTelepon: ${formData.telepon}\nAlamat: ${formData.alamat}\n\n*Media Sosial:*\nInstagram: ${formData.instagram || '-'}\nTikTok: ${formData.tiktok || '-'}\nFacebook: ${formData.facebook || '-'}\n\n*Detail Barang:*\nJenis Sewa: ${formData.jenis_sewa}\nTipe: ${formData.tipe}\nTanggal Sewa: ${formatDateTimeForMessage(formData.tanggal_sewa)}\nTanggal Kembali: ${formatDateTimeForMessage(formData.tanggal_kembali)}\nUntuk Acara: ${formData.acara}\nDP: Rp ${formData.dp}\n\n*Dokumen Jaminan:*\n${formData.dokumen}\n\n*Catatan:*\n- Harap bawa dokumen asli\n- Belum DP = Belum booking\n\nTerima kasih`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // Kirim ke Google Sheets (tanpa menunggu respons)
        const scriptURL = 'https://script.google.com/macros/s/AKfycbzN-xbdK9iay_f5kmU7MF1-2JUjMUO4X6UK0FZ8QszvfIkIxig58prQdnTDZOM79_q0oQ/exec';
        fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        }).catch(error => console.error('Error:', error));
        
        // Reset form dan tampilkan pesan sukses
        document.getElementById('sewaForm').reset();
        
        // Bersihkan isi success message
        successMessage.innerHTML = '<i class="fas fa-check-circle me-2"></i> Formulir berhasil dikirim! Klik tombol di bawah untuk melanjutkan ke WhatsApp.';
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        updateSteps(0);
        
        // Tambahkan tombol WhatsApp setelah pesan sukses
        const redirectButton = document.createElement('button');
        redirectButton.innerHTML = '<i class="fab fa-whatsapp me-2"></i> Lanjutkan ke WhatsApp';
        redirectButton.className = 'btn btn-success mt-3 w-100 animate__animated animate__fadeIn';
        redirectButton.onclick = function() {
            window.location.href = whatsappLink;
        };
        
        // Tambahkan tombol ke pesan sukses
        successMessage.appendChild(redirectButton);

    } catch (error) {
        console.error('Error:', error);
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
});