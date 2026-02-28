import { supabase } from '../lib/supabase';

// ── Timeclock ──────────────────────────────────────────────────────────────

interface TimeclockQuery {
  date: string;
  centerId: number;
  employeeId?: number | null;
  onlyForEmployee?: boolean;
}

export const getTimeclockRecords = async ({
  date,
  centerId,
  employeeId,
  onlyForEmployee = false
}: TimeclockQuery): Promise<Record<string, unknown>[]> => {
  try {
    let query = supabase
      .from('timeclock_records')
      .select(`*, employees!inner(nombre, apellidos), centers!inner(name)`)
      .eq('date', date)
      .eq('center_id', centerId);

    if (onlyForEmployee && employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    const { data, error } = await query.order('clock_in', { ascending: true });
    if (error) throw error;
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

// ── QR Tokens ──────────────────────────────────────────────────────────────

export const cleanupExpiredQRTokens = async (): Promise<void> => {
  try {
    await supabase.from('qr_tokens').delete().lt('expires_at', new Date().toISOString());
  } catch { /* non-critical */ }
};

interface QRTokenInsert {
  center_id: number;
  employee_id: string | null;
  token: string;
  expires_at: string;
  is_used: boolean;
}

export const createQRToken = async (token: QRTokenInsert): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('qr_tokens').insert(token);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch { return { success: false, error: 'Error creando token QR' }; }
};

// ── Vacation Requests ──────────────────────────────────────────────────────

export const getVacationRequests = async (employeeId: number | string): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('vacation_requests')
      .select('*')
      .eq('employee_id', employeeId);
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const createVacationRequest = async (
  request: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('vacation_requests').insert([request]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch { return { success: false, error: 'Error al enviar solicitud' }; }
};

export const getTimeclockForEmployeeToday = async (
  employeeId: number,
  date: string
): Promise<Record<string, unknown> | null> => {
  try {
    const { data, error } = await supabase
      .from('timeclock_records')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('date', date)
      .maybeSingle();
    if (error) return null;
    return data as Record<string, unknown> | null;
  } catch { return null; }
};

// ── Uniform Requests ──────────────────────────────────────────────────────

export const getUniformRequests = async (): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('uniform_requests')
      .select('*')
      .order('requested_at', { ascending: false });
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

// ── Shifts ─────────────────────────────────────────────────────────────────

export const getShiftsByIds = async (ids: number[]): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase.from('shifts').select('*').in('id', ids);
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const insertEmployeeShiftAssignments = async (
  assignments: { employee_id: number; shift_id: number; date: string }[]
): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    const { error } = await supabase.from('employee_shifts').insert(assignments);
    if (error) return { success: false, count: 0, error: error.message };
    return { success: true, count: assignments.length };
  } catch { return { success: false, count: 0, error: 'Error insertando asignaciones' }; }
};

export const updateShift = async (
  id: number,
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('shifts').update(data).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch { return { success: false, error: 'Error actualizando turno' }; }
};

export const createShift = async (
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('shifts').insert([data]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch { return { success: false, error: 'Error creando turno' }; }
};

export const deleteShift = async (id: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('shifts').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch { return { success: false, error: 'Error eliminando turno' }; }
};

export const getShiftAssignments = async (
  shiftId: number
): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('employee_shifts')
      .select('employee_id, employees(nombre, apellidos, email)')
      .eq('shift_id', shiftId);
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const publishShift = async (
  id: number,
  publishedBy: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('shifts')
      .update({ status: 'published', published_at: new Date().toISOString(), published_by: publishedBy, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch { return { success: false, error: 'Error publicando turno' }; }
};

// ── Vacation Requests (admin queries) ──────────────────────────────────────

export const getAllVacationRequestsWithEmployees = async (): Promise<Record<string, unknown>[]> => {
  try {
    const { data: vacationData, error: vErr } = await supabase
      .from('vacation_requests')
      .select('*')
      .order('requested_at', { ascending: false });
    if (vErr || !vacationData) return [];

    const employeeIds = [...new Set(vacationData.map((v: Record<string, unknown>) => v.employee_id as number))];
    const { data: employeesData } = await supabase
      .from('employees')
      .select('id, name, center_id')
      .in('id', employeeIds);

    return vacationData.map((request: Record<string, unknown>) => {
      const emp = (employeesData ?? []).find((e: Record<string, unknown>) => e.id === request.employee_id);
      return {
        ...request,
        employee_name: (emp as Record<string, unknown>)?.name || request.employee_name || 'Desconocido',
        center_id: (emp as Record<string, unknown>)?.center_id || null
      };
    });
  } catch { return []; }
};

export const updateVacationRequestStatus = async (
  id: number,
  status: 'approved' | 'rejected',
  reviewedAt: string,
  reviewedBy: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('vacation_requests')
      .update({ status, reviewed_at: reviewedAt, reviewed_by: reviewedBy })
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch { return { success: false, error: 'Error actualizando solicitud' }; }
};

export const getPendingVacationRequestsRaw = async (): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('vacation_requests')
      .select('*')
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const getPendingUniformRequestsRaw = async (): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('uniform_requests')
      .select('*')
      .eq('status', 'pending')
      .order('requested_at', { ascending: false });
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const getVacationRequestsForEmployees = async (
  employeeIds: number[]
): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('vacation_requests')
      .select('*')
      .in('employee_id', employeeIds)
      .eq('status', 'pending');
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

// ── Uniform Requests (admin operations) ───────────────────────────────────

interface UniformItem {
  itemId?: string;
  itemName?: string;
  name?: string;
  quantity?: number;
  size?: string;
  [key: string]: unknown;
}

export const processUniformRequestUpdate = async (
  id: number,
  status: string,
  additionalData: Record<string, unknown> = {},
  requestItems?: UniformItem[],
  previousStatus?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await supabase.from('uniform_requests').update({ status, ...additionalData }).eq('id', id);

    if (status === 'approved' && previousStatus === 'pending' && requestItems) {
      const ITEM_MAPPINGS: Record<string, string> = {
        'vestuario_chandal': 'CHÁNDAL',
        'vestuario_sudadera': 'SUDADERA FRÍO',
        'vestuario_chaleco': 'CHALECO FRÍO',
        'vestuario_pantalon': 'PANTALÓN CORTO',
        'vestuario_polo': 'POLO VERDE',
        'vestuario_camiseta': 'CAMISETA ENTRENAMIENTO PERSONAL'
      };
      for (const item of requestItems) {
        const inventoryName = ITEM_MAPPINGS[(item.itemId ?? '')] || item.itemName || item.name;
        const { data: invItem } = await supabase
          .from('inventory_items')
          .select('id, quantity')
          .eq('name', inventoryName)
          .eq('size', item.size)
          .single();
        if (invItem) {
          const newQty = Math.max(0, (invItem.quantity as number) - (item.quantity ?? 0));
          await supabase.from('inventory_items').update({ quantity: newQty }).eq('id', invItem.id);
        }
      }
    }
    return { success: true };
  } catch { return { success: false, error: 'Error actualizando solicitud de uniforme' }; }
};

export const getUniformRequestsByEmployee = async (
  employeeName: string
): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('uniform_requests')
      .select('*')
      .eq('employee_name', employeeName)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const getEmployeeUniformAssignments = async (
  employeeId: number | string
): Promise<Record<string, unknown> | null> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('vestuario_chandal, vestuario_sudadera_frio, vestuario_chaleco_frio, vestuario_pantalon_corto, vestuario_polo_verde, vestuario_camiseta_entrenamiento, vestuario_observaciones')
      .eq('id', employeeId)
      .single();
    if (error) return null;
    return data as Record<string, unknown>;
  } catch { return null; }
};

export const updateUniformRequestStatus = async (
  id: number | string,
  status: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('uniform_requests')
      .update({ status })
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch { return { success: false, error: 'Error actualizando estado' }; }
};

export const upsertDailyAttendance = async (
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('daily_attendance')
      .upsert(data, { onConflict: 'employee_id,date' });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch { return { success: false, error: 'Error actualizando asistencia diaria' }; }
};

export const getAllShifts = async (): Promise<{ data: Record<string, unknown>[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .order('center_id', { ascending: true })
      .order('start_time', { ascending: true });
    if (error) return { data: [], error: error.message };
    return { data: (data ?? []) as Record<string, unknown>[] };
  } catch (err) { return { data: [], error: String(err) }; }
};

export const getShiftsByCenterId = async (centerId: number): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase.from('shifts').select('*').eq('center_id', centerId);
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const getEmployeeShiftsInRange = async (
  centerId: number, monthStart: string, monthEnd: string
): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('employee_shifts')
      .select('*, shifts!inner(name, start_time, end_time, center_id)')
      .gte('date', monthStart)
      .lte('date', monthEnd)
      .eq('shifts.center_id', centerId)
      .order('date', { ascending: true })
      .order('shift_id', { ascending: true });
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const getEmployeeShiftsSample = async (): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase.from('employee_shifts').select('*').limit(5);
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const insertEmployeeShiftSingle = async (
  payload: { employee_id: number; shift_id: number; date: string }
): Promise<{ data?: Record<string, unknown>[]; error?: string }> => {
  try {
    const { data, error } = await supabase.from('employee_shifts').insert([payload]).select();
    if (error) return { error: error.message };
    return { data: (data ?? []) as Record<string, unknown>[] };
  } catch (err) { return { error: String(err) }; }
};

export const deleteEmployeeShiftById = async (
  id: number
): Promise<{ data?: Record<string, unknown>[]; error?: string }> => {
  try {
    const { data, error } = await supabase.from('employee_shifts').delete().eq('id', id).select();
    if (error) return { error: error.message };
    return { data: (data ?? []) as Record<string, unknown>[] };
  } catch (err) { return { error: String(err) }; }
};

export const deleteEmployeeShiftsByIds = async (
  ids: number[]
): Promise<{ data?: Record<string, unknown>[]; error?: string }> => {
  try {
    const { data, error } = await supabase.from('employee_shifts').delete().in('id', ids).select();
    if (error) return { error: error.message };
    return { data: (data ?? []) as Record<string, unknown>[] };
  } catch (err) { return { error: String(err) }; }
};

export const checkExistingShiftAssignmentDates = async (
  employeeId: number, shiftId: number, dates: string[]
): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('employee_shifts')
      .select('date')
      .eq('employee_id', employeeId)
      .eq('shift_id', shiftId)
      .in('date', dates);
    if (error) return [];
    return (data ?? []).map((row: Record<string, unknown>) => row.date as string);
  } catch { return []; }
};

