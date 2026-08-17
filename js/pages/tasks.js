// js/pages/tasks.js
import { store } from '../store.js';
import { api } from '../api.js';
import { formatDate, esc } from '../utils.js';
import { openTaskForm } from '../components/taskForm.js';
import { showToast } from '../components/toast.js';
import { showBottomSheet, showConfirm } from '../components/modal.js';

const COLUMNS = [
    { id: 'Todo', label: 'To Do', color: 'var(--text-primary)' },
    { id: 'In Progress', label: 'In Progress', color: 'var(--warning)' },
    { id: 'Done', label: 'Done', color: 'var(--success)' }
];

export function render() {
    const container = document.createElement('div');
    container.className = 'animate-fade-in stagger-1 flex-col';
    container.style.height = '100%';

    container.innerHTML = `
        <div class="section-header">
            <h3 class="section-title">Papan Tugas</h3>
            <div style="display: flex; gap: 8px;">
                <button class="btn btn-secondary btn-inline" id="btn-view-agenda">📅 Agenda</button>
                <button class="btn btn-primary btn-inline" id="btn-add-task">+ Tambah</button>
            </div>
        </div>

        <div class="kanban-board" id="kanban-board"></div>
    `;

    container.querySelector('#btn-add-task').addEventListener('click', () => openTaskForm());
    container.querySelector('#btn-view-agenda').addEventListener('click', () => openAgenda(container));

    // Satu listener untuk seluruh papan: kartu tugas dirender ulang terus-menerus,
    // jadi memasang listener per kartu berarti kebocoran listener tiap refresh.
    const board = container.querySelector('#kanban-board');

    board.addEventListener('click', async (e) => {
        const card = e.target.closest('[data-task-id]');
        if (!card) return;
        const id = card.dataset.taskId;

        if (e.target.closest('[data-action="delete"]')) {
            if (!await showConfirm('Tugas ini akan dihapus permanen beserta pengingat kalendernya.', { title: 'Hapus Tugas?' })) return;
            try {
                await api.fetch('deleteTask', { id });
                store.set('tasks', (store.get('tasks') || []).filter(t => t.ID !== id));
                showToast('Tugas dihapus');
                renderKanban(container);
            } catch (err) {
                showToast('Gagal menghapus tugas', 'error');
            }
            return;
        }

        if (e.target.closest('[data-action="edit"]')) {
            const task = (store.get('tasks') || []).find(t => t.ID === id);
            if (task) openTaskForm(task);
        }
    });

    board.addEventListener('change', async (e) => {
        const select = e.target.closest('[data-action="status"]');
        if (!select) return;
        const id = select.closest('[data-task-id]').dataset.taskId;
        const newStatus = select.value;

        const tasks = store.get('tasks') || [];
        const idx = tasks.findIndex(t => t.ID === id);
        if (idx < 0) return;
        const previous = tasks[idx].Status;

        // Optimistic: papan langsung pindah, dikembalikan kalau server menolak.
        tasks[idx] = { ...tasks[idx], Status: newStatus };
        store.set('tasks', [...tasks]);
        renderKanban(container);

        try {
            await api.fetch('updateTask', { id, status: newStatus });
        } catch (err) {
            const rollback = store.get('tasks').map(t => (t.ID === id ? { ...t, Status: previous } : t));
            store.set('tasks', rollback);
            renderKanban(container);
            showToast('Gagal mengubah status tugas', 'error');
        }
    });

    if ((store.get('tasks') || []).length === 0) {
        api.fetch('getTasks')
            .then(data => {
                if (Array.isArray(data)) store.set('tasks', data);
            })
            .catch(err => console.error('Gagal memuat tugas', err))
            .finally(() => renderKanban(container));
    } else {
        renderKanban(container);
    }

    return container;
}

export function refresh(container) {
    renderKanban(container);
}

