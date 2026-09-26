/**
 * Capabilities / Quotes Rotator Module
 * Cleanly rotates service statements with smooth fade transitions.
 */
import { getLanguage } from './i18n.js';

let currentIndex = 0;
let rotatorInterval = null;

export function renderHeroQuote() {
    const quoteEl = document.getElementById('single-quote-text');
    if (!quoteEl) return;

    const lang = getLanguage();
    const quotes = (window.i18n && window.i18n[lang] && window.i18n[lang].hero_quotes) 
        ? window.i18n[lang].hero_quotes 
        : ["Desenvolvemos seu jogo do zero!"];

    if (quotes.length === 0) return;

    if (currentIndex >= quotes.length) {
        currentIndex = 0;
    }

    quoteEl.style.opacity = "0";
    quoteEl.style.transform = "translateY(-6px)";

    setTimeout(() => {
        quoteEl.textContent = quotes[currentIndex];
        quoteEl.style.opacity = "1";
        quoteEl.style.transform = "translateY(0)";
    }, 300);
}

export function initQuotesRotator() {
    renderHeroQuote();

    if (rotatorInterval) {
        clearInterval(rotatorInterval);
    }

    rotatorInterval = setInterval(() => {
        const lang = getLanguage();
        const quotes = (window.i18n && window.i18n[lang] && window.i18n[lang].hero_quotes) 
            ? window.i18n[lang].hero_quotes 
            : [];
        if (quotes.length > 0) {
            currentIndex = (currentIndex + 1) % quotes.length;
            renderHeroQuote();
        }
    }, 3600);
}
