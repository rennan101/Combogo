/**
 * Admin Module
 * Handles the administrative modal, project CRUD, category management, team CRUD, and JSON downloads.
 */
import { getSafeStorage, setSafeStorage } from './storage.js';
import { getProjects, setProjects, getAllCategories, getProjectCats, fetchLiveTranslation } from './portfolio.js';
import { getTeamMembers, setTeamMembers, renderTeam } from './team.js';
import { getLanguage } from './i18n.js';

export function initAdmin() {
    const admModal = document.getElementById('adm-modal');
    const footerAdmBtn = document.getElementById('footer-adm-btn');
    const closeAdmBtn = document.getElementById('close-adm-btn');
    const admForm = document.getElementById('adm-form');
    const downloadJsonBtn = document.getElementById('download-json-btn');
    const downloadTeamBtn = document.getElementById('download-team-json-btn');
    const admFolderSelect = document.getElementById('adm-folder');
    const admFolderNewInput = document.getElementById('adm-folder-new');
    const admRenameCatForm = document.getElementById('adm-rename-cat-form');
    const admCreateCatForm = document.getElementById('adm-create-cat-form');
    const admTeamForm = document.getElementById('adm-team-form');
    const admSelectionForm = document.getElementById('adm-selection-config-form');

    // Open ADM modal with password prompt
    if (footerAdmBtn && admModal) {
        footerAdmBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = getLanguage();
            const t = (window.i18n && window.i18n[lang]) ? window.i18n[lang] : {};
            const passPrompt = t.prompt_pass || '🔒 Digite a senha de acesso ao Painel de Administração:';
            const pass = prompt(passPrompt);

            // Password check (combogo2026 or dev environment)
            if (pass === 'combogo2026' || pass === 'admin') {
                admModal.classList.add('active');
                updateAdmFolders();
                updateAdmCategories();
            } else if (pass !== null) {
                alert(t.alert_pass_wrong || '❌ Senha incorreta! Acesso negado.');
            }
        });
    }

    if (closeAdmBtn && admModal) {
        closeAdmBtn.addEventListener('click', () => {
            admModal.classList.remove('active');
        });

        admModal.addEventListener('click', (e) => {
            if (e.target === admModal) {
                admModal.classList.remove('active');
            }
        });
    }

    // Tab switching
    document.querySelectorAll('.adm-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            document.querySelectorAll('.adm-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.adm-tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            
            const contentEl = document.getElementById(targetTab);
            if (contentEl) contentEl.classList.add('active');

            if (targetTab === 'tab-list') updateAdmProjectList();
            if (targetTab === 'tab-team') updateAdmTeamList();
            if (targetTab === 'tab-cat') updateAdmCategories();
            if (targetTab === 'tab-selection') loadAdmSelectionConfig();
        });
    });

    // Handle new folder toggle
    if (admFolderSelect && admFolderNewInput) {
        admFolderSelect.addEventListener('change', (e) => {
            if (e.target.value === 'NEW_FOLDER') {
                admFolderNewInput.style.display = 'block';
                admFolderNewInput.required = true;
                admFolderNewInput.focus();
            } else {
                admFolderNewInput.style.display = 'none';
                admFolderNewInput.required = false;
                admFolderNewInput.value = '';
            }
        });
    }

    // Project Form Submit (Create / Edit)
    if (admForm) {
        admForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const editId = document.getElementById('adm-edit-id').value;
            const projects = [...getProjects()];

            const checkedCats = Array.from(document.querySelectorAll('input[name="proj_cats"]:checked')).map(cb => cb.value);
            const extraCatsInput = document.getElementById('adm-cat-new');
            if (extraCatsInput && extraCatsInput.value.trim() !== '') {
                const extras = extraCatsInput.value.split(',').map(s => s.trim()).filter(Boolean);
                checkedCats.push(...extras);
            }

            if (checkedCats.length === 0) {
                alert('⚠️ Selecione pelo menos uma categoria.');
                return;
            }

            let folderVal = admFolderSelect.value;
            if (folderVal === 'NEW_FOLDER') {
                folderVal = admFolderNewInput.value.trim() || 'HCP';
            }

            const descPT = document.getElementById('adm-desc').value.trim();
            let descEN = document.getElementById('adm-desc-en') ? document.getElementById('adm-desc-en').value.trim() : '';
            let descES = document.getElementById('adm-desc-es') ? document.getElementById('adm-desc-es').value.trim() : '';

            const projectData = {
                title: document.getElementById('adm-title').value.trim(),
                client: document.getElementById('adm-client').value.trim(),
                categories: checkedCats,
                year: parseInt(document.getElementById('adm-year').value, 10) || new Date().getFullYear(),
                folder: folderVal,
                link: document.getElementById('adm-link').value.trim(),
                desc: descPT,
                desc_en: descEN,
                desc_es: descES
            };

            if (editId !== '') {
                projects[parseInt(editId, 10)] = projectData;
            } else {
                projects.unshift(projectData);
            }

            setProjects(projects);

            // Asynchronously populate EN and ES if left blank
            if ((!descEN || !descES) && descPT) {
                const targetIdx = editId !== '' ? parseInt(editId, 10) : 0;
                Promise.all([
                    !descEN ? fetchLiveTranslation(descPT, 'en') : Promise.resolve(descEN),
                    !descES ? fetchLiveTranslation(descPT, 'es') : Promise.resolve(descES)
                ]).then(([autoEn, autoEs]) => {
                    const currentProjects = getProjects();
                    if (currentProjects[targetIdx]) {
                        currentProjects[targetIdx].desc_en = autoEn;
                        currentProjects[targetIdx].desc_es = autoEs;
                        setProjects(currentProjects);
                    }
                }).catch(() => {});
            }

            admForm.reset();
            document.getElementById('adm-edit-id').value = '';
            alert('✅ Projeto salvo com sucesso no portfólio!');
            
            // Switch to list tab
            const listTabBtn = document.querySelector('.adm-tab-btn[data-tab="tab-list"]');
            if (listTabBtn) listTabBtn.click();
        });
    }

    // Create Category Form
    if (admCreateCatForm) {
        admCreateCatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('adm-cat-create-input');
            const newCat = input.value.trim();
            if (!newCat) return;

            const customCats = getSafeStorage('combogo_custom_categories', []);
            if (!customCats.includes(newCat)) {
                customCats.push(newCat);
                setSafeStorage('combogo_custom_categories', customCats);
                updateAdmCategories();
                alert(`✅ Categoria "${newCat}" criada!`);
                input.value = '';
            }
        });
    }

    // Rename Category Form
    if (admRenameCatForm) {
        admRenameCatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const oldCat = document.getElementById('adm-cat-old').value;
            const newCat = document.getElementById('adm-cat-rename').value.trim();
            if (!oldCat || !newCat) return;

            const projects = getProjects().map(p => {
                const cats = getProjectCats(p).map(c => c === oldCat ? newCat : c);
                return { ...p, categories: cats };
            });

            setProjects(projects);

            const customCats = getSafeStorage('combogo_custom_categories', []).map(c => c === oldCat ? newCat : c);
            setSafeStorage('combogo_custom_categories', customCats);

            updateAdmCategories();
            alert(`✅ Categoria "${oldCat}" renomeada para "${newCat}"!`);
            document.getElementById('adm-cat-rename').value = '';
        });
    }

    // Team Form Submit
    if (admTeamForm) {
        admTeamForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const editId = document.getElementById('adm-team-edit-id').value;
            const rolePT = document.getElementById('team-role').value.trim();
            const memberData = {
                name: document.getElementById('team-name').value.trim(),
                role: rolePT,
                role_en: document.getElementById('team-role-en')?.value.trim() || rolePT,
                role_es: document.getElementById('team-role-es')?.value.trim() || rolePT,
                photo: document.getElementById('team-photo').value.trim(),
                link: document.getElementById('team-link').value.trim() || ''
            };

            const team = [...getTeamMembers()];
            if (editId !== '') {
                team[parseInt(editId, 10)] = memberData;
            } else {
                team.push(memberData);
            }

            setTeamMembers(team);
            updateAdmTeamList();
            admTeamForm.reset();
            document.getElementById('adm-team-edit-id').value = '';
            alert('✅ Membro salvo com sucesso na equipe!');
        });
    }

    // Selection Config Form
    if (admSelectionForm) {
        admSelectionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const active = document.getElementById('adm-selection-active').checked;
            const name = document.getElementById('adm-selection-name').value;
            if (window.CombogoSelectionConfig) {
                window.CombogoSelectionConfig.saveConfig({ active, name });
                alert('✅ Configurações da seleção salvas com sucesso!');
            }
        });
    }

    // JSON Download buttons
    if (downloadJsonBtn) {
        downloadJsonBtn.addEventListener('click', () => {
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(getProjects(), null, 4));
            downloadFile(dataStr, 'projects.json');
        });
    }

    if (downloadTeamBtn) {
        downloadTeamBtn.addEventListener('click', () => {
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(getTeamMembers(), null, 4));
            downloadFile(dataStr, 'team.json');
        });
    }
}

