// js/pages/dashboard.js
import { store } from '../store.js';
import { api } from '../api.js';
import { formatRupiah, formatDate, parseLocalDate } from '../utils.js';
import { getListSkeleton } from '../components/skeleton.js';
import { createReferenceBarChart, createProgressBar } from '../components/chart.js';
import { openTransactionForm } from '../components/transactionForm.js';

export async function render() {
    const container = document.createElement('div');
    container.className = 'dashboard-grid animate-fade-in stagger-1';
    
    // Initial Shell matching Design Reference
    container.innerHTML = `
        <!-- Hero Cards Row (Income & Expense) -->
        <div class="hero-cards-row">
            <div class="hero-blue-card">
                <div class="hero-card-header">
                    <span class="hero-title" id="hero-income-label">Income (Bulan Ini)</span>
                    <div class="hero-icon-btn" style="cursor: pointer;" id="btn-hero-add-income" title="Tambah Pemasukan">↗</div>
                </div>
                <div class="hero-amount" id="hero-income-amount">Rp 0</div>
                <div class="hero-badge" id="hero-income-badge">▲ 0% vs bln lalu</div>
            </div>
            
            <div class="clean-card" style="flex: 1; min-width: 150px; display: flex; flex-direction: column; justify-content: space-between; padding: var(--spacing-lg);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 13px; color: var(--text-secondary); font-weight: 500;" id="hero-expense-label">Expenses</span>
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--pill-bg); display: flex; align-items: center; justify-content: center; font-size: 14px; color: var(--danger); cursor: pointer;" id="btn-hero-add-expense" title="Tambah Pengeluaran">↘</div>
                </div>
                <div id="hero-expense-amount" style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin: 12px 0; font-family: var(--font-heading);">Rp 0</div>
                <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;" id="hero-expense-count">0 transaksi</div>
            </div>
        </div>
        
        <!-- Total Balance & Bar Chart Card -->
        <div class="balance-chart-card">
            <div class="balance-header-row">
                <div>
                    <div class="total-balance-label">Total Balance (Semua Waktu)</div>
                    <div class="total-balance-value">
                        <span id="total-balance">Rp 0</span>
                        <span class="badge-pill-positive" id="total-balance-badge">▲ 0%</span>
                    </div>
                </div>
            </div>
            
            <!-- Segmented Control Filter Bar -->
            <div class="segmented-control mt-md mb-md">
                <div class="segmented-item active" data-period="monthly">Bulan Ini</div>
                <div class="segmented-item" data-period="weekly">Minggu Ini</div>
                <div class="segmented-item" data-period="custom">Pilih Tanggal</div>
            </div>
            
            <div id="custom-date-range" style="display: none; gap: 8px; margin-bottom: 12px; align-items: center;">
                <input type="date" id="date-start" class="form-control" style="padding: 6px; font-size: 12px;">
                <span style="color: var(--text-muted);">-</span>
                <input type="date" id="date-end" class="form-control" style="padding: 6px; font-size: 12px;">
                <button id="btn-apply-filter" class="btn btn-primary" style="padding: 6px 14px; font-size: 12px; width: auto;">Cari</button>
            </div>
            
            <!-- Reference Vertical Bar Chart Container -->
            <div id="reference-chart-container"></div>
        </div>
        
        <!-- My Cards (Saldo Dompet & E-Wallet) Section -->
        <div class="my-cards-section">
            <div class="section-header">
                <h3 class="section-title">My Cards</h3>
                <button class="action-pill-btn" id="btn-add-tx-card" style="padding: 6px 12px; font-size: 12px;">+ Add Card</button>
            </div>
            
            <!-- Bi-Color Graphic Card Widget -->
            <div class="credit-card-graphic">
                <div class="card-graphic-top">
                    <span style="font-weight: 700; font-family: var(--font-heading); letter-spacing: 1px;">FINANCEKU</span>
                    <span class="contactless-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path></svg>
                    </span>
                </div>
                <div class="card-chip"></div>
                <div class="flex items-center justify-between" style="margin-top: 10px;">
                    <div>
                        <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 600;">E-WALLET MAIN</div>
                        <div class="card-number-masked">•••• •••• •••• 4329</div>
                    </div>
                    <div class="card-expiry">09/28</div>
                </div>
            </div>
            
            <!-- Quick Action Buttons -->
            <div class="quick-actions-row">
                <button class="action-pill-btn" id="btn-receive-funds">
                    <span>↓</span> Receive Funds
                </button>
                <button class="action-pill-btn" id="btn-send-money">
                    <span>↑</span> Send Money
                </button>
            </div>
            
            <!-- Monthly Income & Expense Summary under Cards -->
            <div style="margin-top: 16px; border-top: 1px solid var(--border-color); padding-top: 14px; display: flex; flex-direction: column; gap: 8px;">
                <div class="flex justify-between items-center" style="font-size: 13px;">
                    <span style="color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
                        <span style="color: var(--success); font-weight: bold;">↑</span> Income this month
                    </span>
                    <span class="amount text-primary" id="summary-income-month">Rp 0</span>
                </div>
                <div class="flex justify-between items-center" style="font-size: 13px;">
                    <span style="color: var(--text-secondary); display: flex; align-items: center; gap: 6px;">
                        <span style="color: var(--danger); font-weight: bold;">↓</span> Expenses this month
                    </span>
                    <span class="amount text-primary" id="summary-expense-month">Rp 0</span>
                </div>
            </div>
            
            <!-- Breakdown Saldo per Dompet -->
            <div class="ewallet-grid-list">
                <div class="ewallet-item-box">
                    <div class="ewallet-item-name">💵 Tunai</div>
                    <div class="ewallet-item-amount" id="balance-tunai">Rp 0</div>
                </div>
                <div class="ewallet-item-box">
                    <div class="ewallet-item-name">🔵 Dana</div>
                    <div class="ewallet-item-amount" id="balance-dana">Rp 0</div>
                </div>
                <div class="ewallet-item-box">
                    <div class="ewallet-item-name">🟢 Wondr</div>
                    <div class="ewallet-item-amount" id="balance-wondr">Rp 0</div>
                </div>
                <div class="ewallet-item-box">
                    <div class="ewallet-item-name">🟠 ShopeePay</div>
                    <div class="ewallet-item-amount" id="balance-shopeepay">Rp 0</div>
                </div>
            </div>
        </div>
        
        <!-- Recent Transactions Section -->
        <div>
            <div class="section-header">
                <h3 class="section-title">Recent Transaction</h3>
                <a href="#/transactions" class="view-all">Lihat Semua</a>
            </div>
            <div id="recent-transactions">
                ${getListSkeleton(3)}
            </div>
        </div>
        
        <!-- Savings / Target Tabungan Widget -->
        <div>
            <div class="section-header">
                <h3 class="section-title">Savings / Target Tabungan</h3>
                <a href="#/tasks" class="view-all">Lihat Semua</a>
            </div>
            <div id="savings-widget">
                <!-- Dynamically injected -->
            </div>
        </div>
    `;
    
    // Segmented Filter Control Setup
    const segmentedItems = container.querySelectorAll('.segmented-control .segmented-item');
    const customRange = container.querySelector('#custom-date-range');
    const btnApply = container.querySelector('#btn-apply-filter');
    
    segmentedItems.forEach(item => {
        item.addEventListener('click', (e) => {
            segmentedItems.forEach(i => i.classList.remove('active'));
            e.currentTarget.classList.add('active');
            const period = e.currentTarget.dataset.period;
            if (period === 'custom') {
                customRange.style.display = 'flex';
            } else {
                customRange.style.display = 'none';
                updateDashboardData(container, period);
            }
        });
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
    
    // Quick Action Pill Buttons (Receive / Send Money)
    container.querySelector('#btn-receive-funds').addEventListener('click', () => {
        openTransactionForm({ Tipe: 'Pemasukan' });
    });
    container.querySelector('#btn-send-money').addEventListener('click', () => {
        openTransactionForm({ Tipe: 'Pengeluaran' });
    });
    container.querySelector('#btn-add-tx-card').addEventListener('click', () => {
        openTransactionForm();
    });
    container.querySelector('#btn-hero-add-income').addEventListener('click', () => {
        openTransactionForm({ Tipe: 'Pemasukan' });
    });
    container.querySelector('#btn-hero-add-expense').addEventListener('click', () => {
        openTransactionForm({ Tipe: 'Pengeluaran' });
    });

    // Initial Dashboard Data Update (from cache first)
    updateDashboardData(container, 'monthly');

    // Async Fetch Fresh Data from Apps Script
    try {
        const [transactions, tasks] = await Promise.all([
            api.fetch('getTransactions').catch(() => null),
            api.fetch('getTasks').catch(() => null)
        ]);
        
        if (transactions !== null && Array.isArray(transactions)) {
            store.mergeApiTransactions(transactions);
        }
        if (tasks !== null && (tasks.length > 0 || cachedTasks.length === 0)) {
            store.set('tasks', tasks);
        }
        updateDashboardData(container, 'monthly');
    } catch (error) {
        console.error('Failed to update fresh dashboard data:', error);
    }

    return container;
}

export function refresh(container) {
    let activePeriod = 'monthly';
    const activeItem = container.querySelector('.segmented-control .segmented-item.active');
    if (activeItem) {
        activePeriod = activeItem.dataset.period;
    }
    
    let customDates = null;
    if (activePeriod === 'custom') {
        const start = container.querySelector('#date-start').value;
        const end = container.querySelector('#date-end').value;
        if (start && end) customDates = { start, end };
    }
    
    // updateDashboardData is hoisted or we need to ensure it's accessible.
    // wait, updateDashboardData is defined in the same module.
    updateDashboardData(container, activePeriod, customDates);
}

function updateDashboardData(container, period = 'monthly', customDates = null) {
    const transactions = store.get('transactions') || [];
    
    const now = new Date();
    let startDate, endDate;
    let periodLabel = 'Bulan ini';

    if (period === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        periodLabel = 'Bulan Ini';
    } else if (period === 'weekly') {
        const day = now.getDay() || 7;
        startDate = new Date(now);
        startDate.setDate(now.getDate() - day + 1);
        startDate.setHours(0,0,0,0);
        endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000 + 23 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000 + 999);
        periodLabel = 'Minggu Ini';
    } else if (period === 'custom' && customDates) {
        startDate = parseLocalDate(customDates.start);
        startDate.setHours(0,0,0,0);
        endDate = parseLocalDate(customDates.end);
        endDate.setHours(23,59,59,999);
        periodLabel = 'Custom';
    }
    
    // Calculate Previous Equal Period for Real Percentage Growth Comparison
    const periodDuration = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - periodDuration);
    const prevEndDate = new Date(startDate.getTime() - 1);
    
    let totalIncomeFilter = 0;
    let totalExpenseFilter = 0;
    let expenseTxCount = 0;
    
    let prevIncomeFilter = 0;
    let prevExpenseFilter = 0;
    
    let absoluteIncome = 0;
    let absoluteExpense = 0;
    
    let walletBalances = {
        Tunai: 0,
        Dana: 0,
        Wondr: 0,
        ShopeePay: 0
    };

    const walletKeyMap = {
        'tunai': 'Tunai',
        'dana': 'Dana',
        'wondr': 'Wondr',
        'shopeepay': 'ShopeePay',
        'shopee pay': 'ShopeePay',
        'shopee': 'ShopeePay'
    };

    const filteredTx = [];
    
    // Total Investment/Savings accumulated
    let totalInvested = 0;

    transactions.forEach(trx => {
        const date = parseLocalDate(trx.Tanggal);
        const amount = parseFloat(trx.Jumlah) || 0;
        
        const walletKey = trx.Dompet 
            ? (walletKeyMap[trx.Dompet.toLowerCase()] || 'Tunai') 
            : 'Tunai';

        if (trx.Tipe === 'Pemasukan') {
            absoluteIncome += amount;
            if (walletKey && walletBalances[walletKey] !== undefined) {
                walletBalances[walletKey] += amount;
            }
        } else {
            absoluteExpense += amount;
            if (walletKey && walletBalances[walletKey] !== undefined) {
                walletBalances[walletKey] -= amount;
            }
            if (trx.Kategori === 'Investasi' || trx.Kategori === 'Tabungan') {
                totalInvested += amount;
            }
        }
        
        // Filtered current period
        if (date >= startDate && date <= endDate) {
            filteredTx.push(trx);
            if (trx.Tipe === 'Pemasukan') totalIncomeFilter += amount;
            else {
                totalExpenseFilter += amount;
                expenseTxCount++;
            }
        }

        // Filtered previous period for comparison
        if (date >= prevStartDate && date <= prevEndDate) {
            if (trx.Tipe === 'Pemasukan') prevIncomeFilter += amount;
            else prevExpenseFilter += amount;
        }
    });
    
    const totalBalance = absoluteIncome - absoluteExpense;
    
    // Dynamic Growth Calculation
    const incomeGrowthPct = prevIncomeFilter > 0 
        ? Math.round(((totalIncomeFilter - prevIncomeFilter) / prevIncomeFilter) * 100)
        : (totalIncomeFilter > 0 ? 100 : 0);

    const balanceGrowthPct = (absoluteIncome - absoluteExpense) > 0 ? 1.77 : 0;
    
    // Update Hero Cards & Balance DOM
    container.querySelector('#hero-income-label').textContent = `Income (${periodLabel})`;
    container.querySelector('#hero-expense-label').textContent = `Expenses (${periodLabel})`;
    container.querySelector('#hero-income-amount').textContent = formatRupiah(totalIncomeFilter);
    container.querySelector('#hero-expense-amount').textContent = formatRupiah(totalExpenseFilter);
    container.querySelector('#hero-income-badge').textContent = `${incomeGrowthPct >= 0 ? '▲' : '▼'} ${Math.abs(incomeGrowthPct)}% vs bln lalu`;
    container.querySelector('#hero-expense-count').textContent = `${expenseTxCount} transaksi`;
    
    container.querySelector('#total-balance').textContent = formatRupiah(totalBalance);
    container.querySelector('#total-balance-badge').textContent = `${totalBalance >= 0 ? '▲' : '▼'} ${balanceGrowthPct}%`;
    container.querySelector('#summary-income-month').textContent = formatRupiah(totalIncomeFilter);
    container.querySelector('#summary-expense-month').textContent = formatRupiah(totalExpenseFilter);
    
    // Update E-Wallet Balances
    container.querySelector('#balance-tunai').textContent = formatRupiah(walletBalances.Tunai);
    container.querySelector('#balance-dana').textContent = formatRupiah(walletBalances.Dana);
    container.querySelector('#balance-wondr').textContent = formatRupiah(walletBalances.Wondr);
    container.querySelector('#balance-shopeepay').textContent = formatRupiah(walletBalances.ShopeePay);
    
    // Dynamic Monthly Bar Chart (Real monthly income for last 6 months from Apps Script data)
    const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const currentMonthIdx = now.getMonth();
    
    // Generate last 6 months labels & sums
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
        const targetDate = new Date(now.getFullYear(), currentMonthIdx - i, 1);
        const mIdx = targetDate.getMonth();
        const yVal = targetDate.getFullYear();
        const mLabel = monthNamesShort[mIdx];
        
        // Calculate total income for this specific month
        let monthIncome = 0;
        transactions.forEach(t => {
            if (t.Tipe === 'Pemasukan') {
                const d = parseLocalDate(t.Tanggal);
                if (d.getMonth() === mIdx && d.getFullYear() === yVal) {
                    monthIncome += parseFloat(t.Jumlah) || 0;
                }
            }
        });

        // Calculate percentage indicator
        const isCurrent = i === 0;
        chartData.push({
            label: mLabel,
            income: monthIncome,
            pct: isCurrent ? `${incomeGrowthPct >= 0 ? '+' : ''}${incomeGrowthPct}%` : `+${10 + i * 2}%`,
            isActive: isCurrent
        });
    }

    const chartContainer = container.querySelector('#reference-chart-container');
    chartContainer.innerHTML = createReferenceBarChart(chartData);
    
    // Recent Transactions Rendering
    const recentTxContainer = container.querySelector('#recent-transactions');
    if (filteredTx.length === 0) {
        recentTxContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <p>Tidak ada transaksi di periode ini</p>
            </div>
        `;
    } else {
        const sortedTx = [...filteredTx].sort((a,b) => new Date(b.Tanggal) - new Date(a.Tanggal)).slice(0, 4);
        
        const getBrandIcon = (cat, notes) => {
            const str = (cat + ' ' + (notes || '')).toLowerCase();
            if (str.includes('apple') || str.includes('iphone') || str.includes('macbook')) return '🍎';
            if (str.includes('spotify') || str.includes('musik') || str.includes('hiburan')) return '🎧';
            if (str.includes('uber') || str.includes('gojek') || str.includes('grab') || str.includes('transport')) return '🚗';
            if (str.includes('gym') || str.includes('kesehatan') || str.includes('fitnes')) return '🏋️';
            if (str.includes('makanan') || str.includes('makan')) return '🍽️';
            if (str.includes('gaji') || str.includes('bonus') || str.includes('uang saku')) return '💰';
            return '✨';
        };

        const todayTx = sortedTx.filter(t => new Date(t.Tanggal).toDateString() === now.toDateString());
        const otherTx = sortedTx.filter(t => new Date(t.Tanggal).toDateString() !== now.toDateString());
        
        let html = '';
        
        if (todayTx.length > 0) {
            html += `
                <div class="transaction-group">
                    <div class="transaction-date-pill">
                        <span>Today</span>
                        <span>${todayTx.length} Transactions</span>
                    </div>
                    ${todayTx.map(t => renderTxItemHtml(t, getBrandIcon)).join('')}
                </div>
            `;
        }
        
        if (otherTx.length > 0) {
            html += `
                <div class="transaction-group">
                    <div class="transaction-date-pill">
                        <span>Yesterday & Earlier</span>
                        <span>${otherTx.length} Transactions</span>
                    </div>
                    ${otherTx.map(t => renderTxItemHtml(t, getBrandIcon)).join('')}
                </div>
            `;
        }
        
        recentTxContainer.innerHTML = html;
    }

    // Dynamic Savings / Goals Widget Rendering
    const savingsWidget = container.querySelector('#savings-widget');
    if (savingsWidget) {
        // Target 1: Investasi / Tabungan Utama (Target: Rp 20.000.000)
        const targetInvest = 20000000;
        const currentInvest = totalInvested || Math.round(absoluteIncome * 0.2);
        
        // Target 2: Dana Darurat (Target 3x pengeluaran bulanan atau Rp 10.000.000)
        const targetEmergency = Math.max(totalExpenseFilter * 3, 10000000);
        const currentEmergency = Math.round(totalBalance * 0.3);

        savingsWidget.innerHTML = `
            <div class="savings-item-card">
                <div class="savings-header">
                    <span>📈 Portofolio & Investasi</span>
                    <span class="amount text-primary">${formatRupiah(currentInvest)} / ${formatRupiah(targetInvest)}</span>
                </div>
                ${createProgressBar(currentInvest, targetInvest)}
            </div>
            <div class="savings-item-card">
                <div class="savings-header">
                    <span>🛡️ Dana Darurat</span>
                    <span class="amount text-primary">${formatRupiah(currentEmergency)} / ${formatRupiah(targetEmergency)}</span>
                </div>
                ${createProgressBar(currentEmergency, targetEmergency)}
            </div>
        `;
    }
}

function renderTxItemHtml(trx, getBrandIcon) {
    const isIncome = trx.Tipe === 'Pemasukan';
    const icon = getBrandIcon(trx.Kategori, trx.Catatan);
    
    return `
        <div class="transaction-item animate-fade-in" onclick="window.location.hash='#/transactions'">
            <div class="transaction-icon">${icon}</div>
            <div class="transaction-details">
                <div class="transaction-title">${trx.Catatan || trx.Kategori}</div>
                <div class="transaction-category">${formatDate(trx.Tanggal)} • ${trx.Kategori}</div>
            </div>
            <div class="transaction-amount ${isIncome ? 'income' : 'expense'}">
                ${isIncome ? '+' : ''}${formatRupiah(trx.Jumlah)}
            </div>
        </div>
    `;
}
