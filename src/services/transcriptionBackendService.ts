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

    console.log('🔍 isProduction:', isProduction);
    console.log('🔍 backendUrl:', backendUrl);

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
 * Generar acta de reunión usando Netlify Functions o backend local
 */
export const generateMeetingMinutesViaBackend = async (
  transcript: string,
  meetingTitle: string,
  participants: string[]
): Promise<{ success: boolean; minutes?: string; tasks?: any[]; error?: string }> => {
  try {
    console.log('📋 Generando acta de reunión via backend...');

    // Usar Render en producción, backend local en desarrollo
    const isProduction = import.meta.env.PROD;
    const backendUrl = isProduction 
      ? 'https://jungla-meetings-backend.onrender.com' // Backend en Render
      : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001');

    const endpoint = `${backendUrl}/api/generate-minutes`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transcript,
        meetingTitle,
        participants
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Error ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Error generando acta');
    }

    console.log('✅ Acta generada');
    return {
      success: true,
      minutes: data.minutes,
      tasks: data.tasks || []
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
