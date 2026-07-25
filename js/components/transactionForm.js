// js/components/transactionForm.js
import { store } from '../store.js';
import { api } from '../api.js';
import { showBottomSheet } from './modal.js';
import { showToast } from './toast.js';
import { formatRupiah } from '../utils.js';

export function openTransactionForm(editData = null) {
    const isEdit = !!editData && !!editData.ID;
    const defaultDate = new Date().toISOString().split('T')[0];
    
    const formData = {
        Tipe: editData?.Tipe || 'Pengeluaran',
        Tanggal: editData?.Tanggal ? editData.Tanggal.split('T')[0] : defaultDate,
        Kategori: editData?.Kategori || '',
        Jumlah: editData?.Jumlah || '',
        Catatan: editData?.Catatan || '',
        Dompet: editData?.Dompet || 'Tunai'
    };
    
    const categories = store.get('categories') || [];
    
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
                    <option value="Tunai" ${formData.Dompet === 'Tunai' ? 'selected' : ''}>💵 Tunai</option>
                    <option value="Dana" ${formData.Dompet === 'Dana' ? 'selected' : ''}>🔵 Dana</option>
                    <option value="Wondr" ${formData.Dompet === 'Wondr' ? 'selected' : ''}>🟢 Wondr</option>
                    <option value="ShopeePay" ${formData.Dompet === 'ShopeePay' ? 'selected' : ''}>🟠 ShopeePay</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Catatan / Keterangan</label>
                <input type="text" id="tx-catatan" class="form-control" placeholder="Makan siang, bensin, iPhone purchase, dll..." value="${formData.Catatan}">
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
                <div class="category-item ${c.name === catInput.value ? 'selected' : ''}" data-name="${c.name}">
                    <div class="category-icon-wrapper">${c.icon}</div>
                    <div class="category-name">${c.name}</div>
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
            
            const dompetVal = document.getElementById('tx-dompet').value || 'Tunai';
            const nowIso = new Date().toISOString();
            const payload = {
                id: isEdit ? (editData.ID || editData.id) : undefined,
                ID: isEdit ? (editData.ID || editData.id) : undefined,
                tanggal: document.getElementById('tx-tanggal').value,
                Tanggal: document.getElementById('tx-tanggal').value,
                tipe: typeInput.value,
                Tipe: typeInput.value,
                kategori: catInput.value,
                Kategori: catInput.value,
                jumlah: parseInt(amountInput.value, 10) || 0,
                Jumlah: parseInt(amountInput.value, 10) || 0,
                catatan: document.getElementById('tx-catatan').value,
                Catatan: document.getElementById('tx-catatan').value,
                
                // Wallet property aliases
                dompet: dompetVal,
                Dompet: dompetVal,
                wallet: dompetVal,
                Wallet: dompetVal,
                sumberDana: dompetVal,
                
                // Timestamp property aliases
                dibuatPada: nowIso,
                'Dibuat Pada': nowIso,
                createdAt: nowIso,
                created_at: nowIso,
                timestamp: nowIso
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
                        Dompet: payload.dompet
                    });
                    showToast('Transaksi berhasil diperbarui');
                } else {
                    const result = await api.fetch('addTransaction', payload);
                    store.addTransaction({
                        ID: result?.id || ('local-' + Date.now()),
                        Tanggal: payload.tanggal,
                        Tipe: payload.tipe,
                        Kategori: payload.kategori,
                        Jumlah: payload.jumlah,
                        Catatan: payload.catatan,
                        Dompet: payload.dompet,
                        'Dibuat Pada': new Date().toISOString()
                    });
                    showToast('Transaksi berhasil ditambahkan');
                }
                
                const evt = new HashChangeEvent("hashchange");
                window.dispatchEvent(evt);
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
