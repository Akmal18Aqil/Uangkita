// js/pages/settings.js
import { store } from '../store.js';
import { api } from '../api.js';
import { formatRupiah, esc } from '../utils.js';
import { showToast } from '../components/toast.js';
import { showBottomSheet, showConfirm } from '../components/modal.js';
import { invalidateCache } from '../router.js';

export function render() {
    const container = document.createElement('div');
    container.className = 'animate-fade-in stagger-1';

    const settings = store.get('settings') || {};

    container.innerHTML = `
        <div class="clean-card mb-md">
            <h3 class="mb-md">Profil & Target</h3>
            <div class="form-group">
                <label class="form-label" for="setting-name">Nama Panggilan</label>
                <input type="text" id="setting-name" class="form-control" value="${esc(settings.userName || '')}">
            </div>
            <div class="form-group">
                <label class="form-label" for="setting-budget">Budget Bulanan (batas pengeluaran)</label>
                <input type="number" id="setting-budget" class="form-control" inputmode="numeric" min="0" value="${esc(settings.budget || '')}" placeholder="Contoh: 3000000">
                <small class="form-hint">Dipakai untuk progres budget di Dashboard & Analitik.</small>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="setting-target">Target Tabungan &amp; Investasi</label>
                <input type="number" id="setting-target" class="form-control" inputmode="numeric" min="0" value="${esc(settings.targetSavings || '')}" placeholder="Contoh: 20000000">
                <small class="form-hint">Progres dihitung dari transaksi berkategori Tabungan &amp; Investasi.</small>
            </div>
        </div>

        <div class="clean-card mb-md">
            <div class="section-header">
                <h3 style="margin: 0;">Dompet & Saldo Awal</h3>
                <button class="btn btn-secondary btn-inline" id="btn-add-wallet">+ Dompet</button>
            </div>
            <small class="form-hint" style="display: block; margin-bottom: 12px;">
                Isi saldo yang sudah ada di tiap dompet sebelum mulai mencatat, supaya saldo di Dashboard tidak minus.
            </small>
            <div id="wallet-list" class="wallet-editor"></div>
        </div>

        <div class="clean-card mb-md">
            <div class="section-header">
                <h3 style="margin: 0;">Kategori</h3>
                <button class="btn btn-secondary btn-inline" id="btn-add-cat">+ Kategori</button>
            </div>
            <div class="category-grid" id="settings-cat-grid" style="grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));"></div>
            <small class="form-hint">Ketuk kategori untuk menghapus. Kategori yang masih dipakai transaksi tidak bisa dihapus.</small>
        </div>

        <div class="clean-card mb-md">
            <h3 class="mb-md">Integrasi Apps Script</h3>
            <div class="form-group">
                <label class="form-label" for="setting-url">Web App URL (API Endpoint)</label>
                <input type="url" id="setting-url" class="form-control" value="${esc(settings.apiUrl || '')}" placeholder="https://script.google.com/macros/s/...">
                <small class="form-hint">Kosongkan untuk memakai mode demo tanpa backend.</small>
            </div>
            <div class="sync-row">
                <button class="btn btn-secondary btn-inline" id="btn-test-api">Tes Koneksi</button>
                <span id="queue-status" class="form-hint"></span>
            </div>
        </div>

        <div class="clean-card mb-md">
            <h3 class="mb-md">Notifikasi & Widget</h3>
            <button class="btn btn-secondary mb-sm" id="btn-check-notif">Cek &amp; Aktifkan Izin Notifikasi</button>
            <button class="btn btn-primary" id="btn-add-widget">Tambah ke Beranda (Install App)</button>
        </div>

        <button class="btn btn-primary mt-sm" id="btn-save-settings">Simpan Pengaturan</button>
        <button class="btn btn-secondary mt-sm mb-lg" id="btn-reset-cache">Bersihkan Cache Lokal</button>

        <div class="app-footer-note">
            <p>FinanceKu v1.1.0</p>
            <p>Data tersimpan di Google Sheet milik Anda sendiri.</p>
        </div>
    `;

    refresh(container);
    bindEvents(container);

    return container;
}

export function refresh(container) {
    renderWallets(container);
    renderCategories(container);
    renderQueueStatus(container);
}

function usageCount(predicate) {
    return (store.get('transactions') || []).filter(predicate).length;
}

function renderWallets(container) {
    const list = container.querySelector('#wallet-list');
    if (!list) return;

    const wallets = store.get('wallets') || [];
    list.innerHTML = wallets.map((w, idx) => {
        const used = usageCount(t => t.Dompet === w.name);
        return `
            <div class="wallet-row" data-wallet-idx="${idx}">
                <span class="wallet-row-icon">${esc(w.icon)}</span>
                <div class="wallet-row-main">
                    <span class="wallet-row-name">${esc(w.name)}</span>
                    <span class="form-hint">${used} transaksi</span>
                </div>
                <input type="number" class="form-control wallet-opening" inputmode="numeric"
                       value="${Number(w.opening) || 0}" aria-label="Saldo awal ${esc(w.name)}">
                <button class="icon-btn" data-action="remove-wallet" aria-label="Hapus dompet ${esc(w.name)}" ${used > 0 ? 'disabled' : ''}>×</button>
            </div>
        `;
    }).join('') || '<p class="form-hint">Belum ada dompet.</p>';
}

