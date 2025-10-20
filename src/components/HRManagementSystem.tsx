// src/components/HRManagementSystem.tsx - Sistema de RRHH con Dashboard Integrado
import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, AlertCircle, Plus, Edit, Search, UserCheck, ArrowLeft, Home
} from 'lucide-react';
import EmployeeForm from './EmployeeForm';
import EmployeeDetail from './EmployeeDetail';
import HRDashboard from './hr/HRDashboard';
import ShiftManagementSystemAdvanced from './hr/ShiftManagementSystemAdvanced';
import ShiftAssignmentSystem from './hr/ShiftAssignmentSystem';
import TimeclockDashboard from './hr/TimeclockDashboard';
import MobileTimeClock from './hr/MobileTimeClock';
import DatabaseVerification from './DatabaseVerification';
import EmployeeProfile from './hr/EmployeeProfile';
import ComingSoon from './hr/ComingSoon';
import VacationRequest from './hr/VacationRequest';
import VacationApproval from './hr/VacationApproval';
import { InventoryManagement } from './logistics/InventoryManagement';
import IncidentManagementSystem from './incidents/IncidentManagementSystem';
import DailyOperations from './hr/DailyOperations';
import { Employee } from '../types/employee';
import { LocationType } from '../types/logistics';
import { supabase } from '../lib/supabase';
import { useSession } from '../contexts/SessionContext';
import { useData } from '../contexts/DataContext';

// ============ SUB-COMPONENTES =============

const HRHeader: React.FC<{ employeeCount: number; activeCount: number }> = ({ employeeCount, activeCount }) => (
  <div style={{ marginBottom: '24px' }}>
    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>Gestión de Empleados</h1>
    <p style={{ fontSize: '16px', color: '#6b7280' }}>Administra la información y el estado de tu equipo.</p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users size={24} color="#059669" />
          <div>
            <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{employeeCount}</div>
            <div style={{ color: '#6b7280' }}>Empleados Totales</div>
          </div>
        </div>
      </div>
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <UserCheck size={24} color="#10b981" />
          <div>
            <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{activeCount}</div>
            <div style={{ color: '#6b7280' }}>Empleados Activos</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Filters: React.FC<{
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterCenter: string;
  setFilterCenter: (center: string) => void;
  centerOptions: { id: string; name: string }[];
  onNewEmployee: () => void;
  userRole?: string;
}> = ({ searchTerm, setSearchTerm, filterCenter, setFilterCenter, centerOptions, onNewEmployee, userRole }) => (
  <div style={{ 
    backgroundColor: 'white', 
    padding: '20px', 
    borderRadius: '12px', 
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}>
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ flex: '1', minWidth: '200px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            placeholder="Buscar empleados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>
      
      <select
        value={filterCenter}
        onChange={(e) => setFilterCenter(e.target.value)}
        style={{
          padding: '12px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '14px',
          minWidth: '150px'
        }}
      >
        {centerOptions.map(center => (
          <option key={center.id} value={center.id}>{center.name}</option>
        ))}
      </select>

      <button
        onClick={onNewEmployee}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          backgroundColor: '#059669',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        <Plus size={16} />
        Nuevo Empleado
      </button>
    </div>
  </div>
);

const EmployeeCard: React.FC<{
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onView: (employee: Employee) => void;
}> = ({ employee, onEdit, onView }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.2s ease'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: '#059669',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        {employee.nombre.charAt(0)}{employee.apellidos.charAt(0)}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, color: '#111827' }}>
          {employee.nombre} {employee.apellidos}
        </h3>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          {employee.cargo} • {employee.centro_nombre}
        </p>
      </div>
      <div style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: employee.activo ? '#10b98120' : '#ef444420',
        color: employee.activo ? '#10b981' : '#ef4444'
      }}>
        {employee.activo ? '✅ Activo' : '❌ Inactivo'}
      </div>
    </div>

    <div style={{ marginBottom: '16px' }}>
      <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>
        📧 {employee.email}
      </p>
      <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>
        📞 {employee.telefono}
      </p>
      <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0' }}>
        🏢 {employee.departamento}
      </p>
    </div>

    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={() => onEdit(employee)}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '8px 12px',
          backgroundColor: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#374151'
        }}
      >
        <Edit size={14} />
        Editar
      </button>
      <button
        onClick={() => onView(employee)}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: '8px 12px',
          backgroundColor: '#059669',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          color: 'white'
        }}
      >
        👁️ Ver detalles
      </button>
    </div>
  </div>
);

