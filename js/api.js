// js/api.js

const QUEUE_KEY = 'financeku_queue';
const MAX_ATTEMPTS = 5;

// Apps Script sering tidak terjangkau (HP offline, cold start timeout, kuota
// harian habis). Perubahan yang gagal dikirim disimpan dulu di sini lalu
// dikirim ulang, supaya transaksi yang sudah diketik user tidak hilang.
function readQueue() {
    try {
        const parsed = JSON.parse(localStorage.getItem(QUEUE_KEY));
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

function writeQueue(queue) {
    try {
        localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
        console.error('Gagal menyimpan antrean offline', e);
    }
}

export const api = {
    getAppScriptUrl() {
        // Try getting from store cache directly via localStorage to avoid circular deps
        const cached = localStorage.getItem('financeku_settings');
        if (cached) {
            try {
                const settings = JSON.parse(cached);
                if (settings.apiUrl) return settings.apiUrl;
            } catch (e) {}
        }

        return localStorage.getItem('financeku_apiUrl') || '';
    },

    pendingCount() {
        return readQueue().length;
    },

    // ID yang perubahannya masih menunggu dikirim ke Sheet. Dipakai store saat
    // menggabungkan data server: hanya baris yang benar-benar belum terkirim
    // yang boleh dipertahankan secara lokal, dan baris yang penghapusannya masih
    // diantre tidak boleh dihidupkan lagi oleh data server.
    pendingSync() {
        const unsent = new Set();
        const deleted = new Set();

        readQueue().forEach(job => {
            const id = job.payload && job.payload.id;
            if (!id) return;
            if (job.action === 'deleteTransaction' || job.action === 'deleteTask') deleted.add(String(id));
            else unsent.add(String(id));
        });

        return { unsent, deleted };
    },

    async send(action, payload) {
        const APPSCRIPT_URL = this.getAppScriptUrl();
        const options = {
            method: payload ? 'POST' : 'GET',
            mode: 'cors'
        };

        if (payload) {
            options.headers = { 'Content-Type': 'text/plain;charset=utf-8' }; // Apps script quirk
            options.body = JSON.stringify(payload);
        }

        const response = await fetch(`${APPSCRIPT_URL}?action=${action}`, options);
        const data = await response.json();

        if (data.status === 'error') {
            // Ditolak server (mis. id tidak ditemukan): mengirim ulang tidak akan
            // pernah berhasil, jadi jangan diantrekan.
            const err = new Error(data.message);
            err.appError = true;
            throw err;
        }

        return data.data;
    },

    async fetch(action, payload = null) {
        if (!this.getAppScriptUrl()) {
            console.warn('API URL belum di set. Menggunakan mock data.');
            return this.mockResponse(action);
        }

        try {
            const result = await this.send(action, payload);
            if (payload) this.flushQueue(); // koneksi hidup, coba kirim tunggakan
            return result;
        } catch (error) {
            if (payload && !error.appError) {
                const queue = readQueue();
                queue.push({ action, payload, attempts: 0, queuedAt: Date.now() });
                writeQueue(queue);
                console.warn(`Jaringan gagal, "${action}" diantrekan untuk dikirim ulang.`);
                return { queued: true };
            }
            console.error(`API Error (${action}):`, error);
            throw error;
        }
    },

    // Dikirim berurutan supaya update/delete tidak mendahului add-nya sendiri.
    async flushQueue() {
        if (this._flushing || !this.getAppScriptUrl()) return 0;
        const queue = readQueue();
        if (queue.length === 0) return 0;

        this._flushing = true;
        let sent = 0;
        try {
            while (queue.length > 0) {
                const job = queue[0];
                try {
                    await this.send(job.action, job.payload);
                    queue.shift();
                    sent++;
                } catch (error) {
                    if (error.appError || ++job.attempts >= MAX_ATTEMPTS) {
                        console.error(`Antrean "${job.action}" dibuang:`, error.message);
                        queue.shift();
                    } else {
                        break; // masih offline, sisanya coba lagi nanti
                    }
                }
                writeQueue(queue);
            }
            writeQueue(queue);
        } finally {
            this._flushing = false;
        }
        return sent;
    },

    // Mock for development before Apps Script is connected
    mockResponse(action) {
        return new Promise(resolve => {
            setTimeout(() => {
                // null untuk aksi baca supaya data cache tidak tertimpa array kosong.
                const readActions = ['getTransactions', 'getTasks', 'getCalendarEvents', 'getCategories'];
                resolve(readActions.includes(action) ? null : { success: true });
            }, 300);
        });
    }
};

if (typeof window !== 'undefined') {
    window.addEventListener('online', () => api.flushQueue());
    api.flushQueue();
}
