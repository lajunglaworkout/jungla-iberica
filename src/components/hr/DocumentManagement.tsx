// src/components/hr/DocumentManagement.tsx - Gestión de Documentos de Empleados
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Upload, FileText, Download, Trash2, Eye, Filter,
  Search, Calendar, User, File, AlertCircle, CheckCircle, FolderOpen
} from 'lucide-react';

import { useIsMobile } from '../../hooks/useIsMobile';
import { useData } from '../../contexts/DataContext';

// ... (keep props interface)

const DocumentManagement: React.FC<DocumentManagementProps> = ({ onBack, currentEmployee, isEmployee = false }) => {
  const { employees, centers } = useData();
  const isMobile = useIsMobile();
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);

  // ... (keep state and useEffects)

  // ... (keep helper functions)

  // ... (keep renderTasks and other functions)

  if (showUploadForm) {
    // Form view remains largely the same, maybe adjust padding
    return (
      <div style={{ padding: isMobile ? '16px' : '24px', maxWidth: '800px', margin: '0 auto' }}>
        {/* ... (rest of form code) */}
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
          <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 'bold', margin: 0 }}>
            📤 Subir Documento
          </h1>
        </div>

        <form onSubmit={handleUpload} style={{ backgroundColor: 'white', borderRadius: '12px', padding: isMobile ? '16px' : '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {/* ... (rest of form fields) */}
          {/* ... (replicate form fields exactly as they were, just modify container padding above) */}
          {!isEmployee && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Ubicación del Documento
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
                {centers.map(center => {
                  // Formatear nombre para que sea más claro
                  let displayName = center.name;
                  if (center.name.toLowerCase().includes('tablet')) {
                    displayName = center.name.replace('Tablet', '🏋️ Gimnasio');
                  } else if (center.name.toLowerCase().includes('central') || center.name.toLowerCase().includes('almacén')) {
                    displayName = '🏢 Marca Corporativa / Almacén';
                  } else if (center.name.toLowerCase().includes('marca') || center.name.toLowerCase().includes('corporativa')) {
                    displayName = '🏢 ' + center.name;
                  }
                  return (
                    <option key={center.id} value={center.id}>
                      {displayName}
                    </option>
                  );
                })}
              </select>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                💡 Selecciona el gimnasio o la marca corporativa según corresponda
              </div>
            </div>
          )}

          {/* Empleado - CON BUSCADOR MEJORADO */}
          {!isEmployee && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Empleado *
              </label>

              {/* 🔧 FIX: Añadir campo de búsqueda */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar empleado por nombre o email..."
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

              <select
                value={uploadForm.employee_id}
                onChange={(e) => setUploadForm({ ...uploadForm, employee_id: Number(e.target.value) })}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value={0}>Seleccionar empleado</option>
                {filteredEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} {emp.center_id ? `(${centers.find(c => c.id === emp.center_id)?.name || 'Sin centro'})` : '(Marca)'}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                📋 {filteredEmployees.length} empleado(s) {uploadForm.center_id > 0 ? 'del centro seleccionado' : 'disponibles'}
              </div>
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
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexDirection: isMobile ? 'column-reverse' : 'row' }}>
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              style={{
                padding: '12px 20px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                width: isMobile ? '100%' : 'auto',
                textAlign: 'center'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading}
              style={{
                padding: '12px 20px',
                backgroundColor: uploading ? '#9ca3af' : '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: isMobile ? '100%' : 'auto'
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
    <div style={{ padding: isMobile ? '16px' : '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
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

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'flex-start',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '16px' : '0'
          }}>
            <div>
              <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
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
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              <Upload size={18} />
              Subir Documento
            </button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div style={{ backgroundColor: 'white', padding: isMobile ? '16px' : '20px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px', alignItems: 'center', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
            {/* Búsqueda */}
            <div style={{ flex: 1, minWidth: isMobile ? '100%' : '250px', width: '100%' }}>
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
              <div style={{ minWidth: isMobile ? '100%' : '200px', width: isMobile ? '100%' : 'auto' }}>
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
            <div style={{ minWidth: isMobile ? '100%' : '220px', width: isMobile ? '100%' : 'auto' }}>
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
                <option value="">Todas las ubicaciones</option>
                {centers.map(center => {
                  let displayName = center.name;
                  if (center.name.toLowerCase().includes('tablet')) {
                    displayName = center.name.replace('Tablet', '🏋️ Gimnasio');
                  } else if (center.name.toLowerCase().includes('central') || center.name.toLowerCase().includes('almacén')) {
                    displayName = '🏢 Marca Corporativa / Almacén';
                  } else if (center.name.toLowerCase().includes('marca') || center.name.toLowerCase().includes('corporativa')) {
                    displayName = '🏢 ' + center.name;
                  }
                  return (
                    <option key={center.id} value={center.id}>
                      {displayName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Filtro por tipo */}
            <div style={{ minWidth: isMobile ? '100%' : '200px', width: isMobile ? '100%' : 'auto' }}>
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
                                {doc.center_name.toLowerCase().includes('tablet') ? '🏋️' : '🏢'}
                                {' '}
                                {doc.center_name.toLowerCase().includes('tablet')
                                  ? doc.center_name.replace('Tablet', 'Gimnasio')
                                  : doc.center_name.toLowerCase().includes('central') || doc.center_name.toLowerCase().includes('almacén')
                                    ? 'Marca Corporativa / Almacén'
                                    : doc.center_name
                                }
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
