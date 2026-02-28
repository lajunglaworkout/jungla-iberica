/**
 * SEC-07: XSS Sanitization Utility
 * All user-generated HTML content must pass through this before rendering.
 */
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML string to prevent XSS attacks.
 * Allows safe HTML tags (bold, italic, lists, links, line breaks).
 * Strips all dangerous tags (script, iframe, form, object, embed).
 */
export const sanitizeHtml = (dirty: string): string => {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'span', 'div', 'table', 'tr', 'td', 'th', 'thead', 'tbody'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
        ALLOW_DATA_ATTR: false,
    });
};

/**
 * Strip ALL HTML tags, returning only plain text.
 * Use this for form inputs and text fields.
 */
export const stripHtml = (dirty: string): string => {
    return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
};

/**
 * Sanitize a plain text string for safe output.
 * Encodes special characters to prevent injection.
 */
export const escapeText = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};
