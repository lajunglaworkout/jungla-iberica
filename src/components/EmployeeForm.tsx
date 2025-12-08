import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Employee } from '../types/employee';
import { supabase } from '../lib/supabase';

interface EmployeeFormProps {
  employee?: Employee | null;
  onSave: (employee: Employee) => void;
  onCancel: () => void;
  availableDepartments?: { id: number; name: string }[];
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSave, onCancel, availableDepartments = [] }) => {
  const [formData, setFormData] = useState<Partial<Employee>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dni: '',
    center_id: '',
    // departamento: '', // Deprecated in favor of departments array
    departments: [],
    position: '',
    bank_account_number: '',
    shirt_size: 'M',
    pant_size: '42',
    role: 'Empleado',
    contract_type: 'Indefinido',
    work_schedule: 'Completa',
    education_level: 'ESO',
    is_active: true,
    tiene_contrato_firmado: false,
    tiene_alta_ss: false,
    tiene_formacion_riesgos: false,
    ...employee
  });

  // Estado para gestión de credenciales (solo nuevos usuarios o admin)
  const [password, setPassword] = useState('');
  const [authMethod, setAuthMethod] = useState<'invite' | 'password'>('password');
  const [showPassword, setShowPassword] = useState(false);

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

  const validateForm = (): { isValid: boolean; errors: Record<string, string> } => {
    const newErrors: Record<string, string> = {};

    console.log('🔍 Validando campos:', {
      first_name: formData.first_name,
      email: formData.email
    });

    // Solo validar campos realmente obligatorios
    if (!formData.first_name?.trim()) newErrors.first_name = 'El nombre es obligatorio';
    if (!formData.email?.trim()) newErrors.email = 'El email es obligatorio';

    // Validar formato de email si está presente
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    // Validar formato de DNI solo si está presente
    const dniRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
    if (formData.dni && formData.dni.trim() && !dniRegex.test(formData.dni)) {
      newErrors.dni = 'El DNI no es válido (formato: 12345678A)';
    }

    // Validar contraseña si es nuevo usuario y método elegido es password
    if (!employee && authMethod === 'password') {
      if (!password) {
        newErrors.password = 'La contraseña es obligatoria para nuevos usuarios';
      } else if (password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    console.log('📊 Resultado validación:', {
      isValid,
      errorsCount: Object.keys(newErrors).length,
      errors: newErrors
    });

    return { isValid, errors: newErrors };
  };

  const handleSave = async () => {
    console.log('🔵 handleSave llamado en EmployeeForm');
    console.log('📝 Datos del formulario:', formData);
    console.log('👤 Empleado existente:', employee);

    const validation = validateForm();
    console.log('✅ Validación:', validation.isValid ? 'PASÓ' : 'FALLÓ');
    console.log('❌ Errores encontrados:', validation.errors);

    if (!validation.isValid) {
      console.log('⚠️ Formulario no válido, abortando...');
      alert('⚠️ Por favor completa todos los campos obligatorios:\n' + Object.values(validation.errors).join('\n'));
      return;
    }

    setLoading(true);
    console.log('⏳ Preparando datos para guardar...');

    try {
      const employeeData: Employee = {
        id: employee?.id || crypto.randomUUID(),
        first_name: formData.first_name!,
        last_name: formData.last_name!,
        email: formData.email!,
        phone: formData.phone!,
        dni: formData.dni!,
        birth_date: formData.birth_date || new Date(),
        address: formData.address || '',
        city: formData.city || '',
        postal_code: formData.postal_code || '',
        center_id: formData.center_id!,
        hire_date: formData.hire_date || new Date(),
        contract_type: formData.contract_type || 'Indefinido',
        work_schedule: formData.work_schedule || 'Completa',
        gross_annual_salary: formData.gross_annual_salary || 0,
        role: formData.role || 'Empleado',
        // departamento: formData.departamento!, // Deprecated
        departments: formData.departments,
        position: formData.position!,
        bank_account_number: formData.bank_account_number!,
        iban: formData.iban,
        banco: formData.banco,
        education_level: formData.education_level || 'ESO',
        degree: formData.degree,
        specialization: formData.specialization,
        shirt_size: formData.shirt_size || 'M',
        pant_size: formData.pant_size || '42',
        jacket_size: formData.jacket_size || 'M',
        foto_perfil: formData.foto_perfil,
        is_active: formData.is_active !== false,
        observaciones: formData.observaciones,
        tiene_contrato_firmado: formData.tiene_contrato_firmado || false,
        tiene_alta_ss: formData.tiene_alta_ss || false,
        tiene_formacion_riesgos: formData.tiene_formacion_riesgos || false,
        created_at: employee?.created_at || new Date(),
        updated_at: new Date()
      };

      console.log('📤 Llamando a onSave con:', employeeData);

      // Pasamos los datos extra como segundo argumento (si existen)
      const authData = (!employee || password) ? { password, authMethod } : undefined;
      // @ts-ignore - Ignoramos error de tipos por ahora ya que modificaremos el padre luego
      onSave(employeeData, authData);

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
                  value={formData.first_name || ''}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  style={inputStyle}
                  required
                />
                {errors.first_name && <div style={{ color: '#ef4444', fontSize: '12px' }}>{errors.first_name}</div>}
              </div>

              <div>
                <label style={labelStyle}>Apellidos</label>
                <input
                  type="text"
                  value={formData.last_name || ''}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  style={inputStyle}
                  required
                />
                {errors.last_name && <div style={{ color: '#ef4444', fontSize: '12px' }}>{errors.last_name}</div>}
              </div>

              <div>
                <label style={labelStyle}>DNI/NIE</label>
                <input
                  type="text"
                  value={formData.dni || ''}
                  onChange={(e) => setFormData({ ...formData, dni: e.target.value.toUpperCase() })}
                  style={inputStyle}
                  placeholder="12345678A"
                  required
                />
                {errors.dni && <div style={{ color: '#ef4444', fontSize: '12px' }}>{errors.dni}</div>}
              </div>

              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={inputStyle}
                  required
                />
                {errors.email && <div style={{ color: '#ef4444', fontSize: '12px' }}>{errors.email}</div>}
              </div>

              <div>
                <label style={labelStyle}>Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={inputStyle}
                  placeholder="600000000"
                  required
                />
                {errors.phone && <div style={{ color: '#ef4444', fontSize: '12px' }}>{errors.phone}</div>}
              </div>

              <div>
                <label style={labelStyle}>Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={formData.birth_date ? new Date(formData.birth_date).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, birth_date: new Date(e.target.value) })}
                  style={inputStyle}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Dirección Completa</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={inputStyle}
                  placeholder="Calle, número, piso..."
                />
              </div>

              <div>
                <label style={labelStyle}>Ciudad</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Código Postal</label>
                <input
                  type="text"
                  value={formData.postal_code || ''}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  style={inputStyle}
                  placeholder="41001"
                />
              </div>

              {/* Sección de Credenciales */}
              <div style={{ gridColumn: 'span 2', marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#059669', marginBottom: '12px' }}>
                  🔑 Credenciales de Acceso
                </h3>

                <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="authMethod"
                      checked={authMethod === 'password'}
                      onChange={() => setAuthMethod('password')}
                      style={{ accentColor: '#059669', width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '14px', color: '#374151' }}>Establecer contraseña manual</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="authMethod"
                      checked={authMethod === 'invite'}
                      onChange={() => setAuthMethod('invite')}
                      style={{ accentColor: '#059669', width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '14px', color: '#374151' }}>Enviar invitación por email</span>
                  </label>
                </div>

                {authMethod === 'password' && (
                  <div>
                    <label style={labelStyle}>Contraseña {employee ? '(Dejar en blanco para mantener la actual)' : '*'}</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={inputStyle}
                        placeholder={employee ? "••••••••" : "Mínimo 6 caracteres"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6b7280',
                          fontSize: '12px',
                          fontWeight: 500
                        }}
                      >
                        {showPassword ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>
                    {errors.password && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.password}</div>}
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
                      ⚠️ El usuario necesitará esta contraseña para acceder al sistema.
                    </div>
                  </div>
                )}

                {authMethod === 'invite' && (
                  <div style={{ padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #dbeafe', color: '#1e40af', fontSize: '14px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span>✉️</span>
                    <span>Se enviará un correo electrónico a <strong>{formData.email || '...'}</strong> con un enlace para que el usuario establezca su propia contraseña.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: Datos Laborales */}
          {activeTab === 'laboral' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Centro de Trabajo</label>
                <select
                  value={formData.center_id || ''}
                  onChange={(e) => setFormData({ ...formData, center_id: e.target.value })}
                  style={inputStyle}
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="1">Sevilla</option>
                  <option value="2">Jerez</option>
                  <option value="3">Puerto</option>
                  <option value="0">Oficina Central</option>
                </select>
                {errors.center_id && <div style={{ color: '#ef4444', fontSize: '12px' }}>{errors.center_id}</div>}
              </div>

              <div>
                <label style={labelStyle}>Departamentos</label>
                <div style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  padding: '8px',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  backgroundColor: 'white'
                }}>
                  {availableDepartments.length > 0 ? (
                    availableDepartments.map(dept => (
                      <label key={dept.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.departments?.some(d => d.id === dept.id) || false}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            let newDepartments = [...(formData.departments || [])];

                            if (isChecked) {
                              newDepartments.push(dept);
                            } else {
                              newDepartments = newDepartments.filter(d => d.id !== dept.id);
                            }

                            setFormData({ ...formData, departments: newDepartments });
                          }}
                          style={{ width: '16px', height: '16px', accentColor: '#059669' }}
                        />
                        <span style={{ fontSize: '14px', color: '#374151' }}>{dept.name}</span>
                      </label>
                    ))
                  ) : (
                    <div style={{ padding: '8px', color: '#6b7280', fontSize: '14px' }}>
                      No hay departamentos disponibles.
                    </div>
                  )}
                </div>
                {errors.departments && <div style={{ color: '#ef4444', fontSize: '12px' }}>{errors.departments}</div>}
              </div>

              <div>
                <label style={labelStyle}>Cargo</label>
                <input
                  type="text"
                  value={formData.position || ''}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  style={inputStyle}
                  placeholder="Ej: Entrenador, Recepcionista..."
                  required
                />
                {errors.position && <div style={{ color: '#ef4444', fontSize: '12px' }}>{errors.position}</div>}
              </div>

              <div>
                <label style={labelStyle}>Rol en el Sistema</label>
                <select
                  value={formData.role || 'Empleado'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  style={inputStyle}
                  required
                >
                  <option value="Empleado">👤 Empleado de Sala</option>
                  <option value="Encargado">👔 Encargado de Centro</option>
                  <option value="Franquiciado">🏢 Franquiciado</option>
                  <option value="Director">⚙️ Director / Administrador</option>
                  <option value="Admin">👑 CEO / Superadmin</option>
                </select>
                {formData.role === 'Admin' && (
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
                <label style={labelStyle}>Fecha de Alta</label>
                <input
                  type="date"
                  value={formData.hire_date ? new Date(formData.hire_date).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, hire_date: new Date(e.target.value) })}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Tipo de Contrato</label>
                <select
                  value={formData.contract_type || ''}
                  onChange={(e) => setFormData({ ...formData, contract_type: e.target.value as any })}
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
                <label style={labelStyle}>Jornada</label>
                <select
                  value={formData.work_schedule || ''}
                  onChange={(e) => setFormData({ ...formData, work_schedule: e.target.value as any })}
                  style={inputStyle}
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="Completa">Jornada Completa (40h)</option>
                  <option value="Autónomo">Autónomo</option>
                  <option value="30h">Parcial (30h)</option>
                  <option value="20h">Parcial (20h)</option>
                  <option value="Parcial">Por horas</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Salario Bruto Anual</label>
                <input
                  type="number"
                  value={formData.gross_annual_salary || ''}
                  onChange={(e) => setFormData({ ...formData, gross_annual_salary: parseFloat(e.target.value) || 0 })}
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
                <label style={labelStyle}>IBAN / Número de Cuenta</label>
                <input
                  type="text"
                  value={formData.bank_account_number || ''}
                  onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                  style={inputStyle}
                  placeholder="ES00 0000 0000 0000 0000 0000"
                  required
                />
                {errors.bank_account_number && <div style={{ color: '#ef4444', fontSize: '12px' }}>{errors.bank_account_number}</div>}
              </div>

              <div>
                <label style={labelStyle}>Banco</label>
                <input
                  type="text"
                  value={formData.banco || ''}
                  onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
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
                  value={formData.education_level || ''}
                  onChange={(e) => setFormData({ ...formData, education_level: e.target.value as any })}
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
                  value={formData.degree || ''}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  style={inputStyle}
                  placeholder="Ej: TAFAD, CAFYD..."
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Especialidad / Certificaciones</label>
                <textarea
                  value={formData.specialization || ''}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  style={{ ...inputStyle, minHeight: '80px' }}
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
                  onChange={(e) => setFormData({ ...formData, vestuario_chandal: e.target.value as 'S' | 'M' | 'L' | 'XL' })}
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
                  onChange={(e) => setFormData({ ...formData, vestuario_sudadera_frio: e.target.value as 'S' | 'M' | 'L' | 'XL' })}
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
                  onChange={(e) => setFormData({ ...formData, vestuario_chaleco_frio: e.target.value as 'S' | 'M' | 'L' | 'XL' })}
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
                  onChange={(e) => setFormData({ ...formData, vestuario_pantalon_corto: e.target.value as 'S' | 'M' | 'L' | 'XL' })}
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
                  onChange={(e) => setFormData({ ...formData, vestuario_polo_verde: e.target.value as 'S' | 'M' | 'L' | 'XL' })}
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
                  onChange={(e) => setFormData({ ...formData, vestuario_camiseta_entrenamiento: e.target.value as 'S' | 'M' | 'L' | 'XL' })}
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
                  onChange={(e) => setFormData({ ...formData, vestuario_observaciones: e.target.value })}
                  style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
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
                  onChange={(e) => setFormData({ ...formData, tiene_contrato_firmado: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Contrato firmado</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.tiene_alta_ss || false}
                  onChange={(e) => setFormData({ ...formData, tiene_alta_ss: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Alta en Seguridad Social</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.tiene_formacion_riesgos || false}
                  onChange={(e) => setFormData({ ...formData, tiene_formacion_riesgos: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <span>Formación en Prevención de Riesgos Laborales</span>
              </label>

              <div>
                <label style={labelStyle}>Observaciones</label>
                <textarea
                  value={formData.observaciones || ''}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  style={{ ...inputStyle, minHeight: '100px' }}
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
          justifyContent: 'flex-end',
          gap: '12px',
          backgroundColor: '#f9fafb'
        }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              color: loading ? '#9ca3af' : '#374151',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              console.log('🖱️ Click en botón Actualizar/Crear');
              console.log('⏳ Loading:', loading);
              console.log('👤 Employee:', employee ? 'Existente' : 'Nuevo');
              handleSave();
            }}
            disabled={loading}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: loading ? '#6ee7b7' : '#059669',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Guardando...
              </>
            ) : (
              <>
                <Save size={18} />
                {employee ? 'Actualizar Trabajador' : 'Crear Trabajador'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
