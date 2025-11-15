/**
 * Servicio de transcripción usando backend proxy
 * Esto evita problemas de CORS al llamar a APIs externas desde el navegador
 */

import { supabase } from '../lib/supabase';

/**
 * Transcribir audio usando Netlify Functions o backend local
 */
export const transcribeAudioViaBackend = async (
  audioBlob: Blob
): Promise<{ success: boolean; transcript?: string; error?: string }> => {
  try {
    console.log('📝 Iniciando transcripción via backend...');

    // Usar Render en producción, backend local en desarrollo
    const isProduction = import.meta.env.PROD;
    const backendUrl = isProduction 
      ? 'https://jungla-meetings-backend.onrender.com' // Backend en Render
      : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001');

    const endpoint = `${backendUrl}/api/transcribe`;

    // Usar FormData para enviar el archivo directamente (evita problema de tamaño)
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const text = await response.text();
      try {
        const error = JSON.parse(text);
        throw new Error(error.error || `Error ${response.status}`);
      } catch {
        throw new Error(`Error ${response.status}: ${text}`);
      }
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Error en transcripción');
    }

    console.log('✅ Transcripción completada');
    return {
      success: true,
      transcript: data.transcript
    };
  } catch (error) {
    console.error('❌ Error en transcripción:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Generar acta de reunión usando DeepSeek directamente
 */
export const generateMeetingMinutesViaBackend = async (
  transcript: string,
  meetingTitle: string,
  participants: string[]
): Promise<{ success: boolean; minutes?: string; tasks?: any[]; error?: string }> => {
  try {
    console.log('📋 Generando acta de reunión via DeepSeek...');

    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_DEEPSEEK_API_KEY no configurada');
    }

    const prompt = `Eres un asistente especializado en generar actas de reuniones profesionales.

Genera un acta detallada basada en la siguiente transcripción de reunión:

**Título de la reunión:** ${meetingTitle}
**Participantes:** ${participants.join(', ')}
**Transcripción:**
${transcript}

Por favor, genera:

1. Un acta profesional con:
   - Información general (título, fecha, participantes)
   - Resumen ejecutivo
   - Puntos principales tratados
   - Decisiones tomadas
   - Acciones pendientes
   - Próximos pasos

2. Una lista de tareas extraídas de la reunión en formato JSON al final, con este formato exacto:
\`\`\`json
[
  {"tarea": "descripción de la tarea", "responsable": "nombre o 'Sin asignar'", "plazo": "fecha estimada o 'Por determinar'"},
  ...
]
\`\`\`

Responde SOLO con el acta seguida de la lista JSON de tareas.`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Error ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extraer el acta y las tareas del contenido
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    let tasks = [];
    let minutes = content;

    if (jsonMatch) {
      try {
        tasks = JSON.parse(jsonMatch[0]);
        minutes = content.substring(0, jsonMatch.index).trim();
      } catch (e) {
        console.warn('⚠️ No se pudo parsear JSON de tareas');
      }
    }

    console.log('✅ Acta generada');
    return {
      success: true,
      minutes: minutes,
      tasks: tasks
    };
  } catch (error) {
    console.error('❌ Error generando acta:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Guardar grabación en Supabase Storage
 */
export const saveRecordingToStorage = async (
  audioBlob: Blob,
  meetingId: string,
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    console.log('💾 Guardando grabación en storage...');

    const filePath = `meetings/${meetingId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('meeting_recordings')
      .upload(filePath, audioBlob, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Error guardando en storage:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Obtener URL pública
    const { data: publicData } = supabase.storage
      .from('meeting_recordings')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicData?.publicUrl
    };
  } catch (error) {
    console.error('❌ Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};
