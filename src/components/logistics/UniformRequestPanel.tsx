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
    <div style={{ display: 'grid', gap: '20px' }}>
      <header style={{ 
        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', 
        padding: '28px', 
        borderRadius: '16px', 
        boxShadow: '0 10px 40px rgba(5, 150, 105, 0.2)',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Shirt size={32} />
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>
            {employeeName ? `Vestuario para ${employeeName}` : 'Solicitud de Vestuario'}
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: '15px', opacity: 0.95 }}>
          Selecciona las prendas que necesitas y el motivo de tu solicitud.
        </p>
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {REASONS.map(option => (
            <button
              key={option.id}
              onClick={() => {
                console.log('Clic en motivo:', option.id);
                setReason(option.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: `2px solid ${reason === option.id ? '#059669' : '#d1d5db'}`,
                backgroundColor: reason === option.id ? '#ecfdf5' : 'white',
                color: reason === option.id ? '#059669' : '#374151',
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <div style={{ display: 'grid', gap: '16px' }}>
        {uniformItems.length === 0 ? (
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <p>No hay artículos de vestuario disponibles en el inventario.</p>
          </div>
        ) : (
          uniformItems.map(item => {
            const currentSelection = selection.find(line => line.itemId === item.id.toString());
            const quantity = currentSelection?.quantity || 0;
            const availableStock = getStockForLocation(item.id, userLocation);
            const isOutOfStock = availableStock === 0;

            return (
              <div key={item.id} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: `2px solid ${quantity > 0 ? '#10b981' : '#e5e7eb'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s ease',
                opacity: isOutOfStock ? 0.6 : 1
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: '#111827' }}>
                    {item.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '13px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      backgroundColor: '#f0fdf4',
                      color: '#059669',
                      fontWeight: 500
                    }}>
                      {item.category}
                    </span>
                    {item.size && (
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>
                        Talla: {item.size}
                      </span>
                    )}
                  </div>
                  <p style={{ 
                    margin: '8px 0 0', 
                    color: isOutOfStock ? '#dc2626' : '#059669', 
                    fontSize: '14px',
                    fontWeight: 500
                  }}>
                    {isOutOfStock ? '❌ Sin stock' : `✅ Stock: ${availableStock} unidades`}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => updateQuantity(item.id.toString(), item.name, -1)}
                    disabled={quantity === 0 || isOutOfStock}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      border: '2px solid #e5e7eb',
                      background: (quantity === 0 || isOutOfStock) ? '#f9fafb' : 'white',
                      color: (quantity === 0 || isOutOfStock) ? '#9ca3af' : '#374151',
                      cursor: (quantity === 0 || isOutOfStock) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Minus size={18} />
                  </button>
                  <span style={{ 
                    minWidth: '32px', 
                    textAlign: 'center', 
                    fontSize: '20px', 
                    fontWeight: 700,
                    color: '#059669'
                  }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id.toString(), item.name, 1)}
                    disabled={isOutOfStock || quantity >= availableStock}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      border: '2px solid #059669',
                      background: (isOutOfStock || quantity >= availableStock) ? '#f9fafb' : '#059669',
                      color: (isOutOfStock || quantity >= availableStock) ? '#9ca3af' : 'white',
                      cursor: (isOutOfStock || quantity >= availableStock) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalItems > 0 && (
        <footer style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
              Total de prendas: {totalItems}
            </span>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              Motivo: {REASONS.find(r => r.id === reason)?.label}
            </span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '14px',
              background: submitting ? '#9ca3af' : '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <CheckCircle size={20} />
            {submitting ? 'Enviando solicitud...' : 'Enviar solicitud a Logística'}
          </button>
        </footer>
      )}
    </div>
  );
};

export default UniformRequestPanel;
