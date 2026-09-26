/**
 * Internationalization (i18n) Module
 * Handles dynamic language switching across Portuguese, English, and Spanish.
 */

let currentLang = 'pt';
const listeners = [];

export function getLanguage() {
    return currentLang;
}

export function onLanguageChange(callback) {
    if (typeof callback === 'function') {
        listeners.push(callback);
    }
}

export function translatePage(lang) {
    if (!window.i18n || !window.i18n[lang]) {
        console.warn(`Translation dictionary for "${lang}" not found.`);
        return;
    }

    currentLang = lang;
    const t = window.i18n[lang];

    // Update active state in UI
    const labelEl = document.getElementById('current-lang-label');
    if (labelEl) {
        labelEl.textContent = lang.toUpperCase();
    }

    document.querySelectorAll('.lang-menu a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('data-lang') === lang);
    });

    // Translate all tagged text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t && t[key] !== undefined) {
            el.innerHTML = t[key];
        }
    });

    // Translate placeholder attributes
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (t && t[key] !== undefined) {
            el.setAttribute('placeholder', t[key]);
        }
    });

    // Notify listeners
    listeners.forEach(cb => {
        try {
            cb(lang, t);
        } catch (err) {
            console.error('Error in i18n listener callback:', err);
        }
    });
}

export function initI18n() {
    const langToggleBtn = document.getElementById('lang-toggle-btn');
    const langMenu = document.getElementById('lang-menu');
    const langWrapper = document.getElementById('lang-dropdown-wrapper');

    if (langToggleBtn && langMenu) {
        langToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langMenu.classList.toggle('active');
        });

        document.querySelectorAll('.lang-menu a').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = item.getAttribute('data-lang');
                translatePage(lang);
                langMenu.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (langWrapper && !langWrapper.contains(e.target)) {
                langMenu.classList.remove('active');
            }
        });
    }
}
