/**
 * COMBOGÓ UNICAP - SELEÇÃO DE ALUNOS 2026.2
 * Controlador de Interface da Página de Seleção (UI Controller)
 */

document.addEventListener("DOMContentLoaded", () => {
    const STEPS = window.CombogoFormSteps || [];
    const state = window.CombogoFormState;
    const service = window.CombogoFormService;

    if (!STEPS.length || !state || !service) {
        console.error("Módulos necessários não foram carregados corretamente.");
        return;
    }

    // Elementos da DOM
    const formCard = document.getElementById("form-card");
    const stepsListContainer = document.getElementById("stepper-steps-list");
    const progressFill = document.getElementById("stepper-progress-fill");
    const formFieldsContainer = document.getElementById("form-fields-container");
    const btnBack = document.getElementById("btn-form-back");
    const btnNext = document.getElementById("btn-form-next");
    const successCard = document.getElementById("success-card");
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const navMenu = document.getElementById("nav-menu");

    // Inicializa o estado
    state.init();

    // Configuração do Menu Mobile
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            mobileMenuBtn.textContent = navMenu.classList.contains("active") ? "✕" : "☰";
        });
    }

    // Renderiza a estrutura inicial
    renderStepperHeader();
    renderFormSteps();
    updateUI();

    // Eventos dos botões de navegação
    btnBack.addEventListener("click", handleBack);
    btnNext.addEventListener("click", handleNext);

    // Aviso ao tentar sair da página com formulário preenchido
    window.addEventListener("beforeunload", (e) => {
        if (state.isFormDirty() && !formSubmitted) {
            e.preventDefault();
            e.returnValue = "";
        }
    });

    let formSubmitted = false;

    /**
     * Renderiza o cabeçalho do Stepper (Etapas no topo)
     */
    function renderStepperHeader() {
        stepsListContainer.innerHTML = "";

        STEPS.forEach((step, idx) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "step-node";
            btn.dataset.stepIndex = idx;
            btn.innerHTML = `
                <span class="step-num">${step.stepNumber}</span>
                <span class="step-label">${step.shortTitle}</span>
            `;

            btn.addEventListener("click", () => {
                const currentIndex = state.getCurrentStepIndex();
                // Permite clicar apenas em etapas já concluídas ou anteriores
                if (idx < currentIndex) {
                    state.setCurrentStepIndex(idx);
                    updateUI();
                    scrollToFormTop();
                }
            });

            stepsListContainer.appendChild(btn);
        });
    }

    /**
     * Renderiza o formulário completo com base nas etapas do form-data.js
     */
    function renderFormSteps() {
        formFieldsContainer.innerHTML = "";

        STEPS.forEach((step, stepIndex) => {
            const stepEl = document.createElement("div");
            stepEl.className = "step-container";
            stepEl.id = `step-container-${stepIndex}`;

            let html = `
                <div class="step-header">
                    <h2>${step.subtitle}</h2>
                    <p>${step.title}</p>
                </div>
            `;

            if (step.infoBox) {
                html += `
                    <div class="info-notice-box">
                        <span class="info-notice-icon">💡</span>
                        <span>${step.infoBox}</span>
                    </div>
                `;
            }

            step.fields.forEach(field => {
                html += renderFieldHTML(field);
            });

            stepEl.innerHTML = html;
            formFieldsContainer.appendChild(stepEl);
        });

        // Vincula event listeners nos inputs criados
        bindInputEvents();
    }

    /**
     * Gera o HTML de cada campo de acordo com seu tipo
     */
    function renderFieldHTML(field) {
        const reqStar = field.required ? `<span class="required-star">*</span>` : "";
        const hintText = field.hint ? `<div class="field-hint">${field.hint}</div>` : "";
        const isConditional = !!field.condition;
        const conditionalClass = isConditional ? 'conditional-field' : '';
        const conditionalStyle = isConditional ? 'style="display:none;"' : '';

        let inputHTML = "";

        switch (field.type) {
            case "text":
            case "email":
            case "tel":
            case "url":
                inputHTML = `
                    <input 
                        type="${field.type}" 
                        id="${field.id}" 
                        name="${field.id}" 
                        class="form-input" 
                        placeholder="${field.placeholder || ''}" 
                        ${field.autocomplete ? `autocomplete="${field.autocomplete}"` : ''} 
                        ${field.inputmode ? `inputmode="${field.inputmode}"` : ''}
                    />
                `;
                break;

            case "textarea":
                inputHTML = `
                    <textarea 
                        id="${field.id}" 
                        name="${field.id}" 
                        class="form-textarea ${field.highlight ? 'highlight-field' : ''}" 
                        placeholder="${field.placeholder || ''}" 
                        rows="${field.rows || 4}"
                    ></textarea>
                `;
                break;

            case "select":
                inputHTML = `
                    <select id="${field.id}" name="${field.id}" class="form-select">
                        <option value="">Selecione uma opção...</option>
                        ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join("")}
                    </select>
                `;
                break;

            case "radio":
                inputHTML = `
                    <div class="options-grid">
                        ${field.options.map((opt, i) => `
                            <label class="custom-option-card" for="${field.id}_${i}">
                                <input type="radio" id="${field.id}_${i}" name="${field.id}" value="${opt}">
                                <span class="option-indicator"></span>
                                <span class="option-text">${opt}</span>
                            </label>
                        `).join("")}
                    </div>
                `;
                break;

            case "checkbox-group":
                inputHTML = `
                    <div class="options-grid">
                        ${field.options.map((opt, i) => `
                            <label class="custom-option-card" for="${field.id}_${i}">
                                <input type="checkbox" id="${field.id}_${i}" name="${field.id}" value="${opt}">
                                <span class="option-indicator"></span>
                                <span class="option-text">${opt}</span>
                            </label>
                        `).join("")}
                    </div>
                `;

                if (field.hasOtherInput) {
                    inputHTML += `
                        <div id="container-${field.otherInputId}" class="conditional-field" style="display:none; margin-top: 12px;">
                            <input type="text" id="${field.otherInputId}" name="${field.otherInputId}" class="form-input" placeholder="${field.otherPlaceholder}">
                        </div>
                    `;
                }
                break;

            case "dynamic-radio":
                inputHTML = `
                    <div id="dynamic-container-${field.id}">
                        <p class="field-hint" style="color: var(--secondary);">${field.emptyHint}</p>
                    </div>
                `;
                break;

            case "checkbox-single":
                inputHTML = `
                    <label class="auth-checkbox-card" for="${field.id}">
                        <input type="checkbox" id="${field.id}" name="${field.id}" value="true">
                        <span class="option-indicator" style="margin-top: 2px;"></span>
                        <span class="option-text" style="font-size: 0.95rem; font-weight: 500; color: #FFFFFF;">${field.checkboxLabel}</span>
                    </label>
                `;
                break;
        }

        return `
            <div class="field-group ${conditionalClass}" id="field-group-${field.id}" ${conditionalStyle}>
                <label class="field-label" for="${field.id}">${field.label}${reqStar}</label>
                ${hintText}
                ${inputHTML}
                <div class="field-error-msg" id="error-${field.id}"></div>
            </div>
        `;
    }

    /**
     * Binda os manipuladores de eventos em todos os controles do formulário
     */
    function bindInputEvents() {
        STEPS.forEach(step => {
            step.fields.forEach(field => {
                if (field.type === "radio") {
                    const radios = document.querySelectorAll(`input[name="${field.id}"]`);
                    radios.forEach(r => {
                        r.addEventListener("change", (e) => {
                            state.setFieldValue(field.id, e.target.value);
                            updateUI();
                        });
                    });
                } else if (field.type === "checkbox-group") {
                    const checkboxes = document.querySelectorAll(`input[name="${field.id}"]`);
                    checkboxes.forEach(c => {
                        c.addEventListener("change", () => {
                            let selected = [];
                            if (field.exclusiveOption && c.value === field.exclusiveOption && c.checked) {
                                // Se marcou opção exclusiva, desmarca todas as outras
                                checkboxes.forEach(other => {
                                    if (other !== c) other.checked = false;
                                });
                                selected = [field.exclusiveOption];
                            } else {
                                if (field.exclusiveOption) {
                                    // Desmarca a exclusiva se marcou outra
                                    const excl = Array.from(checkboxes).find(cb => cb.value === field.exclusiveOption);
                                    if (excl) excl.checked = false;
                                }
                                selected = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
                            }
                            state.setFieldValue(field.id, selected);
                            updateUI();
                        });
                    });

                    if (field.hasOtherInput) {
                        const otherInput = document.getElementById(field.otherInputId);
                        if (otherInput) {
                            otherInput.addEventListener("input", (e) => {
                                state.setFieldValue(field.otherInputId, e.target.value);
                            });
                        }
                    }
                } else if (field.type === "checkbox-single") {
                    const cb = document.getElementById(field.id);
                    if (cb) {
                        cb.addEventListener("change", (e) => {
                            state.setFieldValue(field.id, e.target.checked);
                            updateUI();
                        });
                    }
                } else {
                    const el = document.getElementById(field.id);
                    if (el) {
                        el.addEventListener("input", (e) => {
                            state.setFieldValue(field.id, e.target.value);
                            clearFieldError(field.id);
                        });
                        el.addEventListener("change", (e) => {
                            state.setFieldValue(field.id, e.target.value);
                            updateUI();
                        });
                    }
                }
            });
        });
    }

    /**
     * Atualiza a Interface completa (Passos, Progresso, Valores e Visibilidade)
     */
    function updateUI() {
        const currentIndex = state.getCurrentStepIndex();
        const currentStep = STEPS[currentIndex];

        // 1. Atualiza Stepper de Progresso
        const progressPct = ((currentIndex + 1) / STEPS.length) * 100;
        progressFill.style.width = `${progressPct}%`;

        const stepNodes = stepsListContainer.querySelectorAll(".step-node");
        stepNodes.forEach((node, idx) => {
            node.classList.remove("active", "completed");
            if (idx === currentIndex) {
                node.classList.add("active");
            } else if (idx < currentIndex) {
                node.classList.add("completed");
            }
        });

        // 2. Alterna os containers de etapa visíveis
        STEPS.forEach((_, idx) => {
            const container = document.getElementById(`step-container-${idx}`);
            if (container) {
                container.classList.toggle("active", idx === currentIndex);
            }
        });

        // 3. Atualiza valores e visibilidade dos campos na etapa atual
        populateStepValues(currentIndex);
        updateConditionalVisibility(currentIndex);
        updateDynamicRadios(currentIndex);

        // 4. Configura Botões de Navegação
        btnBack.style.visibility = currentIndex === 0 ? "hidden" : "visible";

        if (currentStep.isFinalStep) {
            btnNext.innerHTML = `Enviar candidatura`;
            const authValue = state.getFieldValue("autorizacao_dados");
            btnNext.disabled = !authValue;
        } else {
            btnNext.innerHTML = `Continuar →`;
            btnNext.disabled = false;
        }
    }

    /**
     * Preenche os campos com os dados salvos no estado (Rascunho)
     */
    function populateStepValues(stepIndex) {
        const step = STEPS[stepIndex];
        if (!step) return;

        step.fields.forEach(field => {
            const val = state.getFieldValue(field.id);

            if (field.type === "radio") {
                const radios = document.querySelectorAll(`input[name="${field.id}"]`);
                radios.forEach(r => {
                    r.checked = r.value === val;
                    const card = r.closest(".custom-option-card");
                    if (card) card.classList.toggle("selected", r.checked);
                });
            } else if (field.type === "checkbox-group") {
                const selectedArr = Array.isArray(val) ? val : [];
                const checkboxes = document.querySelectorAll(`input[name="${field.id}"]`);
                checkboxes.forEach(c => {
                    c.checked = selectedArr.includes(c.value);
                    const card = c.closest(".custom-option-card");
                    if (card) card.classList.toggle("selected", c.checked);
                });

                if (field.hasOtherInput) {
                    const otherInput = document.getElementById(field.otherInputId);
                    if (otherInput) {
                        otherInput.value = state.getFieldValue(field.otherInputId) || "";
                    }
                }
            } else if (field.type === "checkbox-single") {
                const cb = document.getElementById(field.id);
                if (cb) {
                    cb.checked = !!val;
                    const card = cb.closest(".auth-checkbox-card");
                    if (card) card.classList.toggle("selected", cb.checked);
                }
            } else {
                const el = document.getElementById(field.id);
                if (el && val !== undefined) {
                    el.value = val;
                }
            }
        });
    }

    /**
     * Atualiza visibilidade de campos condicionais
     */
    function updateConditionalVisibility(stepIndex) {
        const step = STEPS[stepIndex];
        if (!step) return;

        step.fields.forEach(field => {
            const group = document.getElementById(`field-group-${field.id}`);
            if (group && field.condition) {
                const visible = state.isFieldVisible(field);
                group.style.display = visible ? "block" : "none";
            }

            // Tratamento especial para campo "Outra" em checkboxes
            if (field.type === "checkbox-group" && field.hasOtherInput) {
                const selectedArr = state.getFieldValue(field.id) || [];
                const otherContainer = document.getElementById(`container-${field.otherInputId}`);
                if (otherContainer) {
                    otherContainer.style.display = selectedArr.includes("Outra") ? "block" : "none";
                }
            }
        });
    }

    /**
     * Atualiza as opções dinâmicas para a escolha da "Área Principal" (Etapa 02)
     */
    function updateDynamicRadios(stepIndex) {
        const step = STEPS[stepIndex];
        if (!step) return;

        step.fields.forEach(field => {
            if (field.type === "dynamic-radio") {
                const container = document.getElementById(`dynamic-container-${field.id}`);
                if (!container) return;

                const selectedAreas = state.getFieldValue(field.dependsOn) || [];
                const selectedAreasFiltered = Array.isArray(selectedAreas) ? selectedAreas : [];

                if (selectedAreasFiltered.length === 0) {
                    container.innerHTML = `<p class="field-hint" style="color: var(--secondary);">${field.emptyHint}</p>`;
                } else {
                    const currentPrimary = state.getFieldValue(field.id);
                    container.innerHTML = `
                        <div class="options-grid">
                            ${selectedAreasFiltered.map((opt, i) => `
                                <label class="custom-option-card ${currentPrimary === opt ? 'selected' : ''}" for="${field.id}_dyn_${i}">
                                    <input type="radio" id="${field.id}_dyn_${i}" name="${field.id}" value="${opt}" ${currentPrimary === opt ? 'checked' : ''}>
                                    <span class="option-indicator"></span>
                                    <span class="option-text">${opt}</span>
                                </label>
                            `).join("")}
                        </div>
                    `;

                    // Binda novos radios dinâmicos
                    const dynRadios = container.querySelectorAll(`input[name="${field.id}"]`);
                    dynRadios.forEach(r => {
                        r.addEventListener("change", (e) => {
                            state.setFieldValue(field.id, e.target.value);
                            updateUI();
                        });
                    });
                }
            }
        });
    }

    /**
     * Avança para a próxima etapa ou envia o formulário
     */
    async function handleNext() {
        const currentIndex = state.getCurrentStepIndex();
        const currentStep = STEPS[currentIndex];

        // Limpa erros anteriores
        clearStepErrors(currentIndex);

        // Valida etapa atual
        const { valid, errors } = state.validateStep(currentIndex);

        if (!valid) {
            showStepErrors(errors);
            return;
        }

        // Se for a última etapa, envia a candidatura
        if (currentStep.isFinalStep) {
            await submitForm();
        } else {
            state.setCurrentStepIndex(currentIndex + 1);
            updateUI();
            scrollToFormTop();
        }
    }

    /**
     * Retorna para a etapa anterior
     */
    function handleBack() {
        const currentIndex = state.getCurrentStepIndex();
        if (currentIndex > 0) {
            state.setCurrentStepIndex(currentIndex - 1);
            updateUI();
            scrollToFormTop();
        }
    }

    /**
     * Submete a candidatura completa
     */
    async function submitForm() {
        btnNext.disabled = true;
        btnNext.innerHTML = `Enviando... ⏳`;

        const fullData = state.getFormData();

        try {
            const res = await service.submitApplication(fullData);

            if (res.success) {
                formSubmitted = true;
                state.clearDraft();

                // Oculta o formulário e exibe a tela de sucesso
                formCard.style.display = "none";
                stepsListContainer.parentElement.style.display = "none";
                successCard.classList.add("active");

                window.scrollTo({ top: successCard.offsetTop - 80, behavior: "smooth" });
            } else {
                alert("Ocorreu um erro ao enviar sua candidatura. Por favor, tente novamente.");
                btnNext.disabled = false;
                btnNext.innerHTML = `Enviar candidatura`;
            }
        } catch (err) {
            console.error("Erro ao enviar:", err);
            alert("Falha de conexão ao enviar formulário. Tente novamente.");
            btnNext.disabled = false;
            btnNext.innerHTML = `Enviar candidatura`;
        }
    }

    function showStepErrors(errors) {
        let firstErrorGroup = null;

        Object.keys(errors).forEach(fieldId => {
            const group = document.getElementById(`field-group-${fieldId}`);
            const errEl = document.getElementById(`error-${fieldId}`);
            if (group && errEl) {
                group.classList.add("has-error");
                errEl.textContent = errors[fieldId];
                errEl.style.display = "block";
                if (!firstErrorGroup) firstErrorGroup = group;
            }
        });

        if (firstErrorGroup) {
            firstErrorGroup.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }

    function clearFieldError(fieldId) {
        const group = document.getElementById(`field-group-${fieldId}`);
        const errEl = document.getElementById(`error-${fieldId}`);
        if (group && errEl) {
            group.classList.remove("has-error");
            errEl.textContent = "";
            errEl.style.display = "none";
        }
    }

    function clearStepErrors(stepIndex) {
        const step = STEPS[stepIndex];
        if (!step) return;
        step.fields.forEach(f => clearFieldError(f.id));
    }

    function scrollToFormTop() {
        const header = document.querySelector(".selection-hero");
        if (header) {
            window.scrollTo({ top: formCard.offsetTop - 120, behavior: "smooth" });
        }
    }
});
