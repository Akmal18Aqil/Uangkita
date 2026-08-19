// js/app.js
import { store } from './store.js';
import { api } from './api.js';
import { initRouter } from './router.js';
import { renderNavbar } from './components/navbar.js';
import { renderFAB } from './components/fab.js';
import { showBottomSheet } from './components/modal.js';
import { formatRupiah, formatDate, esc } from './utils.js';

function applyThemeUI(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');

    if (sunIcon && moonIcon) {
        sunIcon.style.display = theme === 'dark' ? 'block' : 'none';
        moonIcon.style.display = theme === 'dark' ? 'none' : 'block';
    }
}

// Hal-hal yang benar-benar perlu perhatian: tugas terlambat, tugas jatuh tempo
// hari ini, budget yang mepet, dan perubahan yang belum terkirim ke Sheet.
// Sebelumnya titik merah di lonceng selalu menyala tanpa arti apa pun.
function collectAlerts() {
    const alerts = [];
    const now = new Date();
    const tasks = store.get('tasks') || [];

    tasks.forEach(task => {
        if (task.Status === 'Done' || !task.Deadline) return;
        const due = new Date(task.Deadline);
        if (isNaN(due.getTime())) return;

        const hoursLeft = (due - now) / 36e5;
        if (hoursLeft < 0) {
            alerts.push({ icon: '⚠️', tone: 'danger', title: task.Judul, detail: `Terlambat sejak ${formatDate(task.Deadline)}`, href: '#/tasks' });
        } else if (hoursLeft <= 24) {
            alerts.push({ icon: '⏰', tone: 'warning', title: task.Judul, detail: `${Math.max(Math.round(hoursLeft), 1)} jam lagi · ${formatDate(task.Deadline)}`, href: '#/tasks' });
        }
    });

    const settings = store.get('settings') || {};
    const budget = parseFloat(settings.budget) || 0;
    if (budget > 0) {
        const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const spent = (store.get('transactions') || [])
            .filter(t => t.Tipe !== 'Pemasukan' && String(t.Tanggal).startsWith(monthPrefix))
            .reduce((sum, t) => sum + (parseFloat(t.Jumlah) || 0), 0);

        const usedPct = Math.round((spent / budget) * 100);
        if (usedPct >= 100) {
            alerts.push({ icon: '💸', tone: 'danger', title: 'Budget bulan ini terlampaui', detail: `${formatRupiah(spent)} dari ${formatRupiah(budget)}`, href: '#/analytics' });
        } else if (usedPct >= 80) {
            alerts.push({ icon: '📊', tone: 'warning', title: `Budget sudah terpakai ${usedPct}%`, detail: `Sisa ${formatRupiah(budget - spent)}`, href: '#/analytics' });
        }
    }

    if (api.isBackendOutdated()) {
        alerts.push({
            icon: '⚠️', tone: 'danger',
            title: 'Apps Script masih versi lama',
            detail: 'Sumber dana tidak tersimpan & transaksi bisa terlihat dobel. Deploy ulang backend.',
            href: '#/settings'
        });
    }

    const pending = api.pendingCount();
    if (pending > 0) {
        alerts.push({ icon: '☁️', tone: 'warning', title: `${pending} perubahan belum tersimpan ke Sheet`, detail: 'Akan dikirim otomatis saat online kembali', href: '#/settings' });
    }

    return alerts;
}

function updateNotifBadge() {
    const badge = document.getElementById('notif-badge');
    if (badge) badge.hidden = collectAlerts().length === 0;
}

function openNotifications() {
    const alerts = collectAlerts();

    const body = alerts.length === 0
        ? '<div class="empty-state"><div class="empty-icon">✅</div><p>Tidak ada yang perlu perhatian. Semua aman.</p></div>'
        : alerts.map(a => `
            <a class="notif-item notif-${a.tone}" href="${a.href}">
                <span class="notif-icon">${a.icon}</span>
                <span class="notif-body">
                    <span class="notif-title">${esc(a.title)}</span>
                    <span class="notif-detail">${esc(a.detail)}</span>
                </span>
            </a>
        `).join('');

    const permissionHint = ('Notification' in window && Notification.permission !== 'granted')
        ? '<button class="btn btn-secondary mt-md" id="btn-enable-push">Aktifkan notifikasi perangkat</button>'
        : '';

    const { close } = showBottomSheet(`<div class="notif-list">${body}</div>${permissionHint}`, 'Notifikasi');

    document.getElementById('bottom-sheet').addEventListener('click', (e) => {
        if (e.target.closest('.notif-item')) close();
    });

    const enableBtn = document.getElementById('btn-enable-push');
    if (enableBtn) {
        enableBtn.addEventListener('click', () => Notification.requestPermission().then(close));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const settings = store.get('settings') || {};
    applyThemeUI(settings.theme || 'light');

    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => applyThemeUI(store.toggleTheme()));
    }

    const avatar = document.getElementById('user-avatar');
    if (avatar) {
        const name = settings.userName || 'K';
        avatar.textContent = name.charAt(0).toUpperCase();
        avatar.title = name;
    }

    document.getElementById('btn-notifications').addEventListener('click', openNotifications);
    store.subscribe(updateNotifBadge);
    updateNotifBadge();

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        window.deferredPrompt = e;
    });

    renderNavbar();
    renderFAB();
    initRouter();
});
