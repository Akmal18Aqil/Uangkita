// js/components/taskForm.js
import { store } from '../store.js';
import { api } from '../api.js';
import { showBottomSheet } from './modal.js';
import { showToast } from './toast.js';

export function openTaskForm(editData = null) {
    const isEdit = !!editData;
    
    const formData = isEdit ? { ...editData } : {
        Judul: '',
        Deskripsi: '',
        Prioritas: 'Medium',
        Deadline: '',
        Kategori: 'Personal',
        Sync: true
    };
    
    // Ensure deadline is in right format for datetime-local
    let deadlineVal = '';
    if (formData.Deadline) {
        const d = new Date(formData.Deadline);
        if (!isNaN(d.getTime())) {
            // Adjust for local timezone offset to display correctly in input
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            deadlineVal = d.toISOString().slice(0, 16);
        }
    }
    
    const formHtml = `
        <form id="task-form" class="animate-fade-in">
            <div class="form-group">
                <label class="form-label">Judul Tugas</label>
                <input type="text" id="task-judul" class="form-control" placeholder="Mengerjakan laporan..." value="${formData.Judul}" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Deskripsi (Opsional)</label>
                <textarea id="task-deskripsi" class="form-control" rows="3" placeholder="Detail tugas...">${formData.Deskripsi}</textarea>
            </div>
            
            <div class="form-group">
                <label class="form-label">Prioritas</label>
                <div style="display: flex; gap: 8px;">
                    <label style="flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(16, 185, 129, 0.1); border: 1px solid ${formData.Prioritas === 'Low' ? 'var(--success)' : 'transparent'}; padding: 8px; border-radius: 6px; cursor: pointer;">
                        <input type="radio" name="prioritas" value="Low" style="display: none;" ${formData.Prioritas === 'Low' ? 'checked' : ''}>
                        <span style="color: var(--success); font-weight: 500; font-size: 14px;">Rendah</span>
                    </label>
                    <label style="flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(245, 158, 11, 0.1); border: 1px solid ${formData.Prioritas === 'Medium' ? 'var(--warning)' : 'transparent'}; padding: 8px; border-radius: 6px; cursor: pointer;">
                        <input type="radio" name="prioritas" value="Medium" style="display: none;" ${formData.Prioritas === 'Medium' || !formData.Prioritas ? 'checked' : ''}>
                        <span style="color: var(--warning); font-weight: 500; font-size: 14px;">Sedang</span>
                    </label>
                    <label style="flex: 1; display: flex; align-items: center; justify-content: center; background: rgba(239, 68, 68, 0.1); border: 1px solid ${formData.Prioritas === 'High' ? 'var(--danger)' : 'transparent'}; padding: 8px; border-radius: 6px; cursor: pointer;">
                        <input type="radio" name="prioritas" value="High" style="display: none;" ${formData.Prioritas === 'High' ? 'checked' : ''}>
                        <span style="color: var(--danger); font-weight: 500; font-size: 14px;">Tinggi</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Tenggat Waktu (Deadline)</label>
                <input type="datetime-local" id="task-deadline" class="form-control" value="${deadlineVal}">
            </div>
            
            <div class="form-group" style="display: flex; align-items: center; gap: 12px; margin-top: 16px;">
                <input type="checkbox" id="task-sync" ${formData.CalendarEventId || (!isEdit && formData.Sync) ? 'checked' : ''} style="width: 20px; height: 20px;">
                <label for="task-sync" class="form-label" style="margin: 0;">Sinkronisasi ke Google Calendar</label>
            </div>
            
            <button type="submit" class="btn btn-primary mt-md" id="task-submit-btn">
                ${isEdit ? 'Simpan Perubahan' : 'Tambah Tugas'}
            </button>
        </form>
    `;
    
    const { close } = showBottomSheet(formHtml, isEdit ? 'Edit Tugas' : 'Tugas Baru');
    
    setTimeout(() => {
        const form = document.getElementById('task-form');
        
        // Priority styling toggle
        const radios = document.querySelectorAll('input[name="prioritas"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                radios.forEach(r => r.parentElement.style.borderColor = 'transparent');
                const val = e.target.value;
                if (val === 'Low') e.target.parentElement.style.borderColor = 'var(--success)';
                if (val === 'Medium') e.target.parentElement.style.borderColor = 'var(--warning)';
                if (val === 'High') e.target.parentElement.style.borderColor = 'var(--danger)';
            });
        });
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.getElementById('task-submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Menyimpan...';
            submitBtn.disabled = true;
            
            const payload = {
                id: isEdit ? editData.ID : undefined,
                judul: document.getElementById('task-judul').value,
                deskripsi: document.getElementById('task-deskripsi').value,
                prioritas: document.querySelector('input[name="prioritas"]:checked').value,
                deadline: document.getElementById('task-deadline').value,
                syncCalendar: document.getElementById('task-sync').checked,
                status: isEdit ? editData.Status : 'Todo'
            };
            
            try {
                if (isEdit) {
                    await api.fetch('updateTask', payload);
                    
                    // update local store
                    const tasks = store.get('tasks');
                    const idx = tasks.findIndex(t => t.ID === payload.id);
                    if (idx > -1) {
                        tasks[idx] = { ...tasks[idx], ...{ 
                            Judul: payload.judul, 
                            Deskripsi: payload.deskripsi,
                            Prioritas: payload.prioritas,
                            Deadline: payload.deadline
                        }};
                        store.set('tasks', tasks);
                    }
                    showToast('Tugas berhasil diupdate');
                } else {
                    const result = await api.fetch('addTask', payload);
                    
                    const tasks = store.get('tasks');
                    tasks.push({
                        ID: result.id || Math.random().toString(),
                        Judul: payload.judul,
                        Deskripsi: payload.deskripsi,
                        Prioritas: payload.prioritas,
                        Status: payload.status,
                        Deadline: payload.deadline,
                        CalendarEventId: result.eventId
                    });
                    store.set('tasks', tasks);
                    showToast('Tugas berhasil ditambahkan');
                }
                
                if (window.location.hash === '#/tasks') {
                    const evt = new HashChangeEvent("hashchange");
                    window.dispatchEvent(evt);
                }
                
                close();
            } catch (error) {
                console.error(error);
                showToast('Gagal menyimpan tugas', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }, 100);
}
