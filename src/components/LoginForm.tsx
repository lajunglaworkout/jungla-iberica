import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Lock, AlertCircle, CheckCircle, Dumbbell } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  // Animación de entrada
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.email) {
      errors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔐 Intentando login con email:', formData.email);
      
      // AUTENTICACIÓN REAL CON SUPABASE
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) {
        console.log('❌ Error de autenticación:', authError.message);
        
        // Si falla la autenticación, verificar si es un email actualizado
        if (authError.message === 'Invalid login credentials') {
          console.log('🔍 Verificando si el email fue actualizado en gestión de usuarios...');
          
          // Buscar el email en la tabla employees
          const { data: employeeData, error: employeeError } = await supabase
            .from('employees')
            .select('email, user_id, name, is_active')
            .eq('email', formData.email)
            .eq('is_active', true)
            .single();
          
          if (employeeData && !employeeError) {
            console.log('✅ Email encontrado en tabla employees:', employeeData);
            setError(`El email ${formData.email} fue actualizado recientemente. 
                     Por favor, contacta con el administrador para reactivar tu acceso.
                     Usuario: ${employeeData.name}`);
          } else {
            setError('Email o contraseña incorrectos');
          }
        } else {
          // Manejar otros errores específicos de Supabase
          switch (authError.message) {
            case 'Email not confirmed':
              setError('Email no confirmado. Revisa tu bandeja de entrada.');
              break;
            case 'Too many requests':
              setError('Demasiados intentos. Espera un momento.');
              break;
            default:
              setError(authError.message);
          }
        }
      } else if (data.user) {
        console.log('✅ Login exitoso para:', data.user.email);
        // Login exitoso
        setSuccess(true);
        
        // Callback opcional
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        
        // Redirigir después de un breve delay
        setTimeout(() => {
          console.log('Redirigiendo al dashboard...');
        }, 1500);
      }
    } catch (err) {
      console.error('Error durante el login:', err);
      setError('Error de conexión. Verifica tu internet e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  // Pantalla de éxito
  if (success) {
    return (
      <div className="jungla-success-container">
        <div className="jungla-success-card">
          <div className="jungla-success-icon">
            <CheckCircle size={48} style={{ color: '#10b981' }} />
          </div>
          <h2 className="jungla-success-title">¡Bienvenido a La Jungla!</h2>
          <p className="jungla-success-text">Acceso exitoso. Cargando tu dashboard...</p>
          <div className="jungla-loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="jungla-container">
      {/* Background Pattern */}
      <div className="jungla-background-pattern"></div>
      
      <div className={`jungla-main-card ${isVisible ? 'jungla-visible' : ''}`}>
        <div className="jungla-card-container">
          {/* Panel Izquierdo - Solo visible en desktop */}
          <div className="jungla-left-panel">
            {/* Pattern decorativo */}
            <div className="jungla-decorative-pattern">
              <div className="jungla-circle-1"></div>
              <div className="jungla-circle-2"></div>
              <div className="jungla-circle-3"></div>
            </div>
            
            <div className="jungla-branding-content">
              {/* Logo */}
              <div className="jungla-logo-container">
                <div className="jungla-logo-icon">
                  <Dumbbell size={32} color="white" />
                </div>
                <div className="jungla-logo-text">
                  <h1 className="jungla-logo-title">LA JUNGLA</h1>
                  <p className="jungla-logo-subtitle">WORKOUT</p>
                </div>
              </div>
              
              <h2 className="jungla-welcome-title">
                Bienvenido de vuelta
              </h2>
              <p className="jungla-welcome-text">
                Accede a tu panel de control para gestionar tu centro fitness. 
                Controla todo desde un solo lugar.
              </p>
              
              <div className="jungla-features-list">
                <div className="jungla-feature-item">
                  <CheckCircle size={20} style={{ marginRight: '12px' }} />
                  <span>Gestión completa de centros</span>
                </div>
                <div className="jungla-feature-item">
                  <CheckCircle size={20} style={{ marginRight: '12px' }} />
                  <span>Control de empleados y clientes</span>
                </div>
                <div className="jungla-feature-item">
                  <CheckCircle size={20} style={{ marginRight: '12px' }} />
                  <span>Reportes y analytics en tiempo real</span>
                </div>
              </div>
            </div>
          </div>

          {/* Panel del Formulario - Responsive */}
          <div className="jungla-right-panel">
            <div className="jungla-form-container">
              
              {/* Logo móvil - Solo visible en móvil */}
              <div className="jungla-mobile-logo-container">
                <div className="jungla-mobile-logo-icon">
                  <Dumbbell size={28} color="#059669" />
                </div>
                <div className="jungla-mobile-logo-text">
                  <h1 className="jungla-mobile-logo-title">LA JUNGLA</h1>
                  <p className="jungla-mobile-logo-subtitle">WORKOUT</p>
                </div>
              </div>
              
              <div className="jungla-form-header">
                <h3 className="jungla-form-title">Iniciar Sesión</h3>
                <p className="jungla-form-subtitle">
                  Ingresa tus credenciales para acceder
                </p>
              </div>

              {error && (
                <div className="jungla-error-alert">
                  <AlertCircle size={20} style={{ color: '#ef4444', marginRight: '12px' }} />
                  <span className="jungla-error-text">{error}</span>
                </div>
              )}

              <div className="jungla-form-fields" onKeyPress={handleKeyPress}>
                {/* Email Field */}
                <div className="jungla-field-container">
                  <label htmlFor="email" className="jungla-field-label">
                    Email
                  </label>
                  <div className="jungla-input-container">
                    <div className="jungla-input-icon">
                      <User size={20} style={{ color: '#9ca3af' }} />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`jungla-input ${validationErrors.email ? 'jungla-input-error' : ''}`}
                      placeholder="tu@email.com"
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="jungla-validation-error">{validationErrors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="jungla-field-container">
                  <label htmlFor="password" className="jungla-field-label">
                    Contraseña
                  </label>
                  <div className="jungla-input-container">
                    <div className="jungla-input-icon">
                      <Lock size={20} style={{ color: '#9ca3af' }} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`jungla-input jungla-password-input ${validationErrors.password ? 'jungla-input-error' : ''}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="jungla-password-toggle"
                    >
                      {showPassword ? (
                        <EyeOff size={20} style={{ color: '#9ca3af' }} />
                      ) : (
                        <Eye size={20} style={{ color: '#9ca3af' }} />
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="jungla-validation-error">{validationErrors.password}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="jungla-form-options">
                  <div className="jungla-remember-me">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="jungla-checkbox"
                    />
                    <label htmlFor="remember-me" className="jungla-checkbox-label">
                      Recordarme
                    </label>
                  </div>
                  <button
                    type="button"
                    className="jungla-forgot-password"
                    onClick={() => {
                      alert('Funcionalidad de recuperación de contraseña por implementar');
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`jungla-submit-button ${loading ? 'jungla-submit-disabled' : ''}`}
                >
                  {loading ? (
                    <div className="jungla-loading-container">
                      <div className="jungla-loading-spinner-small"></div>
                      <span>Iniciando sesión...</span>
                    </div>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </div>

              {/* Footer */}
              <div className="jungla-form-footer">
                <p className="jungla-footer-text">
                  ¿Problemas para acceder?{' '}
                  <button 
                    className="jungla-support-link"
                    onClick={() => {
                      alert('Contacta con soporte: soporte@lajungla.com');
                    }}
                  >
                    Contacta con soporte
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Añadir CSS con Media Queries
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  /* Estilos base */
  .jungla-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f766e 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    position: relative;
  }

  .jungla-background-pattern {
    position: absolute;
    inset: 0;
    opacity: 0.1;
    background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1), transparent 50%);
  }

  .jungla-main-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    overflow: hidden;
    max-width: 1024px;
    width: 100%;
    transition: all 1s ease-out;
    transform: translateY(20px) scale(0.95);
    opacity: 0;
  }

  .jungla-main-card.jungla-visible {
    transform: translateY(0) scale(1);
    opacity: 1;
  }

  .jungla-card-container {
    display: flex;
    flex-direction: row;
    min-height: 600px;
  }

  /* Panel izquierdo */
  .jungla-left-panel {
    flex: 1;
    background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
    padding: 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: white;
    position: relative;
    overflow: hidden;
  }

  .jungla-decorative-pattern {
    position: absolute;
    inset: 0;
    opacity: 0.2;
  }

  .jungla-circle-1 {
    position: absolute;
    top: 40px;
    left: 40px;
    width: 128px;
    height: 128px;
    border: 1px solid white;
    border-radius: 50%;
  }

  .jungla-circle-2 {
    position: absolute;
    bottom: 80px;
    right: 40px;
    width: 80px;
    height: 80px;
    border: 1px solid white;
    border-radius: 50%;
  }

  .jungla-circle-3 {
    position: absolute;
    top: 50%;
    right: 80px;
    width: 64px;
    height: 64px;
    border: 1px solid white;
    border-radius: 50%;
  }

  .jungla-branding-content {
    position: relative;
    z-index: 10;
  }

  .jungla-logo-container {
    display: flex;
    align-items: center;
    margin-bottom: 32px;
  }

  .jungla-logo-icon {
    background: rgba(255,255,255,0.2);
    padding: 12px;
    border-radius: 12px;
    margin-right: 16px;
  }

  .jungla-logo-title {
    font-size: 28px;
    font-weight: bold;
    margin: 0;
  }

  .jungla-logo-subtitle {
    color: rgba(16, 185, 129, 0.8);
    font-weight: 500;
    margin: 0;
  }

  .jungla-welcome-title {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 24px;
    line-height: 1.2;
  }

  .jungla-welcome-text {
    color: rgba(16, 185, 129, 0.9);
    font-size: 18px;
    margin-bottom: 32px;
    line-height: 1.6;
  }

  .jungla-features-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .jungla-feature-item {
    display: flex;
    align-items: center;
    color: rgba(16, 185, 129, 0.9);
  }

  /* Panel derecho */
  .jungla-right-panel {
    flex: 1;
    padding: 48px;
    display: flex;
    align-items: center;
  }

  .jungla-form-container {
    max-width: 384px;
    margin: 0 auto;
    width: 100%;
  }

  /* Logo móvil - Oculto por defecto */
  .jungla-mobile-logo-container {
    display: none;
    align-items: center;
    justify-content: center;
    margin-bottom: 32px;
  }

  .jungla-mobile-logo-icon {
    background: rgba(5, 150, 105, 0.1);
    padding: 12px;
    border-radius: 12px;
    margin-right: 12px;
  }

  .jungla-mobile-logo-title {
    font-size: 24px;
    font-weight: bold;
    margin: 0;
    color: #059669;
  }

  .jungla-mobile-logo-subtitle {
    color: #6b7280;
    font-weight: 500;
    margin: 0;
    font-size: 14px;
  }

  /* Headers */
  .jungla-form-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .jungla-form-title {
    font-size: 24px;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 8px;
  }

  .jungla-form-subtitle {
    color: #6b7280;
  }

  /* Alertas */
  .jungla-error-alert {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
  }

  .jungla-error-text {
    color: #b91c1c;
    font-size: 14px;
  }

  /* Campos */
  .jungla-form-fields {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .jungla-field-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 8px;
  }

  .jungla-input-container {
    position: relative;
  }

  .jungla-input-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }

  .jungla-input {
    width: 100%;
    padding: 12px 12px 12px 40px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 16px;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.2s;
    outline: none;
    box-sizing: border-box;
  }

  .jungla-password-input {
    padding-right: 50px;
  }

  .jungla-input:focus {
    border-color: #059669;
    ring: 2px solid #059669;
  }

  .jungla-input-error {
    border-color: #fca5a5;
  }

  .jungla-password-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
  }

  .jungla-validation-error {
    margin-top: 4px;
    font-size: 14px;
    color: #dc2626;
  }

  /* Opciones de formulario */
  .jungla-form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .jungla-remember-me {
    display: flex;
    align-items: center;
  }

  .jungla-checkbox {
    width: 16px;
    height: 16px;
    margin-right: 8px;
    accent-color: #059669;
  }

  .jungla-checkbox-label {
    font-size: 14px;
    color: #374151;
  }

  .jungla-forgot-password {
    font-size: 14px;
    color: #059669;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 500;
  }

  /* Botón submit */
  .jungla-submit-button {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(90deg, #059669 0%, #0d9488 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .jungla-submit-button:hover {
    background: linear-gradient(90deg, #047857 0%, #0f766e 100%);
  }

  .jungla-submit-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .jungla-loading-container {
    display: flex;
    align-items: center;
  }

  .jungla-loading-spinner-small {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 8px;
  }

  /* Footer */
  .jungla-form-footer {
    margin-top: 24px;
    text-align: center;
  }

  .jungla-footer-text {
    font-size: 14px;
    color: #6b7280;
  }

  .jungla-support-link {
    color: #059669;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 500;
    font-size: inherit;
  }

  /* Pantalla de éxito */
  .jungla-success-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f766e 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .jungla-success-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    padding: 32px;
    max-width: 384px;
    width: 100%;
    text-align: center;
    animation: bounce 1s ease-in-out;
  }

  .jungla-success-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
    background: #f0fdf4;
    padding: 16px;
    border-radius: 50%;
    width: 64px;
    height: 64px;
    margin: 0 auto 24px auto;
    align-items: center;
  }

  .jungla-success-title {
    font-size: 24px;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 16px;
  }

  .jungla-success-text {
    color: #6b7280;
    margin-bottom: 16px;
    font-size: 14px;
  }

  .jungla-loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #059669;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }

  /* Animaciones */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
      transform: translate3d(0, -30px, 0);
    }
    70% {
      animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
      transform: translate3d(0, -15px, 0);
    }
    90% {
      transform: translate3d(0,-4px,0);
    }
  }

  /* RESPONSIVE MOBILE */
  @media (max-width: 768px) {
    .jungla-container {
      padding: 0;
    }

    .jungla-main-card {
      border-radius: 0;
      min-height: 100vh;
      max-width: none;
      box-shadow: none;
    }

    .jungla-card-container {
      flex-direction: column;
      min-height: 100vh;
    }

    /* Ocultar panel izquierdo en móvil */
    .jungla-left-panel {
      display: none;
    }

    /* Mostrar logo móvil */
    .jungla-mobile-logo-container {
      display: flex;
    }

    .jungla-right-panel {
      padding: 24px 20px;
      justify-content: center;
    }

    .jungla-form-container {
      max-width: 320px;
    }

    .jungla-form-title {
      font-size: 22px;
    }

    .jungla-form-subtitle {
      font-size: 14px;
    }

    .jungla-input {
      padding: 14px 12px 14px 40px;
      min-height: 44px;
    }

    .jungla-submit-button {
      padding: 16px;
      font-size: 16px;
      min-height: 44px;
    }

    .jungla-form-options {
      flex-direction: column;
      gap: 12px;
      align-items: center;
    }

    .jungla-error-alert {
      padding: 12px;
      margin-bottom: 20px;
    }

    .jungla-footer-text {
      font-size: 13px;
    }

    .jungla-success-title {
      font-size: 20px;
    }

    .jungla-success-card {
      padding: 24px;
      max-width: 300px;
    }
  }

  /* Fix para evitar zoom en iOS */
  input[type="email"],
  input[type="password"],
  input[type="text"] {
    font-size: 16px !important;
  }
`;
document.head.appendChild(styleSheet);

export default LoginForm;