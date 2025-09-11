import React from 'react';
import { Employee } from '../types/employee';
import { ArrowLeft, User, Briefcase, Banknote, GraduationCap, Shirt, FileText } from 'lucide-react';

// Sub-componente para una fila de información
const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{ marginBottom: '12px' }}>
    <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 4px 0' }}>{label}</p>
    <p style={{ color: '#111827', fontSize: '16px', fontWeight: '500', margin: 0 }}>{value || '-'}</p>
  </div>
);

// Sub-componente para una tarjeta de detalles
const DetailCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
      {icon}
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>{title}</h3>
    </div>
    {children}
  </div>
);

const EmployeeDetail: React.FC<{ employee: Employee; onBack: () => void }> = ({ employee, onBack }) => {
  const formatDate = (date: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button 
        onClick={onBack} 
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', 
          background: 'none', border: 'none', cursor: 'pointer', 
          color: '#059669', fontWeight: '600', fontSize: '16px', marginBottom: '24px'
        }}
      >
        <ArrowLeft size={20} />
        Volver a la lista
      </button>

      {/* Cabecera del Empleado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px', backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <img 
          src={employee.foto_perfil || `https://ui-avatars.com/api/?name=${employee.nombre}+${employee.apellidos}&background=059669&color=fff`}
          alt={`${employee.nombre} ${employee.apellidos}`}
          style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
        />
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#111827' }}>{`${employee.nombre} ${employee.apellidos}`}</h1>
          <p style={{ fontSize: '18px', color: '#6b7280', margin: '4px 0 0 0' }}>{employee.cargo}</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <span style={{ padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '500', backgroundColor: employee.activo ? '#dcfce7' : '#fee2e2', color: employee.activo ? '#166534' : '#991b1b' }}>
              {employee.activo ? 'Activo' : 'Inactivo'}
            </span>
            <span style={{ padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '500', backgroundColor: '#e0e7ff', color: '#3730a3' }}>
              {employee.rol}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de Detalles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        <DetailCard title="Datos Personales" icon={<User color="#059669" />}>
          <InfoRow label="Email" value={employee.email} />
          <InfoRow label="Teléfono" value={employee.telefono} />
          <InfoRow label="DNI" value={employee.dni} />
          <InfoRow label="Fecha de Nacimiento" value={formatDate(employee.fecha_nacimiento)} />
          <InfoRow label="Dirección" value={`${employee.direccion}, ${employee.ciudad}, ${employee.codigo_postal}`} />
        </DetailCard>

        <DetailCard title="Datos Laborales" icon={<Briefcase color="#059669" />}>
          <InfoRow label="Centro" value={employee.centro_nombre || 'No asignado'} />
          <InfoRow label="Fecha de Alta" value={formatDate(employee.fecha_alta)} />
          <InfoRow label="Tipo de Contrato" value={employee.tipo_contrato} />
          <InfoRow label="Jornada" value={employee.jornada} />
          <InfoRow label="Salario Bruto Anual" value={`${employee.salario_bruto_anual.toLocaleString('es-ES')} €`} />
          <InfoRow label="Departamento" value={employee.departamento} />
        </DetailCard>
        
        <DetailCard title="Datos Bancarios" icon={<Banknote color="#059669" />}>
          <InfoRow label="Banco" value={employee.banco} />
          <InfoRow label="IBAN" value={employee.iban} />
        </DetailCard>

        <DetailCard title="Datos Académicos" icon={<GraduationCap color="#059669" />}>
          <InfoRow label="Nivel de Estudios" value={employee.nivel_estudios} />
          <InfoRow label="Titulación" value={employee.titulacion} />
          <InfoRow label="Especialidad" value={employee.especialidad} />
        </DetailCard>

        <DetailCard title="Uniformes" icon={<Shirt color="#059669" />}>
          <InfoRow label="Talla Camiseta" value={employee.talla_camiseta} />
          <InfoRow label="Talla Pantalón" value={employee.talla_pantalon} />
          <InfoRow label="Talla Chaquetón" value={employee.talla_chaqueton} />
        </DetailCard>

        <DetailCard title="Documentación" icon={<FileText color="#059669" />}>
          <InfoRow label="Contrato Firmado" value={employee.tiene_contrato_firmado ? 'Sí' : 'No'} />
          <InfoRow label="Alta en SS" value={employee.tiene_alta_ss ? 'Sí' : 'No'} />
          <InfoRow label="Formación en Riesgos" value={employee.tiene_formacion_riesgos ? 'Sí' : 'No'} />
        </DetailCard>

      </div>
       {employee.observaciones && (
        <div style={{ marginTop: '24px' }}>
          <DetailCard title="Observaciones" icon={<FileText color="#059669" />}>
            <p style={{ color: '#374151', fontSize: '16px', whiteSpace: 'pre-wrap' }}>{employee.observaciones}</p>
          </DetailCard>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetail;
