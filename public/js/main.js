/**
 * Portfolio Main JS
 * - Loads works from data.json
 * - Handles scroll animations
 * - Lightbox for viewing works
 * - Custom cursor
 * - Navigation scroll effect
 */

(function() {
    'use strict';

    // =========================================
    // Config
    // =========================================
    const DATA_URL = '../data/works.json';
    const PLACEHOLDER_EMOJIS = ['🎨', '✨', '🖼️', '📸', '🎬', '💡', '🌟', '🚀', '🎯', '🔮'];

    // =========================================
    // Custom Cursor
    // =========================================
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    });

    function animateRing() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover effect
    const hoverTargets = document.querySelectorAll('a, button, .work-card, .filter-btn');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
    });

    // =========================================
    // Navigation Scroll Effect
    // =========================================
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });

    // =========================================
    // Scroll Animations
    // =========================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('[data-scroll]').forEach(el => {
        observer.observe(el);
    });

    // Stagger animation for work cards
    function observeWorks() {
        const cards = document.querySelectorAll('.work-card');
        cards.forEach((card, index) => {
            card.style.transitionDelay = `${index * 0.08}s`;
            observer.observe(card);
        });
    }

    // =========================================
    // Load Works
    // =========================================
    let allWorks = [];
    let currentFilter = 'all';
    let lightboxIndex = 0;

    async function loadWorks() {
        try {
            const response = await fetch(DATA_URL);
            if (!response.ok) throw new Error('Failed to load works');
            const data = await response.json();
            allWorks = data.works || [];
            document.getElementById('workCount').textContent = allWorks.length;
            renderWorks(allWorks);
        } catch (err) {
            console.warn('Could not load works:', err.message);
            document.getElementById('worksGrid').style.display = 'none';
            document.getElementById('worksEmpty').style.display = 'block';
        }
    }

    function renderWorks(works) {
        const grid = document.getElementById('worksGrid');
        const empty = document.getElementById('worksEmpty');

        if (!works || works.length === 0) {
            grid.style.display = 'none';
            empty.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        empty.style.display = 'none';
        grid.innerHTML = '';

        works.forEach((work, index) => {
            const emoji = PLACEHOLDER_EMOJIS[index % PLACEHOLDER_EMOJIS.length];
            const thumbHTML = work.type === 'video'
                ? `<video src="${work.url}" muted loop preload="metadata"></video>`
                : `<img src="${work.url}" alt="${work.title}" loading="lazy">`;

            const card = document.createElement('article');
            card.className = 'work-card';
            card.dataset.type = work.type;
            card.dataset.index = index;
            card.innerHTML = `
                <div class="work-thumb">
                    ${work.url ? thumbHTML : `<span class="work-thumb-placeholder">${emoji}</span>`}
                    <div class="work-overlay">
                        <div class="work-overlay-icon">→</div>
                    </div>
                </div>
                <div class="work-info">
                    <span class="work-category">${work.category || '作品'}</span>
                    <h3 class="work-title">${work.title}</h3>
                    <p class="work-desc">${work.description || ''}</p>
                </div>
                <div class="work-footer">
                    <span class="work-year">${work.year || ''}</span>
                    <span class="work-arrow">↗</span>
                </div>
            `;

            // Hover to preview video
            const video = card.querySelector('video');
            if (video) {
                card.addEventListener('mouseenter', () => video.play());
                card.addEventListener('mouseleave', () => video.pause());
            }

            // Click to open lightbox
            card.addEventListener('click', () => openLightbox(index));

            grid.appendChild(card);

            // Animate in
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 80);
        });
    }

    // =========================================
    // Filter
    // =========================================
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            currentFilter = filter;

            const filtered = filter === 'all'
                ? allWorks
                : allWorks.filter(w => w.type === filter);

            renderWorks(filtered);
        });
    });

    // =========================================
    // Lightbox
    // =========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = document.getElementById('lightboxContent');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    function openLightbox(index) {
        const works = currentFilter === 'all' ? allWorks : allWorks.filter(w => w.type === currentFilter);
        if (!works[index]) return;

        lightboxIndex = index;
        showLightboxItem(works[index]);
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function showLightboxItem(work) {
        if (work.type === 'video') {
            lightboxContent.innerHTML = `
                <video src="${work.url}" controls autoplay style="max-width:90vw;max-height:85vh;border-radius:8px;"></video>
            `;
        } else {
            lightboxContent.innerHTML = `<img src="${work.url}" alt="${work.title}">`;
        }
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        lightboxContent.innerHTML = '';
    }

    function navigateLightbox(dir) {
        const works = currentFilter === 'all' ? allWorks : allWorks.filter(w => w.type === currentFilter);
        lightboxIndex = (lightboxIndex + dir + works.length) % works.length;
        showLightboxItem(works[lightboxIndex]);
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    lightboxNext.addEventListener('click', () => navigateLightbox(1));
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    // =========================================
    // Init
    // =========================================
    loadWorks();

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

})();
