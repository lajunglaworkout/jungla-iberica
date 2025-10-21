import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Employee } from '../types/employee';
import { supabase } from '../lib/supabase';

interface EmployeeFormProps {
  employee?: Employee | null;
  onSave: (employee: Employee) => void;
  onCancel: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Employee>>({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    dni: '',
    center_id: '',
    departamento: '',
    cargo: '',
    numero_cuenta: '',
    talla_camiseta: 'M',
    talla_pantalon: '42',
    rol: 'employee',
    tipo_contrato: 'Indefinido',
    jornada: 'Completa',
    nivel_estudios: 'ESO',
    activo: true,
    tiene_contrato_firmado: false,
    tiene_alta_ss: false,
    tiene_formacion_riesgos: false,
    ...employee
  });

  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const TABS = [
    { id: 'personal', label: '👤 Datos Personales' },
    { id: 'laboral', label: '💼 Datos Laborales' },
    { id: 'bancario', label: '💳 Datos Bancarios' },
    { id: 'academico', label: '🎓 Formación' },
    { id: 'vestuario', label: '🏃 Vestuario La Jungla' },
    { id: 'documentos', label: '📄 Documentos' }
  ];

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '4px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box'
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre?.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.apellidos?.trim()) newErrors.apellidos = 'Los apellidos son obligatorios';
    if (!formData.email?.trim()) newErrors.email = 'El email es obligatorio';
    if (!formData.telefono?.trim()) newErrors.telefono = 'El teléfono es obligatorio';
    if (!formData.dni?.trim()) newErrors.dni = 'El DNI es obligatorio';
    if (!formData.center_id) newErrors.center_id = 'El centro es obligatorio';
    if (!formData.departamento?.trim()) newErrors.departamento = 'El departamento es obligatorio';
    if (!formData.cargo?.trim()) newErrors.cargo = 'El cargo es obligatorio';
    if (!formData.numero_cuenta?.trim()) newErrors.numero_cuenta = 'El número de cuenta es obligatorio';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    const dniRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
    if (formData.dni && !dniRegex.test(formData.dni)) {
      newErrors.dni = 'El DNI no es válido (formato: 12345678A)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    console.log('🔵 handleSave llamado en EmployeeForm');
    console.log('📝 Datos del formulario:', formData);
    console.log('👤 Empleado existente:', employee);
    
    const isValid = validateForm();
    console.log('✅ Validación:', isValid ? 'PASÓ' : 'FALLÓ');
    console.log('❌ Errores:', errors);
    
    if (!isValid) {
      console.log('⚠️ Formulario no válido, abortando...');
      return;
    }

    setLoading(true);
    console.log('⏳ Preparando datos para guardar...');
    
    try {
      const employeeData: Employee = {
        id: employee?.id || crypto.randomUUID(),
        nombre: formData.nombre!,
        apellidos: formData.apellidos!,
        email: formData.email!,
        telefono: formData.telefono!,
        dni: formData.dni!,
        fecha_nacimiento: formData.fecha_nacimiento || new Date(),
        direccion: formData.direccion || '',
        ciudad: formData.ciudad || '',
        codigo_postal: formData.codigo_postal || '',
        center_id: formData.center_id!,
        fecha_alta: formData.fecha_alta || new Date(),
        tipo_contrato: formData.tipo_contrato || 'Indefinido',
        jornada: formData.jornada || 'Completa',
        salario_bruto_anual: formData.salario_bruto_anual || 0,
        rol: formData.rol || 'employee',
        departamento: formData.departamento!,
        cargo: formData.cargo!,
        numero_cuenta: formData.numero_cuenta!,
        iban: formData.iban,
        banco: formData.banco,
        nivel_estudios: formData.nivel_estudios || 'ESO',
        titulacion: formData.titulacion,
        especialidad: formData.especialidad,
        talla_camiseta: formData.talla_camiseta || 'M',
        talla_pantalon: formData.talla_pantalon || '42',
        talla_chaqueton: formData.talla_chaqueton || 'M',
        foto_perfil: formData.foto_perfil,
        activo: formData.activo !== false,
        observaciones: formData.observaciones,
        tiene_contrato_firmado: formData.tiene_contrato_firmado || false,
        tiene_alta_ss: formData.tiene_alta_ss || false,
        tiene_formacion_riesgos: formData.tiene_formacion_riesgos || false,
        created_at: employee?.created_at || new Date(),
        updated_at: new Date()
      };

      console.log('📤 Llamando a onSave con:', employeeData);
      onSave(employeeData);
      console.log('✅ onSave ejecutado correctamente');
    } catch (error) {
      console.error('❌ Error guardando empleado:', error);
    } finally {
      setLoading(false);
      console.log('🏁 handleSave finalizado');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#059669',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0 }}>
            {employee ? 'Editar Empleado' : 'Nuevo Empleado'}
          </h2>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          overflowX: 'auto'
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 16px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                borderBottom: activeTab === tab.id ? '2px solid #059669' : 'none',
                cursor: 'pointer',
                color: activeTab === tab.id ? '#059669' : '#6b7280',
                fontWeight: activeTab === tab.id ? '600' : '400',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px'
        }}>
          {/* TAB: Datos Personales */}
          {activeTab === 'personal' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre || ''}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  style={inputStyle}
                  required
                />
                {errors.nombre && <div style={{color: '#ef4444', fontSize: '12px'}}>{errors.nombre}</div>}
              </div>
              
              <div>
                <label style={labelStyle}>Apellidos *</label>
                <input
                  type="text"
                  value={formData.apellidos || ''}
                  onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                  style={inputStyle}
                  required
                />
                {errors.apellidos && <div style={{color: '#ef4444', fontSize: '12px'}}>{errors.apellidos}</div>}
              </div>

              <div>
                <label style={labelStyle}>DNI/NIE *</label>
                <input
                  type="text"
                  value={formData.dni || ''}
                  onChange={(e) => setFormData({...formData, dni: e.target.value.toUpperCase()})}
                  style={inputStyle}
                  placeholder="12345678A"
                  required
                />
                {errors.dni && <div style={{color: '#ef4444', fontSize: '12px'}}>{errors.dni}</div>}
              </div>

              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={inputStyle}
                  required
                />
                {errors.email && <div style={{color: '#ef4444', fontSize: '12px'}}>{errors.email}</div>}
              </div>

              <div>
                <label style={labelStyle}>Teléfono *</label>
                <input
                  type="tel"
                  value={formData.telefono || ''}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  style={inputStyle}
                  placeholder="600000000"
                  required
                />
                {errors.telefono && <div style={{color: '#ef4444', fontSize: '12px'}}>{errors.telefono}</div>}
              </div>

              <div>
                <label style={labelStyle}>Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={formData.fecha_nacimiento ? new Date(formData.fecha_nacimiento).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({...formData, fecha_nacimiento: new Date(e.target.value)})}
                  style={inputStyle}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Dirección Completa</label>
                <input
                  type="text"
                  value={formData.direccion || ''}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  style={inputStyle}
                  placeholder="Calle, número, piso..."
                />
              </div>

              <div>
                <label style={labelStyle}>Ciudad</label>
                <input
                  type="text"
                  value={formData.ciudad || ''}
                  onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Código Postal</label>
                <input
                  type="text"
                  value={formData.codigo_postal || ''}
                  onChange={(e) => setFormData({...formData, codigo_postal: e.target.value})}
                  style={inputStyle}
                  placeholder="41001"
                />
              </div>
            </div>
          )}

          {/* TAB: Datos Laborales */}
          {activeTab === 'laboral' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Centro de Trabajo *</label>
                <select
                  value={formData.center_id || ''}
                  onChange={(e) => setFormData({...formData, center_id: e.target.value})}
                  style={inputStyle}
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="1">Sevilla</option>
                  <option value="2">Jerez</option>
                  <option value="3">Puerto</option>
                  <option value="0">Oficina Central</option>
                </select>
                {errors.center_id && <div style={{color: '#ef4444', fontSize: '12px'}}>{errors.center_id}</div>}
              </div>

              <div>
                <label style={labelStyle}>Departamento *</label>
                <select
                  value={formData.departamento || ''}
                  onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                  style={inputStyle}
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="Dirección">Dirección</option>
                  <option value="RRHH">RRHH y Procedimientos</option>
                  <option value="Logística">Logística y Operaciones</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Ventas">Ventas</option>
                  <option value="Contabilidad">Contabilidad</option>
                  <option value="Eventos">Eventos</option>
                  <option value="Online">Online</option>
                  <option value="Entrenamiento">Entrenamiento</option>
                  <option value="Recepción">Recepción</option>
                </select>
                {errors.departamento && <div style={{color: '#ef4444', fontSize: '12px'}}>{errors.departamento}</div>}
              </div>

              <div>
                <label style={labelStyle}>Cargo *</label>
                <input
                  type="text"
                  value={formData.cargo || ''}
                  onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                  style={inputStyle}
                  placeholder="Ej: Entrenador, Recepcionista..."
                  required
                />
                {errors.cargo && <div style={{color: '#ef4444', fontSize: '12px'}}>{errors.cargo}</div>}
              </div>

              <div>
                <label style={labelStyle}>Rol en el Sistema *</label>
                <select
                  value={formData.rol || 'employee'}
                  onChange={(e) => setFormData({...formData, rol: e.target.value as any})}
                  style={inputStyle}
                  required
                >
                  <option value="employee">👤 Empleado de Sala</option>
                  <option value="center_manager">👔 Encargado de Centro</option>
                  <option value="manager">👨‍💼 Manager</option>
                  <option value="admin">⚙️ Administrador</option>
                  {/* Superadmin solo para Carlos - no se puede crear desde aquí */}
                </select>
                {formData.rol === 'superadmin' && (
                  <div style={{ 
                    marginTop: '4px', 
                    padding: '8px', 
                    backgroundColor: '#fef3c7', 
                    border: '1px solid #fbbf24',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#92400e'
                  }}>
                    👑 <strong>Superadmin:</strong> Este rol solo puede ser asignado por el CEO (Carlos)
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Fecha de Alta *</label>
                <input
                  type="date"
                  value={formData.fecha_alta ? new Date(formData.fecha_alta).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({...formData, fecha_alta: new Date(e.target.value)})}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Tipo de Contrato *</label>
                <select
                  value={formData.tipo_contrato || ''}
                  onChange={(e) => setFormData({...formData, tipo_contrato: e.target.value as any})}
                  style={inputStyle}
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="Indefinido">📝 Indefinido</option>
                  <option value="Temporal">⏰ Temporal</option>
                  <option value="Prácticas">🎓 Prácticas</option>
                  <option value="Formación">📚 Formación</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Jornada *</label>
                <select
                  value={formData.jornada || ''}
                  onChange={(e) => setFormData({...formData, jornada: e.target.value as any})}
                  style={inputStyle}
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="Completa">Jornada Completa (40h)</option>
                  <option value="30h">Parcial (30h)</option>
                  <option value="20h">Parcial (20h)</option>
                  <option value="Parcial">Por horas</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Salario Bruto Anual *</label>
                <input
                  type="number"
                  value={formData.salario_bruto_anual || ''}
                  onChange={(e) => setFormData({...formData, salario_bruto_anual: parseFloat(e.target.value) || 0})}
                  style={inputStyle}
                  placeholder="18000"
                  required
                />
              </div>
            </div>
          )}

          {/* TAB: Datos Bancarios */}
          {activeTab === 'bancario' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>IBAN / Número de Cuenta *</label>
                <input
                  type="text"
                  value={formData.numero_cuenta || ''}
                  onChange={(e) => setFormData({...formData, numero_cuenta: e.target.value})}
                  style={inputStyle}
                  placeholder="ES00 0000 0000 0000 0000 0000"
                  required
                />
                {errors.numero_cuenta && <div style={{color: '#ef4444', fontSize: '12px'}}>{errors.numero_cuenta}</div>}
              </div>

              <div>
                <label style={labelStyle}>Banco</label>
                <input
                  type="text"
                  value={formData.banco || ''}
                  onChange={(e) => setFormData({...formData, banco: e.target.value})}
                  style={inputStyle}
                  placeholder="Ej: Santander, BBVA..."
                />
              </div>
            </div>
          )}

          {/* TAB: Formación */}
          {activeTab === 'academico' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Nivel de Estudios</label>
                <select
                  value={formData.nivel_estudios || ''}
                  onChange={(e) => setFormData({...formData, nivel_estudios: e.target.value as any})}
                  style={inputStyle}
                >
                  <option value="">Seleccionar...</option>
                  <option value="ESO">ESO</option>
                  <option value="Bachillerato">Bachillerato</option>
                  <option value="FP Medio">FP Grado Medio</option>
                  <option value="FP Superior">FP Grado Superior</option>
                  <option value="Universitario">Universitario</option>
                  <option value="Máster">Máster</option>
                  <option value="Doctorado">Doctorado</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Titulación</label>
                <input
                  type="text"
                  value={formData.titulacion || ''}
                  onChange={(e) => setFormData({...formData, titulacion: e.target.value})}
                  style={inputStyle}
                  placeholder="Ej: TAFAD, CAFYD..."
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Especialidad / Certificaciones</label>
                <textarea
                  value={formData.especialidad || ''}
                  onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
                  style={{...inputStyle, minHeight: '80px'}}
                  placeholder="Certificaciones deportivas, cursos relevantes..."
                />
              </div>
            </div>
          )}


          {/* TAB: Vestuario La Jungla */}
          {activeTab === 'vestuario' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <label style={labelStyle}>🧥 Chándal</label>
                <select
                  value={formData.vestuario_chandal || ''}
                  onChange={(e) => setFormData({...formData, vestuario_chandal: e.target.value as 'S' | 'M' | 'L' | 'XL'})}
                  style={inputStyle}
                >
                  <option value="">Sin asignar</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>🧥 Sudadera Frío</label>
                <select
                  value={formData.vestuario_sudadera_frio || ''}
                  onChange={(e) => setFormData({...formData, vestuario_sudadera_frio: e.target.value as 'S' | 'M' | 'L' | 'XL'})}
                  style={inputStyle}
                >
                  <option value="">Sin asignar</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>🦺 Chaleco Frío</label>
                <select
                  value={formData.vestuario_chaleco_frio || ''}
                  onChange={(e) => setFormData({...formData, vestuario_chaleco_frio: e.target.value as 'S' | 'M' | 'L' | 'XL'})}
                  style={inputStyle}
                >
                  <option value="">Sin asignar</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>🩳 Pantalón Corto</label>
                <select
                  value={formData.vestuario_pantalon_corto || ''}
                  onChange={(e) => setFormData({...formData, vestuario_pantalon_corto: e.target.value as 'S' | 'M' | 'L' | 'XL'})}
                  style={inputStyle}
                >
                  <option value="">Sin asignar</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>👕 Polo Verde</label>
                <select
                  value={formData.vestuario_polo_verde || ''}
                  onChange={(e) => setFormData({...formData, vestuario_polo_verde: e.target.value as 'S' | 'M' | 'L' | 'XL'})}
                  style={inputStyle}
                >
                  <option value="">Sin asignar</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>💪 Camiseta Entrenamiento Personal</label>
                <select
                  value={formData.vestuario_camiseta_entrenamiento || ''}
                  onChange={(e) => setFormData({...formData, vestuario_camiseta_entrenamiento: e.target.value as 'S' | 'M' | 'L' | 'XL'})}
                  style={inputStyle}
                >
                  <option value="">Sin asignar</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>📝 Observaciones del Vestuario</label>
                <textarea
                  value={formData.vestuario_observaciones || ''}
                  onChange={(e) => setFormData({...formData, vestuario_observaciones: e.target.value})}
                  style={{...inputStyle, minHeight: '80px', resize: 'vertical'}}
                  placeholder="Observaciones sobre el vestuario asignado..."
                />
              </div>
            </div>
          )}

          {/* TAB: Documentos */}
          {activeTab === 'documentos' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.tiene_contrato_firmado || false}
                  onChange={(e) => setFormData({...formData, tiene_contrato_firmado: e.target.checked})}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Contrato firmado</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.tiene_alta_ss || false}
                  onChange={(e) => setFormData({...formData, tiene_alta_ss: e.target.checked})}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Alta en Seguridad Social</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.tiene_formacion_riesgos || false}
                  onChange={(e) => setFormData({...formData, tiene_formacion_riesgos: e.target.checked})}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Formación en Prevención de Riesgos Laborales</span>
              </label>

              <div>
                <label style={labelStyle}>Observaciones</label>
                <textarea
                  value={formData.observaciones || ''}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  style={{...inputStyle, minHeight: '100px'}}
                  placeholder="Notas adicionales sobre el empleado..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: '#f9fafb'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          
          <button
            onClick={() => {
              console.log('🖱️ Click en botón Actualizar/Crear');
              console.log('⏳ Loading:', loading);
              console.log('👤 Employee:', employee ? 'Editando' : 'Nuevo');
              handleSave();
            }}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Save size={16} />
            {loading ? 'Guardando...' : employee ? 'Actualizar' : 'Crear Empleado'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
