// js/pages/dashboard.js
import { store } from '../store.js';
import { api } from '../api.js';
import { formatRupiah, formatDate } from '../utils.js';
import { getListSkeleton, getCardSkeleton } from '../components/skeleton.js';
import { createBarChart, createProgressBar } from '../components/chart.js';

let isLoaded = false;

export async function render() {
    const container = document.createElement('div');
    container.className = 'flex-col gap-lg animate-fade-in stagger-1';
    
    // Initial Render with Skeletons & Filter UI
    container.innerHTML = `
        <div class="glass-card greeting-card">
            <div class="greeting-text">
                <h2>Halo, ${store.get('settings').userName || 'Pengguna'}! 👋</h2>
                <p id="current-date">Memuat tanggal...</p>
            </div>
        </div>
        
        <!-- Filter Bar -->
        <div class="glass-card" style="padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color);">
            <div class="flex items-center justify-between" style="gap: 8px; flex-wrap: wrap;">
                <select id="dashboard-period" class="form-control" style="width: auto; flex: 1; min-width: 120px; font-size: 13px; background: rgba(0,0,0,0.2);">
                    <option value="weekly">Minggu Ini</option>
                    <option value="monthly" selected>Bulan Ini</option>
                    <option value="custom">Pilih Tanggal...</option>
                </select>
                <div id="custom-date-range" style="display: none; gap: 8px; flex: 2; align-items: center; min-width: 200px;">
                    <input type="date" id="date-start" class="form-control" style="padding: 6px; font-size: 12px; background: rgba(0,0,0,0.2);">
                    <span style="color: var(--text-muted);">-</span>
                    <input type="date" id="date-end" class="form-control" style="padding: 6px; font-size: 12px; background: rgba(0,0,0,0.2);">
                    <button id="btn-apply-filter" class="btn btn-primary" style="padding: 6px 12px; font-size: 12px; height: 100%;">Cari</button>
                </div>
            </div>
        </div>
        
        <div class="glass-card balance-card">
            <div class="balance-label">Total Saldo (Semua Waktu)</div>
            <div class="balance-amount amount" id="total-balance">Memuat...</div>
            <div class="stats-row">
                <div class="stat-item">
                    <div class="stat-label" id="label-income">Pemasukan (Bulan ini)</div>
                    <div class="stat-value income amount" id="total-income">...</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label" id="label-expense">Pengeluaran (Bulan ini)</div>
                    <div class="stat-value expense amount" id="total-expense">...</div>
                </div>
            </div>
        </div>
        
        <div id="mini-chart-container"></div>
        
        <div class="glass-card" id="top-cat-dashboard">
            <h4 class="mb-sm" style="font-size: 14px; color: var(--text-secondary);">Top Pengeluaran</h4>
            ${getListSkeleton(2)}
        </div>
        
        <div>
            <div class="section-header">
                <h3 class="section-title">Tugas Mendatang</h3>
                <a href="#/tasks" class="view-all">Lihat Semua</a>
            </div>
            <div id="upcoming-tasks">
                ${getListSkeleton(2)}
            </div>
        </div>
        
        <div>
            <div class="section-header">
                <h3 class="section-title">Transaksi Terakhir</h3>
                <a href="#/transactions" class="view-all">Lihat Semua</a>
            </div>
            <div id="recent-transactions">
                ${getListSkeleton(3)}
            </div>
        </div>
    `;
    
    // Set date
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    container.querySelector('#current-date').textContent = new Date().toLocaleDateString('id-ID', dateOptions);
    
    // Filter Event Listeners
    const periodSelect = container.querySelector('#dashboard-period');
    const customRange = container.querySelector('#custom-date-range');
    const btnApply = container.querySelector('#btn-apply-filter');

    periodSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            customRange.style.display = 'flex';
        } else {
            customRange.style.display = 'none';
            updateDashboardData(container, e.target.value);
        }
    });

    btnApply.addEventListener('click', () => {
        const start = container.querySelector('#date-start').value;
        const end = container.querySelector('#date-end').value;
        if (start && end) {
            updateDashboardData(container, 'custom', { start, end });
        } else {
            alert('Harap pilih tanggal mulai dan akhir!');
        }
    });
    
    // Load Data
    try {
        if (!isLoaded || store.get('transactions').length === 0) {
            const [transactions, tasks] = await Promise.all([
                api.fetch('getTransactions').catch(() => []),
                api.fetch('getTasks').catch(() => [])
            ]);
            store.set('transactions', transactions);
            store.set('tasks', tasks);
            isLoaded = true;
        }
        updateDashboardData(container, 'monthly');
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        updateDashboardData(container, 'monthly');
    }
    
    return container;
}