export const createUniformRequest = async (
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('uniform_requests').insert(data);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch { return { success: false, error: 'Error creando solicitud de uniforme' }; }
};

export const updateUniformRequest = async (
  id: number, data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from('uniform_requests').update(data).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch { return { success: false, error: 'Error actualizando solicitud de uniforme' }; }
};

// ── Shift Calendar ────────────────────────────────────────────────────────────

export const getAllEmployeeShiftAssignmentsWithDetails = async (): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('employee_shifts')
      .select('*, employees(name), shifts(name, start_time, end_time)');
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

// ── HR Reports ────────────────────────────────────────────────────────────────

export const getAttendanceRecordsInRange = async (dateFrom: string, dateTo: string): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .gte('date', dateFrom)
      .lte('date', dateTo);
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const getVacationRequestsPending = async (): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('vacation_requests')
      .select('*')
      .eq('status', 'pending');
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

export const getEmployeeShiftsSince = async (dateFrom: string): Promise<Record<string, unknown>[]> => {
  try {
    const { data, error } = await supabase
      .from('employee_shifts')
      .select('*')
      .gte('date', dateFrom);
    if (error) return [];
    return (data ?? []) as Record<string, unknown>[];
  } catch { return []; }
};

// ── Timeclock ─────────────────────────────────────────────────────────────────

