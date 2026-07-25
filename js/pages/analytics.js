// js/pages/analytics.js
import { store } from '../store.js';
import { formatRupiah, parseLocalDate } from '../utils.js';
import { createDonutChart, createBarChart, createProgressBar } from '../components/chart.js';

export function render() {
    const container = document.createElement('div');
    container.className = 'animate-fade-in stagger-1';
    container.style.paddingBottom = '90px'; // Prevent FAB/BottomNav overlap
    
    refresh(container);
    return container;
}

export function refresh(container) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const transactions = store.get('transactions') || [];
    
    let totalIncome = 0;
    let totalExpense = 0;
    const expenseByCategory = {};
    const dailyData = {};
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for(let i=1; i<=daysInMonth; i++) {
        dailyData[i] = { income: 0, expense: 0 };
    }
    
    transactions.forEach(trx => {
        const date = parseLocalDate(trx.Tanggal);
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
    
    const categoryColors = ['#3B41F4', '#EC4899', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#06B6D4', '#64748B'];
    let donutData = Object.keys(expenseByCategory).map((cat, idx) => ({
        label: cat,
        value: expenseByCategory[cat],
        color: categoryColors[idx % categoryColors.length]
    })).sort((a,b) => b.value - a.value);
    
    if (donutData.length === 0) {
        donutData = [{ label: 'Belum ada data', value: 1, color: 'rgba(0,0,0,0.06)' }];
    }
    
    // Weekly Bar Chart Data
    const barData = [];
    let weekInc = 0, weekExp = 0;
    for(let i=1; i<=daysInMonth; i++) {
        weekInc += dailyData[i].income;
        weekExp += dailyData[i].expense;
        if (i % 7 === 0 || i === daysInMonth) {
            const weekNum = Math.ceil(i/7);
            const isCurrentWeek = (now.getDate() >= (weekNum-1)*7 + 1) && (now.getDate() <= weekNum*7 || i === daysInMonth);
            barData.push({
                label: `W${weekNum}`,
                income: weekInc,
                value: weekInc,
                isActive: isCurrentWeek
            });
            weekInc = 0; weekExp = 0;
        }
    }
    
    const netCashflow = totalIncome - totalExpense;
    const isSurplus = netCashflow >= 0;

    container.innerHTML = `
        <!-- Section Header -->
        <div class="section-header" style="margin-bottom: 16px;">
            <h3 class="section-title" style="font-size: 18px;">Ringkasan Analitik</h3>
            <div class="chip" style="background: var(--pill-bg); border: 1px solid var(--border-color); color: var(--text-primary); font-weight: 600; font-size: 12px; padding: 4px 12px; border-radius: var(--radius-full);">
                📅 ${monthNames[currentMonth]} ${currentYear}
            </div>
        </div>
        
        <!-- Income vs Expense Metric Cards (2 Columns) -->
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 12px;">
            <div class="clean-card" style="padding: 14px; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 12px; color: var(--text-secondary); font-weight: 500;">Pemasukan</span>
                    <span style="width: 24px; height: 24px; border-radius: 50%; background: #ECFDF5; color: #10B981; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">↗</span>
                </div>
                <div class="amount" style="font-size: 18px; font-weight: 700; color: var(--text-primary); font-family: var(--font-heading);">${formatRupiah(totalIncome)}</div>
            </div>
            
            <div class="clean-card" style="padding: 14px; position: relative;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-size: 12px; color: var(--text-secondary); font-weight: 500;">Pengeluaran</span>
                    <span style="width: 24px; height: 24px; border-radius: 50%; background: #FEF2F2; color: #EF4444; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">↘</span>
                </div>
                <div class="amount" style="font-size: 18px; font-weight: 700; color: var(--text-primary); font-family: var(--font-heading);">${formatRupiah(totalExpense)}</div>
            </div>
        </div>

        <!-- Net Cashflow Banner -->
        <div class="clean-card mb-md" style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; background: var(--pill-bg);">
            <span style="font-size: 13px; color: var(--text-secondary); font-weight: 500;">Net Cash Flow (${monthNames[currentMonth]}):</span>
            <span style="font-size: 13px; font-weight: 700; color: ${isSurplus ? 'var(--success)' : 'var(--danger)'};">
                ${isSurplus ? '+' : ''}${formatRupiah(netCashflow)} (${isSurplus ? 'Surplus' : 'Defisit'})
            </span>
        </div>
        
        <!-- Weekly Trend Card -->
        <div class="clean-card mb-md" style="padding: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h4 style="font-size: 15px; font-weight: 700; color: var(--text-primary);">Tren Pemasukan Mingguan</h4>
                <span style="font-size: 11px; color: var(--text-muted); font-weight: 500;">Minggu 1-5</span>
            </div>
            ${createBarChart(barData)}
        </div>
        
        <!-- Category Distribution (Donut Chart) -->
        <div class="clean-card mb-md" style="padding: 18px; text-align: center;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
                <h4 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0;">Pengeluaran per Kategori</h4>
                <span style="font-size: 11px; color: var(--text-muted); font-weight: 500;">Persentase</span>
            </div>
            ${createDonutChart(donutData, { centerTitle: 'Total Pengeluaran', centerValue: formatRupiah(totalExpense) })}
        </div>
        
        <!-- Top Expense Categories List -->
        <div class="clean-card mb-md" style="padding: 18px;">
            <h4 style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px;">Rincian Kategori Terbesar</h4>
            <div style="display: flex; flex-direction: column; gap: 14px;">
                ${donutData[0].label === 'Belum ada data' ? '<div class="text-center text-muted" style="font-size: 13px; padding: 12px 0;">Belum ada catatan pengeluaran di bulan ini.</div>' : 
                  donutData.map(item => `
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; font-weight: 500;">
                            <span style="display: flex; align-items: center; gap: 6px;">
                                <span style="width: 8px; height: 8px; border-radius: 50%; background: ${item.color}; flex-shrink: 0;"></span>
                                ${item.label}
                            </span>
                            <span class="amount text-primary" style="font-weight: 700;">${formatRupiah(item.value)}</span>
                        </div>
                        ${createProgressBar(item.value, totalExpense, item.color)}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Interactive Tooltip Setup
    setTimeout(() => {
        const segments = container.querySelectorAll('.chart-segment');
        const tooltip = container.querySelector('.chart-tooltip');
        if (tooltip) {
            segments.forEach(seg => {
                seg.addEventListener('mouseenter', (e) => {
                    tooltip.style.display = 'block';
                    tooltip.textContent = `${e.target.dataset.label}: ${formatRupiah(e.target.dataset.value)}`;
                    e.target.style.opacity = '0.75';
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
    }, 50);
}