function downloadFile(dataStr, filename) {
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', filename);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
}

export function updateAdmFolders() {
    const admFolderSelect = document.getElementById('adm-folder');
    if (!admFolderSelect) return;

    const folders = [...new Set(getProjects().map(p => p.folder || 'HCP'))];
    admFolderSelect.innerHTML = folders.map(f => `<option value="${f}">${f}</option>`).join('') + '<option value="NEW_FOLDER">➕ Criar Nova Pasta...</option>';
}

export function updateAdmCategories() {
    const admCatCheckboxesContainer = document.getElementById('adm-cat-checkboxes');
    const admCatOldSelect = document.getElementById('adm-cat-old');
    const categories = getAllCategories();

    if (admCatCheckboxesContainer) {
        admCatCheckboxesContainer.innerHTML = categories.map(c => `
            <label class="checkbox-label">
                <input type="checkbox" name="proj_cats" value="${c}"> <span>${c}</span>
            </label>
        `).join('');
    }

    if (admCatOldSelect) {
        admCatOldSelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
    }
}

export function updateAdmProjectList() {
    const listUI = document.getElementById('adm-projects-list-ui');
    if (!listUI) return;

    const projects = getProjects();
    listUI.innerHTML = '';

    projects.forEach((p, index) => {
        const item = document.createElement('div');
        item.className = 'adm-project-item';
        item.innerHTML = `
            <div class="adm-project-info">
                <strong>${p.title} (${p.year || ''})</strong>
                <span>👥 ${p.client} | 🏷️ ${getProjectCats(p).join(', ')}</span>
            </div>
            <div class="adm-project-actions">
                <button type="button" class="btn-edit" data-index="${index}">✏️ Editar</button>
                <button type="button" class="btn-danger" data-index="${index}">🗑️ Excluir</button>
            </div>
        `;

        item.querySelector('.btn-edit').addEventListener('click', () => startEditProject(index));
        item.querySelector('.btn-danger').addEventListener('click', () => deleteProject(index));

        listUI.appendChild(item);
    });
}