export const getEmployeeByEmail = async (email: string): Promise<Record<string, unknown> | null> => {
  try {
    const { data, error } = await supabase.from('employees').select('*').eq('email', email).single();
    if (error || !data) return null;
    return data as Record<string, unknown>;
  } catch { return null; }
};

export const getEmployeeIdOnly = async (email: string): Promise<{ id: number | string } | null> => {
  try {
    const { data, error } = await supabase.from('employees').select('id').eq('email', email).single();
    if (error || !data) return null;
    return data as { id: number | string };
  } catch { return null; }
};

export const getTimeclockRecordToday = async (employeeId: number | string, date: string): Promise<Record<string, unknown> | null> => {
  try {
    const { data, error } = await supabase
      .from('timeclock_records')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('date', date)
      .single();
    if (error) return null;
    return data as Record<string, unknown>;
  } catch { return null; }
};

export const getValidQRToken = async (token: string, now: string): Promise<{ data: Record<string, unknown> | null; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('qr_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_used', false)
      .gte('expires_at', now)
      .single();
    if (error) return { data: null, error: error.message };
    return { data: data as Record<string, unknown> };
  } catch (err) { return { data: null, error: String(err) }; }
};

export const getExistingTimeclockEntry = async (employeeId: number | string, date: string): Promise<{ data: Record<string, unknown> | null; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('timeclock_records')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('date', date)
      .maybeSingle();
    if (error) return { data: null, error: error.message };
    return { data: data as Record<string, unknown> | null };
  } catch (err) { return { data: null, error: String(err) }; }
};

export const createTimeclockRecord = async (payload: Record<string, unknown>): Promise<{ data: Record<string, unknown> | null; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('timeclock_records')
      .insert(payload)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: data as Record<string, unknown> };
  } catch (err) { return { data: null, error: String(err) }; }
};

export const updateTimeclockRecord = async (id: number | string, payload: Record<string, unknown>): Promise<{ data: Record<string, unknown> | null; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('timeclock_records')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: data as Record<string, unknown> };
  } catch (err) { return { data: null, error: String(err) }; }
};

export const markQRTokenUsed = async (tokenId: number | string): Promise<void> => {
  try {
    await supabase.from('qr_tokens').update({ is_used: true }).eq('id', tokenId);
  } catch { /* silent */ }
};
