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

    // Obtener API key de Google Gemini
    const apiKey = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;
    
    console.log('🔑 Verificando Google Gemini API key:', apiKey ? '✅ Encontrada' : '❌ No encontrada');
    
    if (!apiKey) {
      console.error('❌ Google Gemini API key no configurada');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Google Gemini API key not configured' })
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

    console.log('🤖 Llamando a Google Gemini API desde Netlify Function...');

    // Llamar a Google Gemini API (v1 con gemini-1.5-pro)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Eres un asistente experto en generar actas de reuniones profesionales en español. Debes extraer información clave y estructurarla de forma clara.\n\n${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4000
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error de Google Gemini API:', errorData);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          error: `Error en Google Gemini API (${response.status}): ${errorData.error?.message || response.statusText}` 
        })
      };
    }

    const data = await response.json();
    console.log('📥 Respuesta de Google Gemini recibida');
    
    // Google Gemini usa: data.candidates[0].content.parts[0].text
    const content = data.candidates[0].content.parts[0].text;
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