function startEditProject(index) {
    const p = getProjects()[index];
    document.getElementById('adm-edit-id').value = index;
    document.getElementById('adm-title').value = p.title;
    document.getElementById('adm-client').value = p.client;
    document.getElementById('adm-year').value = p.year || 2026;
    document.getElementById('adm-folder').value = p.folder || 'HCP';
    document.getElementById('adm-link').value = p.link || '';
    document.getElementById('adm-desc').value = p.desc || '';
    if (document.getElementById('adm-desc-en')) document.getElementById('adm-desc-en').value = p.desc_en || '';
    if (document.getElementById('adm-desc-es')) document.getElementById('adm-desc-es').value = p.desc_es || '';

    // Check categories
    const cats = getProjectCats(p);
    document.querySelectorAll('input[name="proj_cats"]').forEach(cb => {
        cb.checked = cats.includes(cb.value);
    });

    document.getElementById('adm-submit-btn').textContent = '💾 Atualizar Projeto';
    const cancelBtn = document.getElementById('adm-cancel-btn');
    if (cancelBtn) cancelBtn.style.display = 'block';

    // Switch to form tab
    const formTabBtn = document.querySelector('.adm-tab-btn[data-tab="tab-form"]');
    if (formTabBtn) formTabBtn.click();
}

function deleteProject(index) {
    const p = getProjects()[index];
    if (confirm(`⚠️ Excluir permanentemente o projeto "${p.title}"?`)) {
        const projects = [...getProjects()];
        projects.splice(index, 1);
        setProjects(projects);
        updateAdmProjectList();
    }
}

export function updateAdmTeamList() {
    const listUI = document.getElementById('adm-team-list-ui');
    if (!listUI) return;

    const team = getTeamMembers();
    listUI.innerHTML = '';

    team.forEach((m, index) => {
        const item = document.createElement('div');
        item.className = 'adm-project-item';
        item.innerHTML = `
            <div class="adm-project-info">
                <strong>${m.name}</strong>
                <span>💼 ${m.role} | 📁 ${m.photo}</span>
            </div>
            <div class="adm-project-actions">
                <button type="button" class="btn-edit" data-index="${index}">✏️ Editar</button>
                <button type="button" class="btn-danger" data-index="${index}">🗑️ Excluir</button>
            </div>
        `;

        item.querySelector('.btn-edit').addEventListener('click', () => startEditTeam(index));
        item.querySelector('.btn-danger').addEventListener('click', () => deleteTeam(index));

        listUI.appendChild(item);
    });
}

function startEditTeam(index) {
    const m = getTeamMembers()[index];
    document.getElementById('adm-team-edit-id').value = index;
    document.getElementById('team-name').value = m.name;
    document.getElementById('team-role').value = m.role;
    if (document.getElementById('team-role-en')) document.getElementById('team-role-en').value = m.role_en || '';
    if (document.getElementById('team-role-es')) document.getElementById('team-role-es').value = m.role_es || '';
    document.getElementById('team-photo').value = m.photo;
    document.getElementById('team-link').value = m.link || '';

    document.getElementById('team-submit-btn').textContent = '💾 Atualizar Membro';
    const cancelBtn = document.getElementById('team-cancel-btn');
    if (cancelBtn) cancelBtn.style.display = 'block';
}

function deleteTeam(index) {
    const m = getTeamMembers()[index];
    if (confirm(`⚠️ Excluir permanentemente "${m.name}" da equipe?`)) {
        const team = [...getTeamMembers()];
        team.splice(index, 1);
        setTeamMembers(team);
        updateAdmTeamList();
    }
}

function loadAdmSelectionConfig() {
    if (window.CombogoSelectionConfig) {
        const config = window.CombogoSelectionConfig.getConfig();
        const activeCb = document.getElementById('adm-selection-active');
        const nameInput = document.getElementById('adm-selection-name');
        if (activeCb) activeCb.checked = config.active;
        if (nameInput) nameInput.value = config.name;
    }
}
