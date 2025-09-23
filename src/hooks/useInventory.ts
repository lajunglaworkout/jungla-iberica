import { useState, useEffect } from 'react';
import { loadInventoryFromSupabase, InventoryItem } from '../services/inventoryLoader';

export const useInventory = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInventory = async () => {
      try {
        setLoading(true);
        setError(null);
        const items = await loadInventoryFromSupabase();
        setInventoryItems(items);
      } catch (err) {
        setError('Error cargando inventario');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInventory();
  }, []);

  return {
    inventoryItems,
    loading,
    error,
    refetch: async () => {
      try {
        console.log('🔄 Refetch iniciado...');
        setLoading(true);
        const items = await loadInventoryFromSupabase();
        console.log('🔄 Items recargados:', items.length);
        setInventoryItems(items);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error en refetch:', error);
        setError('Error recargando inventario');
        setLoading(false);
      }
    }
  };
};
