import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSession } from '../contexts/SessionContext';
import type { Center } from '../types/center';

export const CentersDashboard: React.FC = () => {
  const { user } = useSession();
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCenters = async () => {
      const { data, error } = await supabase
        .from('centers')
        .select('*');

      if (error) {
        setError(error.message);
        console.error("Error al obtener los centros:", error);
      } else {
        setCenters(data as Center[]);
      }
      setLoading(false);
    };

    fetchCenters();
  }, []);

  if (loading) {
    return <div>Cargando centros...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Panel de Centros</h1>
      <p>Bienvenido, <strong>{user?.email}</strong>.</p>
      
      {centers.length > 0 ? (
        <ul>
          {centers.map((center) => (
            <li key={center.id}>
              <strong>{center.name}</strong> ({center.city}) - Estado: {center.status}
            </li>
          ))}
        </ul>
      ) : (
        <p>No tienes acceso a ningún centro o no hay centros que mostrar.</p>
      )}
    </div>
  );
};