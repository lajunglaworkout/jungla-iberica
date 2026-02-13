import React, { useMemo, useState, useEffect } from 'react';
import { Minus, Plus, Shirt, ShoppingBag, CheckCircle, Package } from 'lucide-react';
import { LocationType } from '../../types/logistics';
import { useInventory } from '../../hooks/useInventory';
import { supabase } from '../../lib/supabase';

type ReasonType = 'reposicion' | 'compra';

interface RequestLine {
  itemId: string;
  itemName: string;
  quantity: number;
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

const UniformRequestPanel: React.FC<UniformRequestPanelProps> = ({ userLocation, employeeName, onSubmit }) => {
  const { inventoryItems, loading, error } = useInventory();
  const [reason, setReason] = useState<ReasonType>('reposicion');
  const [selection, setSelection] = useState<RequestLine[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Filtrar artículos de vestuario y merchandising
  const uniformItems = useMemo(() => {
    const filtered = inventoryItems.filter(item => {
      const category = item.category?.toLowerCase() || '';
      const name = item.name?.toLowerCase() || '';

      return (
        category.includes('vestuario') ||
        category.includes('ropa') ||
        category.includes('merchandising') ||
        category.includes('textil') ||
        name.includes('camiseta') ||
        name.includes('pantalón') ||
        name.includes('pantalon') ||
        name.includes('zapato') ||
        name.includes('uniforme') ||
        name.includes('toalla') ||
        name.includes('botella') ||
        name.includes('polo') ||
        name.includes('sudadera')
      );
    });

    console.log('📦 Artículos de vestuario encontrados:', filtered.length);
    console.log('📋 Categorías disponibles:', [...new Set(inventoryItems.map(item => item.category))]);
    console.log('👕 Items de vestuario:', filtered.map(item => ({
      name: item.name,
      category: item.category,
      center: item.center,
      quantity: item.quantity
    })));

    return filtered;
  }, [inventoryItems]);

  // Obtener stock real por ubicación
  const getStockForLocation = (itemId: number, location: LocationType) => {
    const item = inventoryItems.find(i => i.id === itemId);
    if (!item) return 0;

    // El vestuario SIEMPRE se muestra desde la central, independientemente del centro del usuario
    // Todos los empleados pueden solicitar vestuario de la central
    return item.quantity || 0;
  };

  const updateQuantity = (itemId: string, itemName: string, delta: number) => {
    console.log('Updating quantity:', itemId, itemName, delta);
    setSelection(prev => {
      const existing = prev.find(line => line.itemId === itemId);
      if (!existing) {
        return delta > 0 ? [...prev, { itemId, itemName, quantity: 1 }] : prev;
      }

      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        return prev.filter(line => line.itemId !== itemId);
      }

      return prev.map(line => (line.itemId === itemId ? { ...line, quantity: newQty } : line));
    });
  };

  const totalItems = selection.reduce((acc, line) => acc + line.quantity, 0);
  console.log('Total items:', totalItems, 'Selection:', selection);

  const handleSubmit = async () => {
    if (!totalItems) {
      alert('Selecciona al menos una prenda.');
      return;
    }

    try {
      setSubmitting(true);

      // Guardar solicitud en Supabase
      const { data: requestData, error: requestError } = await supabase
        .from('uniform_requests')
        .insert({
          employee_name: employeeName || 'Empleado',
          location: userLocation,
          reason: reason,
          status: 'pending',
          requested_at: new Date().toISOString(),
          items: selection
        })
        .select()
        .single();

      if (requestError) {
        console.error('Error guardando solicitud:', requestError);
        alert('Error al enviar la solicitud. Por favor, inténtalo de nuevo.');
        return;
      }

      console.log('✅ Solicitud guardada:', requestData);

      // Llamar al callback si existe
      onSubmit?.({ reason, location: userLocation, items: selection });

      // Limpiar selección
      setSelection([]);

    } catch (error) {
      console.error('Error en handleSubmit:', error);
      alert('Error inesperado al enviar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        backgroundColor: 'white',
        borderRadius: '16px'
      }}>
        <Package size={48} color="#059669" style={{ marginBottom: '16px' }} />
        <p style={{ color: '#6b7280', fontSize: '16px' }}>Cargando inventario de vestuario...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '24px',
        backgroundColor: '#fef2f2',
        borderRadius: '12px',
        border: '1px solid #fecaca'
      }}>
        <p style={{ color: '#dc2626', margin: 0 }}>❌ Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:gap-5 pb-24 md:pb-0 relative">
      <header className="bg-gradient-to-br from-emerald-600 to-emerald-500 text-white p-5 md:p-7 rounded-2xl shadow-xl shadow-emerald-600/20">
        <div className="flex items-center gap-3 mb-3">
          <Shirt size={28} className="md:w-8 md:h-8" />
          <h1 className="text-xl md:text-2xl font-bold leading-tight">
            {employeeName ? `Vestuario para ${employeeName}` : 'Solicitud de Vestuario'}
          </h1>
        </div>
        <p className="text-sm md:text-base opacity-95 leading-relaxed">
          Selecciona las prendas y el motivo.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 md:gap-3">
          {REASONS.map(option => (
            <button
              key={option.id}
              onClick={() => setReason(option.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${reason === option.id
                  ? 'bg-white text-emerald-600 shadow-sm ring-2 ring-white/20'
                  : 'bg-white/10 text-white hover:bg-white/20'
                }`}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-3 md:gap-4">
        {uniformItems.length === 0 ? (
          <div className="bg-white p-8 rounded-xl text-center shadow-sm">
            <p className="text-gray-500">No hay artículos disponibles.</p>
          </div>
        ) : (
          uniformItems.map(item => {
            const currentSelection = selection.find(line => line.itemId === item.id.toString());
            const quantity = currentSelection?.quantity || 0;
            const availableStock = getStockForLocation(item.id, userLocation);
            const isOutOfStock = availableStock === 0;

            return (
              <div key={item.id} className={`bg-white rounded-xl p-4 border transition-all ${quantity > 0 ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-md' : 'border-gray-200'
                } ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}>

                <div className="flex justify-between items-start gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-base md:text-lg leading-tight mb-1">
                      {item.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 uppercase tracking-wide">
                        {item.category}
                      </span>
                      {item.size && (
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          Talla: {item.size}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-bold ${isOutOfStock ? 'text-red-500' : 'text-emerald-600'}`}>
                      {isOutOfStock ? 'AGOTADO' : `${availableStock} disp.`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <div className="text-sm text-gray-400 font-medium">
                    Cantidad
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id.toString(), item.name, -1)}
                      disabled={quantity === 0 || isOutOfStock}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${quantity === 0 ? 'bg-gray-100 text-gray-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                        }`}
                    >
                      <Minus size={20} />
                    </button>
                    <span className="w-8 text-center text-xl font-bold text-emerald-600">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id.toString(), item.name, 1)}
                      disabled={isOutOfStock || quantity >= availableStock}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isOutOfStock || quantity >= availableStock
                          ? 'bg-gray-100 text-gray-300'
                          : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 active:scale-95'
                        }`}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalItems > 0 && (
        <footer className="fixed bottom-4 left-4 right-4 md:static md:p-4 md:bg-white md:border md:border-gray-200 md:rounded-xl shadow-2xl md:shadow-none z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-3 transition-all ${submitting ? 'bg-gray-400' : 'bg-gray-900 hover:bg-black active:scale-[0.98]'
              }`}
          >
            {submitting ? (
              'Enviando...'
            ) : (
              <>
                <CheckCircle size={20} className="text-emerald-400" />
                <span className="text-lg">Pedir {totalItems} prendas</span>
              </>
            )}
          </button>
        </footer>
      )}
    </div>
  );
};

export default UniformRequestPanel;
