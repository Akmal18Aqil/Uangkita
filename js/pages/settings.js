// js/pages/settings.js
import { store } from '../store.js';
import { showToast } from '../components/toast.js';
import { showBottomSheet } from '../components/modal.js';

export function render() {
    const container = document.createElement('div');
    container.className = 'animate-fade-in stagger-1';
    
    const settings = store.get('settings');
    const categories = store.get('categories');
    
    container.innerHTML = `
        <div class="clean-card mb-md">
            <h3 class="mb-md">Profil Pengguna</h3>
            <div class="form-group">
                <label class="form-label">Nama Panggilan</label>
                <input type="text" id="setting-name" class="form-control" value="${settings.userName}">
            </div>
            <div class="form-group">
                <label class="form-label">Budget Bulanan (Target Maksimal Pengeluaran)</label>
                <input type="number" id="setting-budget" class="form-control" value="${settings.budget || ''}" placeholder="Contoh: 3000000">
            </div>
        </div>
        
        <div class="clean-card mb-md">
            <h3 class="mb-md">Notifikasi Perangkat</h3>
            <div class="form-group">
                <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">Pastikan browser/HP Anda mengizinkan notifikasi agar fitur pengingat tugas (Web Push) berfungsi.</p>
                <button class="btn btn-secondary" id="btn-check-notif" style="width: 100%;">Cek & Aktifkan Izin Notifikasi</button>
            </div>
        </div>
        
        <div class="clean-card mb-md">
            <h3 class="mb-md">Widget & Layar Utama</h3>
            <div class="form-group">
                <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">Tambahkan aplikasi & widget ke Beranda HP Anda untuk akses cepat ke Tugas Terdekat.</p>
                <button class="btn btn-primary" id="btn-add-widget" style="width: 100%; display: flex; justify-content: center; align-items: center; gap: 8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    Tambah ke Beranda (Widget)
                </button>
            </div>
        </div>
        
        <div class="clean-card mb-md">
            <h3 class="mb-md">Integrasi Apps Script</h3>
            <div class="form-group">
                <label class="form-label">Web App URL (API Endpoint)</label>
                <input type="text" id="setting-url" class="form-control" value="${settings.apiUrl || ''}" placeholder="https://script.google.com/macros/s/...">
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Kosongkan untuk menggunakan mock data (mode UI demo).</div>
            </div>
        </div>
        
        <div class="clean-card mb-md">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0;">Kategori Kustom</h3>
                <button class="btn btn-secondary" id="btn-add-cat" style="width: auto; padding: 4px 12px; font-size: 12px;">+ Kategori</button>
            </div>
            
            <div class="category-grid" id="settings-cat-grid" style="grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));">
                <!-- Injected via refresh -->
            </div>
        </div>
        
        <button class="btn btn-primary mt-sm mb-lg" id="btn-save-settings">Simpan Pengaturan</button>
        
        <div style="text-align: center; color: var(--text-muted); font-size: 12px; margin-top: 32px; padding-bottom: 20px;">
            <p>FinanceKu v1.0.0</p>
            <p>Dibuat untuk Akmal</p>
        </div>
    `;
    
    setTimeout(() => {
        refresh(container);
        
        // Logika Tombol Cek Notifikasi
        const btnNotif = container.querySelector('#btn-check-notif');
        if (btnNotif) {
            if ('Notification' in window) {
                if (Notification.permission === 'granted') {
                    btnNotif.textContent = 'Notifikasi Sudah Aktif ✅';
                    btnNotif.style.background = 'rgba(16, 185, 129, 0.2)';
                    btnNotif.style.color = 'var(--success)';
                }
                
                btnNotif.addEventListener('click', () => {
                    if (Notification.permission !== 'granted') {
                        Notification.requestPermission().then(permission => {
                            if (permission === 'granted') {
                                showToast('Izin notifikasi diberikan!');
                                btnNotif.textContent = 'Notifikasi Sudah Aktif ✅';
                                btnNotif.style.background = 'rgba(16, 185, 129, 0.2)';
                                btnNotif.style.color = 'var(--success)';
                            } else {
                                showToast('Izin notifikasi ditolak', 'error');
                            }
                        });
                    } else {
                        showToast('Notifikasi sudah aktif sebelumnya');
                    }
                });
            } else {
                btnNotif.textContent = 'Browser tidak mendukung';
                btnNotif.disabled = true;
            }
        }
        
        // Logika Tombol Add to Home Screen / Widget
        const btnAddWidget = container.querySelector('#btn-add-widget');
        if (btnAddWidget) {
            btnAddWidget.addEventListener('click', async () => {
                const promptEvent = window.deferredPrompt;
                if (!promptEvent) {
                    // Beri instruksi manual jika tidak bisa auto prompt (misal di Safari iOS atau sudah diinstall)
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                    if (isIOS) {
                        showToast('Untuk iOS: Ketuk ikon "Share" lalu "Add to Home Screen".', 'info');
                    } else {
                        showToast('Aplikasi sudah di-install, atau coba melalui menu opsi browser (Add to Home Screen).', 'info');
                    }
                    return;
                }
                // Show the install prompt
                promptEvent.prompt();
                // Wait for the user to respond to the prompt
                const { outcome } = await promptEvent.userChoice;
                if (outcome === 'accepted') {
                    showToast('Berhasil menambahkan Widget ke Beranda!', 'success');
                }
                // We've used the prompt, and can't use it again, throw it away
                window.deferredPrompt = null;
            });
        }
        
        const btnSave = container.querySelector('#btn-save-settings');
        btnSave.addEventListener('click', () => {
            const name = container.querySelector('#setting-name').value;
            const budget = container.querySelector('#setting-budget').value;
            const url = container.querySelector('#setting-url').value;
            
            store.set('settings', {
                ...settings,
                userName: name,
                budget: budget,
                apiUrl: url
            });
            
            // Also attempt to update the constant in api.js globally if possible, 
            // but since it's an ES module, modifying the global requires a window variable or reload
            localStorage.setItem('financeku_apiUrl', url);
            
            showToast('Pengaturan berhasil disimpan');
            
            // Update UI elements instantly
            const pageTitle = document.querySelector('.app-title');
            if (pageTitle && pageTitle.textContent === 'Dashboard') {
                const greet = document.querySelector('.greeting-text h2');
                if (greet) greet.textContent = `Halo, ${name}! 👋`;
            }
        });
        
        container.querySelector('#btn-add-cat').addEventListener('click', () => {
            const formHtml = `
                <div class="form-group">
                    <label class="form-label">Nama Kategori</label>
                    <input type="text" id="new-cat-name" class="form-control" placeholder="Cth: Kopi">
                </div>
                <div class="form-group">
                    <label class="form-label">Emoji Icon</label>
                    <input type="text" id="new-cat-icon" class="form-control" placeholder="Cth: ☕">
                </div>
                <div class="form-group">
                    <label class="form-label">Tipe</label>
                    <select id="new-cat-type" class="form-control">
                        <option value="Pengeluaran">Pengeluaran</option>
                        <option value="Pemasukan">Pemasukan</option>
                    </select>
                </div>
                <button class="btn btn-primary" id="btn-save-new-cat">Tambah</button>
            `;
            
            const { close } = showBottomSheet(formHtml, 'Tambah Kategori');
            
            setTimeout(() => {
                document.getElementById('btn-save-new-cat').addEventListener('click', () => {
                    const name = document.getElementById('new-cat-name').value;
                    const icon = document.getElementById('new-cat-icon').value;
                    const type = document.getElementById('new-cat-type').value;
                    
                    if (!name || !icon) {
                        showToast('Nama dan icon harus diisi', 'error');
                        return;
                    }
                    
                    const newCat = { id: 'cat-' + Date.now(), name, icon, type };
                    const currentCats = store.get('categories');
                    store.set('categories', [...currentCats, newCat]);
                    showToast('Kategori ditambahkan');
                    close();
                    
                    // Re-render settings page to show new category
                    if (window.location.hash === '#/settings') {
                        const evt = new HashChangeEvent("hashchange");
                        window.dispatchEvent(evt);
                    }
                });
            }, 100);
        });
    }, 50);
    
    return container;
}

export function refresh(container) {
    const grid = container.querySelector('#settings-cat-grid');
    if (grid) {
        const categories = store.get('categories') || [];
        grid.innerHTML = categories.map(c => `
            <div class="category-item" style="opacity: 1; cursor: default;">
                <div class="category-icon-wrapper" style="width: 40px; height: 40px; font-size: 18px;">${c.icon}</div>
                <div class="category-name" style="font-size: 10px;">${c.name}</div>
            </div>
        `).join('');
    }
}
