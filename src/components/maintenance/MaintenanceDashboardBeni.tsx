import React, { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  Play,
  CheckCircle,
  Clock,
  AlertCircle,
  Building,
  Wrench
} from 'lucide-react';
import quarterlyMaintenanceService from '../../services/quarterlyMaintenanceService';
import { useSession } from '../../contexts/SessionContext';
import { supabase } from '../../lib/supabase';

interface MaintenanceDashboardBeniProps {
  onClose?: () => void;
}

const MaintenanceDashboardBeni: React.FC<MaintenanceDashboardBeniProps> = ({ onClose }) => {
  const { employee } = useSession();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReviewDetails, setSelectedReviewDetails] = useState<any>(null);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [kpiData, setKpiData] = useState<any>(null);
  const [loadingKpis, setLoadingKpis] = useState(false);

  useEffect(() => {
    loadReviews();
    loadKpis();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      console.log('📋 Cargando revisiones de mantenimiento...');

      // Obtener todas las revisiones
      const { data: reviews, error } = await supabase
        .from('quarterly_maintenance_reviews')
        .select('*')
        .order('created_date', { ascending: false });

      if (error) throw error;

      console.log('✅ Revisiones obtenidas:', reviews?.length || 0);

      // Obtener asignaciones para cada revisión
      const reviewsWithAssignments = await Promise.all(
        (reviews || []).map(async (review) => {
          const { data: assignments, error: assignError } = await supabase
            .from('quarterly_maintenance_assignments')
            .select('*')
            .eq('review_id', review.id);

          if (assignError) {
            console.error('❌ Error cargando asignaciones:', assignError);
            return { ...review, assignments: [] };
          }

          return {
            ...review,
            assignments: assignments || []
          };
        })
      );

      setReviews(reviewsWithAssignments);
      console.log('✅ Revisiones con asignaciones cargadas:', reviewsWithAssignments?.length);
    } catch (error) {
      console.error('❌ Error cargando revisiones de mantenimiento:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentQuarter = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let quarter = '';
    if (month >= 1 && month <= 3) quarter = 'Q1';
    else if (month >= 4 && month <= 6) quarter = 'Q2';
    else if (month >= 7 && month <= 9) quarter = 'Q3';
    else quarter = 'Q4';

    return { quarter: `${quarter}-${year}`, year };
  };

  const handleCreateReview = async () => {
    if (!deadlineDate) {
      alert('⚠️ Por favor establece una fecha límite');
      return;
    }

    setLoading(true);
    console.log('🔧 Convocando revisión trimestral de mantenimiento...');

    const centers = [
      { id: 9, name: 'Sevilla' },
      { id: 10, name: 'Jerez' },
      { id: 11, name: 'Puerto' }
    ];

    const { quarter, year } = getCurrentQuarter();

    const result = await quarterlyMaintenanceService.createReview({
      quarter,
      year,
      deadline_date: deadlineDate,
      created_by: employee?.email || 'beni.jungla@gmail.com',
      centers
    });

    if (result.success && result.review) {
      // Crear asignaciones automáticamente
      const encargadosEmails: Record<number, string> = {
        9: 'francisco.sevilla@lajungla.com',
        10: 'ivan.jerez@lajungla.com',
        11: 'adrian.puerto@lajungla.com'
      };

      console.log('📋 Creando asignaciones para revisión:', result.review.id);

      // Crear asignaciones sin activar aún
      for (const center of centers) {
        const encargadoEmail = encargadosEmails[center.id];

        const { error } = await supabase
          .from('quarterly_maintenance_assignments')
          .insert({
            review_id: result.review.id,
            center_id: center.id,
            center_name: center.name,
            assigned_to: encargadoEmail,
            status: 'pending'
          });

        if (error) {
          console.error('❌ Error creando asignación:', error);
        } else {
          console.log(`✅ Asignación creada para ${center.name}`);
        }
      }

      alert(`✅ Revisión Trimestral de Mantenimiento ${quarter} convocada\n\n` +
        `Se han creado revisiones para:\n` +
        centers.map(c => `🏪 ${c.name}: Mantenimiento completo`).join('\n') +
        `\n\n⏰ Fecha límite: ${new Date(deadlineDate).toLocaleDateString('es-ES')}\n\n` +
        `📌 Ahora debes ACTIVAR cada revisión para notificar a los encargados.`);
      setShowCreateModal(false);
      setDeadlineDate('');
      loadReviews();
    } else {
      alert('❌ Error convocando revisión de mantenimiento');
    }

    setLoading(false);
  };

  const handleActivateReview = async (reviewId: number) => {
    const confirm = window.confirm('¿Activar esta revisión y notificar a los encargados de los centros?');
    if (!confirm) return;

    setLoading(true);
    console.log('🚀 Activando revisión:', reviewId);

    try {
      // 1. Actualizar status de la revisión a 'active'
      const { error: reviewError } = await supabase
        .from('quarterly_maintenance_reviews')
        .update({
          status: 'active',
          activated_at: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (reviewError) throw reviewError;
      console.log('✅ Revisión actualizada a activa');

      // 2. Actualizar asignaciones a 'in_progress' y enviar notificaciones
      const { data: assignments, error: assignmentsError } = await supabase
        .from('quarterly_maintenance_assignments')
        .select('*')
        .eq('review_id', reviewId);

      if (assignmentsError) throw assignmentsError;

      // 3. Actualizar cada asignación y enviar notificación
      for (const assignment of assignments || []) {
        // Actualizar asignación
        await supabase
          .from('quarterly_maintenance_assignments')
          .update({ status: 'in_progress' })
          .eq('id', assignment.id);

        // Enviar notificación
        if (assignment.assigned_to) {
          await supabase
            .from('notifications') // Corregido: tabla unificada
            .insert({
              recipient_email: assignment.assigned_to,
              type: 'review_assigned',
              title: 'Gestión de Mantenimiento',
              message: `Nueva revisión trimestral de mantenimiento asignada: ${assignment.center_name}. Fecha límite: ${new Date().toLocaleDateString('es-ES')}`,
              reference_type: 'quarterly_maintenance_review',
              reference_id: reviewId.toString(),
              is_read: false
            });
          console.log(`📧 Notificación enviada a ${assignment.assigned_to}`);
        }
      }

      alert('✅ Revisión activada y notificaciones enviadas a los encargados');
      loadReviews();
    } catch (error) {
      console.error('❌ Error activando la revisión:', error);
      alert('❌ Error activando la revisión');
    }

    setLoading(false);
  };

  // Cargar KPIs permanentes
  const loadKpis = async () => {
    setLoadingKpis(true);
    try {
      console.log('📊 Cargando KPIs de mantenimiento...');

      // Obtener todas las revisiones completadas con sus items
      const { data: reviews, error: reviewsError } = await supabase
        .from('quarterly_maintenance_reviews')
        .select(`
          *,
          assignments:quarterly_maintenance_assignments(*)
        `)
        .order('created_date', { ascending: false });

      if (reviewsError) {
        console.error('❌ Error cargando revisiones para KPIs:', reviewsError);
        setLoadingKpis(false);
        return;
      }

      const completedReviews = reviews?.filter(review =>
        review.assignments?.some((assignment: any) => assignment.status === 'completed')
      ) || [];

      if (completedReviews.length === 0) {
        setKpiData({
          hasData: false,
          message: 'No hay datos de revisiones completadas'
        });
        setLoadingKpis(false);
        return;
      }

      const kpiSummary: any = {
        hasData: true,
        totalReviews: completedReviews.length,
        centers: [],
        overallStats: {
          totalItems: 0,
          itemsOk: 0,
          itemsRegular: 0,
          itemsBad: 0,
          criticalTasks: 0,
          completedCenters: 0
        },
        criticalIssues: [],
        trends: {
          lastMonth: 0,
          improvement: 0
        }
      };

      // Procesar cada revisión completada
      for (const review of completedReviews) {
        const completedAssignments = review.assignments.filter((a: any) => a.status === 'completed');
        kpiSummary.overallStats.completedCenters += completedAssignments.length;

        for (const assignment of completedAssignments) {
          // Obtener items de la revisión
          const { data: items, error } = await supabase
            .from('quarterly_maintenance_items')
            .select('*')
            .eq('assignment_id', assignment.id);

          if (error) {
            console.error('❌ Error cargando items para KPIs:', error);
            continue;
          }

          const centerStats = {
            centerName: assignment.center_name,
            assignedTo: assignment.assigned_to,
            completedDate: assignment.updated_at,
            totalItems: items?.length || 0,
            itemsOk: items?.filter(item => item.status === 'bien').length || 0,
            itemsRegular: items?.filter(item => item.status === 'regular').length || 0,
            itemsBad: items?.filter(item => item.status === 'mal').length || 0,
            criticalItems: items?.filter(item => item.is_critical).length || 0,
            score: 0
          };

          // Calcular score del centro
          const totalItems = centerStats.totalItems;
          centerStats.score = totalItems > 0 ?
            Math.round(((centerStats.itemsOk * 100) + (centerStats.itemsRegular * 60) + (centerStats.itemsBad * 20)) / totalItems) : 0;

          kpiSummary.centers.push(centerStats);

          // Actualizar estadísticas generales
          kpiSummary.overallStats.totalItems += centerStats.totalItems;
          kpiSummary.overallStats.itemsOk += centerStats.itemsOk;
          kpiSummary.overallStats.itemsRegular += centerStats.itemsRegular;
          kpiSummary.overallStats.itemsBad += centerStats.itemsBad;
          kpiSummary.overallStats.criticalTasks += centerStats.criticalItems;

          // Identificar issues críticos (solo los 3 más importantes)
          const criticalItems = items?.filter(item => item.status === 'mal').slice(0, 3) || [];
          criticalItems.forEach(item => {
            kpiSummary.criticalIssues.push({
              center: assignment.center_name,
              zone: item.zone_name,
              concept: item.concept_name,
              priority: item.task_priority || 'media'
            });
          });
        }
      }

      // Calcular score general
      const totalItems = kpiSummary.overallStats.totalItems;
      kpiSummary.overallScore = totalItems > 0 ?
        Math.round(((kpiSummary.overallStats.itemsOk * 100) +
          (kpiSummary.overallStats.itemsRegular * 60) +
          (kpiSummary.overallStats.itemsBad * 20)) / totalItems) : 0;

      // Calcular tendencias (simulado por ahora)
      kpiSummary.trends.improvement = kpiSummary.overallScore > 75 ? 5 : -2;

      setKpiData(kpiSummary);
      console.log('✅ KPIs cargados:', kpiSummary);
    } catch (error) {
      console.error('❌ Error cargando KPIs:', error);
      setKpiData({
        hasData: false,
        message: 'Error cargando datos'
      });
    }

    setLoadingKpis(false);
  };

  // Ver detalles de una revisión
  const handleViewDetails = async (reviewId: number) => {
    try {
      console.log('👁️ Cargando detalles de revisión:', reviewId);

      // Obtener los items de la revisión
      const { data: items, error } = await supabase
        .from('quarterly_maintenance_items')
        .select('*')
        .eq('assignment_id', reviewId);

      if (error) {
        console.error('❌ Error cargando items:', error);
        alert('❌ Error cargando los detalles de la revisión');
        return;
      }

      // Encontrar la revisión completa
      const review = reviews.find(r => r.id === reviewId);

      setSelectedReviewDetails({
        ...review,
        items: items || []
      });
      setShowDetailsModal(true);

      console.log('✅ Detalles cargados:', items?.length || 0, 'items');
    } catch (error) {
      console.error('❌ Error cargando detalles:', error);
      alert('❌ Error cargando los detalles');
    }
  };

  // Generar reportes automáticos
  const handleGenerateReports = async () => {
    try {
      console.log('📊 Generando reportes de mantenimiento...');
      setLoading(true);

      // Obtener todas las revisiones completadas con sus items
      const completedReviews = reviews.filter(review =>
        review.assignments?.some((assignment: any) => assignment.status === 'completed')
      );

      if (completedReviews.length === 0) {
        alert('ℹ️ No hay revisiones completadas para generar reportes');
        setLoading(false);
        return;
      }

      const reportSummary: any = {
        totalReviews: completedReviews.length,
        centers: [],
        overallStats: {
          totalItems: 0,
          itemsOk: 0,
          itemsRegular: 0,
          itemsBad: 0,
          criticalTasks: 0,
          highPriorityTasks: 0
        },
        criticalIssues: [],
        recommendations: []
      };

      // Procesar cada revisión completada
      for (const review of completedReviews) {
        const completedAssignments = review.assignments.filter((a: any) => a.status === 'completed');

        for (const assignment of completedAssignments) {
          // Obtener items de la revisión
          const { data: items, error } = await supabase
            .from('quarterly_maintenance_items')
            .select('*')
            .eq('assignment_id', assignment.id);

          if (error) {
            console.error('❌ Error cargando items para reporte:', error);
            continue;
          }

          const centerStats = {
            centerName: assignment.center_name,
            assignedTo: assignment.assigned_to,
            completedDate: assignment.updated_at,
            totalItems: items?.length || 0,
            itemsOk: items?.filter(item => item.status === 'bien').length || 0,
            itemsRegular: items?.filter(item => item.status === 'regular').length || 0,
            itemsBad: items?.filter(item => item.status === 'mal').length || 0,
            criticalItems: items?.filter(item => item.is_critical).length || 0,
            tasksGenerated: items?.filter(item => item.task_to_perform).length || 0,
            highPriorityTasks: items?.filter(item => item.task_priority === 'alta').length || 0,
            items: items || []
          };

          // Calcular score del centro
          const totalItems = centerStats.totalItems;
          centerStats.score = totalItems > 0 ?
            Math.round(((centerStats.itemsOk * 100) + (centerStats.itemsRegular * 60) + (centerStats.itemsBad * 20)) / totalItems) : 0;

          reportSummary.centers.push(centerStats);

          // Actualizar estadísticas generales
          reportSummary.overallStats.totalItems += centerStats.totalItems;
          reportSummary.overallStats.itemsOk += centerStats.itemsOk;
          reportSummary.overallStats.itemsRegular += centerStats.itemsRegular;
          reportSummary.overallStats.itemsBad += centerStats.itemsBad;
          reportSummary.overallStats.criticalTasks += centerStats.criticalItems;
          reportSummary.overallStats.highPriorityTasks += centerStats.highPriorityTasks;

          // Identificar issues críticos
          const criticalItems = items?.filter(item => item.status === 'mal') || [];
          criticalItems.forEach(item => {
            reportSummary.criticalIssues.push({
              center: assignment.center_name,
              zone: item.zone_name,
              concept: item.concept_name,
              observations: item.observations,
              task: item.task_to_perform,
              priority: item.task_priority
            });
          });
        }
      }

      // Generar recomendaciones automáticas
      const totalItems = reportSummary.overallStats.totalItems;
      const overallScore = totalItems > 0 ?
        Math.round(((reportSummary.overallStats.itemsOk * 100) +
          (reportSummary.overallStats.itemsRegular * 60) +
          (reportSummary.overallStats.itemsBad * 20)) / totalItems) : 0;

      reportSummary.overallScore = overallScore;

      if (overallScore < 70) {
        reportSummary.recommendations.push('🚨 Score general bajo. Requiere atención inmediata en mantenimiento preventivo.');
      }
      if (reportSummary.overallStats.criticalTasks > 5) {
        reportSummary.recommendations.push('⚠️ Alto número de tareas críticas. Priorizar reparaciones urgentes.');
      }
      if (reportSummary.overallStats.itemsBad > reportSummary.overallStats.itemsOk * 0.2) {
        reportSummary.recommendations.push('🔧 Más del 20% de items en mal estado. Revisar plan de mantenimiento.');
      }

      // Identificar mejor y peor centro
      if (reportSummary.centers.length > 1) {
        const bestCenter = reportSummary.centers.reduce((best: any, center: any) =>
          center.score > best.score ? center : best
        );
        const worstCenter = reportSummary.centers.reduce((worst: any, center: any) =>
          center.score < worst.score ? center : worst
        );

        reportSummary.bestCenter = bestCenter;
        reportSummary.worstCenter = worstCenter;
      }

      setReportData(reportSummary);
      setShowReportsModal(true);

      console.log('✅ Reporte generado:', reportSummary);
    } catch (error) {
      console.error('❌ Error generando reportes:', error);
      alert('❌ Error generando los reportes');
    }

    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'active': return '#3b82f6';
      case 'in_progress': return '#3b82f6';
      case 'pending': return '#6b7280';
      case 'draft': return '#6b7280';
      case 'overdue': return '#ef4444';
      default: return '#ef4444';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={20} />;
      case 'active': return <Clock size={20} />;
      case 'in_progress': return <Clock size={20} />;
      case 'pending': return <AlertCircle size={20} />;
      case 'draft': return <AlertCircle size={20} />;
      case 'overdue': return <AlertCircle size={20} />;
      default: return <AlertCircle size={20} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'active': return 'Activa';
      case 'pending': return 'Pendiente';
      case 'draft': return 'Borrador';
      case 'in_progress': return 'En Progreso';
      case 'overdue': return 'Vencida';
      default: return status || 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            animation: 'spin 1s linear infinite'
          }}>🔧</div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Cargando revisiones de mantenimiento...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              backgroundColor: '#f59e0b',
              borderRadius: '8px',
              padding: '8px',
              color: 'white'
            }}>
              <Wrench size={24} />
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              Dashboard de Mantenimiento - KPIs Ejecutivos
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={loadKpis}
              disabled={loadingKpis}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loadingKpis ? 'not-allowed' : 'pointer',
                opacity: loadingKpis ? 0.7 : 1
              }}
            >
              <Building size={16} />
              {loadingKpis ? 'Actualizando...' : 'Actualizar KPIs'}
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              Crear Nueva Revisión
            </button>
          </div>
        </div>

        <p style={{ color: '#6b7280', margin: 0 }}>
          Dashboard ejecutivo con KPIs en tiempo real y gestión de revisiones trimestrales
        </p>
      </div>

      {/* KPIs Permanentes - SECCIÓN PRINCIPAL */}
      {kpiData && kpiData.hasData && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📊 KPIs de Mantenimiento en Tiempo Real
            {loadingKpis && (
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'normal' }}>
                (Actualizando...)
              </span>
            )}
            {!loadingKpis && (
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 'normal' }}>
                • Actualizado {new Date().toLocaleTimeString('es-ES')}
              </span>
            )}
          </h2>

          {/* Métricas Principales */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              backgroundColor: '#f0f9ff',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              border: '2px solid #bfdbfe'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#1e40af', fontSize: '14px' }}>Score General</h3>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: kpiData.overallScore >= 80 ? '#10b981' :
                  kpiData.overallScore >= 60 ? '#f59e0b' : '#ef4444'
              }}>
                {kpiData.overallScore}%
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                {kpiData.trends.improvement > 0 ? '📈' : '📉'} {Math.abs(kpiData.trends.improvement)}% vs anterior
              </div>
            </div>

            <div style={{
              backgroundColor: '#f0fdf4',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#166534', fontSize: '14px' }}>Items OK</h3>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
                {kpiData.overallStats.itemsOk}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                de {kpiData.overallStats.totalItems} total
              </div>
            </div>

            <div style={{
              backgroundColor: '#fef3c7',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#92400e', fontSize: '14px' }}>Items Regulares</h3>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>
                {kpiData.overallStats.itemsRegular}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Requieren atención
              </div>
            </div>

            <div style={{
              backgroundColor: '#fef2f2',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#991b1b', fontSize: '14px' }}>Items Críticos</h3>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>
                {kpiData.overallStats.itemsBad}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Acción inmediata
              </div>
            </div>

            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#374151', fontSize: '14px' }}>Centros Completados</h3>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#6b7280' }}>
                {kpiData.overallStats.completedCenters}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                En esta revisión
              </div>
            </div>
          </div>

          {/* Ranking de Centros */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '12px', color: '#374151', fontSize: '16px' }}>🏆 Ranking por Centro</h3>
            <div style={{ display: 'grid', gap: '8px' }}>
              {kpiData.centers
                .sort((a: any, b: any) => b.score - a.score)
                .slice(0, 3)
                .map((center: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      backgroundColor: index === 0 ? '#f0fdf4' : '#f9fafb',
                      borderRadius: '6px',
                      border: index === 0 ? '1px solid #bbf7d0' : '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>
                        {center.centerName}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>
                        {center.itemsOk}✅ {center.itemsRegular}⚠️ {center.itemsBad}❌
                      </span>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: center.score >= 80 ? '#10b981' :
                          center.score >= 60 ? '#f59e0b' : '#ef4444'
                      }}>
                        {center.score}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Issues Críticos */}
          {kpiData.criticalIssues.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '12px', color: '#dc2626', fontSize: '16px' }}>🚨 Issues Críticos Activos</h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {kpiData.criticalIssues.slice(0, 3).map((issue: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      padding: '12px',
                      fontSize: '14px'
                    }}
                  >
                    <strong>{issue.center}</strong> - {issue.zone}: {issue.concept}
                    <span style={{
                      marginLeft: '8px',
                      padding: '2px 6px',
                      backgroundColor: issue.priority === 'alta' ? '#dc2626' : '#f59e0b',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>
                      {issue.priority?.toUpperCase()}
                    </span>
                  </div>
                ))}
                {kpiData.criticalIssues.length > 3 && (
                  <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', margin: '8px 0 0 0' }}>
                    ... y {kpiData.criticalIssues.length - 3} issues más
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dashboard KPIs - Estado inicial */}
      {kpiData && !kpiData.hasData && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '48px 24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '16px'
          }}>
            📊
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '12px'
          }}>
            Dashboard de KPIs de Mantenimiento
          </h2>
          <div style={{ color: '#6b7280', fontSize: '16px', marginBottom: '8px' }}>
            {kpiData.message}
          </div>
          <p style={{ color: '#9ca3af', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
            Una vez que los encargados completen las revisiones trimestrales, aquí verás métricas en tiempo real,
            rankings por centro, issues críticos y tendencias de rendimiento.
          </p>
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
              💡 <strong>Próximos KPIs disponibles:</strong> Score General, Ranking de Centros, Issues Críticos, Tendencias
            </p>
          </div>
        </div>
      )}

      {/* Gestión de Revisiones */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🔧 Gestión de Revisiones Trimestrales
        </h2>
        {reviews.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#6b7280'
          }}>
            <Wrench size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              No hay revisiones de mantenimiento
            </h3>
            <p style={{ marginBottom: '24px' }}>
              Convoca la primera revisión trimestral de mantenimiento para comenzar
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Convocar Revisión {getCurrentQuarter().quarter}
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {reviews.flatMap((review) =>
              review.assignments && review.assignments.length > 0
                ? review.assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '20px',
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#1f2937',
                          margin: '0 0 8px 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <Building size={20} />
                          {assignment.center_name} - {review.quarter}
                        </h3>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          fontSize: '14px',
                          color: '#6b7280'
                        }}>
                          <span>📋 {review.total_zones || 9} zonas</span>
                          <span>🔧 {review.total_concepts || 30} conceptos</span>
                          <span>📅 Fecha límite: {review.deadline_date || 'Sin definir'}</span>
                          <span>👤 Encargado: {assignment.assigned_to || 'Sin asignar'}</span>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: getStatusColor(assignment.status)
                      }}>
                        {getStatusIcon(assignment.status)}
                        <span style={{ fontWeight: '600' }}>
                          {getStatusText(assignment.status)}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginTop: '16px'
                    }}>
                      <button
                        onClick={() => handleViewDetails(assignment.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={14} />
                        Ver Detalles
                      </button>

                      {review.status === 'draft' && (
                        <button
                          onClick={() => handleActivateReview(review.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          <Play size={14} />
                          Activar y Notificar
                        </button>
                      )}
                    </div>
                  </div>
                ))
                : (
                  <div
                    key={review.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '20px',
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#1f2937',
                          margin: '0 0 8px 0'
                        }}>
                          {review.quarter} - {review.total_centers} centros
                        </h3>
                        <p style={{ color: '#6b7280', margin: 0 }}>
                          Revisión sin asignaciones aún
                        </p>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: getStatusColor(review.status)
                      }}>
                        {getStatusIcon(review.status)}
                        <span style={{ fontWeight: '600' }}>
                          {getStatusText(review.status)}
                        </span>
                      </div>
                    </div>

                    {review.status === 'draft' && (
                      <button
                        onClick={() => handleActivateReview(review.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          marginTop: '16px'
                        }}
                      >
                        <Play size={14} />
                        Activar y Notificar
                      </button>
                    )}
                  </div>
                )
            )}
          </div>
        )}
      </div>

      {/* Modal de Creación */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Wrench size={24} style={{ color: '#f59e0b' }} />
                Convocar Revisión {getCurrentQuarter().quarter}
              </h2>

              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  fontSize: '24px'
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Se creará una revisión trimestral de mantenimiento para todos los centros
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Fecha límite
              </label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                margin: '0 0 8px 0'
              }}>
                Centros incluidos:
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280' }}>
                <li>🏪 Sevilla - Mantenimiento completo</li>
                <li>🏪 Jerez - Mantenimiento completo</li>
                <li>🏪 Puerto - Mantenimiento completo</li>
              </ul>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>

              <button
                onClick={handleCreateReview}
                disabled={!deadlineDate || loading}
                style={{
                  padding: '12px 20px',
                  backgroundColor: deadlineDate ? '#10b981' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: deadlineDate ? 'pointer' : 'not-allowed'
                }}
              >
                {loading ? 'Creando...' : 'Crear Revisión'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      {showDetailsModal && selectedReviewDetails && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflow: 'auto',
            width: '90%'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0
              }}>
                📋 Detalles de Revisión - {selectedReviewDetails.center_name}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <strong>Estado:</strong> {selectedReviewDetails.status}
              </div>
              <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <strong>Encargado:</strong> {selectedReviewDetails.assigned_to}
              </div>
              <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <strong>Items:</strong> {selectedReviewDetails.items?.length || 0}
              </div>
            </div>

            {selectedReviewDetails.items && selectedReviewDetails.items.length > 0 ? (
              <div>
                <h4 style={{ marginBottom: '16px', color: '#374151' }}>Items de Inspección:</h4>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {selectedReviewDetails.items.map((item: any, index: number) => (
                    <div
                      key={index}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '12px',
                        backgroundColor: item.status === 'mal' ? '#fef2f2' :
                          item.status === 'regular' ? '#fef3c7' : '#f0f9ff'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start'
                      }}>
                        <div>
                          <strong>{item.zone_name}</strong> - {item.concept_name}
                          {item.observations && (
                            <p style={{ margin: '4px 0', fontSize: '14px', color: '#6b7280' }}>
                              📝 {item.observations}
                            </p>
                          )}
                          {item.task_to_perform && (
                            <p style={{ margin: '4px 0', fontSize: '14px', color: '#dc2626' }}>
                              🔧 Tarea: {item.task_to_perform} (Prioridad: {item.task_priority})
                            </p>
                          )}
                        </div>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: item.status === 'bien' ? '#10b981' :
                            item.status === 'regular' ? '#f59e0b' : '#ef4444',
                          color: 'white'
                        }}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#6b7280' }}>
                No hay items de inspección disponibles
              </p>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '20px'
            }}>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reportes */}
      {showReportsModal && reportData && (
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
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflow: 'auto',
            width: '95%'
          }}>
            {/* Header del Reporte */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '16px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0
              }}>
                📊 Reporte de Mantenimiento Trimestral
              </h2>
              <button
                onClick={() => setShowReportsModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            {/* Resumen Ejecutivo */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                backgroundColor: '#f0f9ff',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#1e40af' }}>Score General</h3>
                <div style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: reportData.overallScore >= 80 ? '#10b981' :
                    reportData.overallScore >= 60 ? '#f59e0b' : '#ef4444'
                }}>
                  {reportData.overallScore}%
                </div>
              </div>

              <div style={{
                backgroundColor: '#f0fdf4',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#166534' }}>Items OK</h3>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                  {reportData.overallStats.itemsOk}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  de {reportData.overallStats.totalItems} total
                </div>
              </div>

              <div style={{
                backgroundColor: '#fef3c7',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#92400e' }}>Items Regulares</h3>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {reportData.overallStats.itemsRegular}
                </div>
              </div>

              <div style={{
                backgroundColor: '#fef2f2',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#991b1b' }}>Items Críticos</h3>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                  {reportData.overallStats.itemsBad}
                </div>
              </div>
            </div>

            {/* Comparativa por Centros */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: '#374151' }}>📍 Rendimiento por Centro</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {reportData.centers.map((center: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: center === reportData.bestCenter ? '#f0fdf4' :
                        center === reportData.worstCenter ? '#fef2f2' : '#f9fafb'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                          🏪 {center.centerName}
                          {center === reportData.bestCenter && ' 🏆'}
                          {center === reportData.worstCenter && ' ⚠️'}
                        </h4>
                        <p style={{ margin: '0', fontSize: '14px', color: '#6b7280' }}>
                          Encargado: {center.assignedTo}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: 'bold',
                          color: center.score >= 80 ? '#10b981' :
                            center.score >= 60 ? '#f59e0b' : '#ef4444'
                        }}>
                          {center.score}%
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          {center.itemsOk}✅ {center.itemsRegular}⚠️ {center.itemsBad}❌
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues Críticos */}
            {reportData.criticalIssues.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px', color: '#dc2626' }}>🚨 Issues Críticos</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {reportData.criticalIssues.slice(0, 5).map((issue: any, index: number) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        padding: '12px'
                      }}
                    >
                      <strong>{issue.center}</strong> - {issue.zone}: {issue.concept}
                      {issue.observations && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
                          {issue.observations}
                        </p>
                      )}
                    </div>
                  ))}
                  {reportData.criticalIssues.length > 5 && (
                    <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                      ... y {reportData.criticalIssues.length - 5} issues más
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Recomendaciones */}
            {reportData.recommendations.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ marginBottom: '16px', color: '#374151' }}>💡 Recomendaciones</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {reportData.recommendations.map((recommendation: string, index: number) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '6px',
                        padding: '12px',
                        fontSize: '14px'
                      }}
                    >
                      {recommendation}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botones de Acción */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '24px',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Reporte generado el {new Date().toLocaleDateString('es-ES')}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowReportsModal(false)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Cerrar
                </button>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Imprimir/PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceDashboardBeni;