function renderCategories(container) {
    const grid = container.querySelector('#settings-cat-grid');
    if (!grid) return;

    grid.innerHTML = (store.get('categories') || []).map((c, idx) => `
        <div class="category-item" data-cat-idx="${idx}" style="opacity: 1;" role="button" tabindex="0"
             title="${esc(c.name)} (${esc(c.type)})">
            <div class="category-icon-wrapper" style="width: 40px; height: 40px; font-size: 18px;">${esc(c.icon)}</div>
            <div class="category-name" style="font-size: 10px;">${esc(c.name)}</div>
        </div>
    `).join('');
}

function renderQueueStatus(container) {
    const el = container.querySelector('#queue-status');
    if (!el) return;
    const pending = api.pendingCount();
    el.textContent = pending > 0
        ? `⏳ ${pending} perubahan menunggu dikirim ke Sheet`
        : '✓ Semua perubahan tersimpan';
    el.style.color = pending > 0 ? 'var(--warning)' : 'var(--success)';
}

function bindEvents(container) {
    container.querySelector('#btn-save-settings').addEventListener('click', () => {
        const url = container.querySelector('#setting-url').value.trim();
        if (url && !/^https:\/\/script\.google\.com\//.test(url)) {
            return showToast('URL harus berupa link Apps Script (https://script.google.com/...)', 'error');
        }

        store.set('settings', {
            ...store.get('settings'),
            userName: container.querySelector('#setting-name').value.trim() || 'Kamu',
            budget: container.querySelector('#setting-budget').value,
            targetSavings: container.querySelector('#setting-target').value,
            apiUrl: url
        });

        // Saldo awal dibaca dari input yang sedang tampil supaya satu tombol simpan
        // menyimpan seluruh halaman, bukan sebagian.
        const wallets = (store.get('wallets') || []).map((w, idx) => {
            const input = container.querySelector(`[data-wallet-idx="${idx}"] .wallet-opening`);
            return { ...w, opening: input ? Number(input.value) || 0 : w.opening };
        });
        store.set('wallets', wallets);

        localStorage.setItem('financeku_apiUrl', url);
        store.flush();

        showToast('Pengaturan berhasil disimpan');
        invalidateCache();
        renderQueueStatus(container);
    });

    container.querySelector('#btn-add-wallet').addEventListener('click', () => {
        const { close } = showBottomSheet(`
            <div class="form-group">
                <label class="form-label" for="new-wallet-name">Nama Dompet</label>
                <input type="text" id="new-wallet-name" class="form-control" placeholder="Cth: BCA">
            </div>
            <div class="form-group">
                <label class="form-label" for="new-wallet-icon">Emoji</label>
                <input type="text" id="new-wallet-icon" class="form-control" placeholder="Cth: 🏧" maxlength="4">
            </div>
            <div class="form-group">
                <label class="form-label" for="new-wallet-opening">Saldo Awal</label>
                <input type="number" id="new-wallet-opening" class="form-control" inputmode="numeric" value="0">
            </div>
            <button class="btn btn-primary" id="btn-save-wallet">Tambah Dompet</button>
        `, 'Tambah Dompet');

        document.getElementById('btn-save-wallet').addEventListener('click', () => {
            const name = document.getElementById('new-wallet-name').value.trim();
            const icon = document.getElementById('new-wallet-icon').value.trim() || '👛';
            const opening = Number(document.getElementById('new-wallet-opening').value) || 0;

            if (!name) return showToast('Nama dompet harus diisi', 'error');
            if ((store.get('wallets') || []).some(w => w.name.toLowerCase() === name.toLowerCase())) {
                return showToast('Dompet dengan nama itu sudah ada', 'error');
            }

            store.set('wallets', [...store.get('wallets'), { name, icon, opening }]);
            showToast('Dompet ditambahkan');
            close();
            renderWallets(container);
        });
    });

    container.querySelector('#wallet-list').addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-action="remove-wallet"]');
        if (!btn || btn.disabled) return;
        const idx = Number(btn.closest('[data-wallet-idx]').dataset.walletIdx);
        const wallets = store.get('wallets');
        if (!await showConfirm(`Hapus dompet "${esc(wallets[idx].name)}"?`, { title: 'Hapus Dompet?' })) return;

        store.set('wallets', wallets.filter((_, i) => i !== idx));
        showToast('Dompet dihapus');
        renderWallets(container);
        invalidateCache();
    });

    container.querySelector('#settings-cat-grid').addEventListener('click', async (e) => {
        const item = e.target.closest('[data-cat-idx]');
        if (!item) return;
        const idx = Number(item.dataset.catIdx);
        const categories = store.get('categories');
        const category = categories[idx];

        const used = usageCount(t => t.Kategori === category.name);
        if (used > 0) return showToast(`"${category.name}" masih dipakai ${used} transaksi`, 'error');
        if (!await showConfirm(`Hapus kategori "${esc(category.name)}"?`, { title: 'Hapus Kategori?' })) return;

        store.set('categories', categories.filter((_, i) => i !== idx));
        showToast('Kategori dihapus');
        renderCategories(container);
    });

    container.querySelector('#btn-add-cat').addEventListener('click', () => {
        const { close } = showBottomSheet(`
            <div class="form-group">
                <label class="form-label" for="new-cat-name">Nama Kategori</label>
                <input type="text" id="new-cat-name" class="form-control" placeholder="Cth: Kopi">
            </div>
            <div class="form-group">
                <label class="form-label" for="new-cat-icon">Emoji Icon</label>
                <input type="text" id="new-cat-icon" class="form-control" placeholder="Cth: ☕" maxlength="4">
            </div>
            <div class="form-group">
                <label class="form-label" for="new-cat-type">Tipe</label>
                <select id="new-cat-type" class="form-control">
                    <option value="Pengeluaran">Pengeluaran</option>
                    <option value="Pemasukan">Pemasukan</option>
                </select>
            </div>
            <button class="btn btn-primary" id="btn-save-new-cat">Tambah</button>
        `, 'Tambah Kategori');

        document.getElementById('btn-save-new-cat').addEventListener('click', () => {
            const name = document.getElementById('new-cat-name').value.trim();
            const icon = document.getElementById('new-cat-icon').value.trim();
            const type = document.getElementById('new-cat-type').value;

            if (!name || !icon) return showToast('Nama dan icon harus diisi', 'error');
            if (store.get('categories').some(c => c.name === name && c.type === type)) {
                return showToast('Kategori itu sudah ada', 'error');
            }

            store.set('categories', [...store.get('categories'), { id: `cat-${Date.now()}`, name, icon, type }]);
            showToast('Kategori ditambahkan');
            close();
            renderCategories(container);
        });
    });

    container.querySelector('#btn-test-api').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        const url = container.querySelector('#setting-url').value.trim();
        if (!url) return showToast('Isi Web App URL terlebih dahulu', 'error');

        // Diuji dari nilai yang sedang diketik, bukan yang tersimpan, supaya user
        // bisa memverifikasi URL sebelum menyimpannya.
        localStorage.setItem('financeku_apiUrl', url);
        btn.disabled = true;
        btn.textContent = 'Menguji...';
        try {
            const data = await api.send('getTransactions', null);
            showToast(`Terhubung. ${Array.isArray(data) ? data.length : 0} transaksi di Sheet.`);
            const sent = await api.flushQueue();
            if (sent > 0) showToast(`${sent} perubahan tertunda berhasil dikirim`);
        } catch (err) {
            showToast(`Gagal terhubung: ${err.message}`, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Tes Koneksi';
            renderQueueStatus(container);
        }
    });

    const btnNotif = container.querySelector('#btn-check-notif');
    if (!('Notification' in window)) {
        btnNotif.textContent = 'Browser tidak mendukung notifikasi';
        btnNotif.disabled = true;
    } else {
        const markGranted = () => {
            btnNotif.textContent = 'Notifikasi Sudah Aktif ✅';
            btnNotif.style.color = 'var(--success)';
        };
        if (Notification.permission === 'granted') markGranted();
        btnNotif.addEventListener('click', async () => {
            if (Notification.permission === 'granted') return showToast('Notifikasi sudah aktif');
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                markGranted();
                showToast('Izin notifikasi diberikan!');
            } else {
                showToast('Izin notifikasi ditolak', 'error');
            }
        });
    }

    container.querySelector('#btn-add-widget').addEventListener('click', async () => {
        const promptEvent = window.deferredPrompt;
        if (!promptEvent) {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            return showToast(isIOS
                ? 'iOS: ketuk ikon Share lalu "Add to Home Screen".'
                : 'Aplikasi sudah terpasang, atau gunakan menu browser "Add to Home Screen".', 'info');
        }
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') showToast('Berhasil ditambahkan ke Beranda!');
        window.deferredPrompt = null;
    });

    container.querySelector('#btn-reset-cache').addEventListener('click', async () => {
        const pending = api.pendingCount();
        const warning = pending > 0
            ? `Ada ${pending} perubahan yang BELUM terkirim ke Google Sheet dan akan hilang. `
            : '';
        if (!await showConfirm(
            `${warning}Cache lokal akan dihapus dan data diambil ulang dari Google Sheet.`,
            { title: 'Bersihkan Cache?', confirmLabel: 'Bersihkan' }
        )) return;

        ['transactions', 'tasks', 'categories', 'wallets', 'queue'].forEach(k => localStorage.removeItem(`financeku_${k}`));
        location.reload();
    });
}
