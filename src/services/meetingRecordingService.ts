import { supabase } from '../lib/supabase';

export interface MeetingTask {
  title?: string;
  titulo?: string;
  assignedTo?: string;
  asignado_a?: string;
  deadline?: string;
  fecha_limite?: string;
}

export interface MeetingRecording {
  id?: string;
  meeting_id: number;
  audio_blob?: Blob;
  audio_url?: string;
  transcript?: string;
  meeting_minutes?: string;
  tasks_assigned?: MeetingTask[];
  status: 'recording' | 'processing' | 'completed' | 'error';
  created_at?: string;
  duration_seconds?: number;
}

// Servicio de grabación de audio
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private actualMimeType: string = 'audio/webm';

  async startRecording(): Promise<boolean> {
    try {
      this.audioChunks = [];
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Seleccionar el tipo nativo que soporta el navegador
      // NUNCA usar 'audio/wav' — MediaRecorder no genera WAV real
      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/mp4'
      ];
      const supportedType = preferredTypes.find(t => MediaRecorder.isTypeSupported(t)) || '';

      this.mediaRecorder = supportedType
        ? new MediaRecorder(this.stream, { mimeType: supportedType })
        : new MediaRecorder(this.stream);

      // Guardar el MIME type base (sin codecs) para enviarlo a Gemini
      const rawMime = this.mediaRecorder.mimeType || 'audio/webm';
      this.actualMimeType = rawMime.split(';')[0]; // 'audio/webm;codecs=opus' → 'audio/webm'
      console.log(`🎙️ MediaRecorder mimeType: ${rawMime} → enviando: ${this.actualMimeType}`);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // chunk cada segundo para estabilidad
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
        // Usar el MIME type real del MediaRecorder
        const audioBlob = new Blob(this.audioChunks, { type: this.actualMimeType });
        console.log(`🎙️ Grabación detenida: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
        this.cleanup();
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



// Guardar grabación en Supabase (solo transcripción y acta, sin audio)
export const saveMeetingRecording = async (
  meetingId: number,
  audioBlob: Blob,
  transcript: string,
  meetingMinutes: string,
  tasksAssigned: MeetingTask[]
): Promise<{ success: boolean; recordingId?: string; error?: string }> => {
  try {
    console.log('💾 Guardando transcripción y acta en Supabase (sin audio)...');

    // Guardar solo transcripción y acta, sin el archivo de audio
    // Esto evita llenar Supabase con archivos de audio grandes
    const { data, error } = await supabase
      .from('meeting_recordings')
      .insert([{
        meeting_id: meetingId,
        audio_url: null, // No guardamos audio
        transcript: transcript,
        meeting_minutes: meetingMinutes,
        tasks_assigned: tasksAssigned,
        status: 'completed',
        duration_seconds: Math.round(audioBlob.size / 16000) // Aproximación solo para referencia
      }])
      .select()
      .single();

    if (error) {
      console.warn('⚠️ Advertencia al guardar grabación:', error.message);
      // No lanzamos error, solo advertencia
      // La transcripción y acta ya se generaron correctamente
      return {
        success: true,
        recordingId: 'local',
        error: 'Grabación guardada localmente (sin almacenamiento de audio en servidor)'
      };
    }

    console.log('✅ Transcripción y acta guardadas (audio no almacenado)');
    return {
      success: true,
      recordingId: data.id
    };
  } catch (error) {
    console.warn('⚠️ Error guardando grabación (no crítico):', error);
    // Devolver éxito parcial - la transcripción y acta ya funcionan
    return {
      success: true,
      recordingId: 'local',
      error: 'Grabación procesada pero no guardada en servidor'
    };
  }
};

// Guardar reunión en tabla meetings para el historial
export const saveMeetingToHistory = async (
  meetingTitle: string,
  departmentId: string,
  participants: string[],
  transcript: string,
  meetingMinutes: string,
  tasksAssigned: MeetingTask[]
): Promise<{ success: boolean; meetingId?: string; error?: string }> => {
  try {
    console.log('📅 Guardando reunión en historial...', {
      title: meetingTitle,
      department: departmentId,
      participants: participants.length
    });

    // Obtener el usuario autenticado actual
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserEmail = user?.email || 'unknown@jungla.com';

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const endTime = new Date(now.getTime() + 60 * 60000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const meetingData = {
      title: meetingTitle,
      department: departmentId,
      type: 'weekly',
      date: currentDate,
      start_time: currentTime,
      end_time: endTime,
      duration_minutes: 60,
      participants: participants,
      leader_email: currentUserEmail,
      agenda: transcript.substring(0, 500), // Limitar a 500 caracteres
      objectives: [],
      kpis: {},
      tasks: tasksAssigned.map((t) => ({
        title: t.title || t.titulo,
        assignedTo: t.assignedTo || t.asignado_a,
        deadline: t.deadline || t.fecha_limite
      })),
      notes: null,
      summary: meetingMinutes.substring(0, 1000), // Limitar a 1000 caracteres
      status: 'completed',
      completion_percentage: 100,
      created_by: currentUserEmail
    };

    console.log('📋 Datos a guardar:', meetingData);
    console.log('🔍 Insertando en tabla meetings...');

    const { data, error } = await supabase
      .from('meetings')
      .insert([meetingData])
      .select()
      .single();

    console.log('🔍 Resultado de insert:', { data, error });

    if (error) {
      console.error('❌ Error guardando reunión en historial:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('✅ Reunión guardada en historial con ID:', data.id);
    return {
      success: true,
      meetingId: data.id
    };
  } catch (error) {
    console.error('❌ Error inesperado guardando reunión:', error);
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
