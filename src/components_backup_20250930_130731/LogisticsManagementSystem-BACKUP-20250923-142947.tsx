import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, Plus, Edit, Eye, Trash2, X, Settings, Bell, AlertTriangle, Clock, MapPin, BarChart3, ShoppingCart, Building, Activity, FileText } from 'lucide-react';
import InventoryKPIDashboard from './logistics/InventoryKPIDashboard';
import RealInventoryTable from './logistics/RealInventoryTable';
import QuarterlyReviewSystem from './logistics/QuarterlyReviewSystem';

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
  role: 'ceo' | 'logistics_director' | 'hr_director' | 'online_director' | 'events_director' | 'marketing_director' | 'center_manager' | 'trainer' | 'employee';
  center: 'central' | 'sevilla' | 'jerez' | 'puerto';
  permissions: {
    // Módulos principales
    canAccessLogistics: boolean;
    canAccessMaintenance: boolean;
    canAccessAccounting: boolean;
    canAccessMarketing: boolean;
    canAccessHR: boolean;
    canAccessOnline: boolean;
    canAccessEvents: boolean;
    
    // Permisos específicos de logística
    canViewReports: boolean;
    canManageInventory: boolean;
    canCreateOrders: boolean;
    canProcessOrders: boolean;
    canManageSuppliers: boolean;
    canManageTools: boolean;
    canViewAllCenters: boolean;
    canModifyPrices: boolean;
    
    // Permisos de empleados
    canViewOwnCenter: boolean;
    canUseTimeTracking: boolean;
    canUseChecklist: boolean;
    canMessageHR: boolean;
    
    // Permisos administrativos
    canManageUsers: boolean;
  };
  customPermissions?: string[]; // Permisos personalizados asignados manualmente
}

interface Notification {
  id: number;
  type: 'new_order' | 'low_stock' | 'order_update' | 'order_request' | 'stock_alert' | 'checklist_incident' | 'maintenance_due';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  from: string;
  urgent?: boolean;
  order_id?: string;
  created_at?: string;
}

interface Tool {
  id: number;
  name: string;
  category: 'Limpieza' | 'Mantenimiento' | 'Seguridad' | 'Deportivo' | 'Oficina' | 'Electrónico';
  brand: string;
  model: string;
  serial_number?: string;
  purchase_date: string;
  purchase_price: number;
  current_location: string;
  status: 'available' | 'in_use' | 'maintenance' | 'lost' | 'damaged';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  last_maintenance?: string;
  next_maintenance?: string;
  assigned_to?: string;
  notes?: string;
}

interface ToolLocation {
  id: string;
  name: string;
  type: 'permanent' | 'temporary' | 'center' | 'storage';
  address?: string;
  contact_person?: string;
  contact_phone?: string;
  is_active: boolean;
}

interface ToolMovement {
  id: string;
  tool_id: number;
  from_location: string;
  to_location: string;
  moved_by: string;
  moved_at: string;
  reason: 'transfer' | 'maintenance' | 'loan' | 'return' | 'lost' | 'found';
  expected_return?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'overdue';
}

// Función para obtener permisos basados en el rol
const getRolePermissions = (role: User['role']) => {
  switch (role) {
    case 'ceo':
      return {
        // Módulos principales
        canAccessLogistics: true,
        canAccessMaintenance: true,
        canAccessAccounting: true,
        canAccessMarketing: true,
        canAccessHR: true,
        canAccessOnline: true,
        canAccessEvents: true,
        
        // Permisos específicos de logística
        canViewReports: true,
        canManageInventory: true,
        canCreateOrders: true,
        canProcessOrders: true,
        canManageSuppliers: true,
        canManageTools: true,
        canViewAllCenters: true,
        canModifyPrices: true,
        
        // Permisos de empleados
        canViewOwnCenter: true,
        canUseTimeTracking: true,
        canUseChecklist: true,
        canMessageHR: true,
        
        // Permisos administrativos
        canManageUsers: true
      };
    case 'logistics_director':
      return {
        // Módulos principales
        canAccessLogistics: true,
        canAccessMaintenance: false,
        canAccessAccounting: false,
        canAccessMarketing: false,
        canAccessHR: false,
        canAccessOnline: false,
        canAccessEvents: false,
        
        // Permisos específicos de logística
        canViewReports: true,
        canManageInventory: true,
        canCreateOrders: true,
        canProcessOrders: true,
        canManageSuppliers: true,
        canManageTools: true,
        canViewAllCenters: true,
        canModifyPrices: true,
        
        // Permisos de empleados
        canViewOwnCenter: true,
        canUseTimeTracking: true,
        canUseChecklist: true,
        canMessageHR: true,
        
        // Permisos administrativos
        canManageUsers: false
      };
    case 'hr_director':
    case 'online_director':
    case 'events_director':
    case 'marketing_director':
      return {
        // Módulos principales
        canAccessLogistics: false,
        canAccessMaintenance: false,
        canAccessAccounting: false,
        canAccessMarketing: false,
        canAccessHR: false,
        canAccessOnline: false,
        canAccessEvents: false,
        
        // Permisos específicos de logística
        canViewReports: true,
        canManageInventory: false,
        canCreateOrders: true,
        canProcessOrders: false,
        canManageSuppliers: false,
        canManageTools: false,
        canViewAllCenters: false,
        canModifyPrices: false,
        
        // Permisos de empleados
        canViewOwnCenter: true,
        canUseTimeTracking: true,
        canUseChecklist: true,
        canMessageHR: true,
        
        // Permisos administrativos
        canManageUsers: false
      };
    case 'center_manager':
      return {
        // Módulos principales
        canAccessLogistics: false,
        canAccessMaintenance: false,
        canAccessAccounting: false,
        canAccessMarketing: false,
        canAccessHR: false,
        canAccessOnline: false,
        canAccessEvents: false,
        
        // Permisos específicos de logística
        canViewReports: true,
        canManageInventory: true,
        canCreateOrders: true,
        canProcessOrders: false,
        canManageSuppliers: false,
        canManageTools: true,
        canViewAllCenters: false,
        canModifyPrices: false,
        
        // Permisos de empleados
        canViewOwnCenter: true,
        canUseTimeTracking: true,
        canUseChecklist: true,
        canMessageHR: true,
        
        // Permisos administrativos
        canManageUsers: false
      };
    case 'trainer':
    case 'employee':
      return {
        // Módulos principales
        canAccessLogistics: false,
        canAccessMaintenance: false,
        canAccessAccounting: false,
        canAccessMarketing: false,
        canAccessHR: false,
        canAccessOnline: false,
        canAccessEvents: false,
        
        // Permisos específicos de logística
        canViewReports: false,
        canManageInventory: false,
        canCreateOrders: false,
        canProcessOrders: false,
        canManageSuppliers: false,
        canManageTools: false,
        canViewAllCenters: false,
        canModifyPrices: false,
        
        // Permisos de empleados
        canViewOwnCenter: true,
        canUseTimeTracking: true,
        canUseChecklist: true,
        canMessageHR: true,
        
        // Permisos administrativos
        canManageUsers: false
      };
    default:
      return {
        // Módulos principales
        canAccessLogistics: false,
        canAccessMaintenance: false,
        canAccessAccounting: false,
        canAccessMarketing: false,
        canAccessHR: false,
        canAccessOnline: false,
        canAccessEvents: false,
        
        // Permisos específicos de logística
        canViewReports: false,
        canManageInventory: false,
        canCreateOrders: false,
        canProcessOrders: false,
        canManageSuppliers: false,
        canManageTools: false,
        canViewAllCenters: false,
        canModifyPrices: false,
        
        // Permisos de empleados
        canViewOwnCenter: true,
        canUseTimeTracking: true,
        canUseChecklist: true,
        canMessageHR: true,
        
        // Permisos administrativos
        canManageUsers: false
      };
  }
};

