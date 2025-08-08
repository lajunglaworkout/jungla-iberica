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
  
  // Detectar si es móvil
  const [isMobile, setIsMobile] = useState(false);
  
  // Animación de entrada
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
    // Detectar móvil
    setIsMobile(window.innerWidth <= 768);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
      // AUTENTICACIÓN REAL CON SUPABASE
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) {
        // Manejar errores específicos de Supabase
        switch (authError.message) {
          case 'Invalid login credentials':
            setError('Email o contraseña incorrectos');
            break;
          case 'Email not confirmed':
            setError('Email no confirmado. Revisa tu bandeja de entrada.');
            break;
          case 'Too many requests':
            setError('Demasiados intentos. Espera un momento.');
            break;
          default:
            setError(authError.message);
        }
      } else if (data.user) {
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
      <div style={isMobile ? styles.mobileSuccessContainer : styles.successContainer}>
        <div style={isMobile ? styles.mobileSuccessCard : styles.successCard}>
          <div style={styles.successIcon}>
            <CheckCircle size={isMobile ? 40 : 48} style={{ color: '#10b981' }} />
          </div>
          <h2 style={isMobile ? styles.mobileSuccessTitle : styles.successTitle}>¡Bienvenido a La Jungla!</h2>
          <p style={styles.successText}>Acceso exitoso. Cargando tu dashboard...</p>
          <div style={styles.loadingSpinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Background Pattern */}
      <div style={styles.backgroundPattern}></div>
      
      <div style={{
        ...styles.mainCard,
        ...(isMobile ? styles.mobileMainCard : {}),
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        opacity: isVisible ? 1 : 0,
      }}>
        <div style={isMobile ? styles.mobileCardContainer : styles.cardContainer}>
          {/* Panel Izquierdo - Solo visible en desktop */}
          {!isMobile && (
            <div style={styles.leftPanel}>
              {/* Pattern decorativo */}
              <div style={styles.decorativePattern}>
                <div style={styles.circle1}></div>
                <div style={styles.circle2}></div>
                <div style={styles.circle3}></div>
              </div>
              
              <div style={styles.brandingContent}>
                {/* Logo */}
                <div style={styles.logoContainer}>
                  <div style={styles.logoIcon}>
                    <Dumbbell size={32} color="white" />
                  </div>
                  <div style={styles.logoText}>
                    <h1 style={styles.logoTitle}>LA JUNGLA</h1>
                    <p style={styles.logoSubtitle}>WORKOUT</p>
                  </div>
                </div>
                
                <h2 style={styles.welcomeTitle}>
                  Bienvenido de vuelta
                </h2>
                <p style={styles.welcomeText}>
                  Accede a tu panel de control para gestionar tu centro fitness. 
                  Controla todo desde un solo lugar.
                </p>
                
                <div style={styles.featuresList}>
                  <div style={styles.featureItem}>
                    <CheckCircle size={20} style={styles.featureIcon} />
                    <span>Gestión completa de centros</span>
                  </div>
                  <div style={styles.featureItem}>
                    <CheckCircle size={20} style={styles.featureIcon} />
                    <span>Control de empleados y clientes</span>
                  </div>
                  <div style={styles.featureItem}>
                    <CheckCircle size={20} style={styles.featureIcon} />
                    <span>Reportes y analytics en tiempo real</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Panel del Formulario - Responsive */}
          <div style={isMobile ? styles.mobileRightPanel : styles.rightPanel}>
            <div style={isMobile ? styles.mobileFormContainer : styles.formContainer}>
              
              {/* Logo móvil - Solo visible en móvil */}
              {isMobile && (
                <div style={styles.mobileLogoContainer}>
                  <div style={styles.mobileLogoIcon}>
                    <Dumbbell size={28} color="#059669" />
                  </div>
                  <div style={styles.mobileLogoText}>
                    <h1 style={styles.mobileLogoTitle}>LA JUNGLA</h1>
                    <p style={styles.mobileLogoSubtitle}>WORKOUT</p>
                  </div>
                </div>
              )}
              
              <div style={styles.formHeader}>
                <h3 style={isMobile ? styles.mobileFormTitle : styles.formTitle}>Iniciar Sesión</h3>
                <p style={isMobile ? styles.mobileFormSubtitle : styles.formSubtitle}>
                  Ingresa tus credenciales para acceder
                </p>
              </div>

              {error && (
                <div style={isMobile ? styles.mobileErrorAlert : styles.errorAlert}>
                  <AlertCircle size={20} style={styles.errorIcon} />
                  <span style={styles.errorText}>{error}</span>
                </div>
              )}

              <div style={styles.formFields} onKeyPress={handleKeyPress}>
                {/* Email Field */}
                <div style={styles.fieldContainer}>
                  <label htmlFor="email" style={styles.fieldLabel}>
                    Email
                  </label>
                  <div style={styles.inputContainer}>
                    <div style={styles.inputIcon}>
                      <User size={20} style={styles.iconStyle} />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{
                        ...(isMobile ? styles.mobileInput : styles.input),
                        ...(validationErrors.email ? styles.inputError : {})
                      }}
                      placeholder="tu@email.com"
                    />
                  </div>
                  {validationErrors.email && (
                    <p style={styles.validationError}>{validationErrors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div style={styles.fieldContainer}>
                  <label htmlFor="password" style={styles.fieldLabel}>
                    Contraseña
                  </label>
                  <div style={styles.inputContainer}>
                    <div style={styles.inputIcon}>
                      <Lock size={20} style={styles.iconStyle} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      style={{
                        ...(isMobile ? styles.mobileInput : styles.input),
                        paddingRight: '50px',
                        ...(validationErrors.password ? styles.inputError : {})
                      }}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={styles.passwordToggle}
                    >
                      {showPassword ? (
                        <EyeOff size={20} style={styles.iconStyle} />
                      ) : (
                        <Eye size={20} style={styles.iconStyle} />
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p style={styles.validationError}>{validationErrors.password}</p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div style={isMobile ? styles.mobileFormOptions : styles.formOptions}>
                  <div style={styles.rememberMe}>
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      style={styles.checkbox}
                    />
                    <label htmlFor="remember-me" style={styles.checkboxLabel}>
                      Recordarme
                    </label>
                  </div>
                  <button
                    type="button"
                    style={styles.forgotPassword}
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
                  style={{
                    ...(isMobile ? styles.mobileSubmitButton : styles.submitButton),
                    ...(loading ? styles.submitButtonDisabled : {})
                  }}
                >
                  {loading ? (
                    <div style={styles.loadingContainer}>
                      <div style={styles.loadingSpinnerSmall}></div>
                      <span>Iniciando sesión...</span>
                    </div>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </div>

              {/* Footer */}
              <div style={styles.formFooter}>
                <p style={isMobile ? styles.mobileFooterText : styles.footerText}>
                  ¿Problemas para acceder?{' '}
                  <button 
                    style={styles.supportLink}
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

// Estilos CSS en JS con responsive design
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f766e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    position: 'relative' as const,
  },
  backgroundPattern: {
    position: 'absolute' as const,
    inset: 0,
    opacity: 0.1,
    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1), transparent 50%)',
  },
  mainCard: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    maxWidth: '1024px',
    width: '100%',
    transition: 'all 1s ease-out',
  },
  mobileMainCard: {
    margin: '0',
    borderRadius: '0',
    minHeight: '100vh',
    maxWidth: 'none',
    boxShadow: 'none',
  },
  cardContainer: {
    display: 'flex',
    flexDirection: 'row' as const,
    minHeight: '600px',
  },
  mobileCardContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
  },
  // Panel izquierdo (solo desktop)
  leftPanel: {
    flex: '1',
    background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
    padding: '48px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    color: 'white',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  decorativePattern: {
    position: 'absolute' as const,
    inset: 0,
    opacity: 0.2,
  },
  circle1: {
    position: 'absolute' as const,
    top: '40px',
    left: '40px',
    width: '128px',
    height: '128px',
    border: '1px solid white',
    borderRadius: '50%',
  },
  circle2: {
    position: 'absolute' as const,
    bottom: '80px',
    right: '40px',
    width: '80px',
    height: '80px',
    border: '1px solid white',
    borderRadius: '50%',
  },
  circle3: {
    position: 'absolute' as const,
    top: '50%',
    right: '80px',
    width: '64px',
    height: '64px',
    border: '1px solid white',
    borderRadius: '50%',
  },
  brandingContent: {
    position: 'relative' as const,
    zIndex: 10,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '32px',
  },
  logoIcon: {
    background: 'rgba(255,255,255,0.2)',
    padding: '12px',
    borderRadius: '12px',
    marginRight: '16px',
  },
  logoText: {},
  logoTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    margin: 0,
  },
  logoSubtitle: {
    color: 'rgba(16, 185, 129, 0.8)',
    fontWeight: '500',
    margin: 0,
  },
  welcomeTitle: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '24px',
    lineHeight: '1.2',
  },
  welcomeText: {
    color: 'rgba(16, 185, 129, 0.9)',
    fontSize: '18px',
    marginBottom: '32px',
    lineHeight: '1.6',
  },
  featuresList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    color: 'rgba(16, 185, 129, 0.9)',
  },
  featureIcon: {
    marginRight: '12px',
  },
  // Panel derecho responsive
  rightPanel: {
    flex: '1',
    padding: '48px',
    display: 'flex',
    alignItems: 'center',
  },
  mobileRightPanel: {
    flex: '1',
    padding: '24px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    maxWidth: '384px',
    margin: '0 auto',
    width: '100%',
  },
  mobileFormContainer: {
    width: '100%',
    maxWidth: '320px',
  },
  // Logo móvil
  mobileLogoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '32px',
  },
  mobileLogoIcon: {
    background: 'rgba(5, 150, 105, 0.1)',
    padding: '12px',
    borderRadius: '12px',
    marginRight: '12px',
  },
  mobileLogoText: {},
  mobileLogoTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
    color: '#059669',
  },
  mobileLogoSubtitle: {
    color: '#6b7280',
    fontWeight: '500',
    margin: 0,
    fontSize: '14px',
  },
  // Headers responsive
  formHeader: {
    textAlign: 'center' as const,
    marginBottom: '32px',
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
  },
  mobileFormTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
  },
  formSubtitle: {
    color: '#6b7280',
  },
  mobileFormSubtitle: {
    color: '#6b7280',
    fontSize: '14px',
  },
  // Alertas responsive
  errorAlert: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
  },
  mobileErrorAlert: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
  },
  errorIcon: {
    color: '#ef4444',
    marginRight: '12px',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: '14px',
  },
  // Campos de formulario
  formFields: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  fieldContainer: {},
  fieldLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px',
  },
  inputContainer: {
    position: 'relative' as const,
  },
  inputIcon: {
    position: 'absolute' as const,
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none' as const,
  },
  iconStyle: {
    color: '#9ca3af',
  },
  input: {
    width: '100%',
    paddingLeft: '40px',
    paddingRight: '12px',
    paddingTop: '12px',
    paddingBottom: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  mobileInput: {
    width: '100%',
    paddingLeft: '40px',
    paddingRight: '12px',
    paddingTop: '14px',
    paddingBottom: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px', // Evita zoom en iOS
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  inputError: {
    borderColor: '#fca5a5',
  },
  passwordToggle: {
    position: 'absolute' as const,
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
  },
  validationError: {
    marginTop: '4px',
    fontSize: '14px',
    color: '#dc2626',
  },
  // Opciones de formulario responsive
  formOptions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mobileFormOptions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    alignItems: 'center',
  },
  rememberMe: {
    display: 'flex',
    alignItems: 'center',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    marginRight: '8px',
    accentColor: '#059669',
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#374151',
  },
  forgotPassword: {
    fontSize: '14px',
    color: '#059669',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
  },
  // Botones responsive
  submitButton: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'linear-gradient(90deg, #059669 0%, #0d9488 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  mobileSubmitButton: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px',
    background: 'linear-gradient(90deg, #059669 0%, #0d9488 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
  },
  submitButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  loadingSpinnerSmall: {
    width: '16px',
    height: '16px',
    border: '2px solid transparent',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '8px',
  },
  // Footer responsive
  formFooter: {
    marginTop: '24px',
    textAlign: 'center' as const,
  },
  footerText: {
    fontSize: '14px',
    color: '#6b7280',
  },
  mobileFooterText: {
    fontSize: '13px',
    color: '#6b7280',
  },
  supportLink: {
    color: '#059669',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: 'inherit',
  },
  // Pantallas de éxito responsive
  successContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f766e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  mobileSuccessContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f766e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  successCard: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    padding: '32px',
    maxWidth: '384px',
    width: '100%',
    textAlign: 'center' as const,
    animation: 'bounce 1s ease-in-out',
  },
  mobileSuccessCard: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    padding: '24px',
    width: '100%',
    maxWidth: '300px',
    textAlign: 'center' as const,
    animation: 'bounce 1s ease-in-out',
  },
  successIcon: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
    background: '#f0fdf4',
    padding: '16px',
    borderRadius: '50%',
    width: '64px',
    height: '64px',
    margin: '0 auto 24px auto',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '16px',
  },
  mobileSuccessTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '16px',
  },
  successText: {
    color: '#6b7280',
    marginBottom: '16px',
    fontSize: '14px',
  },
  loadingSpinner: {
    width: '24px',
    height: '24px',
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #059669',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
  },
};

// Añadir animaciones CSS
const styleSheet = document.createElement("style");
styleSheet.innerText = `
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
  
  /* Responsive styles */
  @media (max-width: 768px) {
    body {
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }
  }
  
  /* Fix para evitar zoom en iOS */
  input[type="email"],
  input[type="password"],
  input[type="text"] {
    font-size: 16px !important;
  }
  
  /* Mejoras de accesibilidad táctil */
  @media (max-width: 768px) {
    button {
      min-height: 44px;
      min-width: 44px;
    }
    
    input {
      min-height: 44px;
    }
  }
`;
document.head.appendChild(styleSheet);

export default LoginForm;