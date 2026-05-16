/**
 * HUS Dashboard - Standalone Version
 * Sin dependencias de servidor, solo HTML + JS + CSS
 * Funciona abriendo el index.html directamente en el navegador
 */

// ============================================
// DATOS DE EJEMPLO (207 Indicadores simplificados)
// ============================================

const SAMPLE_INDICATORS = [
  {
    id: 'IND-001',
    code: 'CODE-001',
    name: 'Tiempo Promedio de Atención en Urgencias',
    area: 'Urgencias',
    unit: 'minutos',
    frequency: 'Mensual',
    processId: 'PROC-001',
    direction: 'min',
    currentValue: 45,
    targetValue: 30,
    lastUpdate: '2026-05-16',
    historicalDataPoints: 24,
    history: [
      { month: 'Mayo 2024', value: 52 },
      { month: 'Junio 2024', value: 50 },
      { month: 'Julio 2024', value: 48 },
      { month: 'Agosto 2024', value: 46 },
      { month: 'Septiembre 2024', value: 44 },
      { month: 'Octubre 2024', value: 43 },
      { month: 'Noviembre 2024', value: 42 },
      { month: 'Diciembre 2024', value: 40 },
      { month: 'Enero 2025', value: 39 },
      { month: 'Febrero 2025', value: 38 },
      { month: 'Marzo 2025', value: 37 },
      { month: 'Abril 2025', value: 45 }
    ]
  },
  {
    id: 'IND-002',
    code: 'CODE-002',
    name: 'Ocupación Hospitalaria',
    area: 'Hospitalización',
    unit: '%',
    frequency: 'Mensual',
    processId: 'PROC-002',
    direction: 'max',
    currentValue: 78,
    targetValue: 85,
    lastUpdate: '2026-05-16',
    historicalDataPoints: 24,
    history: [
      { month: 'Mayo 2024', value: 65 },
      { month: 'Junio 2024', value: 68 },
      { month: 'Julio 2024', value: 72 },
      { month: 'Agosto 2024', value: 75 },
      { month: 'Septiembre 2024', value: 78 },
      { month: 'Octubre 2024', value: 80 },
      { month: 'Noviembre 2024', value: 82 },
      { month: 'Diciembre 2024', value: 81 },
      { month: 'Enero 2025', value: 79 },
      { month: 'Febrero 2025', value: 77 },
      { month: 'Marzo 2025', value: 75 },
      { month: 'Abril 2025', value: 78 }
    ]
  },
  {
    id: 'IND-003',
    code: 'CODE-003',
    name: 'Satisfacción del Paciente',
    area: 'Calidad',
    unit: 'puntos',
    frequency: 'Mensual',
    processId: 'PROC-003',
    direction: 'max',
    currentValue: 92,
    targetValue: 90,
    lastUpdate: '2026-05-16',
    historicalDataPoints: 24,
    history: [
      { month: 'Mayo 2024', value: 85 },
      { month: 'Junio 2024', value: 86 },
      { month: 'Julio 2024', value: 87 },
      { month: 'Agosto 2024', value: 88 },
      { month: 'Septiembre 2024', value: 89 },
      { month: 'Octubre 2024', value: 90 },
      { month: 'Noviembre 2024', value: 91 },
      { month: 'Diciembre 2024', value: 91 },
      { month: 'Enero 2025', value: 92 },
      { month: 'Febrero 2025', value: 92 },
      { month: 'Marzo 2025', value: 93 },
      { month: 'Abril 2025', value: 92 }
    ]
  },
  {
    id: 'IND-004',
    code: 'CODE-004',
    name: 'Infecciones Intrahospitalarias',
    area: 'Infecciones',
    unit: 'casos',
    frequency: 'Mensual',
    processId: 'PROC-004',
    direction: 'min',
    currentValue: 8,
    targetValue: 5,
    lastUpdate: '2026-05-16',
    historicalDataPoints: 24,
    history: [
      { month: 'Mayo 2024', value: 15 },
      { month: 'Junio 2024', value: 14 },
      { month: 'Julio 2024', value: 13 },
      { month: 'Agosto 2024', value: 12 },
      { month: 'Septiembre 2024', value: 11 },
      { month: 'Octubre 2024', value: 10 },
      { month: 'Noviembre 2024', value: 9 },
      { month: 'Diciembre 2024', value: 8 },
      { month: 'Enero 2025', value: 7 },
      { month: 'Febrero 2025', value: 6 },
      { month: 'Marzo 2025', value: 5 },
      { month: 'Abril 2025', value: 8 }
    ]
  },
  {
    id: 'IND-005',
    code: 'CODE-005',
    name: 'Disponibilidad de Equipos Médicos',
    area: 'Infraestructura',
    unit: '%',
    frequency: 'Mensual',
    processId: 'PROC-005',
    direction: 'max',
    currentValue: 95,
    targetValue: 98,
    lastUpdate: '2026-05-16',
    historicalDataPoints: 24,
    history: [
      { month: 'Mayo 2024', value: 88 },
      { month: 'Junio 2024', value: 90 },
      { month: 'Julio 2024', value: 91 },
      { month: 'Agosto 2024', value: 92 },
      { month: 'Septiembre 2024', value: 93 },
      { month: 'Octubre 2024', value: 94 },
      { month: 'Noviembre 2024', value: 95 },
      { month: 'Diciembre 2024', value: 95 },
      { month: 'Enero 2025', value: 95 },
      { month: 'Febrero 2025', value: 96 },
      { month: 'Marzo 2025', value: 96 },
      { month: 'Abril 2025', value: 95 }
    ]
  }
];

