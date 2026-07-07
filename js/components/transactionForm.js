// js/components/transactionForm.js
import { store } from '../store.js';
import { api } from '../api.js';
import { showBottomSheet } from './modal.js';
import { showToast } from './toast.js';
import { formatRupiah } from '../utils.js';

export function openTransactionForm(editData = null) {
    const isEdit = !!editData;
    const defaultDate = new Date().toISOString().split('T')[0];
    
    // Parse editData if available
    const formData = isEdit ? { ...editData } : {
        Tipe: 'Pengeluaran',
        Tanggal: defaultDate,
        Kategori: '',
        Jumlah: '',
        Catatan: '',
        Dompet: 'Dana'
    };
    
    const categories = store.get('categories');
    
    const formHtml = `
        <form id="tx-form" class="animate-fade-in">
            <div class="form-group">
                <div class="flex bg-surface rounded-md p-1" style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 4px;">
                    <button type="button" class="btn flex-1 tx-type-btn ${formData.Tipe === 'Pengeluaran' ? 'active-expense' : ''}" data-type="Pengeluaran" style="border-radius: 6px; padding: 8px; background: ${formData.Tipe === 'Pengeluaran' ? 'var(--danger)' : 'transparent'};">Pengeluaran</button>
                    <button type="button" class="btn flex-1 tx-type-btn ${formData.Tipe === 'Pemasukan' ? 'active-income' : ''}" data-type="Pemasukan" style="border-radius: 6px; padding: 8px; background: ${formData.Tipe === 'Pemasukan' ? 'var(--success)' : 'transparent'};">Pemasukan</button>
                </div>
                <input type="hidden" id="tx-tipe" value="${formData.Tipe}">
            </div>
            
            <div class="form-group">
                <label class="form-label">Jumlah</label>
                <input type="text" id="tx-jumlah-display" class="form-control" style="font-size: 24px; font-weight: bold; font-family: var(--font-mono);" placeholder="Rp 0" value="${formData.Jumlah ? formatRupiah(formData.Jumlah) : ''}">
                <input type="hidden" id="tx-jumlah" value="${formData.Jumlah}">
            </div>
            
            <div class="quick-amounts mb-md" id="quick-amounts">
                <div class="chip" data-val="10000">+10k</div>
                <div class="chip" data-val="20000">+20k</div>
                <div class="chip" data-val="50000">+50k</div>
                <div class="chip" data-val="100000">+100k</div>
                <div class="chip" data-val="clear" style="color: var(--danger); border-color: rgba(239, 68, 68, 0.3);">Reset</div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Tanggal</label>
                <input type="date" id="tx-tanggal" class="form-control" value="${formData.Tanggal.split('T')[0]}">
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
                <select id="tx-dompet" class="form-control" style="background: rgba(0,0,0,0.2);">
                    <option value="Dana" ${formData.Dompet === 'Dana' ? 'selected' : ''}>Dana</option>
                    <option value="Wondr" ${formData.Dompet === 'Wondr' ? 'selected' : ''}>Wondr</option>
                    <option value="ShopeePay" ${formData.Dompet === 'ShopeePay' ? 'selected' : ''}>ShopeePay</option>
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Catatan</label>
                <input type="text" id="tx-catatan" class="form-control" placeholder="Makan siang, bensin, dll..." value="${formData.Catatan}">
            </div>
            
            <button type="submit" class="btn btn-primary mt-md" id="tx-submit-btn">
                ${isEdit ? 'Simpan Perubahan' : 'Tambah Transaksi'}
            </button>
        </form>
    `;
    
    const { close } = showBottomSheet(formHtml, isEdit ? 'Edit Transaksi' : 'Transaksi Baru');
    
    // Attach logic
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
            
            // Re-attach cat clicks
            document.querySelectorAll('.category-item').forEach(el => {
                el.addEventListener('click', (e) => {
                    document.querySelectorAll('.category-item').forEach(c => c.classList.remove('selected'));
                    e.currentTarget.classList.add('selected');
                    catInput.value = e.currentTarget.dataset.name;
                });
            });
        };
        
        renderCategories(formData.Tipe);
        
        // Type toggler
        typeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                typeInput.value = type;
                
                typeBtns.forEach(b => {
                    b.style.background = 'transparent';
                    b.classList.remove('active-expense', 'active-income');
                });
                
                if (type === 'Pengeluaran') {
                    e.target.style.background = 'var(--danger)';
                    e.target.classList.add('active-expense');
                } else {
                    e.target.style.background = 'var(--success)';
                    e.target.classList.add('active-income');
                }
                
                // Reset category if type changed
                catInput.value = '';
                renderCategories(type);
            });
        });
        
        // Amount Logic
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
                const val = e.target.dataset.val;
                if (val === 'clear') {
                    amountInput.value = '';
                } else {
                    amountInput.value = (parseInt(amountInput.value || 0) + parseInt(val)).toString();
                }
                updateAmountDisplay(amountInput.value);
            });
        });
        
        // Form Submit
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const payload = {
                id: isEdit ? editData.ID : undefined,
                tanggal: document.getElementById('tx-tanggal').value,
                tipe: typeInput.value,
                kategori: catInput.value,
                jumlah: amountInput.value,
                catatan: document.getElementById('tx-catatan').value,
                dompet: document.getElementById('tx-dompet').value
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
                    showToast('Transaksi berhasil diupdate');
                } else {
                    const result = await api.fetch('addTransaction', payload);
                    store.addTransaction({
                        ID: result.id || Math.random().toString(), // fallback
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
                
                // Try refreshing current page view
                if (window.location.hash.includes('/transactions') || window.location.hash === '' || window.location.hash === '#/') {
                    const evt = new HashChangeEvent("hashchange");
                    window.dispatchEvent(evt);
                }
                
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
