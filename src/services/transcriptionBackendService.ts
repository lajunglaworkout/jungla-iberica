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

    // Convertir blob a base64
    const reader = new FileReader();
    const base64Audio = await new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    // Usar Netlify Function en producción, backend local en desarrollo
    const isProduction = import.meta.env.PROD;
    const backendUrl = isProduction 
      ? '' // En producción, Netlify Functions están en el mismo dominio
      : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001');

    const endpoint = isProduction
      ? '/.netlify/functions/transcribe'
      : `${backendUrl}/api/transcribe`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audioBase64: base64Audio,
        mimeType: audioBlob.type || 'audio/webm'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Error ${response.status}`);
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

    // Usar Netlify Function en producción, backend local en desarrollo
    const isProduction = import.meta.env.PROD;
    const backendUrl = isProduction 
      ? '' // En producción, Netlify Functions están en el mismo dominio
      : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001');

    const endpoint = isProduction
      ? '/.netlify/functions/generate-minutes'
      : `${backendUrl}/api/generate-minutes`;

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
