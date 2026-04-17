
/**
 * Portfolio Main JS - Enhanced
 * - Custom cursor
 * - Canvas particle background
 * - Hero text character reveal
 * - Magnetic hover effect
 * - Parallax scroll
 * - Scroll progress bar
 */
(function() {
    'use strict';

    // =========================================
    // Custom Cursor
    // =========================================
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    // Initialize cursor position off-screen
    cursorDot.style.left = '-100px';
    cursorDot.style.top = '-100px';
    cursorRing.style.left = '-100px';
    cursorRing.style.top = '-100px';

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
        cursorDot.classList.add('visible');
        cursorRing.classList.add('visible');
    });

    // Smooth ring follow
    function animateRing() {
        ringX += (mouseX - ringX) * 0.15;
        ringY += (mouseY - ringY) * 0.15;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover effect on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .folder, .folder-item, .btn');
    hoverTargets.forEach(el => {
        el.addEventListener('mouseenter', () => cursorRing.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursorRing.classList.remove('hover'));
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('visible');
        cursorRing.classList.remove('visible');
    });

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
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });
    }

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
    function animateCounter(el, target, duration) {
        duration = duration || 1500;
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
            setTimeout(function() { animateCounter(counterEl, target); }, 800);
        }

        var heroLabel = document.querySelector('.hero-label');
        if (heroLabel) setTimeout(function() { heroLabel.classList.add('visible'); }, 200);

        var heroDesc = document.querySelector('.hero-desc');
        if (heroDesc) setTimeout(function() { heroDesc.classList.add('visible'); }, 400);

        var heroActions = document.querySelector('.hero-actions');
        if (heroActions) setTimeout(function() { heroActions.classList.add('visible'); }, 600);

        var heroScroll = document.querySelector('.hero-scroll');
        if (heroScroll) setTimeout(function() { heroScroll.classList.add('visible'); }, 800);

        var heroCounter = document.querySelector('.hero-counter');
        if (heroCounter) setTimeout(function() { heroCounter.classList.add('visible'); }, 900);
    }

    // =========================================
    // Magnetic Button Effect
    // =========================================
    function initMagneticButtons() {
        var buttons = document.querySelectorAll('.btn, .contact-email, .social-item');
        buttons.forEach(function(btn) {
            btn.addEventListener('mousemove', function(e) {
                var rect = btn.getBoundingClientRect();
                var x = e.clientX - rect.left - rect.width / 2;
                var y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = 'translate(' + (x * 0.3) + 'px, ' + (y * 0.3) + 'px)';
            });
            btn.addEventListener('mouseleave', function() {
                btn.style.transform = '';
            });
        });
    }

    // =========================================
    // Parallax
    // =========================================
    function initParallax() {
        var heroTitle = document.querySelector('.hero-title');
        var heroGlows = document.querySelectorAll('.hero-glow');

        window.addEventListener('scroll', function() {
            var scrollY = window.scrollY;
            var heroH = document.querySelector('.hero') ? document.querySelector('.hero').offsetHeight : 0;
            if (scrollY < heroH) {
                var p = scrollY / heroH;
                if (heroTitle) heroTitle.style.transform = 'translateY(' + (scrollY * 0.3) + 'px)';
                heroGlows.forEach(function(g, i) {
                    g.style.transform = 'translateY(' + (scrollY * (0.2 + i * 0.1)) + 'px)';
                });
            }
        });
    }

    // =========================================
    // Scroll Animations
    // =========================================
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-scroll]').forEach(function(el) {
        observer.observe(el);
    });

    // =========================================
    // Smooth scroll for anchor links
    // =========================================
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            var target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // =========================================
    // Init
    // =========================================
    initHero();
    initMagneticButtons();
    initParallax();

})();
