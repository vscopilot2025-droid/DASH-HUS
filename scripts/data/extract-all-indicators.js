/**
 * Extrae TODOS los 70 indicadores con histórico 2010-2026 completo
 * Genera datos listos para el nuevo dashboard profesional
 */

const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('Reporte_Indicadores_2010_2026.xlsx');
const ws = wb.Sheets['Indicadores'];
const data = XLSX.utils.sheet_to_json(ws, { defval: '' });

console.log('🔄 Extrayendo indicadores con histórico 2010-2026...\n');

// Mapeo de meses
const monthMap = {
  'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6,
  'julio': 7, 'agosto': 8, 'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
};

function parseMonthYear(monthStr) {
  if (!monthStr) return null;
  const parts = String(monthStr).toLowerCase().trim().split(' ');
  if (parts.length !== 2) return null;
  const [monthName, year] = parts;
  const month = monthMap[monthName];
  if (!month || !year || isNaN(year)) return null;
  return { month: parseInt(month), year: parseInt(year) };
}

// Obtener todas las columnas de meses
const allKeys = Object.keys(data[0] || {});
const monthColumns = allKeys
  .filter(k => /\d{4}|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre/i.test(k))
  .sort((a, b) => {
    const aDate = parseMonthYear(a);
    const bDate = parseMonthYear(b);
    if (!aDate || !bDate) return 0;
    if (aDate.year !== bDate.year) return aDate.year - bDate.year;
    return aDate.month - bDate.month;
  });

console.log(`📅 Meses disponibles: ${monthColumns.length}`);
console.log(`   Desde: ${monthColumns[0]} hasta ${monthColumns[monthColumns.length - 1]}\n`);

// Extraer indicadores con ID válido
const indicators = [];

for (let i = 0; i < data.length; i++) {
  const row = data[i];
  
  // Validar que sea un indicador real
  if (!row['ID'] || isNaN(parseInt(row['ID']))) continue;
  
  const id = String(row['ID']).trim();
  const name = (row['Indicador'] || '').trim();
  const area = (row['Nombre proceso'] || '').trim();
  const unit = (row['Unidad de medida'] || 'N/A').trim();
  const frequency = (row['Periodicidad'] || 'Mensual').trim();
  
  if (!name) continue; // Skip si no tiene nombre
  
  // Extraer histórico de TODOS los meses
  const history = [];
  
  for (const monthCol of monthColumns) {
    const value = row[monthCol];
    if (value && value !== 'Valor' && value !== 'Sin medición' && value !== '-' && value !== '') {
      const monthDate = parseMonthYear(monthCol);
      if (monthDate) {
        const numValue = parseFloat(String(value).replace(/,/g, '.'));
        if (!isNaN(numValue)) {
          history.push({
            date: `${monthDate.year}-${String(monthDate.month).padStart(2, '0')}-01`,
            month: monthCol,
            value: numValue
          });
        }
      }
    }
  }
  
  // Solo incluir si tiene al menos 1 medición
  if (history.length === 0) continue;
  
  // Determinar estado según el último valor
  const currentValue = history[history.length - 1].value;
  const targetValue = history.length > 3 
    ? Math.round(history.slice(-3).reduce((a, h) => a + h.value, 0) / 3)
    : Math.round(currentValue * 1.1);
  
  // Determinar dirección (min/max)
  const direction = /tiempo|espera|demora|retraso|error|mortalidad/i.test(name) ? 'min' : 'max';
  
  const indicator = {
    id: `IND-${id}`,
    code: id,
    name: name,
    area: area,
    unit: unit,
    currentValue: Math.round(currentValue * 100) / 100,
    targetValue: targetValue,
    direction: direction,
    frequency: frequency,
    processId: row['Código proceso'] || id,
    lastUpdate: history[history.length - 1].date,
    historicalDataPoints: history.length,
    history: history
  };
  
  indicators.push(indicator);
}

console.log(`✅ Indicadores extraídos: ${indicators.length}`);
console.log(`\n📊 Distribución:\n`);

// Agrupar por área
const byArea = {};
indicators.forEach(ind => {
  if (!byArea[ind.area]) byArea[ind.area] = [];
  byArea[ind.area].push(ind);
});

Object.entries(byArea).forEach(([area, inds]) => {
  console.log(`   ${area}: ${inds.length} indicadores`);
});

// Generar archivo JavaScript
const jsContent = `/**
 * Base de datos real de indicadores HUS 2010-2026
 * ${indicators.length} indicadores con histórico completo
 * Generado automáticamente desde: Reporte_Indicadores_2010_2026.xlsx
 */

export const INDICATORS_DATABASE = ${JSON.stringify(indicators, null, 2)};

export function getAllIndicators() {
  return INDICATORS_DATABASE;
}

export function getIndicatorsByArea(area) {
  return area === 'all' 
    ? INDICATORS_DATABASE
    : INDICATORS_DATABASE.filter(ind => ind.area === area);
}

export function getAreas() {
  const areas = new Set(INDICATORS_DATABASE.map(ind => ind.area));
  return Array.from(areas).sort();
}

export function getIndicatorById(id) {
  return INDICATORS_DATABASE.find(ind => ind.code === id);
}

export function getSummaryMetrics() {
  return {
    totalIndicators: INDICATORS_DATABASE.length,
    totalAreas: new Set(INDICATORS_DATABASE.map(ind => ind.area)).size,
    totalProcesses: new Set(INDICATORS_DATABASE.map(ind => ind.processId)).size,
    averageDataPoints: Math.round(
      INDICATORS_DATABASE.reduce((sum, ind) => sum + ind.historicalDataPoints, 0) / 
      INDICATORS_DATABASE.length
    ),
    dateRange: {
      from: INDICATORS_DATABASE.reduce((min, ind) => 
        ind.history[0].date < min ? ind.history[0].date : min,
        '9999-12-31'
      ),
      to: INDICATORS_DATABASE.reduce((max, ind) =>
        ind.history[ind.history.length - 1].date > max ? ind.history[ind.history.length - 1].date : max,
        '0000-01-01'
      )
    }
  };
}
`;

fs.writeFileSync('./src/shared/indicatorsDatabase.js', jsContent);
console.log(`\n💾 Archivo generado: src/shared/indicatorsDatabase.js`);
console.log(`📈 Métricas:\n`);

const metrics = {
  totalIndicators: indicators.length,
  totalAreas: new Set(indicators.map(ind => ind.area)).size,
  totalProcesses: new Set(indicators.map(ind => ind.processId)).size,
  avgDataPoints: Math.round(indicators.reduce((s, i) => s + i.historicalDataPoints, 0) / indicators.length),
  dateRangeFrom: indicators.reduce((min, ind) => ind.history[0].date < min ? ind.history[0].date : min, '9999-12-31'),
  dateRangeTo: indicators.reduce((max, ind) => ind.history[ind.history.length - 1].date > max ? ind.history[ind.history.length - 1].date : max, '0000-01-01')
};

Object.entries(metrics).forEach(([key, val]) => {
  console.log(`   ${key}: ${val}`);
});
