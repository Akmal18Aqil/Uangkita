// js/pages/tasks.js
import { store } from '../store.js';
import { api } from '../api.js';
import { formatDate } from '../utils.js';
import { openTaskForm } from '../components/taskForm.js';
import { showToast } from '../components/toast.js';
import { showBottomSheet } from '../components/modal.js';

export function render() {
    const container = document.createElement('div');
    container.className = 'animate-fade-in stagger-1';
    container.style.height = '100%';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    
    container.innerHTML = `
        <div class="section-header">
            <h3 class="section-title">Papan Tugas</h3>
            <div style="display: flex; gap: 8px;">
                <button class="btn btn-secondary" id="btn-view-agenda" style="width: auto; padding: 8px 12px; font-size: 13px;">
                    📅 Agenda
                </button>
                <button class="btn btn-primary" id="btn-add-task" style="width: auto; padding: 8px 16px; font-size: 13px;">
                    + Tambah
                </button>
            </div>
        </div>
        
        <div class="kanban-board" id="kanban-board" style="flex: 1;">
            <!-- Rendered by JS -->
        </div>
    `;
    
    setTimeout(() => {
        container.querySelector('#btn-add-task').addEventListener('click', () => {
            openTaskForm();
        });
        
        container.querySelector('#btn-view-agenda').addEventListener('click', async () => {
            const btn = container.querySelector('#btn-view-agenda');
            const originalText = btn.textContent;
            btn.textContent = '⏳ Sinkron...';
            btn.disabled = true;
            
            try {
                const events = await api.fetch('getCalendarEvents');
                btn.textContent = originalText;
                btn.disabled = false;
                
                if (!events || events.length === 0) {
                    showToast('Tidak ada agenda 1 bulan ke depan');
                    return;
                }
                
                // Simpan ke window agar bisa diakses fungsi import
                window.__currentAgendaEvents = events;
                const tasks = store.get('tasks') || [];
                
                const eventsHtml = events.map(ev => {
                    // Cek apakah agenda ini sudah ada di papan tugas (berdasarkan judul)
                    const isAlreadyTask = tasks.some(t => t.Judul === ev.title);
                    
                    return `
                        <div class="task-card" style="margin-bottom: 8px;">
                            <div class="task-title" style="color: var(--accent-primary); margin-bottom: 4px;">📌 ${ev.title}</div>
                            <div class="task-meta" style="margin-bottom: 6px;">
                                <span>Mulai: ${formatDate(ev.start)}</span>
                            </div>
                            <div class="task-meta">
                                <span>Selesai: ${formatDate(ev.end)}</span>
                            </div>
                            ${ev.desc ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.05);">${ev.desc}</div>` : ''}
                            
                            ${isAlreadyTask 
                                ? `<div style="margin-top: 12px; font-size: 11px; color: var(--success); font-weight: 500; text-align: center; background: rgba(16, 185, 129, 0.1); padding: 6px; border-radius: 4px;">✅ Sudah ada di Papan Tugas</div>`
                                : `<button onclick="window.importAgenda('${ev.id}', this)" class="btn btn-secondary" style="margin-top: 12px; padding: 6px; font-size: 12px; width: 100%;">+ Tambahkan ke To Do</button>`
                            }
                        </div>
                    `;
                }).join('');
                
                showBottomSheet(`<div style="display:flex; flex-direction:column; gap:8px;">${eventsHtml}</div>`, 'Agenda Google Kalender');
                
            } catch(e) {
                btn.textContent = originalText;
                btn.disabled = false;
                showToast('Gagal memuat agenda kalender', 'error');
            }
        });
        
        // Initial Fetch
        if (store.get('tasks').length === 0) {
            api.fetch('getTasks').then(data => {
                store.set('tasks', data);
                renderKanban(container);
            }).catch(e => {
                renderKanban(container);
            });
        } else {
            renderKanban(container);
        }
    }, 50);
    
    // Fungsi untuk memindahkan Agenda ke Papan Tugas
    window.importAgenda = async (agendaId, btnElement) => {
        const ev = window.__currentAgendaEvents.find(e => e.id === agendaId);
        if(!ev) return;
        
        btnElement.textContent = '⏳ Menambahkan...';
        btnElement.disabled = true;
        
        try {
            const payload = {
                judul: ev.title,
                deskripsi: (ev.desc || '') + '\n\n(Diimpor dari Google Kalender)',
                prioritas: 'High', 
                deadline: ev.start,
                syncCalendar: false, // Jangan buat kalender ganda
                status: 'Todo'
            };
            
            const result = await api.fetch('addTask', payload);
            
            const tasks = store.get('tasks');
            tasks.push({
                ID: result.id || Math.random().toString(),
                Judul: payload.judul,
                Deskripsi: payload.deskripsi,
                Prioritas: payload.prioritas,
                Status: payload.status,
                Deadline: payload.deadline
            });
            store.set('tasks', tasks);
            
            btnElement.textContent = '✅ Berhasil ditambahkan';
            btnElement.style.background = 'rgba(16, 185, 129, 0.2)';
            btnElement.style.color = 'var(--success)';
            btnElement.style.borderColor = 'transparent';
            
            // Reload halaman tugas agar muncul di papan
            setTimeout(() => {
                window.dispatchEvent(new HashChangeEvent("hashchange"));
            }, 1000);
            
        } catch (e) {
            btnElement.textContent = '+ Tambahkan ke To Do';
            btnElement.disabled = false;
            showToast('Gagal menambahkan tugas', 'error');
        }
    };
    
    window.editTask = (id) => {
        const tasks = store.get('tasks');
        const task = tasks.find(t => t.ID === id);
        if (task) openTaskForm(task);
    };
    
    window.deleteTask = async (id) => {
        if (!confirm('Apakah yakin ingin menghapus tugas ini?')) return;
        try {
            await api.fetch('deleteTask', { id });
            let tasks = store.get('tasks');
            tasks = tasks.filter(t => t.ID !== id);
            store.set('tasks', tasks);
            showToast('Tugas dihapus');
            renderKanban(container);
        } catch(e) {
            showToast('Gagal menghapus tugas', 'error');
        }
    };
    
    window.toggleTaskStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'Done' ? 'Todo' : 'Done';
        try {
            await api.fetch('updateTask', { id: id, status: newStatus });
            let tasks = store.get('tasks');
            const idx = tasks.findIndex(t => t.ID === id);
            if (idx > -1) {
                tasks[idx].Status = newStatus;
                store.set('tasks', tasks);
                renderKanban(container);
            }
        } catch(e) {
            showToast('Gagal update status', 'error');
        }
    };
    
    return container;
}

function renderKanban(container) {
    const board = container.querySelector('#kanban-board');
    let tasks = store.get('tasks') || [];
    
    // Tandai selesai otomatis untuk tugas yang sudah lewat tenggat waktunya
    const now = new Date();
    let hasOverdueUpdates = false;
    
    const updatedTasks = tasks.map(t => {
        if (t.Status !== 'Done' && t.Deadline) {
            const d = new Date(t.Deadline);
            if (d < now) {
                hasOverdueUpdates = true;
                api.fetch('updateTask', { id: t.ID, status: 'Done' }).catch(err => {
                    console.error('Failed to auto-update overdue task status in API', err);
                });
                return { ...t, Status: 'Done' };
            }
        }
        return t;
    });

    if (hasOverdueUpdates) {
        tasks = updatedTasks;
        store.set('tasks', updatedTasks);
    }
    
    const columns = [
        { id: 'Todo', label: 'To Do', color: 'var(--text-primary)' },
        { id: 'In Progress', label: 'In Progress', color: 'var(--warning)' },
        { id: 'Done', label: 'Done', color: 'var(--success)' }
    ];
    
    let html = '';
    
    columns.forEach(col => {
        const colTasks = tasks.filter(t => t.Status === col.id);
        
        let tasksHtml = colTasks.length > 0 ? colTasks.map(task => {
            // check deadline
            let isUrgent = false;
            let deadlineText = '';
            if (task.Deadline) {
                const d = new Date(task.Deadline);
                const now = new Date();
                const diffH = (d - now) / (1000 * 60 * 60);
                if (diffH > 0 && diffH <= 24) isUrgent = true;
                
                deadlineText = formatDate(task.Deadline);
            }
            
            const isDone = task.Status === 'Done';
            
            return `
                <div class="task-card ${isUrgent ? 'animate-pulse' : ''}" style="${isDone ? 'opacity: 0.6;' : ''}">
                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <input type="checkbox" ${isDone ? 'checked' : ''} onclick="window.toggleTaskStatus('${task.ID}', '${task.Status}')" style="margin-top: 4px; cursor: pointer;">
                        <div style="flex: 1;" onclick="window.editTask('${task.ID}')">
                            <div class="task-title" style="${isDone ? 'text-decoration: line-through;' : ''}">${task.Judul}</div>
                            ${task.Deskripsi ? `<div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${task.Deskripsi}</div>` : ''}
                            <div class="task-meta">
                                <span style="${isUrgent ? 'color: var(--danger); font-weight: 600;' : ''}">${deadlineText ? '⏳ ' + deadlineText : ''}</span>
                                <span class="priority-badge priority-${(task.Prioritas || 'medium').toLowerCase()}">${task.Prioritas || 'Medium'}</span>
                            </div>
                        </div>
                        <button onclick="event.stopPropagation(); window.deleteTask('${task.ID}')" class="icon-btn" style="width: 20px; height: 20px; padding: 0;">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--text-muted)" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('') : `
            <div class="empty-state" style="padding: 20px 0;">
                <p style="font-size: 12px;">Kosong</p>
            </div>
        `;
        
        html += `
            <div class="kanban-col">
                <div class="kanban-header">
                    <span style="color: ${col.color};">${col.label}</span> 
                    <span class="task-count">${colTasks.length}</span>
                </div>
                <div class="kanban-items" style="min-height: 100px;">
                    ${tasksHtml}
                </div>
            </div>
        `;
    });
    
    board.innerHTML = html;
}
