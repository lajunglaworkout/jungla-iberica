import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Center, Employee } from '../types/database';

// CENTROS REALES - Solo estos 3 centros autorizados
const CENTROS_REALES = [
  { id: '1', nombre: 'Sevilla', direccion: 'Sevilla', activo: true },
  { id: '2', nombre: 'Jerez', direccion: 'Jerez de la Frontera', activo: true },
  { id: '3', nombre: 'Puerto', direccion: 'El Puerto de Santa María', activo: true }
];

interface DataContextProps {
  centers: Center[];
  employees: Employee[];
  loading: boolean;
  error: Error | null;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [centers, setCenters] = useState<Center[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar solo los 3 centros reales: Sevilla, Jerez, Puerto
        const { data: centersData, error: centersError } = await supabase
          .from('centers')
          .select('*')
          .or('name.eq.Sevilla,name.eq.Jerez,name.eq.Puerto')
          .eq('status', 'Activo');
        
        if (centersError) {
          console.error('Error cargando centros:', centersError);
          throw centersError;
        }
        
        setCenters(centersData || []);
        console.log('✅ Centros cargados:', centersData?.map(c => c.name));

        // Cargar empleados desde la tabla correcta
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('*');
        
        if (employeesError) {
          console.error('Error cargando empleados:', employeesError);
          throw employeesError;
        }
        
        setEmployees(employeesData || []);
        console.log('✅ Empleados cargados:', employeesData?.length);
        
        setError(null);
      } catch (err: any) {
        console.error("Error cargando datos maestros:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const value = { centers, employees, loading, error };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData debe ser usado dentro de un DataProvider');
  }
  return context;
};