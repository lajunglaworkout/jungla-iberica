import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, AlertCircle, Plus, Edit, Search, UserCheck
} from 'lucide-react';
import EmployeeForm from './EmployeeForm';
import EmployeeDetail from './EmployeeDetail';
import { Employee } from '../types/Employee';
import { supabase } from '../lib/supabase';
import { useSession } from '../contexts/SessionContext';
import { useData } from '../contexts/DataContext';

// ============ SUB-COMPONENTES =============

const HRHeader: React.FC<{ employeeCount: number; activeCount: number }> = ({ employeeCount, activeCount }) => (
  <div style={{ marginBottom: '24px' }}>
    <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827' }}>Gestión de Recursos Humanos</h1>
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
  centers: { id: string; name: string }[];
  onNewEmployee: () => void;
  onCreateCenterEmployees?: () => void;
  userRole?: string;
}> = ({ searchTerm, setSearchTerm, filterCenter, setFilterCenter, centers, onNewEmployee, onCreateCenterEmployees, userRole }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <div style={{ position: 'relative' }}>
        <Search size={20} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
        <input
          type="text"
          placeholder="Buscar por nombre, email, cargo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', width: '300px' }}
        />
      </div>
      <select
        value={filterCenter}
        onChange={(e) => setFilterCenter(e.target.value)}
        style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white' }}
      >
        {centers.map(center => (
          <option key={center.id} value={center.id}>{center.name}</option>
        ))}
      </select>
    </div>
    <div style={{ display: 'flex', gap: '12px' }}>
      <button 
        onClick={onNewEmployee} 
        style={{ 
          backgroundColor: '#059669', color: 'white', border: 'none', 
          padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', 
          display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' 
        }}
      >
        <Plus size={18} />
        Nuevo Empleado
      </button>

    </div>
  </div>
);

