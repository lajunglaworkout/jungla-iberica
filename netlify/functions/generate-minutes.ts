import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parsear el body
    const { transcript, meetingTitle, participants } = JSON.parse(event.body || '{}');

    if (!transcript) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Transcript is required' })
      };
    }

    // Obtener API key de las variables de entorno
    const apiKey = process.env.VITE_ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error('❌ VITE_ANTHROPIC_API_KEY no configurada');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    // Crear el prompt
    const prompt = `Analiza esta transcripción de reunión y genera un acta profesional en español.

TRANSCRIPCIÓN:
${transcript.substring(0, 4000)}

REUNIÓN:
- Título: ${meetingTitle || 'Reunión'}
- Participantes: ${participants?.join(', ') || 'No especificados'}
- Fecha: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}

GENERA:
1. RESUMEN: Breve resumen de lo tratado (2-3 líneas)
2. PUNTOS IMPORTANTES: Lista de los temas más relevantes
3. TAREAS ASIGNADAS: Extrae cada tarea con responsable y fecha límite
4. VALORACIÓN: Evaluación general de la reunión (productividad, cumplimiento de objetivos)

RESPONDE SOLO con este JSON (sin markdown):
{
  "minutes": "# Acta de Reunión\\n\\n**${meetingTitle || 'Reunión'}**\\n**Fecha:** ${new Date().toLocaleDateString('es-ES')}\\n**Participantes:** ${participants?.join(', ') || 'No especificados'}\\n\\n## Resumen\\n[resumen aquí]\\n\\n## Puntos Importantes\\n- [punto 1]\\n- [punto 2]\\n\\n## Valoración\\n[valoración aquí]",
  "tasks": [
    {"title": "Título tarea", "assignedTo": "Nombre", "deadline": "2025-11-24", "priority": "media"}
  ]
}`;

    console.log('🤖 Llamando a Claude API desde Netlify Function...');

    // Llamar a Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error de Claude API:', errorData);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: `Error en API (${response.status}): ${errorData.error?.message || response.statusText}` 
        })
      };
    }

    const data = await response.json();
    console.log('📥 Respuesta de Claude recibida');
    
    const content = data.content[0].text;
    console.log('📄 Contenido:', content.substring(0, 200) + '...');
    
    // Parseo robusto
    let result;
    try {
      result = JSON.parse(content);
    } catch (e1) {
      console.log('⚠️ Parseo directo falló, intentando extraer JSON...');
      try {
        const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        result = JSON.parse(cleanContent);
      } catch (e2) {
        console.log('⚠️ Parseo con limpieza falló, intentando regex...');
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('❌ No se encontró JSON en la respuesta:', content);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'No se pudo extraer JSON de la respuesta de Claude' })
          };
        }
        result = JSON.parse(jsonMatch[0]);
      }
    }

    // Validar respuesta
    if (!result.minutes || !result.tasks) {
      console.error('❌ Respuesta inválida:', result);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'La respuesta no tiene el formato esperado' })
      };
    }

    console.log('✅ Acta generada correctamente');
    console.log('📋 Tareas extraídas:', result.tasks.length);

    // Devolver respuesta exitosa
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Permitir CORS
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: true,
        minutes: result.minutes,
        tasks: result.tasks
      })
    };

  } catch (error) {
    console.error('❌ Error en función:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    };
  }
};
