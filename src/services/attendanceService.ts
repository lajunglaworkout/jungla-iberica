// src/services/attendanceService.ts - Servicio para detección automática de incidencias
import { supabase } from '../lib/supabase';

interface ShiftSchedule {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
}

interface TimeclockRecord {
  id: number;
  employee_id: number;
  center_id: number;
  clock_in: string | null;
  clock_out: string | null;
  date: string;
}

interface AttendanceIncident {
  employee_id: number;
  date: string;
  type: 'late' | 'absence' | 'early_departure';
  hours_late?: number;
  reason: string;
  notes?: string;
  created_by: string;
}

/**
 * Detecta incidencias de asistencia basándose en los fichajes del día
 * @param date Fecha a analizar (formato YYYY-MM-DD)
 * @param centerId Centro a analizar (opcional)
 */
export const detectDailyAttendanceIncidents = async (
  date: string,
  centerId?: number
): Promise<AttendanceIncident[]> => {
  const incidents: AttendanceIncident[] = [];

  try {
    // 1. Obtener todos los turnos asignados para esa fecha
    let shiftsQuery = supabase
      .from('employee_shifts')
      .select(`
        employee_id,
        shift_id,
        date,
        shifts (
          id,
          name,
          start_time,
          end_time
        )
      `)
      .eq('date', date);

    if (centerId) {
      // Filtrar por empleados del centro
      const { data: centerEmployees } = await supabase
        .from('employees')
        .select('id')
        .eq('center_id', centerId)
        .eq('is_active', true);
      
      const employeeIds = centerEmployees?.map(e => e.id) || [];
      shiftsQuery = shiftsQuery.in('employee_id', employeeIds);
    }

    const { data: assignedShifts } = await shiftsQuery;

    if (!assignedShifts || assignedShifts.length === 0) {
      return incidents;
    }

    // 2. Obtener fichajes del día
    const employeeIds = assignedShifts.map(s => s.employee_id);
    const { data: timeclockRecords } = await supabase
      .from('timeclock_records')
      .select('*')
      .eq('date', date)
      .in('employee_id', employeeIds);

    // 3. Analizar cada turno asignado
    for (const shift of assignedShifts) {
      const employeeId = shift.employee_id;
      const shiftData = shift.shifts as unknown as ShiftSchedule;
      
      if (!shiftData) continue;

      // Buscar fichaje del empleado
      const timeclock = timeclockRecords?.find(t => t.employee_id === employeeId);

      // CASO 1: No hay fichaje = AUSENCIA
      if (!timeclock || !timeclock.clock_in) {
        // Verificar si ya existe un registro de ausencia para evitar duplicados
        const { data: existingIncident } = await supabase
          .from('attendance_records')
          .select('id')
          .eq('employee_id', employeeId)
          .eq('date', date)
          .eq('type', 'absence')
          .single();

        if (!existingIncident) {
          incidents.push({
            employee_id: employeeId,
            date: date,
            type: 'absence',
            reason: 'No se registró fichaje de entrada',
            notes: `Turno asignado: ${shiftData.name} (${shiftData.start_time})`,
            created_by: 'Sistema Automático'
          });
        }
        continue;
      }

      // CASO 2: Fichó tarde = RETRASO
      const clockInTime = timeclock.clock_in.split('T')[1].substring(0, 5); // HH:MM
      const shiftStartTime = shiftData.start_time;

      if (clockInTime > shiftStartTime) {
        // Calcular minutos de retraso
        const [clockHour, clockMin] = clockInTime.split(':').map(Number);
        const [shiftHour, shiftMin] = shiftStartTime.split(':').map(Number);
        
        const clockMinutes = clockHour * 60 + clockMin;
        const shiftMinutes = shiftHour * 60 + shiftMin;
        const lateMinutes = clockMinutes - shiftMinutes;
        const lateHours = Math.round((lateMinutes / 60) * 100) / 100; // Redondear a 2 decimales

        // Solo registrar si el retraso es mayor a 5 minutos (tolerancia)
        if (lateMinutes > 5) {
          // Verificar si ya existe
          const { data: existingIncident } = await supabase
            .from('attendance_records')
            .select('id')
            .eq('employee_id', employeeId)
            .eq('date', date)
            .eq('type', 'late')
            .single();

          if (!existingIncident) {
            incidents.push({
              employee_id: employeeId,
              date: date,
              type: 'late',
              hours_late: lateHours,
              reason: `Fichó a las ${clockInTime}, turno iniciaba a las ${shiftStartTime}`,
              notes: `Retraso: ${lateMinutes} minutos`,
              created_by: 'Sistema Automático'
            });
          }
        }
      }

      // CASO 3: Salió antes de tiempo = SALIDA TEMPRANA
      if (timeclock.clock_out) {
        const clockOutTime = timeclock.clock_out.split('T')[1].substring(0, 5);
        const shiftEndTime = shiftData.end_time;

        if (clockOutTime < shiftEndTime) {
          const [clockHour, clockMin] = clockOutTime.split(':').map(Number);
          const [shiftHour, shiftMin] = shiftEndTime.split(':').map(Number);
          
          const clockMinutes = clockHour * 60 + clockMin;
          const shiftMinutes = shiftHour * 60 + shiftMin;
          const earlyMinutes = shiftMinutes - clockMinutes;

          // Solo registrar si salió más de 5 minutos antes
          if (earlyMinutes > 5) {
            const { data: existingIncident } = await supabase
              .from('attendance_records')
              .select('id')
              .eq('employee_id', employeeId)
              .eq('date', date)
              .eq('type', 'early_departure')
              .single();

            if (!existingIncident) {
              incidents.push({
                employee_id: employeeId,
                date: date,
                type: 'early_departure' as any,
                reason: `Salió a las ${clockOutTime}, turno terminaba a las ${shiftEndTime}`,
                notes: `Salida anticipada: ${earlyMinutes} minutos`,
                created_by: 'Sistema Automático'
              });
            }
          }
        }
      }
    }

    // 4. Insertar incidencias detectadas en la base de datos
    if (incidents.length > 0) {
      const { error } = await supabase
        .from('attendance_records')
        .insert(incidents);

      if (error) {
        console.error('Error insertando incidencias:', error);
      } else {
        console.log(`✅ ${incidents.length} incidencias detectadas y registradas para ${date}`);
      }
    }

    return incidents;
  } catch (error) {
    console.error('Error detectando incidencias:', error);
    return [];
  }
};

