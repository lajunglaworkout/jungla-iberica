// src/components/maintenance/MaintenanceDashboardBeni.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Building } from 'lucide-react';
import { Wrench } from 'lucide-react';
import quarterlyMaintenanceService from '../../services/quarterlyMaintenanceService';
import { useSession } from '../../contexts/SessionContext';
import { ui } from '../../utils/ui';

import {
  MaintenanceAssignment, MaintenanceReview, KpiSummary, ReportSummary, getCurrentQuarter,
} from './beni/MaintenanceBeniTypes';
import { MaintenanceBeniKpiPanel } from './beni/MaintenanceBeniKpiPanel';
import { MaintenanceBeniReviewsSection } from './beni/MaintenanceBeniReviewsSection';
import { MaintenanceBeniCreateModal } from './beni/MaintenanceBeniCreateModal';
import { MaintenanceBeniDetailsModal } from './beni/MaintenanceBeniDetailsModal';
import { MaintenanceBeniReportsModal } from './beni/MaintenanceBeniReportsModal';

interface MaintenanceDashboardBeniProps {
  onClose?: () => void;
}

const MaintenanceDashboardBeni: React.FC<MaintenanceDashboardBeniProps> = () => {
  const { employee } = useSession();
  const [reviews, setReviews] = useState<MaintenanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReviewDetails, setSelectedReviewDetails] = useState<MaintenanceReview | null>(null);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [reportData, setReportData] = useState<ReportSummary | null>(null);
  const [kpiData, setKpiData] = useState<KpiSummary | null>(null);
  const [loadingKpis, setLoadingKpis] = useState(false);

  useEffect(() => {
    loadReviews();
    loadKpis();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const reviewsWithAssignments = await quarterlyMaintenanceService.getReviewsWithAssignments();
      setReviews(reviewsWithAssignments as MaintenanceReview[]);
    } catch (error) {
      console.error('Error cargando revisiones de mantenimiento:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = async () => {
    if (!deadlineDate) { ui.warning('Por favor establece una fecha límite'); return; }

    setLoading(true);
    const centers = [{ id: 9, name: 'Sevilla' }, { id: 10, name: 'Jerez' }, { id: 11, name: 'Puerto' }];
    const { quarter, year } = getCurrentQuarter();

    const result = await quarterlyMaintenanceService.createReview({
      quarter, year, deadline_date: deadlineDate,
      created_by: employee?.email || 'beni.jungla@gmail.com', centers,
    });

    if (result.success && result.review) {
      const encargadosEmails = await quarterlyMaintenanceService.getCenterManagerEmails();
      await quarterlyMaintenanceService.activateNewReview(result.review.id, centers, encargadosEmails, deadlineDate);

      ui.success(`✅ Revisión Trimestral ${quarter} convocada y activada`);
      setShowCreateModal(false);
      setDeadlineDate('');
      loadReviews();
    } else {
      ui.error('Error convocando revisión de mantenimiento');
    }
    setLoading(false);
  };

  const handleActivateReview = async (reviewId: number) => {
    const confirm = await ui.confirm('¿Activar esta revisión y notificar a los encargados?');
    if (!confirm) return;

    setLoading(true);
    try {
      await quarterlyMaintenanceService.activateExistingReview(reviewId);
      ui.success('Revisión activada y notificaciones enviadas');
      loadReviews();
    } catch (error) {
      console.error('Error activando la revisión:', error);
      ui.error('Error activando la revisión');
    }
    setLoading(false);
  };

  const loadKpis = async () => {
    setLoadingKpis(true);
    try {
      const reviewsData = await quarterlyMaintenanceService.getReviewsWithAssignmentsJoined();
      if (!reviewsData.length) { setLoadingKpis(false); return; }

      const completedReviews = reviewsData.filter((review: Record<string, unknown>) =>
        (review.assignments as MaintenanceAssignment[])?.some((a: MaintenanceAssignment) => a.status === 'completed')
      ) || [];

      if (completedReviews.length === 0) {
        setKpiData({ hasData: false, message: 'No hay datos de revisiones completadas' });
        setLoadingKpis(false);
        return;
      }

      const kpiSummary: KpiSummary = {
        hasData: true, totalReviews: completedReviews.length, centers: [],
        overallStats: { totalItems: 0, itemsOk: 0, itemsRegular: 0, itemsBad: 0, criticalTasks: 0, completedCenters: 0 },
        criticalIssues: [], trends: { improvement: 0 },
      };

      for (const review of completedReviews) {
        const completedAssignments = review.assignments.filter((a: MaintenanceAssignment) => a.status === 'completed');
        kpiSummary.overallStats!.completedCenters += completedAssignments.length;

        for (const assignment of completedAssignments) {
          const items = await quarterlyMaintenanceService.getMaintenanceItemsByAssignmentId(assignment.id);

          const centerStats = {
            centerName: assignment.center_name, assignedTo: assignment.assigned_to,
            totalItems: items?.length || 0,
            itemsOk: items?.filter(i => i.status === 'bien').length || 0,
            itemsRegular: items?.filter(i => i.status === 'regular').length || 0,
            itemsBad: items?.filter(i => i.status === 'mal').length || 0,
            score: 0,
          };
          const total = centerStats.totalItems;
          centerStats.score = total > 0 ? Math.round(((centerStats.itemsOk * 100) + (centerStats.itemsRegular * 60) + (centerStats.itemsBad * 20)) / total) : 0;
          kpiSummary.centers!.push(centerStats);

          kpiSummary.overallStats!.totalItems += centerStats.totalItems;
          kpiSummary.overallStats!.itemsOk += centerStats.itemsOk;
          kpiSummary.overallStats!.itemsRegular += centerStats.itemsRegular;
          kpiSummary.overallStats!.itemsBad += centerStats.itemsBad;

          items?.filter(i => i.status === 'mal').slice(0, 3).forEach(item => {
            kpiSummary.criticalIssues!.push({ center: assignment.center_name, zone: item.zone_name, concept: item.concept_name, priority: item.task_priority || 'media' });
          });
        }
      }

      const total = kpiSummary.overallStats!.totalItems;
      kpiSummary.overallScore = total > 0 ? Math.round(((kpiSummary.overallStats!.itemsOk * 100) + (kpiSummary.overallStats!.itemsRegular * 60) + (kpiSummary.overallStats!.itemsBad * 20)) / total) : 0;
      kpiSummary.trends!.improvement = (kpiSummary.overallScore ?? 0) > 75 ? 5 : -2;
      setKpiData(kpiSummary);
    } catch (error) {
      console.error('Error cargando KPIs:', error);
      setKpiData({ hasData: false, message: 'Error cargando datos' });
    }
    setLoadingKpis(false);
  };

  const handleViewDetails = async (assignmentId: number) => {
    try {
      const items = await quarterlyMaintenanceService.getMaintenanceItemsByAssignmentId(assignmentId);

      const review = reviews.find(r => r.id === assignmentId);
      setSelectedReviewDetails({ ...review, items } as MaintenanceReview);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error cargando detalles:', error);
      ui.error('Error cargando los detalles');
    }
  };

  const handleGenerateReports = async () => {
    setLoading(true);
    try {
      const completedReviews = reviews.filter(r => r.assignments?.some((a: MaintenanceAssignment) => a.status === 'completed'));
      if (completedReviews.length === 0) { ui.success('No hay revisiones completadas para generar reportes'); setLoading(false); return; }

      const report: ReportSummary = {
        centers: [], overallStats: { totalItems: 0, itemsOk: 0, itemsRegular: 0, itemsBad: 0 },
        criticalIssues: [], recommendations: [],
      };

      for (const review of completedReviews) {
        for (const assignment of review.assignments!.filter((a: MaintenanceAssignment) => a.status === 'completed')) {
          const items = await quarterlyMaintenanceService.getMaintenanceItemsByAssignmentId(assignment.id);

          const cs = {
            centerName: assignment.center_name, assignedTo: assignment.assigned_to,
            totalItems: items?.length || 0,
            itemsOk: items?.filter(i => i.status === 'bien').length || 0,
            itemsRegular: items?.filter(i => i.status === 'regular').length || 0,
            itemsBad: items?.filter(i => i.status === 'mal').length || 0,
            score: 0,
          };
          const total = cs.totalItems;
          cs.score = total > 0 ? Math.round(((cs.itemsOk * 100) + (cs.itemsRegular * 60) + (cs.itemsBad * 20)) / total) : 0;
          report.centers!.push(cs);
          report.overallStats!.totalItems += cs.totalItems;
          report.overallStats!.itemsOk += cs.itemsOk;
          report.overallStats!.itemsRegular += cs.itemsRegular;
          report.overallStats!.itemsBad += cs.itemsBad;

          items?.filter(i => i.status === 'mal').forEach(i => {
            report.criticalIssues!.push({ center: assignment.center_name, zone: i.zone_name, concept: i.concept_name, observations: i.observations });
          });
        }
      }

      const total = report.overallStats!.totalItems;
      report.overallScore = total > 0 ? Math.round(((report.overallStats!.itemsOk * 100) + (report.overallStats!.itemsRegular * 60) + (report.overallStats!.itemsBad * 20)) / total) : 0;

      if ((report.overallScore ?? 0) < 70) report.recommendations!.push('🚨 Score general bajo. Requiere atención inmediata en mantenimiento preventivo.');
      if ((report.criticalIssues?.length ?? 0) > 5) report.recommendations!.push('⚠️ Alto número de tareas críticas. Priorizar reparaciones urgentes.');

      if (report.centers!.length > 1) {
        report.bestCenter = report.centers!.reduce((b, c) => (c.score ?? 0) > (b.score ?? 0) ? c : b);
        report.worstCenter = report.centers!.reduce((w, c) => (c.score ?? 0) < (w.score ?? 0) ? c : w);
      }

      setReportData(report);
      setShowReportsModal(true);
    } catch (error) {
      console.error('Error generando reportes:', error);
      ui.error('Error generando los reportes');
    }
    setLoading(false);
  };

  const { quarter: currentQuarterLabel } = getCurrentQuarter();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔧</div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Cargando revisiones de mantenimiento...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)', padding: '1.5rem 2rem', borderRadius: '0 0 20px 20px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Wrench size={28} style={{ color: 'white' }} />
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'white', margin: 0 }}>Centro de Mantenimiento</h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', margin: '2px 0 0 0', fontSize: '0.875rem' }}>
                KPIs ejecutivos · Revisiones trimestrales · Histórico
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={loadKpis} disabled={loadingKpis}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: '500', cursor: loadingKpis ? 'not-allowed' : 'pointer', opacity: loadingKpis ? 0.7 : 1 }}
            >
              <Building size={15} />
              {loadingKpis ? 'Actualizando...' : 'Actualizar KPIs'}
            </button>
            <button
              onClick={handleGenerateReports}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}
            >
              📊 Generar Reporte
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'white', color: '#b45309', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            >
              <Plus size={15} /> Nueva Revisión
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 2rem 2rem' }}>
        {kpiData && <MaintenanceBeniKpiPanel kpiData={kpiData} loadingKpis={loadingKpis} />}

        <MaintenanceBeniReviewsSection
          reviews={reviews}
          currentQuarter={currentQuarterLabel}
          onCreateReview={() => setShowCreateModal(true)}
          onViewDetails={handleViewDetails}
          onActivateReview={handleActivateReview}
        />
      </div>

      {showCreateModal && (
        <MaintenanceBeniCreateModal
          currentQuarter={currentQuarterLabel}
          deadlineDate={deadlineDate}
          loading={loading}
          onDeadlineDateChange={setDeadlineDate}
          onClose={() => setShowCreateModal(false)}
          onConfirm={handleCreateReview}
        />
      )}

      {showDetailsModal && selectedReviewDetails && (
        <MaintenanceBeniDetailsModal
          review={selectedReviewDetails}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {showReportsModal && reportData && (
        <MaintenanceBeniReportsModal
          reportData={reportData}
          onClose={() => setShowReportsModal(false)}
        />
      )}
    </div>
  );
};

export default MaintenanceDashboardBeni;
