/**
 * ui.ts — Sistema global de UI: Toasts + Confirm dialogs
 *
 * Uso:
 *   import { ui } from '../utils/ui';
 *   ui.success('Guardado correctamente');
 *   ui.error('Ha ocurrido un error');
 *   const ok = await ui.confirm('¿Eliminar este elemento?');
 *   const ok = await ui.confirm({ title: 'Eliminar', message: '...', type: 'danger' });
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export interface ConfirmRequest extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

// Nombres de eventos custom
export const UI_TOAST_EVENT = 'ui:toast';
export const UI_CONFIRM_EVENT = 'ui:confirm';

let _toastCounter = 0;

/** Dispara un toast. Puede llamarse desde cualquier sitio (no necesita hooks). */
export function toast(message: string, type: ToastType = 'info', duration = 4000): void {
  _toastCounter++;
  const detail: ToastMessage = {
    id: `toast-${Date.now()}-${_toastCounter}`,
    message,
    type,
    duration,
  };
  window.dispatchEvent(new CustomEvent(UI_TOAST_EVENT, { detail }));
}

/** Muestra un diálogo de confirmación y devuelve una Promise<boolean>. */
export function showConfirm(options: ConfirmOptions | string): Promise<boolean> {
  const opts: ConfirmOptions =
    typeof options === 'string' ? { message: options } : options;

  return new Promise<boolean>((resolve) => {
    const detail: ConfirmRequest = { ...opts, resolve };
    window.dispatchEvent(new CustomEvent(UI_CONFIRM_EVENT, { detail }));
  });
}

/** Objeto de conveniencia para uso idiomático. */
export const ui = {
  /** Toast verde de éxito */
  success: (message: string, duration?: number) => toast(message, 'success', duration),
  /** Toast rojo de error */
  error: (message: string, duration?: number) => toast(message, 'error', duration ?? 6000),
  /** Toast naranja de advertencia */
  warning: (message: string, duration?: number) => toast(message, 'warning', duration),
  /** Toast azul informativo */
  info: (message: string, duration?: number) => toast(message, 'info', duration),
  /** Diálogo de confirmación — devuelve Promise<boolean> */
  confirm: showConfirm,
};

export default ui;
