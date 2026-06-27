// js/api.js

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
    
    async fetch(action, payload = null) {
        const APPSCRIPT_URL = this.getAppScriptUrl();
        
        if (!APPSCRIPT_URL) {
            console.warn('API URL belum di set. Menggunakan mock data.');
            return this.mockResponse(action);
        }
        
        try {
            const options = {
                method: payload ? 'POST' : 'GET',
                mode: 'cors'
            };
            
            let url = `${APPSCRIPT_URL}?action=${action}`;
            
            if (payload) {
                options.headers = {
                    'Content-Type': 'text/plain;charset=utf-8', // Apps script quirk
                };
                options.body = JSON.stringify(payload);
            }
            
            const response = await fetch(url, options);
            const data = await response.json();
            
            if (data.status === 'error') {
                throw new Error(data.message);
            }
            
            return data.data;
        } catch (error) {
            console.error(`API Error (${action}):`, error);
            throw error;
        }
    },
    
    // Mock for development before Apps Script is connected
    mockResponse(action) {
        return new Promise(resolve => {
            setTimeout(() => {
                if (action === 'getTransactions') resolve([]);
                if (action === 'getTasks') resolve([]);
                resolve({ success: true });
            }, 800);
        });
    }
};
