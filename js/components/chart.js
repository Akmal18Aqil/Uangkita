// js/components/chart.js
import { formatRupiah } from '../utils.js';

export function createDonutChart(data, options = {}) {
    // data = [{ label, value, color }]
    const { size = 200, strokeWidth = 30 } = options;
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    
    let total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) total = 1; // avoid division by zero
    
    let currentOffset = 0;
    
    const svgSegments = data.map(item => {
        const strokeLength = (item.value / total) * circumference;
        const gap = circumference - strokeLength;
        const offset = currentOffset;
        currentOffset -= strokeLength; // move backward
        
        return `
            <circle 
                cx="${center}" cy="${center}" r="${radius}" 
                fill="transparent" 
                stroke="${item.color}" 
                stroke-width="${strokeWidth}"
                stroke-dasharray="${strokeLength} ${gap}"
                stroke-dashoffset="${offset}"
                transform="rotate(-90 ${center} ${center})"
                class="chart-segment"
                data-label="${item.label}"
                data-value="${item.value}"
                style="transition: all 0.3s ease;"
            />
        `;
    }).join('');
    
    // Add tooltip logic after render
    const html = `
        <div class="chart-container" style="position: relative; width: ${size}px; height: ${size}px; margin: 0 auto;">
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                ${svgSegments}
            </svg>
            <div class="chart-tooltip" style="position: absolute; display: none; background: rgba(0,0,0,0.8); padding: 4px 8px; border-radius: 4px; font-size: 12px; pointer-events: none; z-index: 10;"></div>
        </div>
        <div class="chart-legend" style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 16px;">
            ${data.map(item => `
                <div style="display: flex; align-items: center; gap: 4px; font-size: 11px;">
                    <span style="width: 10px; height: 10px; border-radius: 50%; background: ${item.color};"></span>
                    <span>${item.label} (${Math.round((item.value/total)*100)}%)</span>
                </div>
            `).join('')}
        </div>
    `;
    
    return html;
}

export function createBarChart(data, options = {}) {
    // data = [{ label, income, expense }]
    const { height = 200 } = options;
    
    // Find max value
    let max = 0;
    data.forEach(d => {
        if (d.income > max) max = d.income;
        if (d.expense > max) max = d.expense;
    });
    if (max === 0) max = 100; // default scale
    
    const barsHtml = data.map(item => {
        const incomePct = (item.income / max) * 100;
        const expensePct = (item.expense / max) * 100;
        
        return `
            <div class="bar-group" style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1;">
                <div class="bars" style="display: flex; gap: 4px; height: ${height}px; align-items: flex-end; width: 100%; justify-content: center;">
                    <div class="bar bar-income" style="width: 12px; height: ${incomePct}%; background: var(--success); border-radius: 4px 4px 0 0;" title="Pemasukan: ${formatRupiah(item.income)}"></div>
                    <div class="bar bar-expense" style="width: 12px; height: ${expensePct}%; background: var(--danger); border-radius: 4px 4px 0 0;" title="Pengeluaran: ${formatRupiah(item.expense)}"></div>
                </div>
                <div class="bar-label" style="font-size: 10px; color: var(--text-muted);">${item.label}</div>
            </div>
        `;
    }).join('');
    
    return `
        <div class="bar-chart-container" style="display: flex; width: 100%; gap: 8px;">
            ${barsHtml}
        </div>
        <div class="chart-legend" style="display: flex; justify-content: center; gap: 16px; margin-top: 16px;">
            <div style="display: flex; align-items: center; gap: 4px; font-size: 11px;">
                <span style="width: 10px; height: 10px; border-radius: 2px; background: var(--success);"></span>
                <span>Pemasukan</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px; font-size: 11px;">
                <span style="width: 10px; height: 10px; border-radius: 2px; background: var(--danger);"></span>
                <span>Pengeluaran</span>
            </div>
        </div>
    `;
}

export function createProgressBar(value, max, color = 'var(--accent-primary)') {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return `
        <div style="width: 100%; background: rgba(255,255,255,0.1); border-radius: 4px; height: 6px; overflow: hidden;">
            <div style="width: ${pct}%; background: ${color}; height: 100%; border-radius: 4px;"></div>
        </div>
    `;
}
