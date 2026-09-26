/**
 * Portfolio Module
 * Handles project loading, category filtering, responsive carousels, and detailed project modal.
 */
import { getSafeStorage, setSafeStorage } from './storage.js';
import { getLanguage } from './i18n.js';

let projects = [];
let currentFilter = 'Todos';

export async function loadProjects() {
    const cached = getSafeStorage('combogo_projects', null);
    if (cached && Array.isArray(cached) && cached.length > 0) {
        projects = cached;
    } else {
        try {
            const res = await fetch('projects.json');
            if (res.ok) {
                projects = await res.json();
                setSafeStorage('combogo_projects', projects);
            }
        } catch (e) {
            console.warn('Failed to fetch projects.json, using fallback:', e);
            projects = [];
        }
    }
    return projects;
}

export function getProjects() {
    return projects;
}

export function setProjects(newProjects) {
    projects = newProjects;
    setSafeStorage('combogo_projects', projects);
    updateDynamicCategories();
    renderProjects(currentFilter);
}

export function getProjectCats(p) {
    if (Array.isArray(p.categories)) return p.categories;
    if (p.category) return [p.category];
    return ['Inovação'];
}

export function getAllCategories() {
    const customCategories = getSafeStorage('combogo_custom_categories', []);
    const fromProjects = projects.flatMap(p => getProjectCats(p));
    return [...new Set([...fromProjects, ...customCategories])].filter(Boolean);
}

async function checkImageExists(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

const imageProbeCache = new Map();

async function probeImage(folder, index) {
    const cacheKey = `${folder}_${index}`;
    if (imageProbeCache.has(cacheKey)) {
        return imageProbeCache.get(cacheKey);
    }

    const exts = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'JPG', 'PNG'];
    for (const ext of exts) {
        const url = `assets/projects/${encodeURIComponent(folder)}/${index}.${ext}`;
        if (await checkImageExists(url)) {
            imageProbeCache.set(cacheKey, url);
            return url;
        }
    }
    imageProbeCache.set(cacheKey, null);
    return null;
}

export async function buildDynamicCarousel(card, folder, title) {
    try {
        const track = card.querySelector('.carousel-track');
        const dotsContainer = card.querySelector('.carousel-dots');
        const prevBtn = card.querySelector('.carousel-btn.prev');
        const nextBtn = card.querySelector('.carousel-btn.next');

        let validImages = [];
        for (let i = 1; i <= 10; i++) {
            const validUrl = await probeImage(folder, i);
            if (validUrl) {
                validImages.push(validUrl);
            } else if (i === 1) {
                // If 1 doesn't exist, try up to 3 before giving up
                continue;
            } else {
                break;
            }
        }

        if (!track) return;
        track.innerHTML = '';
        if (dotsContainer) dotsContainer.innerHTML = '';

        if (validImages.length === 0) {
            track.innerHTML = `
                <div class="carousel-slide">
                    <div class="img-error-box">
                        <span class="error-badge">Combogó Lab</span>
                        <strong>${title}</strong>
                        <span class="error-detail">${folder}</span>
                    </div>
                </div>`;
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            return;
        }

        validImages.forEach((url, idx) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML = `<img src="${url}" alt="${title}" class="carousel-img" loading="lazy">`;
            track.appendChild(slide);

            if (dotsContainer && validImages.length > 1) {
                const dot = document.createElement('span');
                dot.className = `carousel-dot ${idx === 0 ? 'active' : ''}`;
                dotsContainer.appendChild(dot);
            }
        });

        if (validImages.length > 1) {
            if (prevBtn) prevBtn.style.display = 'flex';
            if (nextBtn) nextBtn.style.display = 'flex';
            setupCarousel(card, validImages.length);
        } else {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        }
    } catch (e) {
        console.error('Error building dynamic carousel:', e);
    }
}

