import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; // auth only
import {
  createShift, getShiftsByCenterId, getEmployeeShiftsInRange, getEmployeeShiftsSample,
  insertEmployeeShiftSingle, deleteEmployeeShiftById, deleteEmployeeShiftsByIds,
  checkExistingShiftAssignmentDates, insertEmployeeShiftAssignments
} from '../services/hrService';
import { useData } from '../contexts/DataContext';
import { ui } from '../utils/ui';

/** Extrae el mensaje de error de forma segura desde un catch unknown */
const toMsg = (e: unknown): string => e instanceof Error ? e.message : String(e);

/** Forma mínima que esperamos de un registro de DataContext */
interface DataContextCenter { id: string | number; name?: string; nombre?: string; center_name?: string; center_id?: string | number; }
interface DataContextEmployee { id: string | number; nombre?: string; name?: string; apellidos?: string; center_id?: string | number; activo?: boolean; is_active?: boolean; cargo?: string; role?: string; }

/** Fila de Supabase para employee_shifts con JOIN a shifts */
interface EmployeeShiftRow {
  id: number;
  employee_id: number;
  shift_id: number;
  date: string;
  shifts?: {
    name?: string;
    start_time?: string;
    end_time?: string;
    center_id?: number;
  };
}
import {
  ShiftLocal,
  EmployeeLocal,
  CenterLocal,
  AssignmentWithDetails,
  SelectedDays,
  BulkAssignmentData,
  QuickAssignData,
  toLocalYMD
} from '../components/hr/shift/ShiftTypes';

