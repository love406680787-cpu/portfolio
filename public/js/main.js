/**
 * Portfolio Main JS — Enhanced
 * - Canvas particle background
 * - Hero text character reveal
 * - Magnetic hover effect
 * - Parallax scroll
 * - Scroll progress bar
 * - Enhanced lightbox
 */
(function() {
    'use strict';

    // =========================================
    // Config
    // =========================================
    const DATA_URL = '../data/works.json';
    const PLACEHOLDER_EMOJIS = ['🎨', '✨', '🖼️', '📸', '🎬', '💡', '🌟', '🚀', '🎯', '🔮'];

    // =========================================
    // Scroll Progress Bar
    // =========================================
    const progressBar = document.createElement('div');
    progressBar.id = 'scrollProgress';
    progressBar.style.cssText = `
        position:fixed;top:0;left:0;height:2px;background:linear-gradient(to right, #00d4ff, #c8ff00);
        z-index:10001;width:0%;transition:width 0.1s linear;pointer-events:none;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = pct + '%';
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
    // Hero Text Character Reveal
    // =========================================
    function splitTextReveal(selector) {
        const el = document.querySelector(selector);
        if (!el) return;
        const text = el.textContent;
        el.innerHTML = '';
        [...text].forEach((char, i) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.display = 'inline-block';
            span.style.opacity = '0';
            span.style.transform = 'translateY(60px) rotateX(-40deg)';
            span.style.transition = `all 0.7s cubic-bezier(0.22, 1, 0.36, 1)`;
            span.style.transitionDelay = `${i * 0.04}s`;
            span.style.transformOrigin = 'bottom';
            el.appendChild(span);
        });
        // Trigger after brief delay
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.classList.add('revealed');
                el.querySelectorAll('.char').forEach(c => {
                    c.style.opacity = '1';
                    c.style.transform = 'translateY(0) rotateX(0)';
                });
            });
        });
    }

    // =========================================
    // Hero Counter Animation
    // =========================================
    function animateCounter(el, target, duration = 1500) {
        let start = 0;
        const startTime = performance.now();
        function update(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    // =========================================
    // Hero Init (trigger on load)
    // =========================================
    function initHero() {
        splitTextReveal('.hero-title');

        const counterEl = document.getElementById('workCount');
        if (counterEl) {
            const target = parseInt(counterEl.textContent) || 0;
            counterEl.textContent = '0';
            setTimeout(() => animateCounter(counterEl, target), 800);
        }

        // Animate hero label
        const heroLabel = document.querySelector('.hero-label');
        if (heroLabel) {
            setTimeout(() => heroLabel.classList.add('visible'), 200);
        }

        // Hero desc & actions
        const heroDesc = document.querySelector('.hero-desc');
        if (heroDesc) setTimeout(() => heroDesc.classList.add('visible'), 400);
        const heroActions = document.querySelector('.hero-actions');
        if (heroActions) setTimeout(() => heroActions.classList.add('visible'), 600);
        const heroScroll = document.querySelector('.hero-scroll');
        if (heroScroll) setTimeout(() => heroScroll.classList.add('visible'), 800);
        const heroCounter = document.querySelector('.hero-counter');
        if (heroCounter) setTimeout(() => heroCounter.classList.add('visible'), 900);
    }

    // =========================================
    // Magnetic Button Effect
    // =========================================
    function initMagneticButtons() {
        const buttons = document.querySelectorAll('.btn, .contact-email, .social-item');
        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }

    // =========================================
    // Parallax
    // =========================================
    function initParallax() {
        const heroTitle = document.querySelector('.hero-title');
        const heroGlows = document.querySelectorAll('.hero-glow');

        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const heroH = document.querySelector('.hero')?.offsetHeight || 0;
            if (scrollY < heroH) {
                const p = scrollY / heroH;
                if (heroTitle) heroTitle.style.transform = `translateY(${scrollY * 0.3}px)`;
                heroGlows.forEach((g, i) => {
                    g.style.transform = `translateY(${scrollY * (0.2 + i * 0.1)}px)`;
                });
            }
        });
    }

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
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    // Stagger animation for work cards
    function observeWorks() {
        const cards = document.querySelectorAll('.work-card');
        cards.forEach((card, index) => {
            card.style.transitionDelay = `${index * 0.08}s`;
            observer.observe(card);
        });
    }

    document.querySelectorAll('[data-scroll]').forEach(el => {
        observer.observe(el);
    });

    // =========================================
    // Tilt Effect on Work Cards
    // =========================================
    function initCardTilt() {
        const cards = document.querySelectorAll('.work-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `translateY(-8px) perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
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
                initCardTilt();
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
    // Lightbox with animated entry
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
        lightboxContent.style.opacity = '0';
        lightboxContent.style.transform = 'scale(0.95)';
        setTimeout(() => {
            if (work.type === 'video') {
                lightboxContent.innerHTML = `
                    <video src="${work.url}" controls autoplay style="max-width:90vw;max-height:85vh;border-radius:12px;box-shadow:0 40px 80px rgba(0,0,0,0.6);"></video>
                `;
            } else {
                lightboxContent.innerHTML = `<img src="${work.url}" alt="${work.title}" style="border-radius:12px;box-shadow:0 40px 80px rgba(0,0,0,0.6);">`;
            }
            lightboxContent.style.opacity = '1';
            lightboxContent.style.transform = 'scale(1)';
        }, 150);
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        lightboxContent.style.opacity = '0';
        setTimeout(() => { lightboxContent.innerHTML = ''; }, 400);
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
    // Smooth scroll for anchor links
    // =========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // =========================================
    // Init
    // =========================================
    loadWorks();
    initHero();
    initMagneticButtons();
    initParallax();

})();
