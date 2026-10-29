/**
 * Крок 9: Захист від Stored/DOM-based XSS (Варіант 16).
 * Екранує небезпечні символи HTML (&, <, >, ", ') у введених користувачем
 * полях конспектів (title, text) перед їхньою вставкою через innerHTML.
 */
export function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}