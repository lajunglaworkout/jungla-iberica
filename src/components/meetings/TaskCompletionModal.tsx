import React, { useState } from 'react';
import { X, Loader, Upload, Link as LinkIcon, Trash2, FileText, Image as ImageIcon } from 'lucide-react';
import { completeTask } from '../../services/taskService';
import { supabase } from '../../lib/supabase';

interface TaskCompletionModalProps {
  isOpen: boolean;
  taskId: number;
  taskTitle: string;
  userEmail: string;
  userName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({
  isOpen,
  taskId,
  taskTitle,
  userEmail,
  userName,
  onClose,
  onSuccess
}) => {
  const [completionNotes, setCompletionNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addLink = () => {
    if (newLink && newLink.trim()) {
      setLinks(prev => [...prev, newLink.trim()]);
      setNewLink('');
    }
  };

  const removeLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    if (!completionNotes.trim()) {
      alert('Por favor, añade una justificación del cierre');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // 1. Subir archivos a Supabase Storage
      const uploadedFiles = [];

      if (selectedFiles.length > 0) {
        const totalFiles = selectedFiles.length;
        let processedFiles = 0;

        for (const file of selectedFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `tasks/${taskId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { data, error } = await supabase.storage
            .from('task-attachments')
            .upload(fileName, file);

          if (error) {
            console.error('Error uploading file:', error);
            // Continue with other files or fail? Failing safe for now but logging.
          } else if (data) {
            const publicUrl = supabase.storage.from('task-attachments').getPublicUrl(data.path).data.publicUrl;
            uploadedFiles.push({
              name: file.name,
              path: data.path,
              url: publicUrl,
              type: file.type,
              size: file.size
            });
          }

          processedFiles++;
          setUploadProgress(Math.round((processedFiles / totalFiles) * 100));
        }
      }

      // 2. Guardar tarea completada
      const result = await completeTask(
        taskId,
        userEmail,
        completionNotes,
        uploadedFiles,
        links
      );

      if (result.success) {
        alert('✅ Tarea completada correctamente');
        setCompletionNotes('');
        setSelectedFiles([]);
        setLinks([]);
        onSuccess();
        onClose();
      } else {
        alert('❌ Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al completar la tarea');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (!isOpen) return null;

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
      zIndex: 1002
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '95%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            ✅ Completar Tarea
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        {/* Contenido Scrollable */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          display: 'grid',
          gap: '16px'
        }}>
          {/* Información de la tarea */}
          <div style={{
            padding: '16px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px'
          }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#166534',
              marginBottom: '4px'
            }}>
              Tarea
            </div>
            <div style={{
              fontSize: '14px',
              color: '#1f2937',
              fontWeight: '500'
            }}>
              {taskTitle}
            </div>
          </div>

          {/* Información del usuario */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <div>
              <label style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                display: 'block',
                marginBottom: '4px'
              }}>
                Completado por
              </label>
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#1f2937'
              }}>
                {userName}
              </div>
            </div>
            <div>
              <label style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                display: 'block',
                marginBottom: '4px'
              }}>
                Email
              </label>
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#1f2937',
                wordBreak: 'break-all'
              }}>
                {userEmail}
              </div>
            </div>
          </div>

          {/* Justificación */}
          <div>
            <label style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              display: 'block',
              marginBottom: '8px'
            }}>
              Justificación del Cierre *
            </label>
            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Describe qué se ha hecho para completar esta tarea..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                minHeight: '100px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
            <div style={{
              fontSize: '12px',
              color: '#9ca3af',
              marginTop: '4px'
            }}>
              Mínimo 10 caracteres
            </div>
          </div>

          {/* EVIDENCIAS - Archivos */}
          <div>
            <label style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              display: 'block',
              marginBottom: '8px'
            }}>
              📎 Adjuntar evidencias (fotos, documentos)
            </label>

            {/* Dropzone / Input */}
            <div style={{
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              backgroundColor: '#f9fafb',
              marginBottom: '12px'
            }}>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-upload"
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Upload size={24} color="#6b7280" />
                <span style={{ fontSize: '14px', color: '#4b5563' }}>
                  Click para subir archivos
                </span>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  (Imágenes, PDF, Word)
                </span>
              </label>
            </div>

            {/* Lista de archivos seleccionados */}
            {selectedFiles.length > 0 && (
              <div style={{ display: 'grid', gap: '8px' }}>
                {selectedFiles.map((file, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}>
                    {file.type.startsWith('image/') ? <ImageIcon size={16} /> : <FileText size={16} />}
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <button
                      onClick={() => removeFile(idx)}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: '#dc2626'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EVIDENCIAS - Enlaces */}
          <div>
            <label style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              display: 'block',
              marginBottom: '8px'
            }}>
              🔗 Añadir enlaces
            </label>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="url"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="https://..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault(); // Prevenir submit si estuviera en un form
                    addLink();
                  }
                }}
              />
              <button
                onClick={addLink}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  color: '#4b5563',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Añadir
              </button>
            </div>

            {/* Lista de enlaces */}
            {links.length > 0 && (
              <div style={{ display: 'grid', gap: '8px' }}>
                {links.map((link, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px',
                    backgroundColor: '#eff6ff',
                    borderRadius: '6px',
                    fontSize: '14px',
                    border: '1px solid #bfdbfe'
                  }}>
                    <LinkIcon size={16} color="#3b82f6" />
                    <a href={link} target="_blank" rel="noopener noreferrer" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#2563eb' }}>
                      {link}
                    </a>
                    <button
                      onClick={() => removeLink(idx)}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: '#dc2626'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          backgroundColor: '#f9fafb'
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              backgroundColor: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            Cancelar
          </button>

          <button
            onClick={handleComplete}
            disabled={loading || completionNotes.trim().length < 10}
            style={{
              backgroundColor: completionNotes.trim().length < 10 ? '#d1d5db' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: (loading || completionNotes.trim().length < 10) ? 'not-allowed' : 'pointer',
              opacity: (loading || completionNotes.trim().length < 10) ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading && <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />}
            {loading ? `Subiendo... ${uploadProgress}%` : 'Completar Tarea'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TaskCompletionModal;
