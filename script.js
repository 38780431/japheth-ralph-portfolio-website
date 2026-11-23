const header = document.querySelector('header');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const themeToggle = document.querySelector('.theme-toggle');
const backToTop = document.querySelector('.back-to-top');
const installButton = document.querySelector('#install-app');

const applyTheme = theme => {
    const isLight = theme === 'light';
    document.documentElement.dataset.theme = isLight ? 'light' : 'dark';

    if (themeToggle) {
        themeToggle.setAttribute('aria-pressed', String(isLight));
        themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
        themeToggle.querySelector('i').className = `bx ${isLight ? 'bx-moon' : 'bx-sun'}`;
    }

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.setAttribute('content', isLight ? '#f4f6f1' : '#0b0d12');
};

let savedTheme = 'dark';
try {
    if (localStorage.getItem('portfolio-theme') === 'light') savedTheme = 'light';
} catch (error) {
    console.error('Could not read the saved theme preference.', error);
}
applyTheme(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
        applyTheme(theme);
        try {
            localStorage.setItem('portfolio-theme', theme);
        } catch (error) {
            console.error('Could not save the theme preference.', error);
        }
    });
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        const open = navLinks.classList.toggle('active');
        hamburger.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', String(open));
        hamburger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        document.body.classList.toggle('menu-open', open);
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
        });
    });
}

const updateScrollState = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 20);
    if (backToTop) backToTop.hidden = window.scrollY < 480;
};

window.addEventListener('scroll', updateScrollState, { passive: true });
updateScrollState();

if (backToTop) {
    backToTop.addEventListener('click', () => {
        const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
        window.scrollTo({ top: 0, behavior });
    });
}

let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', event => {
    if (!installButton) return;

    event.preventDefault();
    deferredInstallPrompt = event;
    installButton.hidden = false;
});

if (installButton) {
    installButton.addEventListener('click', async () => {
        if (!deferredInstallPrompt) return;

        const promptEvent = deferredInstallPrompt;
        deferredInstallPrompt = null;
        installButton.hidden = true;
        try {
            await promptEvent.prompt();
            await promptEvent.userChoice;
        } catch (error) {
            console.error('Could not show the app installation prompt.', error);
        }
    });
}

window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    if (installButton) installButton.hidden = true;
});

const isSecurePreview = window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

if ('serviceWorker' in navigator && isSecurePreview) {
    navigator.serviceWorker.register('./service-worker.js')
        .catch(error => console.error('Could not register the service worker.', error));
}

const projectGrid = document.querySelector('.project-grid');
if (projectGrid) {
    const cards = Array.from(projectGrid.querySelectorAll('.project-card'));
    const search = document.querySelector('.project-search');
    const filters = document.querySelectorAll('.project-filter');
    const resultCount = document.querySelector('.project-result-count');
    const emptyState = document.querySelector('.project-empty-state');
    let activeCategory = 'all';

    const updateProjects = () => {
        const query = search.value.trim().toLowerCase();
        let visibleCount = 0;

        cards.forEach(card => {
            const categories = card.dataset.category.split(/\s+/);
            const matchesCategory = activeCategory === 'all' || categories.includes(activeCategory);
            const matchesSearch = card.textContent.toLowerCase().includes(query);
            const visible = matchesCategory && matchesSearch;
            card.hidden = !visible;
            if (visible) visibleCount += 1;
        });

        resultCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'project' : 'projects'} found`;
        emptyState.hidden = visibleCount > 0;
    };

    filters.forEach(button => {
        button.addEventListener('click', () => {
            activeCategory = button.dataset.filter;
            filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
            updateProjects();
        });
    });

    search.addEventListener('input', updateProjects);
    updateProjects();
}

const contactForm = document.querySelector('#contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(contactForm);
        const name = formData.get('name').toString().trim();
        const email = formData.get('email').toString().trim();
        const subject = formData.get('subject').toString().trim() || 'Portfolio enquiry';
        const message = formData.get('message').toString().trim();
        const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
        const mailto = `mailto:jnyadwera@yahoo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        document.querySelector('.form-note').textContent = 'Opening your email app. Review the message and send it there.';
        window.location.href = mailto;
    });
}