function setupCarousel(cardElement, totalSlides) {
    if (totalSlides <= 1) return;
    let currentSlide = 0;
    const track = cardElement.querySelector('.carousel-track');
    const dots = cardElement.querySelectorAll('.carousel-dot');
    const prevBtn = cardElement.querySelector('.carousel-btn.prev');
    const nextBtn = cardElement.querySelector('.carousel-btn.next');

    function updateSlide(newIndex) {
        currentSlide = (newIndex + totalSlides) % totalSlides;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        dots.forEach((dot, idx) => dot.classList.toggle('active', idx === currentSlide));
    }

    if (prevBtn) {
        prevBtn.onclick = (e) => {
            e.stopPropagation();
            updateSlide(currentSlide - 1);
        };
    }

    if (nextBtn) {
        nextBtn.onclick = (e) => {
            e.stopPropagation();
            updateSlide(currentSlide + 1);
        };
    }
}

export function updateDynamicCategories() {
    const filterContainer = document.getElementById('portfolio-filters');
    if (!filterContainer) return;

    const categories = ['Todos', ...getAllCategories()];
    const lang = getLanguage();
    const t = (window.i18n && window.i18n[lang]) ? window.i18n[lang] : { cat_all: 'Todos' };

    filterContainer.innerHTML = '';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `filter-btn ${cat === currentFilter ? 'active' : ''}`;
        btn.setAttribute('data-filter', cat);
        btn.textContent = cat === 'Todos' ? (t.cat_all || 'Todos') : cat;
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = cat;
            renderProjects(cat);
        });
        filterContainer.appendChild(btn);
    });
}

export function renderProjects(filter = 'Todos') {
    currentFilter = filter;
    const portfolioGrid = document.getElementById('portfolio-grid');
    if (!portfolioGrid) return;

    portfolioGrid.innerHTML = '';
    const lang = getLanguage();
    const t = (window.i18n && window.i18n[lang]) ? window.i18n[lang] : { btn_view_project: 'Ver Projeto' };

    const filteredProjects = (filter === 'Todos' 
        ? projects 
        : projects.filter(p => getProjectCats(p).includes(filter))
    ).sort((a, b) => (b.year || 0) - (a.year || 0));

    if (filteredProjects.length === 0) {
        portfolioGrid.innerHTML = `
            <div class="portfolio-empty-state">
                <p>Nenhum projeto encontrado nesta categoria.</p>
            </div>`;
        return;
    }

    filteredProjects.forEach(p => {
        const card = document.createElement('article');
        card.className = 'project-card';
        
        let displayDesc = p.desc;
        if (lang === 'en' && p.desc_en) displayDesc = p.desc_en;
        if (lang === 'es' && p.desc_es) displayDesc = p.desc_es;

        const folder = p.folder || 'HCP';
        const cats = getProjectCats(p);

        card.innerHTML = `
            <div class="project-carousel">
                <div class="carousel-track">
                    <div class="carousel-slide skeleton-slide">
                        <span class="loading-spinner"></span>
                    </div>
                </div>
                <button class="carousel-btn prev" aria-label="Anterior" style="display:none;">‹</button>
                <button class="carousel-btn next" aria-label="Próximo" style="display:none;">›</button>
                <div class="carousel-dots"></div>
                <span class="project-year-badge">${p.year || ''}</span>
            </div>
            <div class="project-info">
                <div class="project-header">
                    <h3 class="project-title">${p.title}</h3>
                    <div class="project-tags">
                        ${cats.map(c => `<span class="project-tag">${c}</span>`).join('')}
                    </div>
                </div>
                <p class="project-client"><strong>${p.client}</strong></p>
                <p class="project-desc">${displayDesc}</p>
                ${p.link ? `
                    <div class="project-footer">
                        <a href="${p.link}" target="_blank" rel="noopener noreferrer" class="project-link-btn">
                            ${t.btn_view_project || 'Ver Projeto'} ↗
                        </a>
                    </div>
                ` : ''}
            </div>
        `;

        portfolioGrid.appendChild(card);
        buildDynamicCarousel(card, folder, p.title);
    });
}
