/**
 * Netlify Function para transcribir audio
 * Endpoint: /.netlify/functions/transcribe
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

    console.log('🔄 Llamando a API de Anthropic...');

    // Llamar a la API de Anthropic para transcripción
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType || 'audio/webm',
                data: audioBase64
              }
            },
            {
              type: 'text',
              text: 'Por favor, transcribe el contenido de este audio de reunión. Proporciona la transcripción completa y clara.'
            }
          ]
        }
      ]
    });

    const transcript = message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'No se pudo transcribir el audio';

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
