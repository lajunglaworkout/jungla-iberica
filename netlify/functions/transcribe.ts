/**
 * Netlify Function para transcribir audio con AssemblyAI
 * Endpoint: /.netlify/functions/transcribe
 * 
 * Usa AssemblyAI para transcripción precisa de audio
 */

import { Handler } from '@netlify/functions';

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;

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

    if (!ASSEMBLYAI_API_KEY) {
      console.error('❌ ASSEMBLYAI_API_KEY no configurada');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'AssemblyAI API key no configurada' })
      };
    }

    console.log('🔄 Enviando audio a AssemblyAI...');

    // Convertir base64 a buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');

    // Subir archivo a AssemblyAI
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': ASSEMBLYAI_API_KEY,
        'Content-Type': 'application/octet-stream'
      },
      body: audioBuffer
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.error('❌ Error subiendo a AssemblyAI:', error);
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }

    const uploadData = await uploadResponse.json();
    const audioUrl = uploadData.upload_url;

    console.log('✅ Audio subido, iniciando transcripción...');

    // Iniciar transcripción
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': ASSEMBLYAI_API_KEY,
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
      const error = await transcriptResponse.text();
      console.error('❌ Error iniciando transcripción:', error);
      throw new Error(`Transcription failed: ${transcriptResponse.status}`);
    }

    const transcriptData = await transcriptResponse.json();
    const transcriptId = transcriptData.id;

    console.log('⏳ Esperando resultado de transcripción...');

    // Esperar a que se complete la transcripción (máximo 60 segundos)
    let transcript = null;
    let attempts = 0;
    const maxAttempts = 120; // 2 minutos máximo

    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          'Authorization': ASSEMBLYAI_API_KEY
        }
      });

      if (!statusResponse.ok) {
        throw new Error(`Status check failed: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();

      if (statusData.status === 'completed') {
        transcript = statusData.text;
        console.log('✅ Transcripción completada');
        break;
      } else if (statusData.status === 'error') {
        throw new Error(`Transcription error: ${statusData.error}`);
      }

      // Esperar 1 segundo antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    if (!transcript) {
      throw new Error('Transcription timeout');
    }

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
