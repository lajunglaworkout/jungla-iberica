/**
 * Tests para src/utils/ui.ts
 * Sistema de toasts y confirmaciones via window events — jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toast, showConfirm, ui, UI_TOAST_EVENT, UI_CONFIRM_EVENT } from '../utils/ui';
import type { ToastMessage, ConfirmRequest } from '../utils/ui';

describe('toast()', () => {
  let captured: ToastMessage[] = [];
  let listener: (e: Event) => void;

  beforeEach(() => {
    captured = [];
    listener = (e: Event) => {
      captured.push((e as CustomEvent<ToastMessage>).detail);
    };
    window.addEventListener(UI_TOAST_EVENT, listener);
  });

  afterEach(() => {
    window.removeEventListener(UI_TOAST_EVENT, listener);
    captured = [];
  });

  it('dispara el evento UI_TOAST_EVENT al llamar toast()', () => {
    toast('mensaje de prueba', 'success');
    expect(captured).toHaveLength(1);
  });

  it('el evento contiene el mensaje correcto', () => {
    toast('guardado', 'success');
    expect(captured[0].message).toBe('guardado');
  });

  it('el evento contiene el tipo correcto', () => {
    toast('error grave', 'error');
    expect(captured[0].type).toBe('error');
  });

  it('usa duración por defecto de 4000ms cuando no se especifica', () => {
    toast('info');
    expect(captured[0].duration).toBe(4000);
  });

  it('usa la duración personalizada cuando se especifica', () => {
    toast('mensaje', 'info', 8000);
    expect(captured[0].duration).toBe(8000);
  });

  it('genera IDs únicos para cada toast', () => {
    toast('primero', 'info');
    toast('segundo', 'info');
    expect(captured[0].id).not.toBe(captured[1].id);
  });

  it('tipo por defecto es info cuando no se especifica', () => {
    toast('sin tipo');
    expect(captured[0].type).toBe('info');
  });
});

describe('ui convenience methods', () => {
  let captured: ToastMessage[] = [];
  let listener: (e: Event) => void;

  beforeEach(() => {
    captured = [];
    listener = (e: Event) => {
      captured.push((e as CustomEvent<ToastMessage>).detail);
    };
    window.addEventListener(UI_TOAST_EVENT, listener);
  });

  afterEach(() => {
    window.removeEventListener(UI_TOAST_EVENT, listener);
    captured = [];
  });

  it('ui.success() dispara toast de tipo success', () => {
    ui.success('operación completada');
    expect(captured[0].type).toBe('success');
    expect(captured[0].message).toBe('operación completada');
  });

  it('ui.error() dispara toast de tipo error con duración 6000ms por defecto', () => {
    ui.error('algo falló');
    expect(captured[0].type).toBe('error');
    expect(captured[0].duration).toBe(6000);
  });

  it('ui.warning() dispara toast de tipo warning', () => {
    ui.warning('precaución');
    expect(captured[0].type).toBe('warning');
  });

  it('ui.info() dispara toast de tipo info', () => {
    ui.info('información');
    expect(captured[0].type).toBe('info');
  });

  it('ui.error() acepta duración personalizada', () => {
    ui.error('error', 3000);
    expect(captured[0].duration).toBe(3000);
  });
});

describe('showConfirm()', () => {
  it('dispara el evento UI_CONFIRM_EVENT', () => {
    let fired = false;
    window.addEventListener(UI_CONFIRM_EVENT, () => { fired = true; }, { once: true });

    showConfirm('¿Estás seguro?');
    expect(fired).toBe(true);
  });

  it('acepta string y lo convierte en ConfirmOptions con message', () => {
    let detail: ConfirmRequest | null = null;
    window.addEventListener(UI_CONFIRM_EVENT, (e) => {
      detail = (e as CustomEvent<ConfirmRequest>).detail;
    }, { once: true });

    showConfirm('¿Confirmar?');
    expect(detail).not.toBeNull();
    expect(detail!.message).toBe('¿Confirmar?');
  });

  it('acepta objeto ConfirmOptions con title y type', () => {
    let detail: ConfirmRequest | null = null;
    window.addEventListener(UI_CONFIRM_EVENT, (e) => {
      detail = (e as CustomEvent<ConfirmRequest>).detail;
    }, { once: true });

    showConfirm({ title: 'Eliminar', message: '¿Eliminar el registro?', type: 'danger' });
    expect(detail!.title).toBe('Eliminar');
    expect(detail!.type).toBe('danger');
  });

  it('devuelve una Promise que resuelve true cuando se llama resolve(true)', async () => {
    window.addEventListener(UI_CONFIRM_EVENT, (e) => {
      const detail = (e as CustomEvent<ConfirmRequest>).detail;
      detail.resolve(true);
    }, { once: true });

    const result = await showConfirm('confirmar');
    expect(result).toBe(true);
  });

  it('devuelve una Promise que resuelve false cuando se llama resolve(false)', async () => {
    window.addEventListener(UI_CONFIRM_EVENT, (e) => {
      const detail = (e as CustomEvent<ConfirmRequest>).detail;
      detail.resolve(false);
    }, { once: true });

    const result = await showConfirm('cancelar');
    expect(result).toBe(false);
  });

  it('ui.confirm es showConfirm', () => {
    expect(ui.confirm).toBe(showConfirm);
  });
});
