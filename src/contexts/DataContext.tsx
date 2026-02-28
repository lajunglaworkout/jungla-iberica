import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { loadAllEmployees, loadCenters } from '../services/userService';
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
        // Cargar centros: 3 gimnasios + Central (marca/almacén)
        const centersResult = await loadCenters('name.eq.Sevilla,name.eq.Jerez,name.eq.Puerto,name.ilike.%Central%,name.ilike.%Almacén%');
        if (!centersResult.success) {
          console.error('Error cargando centros:', centersResult.error);
          throw new Error(centersResult.error);
        }
        setCenters((centersResult.centers as Center[]) || []);
        console.log('✅ Centros cargados:', centersResult.centers?.map((c: Center) => c.name));

        // Cargar empleados desde la tabla correcta
        const employeesResult = await loadAllEmployees();
        if (!employeesResult.success) {
          console.error('Error cargando empleados:', employeesResult.error);
          throw new Error(employeesResult.error);
        }
        setEmployees((employeesResult.employees as Employee[]) || []);
        console.log('✅ Empleados cargados:', employeesResult.employees?.length);

        setError(null);
      } catch (err: unknown) {
        console.error("Error cargando datos maestros:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  void CENTROS_REALES; // static fallback reference kept for future use

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
