import { useState, useEffect } from 'react';
import { clientsService, ClientCancellationMetrics } from '../../services/clientsService';

interface CancellationAnalysisProps {
  centerId: string;
  mes: number;
  año: number;
  totalBajas: number;
  onMetricsChange: (metrics: ClientCancellationMetrics) => void;
}

const CancellationAnalysis: React.FC<CancellationAnalysisProps> = ({ 
  centerId, 
  mes, 
  año,
  totalBajas,
  onMetricsChange 
}) => {
  const [metrics, setMetrics] = useState<ClientCancellationMetrics>({
    center_id: centerId,
    mes,
    año,
    total_bajas: totalBajas,
    baja_1_mes: 0,
    baja_3_meses: 0,
    baja_6_meses: 0,
    baja_1_año: 0,
    baja_mas_1_año: 0,
    motivo_precio: 0,
    motivo_servicio: 0,
    motivo_ubicacion: 0,
    motivo_otro: 0
  });

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await clientsService.getCancellationMetrics(
          centerId,
          mes,
          año
        );
        // Asegurarse de que el total de bajas siempre esté sincronizado
        const updatedMetrics = {
          ...data,
          total_bajas: totalBajas,
          center_id: centerId,
          mes,
          año
        };
        setMetrics(updatedMetrics);
        onMetricsChange(updatedMetrics);
      } catch (error) {
        console.error('Error loading cancellation metrics:', error);
      }
    };

    loadMetrics();
  }, [centerId, mes, año, totalBajas, onMetricsChange]);
  
  // Manejar cambios en los campos de tiempo
  const handleTimeChange = (field: keyof ClientCancellationMetrics, value: number) => {
    const newValue = Math.max(0, value);
    const newMetrics = {
      ...metrics,
      [field]: newValue
    };
    
    // Calcular el nuevo total sumando los campos de tiempo
    const tiempoFields = ['baja_1_mes', 'baja_3_meses', 'baja_6_meses', 'baja_1_año', 'baja_mas_1_año'];
    const newTotal = tiempoFields.reduce((sum, key) => {
      return sum + (newMetrics[key as keyof ClientCancellationMetrics] as number || 0);
    }, 0);
    
    // Actualizar el total
    newMetrics.total_bajas = newTotal;
    
    setMetrics(newMetrics);
    onMetricsChange(newMetrics);
  };

  const [loading, setLoading] = useState(false);
  
  // Guardar los cambios
  const handleSave = async () => {
    setLoading(true);
    try {
      await clientsService.saveCancellationMetrics(metrics);
      // No mostramos alerta para una mejor experiencia de usuario
    } catch (error) {
      console.error('Error guardando métricas de bajas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular total de bajas ingresadas en los tiempos
  const totalIngresado = [
    metrics.baja_1_mes,
    metrics.baja_3_meses,
    metrics.baja_6_meses,
    metrics.baja_1_año,
    metrics.baja_mas_1_año
  ].reduce((sum, val) => sum + (val || 0), 0);

  // Determinar si hay diferencia entre el total y la suma de los tiempos
  const hasDifference = totalIngresado !== metrics.total_bajas;
  const difference = Math.abs(metrics.total_bajas - totalIngresado);

  // Estilos en línea
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
      padding: '12px 0 0 0',
      backgroundColor: 'transparent',
      width: '100%'
    },
    timeGrid: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '10px',
      marginTop: '8px',
      width: '100%'
    },
    timeCard: {
      backgroundColor: 'white',
      padding: '10px 12px',
      borderRadius: '6px',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      textAlign: 'center' as const,
      flex: '1',
      minWidth: '80px',
      border: '1px solid #e5e7eb'
    },
    timeLabel: {
      fontSize: '11px',
      color: '#6b7280',
      marginBottom: '6px',
      fontWeight: '500'
    },
    timeInput: {
      width: '100%',
      padding: '4px 6px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      textAlign: 'center' as const,
      fontSize: '13px',
      backgroundColor: '#f9fafb'
    },
    remaining: {
      fontSize: '11px',
      color: '#6b7280',
      marginTop: '4px',
      minHeight: '16px',
      textAlign: 'center' as const,
      width: '100%'
    },
    saveButton: {
      marginTop: '8px',
      padding: '4px 8px',
      fontSize: '11px',
      backgroundColor: '#10B981',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      opacity: loading ? 0.7 : 1,
      pointerEvents: (loading ? 'none' : 'auto') as React.CSSProperties['pointerEvents'],
      alignSelf: 'center',
      width: 'auto',
      minWidth: '120px'
    }
  };


  // Usar un efecto para sincronizar el total de bajas cuando cambia desde el padre
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      total_bajas: totalBajas
    }));
  }, [totalBajas]);

  return (
    <div style={styles.container}>
      {/* Distribución por Tiempo */}
      <div style={styles.timeGrid}>
        {[
          { key: 'baja_1_mes', label: '1 mes' },
          { key: 'baja_3_meses', label: '2-3 meses' },
          { key: 'baja_6_meses', label: '4-6 meses' },
          { key: 'baja_1_año', label: '7-12 meses' },
          { key: 'baja_mas_1_año', label: '>1 año' }
        ].map(({ key, label }) => (
          <div key={key} style={styles.timeCard}>
            <div style={styles.timeLabel}>{label}</div>
            <input
              type="number"
              min="0"
              value={metrics[key as keyof ClientCancellationMetrics] as number}
              onChange={(e) => 
                handleTimeChange(
                  key as keyof ClientCancellationMetrics, 
                  parseInt(e.target.value) || 0
                )
              }
              style={styles.timeInput}
              disabled={loading || !metrics.total_bajas}
            />
          </div>
        ))}
      </div>

      {/* Mostrar diferencia si la hay */}
      {metrics.total_bajas > 0 && (
        <div style={styles.remaining}>
          {hasDifference ? (
            <span style={{ color: '#EF4444', fontWeight: '500' }}>
              {totalIngresado < metrics.total_bajas 
                ? `Faltan ${difference} bajas por distribuir`
                : `Sobran ${difference} bajas`}
            </span>
          ) : (
            <span style={{ color: '#10B981', fontWeight: '500' }}>✓ Distribución correcta</span>
          )}
        </div>
      )}

      {/* Botón de guardar - solo visible si hay cambios */}
      {hasDifference && (
        <button 
          onClick={handleSave} 
          disabled={loading}
          style={styles.saveButton}
        >
          {loading ? 'Guardando...' : 'Guardar distribución'}
        </button>
      )}
    </div>
  );
};

export default CancellationAnalysis;
