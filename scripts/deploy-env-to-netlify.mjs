#!/usr/bin/env node

/**
 * Script para importar variables de entorno desde .env a Netlify
 * 
 * Uso:
 * node scripts/deploy-env-to-netlify.mjs
 * 
 * Requisitos:
 * 1. Tener netlify-cli instalado: npm install -g netlify-cli
 * 2. Estar autenticado en Netlify: netlify login
 * 3. Tener un archivo .env en la raíz del proyecto
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colores para la terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  console.error(`${colors.red}❌ ${message}${colors.reset}`);
}

function success(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function info(message) {
  console.log(`${colors.cyan}ℹ️  ${message}${colors.reset}`);
}

function warning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

// Paso 1: Leer archivo .env
log('\n╔════════════════════════════════════════════════════════════╗', 'bright');
log('║  🚀 Importar Variables de Entorno a Netlify                ║', 'bright');
log('╚════════════════════════════════════════════════════════════╝\n', 'bright');

const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(envPath)) {
  error(`No se encontró archivo .env en: ${envPath}`);
  error('Crea un archivo .env con tus variables de entorno');
  process.exit(1);
}

info(`Leyendo archivo .env desde: ${envPath}`);

// Leer el archivo .env
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

// Parsear el archivo .env
envContent.split('\n').forEach(line => {
  line = line.trim();
  
  // Ignorar líneas vacías y comentarios
  if (!line || line.startsWith('#')) {
    return;
  }
  
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=').trim();
  
  if (key && value) {
    envVars[key.trim()] = value;
  }
});

log(`\n📋 Variables encontradas en .env:\n`, 'cyan');

Object.entries(envVars).forEach(([key, value]) => {
  const maskedValue = value.length > 20 
    ? value.substring(0, 10) + '...' + value.substring(value.length - 5)
    : value;
  log(`   ${key}: ${maskedValue}`);
});

// Paso 2: Verificar que Netlify CLI está instalado
log('\n🔍 Verificando Netlify CLI...', 'cyan');

try {
  execSync('netlify --version', { stdio: 'pipe' });
  success('Netlify CLI está instalado');
} catch (e) {
  error('Netlify CLI no está instalado');
  error('Instálalo con: npm install -g netlify-cli');
  process.exit(1);
}

// Paso 3: Verificar que estamos autenticados
log('\n🔐 Verificando autenticación en Netlify...', 'cyan');

try {
  execSync('netlify status', { stdio: 'pipe' });
  success('Autenticado en Netlify');
} catch (e) {
  error('No estás autenticado en Netlify');
  error('Ejecuta: netlify login');
  process.exit(1);
}

// Paso 4: Obtener el site ID
log('\n🔎 Buscando site ID...', 'cyan');

let siteId;
try {
  const statusOutput = execSync('netlify status --json', { encoding: 'utf-8' });
  const status = JSON.parse(statusOutput);
  siteId = status.siteId;
  
  if (!siteId) {
    error('No se pudo obtener el site ID');
    error('Asegúrate de estar en la carpeta del proyecto');
    process.exit(1);
  }
  
  success(`Site ID encontrado: ${siteId}`);
} catch (e) {
  error('Error obteniendo site ID');
  error('Asegúrate de estar en la carpeta del proyecto');
  process.exit(1);
}

// Paso 5: Configurar variables en Netlify
log('\n⚙️  Configurando variables en Netlify...', 'cyan');

const varsToSet = [
  'ANTHROPIC_API_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_BACKEND_URL'
];

let setCount = 0;
let skipCount = 0;

varsToSet.forEach(varName => {
  if (envVars[varName]) {
    try {
      const value = envVars[varName];
      
      // Usar netlify env:set para configurar la variable
      execSync(`netlify env:set ${varName} "${value}"`, { 
        stdio: 'pipe',
        cwd: path.join(__dirname, '..')
      });
      
      success(`Variable configurada: ${varName}`);
      setCount++;
    } catch (e) {
      warning(`No se pudo configurar: ${varName}`);
      warning(`Error: ${e.message}`);
    }
  } else {
    warning(`Variable no encontrada en .env: ${varName}`);
    skipCount++;
  }
});

// Paso 6: Verificar que se configuraron
log('\n✅ Verificando variables en Netlify...', 'cyan');

try {
  const envList = execSync('netlify env:list --json', { 
    encoding: 'utf-8',
    cwd: path.join(__dirname, '..')
  });
  
  const envData = JSON.parse(envList);
  
  log('\n📊 Variables configuradas en Netlify:\n', 'cyan');
  
  envData.forEach(env => {
    const maskedValue = env.value.length > 20 
      ? env.value.substring(0, 10) + '...' + env.value.substring(env.value.length - 5)
      : env.value;
    log(`   ${env.key}: ${maskedValue}`);
  });
} catch (e) {
  warning('No se pudo verificar las variables');
}

// Resumen final
log('\n╔════════════════════════════════════════════════════════════╗', 'bright');
log('║  ✅ PROCESO COMPLETADO                                     ║', 'bright');
log('╚════════════════════════════════════════════════════════════╝\n', 'bright');

log(`Variables configuradas: ${setCount}`, 'green');
if (skipCount > 0) {
  log(`Variables no encontradas: ${skipCount}`, 'yellow');
}

log('\n📝 Próximos pasos:', 'cyan');
log('1. Verifica que todas las variables están en Netlify Dashboard');
log('2. Redeploy: netlify deploy --prod');
log('3. Prueba la app en https://lajungla-crm.netlify.app');
log('4. Intenta grabar una reunión para verificar que funciona\n');

log('🎉 ¡Listo! Las variables de entorno están configuradas en Netlify\n', 'green');
