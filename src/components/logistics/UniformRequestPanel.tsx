import React, { useMemo, useState, useEffect } from 'react';
import { Minus, Plus, Shirt, ShoppingBag, CheckCircle, Package, AlertTriangle, Truck, Clock } from 'lucide-react';
import { LocationType } from '../../types/logistics';
import { useInventory } from '../../hooks/useInventory';
import { getEmployeeUniformAssignments, getUniformRequestsByEmployee, updateUniformRequestStatus, createUniformRequest, updateUniformRequest } from '../../services/hrService';
import { updateEmployeeById } from '../../services/userService';
import { useSession } from '../../contexts/SessionContext';
import { useIsMobile } from '../../hooks/useIsMobile';
import { ui } from '../../utils/ui';


type ReasonType = 'reposicion' | 'compra';
type RequestStatus = 'pending' | 'approved' | 'shipped' | 'awaiting_confirmation' | 'confirmed' | 'disputed' | 'rejected';

interface RequestLine {
  itemId: string;
  itemName: string;
  quantity: number;
  size?: string;
}

interface UniformRequestPanelProps {
  userLocation: LocationType;
  employeeName?: string;
  onSubmit?: (payload: { reason: ReasonType; location: LocationType; items: RequestLine[] }) => void;
}

const REASONS: { id: ReasonType; label: string; icon: React.ReactNode }[] = [
  { id: 'reposicion', label: 'Dotación por deterioro', icon: <Shirt size={16} /> },
  { id: 'compra', label: 'Compra puntual', icon: <ShoppingBag size={16} /> }
];

const PRENDAS_FIJAS = [
  { key: 'vestuario_chandal', label: 'Chándal Completo', icon: '🧥', inventoryName: 'CHÁNDAL', category: 'Vestuario' },
  { key: 'vestuario_sudadera_frio', label: 'Sudadera Frío', icon: '🧥', inventoryName: 'SUDADERA FRÍO', category: 'Vestuario' },
  { key: 'vestuario_chaleco_frio', label: 'Chaleco Frío', icon: '🦺', inventoryName: 'CHALECO FRÍO', category: 'Vestuario' },
  { key: 'vestuario_pantalon_corto', label: 'Pantalón Corto', icon: '🩳', inventoryName: 'PANTALÓN CORTO', category: 'Vestuario' },
  { key: 'vestuario_polo_verde', label: 'Polo Verde', icon: '👕', inventoryName: 'POLO VERDE', category: 'Vestuario' },
  { key: 'vestuario_camiseta_entrenamiento', label: 'Camiseta Entreno', icon: '💪', inventoryName: 'CAMISETA ENTRENAMIENTO PERSONAL', category: 'Vestuario' },
];