const EmployeeList: React.FC<{
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onView: (employee: Employee) => void;
}> = ({ employees, onEdit, onView }) => {
  if (employees.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '48px',
        textAlign: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Users size={48} style={{ color: '#6b7280', margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '18px', color: '#111827', marginBottom: '8px' }}>
          No se encontraron empleados
        </h3>
        <p style={{ color: '#6b7280' }}>
          Ajusta los filtros de búsqueda o agrega un nuevo empleado.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px'
    }}>
      {employees.map((employee) => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          onEdit={onEdit}
          onView={onView}
        />
      ))}
    </div>
  );
};

// ============ COMPONENTE PRINCIPAL ============
const HRManagementSystem: React.FC = () => {
  const { employee, userRole } = useSession();
  const { centers: dataCenters } = useData();
  
  // Estados principales
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCenter, setFilterCenter] = useState('all');
  
  // Estados para navegación del dashboard
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [currentModule, setCurrentModule] = useState<string>('dashboard');

  useEffect(() => {
    const handleModuleView = (event: Event) => {
      const customEvent = event as CustomEvent<{ view?: string }>;
      const { view } = customEvent.detail || {};

      if (!view) {
        return;
      }

      if (view === 'vacation-approvals' || view === 'vacations') {
        setCurrentModule('vacations');
        setCurrentView('vacations');
      } else if (view === 'daily-operations') {
        setCurrentModule('daily-operations');
        setCurrentView('daily-operations');
      } else if (view === 'uniform-request') {
        setCurrentModule('uniform-request');
        setCurrentView('uniform-request');
      } else if (view === 'my-documents') {
        setCurrentModule('my-documents');
        setCurrentView('my-documents');
      } else if (view === 'hr-contact') {
        setCurrentModule('hr-contact');
        setCurrentView('hr-contact');
      } else {
        setCurrentModule(view);
        setCurrentView(view);
      }
    };

    window.addEventListener('hr-module-view', handleModuleView as EventListener);

    return () => {
      window.removeEventListener('hr-module-view', handleModuleView as EventListener);
    };
  }, []);

  // Determinar si es un empleado regular (no encargado/admin/director)
  const isRegularEmployee = userRole === 'employee' || 
    (!userRole?.includes('admin') && 
     !userRole?.includes('manager') && 
     !userRole?.includes('director') &&
     userRole !== 'center_manager');

  // Opciones de centros para filtros
  const centerOptions = [
    { id: 'all', name: 'Todos los Centros' },
    { id: '9', name: 'Sevilla' },
    { id: '10', name: 'Jerez' },
    { id: '11', name: 'El Puerto' },
    { id: '0', name: 'Oficina Central' },
  ];

  const loadEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔍 Cargando TODOS los empleados...');
      
      // Cargar empleados de forma simple
      const { data: activeEmployeesData, error: activeError } = await supabase
        .from('employees')
        .select('*');
      
      if (activeError) {
        console.error('❌ Error cargando empleados:', activeError);
        setError(`Error al cargar empleados: ${activeError.message}`);
        return;
      }
      
      console.log('📊 Empleados cargados de BD:', activeEmployeesData?.length);
      
      if (!activeEmployeesData || activeEmployeesData.length === 0) {
        console.log('⚠️ No se encontraron empleados en la base de datos');
        setEmployees([]);
        return;
      }
      
      // Cargar centros por separado
      const { data: centersData } = await supabase
        .from('centers')
        .select('*');
      
      // Mapear empleados de forma más simple y robusta
      const empleadosMapeados = activeEmployeesData.map((emp: any) => {
        const centro = centersData?.find(c => c.id === emp.center_id);
        
        // Crear objeto Employee con valores por defecto seguros
        const empleadoMapeado: Employee = {
          id: emp.id || '',
          nombre: emp.nombre || emp.name || 'Sin nombre',
          apellidos: emp.apellidos || emp.last_name || '',
          email: emp.email || '',
          telefono: emp.telefono || emp.phone || '',
          dni: emp.dni || '',
          fecha_nacimiento: emp.fecha_nacimiento ? new Date(emp.fecha_nacimiento) : new Date(),
          direccion: emp.direccion || emp.address || '',
          ciudad: emp.ciudad || emp.city || '',
          codigo_postal: emp.codigo_postal || emp.postal_code || '',
          center_id: emp.center_id || '0',
          centro_nombre: centro?.name || 'Oficina Central',
          fecha_alta: emp.fecha_alta ? new Date(emp.fecha_alta) : new Date(),
          fecha_baja: emp.fecha_baja ? new Date(emp.fecha_baja) : undefined,
          tipo_contrato: emp.tipo_contrato || emp.contract_type || 'Indefinido',
          jornada: emp.jornada || emp.workday || 'Completa',
          salario_bruto_anual: emp.salario_bruto_anual || emp.annual_salary || 0,
          salario_neto_mensual: emp.salario_neto_mensual || emp.monthly_salary || 0,
          rol: emp.rol || emp.role || 'employee',
          departamento: emp.departamento || emp.department || 'Operaciones',
          cargo: emp.cargo || emp.position || 'Empleado',
          numero_cuenta: emp.numero_cuenta || emp.account_number || '',
          iban: emp.iban || '',
          banco: emp.banco || emp.bank || '',
          nivel_estudios: emp.nivel_estudios || emp.education_level || 'ESO',
          titulacion: emp.titulacion || emp.degree || '',
          especialidad: emp.especialidad || emp.specialty || '',
          talla_camiseta: emp.talla_camiseta || emp.shirt_size || 'M',
          talla_pantalon: emp.talla_pantalon || emp.pants_size || '42',
          talla_chaqueton: emp.talla_chaqueton || emp.jacket_size || 'M',
          foto_perfil: emp.foto_perfil || emp.profile_image || '',
          activo: emp.activo !== false && emp.is_active !== false,
          observaciones: emp.observaciones || emp.notes || '',
          tiene_contrato_firmado: emp.tiene_contrato_firmado || emp.has_signed_contract || false,
          tiene_alta_ss: emp.tiene_alta_ss || emp.has_social_security || false,
          tiene_formacion_riesgos: emp.tiene_formacion_riesgos || emp.has_risk_training || false,
          created_at: emp.created_at ? new Date(emp.created_at) : new Date(),
          updated_at: emp.updated_at ? new Date(emp.updated_at) : new Date()
        };
        
        return empleadoMapeado;
      });
      
      // Separar por tipo para logs
      const empleadosMarca = empleadosMapeados.filter(e => !e.center_id || e.center_id === '0');
      const empleadosCentros = empleadosMapeados.filter(e => e.center_id && e.center_id !== '0');
      
      console.log('👔 Empleados MARCA (Oficina Central):', empleadosMarca.length);
      console.log('🏢 Empleados CENTROS:', empleadosCentros.length);
      console.log('📊 TOTAL:', empleadosMapeados.length);
      
      // Mostrar algunos nombres para debug
      console.log('Primeros 5 empleados mapeados:');
      empleadosMapeados.slice(0, 5).forEach(e => {
        console.log(`  - ${e.nombre} ${e.apellidos} (${e.centro_nombre}) - ${e.email}`);
      });
      
      setEmployees(empleadosMapeados);
      console.log('✅ Carga completa:', empleadosMapeados.length, 'empleados');
      
    } catch (error: any) {
      console.error('❌ Error general en loadEmployees:', error);
      setError(`Error al cargar los datos: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentView === 'employees') {
      loadEmployees();
    }
  }, [currentView, loadEmployees]);

  const handleSaveEmployee = async (employeeData: Partial<Employee>) => {
    setIsLoading(true);
    setError(null);
    try {
      // SEGURIDAD: Prevenir creación de superadmins desde el formulario
      if (employeeData.rol === 'superadmin' && !selectedEmployee) {
        alert('❌ No se pueden crear nuevos Superadmins. Este rol está reservado para el CEO.');
        setIsLoading(false);
        return;
      }

      // Si está editando y cambia a superadmin, también bloquear
      if (employeeData.rol === 'superadmin' && selectedEmployee?.rol !== 'superadmin') {
        alert('❌ No se puede cambiar el rol a Superadmin. Este rol está reservado para el CEO.');
        setIsLoading(false);
        return;
      }

      // Preparar datos para Supabase con mapeo correcto de campos
      const supabaseData = {
        nombre: employeeData.nombre || (employeeData as any).name,
        apellidos: employeeData.apellidos,
        email: employeeData.email,
        telefono: employeeData.telefono || (employeeData as any).phone,
        dni: employeeData.dni,
        fecha_nacimiento: employeeData.fecha_nacimiento,
        direccion: employeeData.direccion,
        ciudad: employeeData.ciudad,
        codigo_postal: employeeData.codigo_postal,
        center_id: employeeData.center_id ? parseInt(String(employeeData.center_id)) : null,
        fecha_alta: employeeData.fecha_alta,
        fecha_baja: employeeData.fecha_baja,
        tipo_contrato: employeeData.tipo_contrato,
        jornada: employeeData.jornada,
        salario_bruto_anual: employeeData.salario_bruto_anual,
        base_role: employeeData.rol, // Mapear rol a base_role para Supabase
        departamento: employeeData.departamento,
        cargo: employeeData.cargo,
        numero_cuenta: employeeData.numero_cuenta,
        iban: employeeData.iban,
        banco: employeeData.banco,
        nivel_estudios: employeeData.nivel_estudios,
        titulacion: employeeData.titulacion,
        especialidad: employeeData.especialidad,
        talla_camiseta: employeeData.talla_camiseta,
        talla_pantalon: employeeData.talla_pantalon,
        talla_chaqueton: employeeData.talla_chaqueton,
        // Campos de vestuario La Jungla
        vestuario_chandal: (employeeData as any).vestuario_chandal,
        vestuario_sudadera_frio: (employeeData as any).vestuario_sudadera_frio,
        vestuario_chaleco_frio: (employeeData as any).vestuario_chaleco_frio,
        vestuario_pantalon_corto: (employeeData as any).vestuario_pantalon_corto,
        vestuario_polo_verde: (employeeData as any).vestuario_polo_verde,
        vestuario_camiseta_entrenamiento: (employeeData as any).vestuario_camiseta_entrenamiento,
        vestuario_observaciones: (employeeData as any).vestuario_observaciones,
        foto_perfil: employeeData.foto_perfil,
        is_active: employeeData.activo !== false, // Mapear activo a is_active
        observaciones: employeeData.observaciones,
        tiene_contrato_firmado: employeeData.tiene_contrato_firmado,
        tiene_alta_ss: employeeData.tiene_alta_ss,
        tiene_formacion_riesgos: employeeData.tiene_formacion_riesgos,
        updated_at: new Date().toISOString()
      };

      // Filtrar campos undefined para evitar errores
      const cleanData = Object.fromEntries(
        Object.entries(supabaseData).filter(([_, value]) => value !== undefined)
      );

      if (selectedEmployee) {
        console.log(`💾 Actualizando empleado con ID: ${selectedEmployee.id}`);
        console.log('📝 Datos a actualizar:', cleanData);
        
        const { data, error } = await supabase
          .from('employees')
          .update(cleanData)
          .eq('id', selectedEmployee.id)
          .select();
        
        if (error) {
          console.error('❌ Error de Supabase:', error);
          throw error;
        }
        
        console.log('✅ Empleado actualizado correctamente:', data);
        alert('✅ Empleado actualizado correctamente');
      } else {
        console.log('➕ Creando nuevo empleado...');
        console.log('📝 Datos a insertar:', cleanData);
        
        const { data, error } = await supabase
          .from('employees')
          .insert([{...cleanData, created_at: new Date().toISOString()}])
          .select();
        
        if (error) {
          console.error('❌ Error de Supabase:', error);
          throw error;
        }
        
        console.log('✅ Empleado creado correctamente:', data);
        alert('✅ Empleado creado correctamente');
      }
      
      setShowEmployeeForm(false);
      setSelectedEmployee(null);
      await loadEmployees();
    } catch (err: any) {
      const errorMessage = err.message || 'Error desconocido';
      setError(errorMessage);
      console.error("❌ Error guardando empleado:", errorMessage);
      alert(`❌ Error guardando empleado: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleNewEmployee = () => {
    setSelectedEmployee(null);
    setShowEmployeeForm(true);
  };

  const handleViewEmployee = (employee: Employee) => {
    setViewingEmployee(employee);
  };

  const handleNavigate = (module: string) => {
    setCurrentView(module);
    setCurrentModule(module);
    setShowEmployeeForm(false);
    setSelectedEmployee(null);
    setViewingEmployee(null);
    setSearchTerm('');
    setFilterCenter('all');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setCurrentModule('dashboard');
    setShowEmployeeForm(false);
    setSelectedEmployee(null);
    setViewingEmployee(null);
  };

  const filteredEmployees = employees.filter(employee => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (employee.nombre || '').toLowerCase().includes(searchTermLower) ||
      (employee.apellidos || '').toLowerCase().includes(searchTermLower) ||
      employee.email.toLowerCase().includes(searchTermLower) ||
      employee.cargo.toLowerCase().includes(searchTermLower) ||
      employee.departamento.toLowerCase().includes(searchTermLower);

    const matchesCenter = filterCenter === 'all' || String(employee.center_id) === filterCenter;

    return matchesSearch && matchesCenter;
  });

  // Debug logs removed to fix CSS conflicts

  // Renderizado condicional basado en la vista actual
  if (currentView === 'dashboard') {
    return (
      <HRDashboard 
        onNavigate={handleNavigate} 
        userRole={userRole}
        isRegularEmployee={isRegularEmployee}
        currentEmployee={employee}
      />
    );
  }

  switch (currentView) {
    case 'timeclock':
      return <TimeclockDashboard />;
    case 'mobile-timeclock':
      return <MobileTimeClock />;
    case 'daily-operations':
      return <DailyOperations />;
    case 'my-profile':
      return (
        <EmployeeProfile
          onBack={() => setCurrentView('dashboard')}
          currentEmployee={employee}
        />
      );
    case 'vacation-request':
      return (
        <VacationRequest
          onBack={() => setCurrentView('dashboard')}
          currentEmployee={employee}
        />
      );
    case 'vacations':
      return (
        <VacationApproval
          onBack={() => setCurrentView('dashboard')}
          currentEmployee={employee}
        />
      );
    case 'uniform-request':
      return (
        <InventoryManagement
          userLocation={(employee?.centerName?.toLowerCase() as LocationType) || 'central'}
          canEdit={false}
          visibleCategories={['vestuario']}
        />
      );
    case 'my-documents':
      return (
        <ComingSoon
          onBack={() => setCurrentView('dashboard')}
          title="📄 Mis Documentos"
          description="Accede a tu contrato, nóminas y documentos laborales."
        />
      );
    case 'hr-contact':
      return <IncidentManagementSystem />;
    case 'employees':
      break;
    default:
      return (
        <ComingSoon
          onBack={() => setCurrentView('dashboard')}
          title="🚧 Módulo en Desarrollo"
          description="Estamos preparando esta herramienta del CRM."
        />
      );
  }

  if (currentView === 'employees') {
    if (isLoading) {
      return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Cargando empleados...</div>;
    }

    if (error) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
          <AlertCircle style={{ marginBottom: '10px', margin: 'auto' }}/>
          <p style={{ fontWeight: 'bold' }}>Error al cargar los datos</p>
          <p>{error}</p>
        </div>
      );
    }

    return (
      <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
        {viewingEmployee ? (
          <EmployeeDetail employee={viewingEmployee} onBack={() => setViewingEmployee(null)} />
        ) : showEmployeeForm ? (
          <EmployeeForm
            employee={selectedEmployee}
            onSave={handleSaveEmployee}
            onCancel={() => setShowEmployeeForm(false)}
          />
        ) : (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Breadcrumbs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '24px',
              fontSize: '14px',
              color: '#6b7280'
            }}>
              <button
                onClick={handleBackToDashboard}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#374151'
                }}
              >
                <ArrowLeft size={14} />
                Dashboard RRHH
              </button>
              <span>›</span>
              <span style={{ color: '#059669', fontWeight: '500' }}>Base de Datos</span>
            </div>

            <HRHeader employeeCount={employees.length} activeCount={employees.filter(e => e.activo).length} />
            <Filters 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              filterCenter={filterCenter} 
              setFilterCenter={setFilterCenter} 
              centerOptions={centerOptions} 
              onNewEmployee={handleNewEmployee}
              userRole={userRole || undefined}
            />
            <EmployeeList employees={filteredEmployees} onEdit={handleEditEmployee} onView={handleViewEmployee} />
          </div>
        )}
      </div>
    );
  }

  // Para otros módulos en desarrollo
  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        {/* Breadcrumbs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '32px',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <button
            onClick={handleBackToDashboard}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151'
            }}
          >
            <ArrowLeft size={14} />
            Dashboard RRHH
          </button>
          <span>›</span>
          <span style={{ color: '#059669', fontWeight: '500' }}>
            {currentView === 'time-tracking' && 'Fichajes'}
            {currentView === 'shifts' && 'Turnos'}
            {currentView === 'evaluations' && 'Evaluaciones'}
            {currentView === 'training' && 'Formación'}
            {currentView === 'documents' && 'Documentos'}
            {currentView === 'reports' && 'Informes'}
            {currentView === 'vacations' && 'Vacaciones'}
          </span>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚧</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
            Módulo en Desarrollo
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px', lineHeight: '1.6' }}>
            Este módulo está siendo implementado como parte del sistema integral de RRHH. 
            Estará disponible en las próximas versiones del sistema.
          </p>
          <div style={{
            padding: '16px',
            backgroundColor: '#f3f4f6',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
              <strong>Módulo:</strong> {currentView === 'time-tracking' && 'Sistema de Fichajes'}
              {currentView === 'shifts' && 'Gestión de Turnos'}
              {currentView === 'evaluations' && 'Evaluaciones de Desempeño'}
              {currentView === 'training' && 'Formación y Cursos'}
              {currentView === 'documents' && 'Gestión Documental'}
              {currentView === 'reports' && 'Informes y Reportes'}
              {currentView === 'vacations' && 'Gestión de Vacaciones'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRManagementSystem;