// ============================================
// ESTADO GLOBAL
// ============================================

const state = {
  currentScreen: 'dashboard',
  selectedArea: 'all',
  selectedIndicator: null,
  filteredIndicators: SAMPLE_INDICATORS,
  trendChart: null,
  statusChart: null,
  detailChart: null,
  authenticated: false,
  currentUser: null
};

// ============================================
// AUTENTICACIÓN CLIENTE-SIDE
// ============================================

const users = {
  'admin': 'admin',
  'usuario': 'usuario123'
};

function initAuthentication() {
  const loginView = document.getElementById('loginView');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');

  // Verificar si ya hay sesión guardada
  const savedUser = localStorage.getItem('husUser');
  if (savedUser) {
    state.currentUser = savedUser;
    state.authenticated = true;
    loginView.classList.add('hidden');
    unlockApp();
    return;
  }

  // Mostrar login
  loginView.classList.remove('hidden');

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    // Verificar credenciales
    if (users[username] === password) {
      state.currentUser = username;
      state.authenticated = true;
      localStorage.setItem('husUser', username);
      
      loginView.classList.add('hidden');
      unlockApp();
      setUserInUI(username);
      initializeApp();
    } else {
      loginError.textContent = '❌ Usuario o contraseña incorrectos';
      loginError.style.display = 'block';
    }
  });

  logoutBtn.addEventListener('click', () => {
    state.authenticated = false;
    state.currentUser = null;
    localStorage.removeItem('husUser');
    loginView.classList.remove('hidden');
    loginForm.reset();
    loginError.textContent = '';
    lockApp();
  });
}

function lockApp() {
  document.body.classList.add('auth-locked');
}

function unlockApp() {
  document.body.classList.remove('auth-locked');
}

function setUserInUI(username) {
  const avatar = document.getElementById('userAvatar');
  const userPill = document.getElementById('authUserPill');
  
  const initials = username.substring(0, 2).toUpperCase();
  
  if (avatar) avatar.textContent = initials;
  if (userPill) userPill.textContent = `Usuario: ${username}`;
}

// ============================================
// FUNCIONES UTILITARIAS
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

function getStatusText(status) {
  const map = {
    'ok': 'En meta',
    'warning': 'En vigilancia',
    'critical': 'Fuera de meta'
  };
  return map[status] || 'Sin estado';
}

function getStatusEmoji(status) {
  const map = {
    'ok': '✅',
    'warning': '⚠️',
    'critical': '🔴'
  };
  return map[status] || '?';
}

function getAreas() {
  return [...new Set(SAMPLE_INDICATORS.map(ind => ind.area))].sort();
}

function getIndicatorsByArea(area) {
  if (area === 'all') return SAMPLE_INDICATORS;
  return SAMPLE_INDICATORS.filter(ind => ind.area === area);
}

// ============================================
// ACTUALIZAR KPIs
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
  
  document.getElementById('kpi-total').textContent = indicators.length;
  document.getElementById('kpi-ok').textContent = ok;
  document.getElementById('kpi-warning').textContent = warning;
  document.getElementById('kpi-critical').textContent = critical;
  document.getElementById('kpi-compliance').textContent = compliance + '%';
}

// ============================================
// CREAR GRÁFICOS
// ============================================

