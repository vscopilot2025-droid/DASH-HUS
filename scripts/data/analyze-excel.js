/**
 * Analizador avanzado de Excel de indicadores
 * Extrae estructura y mapea a entidad Indicator
 */

const XLSX = require('xlsx');
const fs = require('fs');

const excelPath = './Reporte_Indicadores_2010_2026.xlsx';

console.log('🔍 Analizando estructura del Excel de indicadores...\n');

const wb = XLSX.readFile(excelPath);
console.log('📊 Hojas encontradas:', wb.SheetNames);

const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

console.log(`📈 Total de registros (filas): ${data.length}\n`);

// Analizar las primeras 3 filas
console.log('📋 Estructura de datos (primeras 3 registros):\n');
for (let i = 0; i < Math.min(3, data.length); i++) {
  const record = data[i];
  console.log(`\n--- Registro ${i + 1} ---`);
  
  const allKeys = Object.keys(record);
  const mainKeys = allKeys.filter(k => !k.startsWith('__EMPTY'));
  
  console.log('Propiedades principales:');
  mainKeys.slice(0, 10).forEach(key => {
    console.log(`  "${key}": ${record[key]}`);
  });
  
  if (mainKeys.length > 10) {
    console.log(`  ... y ${mainKeys.length - 10} propiedades más`);
  }
  
  console.log(`Total de propiedades: ${allKeys.length}`);
}

// Buscar patrones de columnas
console.log('\n\n🔑 Análisis de columnas principales:');
const allKeys = Object.keys(data[0] || {});
const meaningfulKeys = allKeys.filter(k => !k.startsWith('__EMPTY') && k.trim() !== '');

console.log(`\nPropiedades no-empty encontradas (${meaningfulKeys.length}):`);
meaningfulKeys.slice(0, 20).forEach(key => {
  console.log(`  - "${key}"`);
});

if (meaningfulKeys.length > 20) {
  console.log(`  ... y ${meaningfulKeys.length - 20} más`);
}

// Detectar si hay columnas de fecha/mes
const monthColumns = allKeys.filter(k => 
  /\d{4}|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre/i.test(k)
);
console.log(`\n📅 Columnas con fechas/meses: ${monthColumns.length}`);
console.log('Primeras 10:', monthColumns.slice(0, 10));

console.log('\n✅ Análisis completado');
