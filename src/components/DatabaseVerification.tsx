// Componente temporal para verificar que las tablas se crearon correctamente
import React, { useState } from 'react';
import { CheckCircle, XCircle, Database, Play } from 'lucide-react';
import { supabase } from '../lib/supabase'; // NOTE: Database diagnostic tool - direct supabase access is appropriate here (generic table checks)

interface TableStatus {
  name: string;
  exists: boolean;
  count: number;
  error?: string;
}

const DatabaseVerification: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [results, setResults] = useState<TableStatus[]>([]);
  const [verificationComplete, setVerificationComplete] = useState(false);

  const verifyTables = async () => {
    setIsVerifying(true);
    setResults([]);
    setVerificationComplete(false);

    const tablesToCheck = [
      'shifts',
      'employee_shifts', 
      'time_records',
      'daily_attendance'
    ];

    const newResults: TableStatus[] = [];

    for (const tableName of tablesToCheck) {
      try {
        console.log(`🔍 Verificando tabla: ${tableName}`);
        
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          newResults.push({
            name: tableName,
            exists: false,
            count: 0,
            error: error.message
          });
          console.log(`❌ Error en tabla ${tableName}:`, error.message);
        } else {
          newResults.push({
            name: tableName,
            exists: true,
            count: count || 0
          });
          console.log(`✅ Tabla ${tableName} existe y tiene ${count || 0} registros`);
        }
      } catch (err: unknown) {
        newResults.push({
          name: tableName,
          exists: false,
          count: 0,
          error: err.message
        });
        console.log(`❌ Error verificando ${tableName}:`, err.message);
      }

      // Actualizar resultados en tiempo real
      setResults([...newResults]);
      
      // Pequeña pausa para ver el progreso
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setVerificationComplete(true);
    setIsVerifying(false);
  };

  const getStatusIcon = (tableStatus: TableStatus) => {
    if (tableStatus.exists) {
      return <CheckCircle size={20} color="#10b981" />;
    } else {
      return <XCircle size={20} color="#ef4444" />;
    }
  };

  const getStatusText = (tableStatus: TableStatus) => {
    if (tableStatus.exists) {
      return `✅ Existe (${tableStatus.count} registros)`;
    } else {
      return `❌ No existe o error`;
    }
  };

  const allTablesExist = results.length > 0 && results.every(r => r.exists);

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <Database size={32} color="#059669" />
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              Verificación de Base de Datos
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
              Comprueba que las tablas de turnos y fichajes se crearon correctamente
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={verifyTables}
            disabled={isVerifying}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: isVerifying ? '#9ca3af' : '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isVerifying ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            <Play size={16} />
            {isVerifying ? 'Verificando...' : 'Iniciar Verificación'}
          </button>
        </div>

        {results.length > 0 && (
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '12px 16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                Resultados de Verificación
              </h3>
            </div>
            
            {results.map((tableStatus, index) => (
              <div
                key={tableStatus.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  borderBottom: index < results.length - 1 ? '1px solid #e5e7eb' : 'none',
                  backgroundColor: tableStatus.exists ? '#f0fdf4' : '#fef2f2'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {getStatusIcon(tableStatus)}
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {tableStatus.name}
                    </div>
                    {tableStatus.error && (
                      <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '2px' }}>
                        Error: {tableStatus.error}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>
                  {getStatusText(tableStatus)}
                </div>
              </div>
            ))}
          </div>
        )}

        {verificationComplete && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: allTablesExist ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${allTablesExist ? '#10b981' : '#ef4444'}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              {allTablesExist ? (
                <CheckCircle size={20} color="#10b981" />
              ) : (
                <XCircle size={20} color="#ef4444" />
              )}
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                margin: 0,
                color: allTablesExist ? '#10b981' : '#ef4444'
              }}>
                {allTablesExist ? '✅ Verificación Exitosa' : '❌ Verificación Fallida'}
              </h4>
            </div>
            <p style={{
              fontSize: '14px',
              color: '#374151',
              margin: 0
            }}>
              {allTablesExist 
                ? 'Todas las tablas se crearon correctamente. El módulo de turnos está listo para usar.'
                : 'Algunas tablas no se pudieron crear. Revisa los errores y ejecuta nuevamente los scripts SQL.'
              }
            </p>
          </div>
        )}

        <div style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            📋 Tablas que se verifican:
          </h4>
          <ul style={{ fontSize: '14px', color: '#6b7280', margin: 0, paddingLeft: '20px' }}>
            <li><strong>shifts:</strong> Definición de turnos (horarios, días, centros)</li>
            <li><strong>employee_shifts:</strong> Asignaciones de empleados a turnos</li>
            <li><strong>time_records:</strong> Registros de fichajes (entrada/salida)</li>
            <li><strong>daily_attendance:</strong> Resumen diario de asistencia</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DatabaseVerification;
