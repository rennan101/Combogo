/**
 * COMBOGÓ UNICAP - SELEÇÃO DE ALUNOS 2026.2
 * Gerenciador de Estado do Formulário (Form State Engine)
 */

window.CombogoFormState = (function () {
    const STORAGE_KEY = "combogo_selecao_2026_draft";
    const STEPS = window.CombogoFormSteps || [];

    let currentStepIndex = 0;
    let formData = {};
    let isDirty = false;

    // Inicialização do estado
    function init() {
        loadDraft();
    }

    // Carrega rascunho salvo do localStorage
    function loadDraft() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                formData = parsed.formData || {};
                currentStepIndex = typeof parsed.currentStepIndex === 'number' ? parsed.currentStepIndex : 0;
                // Limita entre 0 e número de passos - 1
                if (currentStepIndex < 0 || currentStepIndex >= STEPS.length) {
                    currentStepIndex = 0;
                }
            }
        } catch (e) {
            console.warn("Não foi possível carregar o rascunho salvo:", e);
            formData = {};
        }
    }

    // Salva rascunho no localStorage
    function saveDraft() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                formData,
                currentStepIndex,
                updatedAt: new Date().toISOString()
            }));
            isDirty = true;
        } catch (e) {
            console.warn("Erro ao salvar rascunho no localStorage:", e);
        }
    }

    // Limpa o rascunho (após envio com sucesso)
    function clearDraft() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            formData = {};
            currentStepIndex = 0;
            isDirty = false;
        } catch (e) {
            console.warn("Erro ao limpar rascunho:", e);
        }
    }

    function getCurrentStepIndex() {
        return currentStepIndex;
    }

    function setCurrentStepIndex(index) {
        if (index >= 0 && index < STEPS.length) {
            currentStepIndex = index;
            saveDraft();
        }
    }

    function getFormData() {
        return { ...formData };
    }

    function getFieldValue(fieldId) {
        return formData[fieldId];
    }

    function setFieldValue(fieldId, value) {
        formData[fieldId] = value;

        // Se alterou a lista de áreas de atuação (Etapa 02), limpa area_principal se a antiga não estiver mais selecionada
        if (fieldId === "areas_atuacao") {
            const selectedAreas = Array.isArray(value) ? value : [];
            if (formData.area_principal && !selectedAreas.includes(formData.area_principal)) {
                formData.area_principal = "";
            }
        }

        saveDraft();
    }

    function isFieldVisible(field) {
        if (!field.condition) return true;

        if (field.condition.notIncludes) {
            const val = formData[field.condition.field];
            const arr = Array.isArray(val) ? val : (val ? [val] : []);
            return arr.length > 0 && !arr.includes(field.condition.notIncludes);
        }

        const { field: depField, value: expectedVal } = field.condition;
        return formData[depField] === expectedVal;
    }

    // Valida uma etapa específica
    function validateStep(stepIndex) {
        const step = STEPS[stepIndex];
        if (!step) return { valid: true, errors: {} };

        const errors = {};
        let valid = true;

        step.fields.forEach(field => {
            if (!isFieldVisible(field)) return;

            const value = formData[field.id];

            if (field.required) {
                if (field.type === "checkbox-group") {
                    const selected = Array.isArray(value) ? value : [];
                    if (selected.length === 0) {
                        valid = false;
                        errors[field.id] = "Selecione pelo menos uma opção.";
                    }
                } else if (field.type === "checkbox-single") {
                    if (!value) {
                        valid = false;
                        errors[field.id] = "Você precisa aceitar a autorização para enviar.";
                    }
                } else if (field.type === "dynamic-radio") {
                    const depValue = formData[field.dependsOn];
                    const selectedAreas = Array.isArray(depValue) ? depValue : [];
                    if (selectedAreas.length > 0 && (!value || !selectedAreas.includes(value))) {
                        valid = false;
                        errors[field.id] = "Selecione qual dessas é sua área de principal interesse.";
                    }
                } else {
                    if (value === undefined || value === null || String(value).trim() === "") {
                        valid = false;
                        errors[field.id] = "Este campo é obrigatório.";
                    }
                }
            }

            // Validações específicas de formato (se houver valor)
            if (value && String(value).trim() !== "") {
                if (field.type === "email") {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(String(value).trim())) {
                        valid = false;
                        errors[field.id] = "Informe um e-mail válido.";
                    }
                } else if (field.type === "url") {
                    try {
                        const urlStr = String(value).trim();
                        // Aceita URLs sem protocolo adicionando https:// se necessário para teste
                        const formattedUrl = urlStr.startsWith("http://") || urlStr.startsWith("https://") ? urlStr : `https://${urlStr}`;
                        new URL(formattedUrl);
                    } catch (_) {
                        valid = false;
                        errors[field.id] = "Informe uma URL válida (ex: https://github.com/usuario).";
                    }
                }
            }
        });

        return { valid, errors };
    }

    function isFormDirty() {
        return isDirty || Object.keys(formData).length > 0;
    }

    return {
        init,
        getCurrentStepIndex,
        setCurrentStepIndex,
        getFormData,
        getFieldValue,
        setFieldValue,
        isFieldVisible,
        validateStep,
        saveDraft,
        clearDraft,
        isFormDirty
    };
})();
