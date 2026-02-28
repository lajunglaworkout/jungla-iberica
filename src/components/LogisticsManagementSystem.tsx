import React, { useState, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';
import { Plus, Search, Package, ShoppingCart, Settings, Building, Activity, FileText, Clock } from 'lucide-react';
import InventoryKPIDashboard from './logistics/InventoryKPIDashboard';
import RealInventoryTable from './logistics/RealInventoryTable';
import QuarterlyReviewSystem from './logistics/QuarterlyReviewSystemWithSupabase';
import MovementsHistoryPanel from './logistics/MovementsHistoryPanel';
import UniformMetricsWidget from './logistics/UniformMetricsWidget';
import { ui } from '../utils/ui';
import {
  getInventoryAlerts, getInventoryByCenters, getOrders,
  getSuppliersList, getToolsList, getPendingUniformRequests,
  deleteOrder, markOrderSent, deleteSupplierById, deleteToolById, createInventoryItem
} from '../services/logisticsService';

// Sub-components
import ToolsTab from './logistics/ToolsTab';
import SuppliersTab from './logistics/SuppliersTab';
import ReportsTab from './logistics/ReportsTab';
import { LogisticsHeader } from './logistics/LogisticsHeader';
import { LogisticsOrdersTab } from './logistics/LogisticsOrdersTab';

// Modals
import { NewProductModal, EditProductModal } from './logistics/InventoryModals';
import { OrderDetailModal, CancelOrderModal, SupplierDetailModal, NewOrderModal } from './logistics/OrderModals';
import { NewToolModal, MoveToolModal, ProductSelectorModal } from './logistics/ToolSupplierModals';

// Types + data
import { type InventoryItem, type Supplier, type Order, type LogisticsUser, type LogisticsNotification, type Tool, type ToolLocation, getRolePermissions } from './logistics/LogisticsTypes';
import { LOGISTICS_CENTERS, PRODUCTS_BY_CATEGORY } from './logistics/logisticsData';

const LogisticsManagementSystem: React.FC = () => {
  const { employee, userRole } = useSession();
  const [activeTab, setActiveTab] = useState('kpis');
  const [ordersSubTab, setOrdersSubTab] = useState<'smart' | 'manual' | 'review'>('smart');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedCenterForInventory, setSelectedCenterForInventory] = useState<number | 'all'>('all');
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentUser, setCurrentUser] = useState<LogisticsUser | null>(null);
  const [notifications, setNotifications] = useState<LogisticsNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showSupplierDetailModal, setShowSupplierDetailModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showProductSelectorModal, setShowProductSelectorModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [tools, setTools] = useState<Tool[]>([]);
  const [toolLocations, setToolLocations] = useState<ToolLocation[]>([]);
  const [showNewToolModal, setShowNewToolModal] = useState(false);
  const [showMoveToolModal, setShowMoveToolModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [toolSearchTerm, setToolSearchTerm] = useState('');
  const [toolStatusFilter, setToolStatusFilter] = useState('all');
  const [toolLocationFilter, setToolLocationFilter] = useState('all');
  const [newTool, setNewTool] = useState({ name: '', category: 'Limpieza' as Tool['category'], brand: '', model: '', serial_number: '', purchase_date: '', purchase_price: 0, current_location: 'central', status: 'available' as Tool['status'], condition: 'excellent' as Tool['condition'], assigned_to: '', notes: '' });
  const [newOrder, setNewOrder] = useState({ supplier_id: '', type: 'center_to_brand' as 'brand_to_supplier' | 'center_to_brand', from: '', to: 'La Jungla Central', center_id: '', expected_delivery: '', notes: '', items: [] as Array<{ product_id: number; product_name: string; quantity: number; unit_price: number }> });
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Vestuario', size: '', quantity: 0, min_stock: 5, max_stock: 50, purchase_price: 0, sale_price: 0, supplier: '', center: 'sevilla' as 'central' | 'sevilla' | 'jerez' | 'puerto', location: '' });
  const [selectedProductType, setSelectedProductType] = useState('');
  const [productMode, setProductMode] = useState<'predefined' | 'custom'>('predefined');

  // Build currentUser from session
  useEffect(() => {
    if (employee && userRole) {
      let mappedRole: LogisticsUser['role'] = 'employee';
      if (userRole === 'superadmin') mappedRole = 'ceo';
      else if (userRole === 'center_manager' || userRole === 'manager') mappedRole = 'center_manager';
      else if (userRole === 'admin') {
        if (employee.email === 'beni.jungla@gmail.com') mappedRole = 'logistics_director';
        else if (employee.email === 'lajunglacentral@gmail.com') mappedRole = 'hr_director';
        else if (employee.email === 'jonathan@lajungla.es') mappedRole = 'online_director';
        else if (employee.email === 'antonio@lajungla.es') mappedRole = 'events_director';
        else if (employee.email === 'diego@lajungla.es') mappedRole = 'marketing_director';
        else mappedRole = 'logistics_director';
      } else if (userRole === 'trainer') mappedRole = 'trainer';
      setCurrentUser({ id: employee.id || '0', name: employee.name || 'Usuario', role: mappedRole, center: (Number(employee.center_id) === 9 ? 'sevilla' : Number(employee.center_id) === 10 ? 'jerez' : Number(employee.center_id) === 11 ? 'puerto' : 'central') as LogisticsUser['center'], permissions: getRolePermissions(mappedRole) });
    }
  }, [employee, userRole]);

  // Load stock alerts as notifications
  useEffect(() => {
    const loadStockAlerts = async () => {
      try {
        const data = await getInventoryAlerts();
        if (!data.length) return;
        const centerNames: Record<number, string> = { 1: 'Central', 9: 'Sevilla', 10: 'Jerez', 11: 'Puerto' };
        setNotifications((data as any[]).filter(item => (item.quantity ?? 0) <= (item.min_stock ?? 0)).slice(0, 30).map((item, idx) => ({ id: idx + 1, type: (item.quantity === 0 ? 'stock_alert' : 'low_stock') as LogisticsNotification['type'], title: item.quantity === 0 ? `Sin stock: ${item.nombre_item}` : `Stock bajo: ${item.nombre_item}`, message: `${centerNames[item.center_id] || 'Centro'}: ${item.quantity} uds (mínimo: ${item.min_stock})`, timestamp: new Date().toISOString(), read: false, priority: (item.quantity === 0 ? 'high' : 'medium') as LogisticsNotification['priority'], from: `Sistema - ${centerNames[item.center_id] || 'Centro'}` })));
      } catch (err) { console.error('Error cargando alertas de stock:', err); }
    };
    loadStockAlerts();
  }, []);

  // Load inventory
  useEffect(() => {
    const loadInventory = async () => {
      try {
        const data = await getInventoryByCenters([1, 9, 10, 11]);
        if (data.length) {
          setInventoryItems((data as any[]).map(item => ({ id: item.id, name: item.nombre_item || item.name || 'Sin nombre', nombre_item: item.nombre_item, category: item.categoria || item.category || 'Sin categoría', size: item.size || item.talla || '', quantity: item.quantity || 0, min_stock: item.min_stock || 5, max_stock: item.max_stock || 100, purchase_price: item.precio_compra || item.purchase_price || 0, sale_price: item.precio_venta || item.selling_price || 0, supplier: item.proveedor || item.supplier || 'Sin proveedor', center: (item.center_id === 1 ? 'central' : item.center_id === 9 ? 'sevilla' : item.center_id === 10 ? 'jerez' : 'puerto') as InventoryItem['center'], location: item.ubicacion || item.location || 'Sin ubicación', last_updated: item.updated_at || new Date().toISOString(), status: (item.quantity || 0) === 0 ? 'out_of_stock' : (item.quantity || 0) <= (item.min_stock || 5) ? 'low_stock' : 'in_stock' })));
        }
      } catch (error) { console.error('Error cargando inventario:', error); }
    };
    loadInventory();
  }, [refreshTrigger]);

  // Load orders, suppliers, tools on mount
  useEffect(() => {
    const loadOrdersFromSupabase = async () => {
      try {
        const data = await getOrders();
        if (data.length) setOrders((data as any[]).map(o => ({ id: o.id, type: o.type, from: o.from_location, to: o.to_location, date: o.order_date, delivery_date: o.delivery_date, estimated_delivery: o.estimated_delivery, status: o.status, amount: o.amount, created_by: o.created_by, processed_date: o.processed_date, sent_date: o.sent_date, notes: o.notes, items: [] })));
        else setOrders([]);
      } catch { setOrders([]); }
    };

    const loadSuppliersFromSupabase = async () => {
      try {
        const data = await getSuppliersList();
        if (data.length) setSuppliers((data as any[]).map(s => ({ id: s.id, name: s.name, contact_person: s.contact_person, email: s.email, phone: s.phone, address: s.address, city: s.city, postal_code: s.postal_code, country: s.country || 'España', type: s.type || 'local', category: s.category || [], rating: s.rating || 0, total_orders: s.total_orders || 0, total_amount: s.total_amount || 0, last_order_date: s.last_order_date, payment_terms: s.payment_terms || '30 días', delivery_time: s.delivery_time || '3-5 días', active: s.active !== false, website: s.website, tax_id: s.tax_id, notes: s.notes })));
      } catch (error) { console.error('Error cargando proveedores:', error); }
    };

    const loadToolsFromSupabase = async () => {
      try {
        const data = await getToolsList();
        if (data.length) setTools((data as any[]).map(t => ({ id: t.id, name: t.name, category: t.category, brand: t.brand, model: t.model, serial_number: t.serial_number, purchase_date: t.purchase_date, purchase_price: t.purchase_price || 0, current_location: t.current_location, status: t.status || 'available', condition: t.condition || 'excellent', assigned_to: t.assigned_to, last_maintenance: t.last_maintenance, next_maintenance: t.next_maintenance, notes: t.notes })));
      } catch (error) { console.error('Error cargando herramientas:', error); }
    };

    const loadUniformRequestsAsNotifications = async () => {
      try {
        const uniformRequests = await getPendingUniformRequests();
        if (uniformRequests.length) {
          setNotifications(prev => [...(uniformRequests as any[]).map((req, i) => ({ id: 1000 + i, type: 'uniform_request' as const, title: '👕 Nueva Solicitud de Uniformes', message: `${req.employee_name} solicita ${req.items?.length || 0} artículos de vestuario`, order_id: `UNIF-${req.id}`, timestamp: req.requested_at, priority: 'high' as const, from: req.location || 'Centro', read: false, urgent: true })), ...prev]);
        }
      } catch (error) { console.error('Error cargando solicitudes de uniformes:', error); }
    };

    setLoadingUsers(false);
    loadOrdersFromSupabase();
    loadSuppliersFromSupabase();
    loadToolsFromSupabase();
    loadUniformRequestsAsNotifications();

    const handleLogisticsNavigation = (event: Event) => {
      const { view } = (event as CustomEvent<{ view?: string }>).detail || {};
      if (view === 'orders') setActiveTab('orders');
      else if (view === 'quarterly') setActiveTab('quarterly');
    };
    window.addEventListener('logistics-module-view', handleLogisticsNavigation as EventListener);
    return () => window.removeEventListener('logistics-module-view', handleLogisticsNavigation as EventListener);
  }, []);

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const result = await deleteOrder(orderId);
      if (!result.success) { ui.error('Error al eliminar el pedido.'); return; }
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch { ui.error('Error al eliminar el pedido.'); }
  };

  const handleMarkOrderSent = async (orderId: string) => {
    try {
      const result = await markOrderSent(orderId, new Date().toISOString());
      if (!result.success) { ui.error('Error al actualizar el pedido.'); return; }
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'sent' as const } : o));
    } catch (e) { console.error(e); }
  };

  const handlePrintOrder = (order: Order) => {
    const items = (order.notes || '').split('\n').filter(Boolean);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>Pedido ${order.id}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#111}h1{font-size:20px;margin-bottom:4px}.meta{color:#6b7280;font-size:13px;margin-bottom:24px}table{width:100%;border-collapse:collapse;margin-top:16px}th{background:#f3f4f6;padding:8px 12px;text-align:left;font-size:13px;border-bottom:2px solid #e5e7eb}td{padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px}.footer{margin-top:40px;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:16px}</style></head><body><h1>Pedido a Proveedor — ${order.id}</h1><div class="meta">Centro: ${order.from || '—'} | Fecha: ${new Date(order.date).toLocaleDateString('es-ES')} | Estado: ${order.status === 'sent' ? 'Enviado' : 'Pendiente'}</div><table><thead><tr><th>Producto</th><th>Cantidad</th></tr></thead><tbody>${items.map(line => { const match = line.match(/^(.+?):\s*(\d+)/); if (match) return `<tr><td>${match[1].replace(/^[•\-\s]+/, '')}</td><td>${match[2]}</td></tr>`; return line ? `<tr><td colspan="2">${line}</td></tr>` : ''; }).join('')}</tbody></table><div class="footer">La Jungla Ibérica SL · Generado ${new Date().toLocaleString('es-ES')}</div></body></html>`);
    printWindow.document.close(); printWindow.focus(); setTimeout(() => printWindow.print(), 300);
  };

  const handleDeleteSupplier = async (supplierId: number) => {
    try {
      const result = await deleteSupplierById(supplierId);
      if (!result.success) { ui.error('Error al eliminar el proveedor.'); return; }
      setSuppliers(prev => prev.filter(s => s.id !== supplierId));
    } catch { ui.error('Error al eliminar el proveedor.'); }
  };

  const handleDeleteTool = async (toolId: number) => {
    try {
      const result = await deleteToolById(toolId);
      if (!result.success && !result.error?.includes('relation "tools" does not exist')) { ui.error('Error al eliminar la herramienta.'); return; }
      setTools(prev => prev.filter(t => t.id !== toolId));
    } catch { setTools(prev => prev.filter(t => t.id !== toolId)); }
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.supplier || !newProduct.location) { ui.error('Por favor, completa todos los campos obligatorios'); return; }
    try {
      const centerIdMap: Record<string, number> = { 'central': 1, 'sevilla': 9, 'jerez': 10, 'puerto': 11 };
      const centerPrefixes: Record<string, string> = { 'central': 'CT', 'sevilla': 'SV', 'jerez': 'JZ', 'puerto': 'PT' };
      const codigo = `${centerPrefixes[newProduct.center] || 'CT'}${Date.now().toString().slice(-6)}`;
      const { data, error } = await createInventoryItem({ center_id: centerIdMap[newProduct.center] || 1, codigo, nombre_item: newProduct.name, categoria: newProduct.category, size: newProduct.size || null, cantidad_inicial: newProduct.quantity, quantity: newProduct.quantity, roturas: 0, deterioradas: 0, compradas: 0, precio_compra: newProduct.purchase_price, precio_venta: newProduct.sale_price, proveedor: newProduct.supplier, ubicacion: newProduct.location || null, estado: 'activo', min_stock: newProduct.min_stock });
      if (error) { ui.error(`Error al guardar el producto: ${error}`); return; }
      const status = newProduct.quantity <= newProduct.min_stock ? (newProduct.quantity === 0 ? 'out_of_stock' : 'low_stock') : 'in_stock';
      setInventoryItems([...inventoryItems, { id: (data as any).id, name: newProduct.name, category: newProduct.category, size: newProduct.size, quantity: newProduct.quantity, min_stock: newProduct.min_stock, max_stock: newProduct.max_stock, purchase_price: newProduct.purchase_price, sale_price: newProduct.sale_price, supplier: newProduct.supplier, center: newProduct.center, location: newProduct.location, last_updated: new Date().toISOString(), status: status as InventoryItem['status'] }]);
      setNewProduct({ name: '', category: 'Vestuario', size: '', quantity: 0, min_stock: 0, max_stock: 0, purchase_price: 0, sale_price: 0, supplier: '', center: 'central', location: '' });
      setShowNewProductModal(false);
      ui.success('✅ Producto creado y guardado exitosamente');
    } catch { ui.error('Error inesperado al guardar el producto'); }
  };

  const handleCreateTool = () => {
    if (!newTool.name || !newTool.brand || !newTool.model) { ui.error('Por favor, completa todos los campos obligatorios'); return; }
    setTools([...tools, { id: Date.now(), ...newTool, purchase_date: newTool.purchase_date || new Date().toISOString().split('T')[0] }]);
    setNewTool({ name: '', category: 'Limpieza', brand: '', model: '', serial_number: '', purchase_date: '', purchase_price: 0, current_location: 'central', status: 'available', condition: 'excellent', assigned_to: '', notes: '' });
    setShowNewToolModal(false);
    ui.success('Herramienta creada exitosamente');
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    const status = editingProduct.quantity <= editingProduct.min_stock ? (editingProduct.quantity === 0 ? 'out_of_stock' : 'low_stock') : 'in_stock';
    setInventoryItems(prev => prev.map(item => item.id === editingProduct.id ? { ...editingProduct, last_updated: new Date().toISOString(), status: status as InventoryItem['status'] } : item));
    setShowEditProductModal(false); setEditingProduct(null);
  };

  const getOrderStats = () => ({ pendingOrders: orders.filter(o => o.status === 'pending').length, sentOrders: orders.filter(o => o.status === 'sent').length, pendingAmount: orders.filter(o => o.status === 'pending' && o.type === 'center_to_brand').reduce((sum, o) => sum + o.amount, 0) });
  const markNotificationAsRead = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const processOrder = (orderId: string) => { setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'processing' as const, processed_date: new Date().toISOString() } : o)); setNotifications(prev => [{ id: Date.now(), type: 'order_update', title: '🔄 Pedido en Proceso', message: `Pedido ${orderId} está siendo procesado`, order_id: orderId, timestamp: new Date().toISOString(), priority: 'medium', from: 'Sistema', read: false, urgent: false }, ...prev]); };
  const shipOrder = (orderId: string) => { setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'sent' as const, sent_date: new Date().toISOString() } : o)); };
  const cancelOrder = (orderId: string, reason: string) => { setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' as const, cancelled_date: new Date().toISOString(), cancellation_reason: reason } : o)); setShowCancelModal(false); setCancelReason(''); };
  const getUnreadNotifications = () => notifications.filter(n => !n.read);

  const handleCreateOrder = () => {
    if (newOrder.type === 'center_to_brand') { if (!newOrder.center_id || newOrder.items.length === 0) { ui.info('Por favor, selecciona un centro y añade al menos un producto'); return; } }
    else { if (!newOrder.supplier_id || newOrder.items.length === 0) { ui.info('Por favor, selecciona un proveedor y añade al menos un producto'); return; } }
    const totalAmount = newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const orderPrefix = newOrder.type === 'center_to_brand' ? 'REQ' : 'PED';
    const newOrderId = `${orderPrefix}-2025-${String(orders.length + 1).padStart(3, '0')}`;
    const orderToAdd: Order = { id: newOrderId, type: newOrder.type, from: newOrder.from, to: newOrder.to, date: new Date().toISOString().split('T')[0], delivery_date: newOrder.expected_delivery, estimated_delivery: newOrder.expected_delivery, amount: totalAmount, status: 'pending', created_by: currentUser?.name || 'Sistema', items: newOrder.items.map(item => ({ ...item, total_price: item.quantity * item.unit_price, available_stock: inventoryItems.find(inv => inv.id === item.product_id)?.quantity || 0, has_sufficient_stock: (inventoryItems.find(inv => inv.id === item.product_id)?.quantity || 0) >= item.quantity })), notes: newOrder.notes };
    setOrders(prev => [...prev, orderToAdd]);
    setNotifications(prev => [{ id: Date.now(), type: 'new_order', title: newOrder.type === 'center_to_brand' ? '🏪 Nueva Solicitud de Centro' : '📦 Nuevo Pedido a Proveedor', message: `${newOrderId} creado: €${totalAmount.toFixed(2)}`, order_id: newOrderId, timestamp: new Date().toISOString(), priority: 'medium', from: 'Sistema', read: false, urgent: totalAmount > 500 }, ...prev]);
    setNewOrder({ supplier_id: '', type: 'center_to_brand', from: '', to: 'La Jungla Central', center_id: '', expected_delivery: '', notes: '', items: [] });
    setShowNewOrderModal(false);
    ui.success(`${newOrder.type === 'center_to_brand' ? 'Solicitud' : 'Pedido'} ${newOrderId} creado exitosamente`);
  };

  const filteredOrders = orders.filter(o => { const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.from.toLowerCase().includes(searchTerm.toLowerCase()) || o.to.toLowerCase().includes(searchTerm.toLowerCase()); return matchesSearch && (statusFilter === 'all' || o.status === statusFilter) && (categoryFilter === 'all' || o.type === categoryFilter); });
  const filteredSuppliers = suppliers.filter(s => { const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.contact_person.toLowerCase().includes(searchTerm.toLowerCase()); return matchesSearch && (categoryFilter === 'all' || s.type === categoryFilter); });

  if (loadingUsers || !currentUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '500' }}>Cargando módulo de logística...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const tabStyle = (tab: string) => ({ padding: '10px 20px', backgroundColor: activeTab === tab ? '#059669' : 'white', color: activeTab === tab ? 'white' : '#64748b', border: 'none', borderRadius: '8px', cursor: 'pointer' as const, fontWeight: '600' as const, display: 'flex' as const, alignItems: 'center' as const, gap: '8px', boxShadow: activeTab === tab ? '0 4px 6px -1px rgba(5, 150, 105, 0.2)' : 'none', transition: 'all 0.2s ease' });

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <LogisticsHeader currentUser={currentUser} setCurrentUser={setCurrentUser} notifications={notifications} showNotifications={showNotifications} setShowNotifications={setShowNotifications} markNotificationAsRead={markNotificationAsRead} getUnreadNotifications={getUnreadNotifications} />

      <div style={{ padding: '0 2rem' }}>
        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '8px' }}>
          <button onClick={() => setActiveTab('kpis')} style={tabStyle('kpis')}><Activity size={18} /> KPIs Real Time</button>
          <button onClick={() => setActiveTab('inventory')} style={tabStyle('inventory')}><Package size={18} /> Inventario</button>
          <button onClick={() => setActiveTab('quarterly')} style={tabStyle('quarterly')}><FileText size={18} /> Revisión Trimestral</button>
          <button onClick={() => setActiveTab('history')} style={tabStyle('history')}><Clock size={18} /> Historial</button>
          <button onClick={() => setActiveTab('orders')} style={tabStyle('orders')}><ShoppingCart size={18} /> Pedidos</button>
          <button onClick={() => setActiveTab('tools')} style={tabStyle('tools')}><Settings size={18} /> Herramientas</button>
          <button onClick={() => setActiveTab('suppliers')} style={tabStyle('suppliers')}><Building size={18} /> Proveedores</button>
        </div>

        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input type="text" placeholder={activeTab === 'inventory' ? 'Buscar productos...' : activeTab === 'orders' ? 'Buscar pedidos...' : activeTab === 'tools' ? 'Buscar herramientas...' : activeTab === 'suppliers' ? 'Buscar proveedores...' : 'Buscar...'} value={activeTab === 'tools' ? toolSearchTerm : searchTerm} onChange={(e) => activeTab === 'tools' ? setToolSearchTerm(e.target.value) : setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1px solid #d1d5db', borderRadius: '12px', backgroundColor: 'white' }} />
          </div>
          {activeTab === 'inventory' && (<>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '12px', backgroundColor: 'white' }}><option value="all">Todos los estados</option><option value="in_stock">En Stock</option><option value="low_stock">Stock Bajo</option><option value="out_of_stock">Sin Stock</option></select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '12px', backgroundColor: 'white' }}><option value="all">Todas las categorías</option><option value="Vestuario">👕 Vestuario</option><option value="Merchandising">🎁 Merchandising</option><option value="Consumibles">🧽 Consumibles</option><option value="Mancuernas">🏋️ Mancuernas</option></select>
            <select value={selectedCenterForInventory} onChange={(e) => setSelectedCenterForInventory(e.target.value === 'all' ? 'all' : Number(e.target.value))} style={{ padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '12px', backgroundColor: 'white' }}><option value="all">Todos los centros</option><option value={12}>🏢 Central</option><option value={9}>🏪 Sevilla</option><option value={10}>🏪 Jerez</option><option value={11}>🏪 Puerto</option></select>
          </>)}
          {activeTab === 'tools' && (<>
            <select value={toolStatusFilter} onChange={(e) => setToolStatusFilter(e.target.value)} style={{ padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '12px', backgroundColor: 'white' }}><option value="all">Todos los estados</option><option value="available">✅ Disponible</option><option value="in_use">🔧 En Uso</option><option value="maintenance">⚙️ Mantenimiento</option><option value="lost">❌ Perdida</option><option value="damaged">🔴 Dañada</option></select>
            <select value={toolLocationFilter} onChange={(e) => setToolLocationFilter(e.target.value)} style={{ padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '12px', backgroundColor: 'white' }}><option value="all">Todas las ubicaciones</option>{toolLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}</select>
          </>)}
          {activeTab === 'suppliers' && (<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '12px', backgroundColor: 'white' }}><option value="all">Todos los tipos</option><option value="local">🏠 Local</option><option value="nacional">🇪🇸 Nacional</option><option value="internacional">🌍 Internacional</option></select>)}
          {((activeTab === 'inventory' && currentUser.permissions.canManageInventory) || (activeTab === 'orders' && currentUser.permissions.canCreateOrders) || (activeTab === 'tools' && currentUser.permissions.canManageTools) || (activeTab === 'suppliers' && currentUser.permissions.canManageSuppliers)) && (
            <button onClick={() => { if (activeTab === 'inventory') setShowNewProductModal(true); else if (activeTab === 'orders') setShowNewOrderModal(true); else if (activeTab === 'tools') setShowNewToolModal(true); else if (activeTab === 'suppliers') setShowSupplierDetailModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              <Plus size={16} />{activeTab === 'inventory' ? 'Nuevo Producto' : activeTab === 'orders' ? 'Nuevo Pedido' : activeTab === 'tools' ? 'Nueva Herramienta' : 'Nuevo Proveedor'}
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'kpis' && (<div className="space-y-6"><InventoryKPIDashboard /><div className="mt-6"><UniformMetricsWidget /></div></div>)}
        {activeTab === 'inventory' && <RealInventoryTable selectedCenter={selectedCenterForInventory} searchTerm={searchTerm} statusFilter={statusFilter} categoryFilter={categoryFilter} inventoryItems={inventoryItems} onItemUpdated={() => setRefreshTrigger(prev => prev + 1)} />}
        {activeTab === 'quarterly' && <QuarterlyReviewSystem onItemUpdated={() => setRefreshTrigger(prev => prev + 1)} />}
        {activeTab === 'history' && <MovementsHistoryPanel initialCenterId={selectedCenterForInventory} />}
        {activeTab === 'orders' && <LogisticsOrdersTab ordersSubTab={ordersSubTab} setOrdersSubTab={setOrdersSubTab} filteredOrders={filteredOrders} orders={orders} selectedCenterForInventory={selectedCenterForInventory} currentUser={currentUser} getOrderStats={getOrderStats} onMarkOrderSent={handleMarkOrderSent} onPrintOrder={handlePrintOrder} onDeleteOrder={handleDeleteOrder} onShowNewOrderModal={() => setShowNewOrderModal(true)} onShowOrderDetail={(order) => { setSelectedOrder(order); setShowOrderDetailModal(true); }} />}
        {activeTab === 'tools' && <ToolsTab tools={tools} toolLocations={toolLocations} toolSearchTerm={toolSearchTerm} toolStatusFilter={toolStatusFilter} toolLocationFilter={toolLocationFilter} setToolSearchTerm={setToolSearchTerm} setToolStatusFilter={setToolStatusFilter} setToolLocationFilter={setToolLocationFilter} setSelectedTool={setSelectedTool} setShowMoveToolModal={setShowMoveToolModal} onDeleteTool={handleDeleteTool} />}
        {activeTab === 'suppliers' && <SuppliersTab filteredSuppliers={filteredSuppliers} onDeleteSupplier={handleDeleteSupplier} onSupplierClick={(s) => { setSelectedSupplier(s); setShowSupplierDetailModal(true); }} />}
        {activeTab === 'reports' && <ReportsTab inventoryItems={inventoryItems} orders={orders} tools={tools} toolLocations={toolLocations} notifications={notifications} setShowNotifications={setShowNotifications} getUnreadNotifications={getUnreadNotifications} />}
      </div>

      {/* Modals */}
      <NewProductModal show={showNewProductModal} onClose={() => setShowNewProductModal(false)} onSubmit={handleCreateProduct} newProduct={newProduct} setNewProduct={setNewProduct} productMode={productMode} setProductMode={setProductMode} selectedProductType={selectedProductType} setSelectedProductType={setSelectedProductType} productsByCategory={PRODUCTS_BY_CATEGORY} />
      <EditProductModal show={showEditProductModal} editingProduct={editingProduct} onClose={() => { setShowEditProductModal(false); setEditingProduct(null); }} onSubmit={handleUpdateProduct} setEditingProduct={setEditingProduct} />
      <OrderDetailModal show={showOrderDetailModal} selectedOrder={selectedOrder} currentUser={currentUser} onClose={() => setShowOrderDetailModal(false)} onProcess={processOrder} onShip={shipOrder} onShowCancel={() => setShowCancelModal(true)} />
      <CancelOrderModal show={showCancelModal} selectedOrder={selectedOrder} cancelReason={cancelReason} setCancelReason={setCancelReason} onClose={() => setShowCancelModal(false)} onConfirm={cancelOrder} setShowOrderDetailModal={setShowOrderDetailModal} />
      <SupplierDetailModal show={showSupplierDetailModal} selectedSupplier={selectedSupplier} onClose={() => setShowSupplierDetailModal(false)} />
      <NewOrderModal show={showNewOrderModal} onClose={() => setShowNewOrderModal(false)} onSubmit={handleCreateOrder} newOrder={newOrder} setNewOrder={setNewOrder} suppliers={suppliers} centers={LOGISTICS_CENTERS} onRemoveItem={(i) => setNewOrder(prev => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) }))} onShowProductSelector={() => setShowProductSelectorModal(true)} />
      <ProductSelectorModal show={showProductSelectorModal} onClose={() => setShowProductSelectorModal(false)} inventoryItems={inventoryItems} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} productSearchTerm={productSearchTerm} setProductSearchTerm={setProductSearchTerm} newOrderItems={newOrder.items} onAddToOrder={(product, quantity, unitPrice) => { setNewOrder(prev => ({ ...prev, items: [...prev.items, { product_id: product.id, product_name: product.name, quantity, unit_price: unitPrice }] })); setShowProductSelectorModal(false); }} currentUser={currentUser} />
      <NewToolModal show={showNewToolModal} onClose={() => setShowNewToolModal(false)} onSubmit={handleCreateTool} newTool={newTool} setNewTool={setNewTool} toolLocations={toolLocations} />
      <MoveToolModal show={showMoveToolModal} selectedTool={selectedTool} toolLocations={toolLocations} onClose={() => { setShowMoveToolModal(false); setSelectedTool(null); }} onMove={() => { ui.success('Herramienta movida exitosamente'); setShowMoveToolModal(false); setSelectedTool(null); }} />
    </div>
  );
};

export default LogisticsManagementSystem;
