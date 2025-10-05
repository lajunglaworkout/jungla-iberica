const fs = require('fs');
const path = require('path');

// 1. Obtener centro desde argumentos
const centerArg = process.argv.find(arg => arg.startsWith('--center='));
const center = centerArg ? centerArg.split('=')[1] : 'all';

// 2. Generar contenido del reporte
const reportContent = `Reporte de Empleados - Centro: ${center.toUpperCase()}
` +
  `Generado el: ${new Date().toLocaleDateString('es-ES')}

` +
  'Próximamente: Datos completos de empleados, asistencia y rendimiento';

// 3. Guardar archivo
const reportPath = path.join(__dirname, `../reports/reporte-${center}.txt`);
fs.writeFileSync(reportPath, reportContent);

console.log(`✅ Reporte generado en: ${reportPath}`);