const UniformRequestPanel: React.FC<UniformRequestPanelProps> = ({ userLocation, employeeName, onSubmit }) => {
  const isMobile = useIsMobile();
  const { employee } = useSession();
  const { inventoryItems } = useInventory();
  const [activeTab, setActiveTab] = useState<'my-uniform' | 'requests'>('my-uniform');
  const [assignedItems, setAssignedItems] = useState<Record<string, number>>({});
  const [requests, setRequests] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  // Request Form State
  const [showRequestForm, setShowRequestForm] = useState<string | null>(null); // 'itemKey' or null
  const [reason, setReason] = useState<ReasonType>('reposicion');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Status Badge Helper
  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'pending': return { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente', icon: <Clock size={14} /> };
      case 'approved': return { color: 'bg-blue-100 text-blue-800', label: 'Aprobado', icon: <CheckCircle size={14} /> };
      case 'shipped': return { color: 'bg-purple-100 text-purple-800', label: 'Enviado', icon: <Truck size={14} /> };
      case 'awaiting_confirmation': return { color: 'bg-orange-100 text-orange-800', label: 'Confirmar Recepción', icon: <AlertTriangle size={14} /> };
      case 'confirmed': return { color: 'bg-emerald-100 text-emerald-800', label: 'Entregado', icon: <CheckCircle size={14} /> };
      case 'disputed': return { color: 'bg-red-100 text-red-800', label: 'Incidencia', icon: <AlertTriangle size={14} /> };
      case 'rejected': return { color: 'bg-gray-100 text-gray-800', label: 'Rechazado', icon: <AlertTriangle size={14} /> };
      default: return { color: 'bg-gray-100 text-gray-800', label: status, icon: <Clock size={14} /> };
    }
  };

  useEffect(() => {
    loadData();
  }, [employee?.id]);

  const loadData = async () => {
    if (!employee?.id) return;
    setLoading(true);
    try {
      // 1. Fetch assigned items
      const empData = await getEmployeeUniformAssignments(employee.id);
      setAssignedItems(empData);

      // 2. Fetch requests history
      const reqData = await getUniformRequestsByEmployee(employeeName);

      // Check for auto-transitions (shipped -> awaiting_confirmation)
      const now = new Date();
      const needsUpdate = reqData.filter((r: Record<string, unknown>) =>
        r.status === 'shipped' &&
        r.shipped_at &&
        (now.getTime() - new Date(r.shipped_at as string).getTime() > 3 * 24 * 60 * 60 * 1000)
      );

      if (needsUpdate.length > 0) {
        for (const req of needsUpdate) {
          await updateUniformRequestStatus((req as Record<string, unknown>).id as number, 'awaiting_confirmation');
        }
        const reloaded = await getUniformRequestsByEmployee(employeeName);
        setRequests(reloaded as any[]);
      } else {
        setRequests(reqData as any[]);
      }

    } catch (err) {
      console.error('Error loading uniform data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (prendaKey: string, inventoryName: string) => {
    if (!selectedSize) {
      ui.info('Por favor selecciona una talla');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        employee_name: employeeName,
        location: userLocation,
        reason: reason,
        status: 'pending',
        items: [{
          itemId: prendaKey, // We use the key to track which item type it is easily
          itemName: inventoryName,
          quantity: 1,
          size: selectedSize
        }],
        notes: notes,
        requested_at: new Date().toISOString()
      };

      const result = await createUniformRequest(payload);
      if (!result.success) throw new Error(result.error);

      ui.success('Solicitud enviada correctamente');
      setShowRequestForm(null);
      setNotes('');
      setSelectedSize('');
      loadData(); // Refresh
      setActiveTab('requests'); // Switch to requests tab
    } catch (err) {
      console.error('Error submitting request:', err);
      ui.error('Error al enviar la solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReceipt = async (requestId: number, items: Record<string, unknown>[]) => {
    if (!await ui.confirm('¿Confirmas que has recibido las prendas correctamente?')) return;

    try {
      // 1. Update request status
      const reqResult = await updateUniformRequest(requestId, { status: 'confirmed', confirmed_at: new Date().toISOString() });
      if (!reqResult.success) throw new Error(reqResult.error);

      // 2. Update employee assigned items
      // Map inventory names back to DB columns if possible, or just update based on what we know
      // In this specific flow, we know the item from the request.
      // Ideally requests should store the 'prendaKey' or we map it back.
      // Since we stored 'itemId' as 'prendaKey' in handleRequestSubmit (e.g., 'vestuario_chandal'), we can use it.

      const updateData: Record<string, unknown> = {};
      items.forEach((item) => {
        // item.itemId holds the key like 'vestuario_chandal'
        if (item.itemId && item.itemId.startsWith('vestuario_')) {
          updateData[item.itemId] = item.size;
        }
      });

      if (Object.keys(updateData).length > 0) {
        const empResult = await updateEmployeeById(employee?.id as number, updateData);
        if (!empResult.success) console.error('Error updating employee profile:', empResult.error);
      }

      ui.success('¡Gracias! Tu vestuario ha sido actualizado.');
      loadData();
    } catch (err) {
      console.error('Error confirming receipt:', err);
      ui.error('Error al confirmar recepción');
    }
  };

  const handleDispute = async (requestId: number) => {
    const reason = prompt('Por favor indica el problema (talla incorrecta, dañado, etc):');
    if (!reason) return;

    try {
      const disputeResult = await updateUniformRequest(requestId, { status: 'disputed', dispute_reason: reason });
      if (!disputeResult.success) throw new Error(disputeResult.error);
      ui.info('Incidencia reportada. Logística revisará tu caso.');
      loadData();
    } catch (err) {
      console.error('Error reporting dispute:', err);
      ui.error('Error al reportar incidencia');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando vestuario...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #059669, #047857)',
        borderRadius: isMobile ? '12px' : '16px',
        padding: isMobile ? '16px' : '24px',
        color: 'white',
        marginBottom: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '28px' }}>👕</span>
          <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: '700' }}>
            Mi Vestuario
          </h1>
        </div>
        <div className="flex flex-col gap-2">
          <p style={{ margin: 0, opacity: 0.9, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {employeeName} · {userLocation.charAt(0).toUpperCase() + userLocation.slice(1)}
          </p>
          <div className="flex bg-white/10 rounded-lg p-1 gap-1 w-fit">
            <button
              onClick={async () => setActiveTab('my-uniform')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${activeTab === 'my-uniform' ? 'bg-white text-emerald-700 shadow-sm' : 'text-white/80 hover:bg-white/10'}`}
            >
              Mis Prendas
            </button>
            <button
              onClick={async () => setActiveTab('requests')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${activeTab === 'requests' ? 'bg-white text-emerald-700 shadow-sm' : 'text-white/80 hover:bg-white/10'}`}
            >
              Solicitudes {requests.filter(r => r.status === 'pending' || r.status === 'awaiting_confirmation').length > 0 && <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{requests.filter(r => r.status === 'pending' || r.status === 'awaiting_confirmation').length}</span>}
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'my-uniform' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRENDAS_FIJAS.map(prenda => {
            const assignedSize = assignedItems[prenda.key];
            const isAssigned = assignedSize && assignedSize !== '';
            const isRequesting = showRequestForm === prenda.key;

            return (
              <div key={prenda.key} className={`bg-white rounded-xl border ${isAssigned ? 'border-emerald-200' : 'border-gray-200'} shadow-sm overflow-hidden transition-all hover:shadow-md`}>
                <div className="p-4 flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="text-2xl pt-1">{prenda.icon}</div>
                    <div>
                      <h3 className="font-bold text-gray-900">{prenda.label}</h3>
                      {isAssigned ? (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">Talla:</span>
                          <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{assignedSize}</span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 mt-1 italic">No asignado</div>
                      )}
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${isAssigned ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {isAssigned ? '✅ Asignado' : '⬜ Pendiente'}
                  </div>
                </div>

                {/* Request Area */}
                <div className="bg-gray-50 p-3 border-t border-gray-100">
                  {isRequesting ? (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex gap-2">
                        {REASONS.map(r => (
                          <button
                            key={r.id}
                            onClick={async () => setReason(r.id)}
                            className={`flex-1 py-1.5 px-2 rounded text-xs font-medium border ${reason === r.id ? 'bg-white border-emerald-500 text-emerald-700 shadow-sm' : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-200'}`}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={selectedSize}
                          onChange={async (e) => setSelectedSize(e.target.value)}
                          className="flex-1 rounded-lg border-gray-300 text-sm py-1.5"
                        >
                          <option value="">Seleccionar Talla</option>
                          {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input
                          type="text"
                          placeholder="Notas (opcional)..."
                          value={notes}
                          onChange={async (e) => setNotes(e.target.value)}
                          className="flex-[2] rounded-lg border-gray-300 text-sm py-1.5"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={async () => setShowRequestForm(null)}
                          className="flex-1 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={async () => handleRequestSubmit(prenda.key, prenda.inventoryName)}
                          disabled={submitting || !selectedSize}
                          className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
                        >
                          {submitting ? 'Enviando...' : 'Confirmar Solicitud'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={async () => {
                        setShowRequestForm(prenda.key);
                        setReason(isAssigned ? 'reposicion' : 'reposicion'); // Default logic?
                        setSelectedSize(isAssigned ? assignedSize : '');
                      }}
                      className={`w-full py-2 rounded-lg text-sm font-medium border flex items-center justify-center gap-2 transition-colors ${isAssigned
                          ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        }`}
                    >
                      {isAssigned ? (
                        <>🔄 Solicitar Reposición</>
                      ) : (
                        <>✨ Solicitar Prenda</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <Package size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No has realizado ninguna solicitud aún.</p>
              <button onClick={async () => setActiveTab('my-uniform')} className="mt-4 text-emerald-600 font-medium hover:underline">
                Ir a Mi Vestuario
              </button>
            </div>
          ) : (
            requests.map(req => {
              const statusInfo = getStatusBadge(req.status);
              const isActionable = req.status === 'shipped' || req.status === 'awaiting_confirmation';

              return (
                <div key={req.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${statusInfo.color}`}>
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(req.requested_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="space-y-3">
                      {req.items?.map((item: Record<string, unknown>, idx: number) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="bg-gray-100 p-1.5 rounded-md text-xl">🧥</div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{item.itemName}</p>
                              <p className="text-xs text-gray-500">Talla: {item.size} · Cantidad: {item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Banner */}
                    {isActionable && (
                      <div className="mt-4 bg-orange-50 border border-orange-100 rounded-lg p-3 animate-in zoom-in-95 duration-300">
                        <div className="flex gap-3 items-start">
                          <AlertTriangle className="text-orange-600 shrink-0 mt-0.5" size={18} />
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-orange-800">Confirmación Necesaria</h4>
                            <p className="text-xs text-orange-700 mt-1 mb-2">
                              ¿Has recibido este pedido correctamente? Tu confirmación actualizará tu inventario personal.
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={async () => handleConfirmReceipt(req.id, req.items)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg transition-colors shadow-sm"
                              >
                                ✅ Sí, todo correcto
                              </button>
                              <button
                                onClick={async () => handleDispute(req.id)}
                                className="px-3 bg-white border border-orange-200 text-orange-700 hover:bg-orange-100 text-xs font-medium py-2 rounded-lg transition-colors"
                              >
                                ❌ Reportar problema
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timeline / Details */}
                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                      <span>Solicitado: {new Date(req.requested_at).toLocaleDateString()}</span>
                      {req.shipped_at && <span>Enviado: {new Date(req.shipped_at).toLocaleDateString()}</span>}
                      {req.confirmed_at && <span className="text-emerald-600 font-medium">Entregado: {new Date(req.confirmed_at).toLocaleDateString()}</span>}
                      {req.dispute_reason && <span className="text-red-500 font-medium block w-full mt-1">Motivo incidencia: {req.dispute_reason}</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default UniformRequestPanel;
