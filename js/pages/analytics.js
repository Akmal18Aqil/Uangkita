// js/pages/analytics.js
import { store } from '../store.js';
import { formatRupiah } from '../utils.js';
import { createDonutChart, createBarChart, createProgressBar } from '../components/chart.js';

export function render() {
    const container = document.createElement('div');
    container.className = 'animate-fade-in stagger-1';
    
    // Month Selector
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    
    const transactions = store.get('transactions') || [];
    
    // Process Data
    let totalIncome = 0;
    let totalExpense = 0;
    const expenseByCategory = {};
    const dailyData = {};
    
    // Initialize days in month for bar chart
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for(let i=1; i<=daysInMonth; i++) {
        dailyData[i] = { income: 0, expense: 0 };
    }
    
    transactions.forEach(trx => {
        const date = new Date(trx.Tanggal);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            const amount = parseFloat(trx.Jumlah) || 0;
            const day = date.getDate();
            
            if (trx.Tipe === 'Pemasukan') {
                totalIncome += amount;
                if(dailyData[day]) dailyData[day].income += amount;
            } else {
                totalExpense += amount;
                if(dailyData[day]) dailyData[day].expense += amount;
                
                expenseByCategory[trx.Kategori] = (expenseByCategory[trx.Kategori] || 0) + amount;
            }
        }
    });
    
    // Prepare Donut Data
    const categoryColors = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#3B82F6', '#14B8A6'];
    let donutData = Object.keys(expenseByCategory).map((cat, idx) => ({
        label: cat,
        value: expenseByCategory[cat],
        color: categoryColors[idx % categoryColors.length]
    })).sort((a,b) => b.value - a.value);
    
    if (donutData.length === 0) {
        donutData = [{ label: 'Belum ada data', value: 1, color: 'rgba(255,255,255,0.1)' }];
    }
    
    // Prepare Bar Data (Weekly chunks for better fit)
    const barData = [];
    let weekInc = 0, weekExp = 0;
    for(let i=1; i<=daysInMonth; i++) {
        weekInc += dailyData[i].income;
        weekExp += dailyData[i].expense;
        if (i % 7 === 0 || i === daysInMonth) {
            barData.push({ label: `W${Math.ceil(i/7)}`, income: weekInc, expense: weekExp });
            weekInc = 0; weekExp = 0;
        }
    }
    
    container.innerHTML = `
        <div class="section-header">
            <h3 class="section-title">Analitik Keuangan</h3>
            <div class="chip bg-primary">${monthNames[currentMonth]} ${currentYear}</div>
        </div>
        
        <div class="glass-card mb-md text-center">
            <div class="stats-row" style="margin-bottom: var(--spacing-lg);">
                <div class="stat-item">
                    <div class="stat-label">Total Pemasukan</div>
                    <div class="stat-value income amount">${formatRupiah(totalIncome)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Total Pengeluaran</div>
                    <div class="stat-value expense amount">${formatRupiah(totalExpense)}</div>
                </div>
            </div>
            
            <h4 class="mb-sm" style="font-size: 14px; color: var(--text-secondary);">Tren Mingguan</h4>
            ${createBarChart(barData)}
        </div>
        
        <div class="glass-card mb-md text-center">
            <h4 class="mb-md" style="font-size: 14px; color: var(--text-secondary);">Pengeluaran per Kategori</h4>
            ${createDonutChart(donutData)}
        </div>
        
        <div class="glass-card mb-md">
            <h4 class="mb-md" style="font-size: 14px; color: var(--text-secondary);">Top Kategori Pengeluaran</h4>
            <div style="display: flex; flex-direction: column; gap: 16px;">
                ${donutData[0].label === 'Belum ada data' ? '<div class="text-center text-muted">Belum ada data pengeluaran</div>' : 
                  donutData.slice(0, 5).map(item => `
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px;">
                            <span>${item.label}</span>
                            <span class="amount">${formatRupiah(item.value)}</span>
                        </div>
                        ${createProgressBar(item.value, donutData[0].value, item.color)}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add tooltip events
    setTimeout(() => {
        const segments = container.querySelectorAll('.chart-segment');
        const tooltip = container.querySelector('.chart-tooltip');
        if (tooltip) {
            segments.forEach(seg => {
                seg.addEventListener('mouseenter', (e) => {
                    tooltip.style.display = 'block';
                    tooltip.textContent = `${e.target.dataset.label}: ${formatRupiah(e.target.dataset.value)}`;
                    e.target.style.opacity = '0.7';
                });
                seg.addEventListener('mousemove', (e) => {
                    const rect = e.target.closest('.chart-container').getBoundingClientRect();
                    tooltip.style.left = (e.clientX - rect.left + 10) + 'px';
                    tooltip.style.top = (e.clientY - rect.top + 10) + 'px';
                });
                seg.addEventListener('mouseleave', (e) => {
                    tooltip.style.display = 'none';
                    e.target.style.opacity = '1';
                });
            });
        }
    }, 100);
    
    return container;
}
