/**
 * Parser completo para extraer indicadores reales del Excel
 * y generar archivo sampleData.js actualizado
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Leer Excel
const excelPath = './Reporte_Indicadores_2010_2026.xlsx';
const wb = XLSX.readFile(excelPath);
const ws = wb.Sheets['Indicadores'];
const data = XLSX.utils.sheet_to_json(ws);

console.log('🔍 Parseando indicadores reales...\n');

// Extraer indicadores válidos (tienen ID y nombre)
const indicators = [];
const monthColumns = Object.keys(data[0] || {}).filter(k => 
  /\d{4}|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre/i.test(k)
);

// Mapear nombres de meses a números
const monthMap = {
  'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4, 'mayo': 5, 'junio': 6,
  'julio': 7, 'agosto': 8, 'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
};

function parseMonth(monthStr) {
  const parts = monthStr.toLowerCase().split(' ');
  if (parts.length !== 2) return null;
  const [monthName, year] = parts;
  const month = monthMap[monthName];
  if (!month || !year) return null;
  return new Date(year, month - 1, 1);
}

// Determinar dirección esperada (aumentar o disminuir)
function determineDirection(name, unit) {
  const lowerName = name.toLowerCase();
  const lowerUnit = (unit || '').toLowerCase();
  
  // Keywords para disminuir (menor es mejor)
  if (/tiempo|espera|demora|retraso|error|mortalidad|muerte|infección|complicación|incidencia|prevalencia|ausencia|inasistencia|falta/.test(lowerName) ||
      /minuto|hora|día|segundo/.test(lowerUnit)) {
    return 'min';
  }
  
  // Keywords para aumentar (mayor es mejor)
  if (/satisfacción|efectividad|eficiencia|cobertura|captación|cumplimiento|puntualidad|aceptación|resolución|exito|mejora|calidad|disponibilidad|capacidad/.test(lowerName) ||
      /porcentaje|%|tasa|razón|número|cantidad/.test(lowerUnit)) {
    return 'max';
  }
  
  return 'max'; // Por defecto
}

// Procesar cada fila
for (let i = 1; i < data.length; i++) {
  const row = data[i];
  
  // Validar que sea un indicador válido
  if (!row['ID'] || !row['Indicador']) continue;
  
  const area = row['Nombre proceso'] || 'Sin clasificar';
  const name = row['Indicador'];
  const unit = row['Unidad de medida'] || 'N/A';
  const frequency = row['Periodicidad'] || 'Mensual';
  
  // Extraer histórico de mediciones
  const history = [];
  for (const monthCol of monthColumns) {
    const value = row[monthCol];
    if (value && value !== 'Valor' && value !== 'Sin medición') {
      const date = parseMonth(monthCol);
      if (date) {
        const numValue = parseFloat(String(value).replace(/,/g, '.'));
        if (!isNaN(numValue)) {
          history.push({
            date: date.toISOString().split('T')[0],
            month: monthCol,
            value: numValue
          });
        }
      }
    }
  }
  
  // Determinar valor actual (último de la historia)
  const currentValue = history.length > 0 ? history[history.length - 1].value : 0;
  
  // Determinar dirección (aumentar/disminuir)
  const direction = determineDirection(name, unit);
  
  // Estimar meta
  const targetValue = history.length > 3 
    ? Math.ceil(history.slice(-3).reduce((a, h) => a + h.value, 0) / 3)
    : currentValue * 1.1;

  const indicator = {
    id: `ID-${row['ID']}`,
    code: String(row['ID']),
    name: name,
    area: area,
    objective: 'OBJ-' + ((indicators.length % 4) + 1),
    unit: unit,
    currentValue: currentValue,
    targetValue: targetValue,
    status: 'activo',
    process: row['Nombre proceso'] || 'PROC-' + row['ID'],
    direction: direction,
    history: history,
    frequency: frequency,
    dataSource: 'Reporte HUS 2010-2026'
  };
  
  indicators.push(indicator);
}

console.log(`✅ Indicadores extraídos: ${indicators.length}`);

// Agrupar por área
const byArea = {};
indicators.forEach(ind => {
  if (!byArea[ind.area]) byArea[ind.area] = [];
  byArea[ind.area].push(ind);
});

console.log('\n📊 Distribución por área:');
Object.entries(byArea).forEach(([area, inds]) => {
  console.log(`  - ${area}: ${inds.length} indicadores`);
});

// Generar archivo sampleData.js
const output = `/**
 * Datos reales de indicadores HUS 2010-2026
 * Extraído de: Reporte_Indicadores_2010_2026.xlsx
 * Total indicadores: ${indicators.length}
 * Áreas: ${Object.keys(byArea).length}
 */

// Datos generados automáticamente - NO EDITAR MANUALMENTE
const REAL_INDICATORS = ${JSON.stringify(indicators, null, 2)};

/**
 * Obtiene indicadores reales del reporte HUS
 */
function generateSampleIndicators() {
  return REAL_INDICATORS.map(data => new Indicator(
    data.id,
    data.code,
    data.name,
    data.area,
    data.objective,
    data.unit,
    data.currentValue,
    data.targetValue,
    data.status,
    data.process,
    data.direction,
    data.history,
    data.frequency,
    data.dataSource
  ));
}

// Exportar
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateSampleIndicators };
}
`;

fs.writeFileSync('./src/shared/sampleData-real.js', output);
console.log('\n💾 Archivo generado: src/shared/sampleData-real.js');
console.log(`   Tamaño: ${(output.length / 1024).toFixed(2)} KB`);
console.log('\n🎯 Próximo paso: Actualizar src/main.js para usar los datos reales');