function createTrendChart() {
  const canvas = document.getElementById('trendChart');
  if (!canvas || typeof Chart === 'undefined') return;
  
  const ctx = canvas.getContext('2d');
  
  // Últimos 12 meses
  const labels = [];
  const values = [];
  
  SAMPLE_INDICATORS[0].history.slice(-12).forEach(h => {
    labels.push(h.month.split(' ')[0]);
    values.push(h.value);
  });
  
  if (state.trendChart) state.trendChart.destroy();
  
  state.trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Promedio de Indicadores',
        data: values,
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

function createStatusChart() {
  const canvas = document.getElementById('statusChart');
  if (!canvas || typeof Chart === 'undefined') return;
  
  const ctx = canvas.getContext('2d');
  
  const statuses = SAMPLE_INDICATORS.map(ind =>
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
  const canvas = document.getElementById('detailChart');
  if (!canvas || !indicator || typeof Chart === 'undefined') return;
  
  const ctx = canvas.getContext('2d');
  const last24 = indicator.history.slice(-24);
  
  if (state.detailChart) state.detailChart.destroy();
  
  state.detailChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: last24.map(h => h.month.substring(0, 3)),
      datasets: [{
        label: indicator.name.substring(0, 30),
        data: last24.map(h => h.value),
        borderColor: '#0f4d8a',
        backgroundColor: 'rgba(15, 77, 138, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
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
// RENDERIZAR LISTAS
// ============================================

function renderCriticalList() {
  const criticalList = document.getElementById('critical-list');
  criticalList.innerHTML = '';
  
  const criticals = SAMPLE_INDICATORS.filter(ind =>
    calculateStatus(ind.currentValue, ind.targetValue, ind.direction) === 'critical'
  );
  
  if (criticals.length === 0) {
    criticalList.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #2cbf67;">✅ No hay indicadores fuera de meta</p>';
    return;
  }
  
  criticals.forEach(ind => {
    const status = calculateStatus(ind.currentValue, ind.targetValue, ind.direction);
    const item = document.createElement('div');
    item.className = `critical-item ${status}`;
    item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div class="critical-item-name">${ind.name.substring(0, 40)}</div>
        <span>${getStatusEmoji(status)}</span>
      </div>
      <div class="critical-item-value">${ind.currentValue} ${ind.unit}</div>
      <div class="critical-item-meta">Meta: ${ind.targetValue} ${ind.unit}</div>
    `;
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => showDetail(ind.code));
    criticalList.appendChild(item);
  });
}

function renderAreas() {
  const areasGrid = document.getElementById('areas-grid');
  areasGrid.innerHTML = '';
  
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
      <h4>${area}</h4>
      <div style="margin-top: 10px; font-size: 12px;">
        <div>✅ En meta: ${ok}</div>
        <div>⚠️ En vigilancia: ${warning}</div>
        <div>🔴 Fuera de meta: ${critical}</div>
      </div>
    `;
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      state.selectedArea = area;
      state.filteredIndicators = getIndicatorsByArea(area);
      renderTable();
      showScreen('table');
    });
    areasGrid.appendChild(card);
  });
}

function renderTable() {
  const tableBody = document.getElementById('table-body');
  tableBody.innerHTML = '';
  
  const indicators = state.filteredIndicators;
  
  indicators.forEach(ind => {
    const status = calculateStatus(ind.currentValue, ind.targetValue, ind.direction);
    const row = document.createElement('tr');
    row.className = `status-${status}`;
    row.innerHTML = `
      <td>${ind.code}</td>
      <td>${ind.name}</td>
      <td>${ind.currentValue}</td>
      <td>${ind.targetValue}</td>
      <td>${getStatusEmoji(status)} ${getStatusText(status)}</td>
      <td>${ind.unit}</td>
      <td>${ind.area}</td>
      <td>${new Date(ind.lastUpdate).toLocaleDateString('es-ES')}</td>
      <td><button onclick="window.showDetail('${ind.code}')" class="btn btn-small">Ver</button></td>
    `;
    tableBody.appendChild(row);
  });
}

function showDetail(code) {
  const indicator = SAMPLE_INDICATORS.find(ind => ind.code === code);
  if (!indicator) return;
  
  state.selectedIndicator = indicator;
  
  document.getElementById('detail-title').textContent = indicator.name;
  document.getElementById('detail-current').textContent = indicator.currentValue;
  document.getElementById('detail-unit').textContent = indicator.unit;
  document.getElementById('detail-target').textContent = indicator.targetValue;
  
  const status = calculateStatus(indicator.currentValue, indicator.targetValue, indicator.direction);
  document.getElementById('detail-status').textContent = getStatusText(status);
  document.getElementById('detail-status').className = `status-badge ${status}`;
  
  document.getElementById('detail-name').textContent = indicator.name;
  document.getElementById('detail-area').textContent = indicator.area;
  document.getElementById('detail-unit-full').textContent = indicator.unit;
  document.getElementById('detail-process').textContent = indicator.processId;
  document.getElementById('detail-frequency').textContent = indicator.frequency;
  document.getElementById('detail-direction').textContent = indicator.direction === 'min' ? 'Menor es mejor' : 'Mayor es mejor';
  document.getElementById('detail-update').textContent = new Date(indicator.lastUpdate).toLocaleDateString('es-ES');
  document.getElementById('detail-datapoints').textContent = indicator.historicalDataPoints;
  
  // Histórico
  const historyBody = document.getElementById('history-body');
  historyBody.innerHTML = '';
  indicator.history.slice(-12).forEach(h => {
    const row = document.createElement('tr');
    const s = calculateStatus(h.value, indicator.targetValue, indicator.direction);
    row.innerHTML = `
      <td>${h.month}</td>
      <td>${h.value}</td>
      <td>${getStatusEmoji(s)} ${getStatusText(s)}</td>
    `;
    historyBody.appendChild(row);
  });
  
  document.getElementById('detail-content').classList.remove('hidden');
  document.getElementById('detail-empty').classList.add('hidden');
  
  createDetailChart(indicator);
  showScreen('detail');
}

// ============================================
// NAVEGACIÓN
// ============================================

function showScreen(screenName) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`${screenName}-screen`).classList.add('active');
  
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.dataset.screen === screenName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  state.currentScreen = screenName;
}

// ============================================
// CARGAR EXCEL
// ============================================

function handleExcelUpload(file) {
  if (!file || typeof XLSX === 'undefined') {
    alert('Archivo no seleccionado o XLSX no disponible');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      
      console.log('Excel cargado:', jsonData);
      alert('✅ Archivo Excel cargado exitosamente');
    } catch (error) {
      console.error('Error al cargar Excel:', error);
      alert('❌ Error al cargar el archivo');
    }
  };
  reader.readAsArrayBuffer(file);
}

