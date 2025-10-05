import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, Calendar, CheckCircle, Clock } from 'lucide-react';

interface ChecklistHistoryProps {
  centerName: string;
}

interface HistoryItem {
  id: string;
  date: string;
  completed_by: string | null;
  completed_at: string | null;
  tasks: any[];
  created_at: string;
}

const ChecklistHistory: React.FC<ChecklistHistoryProps> = ({ centerName }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [centerName]);

  const loadHistory = async () => {
    console.log('📚 Cargando historial para centro:', centerName);
    setLoading(true);
    setError(null);

    try {
      // Buscar el centro por nombre para obtener su ID
      const { data: centerData, error: centerError } = await supabase
        .from('centers')
        .select('id')
        .eq('name', centerName)
        .single();

      if (centerError) {
        console.error('❌ Error buscando centro:', centerError);
        throw new Error(`Centro ${centerName} no encontrado`);
      }

      if (!centerData) {
        throw new Error(`Centro ${centerName} no existe`);
      }

      console.log('🏢 Centro encontrado:', centerData);

      // Cargar historial de checklists
      const { data: historyData, error: historyError } = await supabase
        .from('daily_checklists')
        .select('*')
        .eq('center_id', centerData.id)
        .order('date', { ascending: false })
        .limit(30);

      if (historyError) {
        console.error('❌ Error cargando historial:', historyError);
        throw historyError;
      }

      console.log('✅ Historial cargado:', historyData?.length || 0, 'registros');
      setHistory(historyData || []);
    } catch (err) {
      console.error('❌ Error en loadHistory:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCompletionStatus = (item: HistoryItem) => {
    if (item.completed_by && item.completed_at) {
      return {
        status: 'Completado',
        icon: <CheckCircle style={{ height: '16px', width: '16px', color: '#059669' }} />,
        color: '#059669',
        bgColor: '#dcfce7'
      };
    } else {
      return {
        status: 'Pendiente',
        icon: <Clock style={{ height: '16px', width: '16px', color: '#d97706' }} />,
        color: '#d97706',
        bgColor: '#fef3c7'
      };
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '40px',
        color: '#6b7280' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #059669',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ fontSize: '16px', margin: 0 }}>
            Cargando historial de checklists...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        backgroundColor: '#fef2f2', 
        border: '1px solid #fecaca', 
        borderRadius: '8px', 
        padding: '16px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#dc2626', fontSize: '16px', margin: '0 0 12px 0', fontWeight: '600' }}>
          ❌ Error cargando historial
        </p>
        <p style={{ color: '#7f1d1d', fontSize: '14px', margin: '0 0 16px 0' }}>
          {error}
        </p>
        <button
          onClick={loadHistory}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        color: '#6b7280' 
      }}>
        <Calendar style={{ 
          height: '48px', 
          width: '48px', 
          margin: '0 auto 16px', 
          color: '#d1d5db' 
        }} />
        <p style={{ fontSize: '18px', margin: '0 0 8px 0', fontWeight: '600' }}>
          No hay checklists anteriores
        </p>
        <p style={{ fontSize: '14px', margin: 0 }}>
          Este centro aún no tiene historial de checklists registrados
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
          Mostrando {history.length} registros más recientes
        </p>
      </div>

      <div style={{ 
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{ 
              backgroundColor: '#f9fafb',
              borderBottom: '2px solid #e5e7eb'
            }}>
              <th style={{ 
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: '600',
                color: '#374151'
              }}>
                Fecha
              </th>
              <th style={{ 
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: '600',
                color: '#374151'
              }}>
                Estado
              </th>
              <th style={{ 
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: '600',
                color: '#374151'
              }}>
                Completado por
              </th>
              <th style={{ 
                padding: '12px 16px',
                textAlign: 'center',
                fontWeight: '600',
                color: '#374151'
              }}>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => {
              const completion = getCompletionStatus(item);
              return (
                <tr 
                  key={item.id} 
                  style={{ 
                    borderBottom: index < history.length - 1 ? '1px solid #e5e7eb' : 'none',
                    backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb'
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div>
                      <div style={{ fontWeight: '500', color: '#111827' }}>
                        {formatDate(item.date)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Creado: {new Date(item.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: completion.bgColor,
                      color: completion.color
                    }}>
                      {completion.icon}
                      {completion.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#6b7280' }}>
                    {item.completed_by || '-'}
                    {item.completed_at && (
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {new Date(item.completed_at).toLocaleString('es-ES')}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        backgroundColor: 'white',
                        color: '#059669',
                        border: '1px solid #059669',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => {
                        console.log('👁️ Ver detalles del checklist:', item.id);
                        // Aquí se implementaría la vista de detalles
                        alert('Funcionalidad de detalles en desarrollo');
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#059669';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.color = '#059669';
                      }}
                    >
                      <Eye style={{ height: '14px', width: '14px' }} />
                      Ver detalles
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChecklistHistory;
