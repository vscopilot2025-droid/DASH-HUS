/**
 * Generador de 207 Indicadores HUS
 * Mantiene los 68 reales y crea 139 sintéticos
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Leer Excel real
const excelPath = './Reporte_Indicadores_2010_2026.xlsx';
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

const AREA_MAIN = 'Gestión Servicio de Urgencias';
const AREA_UFZ = 'Gestión Servicio de Urgencias UFZ';
const TARGET_MAIN_COUNT = 185;
const TARGET_UFZ_COUNT = 22;

// ============================================
// EXTRAER INDICADORES REALES
// ============================================

const realIndicators = [];

// Identificar columnas de meses
const headerRow = data[0];
const monthColumns = [];
for (let i = 0; i < headerRow.length; i++) {
  const header = (headerRow[i] || '').toString().toLowerCase().trim();
  if (header.match(/\d{4}-\d{2}|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre/i)) {
    monthColumns.push({ index: i, header: headerRow[i] });
  }
}

console.log(`📅 Encontradas ${monthColumns.length} columnas de meses`);

// Procesar filas
for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
  const row = data[rowIdx];
  const id = (row[0] || '').toString().trim();
  const code = (row[1] || '').toString().trim();
  const processName = (row[2] || '').toString().trim();
  const indicatorName = (row[3] || '').toString().trim();
  const unit = (row[4] || '').toString().trim();
  const frequency = (row[5] || '').toString().trim();

  // Validar que tenga ID e indicador
  if (!id || !id.match(/^\d+/) || !indicatorName) {
    continue;
  }

  // Extraer valores históricos
  const history = [];
  monthColumns.forEach((monthCol, idx) => {
    const value = parseFloat(row[monthCol.index]);
    if (!isNaN(value) && value !== null) {
      const month = monthCol.header.toString().trim();
      history.push({
        date: convertMonthToDate(month),
        month: formatMonth(month),
        value: Math.round(value * 100) / 100
      });
    }
  });

  // Solo incluir si tiene historia
  if (history.length > 0) {
    const lastValue = history[history.length - 1].value;
    const avgValue = history.reduce((a, b) => a + b.value, 0) / history.length;
    const direction = detectDirection(indicatorName);

    realIndicators.push({
      id: `IND-${id}`,
      code: code || `CODE-${id}`,
      name: indicatorName,
      area: normalizeArea(processName, indicatorName),
      unit: unit || 'Dato',
      frequency: frequency || 'Mensual',
      processId: code || `PROC-${id}`,
      direction: direction,
      currentValue: lastValue,
      targetValue: Math.round(avgValue * 1.1 * 100) / 100,
      lastUpdate: history[history.length - 1].date,
      historicalDataPoints: history.length,
      history: history
    });
  }
}

console.log(`✅ ${realIndicators.length} indicadores reales extraídos`);

// ============================================
// GENERAR INDICADORES SINTÉTICOS
// ============================================

const indicatorTemplates = [
  { suffix: 'Tasa de', unit: 'Tasa por mil', direction: 'min' },
  { suffix: 'Número de', unit: 'Dato', direction: 'max' },
  { suffix: 'Porcentaje de', unit: '%', direction: 'max' },
  { suffix: 'Tiempo promedio de', unit: 'Horas', direction: 'min' },
  { suffix: 'Capacidad utilizada en', unit: '%', direction: 'max' },
  { suffix: 'Índice de', unit: 'Índice', direction: 'max' },
  { suffix: 'Promedio de', unit: 'Valor', direction: 'max' },
  { suffix: 'Duración promedio de', unit: 'Minutos', direction: 'min' }
];

const indicatorTopics = [
  'atención al paciente',
  'tiempo de respuesta',
  'calidad de servicio',
  'satisfacción del usuario',
  'eficiencia operativa',
  'recursos disponibles',
  'capacitación del personal',
  'cumplimiento de protocolos',
  'reducción de riesgos',
  'disponibilidad de equipos',
  'gestión de colas',
  'precisión diagnóstica',
  'efectividad de tratamiento',
  'prevención de infecciones',
  'coordinación interdepartamental',
  'documentación clínica',
  'seguimiento a pacientes',
  'gestión de emergencias',
  'mantenimiento preventivo',
  'control de costos'
];

const areas_list = [AREA_MAIN, AREA_UFZ];

const syntheticIndicators = [];
const neededCount = 207 - realIndicators.length;

for (let i = 0; i < neededCount; i++) {
  const template = indicatorTemplates[Math.floor(Math.random() * indicatorTemplates.length)];
  const topic = indicatorTopics[Math.floor(Math.random() * indicatorTopics.length)];
  const area = areas_list[Math.floor(Math.random() * areas_list.length)];
  
  const id = 10000 + realIndicators.length + i;
  const baseValue = Math.random() * 100;
  
  // Generar historia de 195 meses
  const history = [];
  for (let month = 0; month < 195; month++) {
    const date = new Date(2010, 0, 1);
    date.setMonth(date.getMonth() + month);
    
    // Variación realista
    const trend = Math.sin(month / 30) * 10;
    const noise = (Math.random() - 0.5) * 20;
    const value = Math.max(0, baseValue + trend + noise);
    
    history.push({
      date: date.toISOString().split('T')[0],
      month: formatMonthFromDate(date),
      value: Math.round(value * 100) / 100
    });
  }
  
  const lastValue = history[history.length - 1].value;
  const avgValue = history.reduce((a, b) => a + b.value, 0) / history.length;
  
  // Para sintéticos: 75% en meta, 20% en vigilancia, 5% fuera
  const rand = Math.random();
  let targetValue;
  
  if (template.direction === 'max') {
    if (rand < 0.75) {
      // En meta: target 10-20% más bajo que currentValue
      targetValue = Math.round(lastValue * (0.8 + Math.random() * 0.2) * 100) / 100;
    } else if (rand < 0.95) {
      // En vigilancia: target 20-40% más bajo que currentValue
      targetValue = Math.round(lastValue * (0.6 + Math.random() * 0.2) * 100) / 100;
    } else {
      // Fuera de meta: target más alto que currentValue
      targetValue = Math.round(lastValue * (1.3 + Math.random() * 0.4) * 100) / 100;
    }
  } else {
    if (rand < 0.75) {
      // En meta: target 10-20% más alto que currentValue
      targetValue = Math.round(lastValue * (1.1 + Math.random() * 0.2) * 100) / 100;
    } else if (rand < 0.95) {
      // En vigilancia: target 20-40% más alto que currentValue
      targetValue = Math.round(lastValue * (1.2 + Math.random() * 0.2) * 100) / 100;
    } else {
      // Fuera de meta: target mucho más bajo que currentValue
      targetValue = Math.round(lastValue * (0.6 + Math.random() * 0.2) * 100) / 100;
    }
  }
  
  syntheticIndicators.push({
    id: `IND-${id}`,
    code: `SYN-${String(i + 1).padStart(3, '0')}`,
    name: `${template.suffix} ${topic}`,
    area: area,
    unit: template.unit,
    frequency: 'Mensual',
    processId: `PROC-SYN-${String(i + 1).padStart(3, '0')}`,
    direction: template.direction,
    currentValue: lastValue,
    targetValue: targetValue,
    lastUpdate: history[history.length - 1].date,
    historicalDataPoints: history.length,
    history: history
  });
}

console.log(`🎯 ${syntheticIndicators.length} indicadores sintéticos creados`);

// ============================================
// COMBINAR Y EXPORTAR
// ============================================

const allIndicators = [...realIndicators, ...syntheticIndicators];
allIndicators.forEach(ind => {
  ind.area = normalizeArea(ind.area, ind.name);
});
enforceAreaDistribution(allIndicators, realIndicators.length, TARGET_MAIN_COUNT, TARGET_UFZ_COUNT);

console.log(`📊 TOTAL: ${allIndicators.length} indicadores (${realIndicators.length} reales + ${syntheticIndicators.length} sintéticos)`);

// Generar JavaScript module
const jsContent = `/**
 * HUS INDICATORS DATABASE
 * ${allIndicators.length} Indicadores de Calidad (2010-2026)
 * Incluye: ${realIndicators.length} reales + ${syntheticIndicators.length} sintéticos
 * Generado automáticamente
 */

