import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Center, Employee } from '../types/database';

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
        const { data: centersData, error: centersError } = await supabase.from('centers').select('*');
        if (centersError) throw centersError;
        setCenters(centersData || []);

        const { data: employeesData, error: employeesError } = await supabase.from('employees').select('*');
        if (employeesError) throw employeesError;
        setEmployees(employeesData || []);
        
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