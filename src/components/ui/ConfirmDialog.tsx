/**
 * ConfirmDialog — Reemplaza window.confirm() con un modal accesible y branded.
 * Incluir UNA VEZ en App.tsx dentro de <SessionProvider>
 *
 * Uso desde cualquier función async:
 *   import { ui } from '../../utils/ui';
 *   const ok = await ui.confirm('¿Eliminar este elemento?');
 *   const ok = await ui.confirm({
 *     title: 'Eliminar inspección',
 *     message: '¿Estás seguro? Esta acción no se puede deshacer.',
 *     type: 'danger',
 *     confirmText: 'Sí, eliminar',
 *   });
 */
import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Info, Trash2, X } from 'lucide-react';
import { UI_CONFIRM_EVENT, ConfirmRequest } from '../../utils/ui';

interface DialogState extends ConfirmRequest {}

const TYPE_CONFIG = {
  danger: {
    icon: <Trash2 size={24} />,
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
    confirmBg: '#dc2626',
    confirmHover: '#b91c1c',
    title: 'Confirmar eliminación',
  },
  warning: {
    icon: <AlertTriangle size={24} />,
    iconBg: '#fef3c7',
    iconColor: '#d97706',
    confirmBg: '#d97706',
    confirmHover: '#b45309',
    title: 'Confirmar acción',
  },
  info: {
    icon: <Info size={24} />,
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
    confirmBg: '#2563eb',
    confirmHover: '#1d4ed8',
    title: 'Confirmación',
  },
};

export const ConfirmDialog: React.FC = () => {
  const [dialog, setDialog] = useState<DialogState | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      setDialog((e as CustomEvent<ConfirmRequest>).detail);
    };
    window.addEventListener(UI_CONFIRM_EVENT, handler);
    return () => window.removeEventListener(UI_CONFIRM_EVENT, handler);
  }, []);

  const handleResponse = useCallback((value: boolean) => {
    dialog?.resolve(value);
    setDialog(null);
  }, [dialog]);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!dialog) return;
      if (e.key === 'Escape') handleResponse(false);
      if (e.key === 'Enter') handleResponse(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog, handleResponse]);

  if (!dialog) return null;

  const type = dialog.type ?? 'danger';
  const cfg = TYPE_CONFIG[type];
  const title = dialog.title ?? cfg.title;
  const confirmText = dialog.confirmText ?? (type === 'danger' ? 'Eliminar' : 'Confirmar');
  const cancelText = dialog.cancelText ?? 'Cancelar';

  return (
    <>
      <style>{`
        @keyframes confirmFadeIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Overlay */}
      <div
        onClick={() => handleResponse(false)}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          zIndex: 100000, backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}
      >
        {/* Dialog */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
            animation: 'confirmFadeIn 0.2s cubic-bezier(0.34,1.56,0.64,1)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: cfg.iconBg, color: cfg.iconColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {cfg.icon}
            </div>
            <div style={{ flex: 1, paddingTop: '4px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#111827' }}>
                {title}
              </h3>
              <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                {dialog.message}
              </p>
            </div>
            <button
              onClick={() => handleResponse(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#9ca3af', padding: '4px', lineHeight: 1, flexShrink: 0,
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Actions */}
          <div style={{
            padding: '20px 24px 24px',
            display: 'flex', gap: '10px', justifyContent: 'flex-end',
          }}>
            <button
              onClick={() => handleResponse(false)}
              style={{
                padding: '9px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
            >
              {cancelText}
            </button>
            <button
              onClick={() => handleResponse(true)}
              autoFocus
              style={{
                padding: '9px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                border: 'none', background: cfg.confirmBg, color: '#fff',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = cfg.confirmHover)}
              onMouseLeave={e => (e.currentTarget.style.background = cfg.confirmBg)}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;
