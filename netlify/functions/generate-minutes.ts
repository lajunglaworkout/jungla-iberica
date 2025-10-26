/**
 * Netlify Function para generar actas de reunión
 * Endpoint: /.netlify/functions/generate-minutes
 */

import { Handler } from '@netlify/functions';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const handler: Handler = async (event) => {
  // Solo aceptar POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('📋 Recibida solicitud de generación de acta en Netlify Function...');

    // Parsear el body
    let body;
    if (typeof event.body === 'string') {
      body = JSON.parse(event.body);
    } else {
      body = event.body;
    }

    const { transcript, meetingTitle, participants } = body;

    if (!transcript) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Se requiere la transcripción' })
      };
    }

    console.log('🔄 Generando acta con Claude...');

    // Llamar a la API de Anthropic para generar acta
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

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        minutes,
        tasks
      })
    };

  } catch (error) {
    console.error('❌ Error generando acta:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error generando acta'
      })
    };
  }
};

/**
 * Función auxiliar para extraer tareas del acta
 */
function extractTasks(minutes: string, participants: string[]) {
  const tasks = [];
  
  // Buscar líneas que contengan "Acción", "Tarea", "Responsable"
  const lines = minutes.split('\n');
  
  lines.forEach((line) => {
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

export { handler };
