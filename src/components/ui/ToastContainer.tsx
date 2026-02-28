/**
 * ToastContainer — Renderiza los toasts disparados por ui.ts
 * Incluir UNA VEZ en App.tsx dentro de <SessionProvider>
 */
import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { UI_TOAST_EVENT, ToastMessage, ToastType } from '../../utils/ui';

const COLORS: Record<ToastType, { bg: string; border: string; text: string; icon: string; bar: string }> = {
  success: { bg: '#f0fdf4', border: '#86efac', text: '#166534', icon: '#16a34a', bar: '#16a34a' },
  error:   { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', icon: '#dc2626', bar: '#dc2626' },
  warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e', icon: '#d97706', bar: '#d97706' },
  info:    { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', icon: '#2563eb', bar: '#2563eb' },
};

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} />,
  error:   <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info:    <Info size={18} />,
};

interface ActiveToast extends ToastMessage {
  exiting?: boolean;
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  const removeToast = useCallback((id: string) => {
    // Marca como saliendo para animar
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 250);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const toast = (e as CustomEvent<ToastMessage>).detail;
      setToasts(prev => [...prev, toast]);
      setTimeout(() => removeToast(toast.id), toast.duration);
    };

    window.addEventListener(UI_TOAST_EVENT, handler);
    return () => window.removeEventListener(UI_TOAST_EVENT, handler);
  }, [removeToast]);

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes toastSlideOut {
          from { transform: translateX(0);    opacity: 1; }
          to   { transform: translateX(110%); opacity: 0; }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '380px',
          width: 'calc(100vw - 32px)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(toast => {
          const c = COLORS[toast.type];
          return (
            <div
              key={toast.id}
              style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: '12px',
                padding: '12px 14px 6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                animation: toast.exiting
                  ? 'toastSlideOut 0.25s ease forwards'
                  : 'toastSlideIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                pointerEvents: 'auto',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: c.icon, flexShrink: 0, marginTop: '1px' }}>
                  {ICONS[toast.type]}
                </span>
                <span style={{ flex: 1, color: c.text, fontSize: '14px', fontWeight: 500, lineHeight: '1.45' }}>
                  {toast.message}
                </span>
                <button
                  onClick={() => removeToast(toast.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: c.icon, flexShrink: 0, padding: '2px', opacity: 0.7,
                    lineHeight: 1,
                  }}
                >
                  <X size={14} />
                </button>
              </div>
              {/* Barra de progreso */}
              <div style={{ height: '3px', background: `${c.bar}20`, borderRadius: '99px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: c.bar,
                    borderRadius: '99px',
                    animation: `toastProgress ${toast.duration}ms linear forwards`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ToastContainer;
