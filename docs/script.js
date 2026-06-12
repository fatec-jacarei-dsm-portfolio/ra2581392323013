const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const tabs = document.querySelector('.tabs');
const tabIndicator = document.querySelector('.tab-indicator');

function updateTabIndicator(button) {
    if (!tabs || !tabIndicator || !button) {
        return;
    }

    const tabsRect = tabs.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    tabs.style.setProperty('--indicator-left', `${buttonRect.left - tabsRect.left}px`);
    tabs.style.setProperty('--indicator-width', `${buttonRect.width}px`);
}

function showTab(tabName) {
    tabButtons.forEach((button) => {
        const isActive = button.dataset.tab === tabName;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-selected', String(isActive));
        if (isActive) {
            updateTabIndicator(button);
        }
    });

    tabContents.forEach((content) => {
        const isActive = content.id === `tab-${tabName}`;
        content.classList.toggle('active', isActive);
        content.hidden = !isActive;
    });

    observeReveals();
}

tabButtons.forEach((button) => {
    button.addEventListener('click', () => showTab(button.dataset.tab));
});

window.addEventListener('resize', () => {
    updateTabIndicator(document.querySelector('.tab-btn.active'));
});

window.addEventListener('load', () => {
    updateTabIndicator(document.querySelector('.tab-btn.active'));
});

const navLinks = document.querySelectorAll('.nav-link');
const navSections = document.querySelectorAll('#topo, #projetos');

if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            navLinks.forEach((link) => {
                link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
            });
        });
    }, {
        rootMargin: '-35% 0px -55% 0px',
        threshold: 0
    });

    navSections.forEach((section) => navObserver.observe(section));
}

let revealObserver;

function observeReveals() {
    const revealTargets = document.querySelectorAll('.reveal-section, .reveal-card');

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
        revealTargets.forEach((target) => target.classList.add('in-view'));
        return;
    }

    if (!revealObserver) {
        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.14
        });
    }

    revealTargets.forEach((target) => {
        if (!target.classList.contains('in-view')) {
            revealObserver.observe(target);
        }
    });
}

observeReveals();

function initHeroParticles() {
    const canvas = document.querySelector('.hero-canvas');
    const hero = document.querySelector('.hero');

    if (!canvas || !hero || prefersReducedMotion) {
        return;
    }

    const context = canvas.getContext('2d');
    const particles = [];
    const particleCount = 58;
    let width = 0;
    let height = 0;
    let animationFrame;

    function resize() {
        const rect = hero.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        width = rect.width;
        height = rect.height;
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function createParticle() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.8 + 0.8,
            speedX: (Math.random() - 0.5) * 0.28,
            speedY: (Math.random() - 0.5) * 0.24,
            alpha: Math.random() * 0.48 + 0.18
        };
    }

    function seedParticles() {
        particles.length = 0;
        for (let index = 0; index < particleCount; index += 1) {
            particles.push(createParticle());
        }
    }

    function drawConnections() {
        for (let first = 0; first < particles.length; first += 1) {
            for (let second = first + 1; second < particles.length; second += 1) {
                const a = particles[first];
                const b = particles[second];
                const distance = Math.hypot(a.x - b.x, a.y - b.y);

                if (distance < 118) {
                    const opacity = (1 - distance / 118) * 0.16;
                    context.strokeStyle = `rgba(34, 199, 169, ${opacity})`;
                    context.lineWidth = 1;
                    context.beginPath();
                    context.moveTo(a.x, a.y);
                    context.lineTo(b.x, b.y);
                    context.stroke();
                }
            }
        }
    }

    function draw() {
        context.clearRect(0, 0, width, height);

        particles.forEach((particle) => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            if (particle.x < -10) particle.x = width + 10;
            if (particle.x > width + 10) particle.x = -10;
            if (particle.y < -10) particle.y = height + 10;
            if (particle.y > height + 10) particle.y = -10;

            context.beginPath();
            context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            context.fillStyle = `rgba(56, 215, 255, ${particle.alpha})`;
            context.fill();
        });

        drawConnections();
        animationFrame = window.requestAnimationFrame(draw);
    }

    resize();
    seedParticles();
    draw();

    window.addEventListener('resize', () => {
        window.cancelAnimationFrame(animationFrame);
        resize();
        seedParticles();
        draw();
    });
}

initHeroParticles();
