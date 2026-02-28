import React from 'react';
import { Plus } from 'lucide-react';
import { Order, Supplier, LogisticsUser } from './types';
import { ui } from '../../utils/ui';

// ==================== ORDER DETAIL MODAL ====================

interface OrderDetailModalProps {
  show: boolean;
  selectedOrder: Order | null;
  currentUser: LogisticsUser;
  onClose: () => void;
  onProcess: (orderId: string) => void;
  onShip: (orderId: string) => void;
  onShowCancel: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  show, selectedOrder, currentUser, onClose, onProcess, onShip, onShowCancel
}) => {
  if (!show || !selectedOrder) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
        <h2 style={{ margin: '0 0 1.5rem 0' }}>📋 {selectedOrder.id}</h2>

        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          <div><strong>Tipo:</strong> {selectedOrder.type === 'center_to_brand' ? '📥 Centro → Marca' : '📤 Marca → Proveedor'}</div>
          <div><strong>De:</strong> {selectedOrder.from} → <strong>Para:</strong> {selectedOrder.to}</div>
          <div><strong>Creado por:</strong> {selectedOrder.created_by}</div>
          <div><strong>Fecha:</strong> {new Date(selectedOrder.date).toLocaleDateString('es-ES')}</div>
          <div><strong>Entrega:</strong> {new Date(selectedOrder.estimated_delivery).toLocaleDateString('es-ES')}</div>
          <div><strong>Estado:</strong> {
            selectedOrder.status === 'delivered' ? '✅ Entregado' :
              selectedOrder.status === 'sent' ? '🚚 Enviado' :
                selectedOrder.status === 'processing' ? '🔄 En Proceso' :
                  selectedOrder.status === 'pending' ? '⏳ Pendiente' :
                    selectedOrder.status === 'cancelled' ? '❌ Cancelado' : '❓ Desconocido'
          }</div>
          <div><strong>Importe:</strong> €{selectedOrder.amount.toFixed(2)}</div>
        </div>

        <h3>📦 Artículos ({selectedOrder.items.length})</h3>
        {selectedOrder.items.map((item, index) => (
          <div key={index} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '0.5rem' }}>
            <div><strong>{item.product_name}</strong></div>
            <div>Cantidad: {item.quantity} | Precio: €{item.unit_price.toFixed(2)} | Total: €{item.total_price.toFixed(2)}</div>
            <div style={{ color: item.has_sufficient_stock ? '#059669' : '#dc2626' }}>
              Stock disponible: {item.available_stock} {item.has_sufficient_stock ? '✅' : '❌ Insuficiente'}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          {selectedOrder.status === 'pending' && currentUser.role === 'logistics_director' && (
            <button onClick={() => { onProcess(selectedOrder.id); onClose(); }}
              style={{ padding: '0.75rem 1.5rem', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              🔄 Poner en Proceso
            </button>
          )}
          {selectedOrder.status === 'processing' && currentUser.role === 'logistics_director' && (
            <button onClick={() => { onShip(selectedOrder.id); onClose(); }}
              style={{ padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              🚚 Pedido Enviado
            </button>
          )}
          {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && currentUser.role === 'logistics_director' && (
            <button onClick={onShowCancel}
              style={{ padding: '0.75rem 1.5rem', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              ❌ Cancelar Pedido
            </button>
          )}
          <button onClick={onClose}
            style={{ padding: '0.75rem 1.5rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== CANCEL ORDER MODAL ====================

interface CancelOrderModalProps {
  show: boolean;
  selectedOrder: Order | null;
  cancelReason: string;
  setCancelReason: (reason: string) => void;
  onClose: () => void;
  onConfirm: (orderId: string, reason: string) => void;
  setShowOrderDetailModal: (v: boolean) => void;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  show, selectedOrder, cancelReason, setCancelReason, onClose, onConfirm, setShowOrderDetailModal
}) => {
  if (!show || !selectedOrder) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '500px' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: '#dc2626' }}>❌ Cancelar Pedido: {selectedOrder.id}</h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>Motivo de la cancelación:</label>
          <select value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '1rem' }}>
            <option value="">Selecciona un motivo</option>
            <option value="Stock insuficiente">Stock insuficiente</option>
            <option value="Proveedor no disponible">Proveedor no disponible</option>
            <option value="Problema de calidad">Problema de calidad</option>
            <option value="Solicitud del centro">Solicitud del centro</option>
            <option value="Error en el pedido">Error en el pedido</option>
            <option value="Otro">Otro motivo</option>
          </select>

          {cancelReason === 'Otro' && (
            <textarea placeholder="Especifica el motivo..." onChange={(e) => setCancelReason(`Otro: ${e.target.value}`)}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '80px', resize: 'vertical' }} />
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onClose}
            style={{ padding: '0.75rem 1.5rem', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button
            onClick={() => {
              if (cancelReason) { onConfirm(selectedOrder.id, cancelReason); setShowOrderDetailModal(false); }
              else { ui.info('Por favor, selecciona un motivo de cancelación'); }
            }}
            disabled={!cancelReason}
            style={{ padding: '0.75rem 1.5rem', backgroundColor: cancelReason ? '#dc2626' : '#9ca3af', color: 'white', border: 'none', borderRadius: '8px', cursor: cancelReason ? 'pointer' : 'not-allowed', fontWeight: '600' }}>
            ❌ Confirmar Cancelación
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== SUPPLIER DETAIL MODAL ====================

interface SupplierDetailModalProps {
  show: boolean;
  selectedSupplier: Supplier | null;
  onClose: () => void;
}

export const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
  show, selectedSupplier, onClose
}) => {
  if (!show || !selectedSupplier) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '600px' }}>
        <h2 style={{ margin: '0 0 1.5rem 0' }}>🏪 {selectedSupplier.name}</h2>
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
          <div><strong>Contacto:</strong> {selectedSupplier.contact_person}</div>
          <div><strong>Email:</strong> {selectedSupplier.email}</div>
          <div><strong>Teléfono:</strong> {selectedSupplier.phone}</div>
          <div><strong>Ciudad:</strong> {selectedSupplier.city}</div>
          <div><strong>Rating:</strong> ⭐ {selectedSupplier.rating}/5</div>
          <div><strong>Total Pedidos:</strong> {selectedSupplier.total_orders}</div>
          <div><strong>Importe Total:</strong> €{selectedSupplier.total_amount.toLocaleString()}</div>
          <div><strong>Condiciones:</strong> {selectedSupplier.payment_terms}</div>
          <div><strong>Entrega:</strong> {selectedSupplier.delivery_time}</div>
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <strong>Categorías:</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {selectedSupplier.category.map((cat, index) => (
              <span key={index} style={{ padding: '0.25rem 0.75rem', backgroundColor: '#f3f4f6', borderRadius: '20px', fontSize: '0.875rem' }}>{cat}</span>
            ))}
          </div>
        </div>
        <button onClick={onClose} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

// ==================== NEW ORDER MODAL ====================

interface NewOrderState {
  supplier_id: string;
  type: 'center_to_brand' | 'brand_to_supplier';
  from: string;
  to: string;
  center_id: string;
  expected_delivery: string;
  notes: string;
  items: Array<{ product_id: number; product_name: string; quantity: number; unit_price: number }>;
}

interface NewOrderModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: () => void;
  newOrder: NewOrderState;
  setNewOrder: (fn: (prev: NewOrderState) => NewOrderState) => void;
  suppliers: Supplier[];
  centers: Array<{ id: string; name: string; address: string }>;
  onRemoveItem: (index: number) => void;
  onShowProductSelector: () => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  show, onClose, onSubmit, newOrder, setNewOrder, suppliers, centers, onRemoveItem, onShowProductSelector
}) => {
  if (!show) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>🛒 Crear Nuevo Pedido</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>×</button>
        </div>

        {/* Tipo de pedido */}
        <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
          <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600' }}>Tipo de Pedido</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" name="orderType" value="center_to_brand" checked={newOrder.type === 'center_to_brand'}
                onChange={(e) => setNewOrder((prev) => ({ ...prev, type: e.target.value as NewOrderState['type'], supplier_id: '', center_id: '', from: '', to: 'La Jungla Central' }))} />
              <span style={{ fontWeight: '600', color: '#0369a1' }}>📥 Centro → Marca</span>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>(Solicitud interna)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" name="orderType" value="brand_to_supplier" checked={newOrder.type === 'brand_to_supplier'}
                onChange={(e) => setNewOrder((prev) => ({ ...prev, type: e.target.value as NewOrderState['type'], supplier_id: '', center_id: '', from: 'La Jungla Central', to: '' }))} />
              <span style={{ fontWeight: '600', color: '#059669' }}>📤 Marca → Proveedor</span>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>(Para registro)</span>
            </label>
          </div>
        </div>

        {/* Información del pedido */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          {newOrder.type === 'center_to_brand' ? (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Centro Solicitante *</label>
              <select value={newOrder.center_id}
                onChange={(e) => { const c = centers.find(cc => cc.id === e.target.value); setNewOrder((prev) => ({ ...prev, center_id: e.target.value, from: c?.name || '' })); }}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                <option value="">Seleccionar centro</option>
                {centers.map(center => <option key={center.id} value={center.id}>{center.name}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Proveedor *</label>
              <select value={newOrder.supplier_id}
                onChange={(e) => { const s = suppliers.find(ss => ss.id.toString() === e.target.value); setNewOrder((prev) => ({ ...prev, supplier_id: e.target.value, to: s?.name || '' })); }}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                <option value="">Seleccionar proveedor</option>
                {suppliers.map(supplier => <option key={supplier.id} value={supplier.id}>{supplier.name} - {supplier.city}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              {newOrder.type === 'center_to_brand' ? 'Fecha Necesaria' : 'Fecha de Entrega'}
            </label>
            <input type="date" value={newOrder.expected_delivery}
              onChange={(e) => setNewOrder((prev) => ({ ...prev, expected_delivery: e.target.value }))}
              style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
              min={new Date().toISOString().split('T')[0]} />
          </div>
        </div>

        {/* Añadir productos */}
        <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Productos del Pedido</h3>
            <button onClick={onShowProductSelector}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>
              <Plus size={16} />
              Añadir Productos
            </button>
          </div>
          {newOrder.items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', backgroundColor: 'white', borderRadius: '8px', border: '2px dashed #d1d5db' }}>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>No hay productos añadidos.<br />Click en "Añadir Productos" para seleccionar por categorías.</p>
            </div>
          )}
        </div>

        {/* Lista de productos añadidos */}
        {newOrder.items.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '600' }}>Productos en el Pedido</h3>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', backgroundColor: '#f9fafb', padding: '0.75rem', fontWeight: '600', fontSize: '0.875rem' }}>
                <div>Producto</div><div>Cantidad</div><div>Precio Unit.</div><div>Total</div><div></div>
              </div>
              {newOrder.items.map((item, index: number) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', padding: '0.75rem', borderTop: '1px solid #f3f4f6', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.875rem' }}>{item.product_name}</div>
                  <div style={{ fontSize: '0.875rem' }}>{item.quantity}</div>
                  <div style={{ fontSize: '0.875rem' }}>€{item.unit_price.toFixed(2)}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>€{(item.quantity * item.unit_price).toFixed(2)}</div>
                  <button onClick={() => onRemoveItem(index)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', padding: '0.75rem', borderTop: '2px solid #e5e7eb', backgroundColor: '#f9fafb', fontWeight: '700' }}>
                <div></div><div></div><div>TOTAL:</div>
                <div>€{newOrder.items.reduce((sum: number, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}</div>
                <div></div>
              </div>
            </div>
          </div>
        )}

        {/* Notas */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Notas del Pedido</label>
          <textarea value={newOrder.notes} onChange={(e) => setNewOrder((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Instrucciones especiales, comentarios..."
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '80px', resize: 'vertical' }} />
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
            Cancelar
          </button>
          <button onClick={onSubmit}
            disabled={(newOrder.type === 'center_to_brand' && (!newOrder.center_id || newOrder.items.length === 0)) || (newOrder.type === 'brand_to_supplier' && (!newOrder.supplier_id || newOrder.items.length === 0))}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: ((newOrder.type === 'center_to_brand' && newOrder.center_id && newOrder.items.length > 0) || (newOrder.type === 'brand_to_supplier' && newOrder.supplier_id && newOrder.items.length > 0)) ? '#059669' : '#9ca3af',
              color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
            }}>
            {newOrder.type === 'center_to_brand' ? 'Crear Solicitud' : 'Crear Pedido'}
          </button>
        </div>
      </div>
    </div>
  );
};
