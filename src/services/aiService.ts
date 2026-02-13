/**
 * AI Service — Supabase Edge Functions proxy
 * 
 * All AI calls go through Supabase Edge Functions.
 * The GOOGLE_API_KEY lives ONLY in Supabase Secrets.
 * NO API keys are exposed in the frontend bundle.
 */
import { supabase } from '../lib/supabase';

/**
 * Transcribe audio using Gemini via Supabase Edge Function.
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
    // Convert blob to base64
    const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // Remove the "data:audio/webm;base64," prefix
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

    console.log(`📝 Sending audio to transcription (${(base64.length * 0.75 / 1024).toFixed(1)} KB)...`);

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

    console.log(`✅ Transcription received: ${data.transcription.length} characters`);
    return data.transcription;
}

/**
 * Generate meeting minutes and extract tasks using Gemini via Supabase Edge Function.
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
}): Promise<{ minutes: string; tasks: any[]; parseWarning?: string }> {
    console.log(`📋 Generating meeting minutes for "${params.departmentName}"...`);

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

    console.log(`✅ Minutes generated: ${data.minutes?.length || 0} chars, ${data.tasks?.length || 0} tasks`);

    return {
        minutes: data.minutes,
        tasks: data.tasks || [],
        parseWarning: data.parseWarning,
    };
}
