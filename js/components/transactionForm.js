// js/components/transactionForm.js
import { store } from '../store.js';
import { api } from '../api.js';
import { showBottomSheet } from './modal.js';
import { showToast } from './toast.js';
import { formatRupiah, todayISO, generateUUID, esc } from '../utils.js';
import { invalidateCache } from '../router.js';

export function openTransactionForm(editData = null) {
    const isEdit = !!editData && !!editData.ID;
    const defaultDate = todayISO();

    const formData = {
        Tipe: editData?.Tipe || 'Pengeluaran',
        Tanggal: editData?.Tanggal ? editData.Tanggal.split('T')[0] : defaultDate,
        Kategori: editData?.Kategori || '',
        Jumlah: editData?.Jumlah || '',
        Catatan: editData?.Catatan || '',
        Dompet: editData?.Dompet || 'Tunai'
    };
    
    const categories = store.get('categories') || [];
    const wallets = store.get('wallets') || [];

    const formHtml = `
        <form id="tx-form" class="animate-fade-in flex-col gap-md">
            <!-- Segmented Control Type Switcher -->
            <div class="segmented-control">
                <div class="segmented-item tx-type-btn ${formData.Tipe === 'Pengeluaran' ? 'active' : ''}" data-type="Pengeluaran">
                    <span>↘</span> Pengeluaran
                </div>
                <div class="segmented-item tx-type-btn ${formData.Tipe === 'Pemasukan' ? 'active' : ''}" data-type="Pemasukan">
                    <span>↗</span> Pemasukan
                </div>
            </div>
            <input type="hidden" id="tx-tipe" value="${formData.Tipe}">
            
            <div class="form-group">
                <label class="form-label">Nominal (Jumlah)</label>
                <input type="text" id="tx-jumlah-display" class="form-control amount" style="font-size: 26px; font-weight: 700; text-align: center;" placeholder="Rp 0" value="${formData.Jumlah ? formatRupiah(formData.Jumlah) : ''}">
                <input type="hidden" id="tx-jumlah" value="${formData.Jumlah}">
            </div>
            
            <div class="quick-amounts" id="quick-amounts">
                <div class="chip" data-val="10000">+10k</div>
                <div class="chip" data-val="20000">+20k</div>
                <div class="chip" data-val="50000">+50k</div>
                <div class="chip" data-val="100000">+100k</div>
                <div class="chip" data-val="clear" style="color: var(--danger);">Reset</div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Tanggal Transaksi</label>
                <input type="date" id="tx-tanggal" class="form-control" value="${formData.Tanggal}">
            </div>
            
            <div class="form-group">
                <label class="form-label">Kategori</label>
                <div class="category-grid" id="category-grid">
                    <!-- Injected by JS -->
                </div>
                <input type="hidden" id="tx-kategori" value="${formData.Kategori}">
            </div>
            
            <div class="form-group">
                <label class="form-label">Sumber Dana / Dompet</label>
                <select id="tx-dompet" class="form-control">
                    ${wallets.map(w => `<option value="${esc(w.name)}" ${formData.Dompet === w.name ? 'selected' : ''}>${esc(w.icon)} ${esc(w.name)}</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Catatan / Keterangan</label>
                <input type="text" id="tx-catatan" class="form-control" placeholder="Makan siang, bensin, iPhone purchase, dll..." value="${esc(formData.Catatan)}">
            </div>
            
            <button type="submit" class="btn btn-primary mt-sm" id="tx-submit-btn">
                ${isEdit ? 'Simpan Perubahan' : 'Tambah Transaksi'}
            </button>
        </form>
    `;
    
    const { close } = showBottomSheet(formHtml, isEdit ? 'Edit Transaksi' : 'Transaksi Baru');
    
    setTimeout(() => {
        const form = document.getElementById('tx-form');
        const typeBtns = document.querySelectorAll('.tx-type-btn');
        const typeInput = document.getElementById('tx-tipe');
        const catGrid = document.getElementById('category-grid');
        const catInput = document.getElementById('tx-kategori');
        
        const renderCategories = (type) => {
            const filteredCats = categories.filter(c => c.type === type);
            catGrid.innerHTML = filteredCats.map(c => `
                <div class="category-item ${c.name === catInput.value ? 'selected' : ''}" data-name="${esc(c.name)}">
                    <div class="category-icon-wrapper">${esc(c.icon)}</div>
                    <div class="category-name">${esc(c.name)}</div>
                </div>
            `).join('');
            
            document.querySelectorAll('.category-item').forEach(el => {
                el.addEventListener('click', (e) => {
                    document.querySelectorAll('.category-item').forEach(c => c.classList.remove('selected'));
                    e.currentTarget.classList.add('selected');
                    catInput.value = e.currentTarget.dataset.name;
                });
            });
        };
        
        renderCategories(formData.Tipe);
        
        typeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                typeInput.value = type;
                typeBtns.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                catInput.value = '';
                renderCategories(type);
            });
        });
        
        const amountDisplay = document.getElementById('tx-jumlah-display');
        const amountInput = document.getElementById('tx-jumlah');
        
        const updateAmountDisplay = (val) => {
            if (!val) {
                amountDisplay.value = '';
                return;
            }
            amountDisplay.value = formatRupiah(val);
        };
        
        amountDisplay.addEventListener('input', (e) => {
            let val = e.target.value.replace(/[^0-9]/g, '');
            amountInput.value = val;
            updateAmountDisplay(val);
        });
        
        document.querySelectorAll('#quick-amounts .chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const val = e.currentTarget.dataset.val;
                if (val === 'clear') {
                    amountInput.value = '';
                } else {
                    amountInput.value = (parseInt(amountInput.value || 0) + parseInt(val)).toString();
                }
                updateAmountDisplay(amountInput.value);
            });
        });
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const rawCatatan = document.getElementById('tx-catatan').value.trim();
            // Ensure catatan is never empty string "" so Google Apps Script array columns never shift!
            const catatanVal = rawCatatan || '-'; 
            
            const dompetSelect = document.getElementById('tx-dompet');
            const dompetVal = (dompetSelect && dompetSelect.value) ? dompetSelect.value.trim() : 'Tunai';
            const nowIso = new Date().toISOString();
            
            // ID dibuat di klien supaya kiriman ulang dari antrean offline tidak
            // membuat baris ganda: Apps Script menolak ID yang sudah ada.
            const txId = isEdit ? (editData.ID || editData.id) : generateUUID();

            const payload = {
                id: txId,
                tanggal: document.getElementById('tx-tanggal').value,
                tipe: typeInput.value,
                kategori: catInput.value,
                jumlah: parseInt(amountInput.value, 10) || 0,
                catatan: catatanVal,
                dompet: dompetVal,
                dibuatPada: nowIso
            };

            if (!payload.jumlah || payload.jumlah <= 0) {
                showToast('Jumlah transaksi harus lebih dari 0', 'error');
                return;
            }
            if (!payload.kategori) {
                showToast('Pilih kategori transaksi', 'error');
                return;
            }
            
            const submitBtn = document.getElementById('tx-submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Menyimpan...';
            submitBtn.disabled = true;
            
            try {
                if (isEdit) {
                    await api.fetch('updateTransaction', payload);
                    store.updateTransaction(payload.id, {
                        Tanggal: payload.tanggal,
                        Tipe: payload.tipe,
                        Kategori: payload.kategori,
                        Jumlah: payload.jumlah,
                        Catatan: payload.catatan,
                        Dompet: dompetVal
                    });
                    showToast('Transaksi berhasil diperbarui');
                } else {
                    await api.fetch('addTransaction', payload);
                    store.addTransaction({
                        ID: txId,
                        Tanggal: payload.tanggal,
                        Tipe: payload.tipe,
                        Kategori: payload.kategori,
                        Jumlah: payload.jumlah,
                        Catatan: payload.catatan,
                        Dompet: dompetVal,
                        'Dibuat Pada': nowIso
                    });
                    showToast('Transaksi berhasil ditambahkan');
                }

                // Segarkan semua halaman yang sudah pernah dibuka, bukan hanya
                // yang aktif, supaya dashboard tidak menampilkan angka basi.
                invalidateCache();
                close();
            } catch (error) {
                console.error(error);
                showToast('Gagal menyimpan transaksi', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }, 100);
}
