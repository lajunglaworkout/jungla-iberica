import { supabase } from '../lib/supabase';

// ── Franquiciado Dashboard Data ────────────────────────────────────────────

export const getCenterName = async (centerId: number): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('centers')
      .select('name')
      .eq('id', centerId)
      .single();
    if (error || !data) return null;
    return (data as Record<string, unknown>).name as string;
  } catch { return null; }
};

export const getFinancialData = async (
  centerId: number, month: number, year: number
): Promise<Record<string, unknown> | null> => {
  try {
    const { data, error } = await supabase
      .from('financial_data')
      .select('*')
      .eq('center_id', centerId)
      .eq('mes', month)
      .eq('año', year)
      .single();
    if (error) return null;
    return data as Record<string, unknown>;
  } catch { return null; }
};

export const getHistoricalFinancials = async (
  centerId: number
): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('financial_data')
      .select('*')
      .eq('center_id', centerId)
      .order('año', { ascending: true })
      .order('mes', { ascending: true })
      .limit(12);
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const getClientMetrics = async (
  centerId: number, month: number, year: number
): Promise<Record<string, unknown> | null> => {
  try {
    const { data, error } = await supabase
      .from('client_metrics')
      .select('*')
      .eq('center_id', centerId)
      .eq('mes', month)
      .eq('año', year)
      .single();
    if (error) return null;
    return data as Record<string, unknown>;
  } catch { return null; }
};

export const getHistoricalClients = async (
  centerId: number
): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('client_metrics')
      .select('*')
      .eq('center_id', centerId)
      .order('año', { ascending: true })
      .order('mes', { ascending: true })
      .limit(12);
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const getChecklistIncidents = async (
  centerId: number
): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('checklist_incidents')
      .select('*')
      .eq('center_id', centerId);
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const getEventosByCenterId = async (
  centerId: number
): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('id, estado, fecha_evento')
      .eq('center_id', centerId);
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const getFranquiciadoMensajes = async (
  centerId: number
): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('franquiciado_mensajes')
      .select('*')
      .eq('center_id', centerId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const getReunionesAccionistas = async (
  centerId: number
): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('reuniones_accionistas')
      .select('*')
      .eq('center_id', centerId)
      .order('fecha', { ascending: false })
      .limit(10);
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const sendFranquiciadoMessage = async (
  data: Record<string, unknown>
): Promise<{ success: boolean; messages?: Record<string, unknown>[]; error?: string }> => {
  try {
    const { error: insertError } = await supabase
      .from('franquiciado_mensajes')
      .insert([data]);
    if (insertError) return { success: false, error: insertError.message };

    const refreshed = await getFranquiciadoMensajes(data.center_id as number);
    return { success: true, messages: refreshed };
  } catch { return { success: false, error: 'Error enviando mensaje' }; }
};

export const getFinancialDataByMonthYear = async (month: number, year: number): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('financial_data')
      .select('*')
      .eq('año', year)
      .eq('mes', month);
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};