export const useShiftAssignment = () => {
  const { centers: dataCenters, employees: dataEmployees } = useData();
  const [selectedCenter, setSelectedCenter] = useState<number>(9); // Sevilla por defecto
  const [centers, setCenters] = useState<CenterLocal[]>([]);
  const [shifts, setShifts] = useState<ShiftLocal[]>([]);
  const [employees, setEmployees] = useState<EmployeeLocal[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showQuickAssign, setShowQuickAssign] = useState(false);
  const [quickAssignData, setQuickAssignData] = useState<QuickAssignData>({
    shift_id: null,
    employee_id: null,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [error, setError] = useState<string | null>(null);
  const [showBulkAssignment, setShowBulkAssignment] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ show: boolean; assignment: AssignmentWithDetails | null }>({ show: false, assignment: null });
  const [selectedAssignments, setSelectedAssignments] = useState<Set<number>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkAssignmentData, setBulkAssignmentData] = useState<BulkAssignmentData>({
    shift_id: null,
    employee_id: null,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    exclude_weekends: true,
    exclude_dates: []
  });
  const [selectedDays, setSelectedDays] = useState<SelectedDays>({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false
  });

  // CARGAR DATOS
  const loadCenters = useCallback(async () => {
    try {
      const mappedCenters = (dataCenters as DataContextCenter[]).map((center) => ({
        id: parseInt(center.id) || center.center_id || 9,
        name: center.name || center.nombre || center.center_name || 'Centro'
      }));

      if (mappedCenters.length === 0) {
        const defaultCenters = [
          { id: 9, name: 'Sevilla' },
          { id: 10, name: 'Jerez' },
          { id: 11, name: 'Puerto' }
        ];
        setCenters(defaultCenters);
      } else {
        setCenters(mappedCenters);
      }

      console.log('✅ Centros cargados para turnos:', mappedCenters.length || 3);
    } catch (error: unknown) {
      setError(`Error al cargar centros: ${toMsg(error)}`);
    }
  }, [dataCenters]);

  const loadEmployees = useCallback(async () => {
    try {
      console.log('🔄 Cargando empleados desde contexto...');
      console.log('Empleados disponibles:', dataEmployees?.length || 0);
      console.log('Centro seleccionado:', selectedCenter);

      if (!dataEmployees || dataEmployees.length === 0) {
        console.log('⚠️ No hay empleados en el contexto');
        setEmployees([]);
        return;
      }

      const employeesArr = (dataEmployees as DataContextEmployee[]);
      const activeEmployees = employeesArr.filter((emp) => {
        const centerIdNum = Number(emp.center_id);
        const isActive = emp?.activo === true || emp?.is_active === true;
        const matchesCenter = centerIdNum === selectedCenter;
        console.log(`Empleado ${emp?.name || emp?.nombre}: activo=${isActive}, centro=${emp?.center_id}, coincide=${matchesCenter}`);
        return matchesCenter && isActive;
      });

      console.log('Empleados filtrados:', activeEmployees.length);

      const mappedEmployees: EmployeeLocal[] = activeEmployees.map((emp) => ({
        id: Number(emp.id),
        nombre: emp?.nombre || emp?.name || 'Sin nombre',
        apellidos: emp?.apellidos || '',
        center_id: Number(emp?.center_id) || selectedCenter,
        activo: Boolean(emp?.activo || emp?.is_active),
        cargo: emp?.cargo || emp?.role || ''
      }));

      setEmployees(mappedEmployees);
      console.log('✅ Empleados cargados para turnos:', mappedEmployees.length);
    } catch (error: unknown) {
      console.error('❌ Error cargando empleados:', error);
      setError(`Error al cargar empleados: ${toMsg(error)}`);
      setEmployees([]);
    }
  }, [dataEmployees, selectedCenter]);

  const loadShifts = useCallback(async () => {
    try {
      console.log('🔄 Cargando turnos para centro:', selectedCenter);

      const data = await getShiftsByCenterId(selectedCenter);

      console.log('📋 Turnos encontrados en BD:', data.length);

      setShifts(data as any[]);

      if (!data || data.length === 0) {
        console.log('⚠️ No hay turnos para el centro', selectedCenter);
      }

    } catch (error: unknown) {
      console.error('❌ Error cargando turnos:', error);
      setError(`Error al cargar turnos: ${toMsg(error)}`);
      setShifts([]);
    }
  }, [selectedCenter]);

  const loadAssignments = useCallback(async () => {
    console.log(`[LOAD_ASSIGNMENTS_DEBUG] === INICIO loadAssignments ===`);
    console.log(`[LOAD_ASSIGNMENTS_DEBUG] Estado inicial:`, {
      selectedCenter,
      currentMonth: currentMonth.toISOString().split('T')[0],
      employeesCount: employees.length,
      shiftsCount: shifts.length,
      assignmentsCount: assignments.length
    });

    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const monthStart = toLocalYMD(new Date(year, month, 1));
      const monthEnd = toLocalYMD(new Date(year, month + 1, 0));

      console.log(`[LOAD_ASSIGNMENTS_DEBUG] Parámetros consulta:`, {
        monthStart,
        monthEnd,
        selectedCenter,
        dateRange: `${monthStart} to ${monthEnd}`
      });

      const data = await getEmployeeShiftsInRange(selectedCenter, monthStart, monthEnd);
      const error = null; // service handles errors internally

      console.log(`[LOAD_ASSIGNMENTS_DEBUG] Respuesta Supabase:`, {
        error: error?.message,
        dataLength: data?.length || 0,
        sampleData: data?.slice(0, 2)
      });

      if (!data || data.length === 0) {
        console.log(`[LOAD_ASSIGNMENTS_DEBUG] ⚠️ NO SE ENCONTRARON ASIGNACIONES en la consulta`);
        console.log(`[LOAD_ASSIGNMENTS_DEBUG] Verificando si hay datos en la tabla employee_shifts...`);

        const allData = await getEmployeeShiftsSample();

        console.log(`[LOAD_ASSIGNMENTS_DEBUG] Consulta general employee_shifts:`, {
          error: null,
          totalRecords: allData.length,
          sample: allData.slice(0, 2)
        });

        if (!allData || allData.length === 0) {
          console.log(`[LOAD_ASSIGNMENTS_DEBUG] 💡 TABLA VACÍA: No hay asignaciones en employee_shifts`);
          console.log(`[LOAD_ASSIGNMENTS_DEBUG] 💡 SUGERENCIA: Usar "Asignación Rápida" para crear algunas asignaciones de prueba`);
        }
      }

      if (error) throw error;

      const uniqueData = (data || []).filter((item, index, arr) =>
        arr.findIndex(other =>
          other.employee_id === item.employee_id &&
          other.shift_id === item.shift_id &&
          other.date === item.date
        ) === index
      );

      console.log('🧭 Asignaciones crudas recibidas:', data?.length || 0, `rango ${monthStart}..${monthEnd} centro ${selectedCenter}`);
      console.log('🧹 Asignaciones únicas tras filtrado:', uniqueData.length);

      const mappedAssignments: AssignmentWithDetails[] = (uniqueData as EmployeeShiftRow[]).map((item) => {
        const employee = employees.find(emp => emp.id === item.employee_id);
        const employeeName = employee ? `${employee.nombre} ${employee.apellidos}`.trim() : `Empleado ${item.employee_id}`;

        const shiftJoined = item.shifts ?? {};
        return {
          id: item.id,
          employee_id: item.employee_id,
          shift_id: item.shift_id,
          date: item.date,
          employee_name: employeeName,
          shift_name: shiftJoined.name || 'Turno',
          shift_start_time: shiftJoined.start_time || '',
          shift_end_time: shiftJoined.end_time || '',
          shift_center_id: shiftJoined.center_id
        };
      });

      setAssignments(mappedAssignments);
      console.log('✅ Asignaciones cargadas (sin duplicados):', mappedAssignments.length);
      const forSelectedCenter = mappedAssignments.filter(a => a.shift_center_id === selectedCenter).length;
      console.log(`🏷️ Para centro ${selectedCenter}:`, forSelectedCenter);
      const sample = mappedAssignments.slice(0, 5).map(a => ({ id: a.id, emp: a.employee_id, shift: a.shift_id, date: a.date, center: a.shift_center_id }));
      if (sample.length) console.log('📄 Muestra asignaciones:', sample);

      const duplicatesCount = (data || []).length - uniqueData.length;
      if (duplicatesCount > 0) {
        console.log(`⚠️ Se eliminaron ${duplicatesCount} duplicados`);
      }

      console.log(`[LOAD_ASSIGNMENTS_DEBUG] === FIN loadAssignments ===`);
      console.log(`[LOAD_ASSIGNMENTS_DEBUG] Estado final assignments:`, {
        length: mappedAssignments.length,
        dates: [...new Set(mappedAssignments.map(a => a.date))].sort(),
        employees: [...new Set(mappedAssignments.map(a => a.employee_name))],
        shifts: [...new Set(mappedAssignments.map(a => a.shift_name))]
      });

    } catch (error: unknown) {
      console.error(`[LOAD_ASSIGNMENTS_DEBUG] ❌ Error en loadAssignments:`, error);
      setError(`Error al cargar asignaciones: ${toMsg(error)}`);
    }
  }, [employees, selectedCenter, currentMonth]);

  useEffect(() => {
    loadCenters();
    loadEmployees();
  }, [loadCenters, loadEmployees]);

  useEffect(() => {
    if (selectedCenter) {
      console.log('🔍 DEPURACIÓN TURNOS - useEffect disparado');
      console.log('Centro seleccionado:', selectedCenter);
      console.log('Turnos en estado antes de cargar:', shifts);
      loadShifts();
    }
  }, [selectedCenter, loadShifts]);

  useEffect(() => {
    if (employees.length > 0) {
      loadAssignments();
    }
  }, [employees, loadAssignments]);

  // Recargar asignaciones cuando cambie el mes del calendario
  useEffect(() => {
    if (employees.length > 0 && shifts.length > 0) {
      console.log(`[CALENDAR_MONTH_DEBUG] Mes cambiado a: ${currentMonth.toISOString().split('T')[0]}`);
      loadAssignments();
    }
  }, [currentMonth, employees, shifts, loadAssignments]);

  const handleQuickAssign = async () => {
    if (!quickAssignData.shift_id || selectedEmployeeIds.length === 0) {
      ui.info('Por favor selecciona un turno y al menos un empleado');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const startDate = new Date(quickAssignData.start_date);
      const endDate = new Date(quickAssignData.end_date);
      const dates: string[] = [];

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dates.push(toLocalYMD(new Date(d)));
      }

      console.log('🚀 Creando asignaciones:', {
        user: user.email,
        selectedShift: quickAssignData.shift_id,
        selectedEmployees: selectedEmployeeIds,
        dateRange: `${quickAssignData.start_date} - ${quickAssignData.end_date}`,
        totalDays: dates.length,
        quickAssignData
      });

      const results = [];
      for (const empId of selectedEmployeeIds) {
        for (const date of dates) {
          try {
            const payload = {
              employee_id: Number(empId),
              shift_id: Number(quickAssignData.shift_id),
              date: date
            };

            console.log('📦 Insertando:', payload);

            const { data, error } = await insertEmployeeShiftSingle(payload);

            if (error) {
              console.error('❌ Error en inserción:', error);
              throw new Error(error);
            }

            console.log('✅ Inserción exitosa:', data);
            results.push(data);
          } catch (empError: unknown) {
            console.error(`❌ Error asignando empleado ${empId} en fecha ${date}:`, empError);
          }
        }
      }

      ui.success(`✅ ${results.length} asignación(es) creada(s) correctamente para ${dates.length} días`);
      setSelectedEmployeeIds([]);
      setQuickAssignData({
        shift_id: null,
        employee_id: null,
        start_date: toLocalYMD(new Date()),
        end_date: toLocalYMD(new Date())
      });
      await loadAssignments();
    } catch (error: unknown) {
      const dbError = error as { code?: string; details?: string; hint?: string };
      const extra = [
        dbError?.code ? `\nCódigo: ${dbError.code}` : '',
        dbError?.details ? `\nDetalles: ${dbError.details}` : '',
        dbError?.hint ? `\nPista: ${dbError.hint}` : '',
        `\nTurno: ${quickAssignData.shift_id}`,
        `\nEmpleados: ${selectedEmployeeIds.join(', ')}`
      ].join('');

      console.error('❌ Error completo:', error);
      const errorMsg = `Error al asignar turnos: ${toMsg(error)}${extra}`;
      setError(errorMsg);
      ui.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShift = async (shiftData: Partial<ShiftLocal>) => {
    setLoading(true);
    try {
      const result = await createShift({ ...shiftData as Record<string, unknown>, center_id: selectedCenter });
      if (!result.success) throw new Error(result.error);

      ui.success('✅ Turno creado correctamente');
      loadShifts();
    } catch (error: unknown) {
      ui.error(`❌ Error al crear turno: ${toMsg(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    console.log('🗑️ LIMPIEZA FORZADA DE ESTADO');
    setShifts([]);
    setAssignments([]);
    // SEC-04: Only remove shift-related keys, never clear all (destroys Supabase auth session)
    const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith('shift_') || k.startsWith('hr_'));
    keysToRemove.forEach(k => localStorage.removeItem(k));
    const sessionKeysToRemove = Object.keys(sessionStorage).filter(k => k.startsWith('shift_') || k.startsWith('hr_'));
    sessionKeysToRemove.forEach(k => sessionStorage.removeItem(k));
    window.location.reload();
  };

  const handleRemoveAssignment = (assignment: AssignmentWithDetails) => {
    console.log('🖱️ Click en Eliminar', { assignment });
    setShowDeleteConfirm({ show: true, assignment });
  };

  const confirmDelete = async () => {
    const assignment = showDeleteConfirm.assignment;
    if (!assignment) return;

    setShowDeleteConfirm({ show: false, assignment: null });
    setLoading(true);

    try {
      console.log('✅ Confirmación de eliminación aceptada para:', assignment.id);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      console.log('🗑️ Eliminando asignación:', {
        user: user.email,
        assignmentId: assignment.id,
        employee: assignment.employee_name,
        shift: assignment.shift_name
      });

      const { data, error } = await deleteEmployeeShiftById(assignment.id);

      if (error) throw new Error(error);

      console.log('✅ Eliminación exitosa:', data);
      await loadAssignments();

    } catch (error: unknown) {
      console.error('❌ Error eliminando asignación:', error);
      setError(`Error eliminando asignación: ${toMsg(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedAssignments.size === 0) return;

    setShowBulkDeleteConfirm(false);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      console.log('🗑️ Eliminación múltiple:', {
        user: user.email,
        assignmentIds: Array.from(selectedAssignments),
        count: selectedAssignments.size
      });

      const { data, error } = await deleteEmployeeShiftsByIds(Array.from(selectedAssignments));

      if (error) throw new Error(error);

      console.log('✅ Eliminación múltiple exitosa:', data);
      setSelectedAssignments(new Set());
      await loadAssignments();

    } catch (error: unknown) {
      console.error('❌ Error en eliminación múltiple:', error);
      setError(`Error eliminando asignaciones: ${toMsg(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const createBulkAssignments = async () => {
    try {
      setLoading(true);

      if (!bulkAssignmentData.shift_id || !bulkAssignmentData.employee_id || !bulkAssignmentData.start_date || !bulkAssignmentData.end_date) {
        ui.error('❌ Por favor completa todos los campos obligatorios');
        return;
      }

      // BUG FIX 2.8: Parsear fechas correctamente para evitar desfase de zona horaria
      const [startYear, startMonth, startDay] = bulkAssignmentData.start_date.split('-').map(Number);
      const [endYear, endMonth, endDay] = bulkAssignmentData.end_date.split('-').map(Number);
      const startDate = new Date(startYear, startMonth - 1, startDay);
      const endDate = new Date(endYear, endMonth - 1, endDay);

      if (startDate > endDate) {
        ui.error('❌ La fecha de inicio debe ser anterior a la fecha de fin');
        return;
      }

      const shift = shifts.find(s => s.id === bulkAssignmentData.shift_id);
      if (!shift) {
        ui.error('❌ Turno no encontrado');
        return;
      }

      const assignmentsToCreate = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[dayOfWeek] as keyof SelectedDays;

        // BUG FIX 2.7: Determinar si aplicar por días seleccionados manualmente o por configuración del turno
        const hasSelectedDays = Object.values(selectedDays).some(v => v);

        const shouldAssign = hasSelectedDays
          ? selectedDays[dayName] === true
          : (shift[dayName] === true);

        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const skipWeekend = bulkAssignmentData.exclude_weekends && isWeekend;

        const dateStr = toLocalYMD(currentDate);
        const isExcluded = bulkAssignmentData.exclude_dates.includes(dateStr);

        if (shouldAssign && !skipWeekend && !isExcluded) {
          assignmentsToCreate.push({
            employee_id: bulkAssignmentData.employee_id,
            shift_id: bulkAssignmentData.shift_id,
            date: dateStr
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      console.log(`📋 Preparando creación para ${assignmentsToCreate.length} asignaciones...`);

      let existingDatesSet = new Set<string>();
      const allDates = assignmentsToCreate.map(a => a.date);
      const checkBatchSize = 200;
      for (let i = 0; i < allDates.length; i += checkBatchSize) {
        const dateBatch = allDates.slice(i, i + checkBatchSize);
        const existingDates = await checkExistingShiftAssignmentDates(
          bulkAssignmentData.employee_id as number,
          bulkAssignmentData.shift_id as number,
          dateBatch
        );
        existingDates.forEach(date => existingDatesSet.add(date));
      }

      const toInsert = assignmentsToCreate.filter(a => !existingDatesSet.has(a.date));
      console.log(`🧹 Filtrado: ${assignmentsToCreate.length - toInsert.length} duplicados; ${toInsert.length} por insertar`);

      const batchSize = 50;
      for (let i = 0; i < toInsert.length; i += batchSize) {
        const batch = toInsert.slice(i, i + batchSize);
        if (batch.length === 0) continue;
        const result = await insertEmployeeShiftAssignments(batch);
        if (!result.success) throw new Error(result.error);
      }

      loadAssignments();
      setShowBulkAssignment(false);
      setBulkAssignmentData({
        shift_id: null,
        employee_id: null,
        start_date: toLocalYMD(new Date()),
        end_date: toLocalYMD(new Date()),
        exclude_weekends: true,
        exclude_dates: []
      });
      setSelectedDays({
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
      });

      ui.success(`✅ ${toInsert.length} asignaciones creadas correctamente${existingDatesSet.size ? ` (omitidas ${existingDatesSet.size} existentes)` : ''}`);

    } catch (error: unknown) {
      console.error('❌ Error creando asignaciones en lote:', error);
      setError(`Error creando asignaciones: ${toMsg(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const resetBulkAssignment = () => {
    setShowBulkAssignment(false);
    setBulkAssignmentData({
      shift_id: null,
      employee_id: null,
      start_date: toLocalYMD(new Date()),
      end_date: toLocalYMD(new Date()),
      exclude_weekends: true,
      exclude_dates: []
    });
    setSelectedDays({
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false
    });
  };

  return {
    // State
    selectedCenter,
    setSelectedCenter,
    centers,
    shifts,
    setShifts,
    employees,
    assignments,
    setAssignments,
    currentMonth,
    setCurrentMonth,
    loading,
    showShiftModal,
    setShowShiftModal,
    showQuickAssign,
    setShowQuickAssign,
    quickAssignData,
    setQuickAssignData,
    error,
    setError,
    showBulkAssignment,
    setShowBulkAssignment,
    selectedEmployeeIds,
    setSelectedEmployeeIds,
    showDeleteConfirm,
    setShowDeleteConfirm,
    selectedAssignments,
    setSelectedAssignments,
    showBulkDeleteConfirm,
    setShowBulkDeleteConfirm,
    bulkAssignmentData,
    setBulkAssignmentData,
    selectedDays,
    setSelectedDays,
    // Handlers
    loadShifts,
    loadAssignments,
    handleQuickAssign,
    handleCreateShift,
    handleClearCache,
    handleRemoveAssignment,
    confirmDelete,
    confirmBulkDelete,
    createBulkAssignments,
    resetBulkAssignment
  };
};
