// src/components/auth/CenterLogin.tsx - Login específico para centros
import React, { useState } from 'react';
import { Building2, Lock, Mail, ArrowLeft, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface CenterLoginProps {
  onBack: () => void;
  onLoginSuccess: (centerData: any) => void;
}

interface CenterAccount {
  email: string;
  password: string;
  centerData: {
    id: number;
    name: string;
    location: string;
    type: string;
  };
}

const CenterLogin: React.FC<CenterLoginProps> = ({ onBack, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mapeo de emails a datos de centros (sin contraseñas)
  const centerDataMap: Record<string, { id: number; name: string; location: string; type: string }> = {
    'lajunglasevillaw@gmail.com': {
      id: 9,
      name: 'Centro Sevilla',
      location: 'Sevilla - Gimnasio',
      type: 'gym'
    },
    'lajunglajerez@gmail.com': {
      id: 10,
      name: 'Centro Jerez',
      location: 'Jerez - Gimnasio',
      type: 'gym'
    },
    'lajunglaelpuerto@gmail.com': {
      id: 11,
      name: 'Centro Puerto',
      location: 'Puerto de Santa María - Gimnasio',
      type: 'gym'
    },
    'pedidoslajungla@gmail.com': {
      id: 1,
      name: 'Almacén Central',
      location: 'Sevilla - Almacén',
      type: 'warehouse'
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Buscar datos del centro
      const centerData = centerDataMap[email.toLowerCase()];

      if (!centerData) {
        throw new Error('Centro no encontrado. Verifica el email.');
      }

      // NOTA: En producción, esto debería usar Supabase Auth
      // Por ahora, validación simple para desarrollo
      if (!password || password.length < 6) {
        throw new Error('Contraseña inválida.');
      }

      // Simular delay de autenticación
      await new Promise(resolve => setTimeout(resolve, 800));

      // Guardar sesión del centro en localStorage
      localStorage.setItem('centerSession', JSON.stringify({
        type: 'center',
        centerData: centerData,
        loginTime: new Date().toISOString()
      }));

      console.log('✅ Login de centro exitoso:', centerData.name);

      // Login exitoso
      onLoginSuccess(centerData);

    } catch (error: any) {
      console.error('❌ Error en login de centro:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <button
            onClick={onBack}
            style={{
              position: 'absolute',
              top: '24px',
              left: '24px',
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ArrowLeft size={16} />
            Volver
          </button>

          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏢</div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#111827' }}>
            Acceso de Centro
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 8px 0' }}>
            Inicia sesión con la cuenta de tu centro
          </p>
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '14px',
            color: '#92400e',
            display: 'inline-block'
          }}>
            🔒 Sistema offline - No requiere conexión a internet
          </div>
        </div>

        {/* Login Form */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '8px'
              }}>
                <Mail size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Email del Centro
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lajunglasevillaw@gmail.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151',
                marginBottom: '8px'
              }}>
                <Lock size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingRight: '48px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#dc2626'
              }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background-color 0.2s ease'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <Building2 size={20} />
                  Acceder al Centro
                </>
              )}
            </button>
          </form>
        </div>

        {/* Información de ayuda */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: '#0369a1'
          }}>
            💡 Usa las credenciales proporcionadas por el administrador
          </p>
        </div>


        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default CenterLogin;