function updateDashboardData(container, period = 'monthly', customDates = null) {
    const transactions = store.get('transactions') || [];
    const tasks = store.get('tasks') || [];
    
    const now = new Date();
    let startDate, endDate;
    let periodLabel = 'Bulan ini';

    if (period === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        periodLabel = '(Bulan ini)';
    } else if (period === 'weekly') {
        const day = now.getDay() || 7; // Sunday is 0, make it 7 for calculation
        startDate = new Date(now);
        startDate.setDate(now.getDate() - day + 1);
        startDate.setHours(0,0,0,0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23,59,59,999);
        periodLabel = '(Minggu ini)';
    } else if (period === 'custom' && customDates) {
        startDate = new Date(customDates.start);
        startDate.setHours(0,0,0,0);
        endDate = new Date(customDates.end);
        endDate.setHours(23,59,59,999);
        periodLabel = '(Custom)';
    }
    
    let totalIncomeFilter = 0;
    let totalExpenseFilter = 0;
    
    // Total balance is usually all-time, so we calculate it without filter
    let absoluteIncome = 0;
    let absoluteExpense = 0;

    // Filter transactions for charts & stats
    const filteredTx = [];
    
    transactions.forEach(trx => {
        const date = new Date(trx.Tanggal);
        const amount = parseFloat(trx.Jumlah) || 0;
        
        // All time balance
        if (trx.Tipe === 'Pemasukan') absoluteIncome += amount;
        else absoluteExpense += amount;
        
        // Filtered range
        if (date >= startDate && date <= endDate) {
            filteredTx.push(trx);
            if (trx.Tipe === 'Pemasukan') totalIncomeFilter += amount;
            else totalExpenseFilter += amount;
        }
    });
    
    const totalBalance = absoluteIncome - absoluteExpense;
    
    // Update DOM texts
    container.querySelector('#total-balance').textContent = formatRupiah(totalBalance);
    container.querySelector('#total-income').textContent = formatRupiah(totalIncomeFilter);
    container.querySelector('#total-expense').textContent = formatRupiah(totalExpenseFilter);
    container.querySelector('#label-income').textContent = 'Pemasukan ' + periodLabel;
    container.querySelector('#label-expense').textContent = 'Pengeluaran ' + periodLabel;
    
    // Real Chart Generation
    const miniChartContainer = container.querySelector('#mini-chart-container');
    if (filteredTx.length > 0) {
        let chartLabel = 'Tren Keuangan';
        let finalChartData = [];
        
        if (period === 'weekly') {
            const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
            const dataMap = Array(7).fill().map(() => ({ income: 0, expense: 0 }));
            filteredTx.forEach(trx => {
                let dayIdx = new Date(trx.Tanggal).getDay() - 1;
                if (dayIdx === -1) dayIdx = 6;
                const amt = parseFloat(trx.Jumlah) || 0;
                if (trx.Tipe === 'Pemasukan') dataMap[dayIdx].income += amt;
                else dataMap[dayIdx].expense += amt;
            });
            finalChartData = days.map((d, i) => ({ label: d, income: dataMap[i].income, expense: dataMap[i].expense }));
            chartLabel = 'Tren Minggu Ini';
        } else {
            // Group by 4 buckets (e.g., Weeks for monthly)
            const totalTime = Math.max(endDate.getTime() - startDate.getTime(), 1);
            const bucketSize = totalTime / 4;
            const dataMap = [
                { label: 'Q1', income: 0, expense: 0 },
                { label: 'Q2', income: 0, expense: 0 },
                { label: 'Q3', income: 0, expense: 0 },
                { label: 'Q4', income: 0, expense: 0 }
            ];
            filteredTx.forEach(trx => {
                const time = new Date(trx.Tanggal).getTime();
                let bucket = Math.floor((time - startDate.getTime()) / bucketSize);
                if (bucket >= 4) bucket = 3;
                if (bucket < 0) bucket = 0;
                
                const amt = parseFloat(trx.Jumlah) || 0;
                if (trx.Tipe === 'Pemasukan') dataMap[bucket].income += amt;
                else dataMap[bucket].expense += amt;
            });
            if (period === 'monthly') {
                dataMap[0].label = 'W1'; dataMap[1].label = 'W2'; dataMap[2].label = 'W3'; dataMap[3].label = 'W4';
                chartLabel = 'Tren Bulan Ini';
            } else {
                chartLabel = 'Tren (Custom)';
            }
            finalChartData = dataMap;
        }
        
        miniChartContainer.innerHTML = `
            <div class="glass-card" style="padding: 12px;">
                <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">${chartLabel}</div>
                ${createBarChart(finalChartData, { height: 80 })}
            </div>
        `;
    } else {
        miniChartContainer.innerHTML = `
            <div class="glass-card text-center" style="padding: 16px;">
                <div style="font-size: 12px; color: var(--text-muted);">Tidak ada data grafik untuk periode ini</div>
            </div>
        `;
    }
    
    // Top Categories (based on filtered transactions)
    const topCatContainer = container.querySelector('#top-cat-dashboard');
    if (topCatContainer && filteredTx.length > 0) {
        const catMap = {};
        filteredTx.forEach(trx => {
            if (trx.Tipe === 'Pengeluaran') {
                catMap[trx.Kategori] = (catMap[trx.Kategori] || 0) + (parseFloat(trx.Jumlah) || 0);
            }
        });
        const catArr = Object.keys(catMap).map(k => ({ label: k, value: catMap[k], color: '#EF4444' })).sort((a,b)=>b.value-a.value);
        if (catArr.length > 0) {
            const maxCat = catArr[0].value;
            topCatContainer.innerHTML = `
                <h4 class="mb-md" style="font-size: 14px; color: var(--text-secondary);">Top Pengeluaran ${periodLabel}</h4>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${catArr.slice(0, 3).map(item => `
                        <div>
                            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                                <span>${item.label}</span>
                                <span class="amount">${formatRupiah(item.value)}</span>
                            </div>
                            ${createProgressBar(item.value, maxCat, item.color)}
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            topCatContainer.innerHTML = `<h4 class="mb-sm" style="font-size: 14px; color: var(--text-secondary);">Top Pengeluaran</h4><div class="text-center text-muted" style="font-size: 12px;">Tidak ada pengeluaran periode ini</div>`;
        }
    } else {
         topCatContainer.innerHTML = `<h4 class="mb-sm" style="font-size: 14px; color: var(--text-secondary);">Top Pengeluaran</h4><div class="text-center text-muted" style="font-size: 12px;">Tidak ada pengeluaran periode ini</div>`;
    }
    
    // Recent Transactions (Show last 5 globally or from filtered? Usually globally is fine, but since we are filtering, let's show filtered ones)
    const recentTxContainer = container.querySelector('#recent-transactions');
    if (filteredTx.length === 0) {
        recentTxContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <p>Tidak ada transaksi di periode ini</p>
            </div>
        `;
    } else {
        // Sort filtered transactions by newest first
        const recent = [...filteredTx].sort((a,b) => new Date(b.Tanggal) - new Date(a.Tanggal)).slice(0, 5);
        recentTxContainer.innerHTML = recent.map(trx => {
            const isIncome = trx.Tipe === 'Pemasukan';
            const catInfo = store.get('categories').find(c => c.name === trx.Kategori) || { icon: '✨' };
            
            return `
                <div class="transaction-item animate-fade-in">
                    <div class="transaction-icon">${catInfo.icon}</div>
                    <div class="transaction-details">
                        <div class="transaction-title">${trx.Catatan || trx.Kategori}</div>
                        <div class="transaction-category">${trx.Kategori} • ${formatDate(trx.Tanggal)}</div>
                    </div>
                    <div class="transaction-amount ${isIncome ? 'income' : 'expense'}">
                        ${isIncome ? '+' : '-'}${formatRupiah(trx.Jumlah)}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Upcoming Tasks (Kept independent from transaction filter since tasks have their own deadlines)
    const upcomingTasksContainer = container.querySelector('#upcoming-tasks');
    const pendingTasks = tasks.filter(t => t.Status !== 'Done')
        .sort((a, b) => new Date(a.Deadline) - new Date(b.Deadline))
        .slice(0, 5);
        
    if (pendingTasks.length === 0) {
        upcomingTasksContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <p>Tidak ada tugas mendesak</p>
            </div>
        `;
    } else {
        upcomingTasksContainer.innerHTML = pendingTasks.map(task => `
            <div class="task-card animate-fade-in">
                <div class="task-title">${task.Judul}</div>
                <div class="task-meta">
                    <span>⏳ ${formatDate(task.Deadline)}</span>
                    <span class="priority-badge priority-${task.Prioritas.toLowerCase()}">${task.Prioritas}</span>
                </div>
            </div>
        `).join('');
    }
}
