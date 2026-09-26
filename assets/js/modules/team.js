/**
 * Team Module
 * Loads team members from team.json (with localStorage override) and renders cards.
 */
import { getSafeStorage, setSafeStorage } from './storage.js';
import { getLanguage } from './i18n.js';

let teamMembers = [];

export async function loadTeam() {
    const cached = getSafeStorage('combogo_team', null);
    if (cached && Array.isArray(cached) && cached.length > 0) {
        teamMembers = cached;
    } else {
        try {
            const res = await fetch('team.json');
            if (res.ok) {
                teamMembers = await res.json();
                setSafeStorage('combogo_team', teamMembers);
            }
        } catch (e) {
            console.warn('Failed to fetch team.json, using fallback:', e);
            teamMembers = [];
        }
    }
    return teamMembers;
}

export function getTeamMembers() {
    return teamMembers;
}

export function setTeamMembers(newTeam) {
    teamMembers = newTeam;
    setSafeStorage('combogo_team', teamMembers);
    renderTeam();
}

export function renderTeam() {
    const teamGrid = document.getElementById('team-grid');
    if (!teamGrid) return;

    teamGrid.innerHTML = '';
    const lang = getLanguage();

    teamMembers.forEach(member => {
        let displayRole = member.role;
        if (lang === 'en' && member.role_en) displayRole = member.role_en;
        if (lang === 'es' && member.role_es) displayRole = member.role_es;

        const card = document.createElement('article');
        card.className = 'team-card';
        card.innerHTML = `
            <div class="team-photo-wrap">
                <img src="${member.photo}" alt="${member.name}" class="team-photo" loading="lazy" onerror="this.src='assets/icons/combogo_icon.svg'">
            </div>
            <div class="team-info">
                <h3 class="team-name">${member.name}</h3>
                <p class="team-role">${displayRole}</p>
                ${member.link ? `
                    <a href="${member.link}" target="_blank" rel="noopener noreferrer" class="team-link" aria-label="LinkedIn de ${member.name}">
                        <img src="assets/icons/linkedin_icon.svg" alt="LinkedIn" width="18" height="18">
                        <span>Perfil</span>
                    </a>
                ` : ''}
            </div>
        `;
        teamGrid.appendChild(card);
    });
}
