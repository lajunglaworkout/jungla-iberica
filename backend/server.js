/**
 * Backend simple para manejar transcripción de reuniones
 * Evita problemas de CORS al llamar a APIs externas
 * 
 * Instalación:
 * npm install express cors dotenv multer @google/generative-ai
 * 
 * Uso:
 * node backend/server.js
 * 
 * Última actualización: 2025-11-04 - CORS fix para Netlify
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde la carpeta backend
dotenv.config({ path: path.join(__dirname, '.env') });

// Log para verificar que se cargó la API key
console.log('🔑 ANTHROPIC_API_KEY cargada:', process.env.ANTHROPIC_API_KEY ? '✅ Sí' : '❌ No');
console.log('🔑 ASSEMBLYAI_API_KEY cargada:', process.env.ASSEMBLYAI_API_KEY ? '✅ Sí' : '❌ No');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('🔍 PORT from environment:', process.env.PORT);
console.log('🔍 PORT to use:', PORT);

// Middleware CORS - Permitir Netlify y localhost
// Siempre incluir localhost para desarrollo
const allowedOrigins = [
  'https://lajungla-crm.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').filter(o => o.trim()) : [])
];

console.log('🌐 CORS Origins permitidos:', allowedOrigins);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Aumentar límite de payload para archivos de audio largos (hasta 500MB)
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// Configurar multer para subidas de archivos
// Aumentar límite a 500MB para soportar audios de 45+ minutos
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB
  }
});


// Manejar preflight CORS explícitamente
app.options('/api/transcribe', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(204);
});

/**
 * Endpoint para transcribir audio
 * POST /api/transcribe
 */
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    // Log detallado para debugging
    console.log('📝 Recibida solicitud de transcripción...');
    console.log('🌐 Origin:', req.headers.origin);
    console.log('📦 Content-Type:', req.headers['content-type']);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó archivo de audio'
      });
    }

    const audioBuffer = req.file.buffer;
    const mimeType = req.file.mimetype || 'audio/webm';

    console.log(`📊 Tamaño del archivo: ${(audioBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`🎵 Tipo MIME: ${mimeType}`);

    // Convertir buffer a base64
    const base64Audio = audioBuffer.toString('base64');

    // Llamar a AssemblyAI para transcripción
    console.log('🔄 Enviando a AssemblyAI...');

    const assemblyAiKey = process.env.ASSEMBLYAI_API_KEY;
    
    if (!assemblyAiKey) {
      return res.status(500).json({
        success: false,
        error: 'ASSEMBLYAI_API_KEY no configurada'
      });
    }

    // Subir a AssemblyAI
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': assemblyAiKey,
        'Content-Type': 'application/octet-stream'
      },
      body: audioBuffer
    });

    if (!uploadResponse.ok) {
      throw new Error(`AssemblyAI upload failed: ${uploadResponse.status}`);
    }

    const uploadData = await uploadResponse.json();
    const audioUrl = uploadData.upload_url;

    // Iniciar transcripción
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': assemblyAiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        language_code: 'es',
        speaker_labels: true,
        speakers_expected: 2
      })
    });

    if (!transcriptResponse.ok) {
      throw new Error(`AssemblyAI transcription failed: ${transcriptResponse.status}`);
    }

    const transcriptData = await transcriptResponse.json();
    const transcriptId = transcriptData.id;

    // Esperar resultado (máximo 10 minutos para audios largos de 45 minutos)
    // AssemblyAI típicamente tarda 1/4 del tiempo del audio
    let transcript = null;
    let attempts = 0;
    const maxAttempts = 600; // 10 minutos máximo

    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'Authorization': assemblyAiKey
        }
      });

      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();

      if (statusData.status === 'completed') {
        transcript = statusData.text;
        console.log('✅ Transcripción completada');
        console.log(`📊 Tiempo total: ${attempts} segundos`);
        break;
      } else if (statusData.status === 'error') {
        throw new Error(`Transcription error: ${statusData.error}`);
      }

      // Log cada 30 segundos para audios largos
      if (attempts % 30 === 0) {
        console.log(`⏳ Transcribiendo... ${attempts}s (${Math.round(attempts/60)} min)`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (!transcript) {
      throw new Error('Transcription timeout');
    }

    res.json({
      success: true,
      transcript
    });

  } catch (error) {
    console.error('❌ Error en transcripción:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error en la transcripción'
    });
  }
});

// Manejar preflight CORS para generate-minutes
app.options('/api/generate-minutes', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(204);
});

/**
 * Endpoint para generar acta de reunión
 * POST /api/generate-minutes
 */
app.post('/api/generate-minutes', express.json(), async (req, res) => {
  try {
    console.log('📋 Recibida solicitud de generación de acta...');

    const { transcript, meetingTitle, participants } = req.body;

    if (!transcript) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere la transcripción'
      });
    }

    // Generar acta con Anthropic Claude
    console.log('🔄 Generando acta con Claude AI...');

    const fecha = new Date().toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const prompt = `Eres un asistente profesional que genera actas de reunión. Analiza la siguiente transcripción y genera un acta estructurada en formato Markdown.

**Título de la reunión:** ${meetingTitle}
**Fecha:** ${fecha}
**Participantes:** ${participants.join(', ')}

**Transcripción:**
${transcript}

Genera un acta profesional con:
1. Resumen ejecutivo (3-4 líneas)
2. Puntos principales tratados (lista con viñetas)
3. Decisiones tomadas (lista numerada)
4. Acciones pendientes con responsables (formato: "- Acción | Responsable: Nombre")
5. Próximos pasos

Formato: Markdown profesional en español.`;

    // Llamar a Anthropic Claude API
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      throw new Error(`Anthropic API error: ${anthropicResponse.status} - ${errorText}`);
    }

    const anthropicData = await anthropicResponse.json();
    const minutes = anthropicData.content[0].text;

    // Extraer tareas del acta
    const tasks = extractTasks(minutes, participants);

    console.log('✅ Acta generada');

    res.json({
      success: true,
      minutes,
      tasks
    });

  } catch (error) {
    console.error('❌ Error generando acta:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error generando acta'
    });
  }
});

/**
 * Función auxiliar para extraer tareas del acta
 */
function extractTasks(minutes, participants) {
  const tasks = [];
  
  // Buscar sección de "Acciones Pendientes" o similar
  const lines = minutes.split('\n');
  let inTasksSection = false;
  
  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();
    
    // Detectar inicio de sección de tareas
    if (lowerLine.includes('acciones pendientes') || 
        lowerLine.includes('tareas asignadas') ||
        lowerLine.includes('próximos pasos') ||
        lowerLine.includes('action items')) {
      inTasksSection = true;
      return;
    }
    
    // Detectar fin de sección (nuevo encabezado)
    if (inTasksSection && line.match(/^#{1,3}\s+\d+\./)) {
      inTasksSection = false;
      return;
    }
    
    // Extraer tareas de la sección
    if (inTasksSection && (line.trim().startsWith('-') || line.trim().startsWith('*'))) {
      let taskText = line.replace(/^[-*]\s*/, '').trim();
      
      // Ignorar líneas vacías o muy cortas
      if (taskText.length < 5) return;
      
      // Extraer responsable si está en formato "Tarea | Responsable: Nombre"
      let assignedTo = 'Sin asignar';
      const responsableMatch = taskText.match(/\|\s*Responsable:\s*([^|]+)/i);
      
      if (responsableMatch) {
        assignedTo = responsableMatch[1].trim();
        taskText = taskText.split('|')[0].trim();
      } else {
        // Buscar nombres de participantes en el texto
        for (const participant of participants) {
          if (taskText.toLowerCase().includes(participant.toLowerCase())) {
            assignedTo = participant;
            break;
          }
        }
      }
      
      // Crear tarea
      const task = {
        title: taskText,
        assignedTo: assignedTo,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'media'
      };
      
      tasks.push(task);
    }
  });
  
  console.log(`📝 Tareas extraídas: ${tasks.length}`);
  return tasks;
}

/**
 * Root endpoint for Railway healthcheck
 */
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Jungla Meetings Backend',
    timestamp: new Date().toISOString(),
    endpoints: {
      transcribe: 'POST /api/transcribe',
      minutes: 'POST /api/generate-minutes',
      health: 'GET /health'
    }
  });
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Iniciar servidor
 */
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  🎙️  Backend de Transcripción de Reuniones                ║
║  ✅ Servidor iniciado en puerto ${PORT}                      ║
║  📝 POST /api/transcribe - Transcribir audio              ║
║  📋 POST /api/generate-minutes - Generar acta             ║
║  🏥 GET /health - Verificar estado                        ║
╚════════════════════════════════════════════════════════════╝
  `);
});
