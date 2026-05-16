/**
 * HUS Dashboard - Aplicación Principal
 * Sistema de Indicadores de Calidad
 */

import { INDICATORS_DATABASE, getIndicatorsByArea, getAreas, getSummaryMetrics } from './shared/data/indicatorsDatabase.js';
import { initAuthentication } from './presentation/middleware/auth.js';

// ============================================
// ESTADO GLOBAL
// ============================================

const state = {
  currentScreen: 'dashboard',
  selectedArea: 'all',
  selectedIndicator: null,
  filteredIndicators: INDICATORS_DATABASE,
  trendChart: null,
  statusChart: null,
  detailChart: null
};

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
  // Navigation
  navButtons: document.querySelectorAll('.nav-btn'),
  screens: document.querySelectorAll('.screen'),
  backBtn: document.getElementById('backBtn'),
  
  // Upload
  uploadExcelBtn: document.getElementById('uploadExcelBtn'),
  excelInput: document.getElementById('excelInput'),
  resetBtn: document.getElementById('resetBtn'),
  
  // KPI Cards
  kpiTotal: document.getElementById('kpi-total'),
  kpiOk: document.getElementById('kpi-ok'),
  kpiWarning: document.getElementById('kpi-warning'),
  kpiCritical: document.getElementById('kpi-critical'),
  kpiCompliance: document.getElementById('kpi-compliance'),
  
  // Charts
  trendChartCanvas: document.getElementById('trendChart'),
  statusChartCanvas: document.getElementById('statusChart'),
  detailChartCanvas: document.getElementById('detailChart'),
  
  // Critical List
  criticalList: document.getElementById('critical-list'),
  
  // Areas
  areasGrid: document.getElementById('areas-grid'),
  
  // Table
  areaFilter: document.getElementById('areaFilter'),
  statusFilter: document.getElementById('statusFilter'),
  searchInput: document.getElementById('searchInput'),
  tableBody: document.getElementById('table-body'),
  
  // Detail
  detailTitle: document.getElementById('detail-title'),
  detailContent: document.getElementById('detail-content'),
  detailEmpty: document.getElementById('detail-empty'),
  detailCurrent: document.getElementById('detail-current'),
  detailUnit: document.getElementById('detail-unit'),
  detailTarget: document.getElementById('detail-target'),
  detailStatus: document.getElementById('detail-status'),
  detailName: document.getElementById('detail-name'),
  detailArea: document.getElementById('detail-area'),
  detailUnitFull: document.getElementById('detail-unit-full'),
  detailProcess: document.getElementById('detail-process'),
  detailFrequency: document.getElementById('detail-frequency'),
  detailDirection: document.getElementById('detail-direction'),
  detailUpdate: document.getElementById('detail-update'),
  detailDatapoints: document.getElementById('detail-datapoints'),
  historyBody: document.getElementById('history-body')
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function calculateStatus(current, target, direction) {
  if (direction === 'min') {
    if (current <= target * 0.9) return 'ok';
    if (current <= target * 1.1) return 'warning';
    return 'critical';
  } else {
    if (current >= target * 0.9) return 'ok';
    if (current >= target * 0.75) return 'warning';
    return 'critical';
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
}

function getStatusText(status) {
  const map = { 'ok': 'En meta', 'warning': 'En vigilancia', 'critical': 'Fuera de meta' };
  return map[status] || 'Sin estado';
}

// ============================================
// KPI & METRICS
// ============================================

function updateKPIs() {
  const indicators = state.filteredIndicators;
  
  const statuses = indicators.map(ind => 
    calculateStatus(ind.currentValue, ind.targetValue, ind.direction)
  );
  
  const ok = statuses.filter(s => s === 'ok').length;
  const warning = statuses.filter(s => s === 'warning').length;
  const critical = statuses.filter(s => s === 'critical').length;
  const compliance = Math.round((ok / indicators.length) * 100);
  
  elements.kpiTotal.textContent = indicators.length;
  elements.kpiOk.textContent = ok;
  elements.kpiWarning.textContent = warning;
  elements.kpiCritical.textContent = critical;
  elements.kpiCompliance.textContent = compliance + '%';
}

// ============================================
// CHARTS
// ============================================

function createTrendChart() {
  if (!elements.trendChartCanvas) return;
  
  const ctx = elements.trendChartCanvas.getContext('2d');
  
  // Tomar últimos 12 meses de los últimos 5 indicadores
  const last12Months = [];
  const labels = [];
  const avgValues = [];
  
  // Recolectar últimos 12 meses
  INDICATORS_DATABASE.forEach(ind => {
    ind.history.slice(-12).forEach((h, idx) => {
      if (!labels[idx]) labels[idx] = h.month;
      if (!avgValues[idx]) avgValues[idx] = [];
      avgValues[idx].push(h.value);
    });
  });
  
  const finalValues = avgValues.map(v => 
    v.length > 0 ? Math.round(v.reduce((a, b) => a + b, 0) / v.length * 100) / 100 : 0
  );
  
  if (state.trendChart) state.trendChart.destroy();
  
  state.trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.slice(-12),
      datasets: [{
        label: 'Promedio de Indicadores',
        data: finalValues.slice(-12),
        borderColor: '#0f4d8a',
        backgroundColor: 'rgba(15, 77, 138, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#0f4d8a',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: true, labels: { usePointStyle: true } }
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: { color: 'rgba(0, 0, 0, 0.05)' }
        }
      }
    }
  });
}