/**
 * Procesa incidencias para un rango de fechas
 */
export const processAttendanceForDateRange = async (
  startDate: string,
  endDate: string,
  centerId?: number
): Promise<number> => {
  let totalIncidents = 0;
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const incidents = await detectDailyAttendanceIncidents(dateStr, centerId);
    totalIncidents += incidents.length;
  }

  return totalIncidents;
};

/**
 * Procesa incidencias del día actual y registra en el log
 */
export const processTodayAttendance = async (centerId?: number): Promise<number> => {
  const today = new Date().toISOString().split('T')[0];
  const incidents = await detectDailyAttendanceIncidents(today, centerId);
  
  // Registrar en el log de procesamiento
  await logAttendanceProcessing(today, incidents, centerId);
  
  return incidents.length;
};

/**
 * Registra el procesamiento en el log
 */
const logAttendanceProcessing = async (
  date: string,
  incidents: AttendanceIncident[],
  centerId?: number
): Promise<void> => {
  try {
    const lateCount = incidents.filter(i => i.type === 'late').length;
    const absenceCount = incidents.filter(i => i.type === 'absence').length;
    const earlyDepartureCount = incidents.filter(i => i.type === 'early_departure').length;

    // Verificar si ya existe un registro para esta fecha
    const { data: existing } = await supabase
      .from('attendance_processing_log')
      .select('id')
      .eq('process_date', date)
      .maybeSingle();

    if (existing) {
      // Actualizar registro existente
      await supabase
        .from('attendance_processing_log')
        .update({
          incidents_detected: incidents.length,
          late_count: lateCount,
          absence_count: absenceCount,
          early_departure_count: earlyDepartureCount,
          processed_at: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', existing.id);
    } else {
      // Crear nuevo registro
      await supabase
        .from('attendance_processing_log')
        .insert({
          process_date: date,
          center_id: centerId || null,
          incidents_detected: incidents.length,
          late_count: lateCount,
          absence_count: absenceCount,
          early_departure_count: earlyDepartureCount,
          status: 'completed'
        });
    }
  } catch (error) {
    console.error('Error registrando procesamiento:', error);
  }
};

/**
 * Obtiene el historial de procesamientos
 */
export const getProcessingLog = async (
  startDate?: string,
  endDate?: string,
  centerId?: number
): Promise<any[]> => {
  try {
    let query = supabase
      .from('attendance_processing_log')
      .select('*')
      .order('process_date', { ascending: false });

    if (startDate) {
      query = query.gte('process_date', startDate);
    }
    if (endDate) {
      query = query.lte('process_date', endDate);
    }
    if (centerId) {
      query = query.eq('center_id', centerId);
    }

    const { data } = await query;
    return data || [];
  } catch (error) {
    console.error('Error obteniendo log de procesamiento:', error);
    return [];
  }
};

/**
 * Verifica si ya se procesó hoy
 */
export const wasProcessedToday = async (): Promise<boolean> => {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const { data } = await supabase
      .from('attendance_processing_log')
      .select('id')
      .eq('process_date', today)
      .eq('status', 'completed')
      .maybeSingle();

    return !!data;
  } catch (error) {
    return false;
  }
};

/**
 * Auto-procesamiento: Ejecuta automáticamente si no se ha procesado hoy
 * Se puede llamar al cargar el módulo de asistencia
 */
export const autoProcessIfNeeded = async (): Promise<{ processed: boolean; count: number }> => {
  const alreadyProcessed = await wasProcessedToday();
  
  if (alreadyProcessed) {
    console.log('✅ Ya se procesó la asistencia hoy');
    return { processed: false, count: 0 };
  }

  console.log('🤖 Ejecutando auto-procesamiento de asistencia...');
  const count = await processTodayAttendance();
  console.log(`✅ Auto-procesamiento completado: ${count} incidencias detectadas`);
  
  return { processed: true, count };
};
