// Configuración del sistema de logística de La Jungla

import { CategoryConfig, LocationConfig, LocationType, ItemCategory } from '../types/logistics';

// Configuración de categorías de inventario
export const INVENTORY_CATEGORIES: CategoryConfig[] = [
  {
    id: 'material_deportivo',
    name: 'Material Deportivo',
    icon: '🏋️',
    description: 'Pesas, mancuernas, gomas, balones, etc.',
    defaultUnit: 'unidad'
  },
  {
    id: 'herramientas',
    name: 'Herramientas',
    icon: '🔧',
    description: 'Herramientas de mantenimiento y reparación',
    defaultUnit: 'unidad'
  },
  {
    id: 'maquinaria',
    name: 'Maquinaria',
    icon: '⚙️',
    description: 'Máquinas de ejercicio, equipos electrónicos',
    defaultUnit: 'unidad'
  },
  {
    id: 'mobiliario',
    name: 'Mobiliario',
    icon: '🪑',
    description: 'Mesas, sillas, estanterías, decoración',
    defaultUnit: 'unidad'
  },
  {
    id: 'merchandising',
    name: 'Merchandising',
    icon: '🛍️',
    description: 'Productos de marca para venta',
    defaultUnit: 'unidad'
  },
  {
    id: 'vestuario',
    name: 'Vestuario',
    icon: '👕',
    description: 'Ropa deportiva, uniformes, accesorios',
    defaultUnit: 'unidad'
  },
  {
    id: 'consumibles',
    name: 'Consumibles',
    icon: '🧴',
    description: 'Productos de limpieza, papel, bebidas',
    defaultUnit: 'unidad'
  }
];

// Configuración de ubicaciones
export const LOCATIONS: LocationConfig[] = [
  {
    id: 'central',
    name: 'Almacén Central',
    manager: 'Equipo Logística',
    managerEmail: 'pedidoslajungla@gmail.com',
    isWarehouse: true,
    canReceiveOrders: false,
    canSendOrders: true
  },
  {
    id: 'sevilla',
    name: 'Centro Sevilla',
    manager: 'Francisco Giráldez',
    managerEmail: 'francisco.giraldez@lajungla.com',
    isWarehouse: false,
    canReceiveOrders: true,
    canSendOrders: false
  },
  {
    id: 'jerez',
    name: 'Centro Jerez',
    manager: 'Encargado Jerez',
    managerEmail: 'jerez@lajungla.com',
    isWarehouse: false,
    canReceiveOrders: true,
    canSendOrders: false
  },
  {
    id: 'puerto',
    name: 'Centro Puerto',
    manager: 'Encargado Puerto',
    managerEmail: 'puerto@lajungla.com',
    isWarehouse: false,
    canReceiveOrders: true,
    canSendOrders: false
  }
];

// Funciones helper
export const getCategoryById = (id: ItemCategory) => INVENTORY_CATEGORIES.find(cat => cat.id === id);
export const getLocationById = (id: LocationType) => LOCATIONS.find(loc => loc.id === id);
export const getCategoryIcon = (category: ItemCategory) => getCategoryById(category)?.icon || '📦';
export const getLocationName = (location: LocationType) => getLocationById(location)?.name || location;