function createStatusChart() {
  if (!elements.statusChartCanvas) return;
  
  const ctx = elements.statusChartCanvas.getContext('2d');
  
  const statuses = INDICATORS_DATABASE.map(ind =>
    calculateStatus(ind.currentValue, ind.targetValue, ind.direction)
  );
  
  const ok = statuses.filter(s => s === 'ok').length;
  const warning = statuses.filter(s => s === 'warning').length;
  const critical = statuses.filter(s => s === 'critical').length;
  
  if (state.statusChart) state.statusChart.destroy();
  
  state.statusChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['En meta', 'En vigilancia', 'Fuera de meta'],
      datasets: [{
        data: [ok, warning, critical],
        backgroundColor: ['#2cbf67', '#f39c12', '#e74c3c'],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

function createDetailChart(indicator) {
  if (!elements.detailChartCanvas || !indicator) return;
  
  const ctx = elements.detailChartCanvas.getContext('2d');
  const last24 = indicator.history.slice(-24);
  
  if (state.detailChart) state.detailChart.destroy();
  
  state.detailChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: last24.map(h => h.month.substring(0, 3)),
      datasets: [{
        label: indicator.name.substring(0, 30) + '...',
        data: last24.map(h => h.value),
        borderColor: '#0f4d8a',
        backgroundColor: 'rgba(15, 77, 138, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#0f4d8a'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: true }
      }
    }
  });
}

// ============================================
// RENDERING FUNCTIONS
// ============================================

function renderCriticalList() {
  elements.criticalList.innerHTML = '';
  
  const criticals = INDICATORS_DATABASE.filter(ind =>
    calculateStatus(ind.currentValue, ind.targetValue, ind.direction) === 'critical'
  ).slice(0, 6);
  
  if (criticals.length === 0) {
    elements.criticalList.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #2cbf67;">✅ No hay indicadores fuera de meta</p>';
    return;
  }
  
  criticals.forEach(ind => {
    const item = document.createElement('div');
    item.className = 'critical-item';
    item.innerHTML = `
      <div class="critical-item-name">${ind.name.substring(0, 50)}</div>
      <div class="critical-item-value">${ind.currentValue} ${ind.unit}</div>
      <div class="critical-item-meta">Meta: ${ind.targetValue} ${ind.unit}</div>
    `;
    item.addEventListener('click', () => showDetail(ind.code));
    elements.criticalList.appendChild(item);
  });
}

