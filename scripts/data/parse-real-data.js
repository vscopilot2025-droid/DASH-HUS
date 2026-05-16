/**
 * Script para parsear el archivo Excel real de indicadores
 * y generar el archivo de datos actualizado
 */

const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Ruta al archivo Excel adjunto
const excelPath = path.join(__dirname, 'Reporte_Indicadores_2010_2026.xlsx');

console.log('🔍 Analizando archivo Excel:', excelPath);

if (!fs.existsSync(excelPath)) {
  console.error('❌ Archivo no encontrado:', excelPath);
  process.exit(1);
}

try {
  // Leer el archivo Excel
  const workbook = XLSX.readFile(excelPath);
  
  console.log('\n📊 Hojas encontradas:');
  workbook.SheetNames.forEach(name => {
    console.log(`  - ${name}`);
  });

  // Leer la primera hoja de datos
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(firstSheet);

  console.log(`\n✅ Total de registros encontrados: ${data.length}`);
  console.log('\n📋 Primeras 3 filas (estructura):');
  console.log(JSON.stringify(data.slice(0, 3), null, 2));

  // Analizar estructura de columnas
  if (data.length > 0) {
    const columns = Object.keys(data[0]);
    console.log('\n🔑 Columnas detectadas:');
    columns.forEach(col => {
      console.log(`  - "${col}"`);
    });

    // Contar por área si existe columna
    const areaColumn = columns.find(col => 
      col.toLowerCase().includes('área') || 
      col.toLowerCase().includes('area') ||
      col.toLowerCase().includes('servicio')
    );

    if (areaColumn) {
      const areas = {};
      data.forEach(row => {
        const area = row[areaColumn];
        areas[area] = (areas[area] || 0) + 1;
      });
      console.log('\n📍 Distribución por área:');
      Object.entries(areas).forEach(([area, count]) => {
        console.log(`  - ${area}: ${count} indicadores`);
      });
    }

    console.log('\n💾 Datos listos para procesamiento');
  }

} catch (error) {
  console.error('❌ Error al parsear Excel:', error.message);
  process.exit(1);
}