// ============================================
// INICIALIZAR APP
// ============================================

function initializeApp() {
  // Eventos de navegación
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showScreen(btn.dataset.screen);
    });
  });
  
  // Back button
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      showScreen('table');
    });
  }
  
  // Upload Excel
  const uploadBtn = document.getElementById('uploadExcelBtn');
  const excelInput = document.getElementById('excelInput');
  
  if (uploadBtn && excelInput) {
    uploadBtn.addEventListener('click', () => excelInput.click());
    excelInput.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        handleExcelUpload(e.target.files[0]);
      }
    });
  }
  
  // Reset data
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('¿Restaurar datos originales?')) {
        state.filteredIndicators = [...SAMPLE_INDICATORS];
        renderTable();
        renderCriticalList();
        updateKPIs();
        alert('✅ Datos restaurados');
      }
    });
  }
  
  // Filtros de tabla
  const areaFilter = document.getElementById('areaFilter');
  const statusFilter = document.getElementById('statusFilter');
  const searchInput = document.getElementById('searchInput');
  
  const updateFilters = () => {
    let filtered = [...SAMPLE_INDICATORS];
    
    const area = areaFilter?.value || 'all';
    if (area !== 'all') {
      filtered = filtered.filter(ind => ind.area === area);
    }
    
    const statusVal = statusFilter?.value || 'all';
    if (statusVal !== 'all') {
      filtered = filtered.filter(ind => {
        const s = calculateStatus(ind.currentValue, ind.targetValue, ind.direction);
        return s === statusVal;
      });
    }
    
    const search = searchInput?.value?.toLowerCase() || '';
    if (search) {
      filtered = filtered.filter(ind =>
        ind.name.toLowerCase().includes(search) ||
        ind.code.toLowerCase().includes(search)
      );
    }
    
    state.filteredIndicators = filtered;
    renderTable();
    updateKPIs();
  };
  
  if (areaFilter) areaFilter.addEventListener('change', updateFilters);
  if (statusFilter) statusFilter.addEventListener('change', updateFilters);
  if (searchInput) searchInput.addEventListener('input', updateFilters);
  
  // Poblar áreas en filtro
  if (areaFilter) {
    getAreas().forEach(area => {
      const option = document.createElement('option');
      option.value = area;
      option.textContent = area;
      areaFilter.appendChild(option);
    });
  }
  
  // Renderizar inicial
  renderCriticalList();
  renderAreas();
  renderTable();
  updateKPIs();
  createTrendChart();
  createStatusChart();
  
  console.log('✅ Dashboard inicializado correctamente');
}

// ============================================
// INICIAR AL CARGAR
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initAuthentication();
});

// Exponer funciones globales para HTML
window.showDetail = showDetail;
window.showScreen = showScreen;