function renderAreas() {
  elements.areasGrid.innerHTML = '';
  
  getAreas().forEach(area => {
    const areaIndicators = getIndicatorsByArea(area);
    const statuses = areaIndicators.map(ind =>
      calculateStatus(ind.currentValue, ind.targetValue, ind.direction)
    );
    
    const ok = statuses.filter(s => s === 'ok').length;
    const warning = statuses.filter(s => s === 'warning').length;
    const critical = statuses.filter(s => s === 'critical').length;
    
    const card = document.createElement('div');
    card.className = 'area-card';
    card.innerHTML = `
      <h3>${area}</h3>
      <div class="area-stats">
        <div class="area-stat">
          <div class="area-stat-value">${areaIndicators.length}</div>
          <div class="area-stat-label">Total</div>
        </div>
        <div class="area-stat">
          <div class="area-stat-value" style="color: #2cbf67;">${ok}</div>
          <div class="area-stat-label">En meta</div>
        </div>
        <div class="area-stat">
          <div class="area-stat-value" style="color: #e74c3c;">${critical}</div>
          <div class="area-stat-label">Fuera meta</div>
        </div>
      </div>
      <button class="area-button">Ver Indicadores →</button>
    `;
    
    card.querySelector('.area-button').addEventListener('click', () => {
      state.selectedArea = area;
      filterAndRenderTable();
      switchScreen('table');
    });
    
    elements.areasGrid.appendChild(card);
  });
}

