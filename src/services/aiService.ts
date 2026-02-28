/**
 * AI Service — Multi-provider con prioridad a Ollama local
 *
 * Orden de prioridad:
 * 1. Ollama local (Deepseek/Qwen) — sin coste, sin API key, funciona offline
 * 2. Supabase Edge Function → Google Gemini — fallback si Ollama no disponible
 *
 * Para transcripción de audio:
 * 1. Web Speech API (browser built-in, gratis, tiempo real)
 * 2. Supabase Edge Function → Gemini (fallback para grabaciones guardadas)
 */
import { supabase } from '../lib/supabase';
import { isOllamaAvailable, generateActaWithOllama } from './ollamaService';

// ─── TRANSCRIPCIÓN DE AUDIO ───────────────────────────────────────────────────

/**
 * Transcribe audio usando Gemini via Supabase Edge Function.
 * Se usa como fallback cuando Web Speech API no está disponible.
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      if (!base64Data) {
        reject(new Error('Failed to convert audio to base64'));
        return;
      }
      resolve(base64Data);
    };
    reader.onerror = () => reject(new Error('Failed to read audio file'));
    reader.readAsDataURL(audioBlob);
  });

  console.log(`📝 Enviando audio a transcripción via Edge Function (${(base64.length * 0.75 / 1024).toFixed(1)} KB)...`);

  const { data, error } = await supabase.functions.invoke('transcribe-audio', {
    body: {
      audio: base64,
      mimeType: audioBlob.type || 'audio/webm',
    },
  });

  if (error) {
    console.error('❌ Transcription edge function error:', error);
    throw new Error(`Error de transcripción: ${error.message}`);
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Error desconocido en transcripción');
  }

  console.log(`✅ Transcripción recibida: ${data.transcription.length} caracteres`);
  return data.transcription;
}

// ─── GENERACIÓN DE ACTAS ──────────────────────────────────────────────────────

/**
 * Genera el acta de una reunión y extrae tareas.
 *
 * Prioridad:
 * 1. Ollama local (Deepseek/Qwen) — sin coste, privado
 * 2. Supabase Edge Function → Gemini — fallback
 */
export async function generateMeetingMinutes(params: {
  transcription: string;
  departmentName: string;
  date: string;
  participants?: string[];
  pendingTasks?: string;
  openIncidents?: string;
  centerData?: string;
  objectives?: string;
}): Promise<{ minutes: string; tasks: Record<string, unknown>[]; parseWarning?: string; provider?: string }> {
  console.log(`📋 Generando acta para "${params.departmentName}"...`);

  // ── Intento 1: Ollama local ────────────────────────────────────────────────
  const ollamaUp = await isOllamaAvailable();
  if (ollamaUp) {
    try {
      console.log('🤖 Usando Ollama local para generar el acta...');
      const result = await generateActaWithOllama(params);
      console.log(`✅ Acta generada por Ollama (modelo: ${result.model}), ${result.minutes.length} chars, ${result.tasks.length} tareas`);
      return {
        minutes: result.minutes,
        tasks: result.tasks,
        provider: `Ollama (${result.model})`,
      };
    } catch (ollamaError) {
      console.warn('⚠️ Ollama falló, usando Gemini como fallback:', ollamaError);
    }
  } else {
    console.log('ℹ️ Ollama no disponible localmente, usando Gemini via Edge Function...');
  }

  // ── Intento 2: Supabase Edge Function → Gemini ────────────────────────────
  const { data, error } = await supabase.functions.invoke('generate-meeting-minutes', {
    body: params,
  });

  if (error) {
    console.error('❌ Minutes edge function error:', error);
    throw new Error(`Error al generar acta: ${error.message}`);
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Error desconocido al generar acta');
  }

  if (data.parseWarning) {
    console.warn('⚠️ Parse warning:', data.parseWarning);
  }

  console.log(`✅ Acta generada por Gemini: ${data.minutes?.length || 0} chars, ${data.tasks?.length || 0} tareas`);
  return {
    minutes: data.minutes,
    tasks: data.tasks || [],
    parseWarning: data.parseWarning,
    provider: 'Gemini (Edge Function)',
  };
}
