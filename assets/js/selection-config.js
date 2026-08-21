/**
 * COMBOGÓ UNICAP - GERENCIADOR DE CONFIGURAÇÃO DE SELEÇÃO
 * Permite ativar/desativar o processo seletivo e renomear edições via Painel ADM.
 */

window.CombogoSelectionConfig = (function () {
    const CONFIG_KEY = "combogo_selection_config";

    const DEFAULT_CONFIG = {
        active: false,
        name: "Seleção 2026.2"
    };

    /**
     * Retorna a configuração atual
     */
    function getConfig() {
        try {
            const saved = localStorage.getItem(CONFIG_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    active: typeof parsed.active === "boolean" ? parsed.active : DEFAULT_CONFIG.active,
                    name: parsed.name && parsed.name.trim() ? parsed.name.trim() : DEFAULT_CONFIG.name
                };
            }
        } catch (e) {
            console.warn("Erro ao ler configuração da seleção:", e);
        }
        return { ...DEFAULT_CONFIG };
    }

    /**
     * Salva a nova configuração
     */
    function saveConfig(active, name) {
        const newConfig = {
            active: !!active,
            name: name && name.trim() ? name.trim() : DEFAULT_CONFIG.name
        };
        try {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
            applyConfigToDOM();
            return true;
        } catch (e) {
            console.error("Erro ao salvar configuração da seleção:", e);
            return false;
        }
    }

    /**
     * Aplica a configuração nos elementos da página atual (index.html ou selecao.html)
     */
    function applyConfigToDOM() {
        const config = getConfig();

        // 1. Atualiza botões no Nav Header e Hero (se existirem na DOM)
        const navBtns = document.querySelectorAll(".nav-selection-highlight, [data-selection-btn]");
        navBtns.forEach(btn => {
            btn.textContent = config.name;
            if (!config.active) {
                btn.style.display = "none";
            } else {
                btn.style.display = "inline-flex";
            }
        });

        const heroSelectionBtns = document.querySelectorAll(".btn-selection");
        heroSelectionBtns.forEach(btn => {
            btn.textContent = config.name;
            if (!config.active) {
                btn.style.display = "none";
            } else {
                btn.style.display = "inline-flex";
            }
        });

        // 2. Se estiver na página selecao.html
        const selectionBadge = document.querySelector(".selection-badge-title");
        if (selectionBadge) {
            selectionBadge.textContent = config.name;
        }

        const formSection = document.getElementById("form-section");
        const closedNotice = document.getElementById("selection-closed-notice");

        if (formSection) {
            if (!config.active) {
                formSection.style.display = "none";
                if (closedNotice) closedNotice.style.display = "block";
            } else {
                formSection.style.display = "block";
                if (closedNotice) closedNotice.style.display = "none";
            }
        }
    }

    // Inicialização automática ao carregar o script
    document.addEventListener("DOMContentLoaded", applyConfigToDOM);

    return {
        getConfig,
        saveConfig,
        applyConfigToDOM
    };
})();