function filterAndRenderTable() {
  // Filtrar por área
  let filtered = state.selectedArea === 'all'
    ? INDICATORS_DATABASE
    : getIndicatorsByArea(state.selectedArea);
  
  // Filtrar por estado
  if (elements.statusFilter.value !== 'all') {
    filtered = filtered.filter(ind =>
      calculateStatus(ind.currentValue, ind.targetValue, ind.direction) ===
      elements.statusFilter.value
    );
  }
  
  // Filtrar por búsqueda
  if (elements.searchInput.value) {
    const query = elements.searchInput.value.toLowerCase();
    filtered = filtered.filter(ind =>
      ind.name.toLowerCase().includes(query) ||
      ind.code.includes(query)
    );
  }
  
  state.filteredIndicators = filtered;
  
  // Renderizar tabla
  elements.tableBody.innerHTML = '';
  
  filtered.forEach(ind => {
    const status = calculateStatus(ind.currentValue, ind.targetValue, ind.direction);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${ind.code}</td>
      <td>${ind.name.substring(0, 50)}</td>
      <td>${ind.currentValue}</td>
      <td>${ind.targetValue}</td>
      <td><span class="status-badge ${status}">${getStatusText(status)}</span></td>
      <td>${ind.unit}</td>
      <td>${ind.area.substring(0, 30)}</td>
      <td>${formatDate(ind.lastUpdate)}</td>
      <td><button class="btn btn-primary" onclick="app.showDetail('${ind.code}')">Ver</button></td>
    `;
    elements.tableBody.appendChild(row);
  });
  
  updateKPIs();
}

function showDetail(code) {
  const indicator = INDICATORS_DATABASE.find(ind => ind.code === code);
  if (!indicator) return;
  
  state.selectedIndicator = indicator;
  const status = calculateStatus(indicator.currentValue, indicator.targetValue, indicator.direction);
  
  elements.detailTitle.textContent = indicator.name;
  elements.detailContent.classList.remove('hidden');
  elements.detailEmpty.classList.add('hidden');
  
  elements.detailCurrent.textContent = indicator.currentValue;
  elements.detailUnit.textContent = indicator.unit;
  elements.detailTarget.textContent = indicator.targetValue;
  elements.detailStatus.textContent = getStatusText(status);
  elements.detailName.textContent = indicator.name;
  elements.detailArea.textContent = indicator.area;
  elements.detailUnitFull.textContent = indicator.unit;
  elements.detailProcess.textContent = indicator.processId;
  elements.detailFrequency.textContent = indicator.frequency;
  elements.detailDirection.textContent = indicator.direction === 'min' ? 'Menor es mejor' : 'Mayor es mejor';
  elements.detailUpdate.textContent = formatDate(indicator.lastUpdate);
  elements.detailDatapoints.textContent = indicator.historicalDataPoints;
  
  // Renderizar histórico
  elements.historyBody.innerHTML = '';
  const last12 = indicator.history.slice(-12).reverse();
  last12.forEach(h => {
    const row = document.createElement('tr');
    const hStatus = calculateStatus(h.value, indicator.targetValue, indicator.direction);
    row.innerHTML = `
      <td>${h.month}</td>
      <td>${h.value}</td>
      <td><span class="status-badge ${hStatus}">${getStatusText(hStatus)}</span></td>
    `;
    elements.historyBody.appendChild(row);
  });
  
  createDetailChart(indicator);
  switchScreen('detail');
}

// ============================================
// NAVIGATION
// ============================================

function switchScreen(screenName) {
  state.currentScreen = screenName;
  
  // Update nav buttons
  elements.navButtons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-screen') === screenName) {
      btn.classList.add('active');
    }
  });
  
  // Update screens
  elements.screens.forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(`${screenName}-screen`).classList.add('active');
  
  // Create charts when switching to dashboard
  if (screenName === 'dashboard') {
    setTimeout(() => {
      createTrendChart();
      createStatusChart();
      updateKPIs();
      renderCriticalList();
    }, 100);
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  // Navigation
  elements.navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const screen = btn.getAttribute('data-screen');
      switchScreen(screen);
    });
  });
  
  // Upload Excel
  elements.uploadExcelBtn.addEventListener('click', () => {
    elements.excelInput.click();
  });
  
  elements.excelInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          console.log('Excel cargado:', workbook.SheetNames);
          // Aquí se puede procesar el nuevo Excel
        } catch (err) {
          alert('Error al cargar el archivo: ' + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  });
  
  // Reset
  elements.resetBtn.addEventListener('click', () => {
    if (confirm('¿Restaurar datos base?')) {
      window.location.reload();
    }
  });
  
  // Back button
  elements.backBtn.addEventListener('click', () => {
    switchScreen('table');
  });
  
  // Table filters
  elements.areaFilter.addEventListener('change', filterAndRenderTable);
  elements.statusFilter.addEventListener('change', filterAndRenderTable);
  elements.searchInput.addEventListener('input', filterAndRenderTable);
  
  // Populate area filter
  getAreas().forEach(area => {
    const option = document.createElement('option');
    option.value = area;
    option.textContent = area;
    elements.areaFilter.appendChild(option);
  });
}

// ============================================
// INITIALIZATION
// ============================================

function init() {
  console.log('🚀 Inicializando Dashboard HUS');
  console.log(`📊 ${INDICATORS_DATABASE.length} indicadores cargados`);
  console.log(`📅 Datos: 2010-2026`);
  
  const metrics = getSummaryMetrics();
  console.log('📈 Métricas:', metrics);
  
  // Cargar logo
  const husLogo = document.getElementById('husLogo');
  const logoFallback = document.getElementById('logoFallback');
  if (husLogo) {
    husLogo.addEventListener('error', () => {
      husLogo.classList.add('hidden');
      if (logoFallback) logoFallback.classList.remove('hidden');
    });
  }
  
  // Setup eventos
  setupEventListeners();
  
  // Renderizar inicial
  switchScreen('dashboard');
  renderAreas();
  filterAndRenderTable();
}

// Exponerde app para ser accesible desde HTML
window.app = {
  showDetail,
  switchScreen
};

// Iniciar cuando DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  initAuthentication(init);
});
