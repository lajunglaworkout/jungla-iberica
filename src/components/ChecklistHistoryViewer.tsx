import React, { useState, useEffect } from 'react';
import { checklistHistoryService, ChecklistHistory } from '../services/checklistHistoryService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  centerId: string;
  centerName: string;
  onClose: () => void;
}

const ChecklistHistoryViewer: React.FC<Props> = ({ centerId, centerName, onClose }) => {
  const [history, setHistory] = useState<ChecklistHistory[]>([]);
  const [selected, setSelected] = useState<ChecklistHistory | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const data = await checklistHistoryService.getChecklistHistory(centerId, 30);
      const statsData = await checklistHistoryService.getCompletionStats(centerId, 7);
      setHistory(data);
      setStats(statsData);
    };
    load();
  }, [centerId]);

  const getPercentage = (c: ChecklistHistory) => {
    const all = [...(c.apertura_tasks || []), ...(c.limpieza_tasks || []), ...(c.cierre_tasks || [])];
    const done = all.filter((t: any) => t.completada);
    return all.length > 0 ? Math.round((done.length / all.length) * 100) : 0;
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', maxWidth: '1200px', width: '100%', maxHeight: '90vh', overflow: 'auto', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2>📊 Historial - {centerName}</h2>
          <button onClick={onClose} style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cerrar</button>
        </div>

        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#16a34a', marginBottom: '4px' }}>Cumplimiento</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#16a34a' }}>{stats.completionRate.toFixed(0)}%</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#1e40af', marginBottom: '4px' }}>Días Completados</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e40af' }}>{stats.completedDays}/{stats.totalDays}</div>
            </div>
            <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: '#b45309', marginBottom: '4px' }}>Promedio Tareas</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#b45309' }}>{stats.averageTasks.toFixed(0)}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
          {history.map((item) => {
            const pct = getPercentage(item);
            return (
              <div key={item.id} style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px', cursor: 'pointer' }} onClick={() => setSelected(item)}>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>{format(new Date(item.date), 'dd MMM yyyy', { locale: es })}</div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct === 100 ? '#22c55e' : '#3b82f6' }} />
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{pct}% completado</div>
              </div>
            );
          })}
        </div>

        {selected && (
          <div style={{ marginTop: '24px', padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
            <h3 style={{ marginBottom: '16px' }}>{format(new Date(selected.date), 'dd MMMM yyyy', { locale: es })}</h3>
            <div><strong>Apertura:</strong> {selected.apertura_tasks?.filter((t: any) => t.completada).length}/{selected.apertura_tasks?.length}</div>
            <div><strong>Limpieza:</strong> {selected.limpieza_tasks?.filter((t: any) => t.completada).length}/{selected.limpieza_tasks?.length}</div>
            <div><strong>Cierre:</strong> {selected.cierre_tasks?.filter((t: any) => t.completada).length}/{selected.cierre_tasks?.length}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChecklistHistoryViewer;
