// src/App.tsx - Versión con Sistema de Roles Integrado
import React from 'react';
import { SessionProvider, useSession } from './contexts/SessionContext';
import { DataProvider } from './contexts/DataContext';
import LoginForm from './components/LoginForm';
import RoleDashboard from './components/RoleDashboard';
import './App.css';

// Componente de Loading
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 flex items-center justify-center">
    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Verificando sesión...</h2>
      <p className="text-gray-600 text-sm">Cargando tu perfil y permisos</p>
    </div>
  </div>
);

// Componente de Error
const ErrorScreen: React.FC<{ error: string; onRetry?: () => void }> = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-700 flex items-center justify-center">
    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Error de Sistema</h2>
      <p className="text-gray-600 text-sm mb-4">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  </div>
);

// Componente que maneja la lógica de autenticación y roles
const AppContent: React.FC = () => {
  const { isAuthenticated, loading, error, employee, userRole } = useSession();

  // Mostrar loading mientras se verifica la sesión
  if (loading) {
    return <LoadingScreen />;
  }

  // Mostrar error si hay problemas
  if (error) {
    return <ErrorScreen error={error} />;
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Si está autenticado pero no hay datos del empleado
  if (!employee || !userRole) {
    return (
      <ErrorScreen 
        error="No se pudieron cargar los datos del usuario. Contacta con el administrador."
      />
    );
  }

  // Si todo está correcto, mostrar dashboard según el rol
  return (
    <DataProvider>
      <RoleDashboard />
    </DataProvider>
  );
};

// Componente principal de la App
const App: React.FC = () => {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
};

export default App;// Force deploy Sat Aug  9 09:19:01 CEST 2025
// Force redeploy Sat Aug  9 09:33:22 CEST 2025