async function openAgenda(container) {
    const btn = container.querySelector('#btn-view-agenda');
    const originalText = btn.textContent;
    btn.textContent = '⏳ Sinkron...';
    btn.disabled = true;

    try {
        const events = await api.fetch('getCalendarEvents');
        if (!Array.isArray(events) || events.length === 0) {
            showToast('Tidak ada agenda 1 bulan ke depan');
            return;
        }

        const tasks = store.get('tasks') || [];
        const eventsHtml = events.map(ev => {
            const alreadyImported = tasks.some(t => t.Judul === ev.title);
            return `
                <div class="task-card" data-agenda-id="${esc(ev.id)}">
                    <div class="task-title" style="color: var(--accent-primary);">📌 ${esc(ev.title)}</div>
                    <div class="task-meta"><span>Mulai: ${formatDate(ev.start)}</span></div>
                    <div class="task-meta"><span>Selesai: ${formatDate(ev.end)}</span></div>
                    ${ev.desc ? `<div class="task-desc" style="margin-top: 6px; white-space: normal;">${esc(ev.desc)}</div>` : ''}
                    ${alreadyImported
                        ? `<div class="agenda-imported">✅ Sudah ada di Papan Tugas</div>`
                        : `<button class="btn btn-secondary" data-import style="margin-top: 12px; padding: 6px; font-size: 12px;">+ Tambahkan ke To Do</button>`}
                </div>
            `;
        }).join('');

        showBottomSheet(`<div style="display:flex; flex-direction:column; gap:8px;">${eventsHtml}</div>`, 'Agenda Google Kalender');

        document.getElementById('bottom-sheet').addEventListener('click', async (e) => {
            const importBtn = e.target.closest('[data-import]');
            if (!importBtn) return;
            const agendaId = importBtn.closest('[data-agenda-id]').dataset.agendaId;
            const ev = events.find(x => x.id === agendaId);
            if (!ev) return;

            importBtn.textContent = '⏳ Menambahkan...';
            importBtn.disabled = true;

            const payload = {
                judul: ev.title,
                deskripsi: `${ev.desc || ''}\n\n(Diimpor dari Google Kalender)`.trim(),
                prioritas: 'Medium',
                deadline: ev.start,
                syncCalendar: false, // event-nya sudah ada, jangan digandakan
                status: 'Todo'
            };

            try {
                const result = await api.fetch('addTask', payload);
                store.set('tasks', [...(store.get('tasks') || []), {
                    ID: result?.id || `local-${Date.now()}`,
                    Judul: payload.judul,
                    Deskripsi: payload.deskripsi,
                    Prioritas: payload.prioritas,
                    Status: payload.status,
                    Deadline: payload.deadline
                }]);
                importBtn.outerHTML = '<div class="agenda-imported">✅ Berhasil ditambahkan</div>';
                renderKanban(container);
            } catch (err) {
                importBtn.textContent = '+ Tambahkan ke To Do';
                importBtn.disabled = false;
                showToast('Gagal menambahkan tugas', 'error');
            }
        });
    } catch (e) {
        showToast('Gagal memuat agenda kalender', 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// Lewat tenggat bukan berarti selesai. Versi sebelumnya menandai tugas terlambat
// sebagai 'Done' lalu menghapusnya 2 hari kemudian, jadi tugas yang justru paling
// perlu dikerjakan menghilang sendiri.
function deadlineState(task) {
    if (!task.Deadline) return { text: '', className: '' };
    const due = new Date(task.Deadline);
    if (isNaN(due.getTime())) return { text: '', className: '' };

    const label = formatDate(task.Deadline);
    if (task.Status === 'Done') return { text: `✓ ${label}`, className: '' };

    const hoursLeft = (due - new Date()) / 36e5;
    if (hoursLeft < 0) return { text: `⚠ Terlambat · ${label}`, className: 'overdue' };
    if (hoursLeft <= 24) return { text: `⏳ ${Math.max(Math.round(hoursLeft), 1)} jam lagi · ${label}`, className: 'urgent' };
    return { text: `⏳ ${label}`, className: '' };
}

function renderKanban(container) {
    const board = container.querySelector('#kanban-board');
    if (!board) return;

    const tasks = store.get('tasks') || [];

    board.innerHTML = COLUMNS.map(col => {
        const colTasks = tasks
            .filter(t => (t.Status || 'Todo') === col.id)
            .sort((a, b) => (a.Deadline || '9999').localeCompare(b.Deadline || '9999'));

        const cards = colTasks.map(task => {
            const priority = (task.Prioritas || 'Medium');
            const deadline = deadlineState(task);

            return `
                <div class="task-card prio-${priority.toLowerCase()} ${deadline.className === 'overdue' ? 'is-overdue' : ''}" data-task-id="${esc(task.ID)}">
                    <div class="task-title" data-action="edit">${esc(task.Judul)}</div>
                    ${task.Deskripsi ? `<div class="task-desc">${esc(task.Deskripsi)}</div>` : ''}
                    <div class="task-meta">
                        <span class="task-deadline ${deadline.className}">${esc(deadline.text)}</span>
                        <span class="priority-badge priority-${priority.toLowerCase()}">${esc(priority)}</span>
                    </div>
                    <div class="task-meta" style="margin-top: 8px;">
                        <select class="task-status-select" data-action="status" aria-label="Ubah status tugas">
                            ${COLUMNS.map(c => `<option value="${c.id}" ${c.id === col.id ? 'selected' : ''}>${c.label}</option>`).join('')}
                        </select>
                        <button class="icon-btn" data-action="delete" aria-label="Hapus tugas" style="width: 26px; height: 26px;">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--danger)" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="kanban-col">
                <div class="kanban-header">
                    <span style="color: ${col.color};">${col.label}</span>
                    <span class="task-count">${colTasks.length}</span>
                </div>
                <div class="kanban-items">
                    ${cards || '<div class="empty-state" style="padding: 16px 0;"><p style="font-size: 12px;">Kosong</p></div>'}
                </div>
            </div>
        `;
    }).join('');
}
