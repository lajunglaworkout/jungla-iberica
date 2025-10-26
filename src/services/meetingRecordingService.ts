import { supabase } from '../lib/supabase';

export interface MeetingRecording {
  id?: string;
  meeting_id: number;
  audio_blob?: Blob;
  audio_url?: string;
  transcript?: string;
  meeting_minutes?: string;
  tasks_assigned?: any[];
  status: 'recording' | 'processing' | 'completed' | 'error';
  created_at?: string;
  duration_seconds?: number;
}

// Servicio de grabación de audio
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<boolean> {
    try {
      this.audioChunks = [];
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start();
      console.log('🎙️ Grabación iniciada');
      return true;
    } catch (error) {
      console.error('❌ Error al iniciar grabación:', error);
      return false;
    }
  }

  async stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.cleanup();
        console.log('🎙️ Grabación detenida');
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    this.mediaRecorder = null;
    this.stream = null;
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

// Transcribir audio usando Claude API (Anthropic)
export const transcribeAudio = async (audioBlob: Blob): Promise<{ success: boolean; transcript?: string; error?: string }> => {
  try {
    console.log('📝 Iniciando transcripción con Claude...');
    
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ REACT_APP_ANTHROPIC_API_KEY no configurada. Usando transcripción simulada.');
      // Simulación para desarrollo
      return {
        success: true,
        transcript: 'Transcripción simulada: Esta es una reunión de ejemplo donde se discuten los objetivos del trimestre, se revisan los KPIs del mes anterior y se asignan nuevas tareas a los equipos...'
      };
    }

    // Convertir Blob a base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64Audio = btoa(binary);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
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
                text: 'Por favor, transcribe el siguiente audio de una reunión. Proporciona la transcripción completa y detallada de todo lo que se dice. Mantén la estructura y el flujo natural de la conversación.'
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'audio/wav',
                  data: base64Audio
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error en API: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const transcript = data.content[0].text;
    console.log('✅ Transcripción completada con Claude');
    
    return {
      success: true,
      transcript: transcript
    };
  } catch (error) {
    console.error('❌ Error en transcripción:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// Alternativa: Transcribir con Gemini API (Google)
export const transcribeAudioWithGemini = async (audioBlob: Blob): Promise<{ success: boolean; transcript?: string; error?: string }> => {
  try {
    console.log('📝 Iniciando transcripción con Gemini...');
    
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ REACT_APP_GOOGLE_API_KEY no configurada.');
      return {
        success: false,
        error: 'Google API key no configurada'
      };
    }

    // Convertir Blob a base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64Audio = btoa(binary);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Por favor, transcribe el siguiente audio de una reunión. Proporciona la transcripción completa y detallada.'
                },
                {
                  inlineData: {
                    mimeType: 'audio/wav',
                    data: base64Audio
                  }
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error en API: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const transcript = data.candidates[0].content.parts[0].text;
    console.log('✅ Transcripción completada con Gemini');
    
    return {
      success: true,
      transcript: transcript
    };
  } catch (error) {
    console.error('❌ Error en transcripción con Gemini:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// Generar acta usando Claude API (Anthropic)
export const generateMeetingMinutes = async (
  transcript: string,
  meetingTitle: string,
  participants: string[]
): Promise<{ success: boolean; minutes?: string; tasks?: any[]; error?: string }> => {
  try {
    console.log('📋 Generando acta de reunión...');
    
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ REACT_APP_ANTHROPIC_API_KEY no configurada. Usando acta simulada.');
      // Simulación para desarrollo
      return {
        success: true,
        minutes: `ACTA DE REUNIÓN - ${meetingTitle}
        
Participantes: ${participants.join(', ')}
Fecha: ${new Date().toLocaleDateString('es-ES')}

RESUMEN:
Se discutieron los objetivos principales del trimestre y se asignaron responsabilidades.

PUNTOS CLAVE:
- Punto 1: Descripción del punto
- Punto 2: Descripción del punto
- Punto 3: Descripción del punto

TAREAS ASIGNADAS:
- Tarea 1: Asignado a Persona 1, Fecha límite: ${new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString('es-ES')}
- Tarea 2: Asignado a Persona 2, Fecha límite: ${new Date(Date.now() + 14*24*60*60*1000).toLocaleDateString('es-ES')}`,
        tasks: [
          { title: 'Tarea 1', assignedTo: participants[0] || 'Sin asignar', deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString() },
          { title: 'Tarea 2', assignedTo: participants[1] || 'Sin asignar', deadline: new Date(Date.now() + 14*24*60*60*1000).toISOString() }
        ]
      };
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `Por favor, analiza la siguiente transcripción de reunión y genera:
1. Un acta profesional con resumen, puntos clave y decisiones
2. Una lista de tareas asignadas a cada participante

Transcripción:
${transcript}

Título de la reunión: ${meetingTitle}
Participantes: ${participants.join(', ')}

Por favor, formatea la respuesta como JSON con las siguientes claves:
{
  "minutes": "acta completa aquí",
  "tasks": [
    {"title": "tarea", "assignedTo": "persona", "deadline": "fecha"}
  ]
}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Error en API: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;
    
    // Parsear JSON de la respuesta
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo parsear la respuesta');
    }

    const result = JSON.parse(jsonMatch[0]);
    console.log('✅ Acta generada');
    
    return {
      success: true,
      minutes: result.minutes,
      tasks: result.tasks
    };
  } catch (error) {
    console.error('❌ Error generando acta:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// Guardar grabación en Supabase
export const saveMeetingRecording = async (
  meetingId: number,
  audioBlob: Blob,
  transcript: string,
  meetingMinutes: string,
  tasksAssigned: any[]
): Promise<{ success: boolean; recordingId?: string; error?: string }> => {
  try {
    console.log('💾 Guardando grabación en Supabase...');

    // Subir archivo de audio a storage
    const fileName = `meeting_${meetingId}_${Date.now()}.wav`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('meeting_recordings')
      .upload(fileName, audioBlob, {
        contentType: 'audio/wav'
      });

    if (uploadError) {
      throw uploadError;
    }

    // Obtener URL pública del archivo
    const { data: publicUrlData } = supabase.storage
      .from('meeting_recordings')
      .getPublicUrl(fileName);

    // Guardar registro en tabla
    const { data, error } = await supabase
      .from('meeting_recordings')
      .insert([{
        meeting_id: meetingId,
        audio_url: publicUrlData.publicUrl,
        transcript: transcript,
        meeting_minutes: meetingMinutes,
        tasks_assigned: tasksAssigned,
        status: 'completed',
        duration_seconds: Math.round(audioBlob.size / 16000) // Aproximación
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Grabación guardada');
    return {
      success: true,
      recordingId: data.id
    };
  } catch (error) {
    console.error('❌ Error guardando grabación:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// Obtener grabación de reunión
export const getMeetingRecording = async (
  meetingId: number
): Promise<{ success: boolean; recording?: MeetingRecording; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('meeting_recordings')
      .select('*')
      .eq('meeting_id', meetingId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      recording: data
    };
  } catch (error) {
    console.error('❌ Error obteniendo grabación:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

// Listar grabaciones de reuniones
export const listMeetingRecordings = async (
  limit: number = 10
): Promise<{ success: boolean; recordings?: MeetingRecording[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('meeting_recordings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      recordings: data
    };
  } catch (error) {
    console.error('❌ Error listando grabaciones:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};
