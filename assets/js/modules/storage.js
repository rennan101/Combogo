/**
 * Safe localStorage wrapper that gracefully handles private browsing mode,
 * iframe restrictions, and JSON parse errors.
 */

export function getSafeStorage(key, fallback) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.warn(`localStorage unavailable for key "${key}":`, e);
        return fallback;
    }
}

export function setSafeStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn(`Failed to save to localStorage for key "${key}":`, e);
    }
}
