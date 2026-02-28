/**
 * Tests para src/utils/sanitize.ts
 * Funciones puras de sanitización XSS — sin dependencias externas salvo DOMPurify
 */
import { describe, it, expect } from 'vitest';
import { sanitizeHtml, stripHtml, escapeText } from '../utils/sanitize';

describe('sanitizeHtml', () => {
  it('permite tags seguros: bold, strong, em', () => {
    expect(sanitizeHtml('<b>negrita</b>')).toBe('<b>negrita</b>');
    expect(sanitizeHtml('<strong>fuerte</strong>')).toBe('<strong>fuerte</strong>');
    expect(sanitizeHtml('<em>énfasis</em>')).toBe('<em>énfasis</em>');
  });

  it('permite listas ul/ol/li', () => {
    const input = '<ul><li>uno</li><li>dos</li></ul>';
    const result = sanitizeHtml(input);
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>uno</li>');
  });

  it('permite headers h1-h4', () => {
    expect(sanitizeHtml('<h1>Título</h1>')).toBe('<h1>Título</h1>');
    expect(sanitizeHtml('<h3>Sub</h3>')).toBe('<h3>Sub</h3>');
  });

  it('permite links con href y target', () => {
    const result = sanitizeHtml('<a href="https://example.com" target="_blank">link</a>');
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('target="_blank"');
  });

  it('elimina tags script — previene XSS básico', () => {
    expect(sanitizeHtml('<script>alert("xss")</script>')).toBe('');
    expect(sanitizeHtml('<script src="evil.js"></script>')).toBe('');
  });

  it('elimina tags iframe', () => {
    expect(sanitizeHtml('<iframe src="evil.com"></iframe>')).toBe('');
  });

  it('elimina atributos de evento onXXX', () => {
    const result = sanitizeHtml('<div onclick="alert(1)">texto</div>');
    expect(result).not.toContain('onclick');
    expect(result).toContain('texto');
  });

  it('elimina atributos data-* (ALLOW_DATA_ATTR: false)', () => {
    const result = sanitizeHtml('<div data-secret="123">contenido</div>');
    expect(result).not.toContain('data-secret');
  });

  it('mantiene texto plano sin modificarlo', () => {
    expect(sanitizeHtml('texto simple sin html')).toBe('texto simple sin html');
  });

  it('devuelve string vacío para input vacío', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('permite párrafos y saltos de línea', () => {
    expect(sanitizeHtml('<p>párrafo</p>')).toBe('<p>párrafo</p>');
    expect(sanitizeHtml('línea1<br>línea2')).toContain('<br>');
  });
});

describe('stripHtml', () => {
  it('elimina tags bold y devuelve solo texto', () => {
    expect(stripHtml('<b>negrita</b>')).toBe('negrita');
  });

  it('elimina tags anidados y devuelve texto plano', () => {
    expect(stripHtml('<div><p>párrafo</p></div>')).toBe('párrafo');
  });

  it('elimina links manteniendo el texto del enlace', () => {
    expect(stripHtml('<a href="https://example.com">visita</a>')).toBe('visita');
  });

  it('devuelve string vacío para input vacío', () => {
    expect(stripHtml('')).toBe('');
  });

  it('mantiene texto sin HTML intacto', () => {
    expect(stripHtml('texto sin etiquetas')).toBe('texto sin etiquetas');
  });
});

describe('escapeText', () => {
  it('escapa el carácter <', () => {
    expect(escapeText('<')).toBe('&lt;');
  });

  it('escapa el carácter >', () => {
    expect(escapeText('>')).toBe('&gt;');
  });

  it('escapa el carácter &', () => {
    expect(escapeText('&')).toBe('&amp;');
  });

  it('escapa una cadena con múltiples caracteres especiales', () => {
    const result = escapeText('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('mantiene texto normal sin modificarlo', () => {
    expect(escapeText('texto normal 123')).toBe('texto normal 123');
  });

  it('devuelve string vacío para input vacío', () => {
    expect(escapeText('')).toBe('');
  });
});
