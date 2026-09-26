/**
 * Combogó UNICAP - Main Application Entry Point
 * Modular, zero-build vanilla ES modules architecture.
 */

import { initI18n, onLanguageChange, translatePage } from './modules/i18n.js';
import { loadProjects, updateDynamicCategories, renderProjects } from './modules/portfolio.js';
import { loadTeam, renderTeam } from './modules/team.js';
import { initQuotesRotator, renderHeroQuote } from './modules/quotes.js';
import { initAdmin } from './modules/admin.js';
import { initUI } from './modules/ui.js';
import { initParticleCanvas } from './modules/canvas.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize UI & Canvas listeners
    initUI();
    initParticleCanvas();
    initI18n();
    initAdmin();

    // 2. Load Portfolio & Team data
    await Promise.all([
        loadProjects(),
        loadTeam()
    ]);

    // 3. Render dynamic views
    updateDynamicCategories();
    renderProjects('Todos');
    renderTeam();
    initQuotesRotator();

    // 4. Register i18n update reactions
    onLanguageChange((lang) => {
        updateDynamicCategories();
        renderProjects();
        renderTeam();
        renderHeroQuote();
        if (window.CombogoSelectionConfig) {
            window.CombogoSelectionConfig.applyConfigToDOM();
        }
    });

    // 5. Apply selection config to DOM
    if (window.CombogoSelectionConfig) {
        window.CombogoSelectionConfig.applyConfigToDOM();
    }
});