export const INDICATORS_DATABASE = ${JSON.stringify(allIndicators, null, 2)};

export function getAllIndicators() {
  return INDICATORS_DATABASE;
}

export function getIndicatorsByArea(area) {
  if (area === 'all' || !area) return INDICATORS_DATABASE;
  return INDICATORS_DATABASE.filter(ind => ind.area === area);
}

export function getAreas() {
  return [...new Set(INDICATORS_DATABASE.map(ind => ind.area))].sort();
}

export function getIndicatorById(id) {
  return INDICATORS_DATABASE.find(ind => ind.id === id || ind.code === id);
}

export function getSummaryMetrics() {
  const uniqueAreas = new Set(INDICATORS_DATABASE.map(ind => ind.area));
  const uniqueProcesses = new Set(INDICATORS_DATABASE.map(ind => ind.processId));
  const totalDataPoints = INDICATORS_DATABASE.reduce((sum, ind) => sum + ind.historicalDataPoints, 0);
  const avgDataPoints = Math.round(totalDataPoints / INDICATORS_DATABASE.length);
  
  const allDates = [];
  INDICATORS_DATABASE.forEach(ind => {
    ind.history.forEach(h => allDates.push(new Date(h.date)));
  });
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  
  return {
    totalIndicators: INDICATORS_DATABASE.length,
    totalAreas: uniqueAreas.size,
    totalProcesses: uniqueProcesses.size,
    averageDataPoints: avgDataPoints,
    realIndicators: ${realIndicators.length},
    syntheticIndicators: ${syntheticIndicators.length},
    dateRange: {
      from: minDate.toISOString().split('T')[0],
      to: maxDate.toISOString().split('T')[0]
    }
  };
}
`;

fs.writeFileSync('./src/shared/indicatorsDatabase.js', jsContent);
console.log('✅ indicatorsDatabase.js actualizado con 207 indicadores');

// ============================================
// HELPER FUNCTIONS
// ============================================

function detectDirection(name) {
  const minKeywords = ['tasa', 'tiempo', 'duración', 'espera', 'retraso', 'error', 'complicación', 'infección', 'caída'];
  const nameLower = name.toLowerCase();
  return minKeywords.some(kw => nameLower.includes(kw)) ? 'min' : 'max';
}

function convertMonthToDate(monthStr) {
  const months = {
    'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
    'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
    'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
  };
  
  const match = monthStr.toString().match(/(\d{4})?[-\s]?(0?[1-9]|1[0-2]|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i);
  if (!match) return new Date().toISOString().split('T')[0];
  
  const year = match[1] || '2025';
  let month = match[2];
  
  if (isNaN(month)) {
    const monthKey = month.toLowerCase();
    month = months[monthKey] || '01';
  } else {
    month = String(parseInt(month)).padStart(2, '0');
  }
  
  return `${year}-${month}-01`;
}

function formatMonth(monthStr) {
  const date = new Date(convertMonthToDate(monthStr));
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

function formatMonthFromDate(date) {
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

function normalizeArea(rawArea, indicatorName = '') {
  const text = `${rawArea || ''} ${indicatorName || ''}`.toLowerCase();
  if (text.includes('ufz') || text.includes('zipaquir')) {
    return AREA_UFZ;
  }
  return AREA_MAIN;
}

function enforceAreaDistribution(indicators, realCount, targetMain, targetUfz) {
  const countByArea = () => {
    let main = 0;
    let ufz = 0;
    indicators.forEach(ind => {
      if (ind.area === AREA_UFZ) ufz += 1;
      else main += 1;
    });
    return { main, ufz };
  };

  const moveArea = (fromArea, toArea, needed, onlySynthetic = true) => {
    let moved = 0;
    const startIdx = onlySynthetic ? realCount : 0;
    for (let i = startIdx; i < indicators.length && moved < needed; i++) {
      if (indicators[i].area === fromArea) {
        indicators[i].area = toArea;
        moved += 1;
      }
    }
    return moved;
  };

  let counts = countByArea();

  if (counts.main > targetMain) {
    const needToMove = counts.main - targetMain;
    const movedSynthetic = moveArea(AREA_MAIN, AREA_UFZ, needToMove, true);
    if (movedSynthetic < needToMove) {
      moveArea(AREA_MAIN, AREA_UFZ, needToMove - movedSynthetic, false);
    }
  } else if (counts.main < targetMain) {
    const needToMove = targetMain - counts.main;
    const movedSynthetic = moveArea(AREA_UFZ, AREA_MAIN, needToMove, true);
    if (movedSynthetic < needToMove) {
      moveArea(AREA_UFZ, AREA_MAIN, needToMove - movedSynthetic, false);
    }
  }

  counts = countByArea();
  console.log(`🏥 Áreas finales: ${AREA_MAIN}=${counts.main}, ${AREA_UFZ}=${counts.ufz}`);
}

console.log('🎉 Generación completada!');
console.log(`📊 Dashboard actualizado: ${allIndicators.length} indicadores`);
