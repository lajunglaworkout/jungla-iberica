import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, User, Truck, AlertTriangle, Clock, Filter, ChevronDown, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSession } from '../../contexts/SessionContext';

interface UniformRequest {
  id: number;
  employee_name: string;
  location: string;
  reason: string;
  status: 'pending' | 'approved' | 'shipped' | 'awaiting_confirmation' | 'confirmed' | 'disputed' | 'rejected';
  items: any[];
  requested_at: string;
  shipped_at?: string;
  confirmed_at?: string;
  dispute_reason?: string;
  notes?: string;
}

const UniformRequestsPanel: React.FC = () => {
  const { employee } = useSession();
  const [requests, setRequests] = useState<UniformRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('pending'); // pending, approved, shipped, problem, history
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('uniform_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (!error && data) {
        setRequests(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string, additionalData: any = {}) => {
    try {
      const { data: request } = await supabase
        .from('uniform_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (!request) return;

      const updatePayload = {
        status,
        ...additionalData
      };

      // 1. Update Request
      await supabase
        .from('uniform_requests')
        .update(updatePayload)
        .eq('id', id);

      // 2. If Approving, deduct stock
      if (status === 'approved' && request.status === 'pending') {
        if (request.items) {
          for (const item of request.items) {
            // Map employee field names to Inventory Item Names
            const ITEM_MAPPINGS: Record<string, string> = {
              'vestuario_chandal': 'CHÁNDAL',
              'vestuario_sudadera': 'SUDADERA FRÍO',
              'vestuario_chaleco': 'CHALECO FRÍO',
              'vestuario_pantalon': 'PANTALÓN CORTO',
              'vestuario_polo': 'POLO VERDE',
              'vestuario_camiseta': 'CAMISETA ENTRENAMIENTO PERSONAL'
            };

            const inventoryName = ITEM_MAPPINGS[item.itemId] || item.itemName;

            const { data: invItem } = await supabase
              .from('inventory_items')
              .select('id, cantidad_actual')
              .eq('name', inventoryName)
              .eq('size', item.size) // Also match size!
              .single();

            if (invItem) {
              const newQty = Math.max(0, invItem.cantidad_actual - item.quantity);
              await supabase
                .from('inventory_items')
                .update({ cantidad_actual: newQty })
                .eq('id', invItem.id);
            } else {
              console.warn(`No inventory item found for ${inventoryName} size ${item.size}`);
            }
          }
        }
      }

      // 3. If Resolving Dispute (Back to Shipped or Confirmed?)
      // Usually resolved means either Reship (new request?) or just close it.
      // references user request: "Benito must resolve".

      await loadRequests();
      // alert('Estado actualizado');
    } catch (error) {
      console.error(error);
      alert('Error actualizando estado');
    }
  };

  const handleMarkAsShipped = async (id: number) => {
    await updateStatus(id, 'shipped', {
      shipped_at: new Date().toISOString(),
      shipped_by: employee?.name || 'Logística'
    });
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch =
      req.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'pending') return req.status === 'pending';
    if (filterStatus === 'approved') return req.status === 'approved';
    if (filterStatus === 'shipped') return req.status === 'shipped' || req.status === 'awaiting_confirmation';
    if (filterStatus === 'problem') return req.status === 'disputed';
    if (filterStatus === 'history') return req.status === 'confirmed' || req.status === 'rejected';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12} /> Pendiente</span>;
      case 'approved': return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Aprobado</span>;
      case 'shipped': return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold flex items-center gap-1"><Truck size={12} /> Enviado</span>;
      case 'awaiting_confirmation': return <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12} /> Esperando Conf.</span>;
      case 'confirmed': return <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12} /> Entregado</span>;
      case 'disputed': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold flex items-center gap-1"><AlertTriangle size={12} /> Incidencia</span>;
      case 'rejected': return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold flex items-center gap-1"><XCircle size={12} /> Rechazado</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
          <Package className="text-emerald-600" />
          <h2 className="text-xl font-bold text-gray-800">Panel de Vestuario</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {['pending', 'approved', 'shipped', 'problem', 'history'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterStatus === status
                ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-500 ring-offset-1'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {status === 'pending' && '🟡 Pendientes'}
              {status === 'approved' && '🔵 Aprobados'}
              {status === 'shipped' && '🟣 Envíos'}
              {status === 'problem' && '🔴 Incidencias'}
              {status === 'history' && '⚫ Historial'}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar por empleado o centro..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Cargando solicitudes...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">No hay solicitudes en esta sección.</p>
          </div>
        ) : (
          filteredRequests.map(req => (
            <div key={req.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 border-b border-gray-50 flex justify-between items-start bg-gray-50/50">
                <div className="flex items-start gap-3">
                  <div className="bg-white p-2 rounded-lg border border-gray-100">
                    <User size={20} className="text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{req.employee_name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {req.location} · {new Date(req.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>{getStatusBadge(req.status)}</div>
              </div>

              <div className="p-4 grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Artículos Solicitados</h4>
                  <div className="space-y-2">
                    {req.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="text-sm font-medium text-gray-700">{item.itemName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-white px-1.5 py-0.5 rounded border border-gray-200">Talla: {item.size}</span>
                          <span className="text-xs font-bold text-emerald-600">x{item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {req.notes && (
                    <p className="mt-3 text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-100">
                      📝 <span className="font-medium">Nota:</span> {req.notes}
                    </p>
                  )}
                  {req.reason && (
                    <p className="mt-1 text-xs text-gray-400">Motivo: {req.reason === 'reposicion' ? 'Reposición' : 'Compra'}</p>
                  )}
                </div>

                <div className="flex flex-col justify-center items-end gap-2 border-l border-gray-50 pl-4">
                  {/* ACCIONES */}
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(req.id, 'approved', { approved_at: new Date().toISOString() })}
                        className="w-full py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 shadow-sm flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} /> Aprobar Solicitud
                      </button>
                      <button
                        onClick={() => updateStatus(req.id, 'rejected')}
                        className="w-full py-2 bg-white border border-red-200 text-red-600 rounded-lg font-medium text-sm hover:bg-red-50 flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} /> Rechazar
                      </button>
                    </>
                  )}

                  {req.status === 'approved' && (
                    <button
                      onClick={() => handleMarkAsShipped(req.id)}
                      className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700 shadow-sm flex items-center justify-center gap-2"
                    >
                      <Truck size={16} /> Marcar como Enviado
                    </button>
                  )}

                  {req.status === 'disputed' && (
                    <div className="w-full">
                      <p className="text-sm text-red-600 mb-2 font-medium">🚨 Incidencia: {req.dispute_reason}</p>
                      <button
                        onClick={() => updateStatus(req.id, 'shipped')} // Reset to shipped to try again? Or 'approved'?
                        className="w-full py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-50"
                      >
                        Re-abrir Envío
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UniformRequestsPanel;
