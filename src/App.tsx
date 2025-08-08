import React from 'react';
import { SessionProvider, useSession } from './contexts/SessionContext';
import { DataProvider } from './contexts/DataContext';
import LoginForm from './components/LoginForm';
// import { CentersDashboard } from './pages/CentersDashboard'; // Descomenta cuando esté listo
import './App.css';

// Componente temporal de Dashboard hasta que tengas el real
const TempDashboard: React.FC = () => {
  const { user, signOut } = useSession();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                La Jungla Workout - Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Bienvenido, {user?.email}
              </span>
              <button
                onClick={signOut}
                className="text-sm text-emerald-600 hover:text-emerald-500"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal temporal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¡Login Exitoso! 🎉
              </h2>
              <p className="text-gray-600 mb-4">
                Has iniciado sesión correctamente en La Jungla Workout
              </p>
              <p className="text-sm text-gray-500">
                Usuario: {user?.email}
              </p>
              <div className="mt-6">
                <p className="text-sm text-blue-600">
                  Aquí irá tu dashboard principal...
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Componente que maneja la lógica de autenticación
const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useSession();

  // Mostrar loading mientras se verifica la sesión
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-700 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Si está autenticado, mostrar dashboard (temporal por ahora)
  return (
    <DataProvider>
      <TempDashboard />
      {/* Cuando tengas CentersDashboard listo, reemplaza TempDashboard por: */}
      {/* <CentersDashboard /> */}
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

export default App;