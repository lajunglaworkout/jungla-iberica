import { supabase } from '../lib/supabase';

export interface MeetingObjective {
  id?: string;
  meeting_id?: number;
  department: string;
  texto: string;
  orden?: number;
  // Revisión
  revisado?: boolean;
  conseguido?: boolean | null;
  nota_revision?: string;
  revisado_en_meeting_id?: number;
  revisado_at?: string;
  // AI
  interpretacion_ai?: string;
  created_at?: string;
}

class MeetingObjectivesService {
  /**
   * Carga los objetivos sin revisar de la última reunión completada
   * del departamento. Son los que aparecen al abrir una nueva reunión.
   */
  async getPendingObjectives(department: string): Promise<MeetingObjective[]> {
    // 1. Última reunión completada del departamento
    const { data: lastMeeting } = await supabase
      .from('meetings')
      .select('id')
      .eq('department', department)
      .eq('status', 'completed')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (!lastMeeting) return [];

    // 2. Objetivos de esa reunión sin revisar aún
    const { data, error } = await supabase
      .from('meeting_objectives')
      .select('*')
      .eq('meeting_id', lastMeeting.id)
      .eq('revisado', false)
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error cargando objetivos pendientes:', error);
      return [];
    }
    return data ?? [];
  }

  /**
   * Guarda los nuevos objetivos escritos en la reunión actual.
   */
  async saveObjectives(
    meetingId: number,
    department: string,
    textos: string[]
  ): Promise<void> {
    const rows = textos
      .map((t) => t.trim())
      .filter(Boolean)
      .map((texto, i) => ({ meeting_id: meetingId, department, texto, orden: i }));

    if (rows.length === 0) return;

    const { error } = await supabase.from('meeting_objectives').insert(rows);
    if (error) console.error('Error guardando objetivos:', error);
  }

  /**
   * Marca un objetivo como revisado (conseguido o no) en la reunión actual.
   */
  async reviewObjective(
    objectiveId: string,
    conseguido: boolean,
    nota: string,
    currentMeetingId: number
  ): Promise<void> {
    const { error } = await supabase
      .from('meeting_objectives')
      .update({
        revisado: true,
        conseguido,
        nota_revision: nota || null,
        revisado_en_meeting_id: currentMeetingId,
        revisado_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', objectiveId);

    if (error) console.error('Error revisando objetivo:', error);
  }

  /**
   * Guarda la interpretación AI generada para los objetivos de una reunión.
   */
  async saveAIInterpretation(meetingId: number, interpretacion: string): Promise<void> {
    const { error } = await supabase
      .from('meeting_objectives')
      .update({ interpretacion_ai: interpretacion })
      .eq('meeting_id', meetingId);

    if (error) console.error('Error guardando interpretación AI:', error);
  }

  /**
   * Historial de objetivos (conseguidos/no) de un departamento.
   * Útil para el contexto AI y futuros análisis.
   */
  async getHistory(department: string, limit = 20): Promise<MeetingObjective[]> {
    const { data, error } = await supabase
      .from('meeting_objectives')
      .select('*')
      .eq('department', department)
      .eq('revisado', true)
      .order('revisado_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error cargando historial objetivos:', error);
      return [];
    }
    return data ?? [];
  }
}

export const meetingObjectivesService = new MeetingObjectivesService();