const EmployeeCard: React.FC<{ employee: Employee; onEdit: (employee: Employee) => void; onView: (employee: Employee) => void }> = ({ employee, onEdit, onView }) => {
  const getRoleBadgeStyle = (role: string): React.CSSProperties => {
    const base = { padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: '500' };
    switch (role) {
      case 'superadmin': return { ...base, backgroundColor: '#fef2f2', color: '#991b1b' };
      case 'admin': return { ...base, backgroundColor: '#fffbeb', color: '#b45309' };
      case 'manager': return { ...base, backgroundColor: '#ecfdf5', color: '#065f46' };
      default: return { ...base, backgroundColor: '#f3f4f6', color: '#4b5563' };
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', 
      padding: '16px', display: 'flex', alignItems: 'center', gap: '16px',
      transition: 'box-shadow 0.2s ease-in-out'
    }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.05)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
      <img
        src={employee.foto_perfil || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.nombre)}+${encodeURIComponent(employee.apellidos)}&background=059669&color=fff`}
        alt={`Foto de ${employee.nombre}`}
        style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }}
      />
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', alignItems: 'center', gap: '16px' }}>
        <div>
          <div style={{ fontWeight: '600', color: '#111827' }}>{employee.nombre} {employee.apellidos}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>{employee.email}</div>
        </div>
        <div>
          <div style={{ fontWeight: '500', color: '#374151' }}>{employee.cargo}</div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>{employee.departamento}</div>
        </div>
        <div>
          <span style={getRoleBadgeStyle(employee.rol)}>{employee.rol}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <button onClick={() => onEdit(employee)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '8px' }}>
            <Edit size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const EmployeeList: React.FC<{ employees: Employee[]; onEdit: (employee: Employee) => void; onView: (employee: Employee) => void }> = ({ employees, onEdit, onView }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {employees.length > 0 ? (
      employees.map(employee => (
        <EmployeeCard key={employee.id} employee={employee} onEdit={onEdit} onView={onView} />
      ))
    ) : (
      <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280', border: '2px dashed #e5e7eb', borderRadius: '12px', backgroundColor: 'white' }}>
        <Users size={48} style={{ marginBottom: '16px', color: '#9ca3af' }} />
        <h3 style={{ fontSize: '18px', margin: 0, fontWeight: '600', color: '#374151' }}>No se encontraron empleados</h3>
        <p style={{ fontSize: '14px', marginTop: '8px' }}>Intenta ajustar los filtros o crear un nuevo empleado.</p>
      </div>
    )}
  </div>
);

// ============ COMPONENTE PRINCIPAL ============
const HRManagementSystem = () => {
  const { user, userRole } = useSession();
  const { centers: dataCenters } = useData();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCenter, setFilterCenter] = useState('all'); // 'all', '9', '10', '11', '0'
  const [isLoading, setIsLoading] = useState(true);

  const getEmployeeTableName = useCallback(async () => {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['employees', 'empleados']);

    if (error) {
      console.error('Error checking for employee table:', error);
      return null;
    }
    return data?.[0]?.table_name || null;
  }, []);
  const [error, setError] = useState<string | null>(null);

  // Función de diagnóstico completa
  const diagnosticarSistema = useCallback(async () => {
    console.log('🔍 === DIAGNÓSTICO COMPLETO DEL SISTEMA ===');
    
    try {
      // 1. Verificar centros
      console.log('\n📍 PASO 1: Verificando centros...');
      const { data: centros, error: errorCentros } = await supabase
        .from('centers')
        .select('*');
      
      if (errorCentros) {
        console.error('❌ Error cargando centros:', errorCentros);
      } else {
        console.log('✅ Centros encontrados:', centros?.length);
        centros?.forEach(c => {
          console.log(`  - ${c.name} (ID: ${c.id})`);
        });
      }
      
      // 2. Verificar TODOS los empleados sin filtros
      console.log('\n👥 PASO 2: Verificando TODOS los empleados...');
      const { data: todosEmpleados, error: errorTodos } = await supabase
        .from('employees')
        .select('*');
      
      if (errorTodos) {
        console.error('❌ Error cargando empleados:', errorTodos);
      } else {
        console.log('✅ Total empleados en BD:', todosEmpleados?.length);
        
        // Agrupar por center_id
        const porCentro = todosEmpleados?.reduce((acc: Record<string, string[]>, emp: any) => {
          const key = emp.center_id || 'Oficina Central';
          if (!acc[key]) acc[key] = [];
          acc[key].push(emp.nombre || emp.name || emp.email);
          return acc;
        }, {});
        
        console.log('\n📊 Distribución de empleados:');
        Object.entries(porCentro || {}).forEach(([centroId, empleados]: [string, string[]]) => {
          console.log(`  Centro ${centroId}: ${empleados.length} empleados`);
          empleados.forEach((emp: string) => console.log(`    - ${emp}`));
        });
      }
      
      // 3. Buscar empleados específicos de los centros
      console.log('\n🔍 PASO 3: Buscando empleados específicos de centros...');
      const empleadosEsperados = [
        'Francisco Giráldez',
        'Iván Fernández González', 
        'Israel Torres'
      ];
      
      for (const nombre of empleadosEsperados) {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .or(`nombre.ilike.%${nombre}%,name.ilike.%${nombre}%`);
        
        if (data && data.length > 0) {
          console.log(`✅ ${nombre}: EXISTE (Centro ID: ${data[0].center_id})`);
        } else {
          console.log(`❌ ${nombre}: NO EXISTE`);
        }
      }
      
    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
    }
    
    console.log('\n=== FIN DEL DIAGNÓSTICO ===\n');
  }, []);

  const loadEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔍 Cargando TODOS los empleados...');
      
      // Cargar empleados de forma simple
      const { data: empleadosData, error: empleadosError } = await supabase
        .from('employees')
        .select('*');
      
      if (empleadosError) {
        console.error('❌ Error cargando empleados:', empleadosError);
        setError(`Error al cargar empleados: ${empleadosError.message}`);
        return;
      }
      
      console.log('📊 Empleados cargados de BD:', empleadosData?.length);
      
      if (!empleadosData || empleadosData.length === 0) {
        console.log('⚠️ No se encontraron empleados en la base de datos');
        setEmployees([]);
        return;
      }
      
      // Cargar centros por separado
      const { data: centersData } = await supabase
        .from('centers')
        .select('*');
      
      // Mapear empleados de forma más simple y robusta
      const empleadosMapeados = empleadosData.map((emp: any) => {
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
    diagnosticarSistema();
    loadEmployees();
  }, [diagnosticarSistema, loadEmployees]);

  const handleSaveEmployee = async (employeeData: Partial<Employee>) => {
    setIsLoading(true);
    setError(null);
    try {
      const tableName = await getEmployeeTableName();
      if (!tableName) throw new Error("No se pudo determinar la tabla de empleados.");

      if (selectedEmployee) {
        console.log(`💾 Actualizando empleado con ID: ${selectedEmployee.id}`);
        const { error } = await supabase.from(tableName).update(employeeData).eq('id', selectedEmployee.id);
        if (error) throw error;
        console.log('✅ Empleado actualizado');
      } else {
        console.log('➕ Creando nuevo empleado...');
        const { error } = await supabase.from(tableName).insert([employeeData]);
        if (error) throw error;
        console.log('✅ Empleado creado');
      }
      setShowEmployeeForm(false);
      setSelectedEmployee(null);
      await loadEmployees();
    } catch (err: any) {
      setError(err.message);
      console.error("Error guardando empleado:", err.message);
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

  // Función para crear los 18 empleados de centros si no existen
  const crearEmpleadosCentros = useCallback(async () => {
    console.log('🚀 Creando los 18 empleados de centros...');
    
    try {
      // Obtener IDs de centros
      const { data: centers } = await supabase
        .from('centers')
        .select('id, name');
      
      const sevillaId = centers?.find(c => c.name === 'Sevilla')?.id;
      const jerezId = centers?.find(c => c.name === 'Jerez')?.id;
      const puertoId = centers?.find(c => c.name === 'Puerto')?.id;
      
      console.log('IDs de centros:', { sevillaId, jerezId, puertoId });
      
      // Empleados de Sevilla
      const empleadosSevilla = [
        { nombre: 'Francisco', apellidos: 'Giráldez', email: 'francisco.giraldez@lajungla.com', cargo: 'Encargado de Centro', center_id: sevillaId },
        { nombre: 'Salvador', apellidos: 'Cabrera', email: 'salvador.cabrera@lajungla.com', cargo: 'Segundo Encargado', center_id: sevillaId },
        { nombre: 'Javier', apellidos: 'Surián', email: 'javier.surian@lajungla.com', cargo: 'Entrenador', center_id: sevillaId },
        { nombre: 'Jesús', apellidos: 'Arias', email: 'jesus.arias@lajungla.com', cargo: 'Entrenador', center_id: sevillaId },
        { nombre: 'Jesús', apellidos: 'Rosado', email: 'jesus.rosado@lajungla.com', cargo: 'Entrenador', center_id: sevillaId },
        { nombre: 'Santiago', apellidos: 'Frías', email: 'santiago.frias@lajungla.com', cargo: 'Entrenador', center_id: sevillaId }
      ];
      
      // Empleados de Jerez
      const empleadosJerez = [
        { nombre: 'Iván', apellidos: 'Fernández González', email: 'ivan.fernandez@lajungla.com', cargo: 'Encargado de Centro', center_id: jerezId },
        { nombre: 'Pablo', apellidos: 'Benítez Macarro', email: 'pablo.benitez@lajungla.com', cargo: 'Segundo Encargado', center_id: jerezId },
        { nombre: 'Mario', apellidos: 'Muñoz Díaz', email: 'mario.munoz@lajungla.com', cargo: 'Entrenador', center_id: jerezId },
        { nombre: 'José Luis', apellidos: 'Rodríguez Muñoz', email: 'joseluis.rodriguez@lajungla.com', cargo: 'Entrenador', center_id: jerezId },
        { nombre: 'Antonio Jesús', apellidos: 'Durán', email: 'antonio.duran@lajungla.com', cargo: 'Entrenador', center_id: jerezId },
        { nombre: 'Francisco', apellidos: 'Estepa Crespo', email: 'francisco.estepa@lajungla.com', cargo: 'Entrenador', center_id: jerezId }
      ];
      
      // Empleados del Puerto
      const empleadosPuerto = [
        { nombre: 'Israel', apellidos: 'Torres', email: 'israel.torres@lajungla.com', cargo: 'Encargado de Centro', center_id: puertoId },
        { nombre: 'Guillermo', apellidos: 'Bermúdez', email: 'guillermo.bermudez@lajungla.com', cargo: 'Segundo Encargado', center_id: puertoId },
        { nombre: 'José', apellidos: 'Figueroa', email: 'jose.figueroa@lajungla.com', cargo: 'Entrenador', center_id: puertoId },
        { nombre: 'Adrián', apellidos: 'Jiménez', email: 'adrian.jimenez@lajungla.com', cargo: 'Entrenador', center_id: puertoId },
        { nombre: 'Manuel', apellidos: 'Bella', email: 'manuel.bella@lajungla.com', cargo: 'Entrenador', center_id: puertoId },
        { nombre: 'Jonathan', apellidos: 'Padilla', email: 'jonathan.padilla@lajungla.com', cargo: 'Entrenador', center_id: puertoId }
      ];
      
      // Combinar todos
      const todosLosEmpleados = [
        ...empleadosSevilla,
        ...empleadosJerez,
        ...empleadosPuerto
      ];
      
      // Crear cada empleado
      for (const emp of todosLosEmpleados) {
        const empleadoCompleto = {
          ...emp,
          telefono: '600' + Math.floor(Math.random() * 1000000),
          dni: Math.random().toString(36).substring(7).toUpperCase() + 'A',
          rol: emp.cargo.includes('Encargado') ? 'manager' : 'employee',
          activo: true,
          fecha_alta: new Date('2023-01-15').toISOString(),
          tipo_contrato: 'Indefinido',
          departamento: 'Operaciones',
          jornada: 'Completa',
          salario_bruto_anual: emp.cargo.includes('Encargado') ? 25000 : 20000,
          nivel_estudios: 'FP Superior',
          talla_camiseta: 'L',
          talla_pantalon: '42',
          talla_chaqueton: 'L',
          tiene_contrato_firmado: true,
          tiene_alta_ss: true,
          tiene_formacion_riesgos: true
        };
        
        const { data, error } = await supabase
          .from('employees')
          .upsert(empleadoCompleto, { 
            onConflict: 'email',
            ignoreDuplicates: false 
          })
          .select();
        
        if (error) {
          console.error(`❌ Error creando ${emp.nombre} ${emp.apellidos}:`, error);
        } else {
          console.log(`✅ Creado: ${emp.nombre} ${emp.apellidos}`);
        }
      }
      
      // Recargar empleados
      await loadEmployees();
      console.log('🎉 ¡Empleados de centros creados exitosamente!');
      
    } catch (error) {
      console.error('❌ Error creando empleados:', error);
    }
  }, [loadEmployees]);

  const centers = [
    { id: 'all', name: 'Todos los Centros' },
    { id: '9', name: 'Sevilla' },
    { id: '10', name: 'Jerez' },
    { id: '11', name: 'El Puerto' },
    { id: '0', name: 'Oficina Central' },
  ];

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
          <HRHeader employeeCount={employees.length} activeCount={employees.filter(e => e.activo).length} />
          <Filters 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
            filterCenter={filterCenter} 
            setFilterCenter={setFilterCenter} 
            centers={centers} 
            onNewEmployee={handleNewEmployee}
            onCreateCenterEmployees={crearEmpleadosCentros}
            userRole={userRole || undefined}
          />
          <EmployeeList employees={filteredEmployees} onEdit={handleEditEmployee} onView={handleViewEmployee} />
        </div>
      )}
    </div>
  );
};

export default HRManagementSystem;
