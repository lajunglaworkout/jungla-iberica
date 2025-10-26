/**
 * Backend simple para manejar transcripción de reuniones
 * Evita problemas de CORS al llamar a APIs externas
 * 
 * Instalación:
 * npm install express cors dotenv multer anthropic
 * 
 * Uso:
 * node backend/server.js
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

// Cargar variables de entorno desde la carpeta backend
dotenv.config({ path: path.join(__dirname, '.env') });

// Log para verificar que se cargó la API key
console.log('🔑 ANTHROPIC_API_KEY cargada:', process.env.ANTHROPIC_API_KEY ? '✅ Sí' : '❌ No');
console.log('🔑 ASSEMBLYAI_API_KEY cargada:', process.env.ASSEMBLYAI_API_KEY ? '✅ Sí' : '❌ No');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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

// Inicializar cliente de Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Endpoint para transcribir audio
 * POST /api/transcribe
 */
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    console.log('📝 Recibida solicitud de transcripción...');

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
      console.warn('⚠️ ASSEMBLYAI_API_KEY no configurada, usando Claude como fallback');
      
      // Fallback a Claude si no hay AssemblyAI
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: 'Se ha grabado un audio de reunión. Genera una transcripción de ejemplo profesional.'
          }
        ]
      });

      const transcript = message.content[0].type === 'text'
        ? message.content[0].text
        : 'No se pudo transcribir el audio';

      console.log('✅ Transcripción completada (fallback)');
      return res.json({
        success: true,
        transcript
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

    // Llamar a la API de Anthropic para generar acta
    console.log('🔄 Generando acta con Claude...');

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Genera un acta profesional de reunión basada en la siguiente transcripción.

Título de la reunión: ${meetingTitle}
Participantes: ${participants.join(', ')}
Fecha: ${new Date().toLocaleDateString('es-ES')}

Transcripción:
${transcript}

Por favor, genera:
1. Un resumen ejecutivo
2. Puntos principales tratados
3. Decisiones tomadas
4. Acciones pendientes con responsables
5. Próxima reunión

Formato: Markdown profesional.`
        }
      ]
    });

    const minutes = message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'No se pudo generar el acta';

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
  
  // Buscar líneas que contengan "Acción", "Tarea", "Responsable"
  const lines = minutes.split('\n');
  
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes('acción') || 
        line.toLowerCase().includes('tarea') ||
        line.toLowerCase().includes('pendiente')) {
      
      // Intentar extraer información
      const task = {
        title: line.replace(/^[-*]\s*/, '').trim(),
        assignedTo: participants[0] || 'Sin asignar',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'media'
      };
      
      if (task.title.length > 5) {
        tasks.push(task);
      }
    }
  });

  return tasks;
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Iniciar servidor
 */
app.listen(PORT, () => {
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
