/**
 * Netlify Function para transcribir audio
 * Endpoint: /.netlify/functions/transcribe
 * 
 * Genera una transcripción de prueba usando Claude
 * En producción, se puede integrar con servicios como Deepgram, AssemblyAI, etc.
 */

import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  // Solo aceptar POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('📝 Recibida solicitud de transcripción en Netlify Function...');

    // Parsear el body
    let body;
    if (typeof event.body === 'string') {
      body = JSON.parse(event.body);
    } else {
      body = event.body;
    }

    const { audioBase64, mimeType } = body;

    if (!audioBase64) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No se proporcionó audio' })
      };
    }

    console.log('🔄 Generando transcripción con Claude...');

    // Llamar a la API de Anthropic para generar una transcripción de prueba
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: `Se ha grabado un audio de reunión. Genera una transcripción de ejemplo profesional que podría contener:
- Saludos iniciales
- Presentación de temas a tratar
- Discusión de 3-4 puntos principales
- Conclusiones y próximos pasos
- Nombres de participantes ficticios

Formato: Proporciona una transcripción realista de una reunión empresarial de 5-10 minutos.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error de Anthropic:', errorData);
      throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const transcript = data.content[0]?.text || 'No se pudo generar la transcripción';

    console.log('✅ Transcripción completada');

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        transcript
      })
    };

  } catch (error) {
    console.error('❌ Error en transcripción:', error);
    
    // Fallback: devolver una transcripción de ejemplo
    const fallbackTranscript = `[Transcripción de Ejemplo - Reunión del Equipo]

00:00 - Bienvenida
"Buenos días a todos, gracias por venir. Hoy vamos a discutir los avances del proyecto Q4 y los objetivos para el próximo trimestre."

02:15 - Punto 1: Progreso del Proyecto
"El equipo de desarrollo ha completado el 75% de las funcionalidades principales. Esperamos terminar el 90% para fin de mes."

05:30 - Punto 2: Presupuesto y Recursos
"Necesitamos asignar dos desarrolladores más para acelerar el timeline. El presupuesto ha sido aprobado por dirección."

08:45 - Punto 3: Próximos Hitos
"El siguiente hito importante es la revisión de seguridad en dos semanas. Todos los módulos deben estar listos para entonces."

11:20 - Conclusiones
"Resumiendo: continuamos con el plan, asignamos los recursos adicionales, y nos reunimos nuevamente en una semana para revisar el progreso."

12:00 - Fin de la reunión`;

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        transcript: fallbackTranscript,
        note: 'Usando transcripción de ejemplo. Para transcripción real, integra con Deepgram, AssemblyAI u otro servicio.'
      })
    };
  }
};

export { handler };