// Datos reales del equipo La Jungla
const laJunglaTeam: User[] = [
  // Dirección
  { 
    id: '1', 
    name: 'Carlos Suárez', 
    role: 'ceo', 
    center: 'central',
    permissions: getRolePermissions('ceo')
  },
  { 
    id: '2', 
    name: 'Benito Morales', 
    role: 'logistics_director', 
    center: 'central',
    permissions: getRolePermissions('logistics_director')
  },
  { 
    id: '3', 
    name: 'Vicente Corbaón', 
    role: 'hr_director', 
    center: 'central',
    permissions: getRolePermissions('hr_director')
  },
  { 
    id: '4', 
    name: 'Jonathan Padilla', 
    role: 'online_director', 
    center: 'central',
    permissions: getRolePermissions('online_director')
  },
  { 
    id: '5', 
    name: 'Antonio Durán', 
    role: 'events_director', 
    center: 'central',
    permissions: getRolePermissions('events_director')
  },
  { 
    id: '6', 
    name: 'Diego Montilla', 
    role: 'marketing_director', 
    center: 'central',
    permissions: getRolePermissions('marketing_director')
  },
  
  // Centro Sevilla
  { 
    id: '7', 
    name: 'Fran Giraldez', 
    role: 'center_manager', 
    center: 'sevilla',
    permissions: getRolePermissions('center_manager')
  },
  { 
    id: '8', 
    name: 'Salva Cabrera', 
    role: 'center_manager', 
    center: 'sevilla',
    permissions: getRolePermissions('center_manager')
  },
  { 
    id: '9', 
    name: 'Javier Surian', 
    role: 'trainer', 
    center: 'sevilla',
    permissions: getRolePermissions('trainer')
  },
  { 
    id: '10', 
    name: 'Jesús Rosado', 
    role: 'trainer', 
    center: 'sevilla',
    permissions: getRolePermissions('trainer')
  },
  { 
    id: '11', 
    name: 'Jesús Arias', 
    role: 'trainer', 
    center: 'sevilla',
    permissions: getRolePermissions('trainer')
  },
  { 
    id: '12', 
    name: 'Santi Frías', 
    role: 'trainer', 
    center: 'sevilla',
    permissions: getRolePermissions('trainer')
  },
  
  // Centro Jerez
  { 
    id: '13', 
    name: 'Iván Fernández', 
    role: 'center_manager', 
    center: 'jerez',
    permissions: getRolePermissions('center_manager')
  },
  { 
    id: '14', 
    name: 'Pablo Benítez', 
    role: 'center_manager', 
    center: 'jerez',
    permissions: getRolePermissions('center_manager')
  },
  { 
    id: '15', 
    name: 'Rodri', 
    role: 'trainer', 
    center: 'jerez',
    permissions: getRolePermissions('trainer')
  },
  { 
    id: '16', 
    name: 'Mario', 
    role: 'trainer', 
    center: 'jerez',
    permissions: getRolePermissions('trainer')
  },
  { 
    id: '17', 
    name: 'Antonio', 
    role: 'trainer', 
    center: 'jerez',
    permissions: getRolePermissions('trainer')
  },
  { 
    id: '18', 
    name: 'Fran', 
    role: 'trainer', 
    center: 'jerez',
    permissions: getRolePermissions('trainer')
  },
  
  // Centro Puerto
  { 
    id: '19', 
    name: 'Guillermo', 
    role: 'center_manager', 
    center: 'puerto',
    permissions: getRolePermissions('center_manager')
  },
  { 
    id: '20', 
    name: 'Adrián', 
    role: 'center_manager', 
    center: 'puerto',
    permissions: getRolePermissions('center_manager')
  },
  { 
    id: '21', 
    name: 'José', 
    role: 'employee', 
    center: 'puerto',
    permissions: getRolePermissions('employee')
  },
  { 
    id: '22', 
    name: 'Keko', 
    role: 'employee', 
    center: 'puerto',
    permissions: getRolePermissions('employee')
  },
  { 
    id: '23', 
    name: 'Jonathan', 
    role: 'employee', 
    center: 'puerto',
    permissions: getRolePermissions('employee')
  },
  { 
    id: '24', 
    name: 'Fran', 
    role: 'employee', 
    center: 'puerto',
    permissions: getRolePermissions('employee')
  }
];

const LogisticsManagementSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('kpis');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [centerFilter, setCenterFilter] = useState('all');
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentUser, setCurrentUser] = useState<User>(laJunglaTeam.find(user => user.name === 'Benito Morales') || laJunglaTeam[0]);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'order_request',
      title: 'Pedido urgente desde Sevilla',
      message: 'REQ-2025-003: Fran Giraldez solicita 20 toallas La Jungla y 5 desinfectantes',
      timestamp: new Date().toISOString(),
      read: false,
      priority: 'high',
      from: 'Fran Giraldez - Sevilla'
    },
    {
      id: 2,
      type: 'stock_alert',
      title: 'Stock crítico en Puerto',
      message: 'Desinfectante en Centro Puerto: 0 unidades (mínimo: 5) - Guillermo necesita reposición',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high',
      from: 'Sistema - Puerto'
    },
    {
      id: 3,
      type: 'checklist_incident',
      title: 'Incidencia reportada por Iván',
      message: 'Centro Jerez: Se rompió 1 goma elástica durante clase de Rodri - Stock actualizado automáticamente',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'medium',
      from: 'Iván Fernández - Jerez'
    },
    {
      id: 4,
      type: 'maintenance_due',
      title: 'Mantenimiento cinta de correr vencido',
      message: 'Cinta Technogym en Sevilla requiere mantenimiento desde hace 3 días - Contactar técnico',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'medium',
      from: 'Sistema - Sevilla'
    }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showSupplierDetailModal, setShowSupplierDetailModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showProductSelectorModal, setShowProductSelectorModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  
  // Estados para herramientas
  const [tools, setTools] = useState<Tool[]>([]);
  const [toolLocations, setToolLocations] = useState<ToolLocation[]>([]);
  const [toolMovements, setToolMovements] = useState<ToolMovement[]>([]);
  const [showNewToolModal, setShowNewToolModal] = useState(false);
  const [showMoveToolModal, setShowMoveToolModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [toolSearchTerm, setToolSearchTerm] = useState('');
  const [toolStatusFilter, setToolStatusFilter] = useState('all');
  const [toolLocationFilter, setToolLocationFilter] = useState('all');
  const [newTool, setNewTool] = useState({
    name: '',
    category: 'Limpieza' as Tool['category'],
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    purchase_price: 0,
    current_location: 'central',
    status: 'available' as Tool['status'],
    condition: 'excellent' as Tool['condition'],
    assigned_to: '',
    notes: ''
  });

  const [newOrder, setNewOrder] = useState({
    supplier_id: '',
    type: 'center_to_brand' as 'brand_to_supplier' | 'center_to_brand',
    from: '',
    to: 'La Jungla Central',
    center_id: '',
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
    // Cargar inventario real desde Supabase
    const loadInventoryFromSupabase = async () => {
      try {
        console.log(' Cargando inventario desde Supabase...');
        
        // Importar supabase
        const { supabase } = await import('../lib/supabase');
        
        const { data, error } = await supabase
          .from('inventory_items')
          .select('*')
          .in('center_id', [9, 10, 11]);

        if (error) {
          console.error(' Error cargando inventario:', error);
          return;
        }

        if (data && data.length > 0) {
          console.log(` ${data.length} items cargados desde Supabase`);
          
          // Convertir datos de Supabase al formato del componente
          const convertedItems: InventoryItem[] = data.map(item => ({
            id: item.id,
            name: item.nombre_item || item.name || 'Sin nombre',
            category: item.categoria || item.category || 'Sin categoría',
            size: item.size || item.talla || '',
            quantity: item.cantidad_actual || item.quantity || 0,
            min_stock: item.min_stock || 5,
            max_stock: item.max_stock || 100,
            purchase_price: item.precio_compra || item.cost_per_unit || 0,
            sale_price: item.precio_venta || item.selling_price || 0,
            supplier: item.proveedor || item.supplier || 'Sin proveedor',
            center: item.center_id === 9 ? 'sevilla' : 
                   item.center_id === 10 ? 'jerez' : 
                   item.center_id === 11 ? 'puerto' : 'central',
            location: item.ubicacion || item.location || 'Sin ubicación',
            last_updated: item.updated_at || new Date().toISOString(),
            status: (item.cantidad_actual || 0) === 0 ? 'out_of_stock' : 
                   (item.cantidad_actual || 0) <= (item.min_stock || 5) ? 'low_stock' : 'in_stock'
          }));

          setInventoryItems(convertedItems);
          console.log(' Inventario cargado correctamente:', convertedItems.length, 'items');
        } else {
          console.log(' No se encontraron datos de inventario en Supabase');
        }
      } catch (error) {
        console.error(' Error conectando a Supabase:', error);
      }
    };
    loadInventoryFromSupabase();
  }, []);

  useEffect(() => {
    // Datos de ejemplo para herramientas
    setTools([
      {
        id: 1,
        name: 'Aspiradora Industrial Kärcher',
        category: 'Limpieza',
        brand: 'Kärcher',
        model: 'NT 70/2',
        serial_number: 'KAR2023001',
        purchase_date: '2023-01-15',
        purchase_price: 450.00,
        current_location: 'central',
        status: 'available',
        condition: 'excellent',
        last_maintenance: '2024-01-15',
        next_maintenance: '2024-07-15',
        notes: 'Aspiradora de alta potencia para limpieza profunda'
      },
      {
        id: 2,
        name: 'Taladro Percutor Bosch',
        category: 'Mantenimiento',
        brand: 'Bosch',
        model: 'GSB 13 RE',
        serial_number: 'BSH2023002',
        purchase_date: '2023-03-10',
        purchase_price: 89.99,
        current_location: 'sevilla',
        status: 'in_use',
        condition: 'good',
        assigned_to: 'Ana García',
        last_maintenance: '2024-02-01',
        next_maintenance: '2024-08-01',
        notes: 'En uso para mantenimiento general del centro'
      },
      {
        id: 3,
        name: 'Extintor CO2 5kg',
        category: 'Seguridad',
        brand: 'Cofem',
        model: 'CO2-5',
        serial_number: 'COF2023003',
        purchase_date: '2023-02-20',
        purchase_price: 65.00,
        current_location: 'jerez',
        status: 'available',
        condition: 'excellent',
        last_maintenance: '2024-02-20',
        next_maintenance: '2025-02-20',
        notes: 'Extintor para equipos eléctricos'
      },
      {
        id: 4,
        name: 'Cinta de Correr Reparación',
        category: 'Deportivo',
        brand: 'TechnoGym',
        model: 'Run Race 1400',
        serial_number: 'TG2022004',
        purchase_date: '2022-11-05',
        purchase_price: 2500.00,
        current_location: 'taller',
        status: 'maintenance',
        condition: 'fair',
        assigned_to: 'José Ruiz',
        last_maintenance: '2024-01-10',
        notes: 'En reparación - problema con motor'
      },
      {
        id: 5,
        name: 'Ordenador Portátil HP',
        category: 'Oficina',
        brand: 'HP',
        model: 'EliteBook 840',
        serial_number: 'HP2023005',
        purchase_date: '2023-06-15',
        purchase_price: 899.00,
        current_location: 'puerto',
        status: 'in_use',
        condition: 'excellent',
        assigned_to: 'María López',
        notes: 'Portátil para gestión del centro'
      },
      {
        id: 6,
        name: 'Mopa Industrial',
        category: 'Limpieza',
        brand: 'Vileda',
        model: 'UltraSpeed Pro',
        purchase_date: '2023-04-01',
        purchase_price: 25.50,
        current_location: 'storage',
        status: 'lost',
        condition: 'good',
        notes: 'Perdida desde hace 2 semanas - última vez vista en Centro Sevilla'
      }
    ]);

    // Datos de ejemplo para movimientos de herramientas
    setToolMovements([
      {
        id: 'mov001',
        tool_id: 2,
        from_location: 'central',
        to_location: 'sevilla',
        moved_by: 'Benito Morales',
        moved_at: '2024-01-20T10:30:00Z',
        reason: 'transfer',
        notes: 'Transferido para mantenimiento del centro',
        status: 'completed'
      },
      {
        id: 'mov002',
        tool_id: 4,
        from_location: 'sevilla',
        to_location: 'taller',
        moved_by: 'Ana García',
        moved_at: '2024-01-10T14:15:00Z',
        reason: 'maintenance',
        expected_return: '2024-02-10',
        notes: 'Enviado para reparación de motor',
        status: 'overdue'
      },
      {
        id: 'mov003',
        tool_id: 6,
        from_location: 'central',
        to_location: 'sevilla',
        moved_by: 'Carlos Suárez',
        moved_at: '2024-01-05T09:00:00Z',
        reason: 'loan',
        expected_return: '2024-01-15',
        notes: 'Préstamo temporal para limpieza especial',
        status: 'overdue'
      }
    ]);

    // Datos de ejemplo para inventario
    setInventoryItems([
      {
        id: 1,
        name: 'Camiseta La Jungla Negra',
        category: 'Merchandising',
        size: 'M',
        quantity: 25,
        min_stock: 10,
        max_stock: 50,
        purchase_price: 12.50,
        sale_price: 25.00,
        supplier: 'Serigrafía Sevilla',
        center: 'sevilla',
        location: 'Recepción - Vitrina',
        status: 'in_stock',
        last_updated: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        name: 'Mancuernas Hexagonales 5kg',
        category: 'Material Deportivo',
        size: '5kg',
        quantity: 3,
        min_stock: 5,
        max_stock: 20,
        purchase_price: 28.00,
        sale_price: 45.00,
        supplier: 'Decathlon Profesional',
        center: 'jerez',
        location: 'Zona Funcional',
        status: 'low_stock',
        last_updated: '2024-01-10T14:20:00Z'
      },
      {
        id: 3,
        name: 'Desinfectante Virucida',
        category: 'Limpieza',
        size: '5L',
        quantity: 0,
        min_stock: 5,
        max_stock: 20,
        purchase_price: 15.00,
        sale_price: 22.50,
        supplier: 'Químicas Cádiz',
        center: 'puerto',
        location: 'Almacén Limpieza',
        status: 'out_of_stock',
        last_updated: '2024-01-20T16:45:00Z'
      },
      {
        id: 4,
        name: 'Gomas Elásticas Theraband',
        category: 'Material Deportivo',
        size: 'Resistencia Media',
        quantity: 15,
        min_stock: 8,
        max_stock: 25,
        purchase_price: 10.00,
        sale_price: 18.50,
        supplier: 'Fisioterapia Andalucía',
        center: 'central',
        location: 'Almacén Central A-3',
        status: 'in_stock',
        last_updated: '2024-01-12T09:15:00Z'
      },
      {
        id: 5,
        name: 'Toallas La Jungla Microfibra',
        category: 'Merchandising',
        size: '70x140cm',
        quantity: 2,
        min_stock: 15,
        max_stock: 40,
        purchase_price: 8.50,
        sale_price: 15.00,
        supplier: 'Textiles Jerez',
        center: 'sevilla',
        location: 'Recepción',
        status: 'low_stock',
        last_updated: '2024-01-18T11:30:00Z'
      },
      {
        id: 6,
        name: 'Proteína Whey La Jungla',
        category: 'Suplementos',
        size: '2kg Vainilla',
        quantity: 12,
        min_stock: 8,
        max_stock: 30,
        purchase_price: 35.00,
        sale_price: 59.90,
        supplier: 'NutriSport España',
        center: 'central',
        location: 'Zona Suplementos',
        status: 'in_stock',
        last_updated: '2024-01-22T13:45:00Z'
      },
      {
        id: 7,
        name: 'Botella La Jungla 750ml',
        category: 'Merchandising',
        size: '750ml',
        quantity: 8,
        min_stock: 20,
        max_stock: 100,
        purchase_price: 4.50,
        sale_price: 9.90,
        supplier: 'Promocionales Andalucía',
        center: 'jerez',
        location: 'Mostrador',
        status: 'low_stock',
        last_updated: '2024-01-16T15:20:00Z'
      },
      {
        id: 8,
        name: 'Esterillas Yoga Premium',
        category: 'Material Deportivo',
        size: '6mm grosor',
        quantity: 18,
        min_stock: 10,
        max_stock: 25,
        purchase_price: 22.00,
        sale_price: 39.90,
        supplier: 'Yoga Equipment Spain',
        center: 'sevilla',
        location: 'Sala Actividades',
        status: 'in_stock',
        last_updated: '2024-01-14T08:00:00Z'
      }
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
        id: 1,
        type: 'new_order',
        title: '🚨 Nuevo Pedido Urgente',
        message: 'Centro Sevilla solicita 20 Gomas Elásticas - Stock insuficiente',
        order_id: 'REQ-2025-003',
        timestamp: new Date().toISOString(),
        priority: 'high',
        from: 'Centro Sevilla',
        read: false,
        urgent: true
      },
      {
        id: 2,
        type: 'low_stock',
        title: '⚠️ Stock Bajo',
        message: 'Toallas en Centro Sevilla: Solo 2 unidades disponibles',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        priority: 'medium',
        from: 'Sistema',
        read: false,
        urgent: false
      },
      {
        id: 3,
        type: 'order_update',
        title: '✅ Pedido Procesado',
        message: 'PED-2025-001 ha sido enviado a Textiles Deportivos SL',
        order_id: 'PED-2025-001',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        priority: 'low',
        from: 'Sistema',
        read: true,
        urgent: false
      }
    ]);
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesType = categoryFilter === 'all' || order.type === categoryFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = categoryFilter === 'all' || supplier.type === categoryFilter;
    return matchesSearch && matchesType;
  });

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.current_location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || tool.category === categoryFilter;
    return matchesSearch && matchesCategory;
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
      ...newProduct,
      last_updated: new Date().toISOString(),
      status: status as 'in_stock' | 'low_stock' | 'out_of_stock'
    };

    setInventoryItems([...inventoryItems, productToAdd]);
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
    center: 'central',
    location: ''
  });
  setShowNewProductModal(false);
  alert('Producto creado exitosamente');
};

  // Función para filtrar herramientas con búsqueda avanzada
  const getFilteredTools = () => {
    return tools.filter(tool => {
      const locationName = toolLocations.find(loc => loc.id === tool.current_location)?.name || '';
      const matchesSearch = toolSearchTerm === '' || 
        tool.name.toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
        tool.brand.toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
        tool.model.toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
        tool.category.toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
        locationName.toLowerCase().includes(toolSearchTerm.toLowerCase()) ||
        (tool.serial_number && tool.serial_number.toLowerCase().includes(toolSearchTerm.toLowerCase())) ||
        (tool.assigned_to && tool.assigned_to.toLowerCase().includes(toolSearchTerm.toLowerCase()));
      
      const matchesStatus = toolStatusFilter === 'all' || tool.status === toolStatusFilter;
      const matchesLocation = toolLocationFilter === 'all' || tool.current_location === toolLocationFilter;
      
      return matchesSearch && matchesStatus && matchesLocation;
    });
  };

  // Función para obtener herramientas que necesitan mantenimiento
  const getToolsNeedingMaintenance = () => {
    const today = new Date();
    return tools.filter(tool => {
      if (!tool.next_maintenance) return false;
      const maintenanceDate = new Date(tool.next_maintenance);
      const daysUntilMaintenance = Math.ceil((maintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilMaintenance <= 30 && daysUntilMaintenance >= 0; // Próximos 30 días
    });
  };

  const getOverdueMaintenanceTools = () => {
    const today = new Date();
    return tools.filter(tool => {
      if (!tool.next_maintenance) return false;
      const maintenanceDate = new Date(tool.next_maintenance);
      return maintenanceDate < today; // Mantenimiento vencido
    });
  };

  // Funciones para reportes
  const getInventoryMetrics = () => {
    const totalProducts = inventoryItems.length;
    const totalValue = inventoryItems.reduce((sum, item) => sum + (item.purchase_price * item.quantity), 0);
    const lowStockItems = inventoryItems.filter(item => item.status === 'low_stock').length;
    const outOfStockItems = inventoryItems.filter(item => item.status === 'out_of_stock').length;
    
    const byCenter = inventoryItems.reduce((acc, item) => {
      if (!acc[item.center]) {
        acc[item.center] = { count: 0, value: 0 };
      }
      acc[item.center].count += 1;
      acc[item.center].value += item.purchase_price * item.quantity;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    return {
      totalProducts,
      totalValue,
      lowStockItems,
      outOfStockItems,
      byCenter
    };
  };

  const getOrdersMetrics = () => {
    const totalOrders = orders.length;
    const totalValue = orders.reduce((sum, order) => {
      // Calcular el total basado en los items del pedido
      const orderTotal = order.items?.reduce((itemSum, item) => itemSum + (item.quantity * item.unit_price), 0) || 0;
      return sum + orderTotal;
    }, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;
    
    const byStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = orders.reduce((acc, order) => {
      acc[order.type] = (acc[order.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders,
      totalValue,
      pendingOrders,
      completedOrders,
      byStatus,
      byType
    };
  };

  const getToolsMetrics = () => {
    const totalTools = tools.length;
    const totalValue = tools.reduce((sum, tool) => sum + tool.purchase_price, 0);
    const availableTools = tools.filter(tool => tool.status === 'available').length;
    const inUseTools = tools.filter(tool => tool.status === 'in_use').length;
    const lostTools = tools.filter(tool => tool.status === 'lost').length;
    
    const byLocation = tools.reduce((acc, tool) => {
      const locationName = toolLocations.find(loc => loc.id === tool.current_location)?.name || 'Desconocida';
      acc[locationName] = (acc[locationName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = tools.reduce((acc, tool) => {
      acc[tool.category] = (acc[tool.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTools,
      totalValue,
      availableTools,
      inUseTools,
      lostTools,
      byLocation,
      byCategory
    };
  };

  const handleCreateTool = () => {
    if (!newTool.name || !newTool.brand || !newTool.model) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    const tool: Tool = {
      id: Date.now(),
      ...newTool,
      purchase_date: newTool.purchase_date || new Date().toISOString().split('T')[0]
    };

    setTools([...tools, tool]);
    setNewTool({
      name: '',
      category: 'Limpieza',
      brand: '',
      model: '',
      serial_number: '',
      purchase_date: '',
      purchase_price: 0,
      current_location: 'central',
      status: 'available',
      condition: 'excellent',
      assigned_to: '',
      notes: ''
    });
    setShowNewToolModal(false);
    alert('Herramienta creada exitosamente');
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

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
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
      id: Date.now(),
      type: 'order_update',
      title: '🔄 Pedido en Proceso',
      message: `Pedido ${orderId} está siendo procesado`,
      order_id: orderId,
      timestamp: new Date().toISOString(),
      priority: 'medium',
      from: 'Sistema',
      read: false,
      urgent: false
    };
    
    // Crear notificación para el creador del pedido
    const creatorNotification: Notification = {
      id: Date.now() + 1,
      type: 'order_update',
      title: '🔄 Tu Pedido está en Proceso',
      message: `Hola ${order.created_by.split(' - ')[0]}, tu pedido ${orderId} está siendo procesado por el equipo de logística`,
      order_id: orderId,
      timestamp: new Date().toISOString(),
      priority: 'low',
      from: 'Sistema',
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
      id: Date.now(),
      type: 'order_update',
      title: '🚚 Pedido Enviado',
      message: `Pedido ${orderId} ha sido enviado`,
      order_id: orderId,
      timestamp: new Date().toISOString(),
      priority: 'medium',
      from: 'Sistema',
      read: false,
      urgent: false
    };
    
    // Crear notificación para el creador del pedido
    const creatorNotification: Notification = {
      id: Date.now() + 1,
      type: 'order_update',
      title: '🚚 Tu Pedido ha sido Enviado',
      message: `¡Buenas noticias ${order.created_by.split(' - ')[0]}! Tu pedido ${orderId} ha sido enviado y está en camino`,
      order_id: orderId,
      timestamp: new Date().toISOString(),
      priority: 'medium',
      from: 'Sistema',
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
      id: Date.now(),
      type: 'order_update',
      title: '❌ Pedido Cancelado',
      message: `Pedido ${orderId} cancelado: ${reason}`,
      order_id: orderId,
      timestamp: new Date().toISOString(),
      priority: 'medium',
      from: 'Sistema',
      read: false,
      urgent: false
    };
    
    // Crear notificación para el creador del pedido
    const creatorNotification: Notification = {
      id: Date.now() + 1,
      type: 'order_update',
      title: '❌ Tu Pedido ha sido Cancelado',
      message: `Lamentamos informarte ${order.created_by.split(' - ')[0]} que tu pedido ${orderId} ha sido cancelado. Motivo: ${reason}`,
      order_id: orderId,
      timestamp: new Date().toISOString(),
      priority: 'medium',
      from: 'Sistema',
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

  // Datos de los centros
  const centers = [
    { id: 'sevilla', name: 'Centro Sevilla', address: 'Calle Ejemplo 123, Sevilla' },
    { id: 'jerez', name: 'Centro Jerez', address: 'Av. Principal 456, Jerez de la Frontera' },
    { id: 'puerto', name: 'Centro Puerto', address: 'Plaza Mayor 789, El Puerto de Santa María' }
  ];

  const handleCreateOrder = () => {
    // Validación según tipo de pedido
    if (newOrder.type === 'center_to_brand') {
      if (!newOrder.center_id || newOrder.items.length === 0) {
        alert('Por favor, selecciona un centro y añade al menos un producto');
        return;
      }
    } else {
      if (!newOrder.supplier_id || newOrder.items.length === 0) {
        alert('Por favor, selecciona un proveedor y añade al menos un producto');
        return;
      }
    }

    const totalAmount = newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const orderPrefix = newOrder.type === 'center_to_brand' ? 'REQ' : 'PED';
    const newOrderId = `${orderPrefix}-2025-${String(orders.length + 1).padStart(3, '0')}`;
    
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
      id: Date.now(),
      type: 'new_order',
      title: newOrder.type === 'center_to_brand' ? '🏪 Nueva Solicitud de Centro' : '📦 Nuevo Pedido a Proveedor',
      message: `${newOrderId} creado: ${newOrder.from} → ${newOrder.to} - €${totalAmount.toFixed(2)}`,
      order_id: newOrderId,
      timestamp: new Date().toISOString(),
      priority: 'medium',
      from: 'Sistema',
      read: false,
      urgent: totalAmount > 500 // Marcar como urgente si es > €500
    };
    
    setNotifications(prev => [notification, ...prev]);
    
    // Resetear formulario
    setNewOrder({
      supplier_id: '',
      type: 'center_to_brand',
      from: '',
      to: 'La Jungla Central',
      center_id: '',
      expected_delivery: '',
      notes: '',
      items: []
    });
    
    setShowNewOrderModal(false);
    alert(`${newOrder.type === 'center_to_brand' ? 'Solicitud' : 'Pedido'} ${newOrderId} creado exitosamente`);
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

  const addProductToOrder = (product: InventoryItem, quantity: number, unitPrice: number) => {
    const newItem = {
      product_id: product.id,
      product_name: product.name,
      quantity: quantity,
      unit_price: unitPrice
    };

    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));

    setShowProductSelectorModal(false);
  };

  // Obtener categorías únicas
  const getUniqueCategories = () => {
    const categories = [...new Set(inventoryItems.map(item => item.category))];
    return categories.sort();
  };

  // Filtrar productos por categoría y búsqueda
  const getFilteredProducts = () => {
    let filtered = inventoryItems;
    
    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Filtrar por término de búsqueda
    if (productSearchTerm.trim()) {
      const searchLower = productSearchTerm.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower) ||
        item.supplier.toLowerCase().includes(searchLower) ||
        item.size.toLowerCase().includes(searchLower) ||
        (item.location && item.location.toLowerCase().includes(searchLower))
      );
    }
    
    return filtered;
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
            {/* Selector de Usuario (para demo) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                value={currentUser.role}
                onChange={(e) => {
                  const roles: Record<string, User> = {
                    'ceo': { 
                      id: '1', 
                      name: 'Carlos Suárez (CEO)', 
                      role: 'ceo' as const, 
                      center: 'central',
                      permissions: getRolePermissions('ceo')
                    },
                    'logistics_director': { 
                      id: '2', 
                      name: 'Benito Morales (Dir. Logística)', 
                      role: 'logistics_director' as const, 
                      center: 'central',
                      permissions: getRolePermissions('logistics_director')
                    },
                    'center_manager': { 
                      id: '7', 
                      name: 'Fran Giraldez (Encargado Sevilla)', 
                      role: 'center_manager' as const, 
                      center: 'sevilla',
                      permissions: getRolePermissions('center_manager')
                    }
                  };
                  setCurrentUser(roles[e.target.value]);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                <option value="ceo" style={{ color: '#374151' }}>👑 Carlos Suárez (CEO)</option>
                <option value="logistics_director" style={{ color: '#374151' }}>📊 Benito Morales (Director)</option>
                <option value="center_manager" style={{ color: '#374151' }}>🏪 Ana García (Encargada)</option>
              </select>
            </div>

            {/* Información del Usuario */}
            <div style={{ color: 'white', textAlign: 'right' }}>
              <div style={{ fontWeight: '600' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                {currentUser.role === 'ceo' ? '👑 CEO' :
                 currentUser.role === 'logistics_director' ? '📊 Director de Logística' : 
                 '🏪 Encargado de Centro'}
              </div>
            </div>

            {/* Notificaciones */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <Bell size={20} style={{ color: 'white' }} />
                {getUnreadNotifications().length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
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
                          {new Date(notification.timestamp).toLocaleString('es-ES')}
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
        {/* Navegación por pestañas */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '2rem' }}>
          {[
            { id: 'kpis', label: '📊 KPIs Real Time', icon: Activity, permission: 'canViewReports' },
            { id: 'inventory', label: '📦 Inventario', icon: Package, permission: 'canManageInventory' },
            { id: 'quarterly', label: '📋 Revisión Trimestral', icon: FileText, permission: 'canViewReports' },
            { id: 'orders', label: '🛒 Pedidos', icon: ShoppingCart, permission: 'canCreateOrders' },
            { id: 'tools', label: '🔧 Herramientas', icon: Settings, permission: 'canManageTools' },
            { id: 'suppliers', label: '🏪 Proveedores', icon: Building, permission: 'canManageSuppliers' }
          ].filter(tab => currentUser.permissions[tab.permission as keyof typeof currentUser.permissions]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#059669' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                fontWeight: activeTab === tab.id ? '600' : '500',
                cursor: 'pointer',
                borderRadius: '12px',
                fontSize: '0.875rem'
              }}
            >
              <tab.icon size={16} />
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
                activeTab === 'tools' ? 'Buscar herramientas, ubicaciones, marcas...' :
                activeTab === 'suppliers' ? 'Buscar proveedores...' : 'Buscar...'
              }
              value={activeTab === 'tools' ? toolSearchTerm : searchTerm}
              onChange={(e) => activeTab === 'tools' ? setToolSearchTerm(e.target.value) : setSearchTerm(e.target.value)}
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

          {/* Botón de acción principal - Solo si tiene permisos */}
          {((activeTab === 'inventory' && currentUser.permissions.canManageInventory) ||
            (activeTab === 'orders' && currentUser.permissions.canCreateOrders) ||
            (activeTab === 'tools' && currentUser.permissions.canManageTools) ||
            (activeTab === 'suppliers' && currentUser.permissions.canManageSuppliers)) && (
            <button
              onClick={() => {
                if (activeTab === 'inventory') setShowNewProductModal(true);
                else if (activeTab === 'orders') setShowNewOrderModal(true);
                else if (activeTab === 'tools') setShowNewToolModal(true);
                else if (activeTab === 'suppliers') setShowSupplierDetailModal(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              <Plus size={16} />
              {activeTab === 'inventory' ? 'Nuevo Producto' :
               activeTab === 'orders' ? 'Nuevo Pedido' :
               activeTab === 'tools' ? 'Nueva Herramienta' :
               'Nuevo Proveedor'}
            </button>
          )}
        </div>

        {/* Mensaje de permisos insuficientes */}
        {!currentUser.permissions.canViewReports && (activeTab === 'reports' || activeTab === 'kpis') && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ color: '#dc2626', margin: '0 0 1rem 0' }}>🚫 Acceso Restringido</h3>
            <p style={{ color: '#7f1d1d', margin: 0 }}>
              Tu rol de <strong>{currentUser.role === 'trainer' ? 'Entrenador' : 'Empleado'}</strong> no tiene permisos para ver reportes.
              <br />Solo los encargados y directores pueden acceder a esta información.
            </p>
          </div>
        )}

        {/* Pestaña KPIs Real Time */}
        {activeTab === 'kpis' && currentUser.permissions.canViewReports && (
          <InventoryKPIDashboard />
        )}

        {/* Pestaña Inventario */}
        {activeTab === 'inventory' && currentUser.permissions.canManageInventory && (
          <RealInventoryTable />
        )}

        {/* Pestaña Revisión Trimestral */}
        {activeTab === 'quarterly' && currentUser.permissions.canViewReports && (
          <QuarterlyReviewSystem />
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
                placeholder="Buscar pedidos..."
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
                <option value="pending">⏳ Pendiente</option>
                <option value="processing">🔄 En Proceso</option>
                <option value="sent">🚚 Enviado</option>
                <option value="delivered">✅ Entregado</option>
                <option value="cancelled">❌ Cancelado</option>
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

        {/* Pestaña Herramientas */}
        {activeTab === 'tools' && (
          <div>
            {/* Alertas de Mantenimiento */}
            {(getOverdueMaintenanceTools().length > 0 || getToolsNeedingMaintenance().length > 0) && (
              <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                {getOverdueMaintenanceTools().length > 0 && (
                  <div style={{ 
                    backgroundColor: '#fef2f2', 
                    border: '1px solid #fecaca', 
                    borderRadius: '8px', 
                    padding: '1rem',
                    flex: 1
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <AlertTriangle size={20} style={{ color: '#dc2626' }} />
                      <h3 style={{ margin: 0, color: '#dc2626', fontSize: '1rem', fontWeight: '600' }}>
                        Mantenimiento Vencido
                      </h3>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#7f1d1d' }}>
                      {getOverdueMaintenanceTools().length} herramienta(s) con mantenimiento vencido
                    </p>
                  </div>
                )}
                
                {getToolsNeedingMaintenance().length > 0 && (
                  <div style={{ 
                    backgroundColor: '#fffbeb', 
                    border: '1px solid #fed7aa', 
                    borderRadius: '8px', 
                    padding: '1rem',
                    flex: 1
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Clock size={20} style={{ color: '#d97706' }} />
                      <h3 style={{ margin: 0, color: '#d97706', fontSize: '1rem', fontWeight: '600' }}>
                        Mantenimiento Próximo
                      </h3>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>
                      {getToolsNeedingMaintenance().length} herramienta(s) necesitan mantenimiento en 30 días
                    </p>
                  </div>
                )}
              </div>
            )}

            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              {/* Contador de herramientas */}
            <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Mostrando {getFilteredTools().length} de {tools.length} herramientas
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {(toolSearchTerm || toolStatusFilter !== 'all' || toolLocationFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setToolSearchTerm('');
                        setToolStatusFilter('all');
                        setToolLocationFilter('all');
                      }}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        color: '#6b7280'
                      }}
                    >
                      🔄 Limpiar filtros
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr', backgroundColor: '#f9fafb', padding: '1rem', fontWeight: '600', borderBottom: '1px solid #e5e7eb' }}>
              <div>Herramienta</div>
              <div>Categoría</div>
              <div>Ubicación</div>
              <div>Estado</div>
              <div>Asignado a</div>
              <div>Precio</div>
              <div>Acciones</div>
            </div>
            
            {getFilteredTools().map((tool: Tool) => (
              <div key={tool.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr', padding: '1rem', borderBottom: '1px solid #f3f4f6', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{tool.name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{tool.brand} {tool.model}</div>
                </div>
                <div>{tool.category}</div>
                <div>{toolLocations.find(loc => loc.id === tool.current_location)?.name}</div>
                <div style={{ color: tool.status === 'available' ? '#059669' : tool.status === 'lost' ? '#dc2626' : '#6b7280' }}>
                  {tool.status === 'available' ? '✅ Disponible' :
                   tool.status === 'in_use' ? '🔧 En Uso' :
                   tool.status === 'maintenance' ? '⚙️ Mantenimiento' :
                   tool.status === 'lost' ? '❌ Perdida' : '🔴 Dañada'}
                </div>
                <div>{tool.assigned_to || '-'}</div>
                <div>€{tool.purchase_price.toFixed(2)}</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      setSelectedTool(tool);
                      setShowMoveToolModal(true);
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                    title="Mover herramienta"
                  >
                    📍 Mover
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTool(tool);
                      // Aquí se podría abrir un modal de historial
                      alert(`Historial de ${tool.name} - Funcionalidad próximamente`);
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                    title="Ver historial"
                  >
                    📋 Historial
                  </button>
                </div>
              </div>
            ))}
            
            {getFilteredTools().length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                <Package size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: '1rem', marginBottom: '0.5rem' }}>
                  {toolSearchTerm ? 
                    `No se encontraron herramientas para "${toolSearchTerm}"` :
                    `No hay herramientas con los filtros seleccionados`
                  }
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#9ca3af' }}>
                  Prueba a cambiar los filtros o crear una nueva herramienta
                </p>
              </div>
            )}
            </div>
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
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>📊 Reportes y Análisis</h1>
              
              {/* Panel de Notificaciones Críticas */}
              {getUnreadNotifications().length > 0 && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1rem', maxWidth: '400px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Bell size={20} style={{ color: '#dc2626' }} />
                    <h3 style={{ margin: 0, color: '#dc2626', fontSize: '1rem' }}>
                      {getUnreadNotifications().length} Notificación{getUnreadNotifications().length > 1 ? 'es' : ''} Pendiente{getUnreadNotifications().length > 1 ? 's' : ''}
                    </h3>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#7f1d1d', marginBottom: '0.75rem' }}>
                    {getUnreadNotifications().filter(n => n.priority === 'high').length > 0 && 
                      `${getUnreadNotifications().filter(n => n.priority === 'high').length} crítica${getUnreadNotifications().filter(n => n.priority === 'high').length > 1 ? 's' : ''}`
                    }
                  </div>
                  <button
                    onClick={() => setShowNotifications(true)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Ver Notificaciones
                  </button>
                </div>
              )}
            </div>

            {/* Métricas Principales */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#2563eb' }}>📦 Inventario</h3>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{getInventoryMetrics().totalProducts}</div>
                <div style={{ color: '#6b7280' }}>Productos totales</div>
                <div style={{ marginTop: '0.5rem', color: '#059669', fontWeight: '600' }}>
                  €{getInventoryMetrics().totalValue.toLocaleString('es-ES')}
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#d97706' }}>🛒 Pedidos</h3>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{getOrdersMetrics().totalOrders}</div>
                <div style={{ color: '#6b7280' }}>Pedidos totales</div>
                <div style={{ marginTop: '0.5rem', color: '#059669', fontWeight: '600' }}>
                  €{getOrdersMetrics().totalValue.toLocaleString('es-ES')}
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#7c3aed' }}>🔧 Herramientas</h3>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{getToolsMetrics().totalTools}</div>
                <div style={{ color: '#6b7280' }}>Herramientas totales</div>
                <div style={{ marginTop: '0.5rem', color: '#059669', fontWeight: '600' }}>
                  €{getToolsMetrics().totalValue.toLocaleString('es-ES')}
                </div>
              </div>
            </div>

            {/* Reportes Detallados */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>📍 Inventario por Centro</h3>
                {Object.entries(getInventoryMetrics().byCenter).map(([center, data]) => (
                  <div key={center} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span>{center === 'central' ? '🏢 Central' : `🏪 ${center}`}</span>
                    <span>{data.count} productos - €{data.value.toFixed(0)}</span>
                  </div>
                ))}
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>🔧 Herramientas por Ubicación</h3>
                {Object.entries(getToolsMetrics().byLocation).map(([location, count]) => (
                  <div key={location} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f3f4f6' }}>
                    <span>{location}</span>
                    <span>{count} herramientas</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alertas y Estados */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#dc2626' }}>⚠️ Alertas de Stock</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                    <span style={{ color: '#dc2626' }}>❌ Sin Stock</span>
                    <span style={{ fontWeight: '600' }}>{getInventoryMetrics().outOfStockItems} productos</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                    <span style={{ color: '#d97706' }}>⚠️ Stock Bajo</span>
                    <span style={{ fontWeight: '600' }}>{getInventoryMetrics().lowStockItems} productos</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Productos que requieren reposición inmediata
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#7c3aed' }}>📊 Estado de Pedidos</h3>
                <div style={{ marginBottom: '1rem' }}>
                  {Object.entries(getOrdersMetrics().byStatus).map(([status, count]) => (
                    <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                      <span>
                        {status === 'pending' ? '⏳ Pendiente' :
                         status === 'processing' ? '🔄 En Proceso' :
                         status === 'sent' ? '🚚 Enviado' :
                         status === 'delivered' ? '✅ Entregado' :
                         status === 'cancelled' ? '❌ Cancelado' : status}
                      </span>
                      <span style={{ fontWeight: '600' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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

        {/* Modal Nueva Herramienta */}
        {showNewToolModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '500px' }}>
              <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: '700' }}>🔧 Nueva Herramienta</h2>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nombre *</label>
                <input
                  type="text"
                  value={newTool.name}
                  onChange={(e) => setNewTool({...newTool, name: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  placeholder="Ej: Aspiradora Industrial"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Marca *</label>
                  <input
                    type="text"
                    value={newTool.brand}
                    onChange={(e) => setNewTool({...newTool, brand: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    placeholder="Ej: Kärcher"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Modelo *</label>
                  <input
                    type="text"
                    value={newTool.model}
                    onChange={(e) => setNewTool({...newTool, model: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    placeholder="Ej: NT 70/2"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Categoría</label>
                  <select
                    value={newTool.category}
                    onChange={(e) => setNewTool({...newTool, category: e.target.value as Tool['category']})}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  >
                    <option value="Limpieza">🧽 Limpieza</option>
                    <option value="Mantenimiento">🔧 Mantenimiento</option>
                    <option value="Seguridad">🛡️ Seguridad</option>
                    <option value="Deportivo">🏋️ Deportivo</option>
                    <option value="Oficina">💻 Oficina</option>
                    <option value="Electrónico">⚡ Electrónico</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Ubicación Inicial *</label>
                  <select
                    value={newTool.current_location}
                    onChange={(e) => setNewTool({...newTool, current_location: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                  >
                    {toolLocations.map(location => (
                      <option key={location.id} value={location.id}>
                        {location.type === 'permanent' ? '🏢' :
                         location.type === 'center' ? '🏪' :
                         location.type === 'temporary' ? '🔧' : '📦'} {location.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Precio de Compra (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newTool.purchase_price}
                    onChange={(e) => setNewTool({...newTool, purchase_price: parseFloat(e.target.value) || 0})}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Número de Serie</label>
                  <input
                    type="text"
                    value={newTool.serial_number}
                    onChange={(e) => setNewTool({...newTool, serial_number: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setShowNewToolModal(false)} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={handleCreateTool} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Crear
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

              {/* Tipo de pedido */}
              <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600' }}>Tipo de Pedido</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="orderType"
                      value="center_to_brand"
                      checked={newOrder.type === 'center_to_brand'}
                      onChange={(e) => setNewOrder(prev => ({ 
                        ...prev, 
                        type: e.target.value as 'center_to_brand' | 'brand_to_supplier',
                        supplier_id: '',
                        center_id: '',
                        from: '',
                        to: e.target.value === 'center_to_brand' ? 'La Jungla Central' : ''
                      }))}
                    />
                    <span style={{ fontWeight: '600', color: '#0369a1' }}>📥 Centro → Marca</span>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>(Solicitud interna)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="orderType"
                      value="brand_to_supplier"
                      checked={newOrder.type === 'brand_to_supplier'}
                      onChange={(e) => setNewOrder(prev => ({ 
                        ...prev, 
                        type: e.target.value as 'center_to_brand' | 'brand_to_supplier',
                        supplier_id: '',
                        center_id: '',
                        from: e.target.value === 'brand_to_supplier' ? 'La Jungla Central' : '',
                        to: ''
                      }))}
                    />
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
                    <select
                      value={newOrder.center_id}
                      onChange={(e) => {
                        const selectedCenter = centers.find(c => c.id === e.target.value);
                        setNewOrder(prev => ({
                          ...prev,
                          center_id: e.target.value,
                          from: selectedCenter?.name || ''
                        }));
                      }}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    >
                      <option value="">Seleccionar centro</option>
                      {centers.map(center => (
                        <option key={center.id} value={center.id}>
                          {center.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
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
                )}

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    {newOrder.type === 'center_to_brand' ? 'Fecha Necesaria' : 'Fecha de Entrega'}
                  </label>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Productos del Pedido</h3>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setProductSearchTerm('');
                      setShowProductSelectorModal(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.875rem'
                    }}
                  >
                    <Plus size={16} />
                    Añadir Productos
                  </button>
                </div>
                
                {newOrder.items.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem', 
                    color: '#6b7280',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '2px dashed #d1d5db'
                  }}>
                    <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>
                      No hay productos añadidos.<br />
                      Click en "Añadir Productos" para seleccionar por categorías.
                    </p>
                  </div>
                ) : null}
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
                  disabled={
                    (newOrder.type === 'center_to_brand' && (!newOrder.center_id || newOrder.items.length === 0)) ||
                    (newOrder.type === 'brand_to_supplier' && (!newOrder.supplier_id || newOrder.items.length === 0))
                  }
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 
                      ((newOrder.type === 'center_to_brand' && newOrder.center_id && newOrder.items.length > 0) ||
                       (newOrder.type === 'brand_to_supplier' && newOrder.supplier_id && newOrder.items.length > 0))
                      ? '#059669' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 
                      ((newOrder.type === 'center_to_brand' && newOrder.center_id && newOrder.items.length > 0) ||
                       (newOrder.type === 'brand_to_supplier' && newOrder.supplier_id && newOrder.items.length > 0))
                      ? 'pointer' : 'not-allowed',
                    fontWeight: '600'
                  }}
                >
                  {newOrder.type === 'center_to_brand' ? 'Crear Solicitud' : 'Crear Pedido'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Selector de Productos */}
        {showProductSelectorModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>📦 Seleccionar Productos</h2>
                <button
                  onClick={() => setShowProductSelectorModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}
                >
                  ×
                </button>
              </div>

              {/* Buscador de productos */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Buscar Productos</label>
                <div style={{ position: 'relative' }}>
                  <Search 
                    size={20} 
                    style={{ 
                      position: 'absolute', 
                      left: '0.75rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: '#6b7280' 
                    }} 
                  />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, categoría, proveedor, talla..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                  {productSearchTerm && (
                    <button
                      onClick={() => setProductSearchTerm('')}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
                {productSearchTerm && (
                  <div style={{ 
                    marginTop: '0.5rem', 
                    fontSize: '0.875rem', 
                    color: '#6b7280' 
                  }}>
                    {getFilteredProducts().length} producto(s) encontrado(s)
                  </div>
                )}
              </div>

              {/* Filtro por categorías */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600' }}>Filtrar por Categoría</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setProductSearchTerm('');
                    }}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: selectedCategory === 'all' && !productSearchTerm ? '#059669' : '#f3f4f6',
                      color: selectedCategory === 'all' && !productSearchTerm ? 'white' : '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    🔍 Todos
                  </button>
                  {getUniqueCategories().map(category => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setProductSearchTerm('');
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: selectedCategory === category && !productSearchTerm ? '#059669' : '#f3f4f6',
                        color: selectedCategory === category && !productSearchTerm ? 'white' : '#374151',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      {category === 'Vestuario' ? '👕' : 
                       category === 'Material Deportivo' ? '🏋️' :
                       category === 'Merchandising' ? '🎁' :
                       category === 'Consumibles' ? '🧽' : '📦'} {category}
                    </button>
                  ))}
                </div>
                {productSearchTerm && (
                  <div style={{ 
                    marginTop: '0.75rem', 
                    padding: '0.5rem', 
                    backgroundColor: '#fef3c7', 
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    color: '#92400e'
                  }}>
                    💡 Búsqueda activa: "{productSearchTerm}". Los filtros de categoría están deshabilitados.
                  </div>
                )}
              </div>

              {/* Lista de productos */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {getFilteredProducts().map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToOrder={addProductToOrder}
                    isAlreadyAdded={newOrder.items.some(item => item.product_id === product.id)}
                    userRole={currentUser.role}
                  />
                ))}
              </div>

              {getFilteredProducts().length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                  <Package size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p style={{ margin: 0, fontSize: '1rem', marginBottom: '0.5rem' }}>
                    {productSearchTerm ? 
                      `No se encontraron productos para "${productSearchTerm}"` :
                      `No hay productos en esta categoría`
                    }
                  </p>
                  {productSearchTerm && (
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#9ca3af' }}>
                      Intenta con otros términos de búsqueda o selecciona una categoría diferente
                    </p>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  onClick={() => setShowProductSelectorModal(false)}
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
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Mover Herramienta */}
        {showMoveToolModal && selectedTool && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002 }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '500px' }}>
              <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: '700' }}>📍 Mover {selectedTool.name}</h2>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nueva Ubicación</label>
                <select id="new-location" style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Seleccionar...</option>
                  {toolLocations.filter(loc => loc.id !== selectedTool.current_location).map(location => (
                    <option key={location.id} value={location.id}>{location.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Motivo</label>
                <select id="move-reason" style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Seleccionar...</option>
                  <option value="transfer">Transferencia</option>
                  <option value="maintenance">Mantenimiento</option>
                  <option value="loan">Préstamo</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setShowMoveToolModal(false)} style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    alert('Herramienta movida exitosamente');
                    setShowMoveToolModal(false);
                    setSelectedTool(null);
                  }}
                  style={{ flex: 1, padding: '0.75rem', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Mover
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para cada producto
const ProductCard: React.FC<{
  product: InventoryItem;
  onAddToOrder: (product: InventoryItem, quantity: number, unitPrice: number) => void;
  isAlreadyAdded: boolean;
  userRole: string;
}> = ({ product, onAddToOrder, isAlreadyAdded, userRole }) => {
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(product.sale_price || product.purchase_price || 0);
  
  // Verificar si el usuario puede modificar precios
  const canEditPrice = userRole === 'ceo' || userRole === 'logistics_director' || userRole === 'admin';

  const getStockStatusColor = () => {
    if (product.status === 'out_of_stock') return '#dc2626';
    if (product.status === 'low_stock') return '#d97706';
    return '#059669';
  };

  const getStockStatusText = () => {
    if (product.status === 'out_of_stock') return '❌ Sin Stock';
    if (product.status === 'low_stock') return '⚠️ Stock Bajo';
    return '✅ En Stock';
  };

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '1.5rem',
      position: 'relative'
    }}>
      {isAlreadyAdded && (
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          backgroundColor: '#059669',
          color: 'white',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: '600'
        }}>
          ✓ Añadido
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>
          {product.name}
        </h4>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
          {product.category} • {product.size} • {product.supplier}
        </div>
        <div style={{ 
          fontSize: '0.875rem', 
          color: getStockStatusColor(),
          fontWeight: '600',
          marginBottom: '0.5rem'
        }}>
          {getStockStatusText()} ({product.quantity} disponibles)
        </div>
        <div style={{ fontSize: '0.875rem', color: '#374151' }}>
          Precio: €{product.sale_price?.toFixed(2) || product.purchase_price?.toFixed(2) || '0.00'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
            Cantidad
          </label>
          <input
            type="number"
            min="1"
            max={product.quantity}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem' }}>
            Precio € {!canEditPrice && <span style={{ color: '#6b7280' }}>(Fijo)</span>}
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={unitPrice}
            onChange={(e) => canEditPrice && setUnitPrice(parseFloat(e.target.value) || 0)}
            readOnly={!canEditPrice}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
              backgroundColor: canEditPrice ? 'white' : '#f9fafb',
              color: canEditPrice ? '#374151' : '#6b7280',
              cursor: canEditPrice ? 'text' : 'not-allowed'
            }}
          />
          {!canEditPrice && (
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280', 
              marginTop: '0.25rem',
              fontStyle: 'italic'
            }}>
              💼 Solo directivos pueden modificar precios
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onAddToOrder(product, quantity, unitPrice)}
        disabled={isAlreadyAdded || product.quantity === 0 || quantity > product.quantity}
        style={{
          width: '100%',
          padding: '0.75rem',
          backgroundColor: isAlreadyAdded || product.quantity === 0 || quantity > product.quantity ? '#9ca3af' : '#059669',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isAlreadyAdded || product.quantity === 0 || quantity > product.quantity ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          fontSize: '0.875rem'
        }}
      >
        {isAlreadyAdded ? 'Ya Añadido' : 
         product.quantity === 0 ? 'Sin Stock' :
         quantity > product.quantity ? 'Cantidad Excesiva' :
         `Añadir (€${(quantity * unitPrice).toFixed(2)})`}
      </button>
    </div>
  );
};

export default LogisticsManagementSystem;
