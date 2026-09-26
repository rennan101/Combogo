/**
 * UI & Interactions Module
 * Handles mobile menu toggle, scroll progress bar, scroll reveals, and contact form submission.
 */

export function initUI() {
    // Mobile navigation toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');

    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const isOpen = navMenu.classList.contains('active');
            menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            menuBtn.textContent = isOpen ? '✕' : '☰';
        });

        // Close mobile nav when clicking a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    menuBtn.textContent = '☰';
                }
            });
        });
    }

    // Scroll progress bar
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            progressBar.style.width = `${progress}%`;
        }, { passive: true });
    }

    // Scroll reveal observer
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && reveals.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        reveals.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for older browsers
        reveals.forEach(el => el.classList.add('active'));
    }

    // WhatsApp number formatting (only digits allowed)
    const whatsappInput = document.getElementById('whatsapp');
    if (whatsappInput) {
        whatsappInput.addEventListener('input', (e) => {
            let digits = e.target.value.replace(/\D/g, '');
            if (digits.length > 11) digits = digits.slice(0, 11);

            let masked = digits;
            if (digits.length <= 2) {
                masked = digits.length ? `(${digits}` : '';
            } else if (digits.length <= 7) {
                masked = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
            } else if (digits.length <= 10) {
                masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
            } else {
                masked = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
            }
            e.target.value = masked;
        });

        whatsappInput.addEventListener('keydown', (e) => {
            const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
            if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
            // Prevent any non-digit key from being typed
            if (!/^\d$/.test(e.key)) {
                e.preventDefault();
            }
        });
    }

    // Contact form handling (FormSubmit / WhatsApp)
    const form = document.getElementById('briefing-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            // Allow standard submission or handle feedback
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '⏳ Enviando...';
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }, 4000);
            }
        });
    }
}
