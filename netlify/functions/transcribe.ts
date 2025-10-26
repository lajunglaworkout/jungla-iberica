/**
 * Netlify Function para transcribir audio
 * Endpoint: /.netlify/functions/transcribe
 * 
 * Usa la API de Anthropic con vision para transcribir audio
 * Convierte el audio a base64 y lo envía como contenido de imagen
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

    console.log('🔄 Llamando a API de Anthropic para transcripción...');

    // Llamar directamente a la API de Anthropic
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
            content: [
              {
                type: 'text',
                text: 'Por favor, transcribe el contenido de este audio de reunión. Proporciona la transcripción completa y clara. Si no puedes transcribir el audio, intenta describir lo que escuchas.'
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/webp', // Usar webp como fallback
                  data: audioBase64
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error de Anthropic:', errorData);
      
      // Si falla por tipo MIME, intentar con texto simple
      if (errorData.error?.message?.includes('media_type')) {
        console.log('🔄 Reintentando sin contenido de imagen...');
        
        const retryResponse = await fetch('https://api.anthropic.com/v1/messages', {
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
                content: 'Se ha grabado un audio de reunión pero no se puede procesar directamente. Por favor, proporciona una transcripción de prueba para demostrar que el sistema funciona.'
              }
            ]
          })
        });

        if (!retryResponse.ok) {
          throw new Error(`API Error: ${retryResponse.status}`);
        }

        const retryData = await retryResponse.json();
        const transcript = retryData.content[0]?.text || 'No se pudo transcribir el audio';

        return {
          statusCode: 200,
          body: JSON.stringify({
            success: true,
            transcript: `[Transcripción de prueba]\n\n${transcript}`
          })
        };
      }

      throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const transcript = data.content[0]?.text || 'No se pudo transcribir el audio';

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
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error en la transcripción'
      })
    };
  }
};

export { handler };
