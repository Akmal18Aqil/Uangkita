// js/components/chart.js
import { formatRupiah } from '../utils.js';

export function createDonutChart(data, options = {}) {
    // data = [{ label, value, color }]
    const { size = 210, strokeWidth = 24, centerTitle = 'Total', centerValue = '' } = options;
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    
    let total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) total = 1;
    
    let currentOffset = 0;
    
    const svgSegments = data.map(item => {
        const strokeLength = (item.value / total) * circumference;
        const gap = circumference - strokeLength;
        const offset = currentOffset;
        currentOffset -= strokeLength;
        
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
                style="transition: all 0.3s ease; cursor: pointer;"
            />
        `;
    }).join('');
    
    const displayValue = centerValue || formatRupiah(total === 1 && data[0]?.label === 'Belum ada data' ? 0 : total);

    return `
        <div class="chart-container" style="position: relative; width: ${size}px; height: ${size}px; margin: 0 auto;">
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                ${svgSegments}
            </svg>
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; pointer-events: none; width: 130px;">
                <div style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${centerTitle}</div>
                <div style="font-size: 15px; font-weight: 700; color: var(--text-primary); margin-top: 2px; font-family: var(--font-heading); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${displayValue}</div>
            </div>
            <div class="chart-tooltip" style="position: absolute; display: none; background: #0F172A; color: white; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; pointer-events: none; z-index: 10; box-shadow: 0 4px 14px rgba(0,0,0,0.2);"></div>
        </div>
        <div class="chart-legend" style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 18px;">
            ${data.map(item => `
                <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary); font-weight: 500; background: var(--pill-bg); padding: 4px 10px; border-radius: var(--radius-full); border: 1px solid var(--border-color);">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: ${item.color}; flex-shrink: 0;"></span>
                    <span>${item.label}</span>
                    <span style="font-weight: 700; color: var(--text-primary); margin-left: 2px;">${Math.round((item.value/total)*100)}%</span>
                </div>
            `).join('')}
        </div>
    `;
}

export function createReferenceBarChart(data, options = {}) {
    let max = 0;
    data.forEach(d => {
        const val = d.income || d.value || 0;
        if (val > max) max = val;
    });
    if (max === 0) max = 1000000;

    const colsHtml = data.map((item, idx) => {
        const val = item.income || item.value || 0;
        const heightPct = Math.max(Math.min((val / max) * 100, 100), 12);
        const isActive = item.isActive !== undefined ? item.isActive : (idx === Math.floor(data.length / 2));
        const pctText = item.pct || (isActive ? '+14%' : `+${Math.floor(Math.random()*15 + 5)}%`);
        const labelText = item.label || `M${idx+1}`;
        
        return `
            <div class="chart-col" data-idx="${idx}" data-val="${formatRupiah(val)} (${pctText})">
                ${isActive ? `<div class="chart-tooltip-popup animate-fade-in" style="top: -42px;">${formatRupiah(val)}</div>` : ''}
                <div class="chart-col-pct" style="${isActive ? 'top: -20px; font-weight: 700; color: var(--accent-primary);' : ''}">${pctText}</div>
                <div class="chart-col-bar ${isActive ? 'active' : 'passive'}" style="height: ${heightPct}%;"></div>
                <div class="chart-col-label">${labelText}</div>
            </div>
        `;
    }).join('');

    return `
        <div class="reference-bar-chart">
            ${colsHtml}
        </div>
    `;
}

export function createBarChart(data, options = {}) {
    return createReferenceBarChart(data, options);
}

export function createProgressBar(value, max, color = 'var(--accent-primary)') {
    const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
    return `
        <div class="progress-track" style="height: 8px; background: var(--pill-bg);">
            <div class="progress-fill-blue" style="width: ${pct}%; background: ${color}; height: 100%; border-radius: var(--radius-full);"></div>
        </div>
    `;
}
