import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import QuarterlyReviewForm from '../logistics/QuarterlyReviewForm';
import { useSession } from '../../contexts/SessionContext';
import quarterlyInventoryService from '../../services/quarterlyInventoryService';
import { supabase } from '../../lib/supabase';

interface ManagerQuarterlyReviewProps {
  onBack: () => void;
}

const ManagerQuarterlyReview: React.FC<ManagerQuarterlyReviewProps> = ({ onBack }) => {
  const { employee } = useSession();
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [reviewData, setReviewData] = useState<any>(null);

  useEffect(() => {
    loadAssignment();
  }, [employee?.center_id]);

  const loadAssignment = async () => {
    if (!employee?.center_id) {
      console.log('⚠️ No hay center_id');
      setLoading(false);
      return;
    }

    console.log('🔍 Cargando asignación para centro:', employee.center_id);
    setLoading(true);

    const result = await quarterlyInventoryService.getAssignments(
      Number(employee.center_id),
      'pending'
    );

    console.log('📋 Resultado:', result);

    if (result.success && result.assignments && result.assignments.length > 0) {
      // Tomar la primera asignación activa
      const activeAssignment = result.assignments.find(
        (a: any) => a.review && a.review.status === 'active'
      );
      
      if (activeAssignment) {
        console.log('✅ Asignación activa encontrada:', activeAssignment);
        setAssignment(activeAssignment);
        
        // Cargar items del inventario para este centro
        await loadInventoryItems(activeAssignment);
      } else {
        console.log('⚠️ No hay asignaciones activas');
      }
    }

    setLoading(false);
  };

  const loadInventoryItems = async (assignment: any) => {
    console.log('📦 Cargando items del inventario para centro:', employee?.center_id);
    
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('center_id', Number(employee?.center_id));

    if (error) {
      console.error('❌ Error cargando items:', error);
      return;
    }

    console.log('✅ Items cargados:', items?.length || 0);

    // Preparar reviewData para el formulario
    const preparedReviewData = {
      id: assignment.review.id,
      quarter: assignment.review.quarter,
      year: assignment.review.year,
      center: assignment.center_name,
      reviewItems: items?.map((item: any) => ({
        id: item.id,
        name: item.nombre_item || item.codigo || 'Sin nombre',
        category: item.categoria || 'Sin categoría',
        system: item.cantidad_actual || 0,
        counted: 0,
        regular: 0,
        deteriorated: 0,
        obs: ''
      })) || []
    };

    console.log('📋 ReviewData preparado con', preparedReviewData.reviewItems.length, 'items');
    setReviewData(preparedReviewData);
  };

  const handleComplete = async () => {
    if (!assignment) return;

    const result = await quarterlyInventoryService.completeAssignment(
      assignment.id,
      employee?.email || ''
    );

    if (result.success) {
      alert('✅ Revisión completada y enviada a Beni para autorización');
      onBack();
    } else {
      alert('❌ Error al completar la revisión');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: '#6b7280' }}>Cargando revisión...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <AlertCircle size={48} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>
          No hay revisiones pendientes
        </h3>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          No tienes revisiones de inventario asignadas en este momento
        </p>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Volver a Gestión
        </button>
      </div>
    );
  }

  if (showForm && reviewData) {
    return (
      <div>
        <button
          onClick={() => setShowForm(false)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            marginBottom: '20px',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        <QuarterlyReviewForm
          onBack={() => setShowForm(false)}
          reviewData={reviewData}
        />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          marginBottom: '20px',
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151'
        }}
      >
        <ArrowLeft size={16} />
        Volver a mis gestiones
      </button>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        border: '1px solid #e5e7eb',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
          <Package size={32} color="#059669" />
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#111827' }}>
              Revisión de Inventario {assignment.review.quarter}
            </h2>
            <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>
              {assignment.center_name}
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Fecha límite</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                {new Date(assignment.review.deadline_date).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Total de productos</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                {assignment.review.total_items} items
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          border: '1px solid #fbbf24'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} color="#92400e" />
            <p style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
              <strong>Importante:</strong> Completa el conteo de todos los productos antes de la fecha límite.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle size={20} />
          Iniciar Conteo de Inventario
        </button>
      </div>
    </div>
  );
};

export default ManagerQuarterlyReview;
