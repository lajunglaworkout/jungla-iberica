// En: src/components/CreateCenterModal.tsx

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { CenterType, CenterStatus } from '../types/center'; // Importamos los tipos

// Definimos qué "props" recibe este componente
interface CreateCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCenterCreated: () => void; // Una función para avisar al panel que se ha creado un centro
}

export const CreateCenterModal: React.FC<CreateCenterModalProps> = ({ isOpen, onClose, onCenterCreated }) => {
  // Estados para cada campo del formulario
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState<CenterType>('Propio');
  const [status, setStatus] = useState<CenterStatus>('Activo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Llamamos a Supabase para insertar la nueva fila
    const { error: insertError } = await supabase
      .from('centers')
      .insert([
        { name, city, type, status } // Los datos que queremos insertar
      ]);

    if (insertError) {
      setError(insertError.message);
      console.error("Error al crear el centro:", insertError);
      setLoading(false);
    } else {
      // ¡Éxito!
      setLoading(false);
      onCenterCreated(); // Avisamos al panel principal para que refresque la lista
      onClose(); // Cerramos el modal
    }
  };

  // Si el modal no está abierto, no renderizamos nada
  if (!isOpen) {
    return null;
  }

  // Estilos simples para el modal (puedes mejorarlos después con CSS)
  const modalStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0, 0, 0, 0.5)', display: 'flex', 
    alignItems: 'center', justifyContent: 'center'
  };
  const contentStyle: React.CSSProperties = {
    background: 'white', padding: '30px', borderRadius: '8px', 
    width: '500px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  };

  return (
    <div style={modalStyle}>
      <div style={contentStyle}>
        <h2>Añadir Nuevo Centro</h2>
        <form onSubmit={handleSubmit}>
          {/* Campos del formulario... */}
          <div style={{ marginBottom: '15px' }}>
            <label>Nombre del Centro</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Ciudad</label>
            <input type="text" value={city} onChange={e => setCity(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Tipo</label>
            <select value={type} onChange={e => setType(e.target.value as CenterType)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
              <option value="Propio">Propio</option>
              <option value="Franquicia">Franquicia</option>
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label>Estado</label>
            <select value={status} onChange={e => setStatus(e.target.value as CenterStatus)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
              <option value="Activo">Activo</option>
              <option value="En Construcción">En Construcción</option>
              <option value="Suspendido">Suspendido</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear Centro'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};