// src/components/hr/DocumentManagement.tsx - Gestión de Documentos de Empleados
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Upload, FileText, Download, Trash2, Eye, Filter, 
  Search, Calendar, User, File, AlertCircle, CheckCircle, FolderOpen
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useData } from '../../contexts/DataContext';

interface DocumentManagementProps {
  onBack?: () => void;
  currentEmployee?: any;
  isEmployee?: boolean; // Si es true, solo puede subir bajas médicas
}

interface EmployeeDocument {
  id?: number;
  employee_id: number;
  employee_name?: string;
  center_id?: number;
  center_name?: string;
  document_type: 'contract' | 'payroll' | 'irpf' | 'sick_leave' | 'certificate' | 'other';
  document_name: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  period?: string;
  uploaded_by?: string;
  uploaded_at?: string;
  notes?: string;
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({ onBack, currentEmployee, isEmployee = false }) => {
  const { employees, centers } = useData();
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [uploadForm, setUploadForm] = useState<{
    employee_id: number;
    document_type: string;
    center_id: number;
    period: string;
    notes: string;
    file: File | null;
  }>({
    employee_id: 0,
    document_type: isEmployee ? 'sick_leave' : 'contract',
    center_id: 0,
    period: '',
    notes: '',
    file: null
  });

  useEffect(() => {
    if (isEmployee && currentEmployee) {
      setSelectedEmployee(currentEmployee.id);
      setUploadForm(prev => ({ ...prev, employee_id: currentEmployee.id }));
    }
    loadDocuments();
  }, [selectedEmployee, isEmployee, currentEmployee]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('employee_documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (selectedEmployee) {
        query = query.eq('employee_id', selectedEmployee);
      }

      if (isEmployee && currentEmployee) {
        query = query.eq('employee_id', currentEmployee.id);
      }

      const { data } = await query;

      if (data) {
        // Enriquecer con nombres de empleados y centros
        const enriched = data.map(doc => {
          const employee = employees.find(e => e.id === doc.employee_id);
          const center = centers.find(c => c.id === doc.center_id);
          return {
            ...doc,
            employee_name: employee?.name || 'Desconocido',
            center_name: center?.name || (doc.center_id ? 'Centro desconocido' : '')
          };
        });
        setDocuments(enriched);
      }
    } catch (error) {
      console.error('Error cargando documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels = {
      contract: '📄 Contrato',
      payroll: '💰 Nómina',
      irpf: '📊 Certificado IRPF',
      sick_leave: '🏥 Baja Médica',
      certificate: '🎓 Certificado',
      other: '📎 Otro'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getDocumentTypeColor = (type: string) => {
    const colors = {
      contract: { bg: '#dbeafe', color: '#1e40af' },
      payroll: { bg: '#dcfce7', color: '#166534' },
      irpf: { bg: '#fef3c7', color: '#92400e' },
      sick_leave: { bg: '#fee2e2', color: '#991b1b' },
      certificate: { bg: '#e0e7ff', color: '#4338ca' },
      other: { bg: '#f3f4f6', color: '#374151' }
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm({ ...uploadForm, file: e.target.files[0] });
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadForm.file || !uploadForm.employee_id) {
      alert('⚠️ Por favor selecciona un empleado y un archivo');
      return;
    }

    setUploading(true);

    try {
      // Subir archivo a Supabase Storage
      const fileName = `${uploadForm.employee_id}/${uploadForm.document_type}/${Date.now()}_${uploadForm.file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-documents')
        .upload(fileName, uploadForm.file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('employee-documents')
        .getPublicUrl(fileName);

      // Guardar registro en BD
      const { error: dbError } = await supabase
        .from('employee_documents')
        .insert({
          employee_id: uploadForm.employee_id,
          center_id: uploadForm.center_id || null,
          document_type: uploadForm.document_type,
          document_name: uploadForm.file.name,
          file_url: publicUrl,
          file_size: uploadForm.file.size,
          file_type: uploadForm.file.type,
          period: uploadForm.period || null,
          uploaded_by: isEmployee ? currentEmployee?.nombre : 'RRHH',
          notes: uploadForm.notes || null
        });

      if (dbError) throw dbError;

      alert('✅ Documento subido correctamente');
      setShowUploadForm(false);
      setUploadForm({
        employee_id: isEmployee ? currentEmployee.id : 0,
        document_type: isEmployee ? 'sick_leave' : 'contract',
        center_id: 0,
        period: '',
        notes: '',
        file: null
      });
      loadDocuments();
    } catch (error: any) {
      console.error('Error subiendo documento:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este documento?')) return;

    try {
      const { error } = await supabase
        .from('employee_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('✅ Documento eliminado');
      loadDocuments();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const handleDownload = (url: string, name: string) => {
    window.open(url, '_blank');
  };

  // Filtrar documentos
  const filteredDocuments = documents.filter(doc => {
    const typeMatch = selectedType === 'all' || doc.document_type === selectedType;
    const centerMatch = !selectedCenter || doc.center_id === selectedCenter;
    const searchMatch = doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       doc.employee_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && centerMatch && searchMatch;
  });

  // Agrupar por empleado
  const groupedByEmployee = filteredDocuments.reduce((acc, doc) => {
    const empId = doc.employee_id;
    if (!acc[empId]) {
      acc[empId] = {
        employee_name: doc.employee_name,
        documents: []
      };
    }
    acc[empId].documents.push(doc);
    return acc;
  }, {} as { [key: number]: { employee_name?: string; documents: EmployeeDocument[] } });

  if (showUploadForm) {
    return (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button 
            onClick={() => setShowUploadForm(false)} 
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
            📤 Subir Documento
          </h1>
        </div>

        <form onSubmit={handleUpload} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {/* Empleado */}
          {!isEmployee && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Empleado *
              </label>
              <select
                value={uploadForm.employee_id}
                onChange={(e) => setUploadForm({ ...uploadForm, employee_id: Number(e.target.value) })}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value={0}>Seleccionar empleado</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Centro/Marca */}
          {!isEmployee && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Centro/Marca
              </label>
              <select
                value={uploadForm.center_id}
                onChange={(e) => setUploadForm({ ...uploadForm, center_id: Number(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value={0}>Sin asignar</option>
                {centers.map(center => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tipo de documento */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Tipo de documento *
            </label>
            <select
              value={uploadForm.document_type}
              onChange={(e) => setUploadForm({ ...uploadForm, document_type: e.target.value })}
              required
              disabled={isEmployee}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {!isEmployee && (
                <>
                  <option value="contract">📄 Contrato</option>
                  <option value="payroll">💰 Nómina</option>
                  <option value="irpf">📊 Certificado IRPF</option>
                  <option value="certificate">🎓 Certificado</option>
                  <option value="other">📎 Otro</option>
                </>
              )}
              <option value="sick_leave">🏥 Baja Médica</option>
            </select>
          </div>

          {/* Periodo (para nóminas e IRPF) */}
          {(uploadForm.document_type === 'payroll' || uploadForm.document_type === 'irpf') && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Periodo {uploadForm.document_type === 'payroll' ? '(Mes)' : '(Año)'}
              </label>
              <input
                type={uploadForm.document_type === 'payroll' ? 'month' : 'number'}
                value={uploadForm.period}
                onChange={(e) => setUploadForm({ ...uploadForm, period: e.target.value })}
                placeholder={uploadForm.document_type === 'payroll' ? '2024-01' : '2024'}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          )}

          {/* Archivo */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Archivo * (PDF, imágenes)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            {uploadForm.file && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280' }}>
                📎 {uploadForm.file.name} ({(uploadForm.file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>

          {/* Notas */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Notas
            </label>
            <textarea
              value={uploadForm.notes}
              onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
              rows={3}
              placeholder="Notas adicionales..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading}
              style={{
                padding: '10px 20px',
                backgroundColor: uploading ? '#9ca3af' : '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Upload size={16} />
              {uploading ? 'Subiendo...' : 'Subir Documento'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '16px'
              }}
            >
              <ArrowLeft size={18} />
              Volver a RRHH
            </button>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                📄 Gestión de Documentos
              </h1>
              <p style={{ fontSize: '16px', color: '#6b7280' }}>
                {isEmployee ? 'Sube tus bajas médicas y documentos' : 'Contratos, nóminas, certificados y bajas médicas'}
              </p>
            </div>

            <button
              onClick={() => setShowUploadForm(true)}
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
              <Upload size={18} />
              Subir Documento
            </button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Búsqueda */}
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre o documento..."
                  style={{
                    width: '100%',
                    padding: '10px 10px 10px 40px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Filtro por empleado */}
            {!isEmployee && (
              <div style={{ minWidth: '200px' }}>
                <select
                  value={selectedEmployee || ''}
                  onChange={(e) => setSelectedEmployee(Number(e.target.value) || null)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Todos los empleados</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filtro por centro */}
            <div style={{ minWidth: '200px' }}>
              <select
                value={selectedCenter || ''}
                onChange={(e) => setSelectedCenter(Number(e.target.value) || null)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="">Todos los centros</option>
                {centers.map(center => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por tipo */}
            <div style={{ minWidth: '200px' }}>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Todos los tipos</option>
                <option value="contract">📄 Contratos</option>
                <option value="payroll">💰 Nóminas</option>
                <option value="irpf">📊 Certificados IRPF</option>
                <option value="sick_leave">🏥 Bajas Médicas</option>
                <option value="certificate">🎓 Certificados</option>
                <option value="other">📎 Otros</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de documentos agrupados por empleado */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px' }}>
              Cargando documentos...
            </div>
          ) : Object.keys(groupedByEmployee).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px' }}>
              <FolderOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.5, color: '#6b7280' }} />
              <p style={{ color: '#6b7280' }}>No hay documentos para mostrar</p>
            </div>
          ) : (
            Object.entries(groupedByEmployee).map(([empId, data]) => (
              <div key={empId} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#111827', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <User size={24} style={{ color: '#059669' }} />
                  {data.employee_name}
                  <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#6b7280' }}>
                    ({data.documents.length} documento{data.documents.length !== 1 ? 's' : ''})
                  </span>
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                  {data.documents.map(doc => {
                    const typeStyle = getDocumentTypeColor(doc.document_type);
                    return (
                      <div
                        key={doc.id}
                        style={{
                          padding: '16px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          backgroundColor: '#f9fafb'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                          <div
                            style={{
                              padding: '8px',
                              backgroundColor: typeStyle.bg,
                              borderRadius: '6px'
                            }}
                          >
                            <FileText size={20} style={{ color: typeStyle.color }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                backgroundColor: typeStyle.bg,
                                color: typeStyle.color,
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                marginBottom: '8px'
                              }}
                            >
                              {getDocumentTypeLabel(doc.document_type)}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                              {doc.document_name}
                            </div>
                            {doc.period && (
                              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                                📅 Periodo: {doc.period}
                              </div>
                            )}
                            {doc.center_name && (
                              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                                🏢 Centro: {doc.center_name}
                              </div>
                            )}
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              Subido: {new Date(doc.uploaded_at!).toLocaleDateString('es-ES')}
                              {doc.uploaded_by && ` por ${doc.uploaded_by}`}
                            </div>
                            {doc.notes && (
                              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', fontStyle: 'italic' }}>
                                📝 {doc.notes}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleDownload(doc.file_url, doc.document_name)}
                            style={{
                              flex: 1,
                              padding: '8px',
                              backgroundColor: '#dbeafe',
                              color: '#1e40af',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            <Download size={14} />
                            Descargar
                          </button>
                          {!isEmployee && (
                            <button
                              onClick={() => handleDelete(doc.id!)}
                              style={{
                                padding: '8px',
                                backgroundColor: '#fee2e2',
                                color: '#991b1b',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500'
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentManagement;
