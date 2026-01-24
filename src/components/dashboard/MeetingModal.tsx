import React from 'react';

// Placeholder simple para evitar errores de compilación mientras se desarrolla el completo
// TODO: Implementar modal completo de reuniones
interface Props {
    onClose: () => void;
}

export const MeetingModal: React.FC<Props> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
                <h2>Nueva Reunión</h2>
                <p>Funcionalidad en desarrollo...</p>
                <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded">Cerrar</button>
            </div>
        </div>
    );
};
