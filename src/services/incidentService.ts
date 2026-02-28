import { supabase } from '../lib/supabase';

// ── Incident Categories ──────────────────────────────────────────────────────

export interface IncidentCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const getIncidentCategories = async (): Promise<IncidentCategory[]> => {
  try {
    const { data, error } = await supabase.from('incident_categories').select('*').order('name');
    if (error) return [];
    return (data ?? []) as IncidentCategory[];
  } catch { return []; }
};

// ── Incident Types ───────────────────────────────────────────────────────────

export interface IncidentType {
  id: number;
  category_id: number;
  name: string;
  description: string;
  approver_role: string;
  requires_dates: boolean;
  requires_clothing_details: boolean;
}

export const getIncidentTypes = async (): Promise<IncidentType[]> => {
  try {
    const { data, error } = await supabase.from('incident_types').select('*').order('name');
    if (error) return [];
    return (data ?? []) as IncidentType[];
  } catch { return []; }
};

// ── Incidents ────────────────────────────────────────────────────────────────

export const createIncident = async (
  data: Record<string, unknown>
): Promise<{ success: boolean; data?: Record<string, unknown>[]; error?: string }> => {
  try {
    const { data: result, error } = await supabase.from('incidents').insert([data]).select();
    if (error) return { success: false, error: error.message };
    return { success: true, data: (result ?? []) as Record<string, unknown>[] };
  } catch { return { success: false, error: 'Error creando incidencia' }; }
};

export const getIncidents = async (
  filter?: { employeeId?: number; statusFilter?: string }
): Promise<Record<string, unknown>[]> => {
  try {
    let query = supabase
      .from('incidents')
      .select(`*, incident_types(name, description, approver_role, requires_dates, requires_clothing_details), employees!incidents_employee_id_fkey(name, email, position)`)
      .order('created_at', { ascending: false });

    if (filter?.employeeId) query = query.eq('employee_id', filter.employeeId);
    if (filter?.statusFilter) query = query.eq('status', filter.statusFilter);

    const { data, error } = await query;
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const getEmployeeIdByEmail = async (email: string): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('id')
      .eq('email', email)
      .single();
    if (error || !data) return null;
    return (data as Record<string, unknown>).id as number;
  } catch { return null; }
};

export const updateIncident = async (
  id: number,
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('incidents').update(data).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch { return { success: false, error: 'Error actualizando incidencia' }; }
};

export const getChecklistIncidentsSince = async (dateFrom: string): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('checklist_incidents')
      .select('*')
      .gte('created_at', dateFrom);
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const updateChecklistIncident = async (id: string | number, data: Record<string, unknown>): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('checklist_incidents').update(data).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) { return { success: false, error: String(err) }; }
};
