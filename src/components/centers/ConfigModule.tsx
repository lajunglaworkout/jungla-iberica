import React, { useState } from 'react';
import { ArrowLeft, Settings, Users, Building, FileText, Save } from 'lucide-react';
import { ui } from '../../utils/ui';


interface ConfigModuleProps {
  centerName: string;
  centerId: string;
  onBack: () => void;
}

interface CenterConfig {
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  tipoFranquicia: 'propio' | 'franquiciado';
  manager: string;
  empleadosAsignados: string[];
  horarioApertura: string;
  horarioCierre: string;
  capacidadMaxima: number;
}

const ConfigModule: React.FC<ConfigModuleProps> = ({ centerName, centerId, onBack }) => {
  const [config, setConfig] = useState<CenterConfig>({
    nombre: centerName,
    direccion: '',
    telefono: '',
    email: '',
    tipoFranquicia: 'propio',
    manager: '',
    empleadosAsignados: [],
    horarioApertura: '06:00',
    horarioCierre: '23:00',
    capacidadMaxima: 0
  });

  const handleChange = (field: keyof CenterConfig, value: CenterConfig[keyof CenterConfig]) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    localStorage.setItem(`config_${centerId}`, JSON.stringify(config));
    ui.success('Configuración guardada correctamente');
  };

  const empleados = [
    { id: '1', nombre: 'Ana García', cargo: 'Manager' },
    { id: '2', nombre: 'Carlos López', cargo: 'Entrenador' },
    { id: '3', nombre: 'María Rodríguez', cargo: 'Recepcionista' }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ backgroundColor: 'white', padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={onBack} style={{ padding: '8px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          <ArrowLeft style={{ width: '20px', height: '20px' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>⚙️ Configuración - {centerName}</h1>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Datos Básicos */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>🏢 Datos del Centro</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Nombre</label>
                <input type="text" value={config.nombre} onChange={(e) => handleChange('nombre', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Dirección</label>
                <input type="text" value={config.direccion} onChange={(e) => handleChange('direccion', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Teléfono</label>
                <input type="tel" value={config.telefono} onChange={(e) => handleChange('telefono', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Email</label>
                <input type="email" value={config.email} onChange={(e) => handleChange('email', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Tipo de Centro</label>
                <select value={config.tipoFranquicia} onChange={(e) => handleChange('tipoFranquicia', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="propio">Centro Propio</option>
                  <option value="franquiciado">Franquiciado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Empleados y Operativo */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>👥 Empleados y Horarios</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Manager</label>
                <select value={config.manager} onChange={(e) => handleChange('manager', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Seleccionar...</option>
                  {empleados.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.nombre} - {emp.cargo}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Apertura</label>
                  <input type="time" value={config.horarioApertura} onChange={(e) => handleChange('horarioApertura', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Cierre</label>
                  <input type="time" value={config.horarioCierre} onChange={(e) => handleChange('horarioCierre', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Capacidad Máxima</label>
                <input type="number" value={config.capacidadMaxima} onChange={(e) => handleChange('capacidadMaxima', e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <button onClick={handleSave} style={{ padding: '12px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Save style={{ width: '16px', height: '16px' }} />
                Guardar Configuración
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigModule;
