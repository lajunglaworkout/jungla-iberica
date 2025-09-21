import React, { useState, useEffect } from 'react';
import { Search, Package, Plus, Eye, Truck, BarChart3 } from 'lucide-react';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  size: string;
  quantity: number;
  min_stock: number;
  max_stock: number;
  purchase_price: number;
  sale_price: number;
  supplier: string;
  center: 'sevilla' | 'jerez' | 'puerto' | 'central';
  location: string;
  last_updated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  type: 'local' | 'nacional' | 'internacional';
  category: string[];
  rating: number;
  total_orders: number;
  total_amount: number;
  last_order_date: string;
  payment_terms: string;
  delivery_time: string;
  active: boolean;
  notes?: string;
  website?: string;
  tax_id: string;
}

interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  available_stock: number;
  has_sufficient_stock: boolean;
}

interface Order {
  id: string;
  type: 'center_to_brand' | 'brand_to_supplier';
  from: string;
  to: string;
  date: string;
  delivery_date: string;
  estimated_delivery: string;
  amount: number;
  status: 'pending' | 'processing' | 'sent' | 'delivered' | 'cancelled';
  created_by: string;
  items: OrderItem[];
  notes?: string;
  processed_date?: string;
  sent_date?: string;
  cancelled_date?: string;
  cancellation_reason?: string;
}

interface LogisticsStats {
  totalInventoryItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalInventoryValue: number;
}

interface User {
  id: string;
  name: string;
  role: 'center_manager' | 'logistics_director' | 'admin';
  center?: 'sevilla' | 'jerez' | 'puerto' | 'central';
}

interface Notification {
  id: string;
  type: 'new_order' | 'low_stock' | 'order_update';
  title: string;
  message: string;
  order_id?: string;
  created_at: string;
  read: boolean;
  urgent: boolean;
}

const LogisticsManagementSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [centerFilter, setCenterFilter] = useState('all');
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentUser, setCurrentUser] = useState<User>({ id: '1', name: 'Beni García', role: 'logistics_director', center: 'central' });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showSupplierDetailModal, setShowSupplierDetailModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    supplier_id: '',
    type: 'brand_to_supplier' as 'brand_to_supplier' | 'center_to_brand',
    from: 'La Jungla Central',
    to: '',
    expected_delivery: '',
    notes: '',
    items: [] as Array<{
      product_id: number;
      product_name: string;
      quantity: number;
      unit_price: number;
    }>
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Vestuario',
    size: '',
    quantity: 0,
    min_stock: 0,
    max_stock: 0,
    purchase_price: 0,
    sale_price: 0,
    supplier: '',
    center: 'sevilla' as 'sevilla' | 'jerez' | 'puerto' | 'central',
    location: ''
  });

  useEffect(() => {
    // Intentar conectar con Supabase
    const checkSupabaseConnection = async () => {
      try {
        console.log(' Verificando conexión con Supabase...');
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/product_categories?select=*`, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(' Supabase conectado! Categorías encontradas:', data.length);
          console.log(' Datos disponibles en Supabase:', data);
        } else {
          console.log(' Supabase no disponible, usando datos mock');
        }
      } catch (error) {
        console.log(' Error conectando a Supabase, usando datos mock:', error);
      }
    };
    
    checkSupabaseConnection();
    
    // Datos de ejemplo para inventario
    setInventoryItems([
      { id: 1, name: 'Camiseta La Jungla', category: 'Vestuario', size: 'M', quantity: 25, min_stock: 10, max_stock: 50, purchase_price: 12.50, sale_price: 25.00, supplier: 'Textiles SL', center: 'sevilla', location: 'A1', last_updated: new Date().toISOString(), status: 'in_stock' },
      { id: 2, name: 'Mancuernas 5kg', category: 'Material Deportivo', size: '-', quantity: 3, min_stock: 5, max_stock: 25, purchase_price: 28.00, sale_price: 45.00, supplier: 'Deportes Pro', center: 'jerez', location: 'D1', last_updated: new Date().toISOString(), status: 'low_stock' },
      { id: 3, name: 'Desinfectante', category: 'Consumibles', size: '5L', quantity: 0, min_stock: 2, max_stock: 15, purchase_price: 15.00, sale_price: 22.50, supplier: 'Limpieza', center: 'puerto', location: 'F1', last_updated: new Date().toISOString(), status: 'out_of_stock' },
      { id: 4, name: 'Gomas Elásticas', category: 'Material Deportivo', size: 'Set', quantity: 15, min_stock: 8, max_stock: 30, purchase_price: 10.00, sale_price: 18.50, supplier: 'FitEquip', center: 'central', location: 'D2', last_updated: new Date().toISOString(), status: 'in_stock' },
      { id: 5, name: 'Toallas', category: 'Vestuario', size: 'Grande', quantity: 2, min_stock: 5, max_stock: 20, purchase_price: 6.50, sale_price: 12.00, supplier: 'Textiles SL', center: 'sevilla', location: 'A2', last_updated: new Date().toISOString(), status: 'low_stock' },
      { id: 6, name: 'Botella La Jungla', category: 'Merchandising', size: '750ml', quantity: 12, min_stock: 8, max_stock: 40, purchase_price: 4.50, sale_price: 9.99, supplier: 'Promo Items', center: 'central', location: 'M1', last_updated: new Date().toISOString(), status: 'in_stock' }
    ]);

    setSuppliers([
      {
        id: 1,
        name: 'Textiles Deportivos SL',
        contact_person: 'María García Ruiz',
        email: 'maria.garcia@textiles-deportivos.com',
        phone: '+34 954 123 456',
        address: 'Calle Industria, 45',
        city: 'Sevilla',
        postal_code: '41015',
        country: 'España',
        type: 'local',
        category: ['Vestuario', 'Merchandising'],
        rating: 4.8,
        total_orders: 156,
        total_amount: 89450.50,
        last_order_date: '2025-01-15',
        payment_terms: '30 días',
        delivery_time: '3-5 días',
        active: true,
        website: 'www.textiles-deportivos.com',
        tax_id: 'B41234567',
        notes: 'Proveedor principal de textiles. Excelente calidad y puntualidad.'
      },
      {
        id: 2,
        name: 'Equipos Fitness Pro SA',
        contact_person: 'Juan Carlos Pérez',
        email: 'comercial@fitness-pro.es',
        phone: '+34 915 987 654',
        address: 'Polígono Industrial Las Rozas, Nave 12',
        city: 'Madrid',
        postal_code: '28232',
        country: 'España',
        type: 'nacional',
        category: ['Equipamiento', 'Maquinaria'],
        rating: 4.5,
        total_orders: 89,
        total_amount: 234750.00,
        last_order_date: '2025-01-18',
        payment_terms: '60 días',
        delivery_time: '7-10 días',
        active: true,
        website: 'www.fitness-pro.es',
        tax_id: 'A28987654',
        notes: 'Especialistas en equipamiento pesado. Buen servicio técnico.'
      },
      {
        id: 3,
        name: 'Global Sports International',
        contact_person: 'Mike Johnson',
        email: 'europe@globalsports.com',
        phone: '+44 20 7123 4567',
        address: '123 Sports Avenue',
        city: 'London',
        postal_code: 'SW1A 1AA',
        country: 'Reino Unido',
        type: 'internacional',
        category: ['Equipamiento', 'Tecnología'],
        rating: 4.2,
        total_orders: 34,
        total_amount: 145320.75,
        last_order_date: '2025-01-10',
        payment_terms: '45 días',
        delivery_time: '14-21 días',
        active: true,
        website: 'www.globalsports.com',
        tax_id: 'GB123456789',
        notes: 'Proveedor internacional. Productos innovadores pero tiempos de entrega largos.'
      },
      {
        id: 4,
        name: 'Suplementos Andaluces',
        contact_person: 'Carmen López',
        email: 'info@suplementos-and.com',
        phone: '+34 956 456 789',
        address: 'Avenida del Puerto, 78',
        city: 'Cádiz',
        postal_code: '11006',
        country: 'España',
        type: 'local',
        category: ['Suplementos', 'Nutrición'],
        rating: 4.7,
        total_orders: 67,
        total_amount: 23450.25,
        last_order_date: '2025-01-20',
        payment_terms: '15 días',
        delivery_time: '1-2 días',
        active: true,
        website: 'www.suplementos-andaluces.com',
        tax_id: 'B11456789'
      },
      {
        id: 5,
        name: 'Limpieza Industrial Jerez',
        contact_person: 'Antonio Martín',
        email: 'antonio@limpiezajerez.es',
        phone: '+34 956 789 123',
        address: 'Calle Comercio, 23',
        city: 'Jerez de la Frontera',
        postal_code: '11403',
        country: 'España',
        type: 'local',
        category: ['Limpieza', 'Mantenimiento'],
        rating: 4.3,
        total_orders: 123,
        total_amount: 15670.80,
        last_order_date: '2025-01-19',
        payment_terms: '30 días',
        delivery_time: '2-3 días',
        active: true,
        tax_id: 'B11789123',
        notes: 'Proveedor local de confianza para productos de limpieza.'
      }
    ]);

    setOrders([
      {
        id: 'PED-2025-001',
        type: 'brand_to_supplier',
        from: 'La Jungla Central',
        to: 'Textiles Deportivos SL',
        date: '2025-01-15',
        delivery_date: '2025-01-20',
        estimated_delivery: '2025-01-20',
        status: 'sent',
        amount: 465.00,
        created_by: 'Ana García',
        items: [
          { 
            product_id: 1, 
            product_name: 'Camiseta La Jungla - Negra', 
            quantity: 30, 
            unit_price: 15.50, 
            total_price: 465.00,
            available_stock: 25,
            has_sufficient_stock: false
          }
        ],
        notes: 'Pedido urgente para reposición',
        sent_date: '2025-01-16'
      },
      {
        id: 'REQ-2025-001',
        type: 'center_to_brand',
        from: 'Centro Sevilla',
        to: 'La Jungla Central',
        date: '2025-01-18',
        delivery_date: '2025-01-22',
        estimated_delivery: '2025-01-22',
        status: 'pending',
        amount: 250.00,
        created_by: 'Carlos Ruiz',
        items: [
          { 
            product_id: 2, 
            product_name: 'Toallas', 
            quantity: 10, 
            unit_price: 8.50, 
            total_price: 85.00,
            available_stock: 2,
            has_sufficient_stock: false
          },
          { 
            product_id: 5, 
            product_name: 'Desinfectante', 
            quantity: 20, 
            unit_price: 8.25, 
            total_price: 165.00,
            available_stock: 0,
            has_sufficient_stock: false
          }
        ]
      },
      {
        id: 'PED-2025-002',
        type: 'brand_to_supplier',
        from: 'La Jungla Central',
        to: 'FitEquip España',
        date: '2025-01-10',
        delivery_date: '2025-01-25',
        estimated_delivery: '2025-01-25',
        status: 'delivered',
        amount: 875.00,
        created_by: 'María López',
        items: [
          { 
            product_id: 3, 
            product_name: 'Mancuernas 5kg', 
            quantity: 25, 
            unit_price: 35.00, 
            total_price: 875.00,
            available_stock: 3,
            has_sufficient_stock: false
          }
        ],
        processed_date: '2025-01-11',
        sent_date: '2025-01-12'
      },
      {
        id: 'REQ-2025-002',
        type: 'center_to_brand',
        from: 'Centro Jerez',
        to: 'La Jungla Central',
        date: '2025-01-19',
        delivery_date: '2025-01-23',
        estimated_delivery: '2025-01-23',
        status: 'sent',
        amount: 175.00,
        created_by: 'Pedro Martín',
        items: [
          { 
            product_id: 3, 
            product_name: 'Mancuernas 5kg', 
            quantity: 5, 
            unit_price: 35.00, 
            total_price: 175.00,
            available_stock: 3,
            has_sufficient_stock: false
          }
        ],
        processed_date: '2025-01-20',
        sent_date: '2025-01-20'
      },
      {
        id: 'REQ-2025-003',
        type: 'center_to_brand',
        from: 'Centro Sevilla',
        to: 'La Jungla Central',
        date: new Date().toISOString(),
        delivery_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_delivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        amount: 700.00,
        created_by: 'Carlos Ruiz - Encargado Sevilla',
        items: [
          { 
            product_id: 4, 
            product_name: 'Gomas Elásticas', 
            quantity: 20, 
            unit_price: 35.00, 
            total_price: 700.00,
            available_stock: 15,
            has_sufficient_stock: false
          }
        ],
        notes: 'Pedido urgente - Stock insuficiente en centro'
      }
    ]);

    // Notificaciones de ejemplo para el director de logística
    setNotifications([
      {
        id: 'notif-001',
        type: 'new_order',
        title: '🚨 Nuevo Pedido Urgente',
        message: 'Centro Sevilla solicita 20 Gomas Elásticas - Stock insuficiente',
        order_id: 'REQ-2025-003',
        created_at: new Date().toISOString(),
        read: false,
        urgent: true
      },
      {
        id: 'notif-002',
        type: 'low_stock',
        title: '⚠️ Stock Bajo',
        message: 'Toallas en Centro Sevilla: Solo 2 unidades disponibles',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        read: false,
        urgent: false
      },
      {
        id: 'notif-003',
        type: 'order_update',
        title: '✅ Pedido Procesado',
        message: 'PED-2025-001 ha sido enviado a Textiles Deportivos SL',
        order_id: 'PED-2025-001',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        read: true,
        urgent: false
      }
    ]);
  }, []);

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesCenter = centerFilter === 'all' || item.center === centerFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesCenter;
  });

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = statusFilter === 'all' || supplier.type === statusFilter;
    const matchesCategory = categoryFilter === 'all' || supplier.category.some(cat => cat.toLowerCase().includes(categoryFilter.toLowerCase()));
    return matchesSearch && matchesType && matchesCategory && supplier.active;
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesType = categoryFilter === 'all' || order.type === categoryFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateProduct = () => {
    if (!newProduct.name || !newProduct.supplier || !newProduct.location) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    const newId = Math.max(...inventoryItems.map(item => item.id)) + 1;
    const status = newProduct.quantity <= newProduct.min_stock ? 
                  (newProduct.quantity === 0 ? 'out_of_stock' : 'low_stock') : 'in_stock';

    const productToAdd: InventoryItem = {
      id: newId,
      name: newProduct.name,
      category: newProduct.category,
      size: newProduct.size,
      quantity: newProduct.quantity,
      min_stock: newProduct.min_stock,
      max_stock: newProduct.max_stock,
      purchase_price: newProduct.purchase_price,
      sale_price: newProduct.sale_price,
      supplier: newProduct.supplier,
      center: newProduct.center,
      location: newProduct.location,
      last_updated: new Date().toISOString(),
      status: status as 'in_stock' | 'low_stock' | 'out_of_stock'
    };

    setInventoryItems(prev => [...prev, productToAdd]);
    setShowNewProductModal(false);
    setNewProduct({
      name: '',
      category: 'Vestuario',
      size: '',
      quantity: 0,
      min_stock: 0,
      max_stock: 0,
      purchase_price: 0,
      sale_price: 0,
      supplier: '',
      center: 'sevilla',
      location: ''
    });
  };

  const handleEditProduct = (product: InventoryItem) => {
    setEditingProduct(product);
    setShowEditProductModal(true);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;

    const status = editingProduct.quantity <= editingProduct.min_stock ? 
                  (editingProduct.quantity === 0 ? 'out_of_stock' : 'low_stock') : 'in_stock';

    const updatedProduct = {
      ...editingProduct,
      last_updated: new Date().toISOString(),
      status: status as 'in_stock' | 'low_stock' | 'out_of_stock'
    };

    setInventoryItems(prev => prev.map(item => 
      item.id === editingProduct.id ? updatedProduct : item
    ));
    
    setShowEditProductModal(false);
    setEditingProduct(null);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetailModal(true);
  };

  const getOrderStats = () => {
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const sentOrders = orders.filter(order => order.status === 'sent').length;
    const pendingAmount = orders
      .filter(order => order.status === 'pending' && order.type === 'center_to_brand')
      .reduce((sum, order) => sum + order.amount, 0);
    
    return { pendingOrders, sentOrders, pendingAmount };
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const processOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'processing' as const, processed_date: new Date().toISOString() }
        : order
    ));
    
    // Crear notificación para el director de logística
    const logisticsNotification: Notification = {
      id: `notif-${Date.now()}`,
      type: 'order_update',
      title: '🔄 Pedido en Proceso',
      message: `Pedido ${orderId} está siendo procesado`,
      order_id: orderId,
      created_at: new Date().toISOString(),
      read: false,
      urgent: false
    };
    
    // Crear notificación para el creador del pedido
    const creatorNotification: Notification = {
      id: `notif-${Date.now() + 1}`,
      type: 'order_update',
      title: '🔄 Tu Pedido está en Proceso',
      message: `Hola ${order.created_by.split(' - ')[0]}, tu pedido ${orderId} está siendo procesado por el equipo de logística`,
      order_id: orderId,
      created_at: new Date().toISOString(),
      read: false,
      urgent: false
    };
    
    setNotifications(prev => [logisticsNotification, creatorNotification, ...prev]);
  };

  const shipOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'sent' as const, sent_date: new Date().toISOString() }
        : order
    ));
    
    // Crear notificación para el director de logística
    const logisticsNotification: Notification = {
      id: `notif-${Date.now()}`,
      type: 'order_update',
      title: '🚚 Pedido Enviado',
      message: `Pedido ${orderId} ha sido enviado`,
      order_id: orderId,
      created_at: new Date().toISOString(),
      read: false,
      urgent: false
    };
    
    // Crear notificación para el creador del pedido
    const creatorNotification: Notification = {
      id: `notif-${Date.now() + 1}`,
      type: 'order_update',
      title: '🚚 Tu Pedido ha sido Enviado',
      message: `¡Buenas noticias ${order.created_by.split(' - ')[0]}! Tu pedido ${orderId} ha sido enviado y está en camino`,
      order_id: orderId,
      created_at: new Date().toISOString(),
      read: false,
      urgent: false
    };
    
    setNotifications(prev => [logisticsNotification, creatorNotification, ...prev]);
  };

  const cancelOrder = (orderId: string, reason: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: 'cancelled' as const, 
            cancelled_date: new Date().toISOString(),
            cancellation_reason: reason
          }
        : order
    ));
    
    // Crear notificación para el director de logística
    const logisticsNotification: Notification = {
      id: `notif-${Date.now()}`,
      type: 'order_update',
      title: '❌ Pedido Cancelado',
      message: `Pedido ${orderId} cancelado: ${reason}`,
      order_id: orderId,
      created_at: new Date().toISOString(),
      read: false,
      urgent: false
    };
    
    // Crear notificación para el creador del pedido
    const creatorNotification: Notification = {
      id: `notif-${Date.now() + 1}`,
      type: 'order_update',
      title: '❌ Tu Pedido ha sido Cancelado',
      message: `Lamentamos informarte ${order.created_by.split(' - ')[0]} que tu pedido ${orderId} ha sido cancelado. Motivo: ${reason}`,
      order_id: orderId,
      created_at: new Date().toISOString(),
      read: false,
      urgent: true
    };
    
    setNotifications(prev => [logisticsNotification, creatorNotification, ...prev]);
    setShowCancelModal(false);
    setCancelReason('');
  };

  const getUnreadNotifications = () => {
    return notifications.filter(notif => !notif.read);
  };

  const handleSupplierClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowSupplierDetailModal(true);
  };

  const handleCreateOrder = () => {
    if (!newOrder.supplier_id || newOrder.items.length === 0) {
      alert('Por favor, selecciona un proveedor y añade al menos un producto');
      return;
    }

    const totalAmount = newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const newOrderId = `PED-2025-${String(orders.length + 1).padStart(3, '0')}`;
    
    const orderToAdd: Order = {
      id: newOrderId,
      type: newOrder.type,
      from: newOrder.from,
      to: newOrder.to,
      date: new Date().toISOString().split('T')[0],
      delivery_date: newOrder.expected_delivery,
      estimated_delivery: newOrder.expected_delivery,
      amount: totalAmount,
      status: 'pending',
      created_by: currentUser.name,
      items: newOrder.items.map(item => ({
        ...item,
        total_price: item.quantity * item.unit_price,
        available_stock: inventoryItems.find(inv => inv.id === item.product_id)?.quantity || 0,
        has_sufficient_stock: (inventoryItems.find(inv => inv.id === item.product_id)?.quantity || 0) >= item.quantity
      })),
      notes: newOrder.notes
    };

    setOrders(prev => [...prev, orderToAdd]);
    
    // Añadir notificación
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      type: 'new_order',
      title: '📦 Nuevo Pedido Creado',
      message: `Pedido ${newOrderId} creado para ${newOrder.to} - €${totalAmount.toFixed(2)}`,
      order_id: newOrderId,
      created_at: new Date().toISOString(),
      read: false,
      urgent: false
    };
    
    setNotifications(prev => [notification, ...prev]);
    
    // Resetear formulario
    setNewOrder({
      supplier_id: '',
      type: 'brand_to_supplier',
      from: 'La Jungla Central',
      to: '',
      expected_delivery: '',
      notes: '',
      items: []
    });
    
    setShowNewOrderModal(false);
    alert(`Pedido ${newOrderId} creado exitosamente`);
  };

  const addItemToOrder = () => {
    const productSelect = document.getElementById('product-select') as HTMLSelectElement;
    const quantityInput = document.getElementById('item-quantity') as HTMLInputElement;
    const priceInput = document.getElementById('item-price') as HTMLInputElement;
    
    const selectedProduct = inventoryItems.find(item => item.id === parseInt(productSelect?.value || '0'));
    const quantity = parseInt(quantityInput?.value || '1');
    const unitPrice = parseFloat(priceInput?.value || '0');
    
    if (!selectedProduct || quantity <= 0 || unitPrice <= 0) {
      alert('Por favor, completa todos los campos del producto');
      return;
    }

    const newItem = {
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      quantity: quantity,
      unit_price: unitPrice
    };

    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    // Limpiar campos
    if (productSelect) productSelect.value = '';
    if (quantityInput) quantityInput.value = '1';
    if (priceInput) priceInput.value = '';
  };

  const removeItemFromOrder = (index: number) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', padding: '2rem', borderRadius: '0 0 24px 24px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Package size={32} style={{ color: 'white' }} />
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'white', margin: 0 }}>Centro Logístico</h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Información del Usuario */}
            <div style={{ color: 'white', textAlign: 'right' }}>
              <div style={{ fontWeight: '600' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                {currentUser.role === 'logistics_director' ? '👨‍💼 Director de Logística' : '👤 Encargado de Centro'}
              </div>
            </div>
            
            {/* Botón de Notificaciones */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  color: 'white',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                🔔
                {getUnreadNotifications().length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600'
                  }}>
                    {getUnreadNotifications().length}
                  </span>
                )}
              </button>
              
              {/* Panel de Notificaciones */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  width: '350px',
                  maxHeight: '400px',
                  overflow: 'auto',
                  zIndex: 1000
                }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                    <h3 style={{ margin: 0, color: '#374151' }}>🔔 Notificaciones</h3>
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                      No hay notificaciones
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div
                        key={notification.id}
                        onClick={() => markNotificationAsRead(notification.id)}
                        style={{
                          padding: '1rem',
                          borderBottom: '1px solid #f3f4f6',
                          cursor: 'pointer',
                          backgroundColor: notification.read ? 'transparent' : '#f0f9ff',
                          borderLeft: notification.urgent ? '4px solid #ef4444' : 'none'
                        }}
                      >
                        <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                          {notification.title}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                          {notification.message}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                          {new Date(notification.created_at).toLocaleString('es-ES')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 2rem' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'white', padding: '0.5rem', borderRadius: '16px', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
          {[
            { key: 'inventory', label: 'Inventario', icon: '📦' },
            { key: 'orders', label: 'Pedidos', icon: '🛒' },
            { key: 'suppliers', label: 'Proveedores', icon: '🏪' },
            { key: 'reports', label: 'Reportes', icon: '📊' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                border: 'none',
                backgroundColor: activeTab === tab.key ? '#059669' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#6b7280',
                fontWeight: activeTab === tab.key ? '600' : '500',
                cursor: 'pointer',
                borderRadius: '12px',
                fontSize: '0.875rem'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filtros específicos por pestaña */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              type="text"
              placeholder={
                activeTab === 'inventory' ? 'Buscar productos...' :
                activeTab === 'orders' ? 'Buscar pedidos...' :
                activeTab === 'suppliers' ? 'Buscar proveedores...' : 'Buscar...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1px solid #d1d5db', borderRadius: '12px', backgroundColor: 'white' }}
            />
          </div>
          
          {/* Filtros para Inventario */}
          {activeTab === 'inventory' && (
            <>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '12px', backgroundColor: 'white' }}>
                <option value="all">Todos los estados</option>
                <option value="in_stock">En Stock</option>
                <option value="low_stock">Stock Bajo</option>
                <option value="out_of_stock">Sin Stock</option>
              </select>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '12px', backgroundColor: 'white' }}>
                <option value="all">Todas las categorías</option>
                <option value="Vestuario">Vestuario</option>
                <option value="Material Deportivo">Material Deportivo</option>
                <option value="Merchandising">Merchandising</option>
                <option value="Instalaciones">Instalaciones</option>
                <option value="Consumibles">Consumibles</option>
              </select>
              <select value={centerFilter} onChange={(e) => setCenterFilter(e.target.value)} style={{ padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '12px', backgroundColor: 'white' }}>
                <option value="all">Todos los centros</option>
                <option value="central">🏢 Central</option>
                <option value="sevilla">🏪 Sevilla</option>
                <option value="jerez">🏪 Jerez</option>
                <option value="puerto">🏪 Puerto</option>
              </select>
            </>
          )}


          {/* Filtros para Proveedores */}
          {activeTab === 'suppliers' && (
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '0.75rem 1rem', border: '1px solid #d1d5db', borderRadius: '12px', backgroundColor: 'white' }}>
              <option value="all">Todos los tipos</option>
              <option value="local">🏠 Local</option>
              <option value="nacional">🇪🇸 Nacional</option>
              <option value="internacional">🌍 Internacional</option>
            </select>
          )}

          {/* Botones de acción */}
          {(activeTab === 'inventory' || activeTab === 'orders' || activeTab === 'suppliers') && (
            <button
              onClick={() => {
                if (activeTab === 'inventory') {
                  setShowNewProductModal(true);
                } else if (activeTab === 'orders') {
                  setShowNewOrderModal(true);
                } else {
                  alert('Funcionalidad de nuevo proveedor próximamente');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}
            >
              <Plus size={16} />
              {activeTab === 'inventory' ? 'Nuevo Producto' :
               activeTab === 'orders' ? 'Nuevo Pedido' :
               'Nuevo Proveedor'}
            </button>
          )}
        </div>

        {/* Pestaña Inventario */}
        {activeTab === 'inventory' && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr', backgroundColor: '#f9fafb', padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>
              <div>Artículo</div>
              <div>Centro</div>
              <div>Categoría</div>
              <div>Stock</div>
              <div>Mín.</div>
              <div>P. Compra</div>
              <div>P. Venta</div>
              <div>Estado</div>
            </div>
            
            {filteredItems.map((item: InventoryItem) => (
            <div 
              key={item.id} 
              onClick={() => handleEditProduct(item)}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr', 
                padding: '1rem', 
                borderBottom: '1px solid #f3f4f6', 
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div>
                <div style={{ fontWeight: '600' }}>{item.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{item.supplier} • {item.location}</div>
              </div>
              <div>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  backgroundColor: item.center === 'central' ? '#f3e8ff' : '#e0f2fe',
                  color: item.center === 'central' ? '#7c3aed' : '#0277bd'
                }}>
                  {item.center === 'central' ? '🏢 Central' : 
                   item.center === 'sevilla' ? '🏪 Sevilla' :
                   item.center === 'jerez' ? '🏪 Jerez' : '🏪 Puerto'}
                </span>
              </div>
              <div>{item.category}</div>
              <div style={{ fontWeight: '600', color: item.quantity <= item.min_stock ? '#dc2626' : '#059669' }}>{item.quantity}</div>
              <div>{item.min_stock}</div>
              <div style={{ color: '#dc2626', fontWeight: '600' }}>€{item.purchase_price.toFixed(2)}</div>
              <div style={{ color: '#059669', fontWeight: '600' }}>€{item.sale_price.toFixed(2)}</div>
              <div>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '8px', 
                  fontSize: '0.75rem',
                  backgroundColor: item.status === 'in_stock' ? '#dcfce7' : item.status === 'low_stock' ? '#fef3c7' : '#fee2e2',
                  color: item.status === 'in_stock' ? '#166534' : item.status === 'low_stock' ? '#92400e' : '#dc2626'
                }}>
                  {item.status === 'in_stock' ? '✅' : item.status === 'low_stock' ? '⚠️' : '❌'}
                </span>
              </div>
            </div>
            ))}
          </div>
        )}

        {/* Pestaña Pedidos */}
        {activeTab === 'orders' && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem' }}>
            {/* Resumen de Pedidos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: '#fef3c7', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#92400e' }}>{getOrderStats().pendingOrders}</div>
                <div style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: '600' }}>⏳ Pedidos Pendientes</div>
              </div>
              <div style={{ backgroundColor: '#dbeafe', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af' }}>{getOrderStats().sentOrders}</div>
                <div style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: '600' }}>🚚 Pedidos Enviados</div>
              </div>
              <div style={{ backgroundColor: '#dcfce7', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#166534' }}>€{getOrderStats().pendingAmount.toFixed(2)}</div>
                <div style={{ fontSize: '0.875rem', color: '#166534', fontWeight: '600' }}>💰 Pendiente de Cobro</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Gestión de Pedidos</h2>
              <button
                onClick={() => setShowNewOrderModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}
              >
                <Plus size={16} />
                Nuevo Pedido
              </button>
            </div>

            {/* Filtros de Pedidos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <input
                type="text"
                placeholder="Buscar por número, origen o destino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
              />
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
              >
                <option value="all">Todos los estados</option>
                <option value="pending">⏳ Pendientes</option>
                <option value="processing">🔄 En Proceso</option>
                <option value="sent">🚚 Enviados</option>
                <option value="delivered">✅ Entregados</option>
                <option value="cancelled">❌ Cancelados</option>
              </select>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
              >
                <option value="all">Todos los tipos</option>
                <option value="center_to_brand">📥 Centro → Marca</option>
                <option value="brand_to_supplier">📤 Marca → Proveedor</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr 1fr 1fr 1fr 1fr', backgroundColor: '#f9fafb', padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>
              <div>Nº Pedido</div>
              <div>Tipo</div>
              <div>De → Para</div>
              <div>Fecha</div>
              <div>Entrega</div>
              <div>Importe</div>
              <div>Estado</div>
            </div>
            
            {filteredOrders.map((order: Order) => (
            <div 
              key={order.id} 
              onClick={() => handleOrderClick(order)}
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '1.5fr 1fr 1.5fr 1fr 1fr 1fr 1fr', 
                padding: '1rem', 
                borderBottom: '1px solid #f3f4f6', 
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div>
                <div style={{ fontWeight: '600' }}>{order.id}</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{order.items.length} artículo(s)</div>
              </div>
              <div>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  backgroundColor: order.type === 'center_to_brand' ? '#e0f2fe' : '#f3e8ff',
                  color: order.type === 'center_to_brand' ? '#0277bd' : '#7c3aed'
                }}>
                  {order.type === 'center_to_brand' ? '📥 C→M' : '📤 M→P'}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem' }}>{order.from}</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>→ {order.to}</div>
              </div>
              <div>{new Date(order.date).toLocaleDateString('es-ES')}</div>
              <div>{new Date(order.delivery_date).toLocaleDateString('es-ES')}</div>
              <div style={{ fontWeight: '600', color: '#059669' }}>€{order.amount.toFixed(2)}</div>
              <div>
                <span style={{ 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '8px', 
                  fontSize: '0.75rem',
                  backgroundColor: order.status === 'delivered' ? '#dcfce7' : 
                                 order.status === 'sent' ? '#dbeafe' :
                                 order.status === 'processing' ? '#e0f2fe' :
                                 order.status === 'pending' ? '#fef3c7' : 
                                 order.status === 'cancelled' ? '#fee2e2' : '#f3f4f6',
                  color: order.status === 'delivered' ? '#166534' : 
                         order.status === 'sent' ? '#1e40af' :
                         order.status === 'processing' ? '#0277bd' :
                         order.status === 'pending' ? '#92400e' : 
                         order.status === 'cancelled' ? '#dc2626' : '#6b7280'
                }}>
                  {order.status === 'delivered' ? '✅ Entregado' : 
                   order.status === 'sent' ? '🚚 Enviado' :
                   order.status === 'processing' ? '🔄 En Proceso' :
                   order.status === 'pending' ? '⏳ Pendiente' : 
                   order.status === 'cancelled' ? '❌ Cancelado' : '❓ Desconocido'}
                </span>
              </div>
            </div>
            ))}
          </div>
        )}

        {/* Pestaña Proveedores */}
        {activeTab === 'suppliers' && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>Directorio de Proveedores</h2>
              <button
                onClick={() => alert('Funcionalidad próximamente')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                <Plus size={16} />
                Nuevo Proveedor
              </button>
            </div>

            {/* Tabla de Proveedores */}
            <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr', backgroundColor: '#f9fafb', padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>
                <div>Proveedor</div>
                <div>Tipo</div>
                <div>Contacto</div>
                <div>Rating</div>
                <div>Total Pedidos</div>
              </div>
              
              {filteredSuppliers.map((supplier: Supplier) => (
                <div 
                  key={supplier.id} 
                  onClick={() => handleSupplierClick(supplier)}
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr', 
                    padding: '1rem', 
                    borderBottom: '1px solid #f3f4f6', 
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div>
                    <div style={{ fontWeight: '600' }}>{supplier.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {supplier.category.slice(0, 2).join(', ')}
                      {supplier.category.length > 2 && ` +${supplier.category.length - 2}`}
                    </div>
                  </div>
                  <div>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      backgroundColor: supplier.type === 'local' ? '#dcfce7' : supplier.type === 'nacional' ? '#dbeafe' : '#f3e8ff',
                      color: supplier.type === 'local' ? '#166534' : supplier.type === 'nacional' ? '#1e40af' : '#7c3aed'
                    }}>
                      {supplier.type === 'local' ? '🏠 Local' : supplier.type === 'nacional' ? '🇪🇸 Nacional' : '🌍 Internacional'}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem' }}>{supplier.contact_person}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{supplier.city}</div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span style={{ color: '#f59e0b' }}>⭐</span>
                      <span style={{ fontWeight: '600' }}>{supplier.rating}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: '600' }}>{supplier.total_orders}</div>
                    <div style={{ fontSize: '0.75rem', color: '#059669' }}>€{supplier.total_amount.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pestaña Reportes */}
        {activeTab === 'reports' && (
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px' }}>
            <h3>Resumen</h3>
            <p>Total productos: {inventoryItems.length}</p>
            <p>Stock bajo: {inventoryItems.filter(item => item.status === 'low_stock').length}</p>
          </div>
        )}

        {/* Modal Nuevo Producto */}
        {showNewProductModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '500px' }}>
              <h2 style={{ margin: '0 0 1.5rem 0' }}>Nuevo Producto</h2>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Nombre del producto"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  >
                    <option value="Vestuario">👕 Vestuario</option>
                    <option value="Material Deportivo">🏋️ Material Deportivo</option>
                    <option value="Merchandising">🎁 Merchandising</option>
                    <option value="Instalaciones">🏢 Instalaciones</option>
                    <option value="Consumibles">🧽 Consumibles</option>
                  </select>
                  
                  <input
                    type="text"
                    placeholder="Talla/Tamaño (ej: M, L)"
                    value={newProduct.size}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, size: e.target.value }))}
                    style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  />
                </div>

                <select
                  value={newProduct.center}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, center: e.target.value as any }))}
                  style={{ padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                >
                  <option value="sevilla">🏪 Sevilla</option>
                  <option value="jerez">🏪 Jerez</option>
                  <option value="puerto">🏪 Puerto</option>
                  <option value="central">🏢 Central</option>
                </select>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                    🏭 Proveedor
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Textiles Deportivos SL"
                    value={newProduct.supplier}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, supplier: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                      📍 Ubicación Física
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: A1, B2, M1"
                      value={newProduct.location}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, location: e.target.value }))}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                      📦 Cantidad Inicial
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                      min="0"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#f59e0b' }}>
                      ⚠️ Stock Mínimo
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newProduct.min_stock}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, min_stock: parseInt(e.target.value) || 0 }))}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                      min="0"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                      📊 Stock Máximo
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={newProduct.max_stock}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, max_stock: parseInt(e.target.value) || 0 }))}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                      min="0"
                    />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#dc2626' }}>
                      💰 Precio de Compra (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newProduct.purchase_price}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, purchase_price: parseFloat(e.target.value) || 0 }))}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#059669' }}>
                      💵 Precio de Venta (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newProduct.sale_price}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, sale_price: parseFloat(e.target.value) || 0 }))}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button onClick={() => setShowNewProductModal(false)} style={{ padding: '0.75rem 1.5rem', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={handleCreateProduct} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Crear Producto
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar Producto */}
        {showEditProductModal && editingProduct && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
              <h2 style={{ margin: '0 0 1.5rem 0' }}>✏️ Editar: {editingProduct.name}</h2>
              
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                    📦 Cantidad Actual
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={editingProduct.quantity}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, quantity: parseInt(e.target.value) || 0 } : null)}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    min="0"
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                    📍 Ubicación Física
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: A1, B2, M1"
                    value={editingProduct.location}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, location: e.target.value } : null)}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#dc2626' }}>
                      💰 Precio de Compra (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={editingProduct.purchase_price}
                      onChange={(e) => setEditingProduct(prev => prev ? { ...prev, purchase_price: parseFloat(e.target.value) || 0 } : null)}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#059669' }}>
                      💵 Precio de Venta (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={editingProduct.sale_price}
                      onChange={(e) => setEditingProduct(prev => prev ? { ...prev, sale_price: parseFloat(e.target.value) || 0 } : null)}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button onClick={() => setShowEditProductModal(false)} style={{ padding: '0.75rem 1.5rem', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={handleUpdateProduct} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detalle de Pedido */}
        {showOrderDetailModal && selectedOrder && (
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
                {/* Botones de acción según el estado del pedido */}
                {selectedOrder.status === 'pending' && currentUser.role === 'logistics_director' && (
                  <button 
                    onClick={() => {
                      processOrder(selectedOrder.id);
                      setShowOrderDetailModal(false);
                    }}
                    style={{ 
                      padding: '0.75rem 1.5rem', 
                      backgroundColor: '#f59e0b', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    🔄 Poner en Proceso
                  </button>
                )}
                
                {selectedOrder.status === 'processing' && currentUser.role === 'logistics_director' && (
                  <button 
                    onClick={() => {
                      shipOrder(selectedOrder.id);
                      setShowOrderDetailModal(false);
                    }}
                    style={{ 
                      padding: '0.75rem 1.5rem', 
                      backgroundColor: '#3b82f6', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    🚚 Pedido Enviado
                  </button>
                )}
                
                {/* Botón Cancelar Pedido - disponible para pedidos pendientes y en proceso */}
                {(selectedOrder.status === 'pending' || selectedOrder.status === 'processing') && currentUser.role === 'logistics_director' && (
                  <button 
                    onClick={() => setShowCancelModal(true)}
                    style={{ 
                      padding: '0.75rem 1.5rem', 
                      backgroundColor: '#dc2626', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    ❌ Cancelar Pedido
                  </button>
                )}
                
                <button 
                  onClick={() => setShowOrderDetailModal(false)} 
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    backgroundColor: '#6b7280', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer' 
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Cancelar Pedido */}
        {showCancelModal && selectedOrder && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '500px' }}>
              <h2 style={{ margin: '0 0 1.5rem 0', color: '#dc2626' }}>❌ Cancelar Pedido: {selectedOrder.id}</h2>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                  Motivo de la cancelación:
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '1rem' }}
                >
                  <option value="">Selecciona un motivo</option>
                  <option value="Stock insuficiente">Stock insuficiente</option>
                  <option value="Proveedor no disponible">Proveedor no disponible</option>
                  <option value="Problema de calidad">Problema de calidad</option>
                  <option value="Solicitud del centro">Solicitud del centro</option>
                  <option value="Error en el pedido">Error en el pedido</option>
                  <option value="Otro">Otro motivo</option>
                </select>
                
                {cancelReason === 'Otro' && (
                  <textarea
                    placeholder="Especifica el motivo..."
                    onChange={(e) => setCancelReason(`Otro: ${e.target.value}`)}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '80px', resize: 'vertical' }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                  }}
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px', 
                    backgroundColor: 'white', 
                    cursor: 'pointer' 
                  }}
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    if (cancelReason) {
                      cancelOrder(selectedOrder.id, cancelReason);
                      setShowOrderDetailModal(false);
                    } else {
                      alert('Por favor, selecciona un motivo de cancelación');
                    }
                  }}
                  disabled={!cancelReason}
                  style={{ 
                    padding: '0.75rem 1.5rem', 
                    backgroundColor: cancelReason ? '#dc2626' : '#9ca3af', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: cancelReason ? 'pointer' : 'not-allowed',
                    fontWeight: '600'
                  }}
                >
                  ❌ Confirmar Cancelación
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detalle de Proveedor */}
        {showSupplierDetailModal && selectedSupplier && (
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
                    <span key={index} style={{ padding: '0.25rem 0.75rem', backgroundColor: '#f3f4f6', borderRadius: '20px', fontSize: '0.875rem' }}>
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <button onClick={() => setShowSupplierDetailModal(false)} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Modal Nuevo Pedido */}
        {showNewOrderModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>🛒 Crear Nuevo Pedido</h2>
                <button
                  onClick={() => setShowNewOrderModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}
                >
                  ×
                </button>
              </div>

              {/* Información del pedido */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Proveedor *</label>
                  <select
                    value={newOrder.supplier_id}
                    onChange={(e) => {
                      const selectedSupplier = suppliers.find(s => s.id.toString() === e.target.value);
                      setNewOrder(prev => ({
                        ...prev,
                        supplier_id: e.target.value,
                        to: selectedSupplier?.name || ''
                      }));
                    }}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  >
                    <option value="">Seleccionar proveedor</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name} - {supplier.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Fecha de Entrega</label>
                  <input
                    type="date"
                    value={newOrder.expected_delivery}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, expected_delivery: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Añadir productos */}
              <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '600' }}>Añadir Productos</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Producto</label>
                    <select
                      id="product-select"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    >
                      <option value="">Seleccionar producto</option>
                      {inventoryItems.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} - Stock: {item.quantity}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Cantidad</label>
                    <input
                      id="item-quantity"
                      type="number"
                      min="1"
                      defaultValue="1"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Precio Unit. (€)</label>
                    <input
                      id="item-price"
                      type="number"
                      step="0.01"
                      min="0"
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    />
                  </div>

                  <button
                    onClick={addItemToOrder}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Añadir
                  </button>
                </div>
              </div>

              {/* Lista de productos añadidos */}
              {newOrder.items.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: '600' }}>Productos en el Pedido</h3>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', backgroundColor: '#f9fafb', padding: '0.75rem', fontWeight: '600', fontSize: '0.875rem' }}>
                      <div>Producto</div>
                      <div>Cantidad</div>
                      <div>Precio Unit.</div>
                      <div>Total</div>
                      <div></div>
                    </div>
                    {newOrder.items.map((item, index) => (
                      <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', padding: '0.75rem', borderTop: '1px solid #f3f4f6', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.875rem' }}>{item.product_name}</div>
                        <div style={{ fontSize: '0.875rem' }}>{item.quantity}</div>
                        <div style={{ fontSize: '0.875rem' }}>€{item.unit_price.toFixed(2)}</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>€{(item.quantity * item.unit_price).toFixed(2)}</div>
                        <button
                          onClick={() => removeItemFromOrder(index)}
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', padding: '0.75rem', borderTop: '2px solid #e5e7eb', backgroundColor: '#f9fafb', fontWeight: '700' }}>
                      <div></div>
                      <div></div>
                      <div>TOTAL:</div>
                      <div>€{newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}</div>
                      <div></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notas */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Notas del Pedido</label>
                <textarea
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Instrucciones especiales, comentarios..."
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowNewOrderModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateOrder}
                  disabled={!newOrder.supplier_id || newOrder.items.length === 0}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: newOrder.supplier_id && newOrder.items.length > 0 ? '#059669' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: newOrder.supplier_id && newOrder.items.length > 0 ? 'pointer' : 'not-allowed',
                    fontWeight: '600'
                  }}
                >
                  Crear Pedido
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogisticsManagementSystem;
