// src/components/hr/EmployeeDocuments.tsx
import React, { useState } from 'react';
import { ArrowLeft, FileText, Download, Eye, Calendar, Shield } from 'lucide-react';
import { useSession } from '../../contexts/SessionContext';
import { ui } from '../../utils/ui';


interface EmployeeDocumentsProps {
  onBack: () => void;
}

interface Document {
  id: string;
  name: string;
  type: 'contrato' | 'nomina' | 'certificado' | 'otros';
  date: string;
  size: string;
  status: 'disponible' | 'pendiente' | 'vencido';
}

const EmployeeDocuments: React.FC<EmployeeDocumentsProps> = ({ onBack }) => {
  const { employee } = useSession();
  const [documents] = useState<Document[]>([
    {
      id: '1',
      name: 'Contrato de Trabajo',
      type: 'contrato',
      date: '2024-01-15',
      size: '245 KB',
      status: 'disponible'
    },
    {
      id: '2',
      name: 'Nómina Septiembre 2024',
      type: 'nomina',
      date: '2024-09-30',
      size: '156 KB',
      status: 'disponible'
    },
    {
      id: '3',
      name: 'Nómina Octubre 2024',
      type: 'nomina',
      date: '2024-10-31',
      size: '158 KB',
      status: 'pendiente'
    },
    {
      id: '4',
      name: 'Certificado Médico',
      type: 'certificado',
      date: '2024-06-15',
      size: '89 KB',
      status: 'vencido'
    }
  ]);

  const getDocumentIcon = (type: string) => {
    const icons = {
      contrato: '📄',
      nomina: '💰',
      certificado: '🏥',
      otros: '📋'
    };
    return icons[type as keyof typeof icons] || '📄';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      disponible: '#10b981',
      pendiente: '#f59e0b',
      vencido: '#ef4444'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      disponible: 'Disponible',
      pendiente: 'Pendiente',
      vencido: 'Vencido'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleDownload = (doc: Document) => {
    if (doc.status === 'disponible') {
      ui.info(`Descargando: ${doc.name}`);
      // Aquí iría la lógica real de descarga
    } else {
      ui.info('Este documento no está disponible para descarga');
    }
  };

  const handleView = (doc: Document) => {
    if (doc.status === 'disponible') {
      ui.info(`Visualizando: ${doc.name}`);
      // Aquí iría la lógica para abrir el documento
    } else {
      ui.info('Este documento no está disponible para visualización');
    }
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button 
            onClick={onBack}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#f3f4f6', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            📄 Mis Documentos
          </h1>
        </div>

        {/* Info Card */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ 
              backgroundColor: '#f0f9ff', 
              borderRadius: '12px', 
              padding: '12px',
              border: '2px solid #0ea5e9'
            }}>
              <FileText size={24} color="#0ea5e9" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                Documentos de {employee?.name}
              </h3>
              <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
                Contratos, nóminas y certificados
              </p>
            </div>
          </div>

          <div style={{ 
            backgroundColor: '#fef3c7', 
            border: '1px solid #fbbf24', 
            borderRadius: '8px', 
            padding: '12px',
            fontSize: '14px',
            color: '#92400e'
          }}>
            <Shield size={16} style={{ display: 'inline', marginRight: '8px' }} />
            <strong>Confidencial:</strong> Estos documentos son privados y personales. No los compartas con terceros.
          </div>
        </div>

        {/* Documents List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {documents.map(doc => (
            <div key={doc.id} style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '20px', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  <div style={{ fontSize: '32px' }}>
                    {getDocumentIcon(doc.type)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                      {doc.name}
                    </h4>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '14px', color: '#6b7280' }}>
                      <span>
                        <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        {new Date(doc.date).toLocaleDateString('es-ES')}
                      </span>
                      <span>{doc.size}</span>
                      <span style={{ 
                        color: getStatusColor(doc.status),
                        fontWeight: '500'
                      }}>
                        {getStatusLabel(doc.status)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleView(doc)}
                    disabled={doc.status !== 'disponible'}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: doc.status === 'disponible' ? '#f3f4f6' : '#f9fafb',
                      color: doc.status === 'disponible' ? '#374151' : '#9ca3af',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: doc.status === 'disponible' ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Eye size={14} />
                    Ver
                  </button>
                  
                  <button
                    onClick={() => handleDownload(doc)}
                    disabled={doc.status !== 'disponible'}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: doc.status === 'disponible' ? '#059669' : '#f9fafb',
                      color: doc.status === 'disponible' ? 'white' : '#9ca3af',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: doc.status === 'disponible' ? 'pointer' : 'not-allowed',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Download size={14} />
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginTop: '24px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ 
            margin: '0 0 16px 0',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#111827'
          }}>
            ❓ ¿Necesitas ayuda?
          </h4>
          <p style={{ 
            margin: 0,
            fontSize: '14px',
            color: '#6b7280',
            lineHeight: '1.6'
          }}>
            Si no encuentras un documento o tienes problemas para descargarlo, contacta con RRHH a través del sistema de incidencias o directamente por email.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDocuments;
