const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('Reporte_Indicadores_2010_2026.xlsx');

console.log('📊 TODAS las hojas en el Excel:');
console.log('='.repeat(60));

wb.SheetNames.forEach((sheetName, idx) => {
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
  
  console.log(`\nHoja ${idx + 1}: "${sheetName}"`);
  console.log('  Total filas:', data.length);
  
  // Contar filas con datos reales
  const withData = data.filter(r => 
    Object.values(r).some(v => v && String(v).trim() && String(v).trim() !== '-')
  );
  console.log('  Filas con contenido:', withData.length);
  
  // Mostrar estructura
  if (data.length > 0) {
    const keys = Object.keys(data[0]).filter(k => k && !k.startsWith('__')).slice(0, 8);
    console.log('  Columnas principales:', keys.join(' | '));
  }
});

console.log('\n' + '='.repeat(60));
console.log('Total de hojas:', wb.SheetNames.length);
