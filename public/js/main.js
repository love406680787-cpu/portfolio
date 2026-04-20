/**
 * Portfolio Main JS - fromanother inspired
 * - Page Loader
 * - Scroll Progress Bar
 * - Hero clip-path reveal + featured words
 * - Full-screen menu
 * - Noise overlay
 * - Magnetic hover
 * - Parallax
 * - Scroll animations
 */
(function() {
    'use strict';

    // =========================================
    // PAGE LOADER
    // =========================================
    const loader = document.getElementById('pageLoader');
    const loaderBar = document.getElementById('loaderBar');
    const loaderCount = document.getElementById('loaderCount');
    let progress = 0;

    function fakeLoad(cb) {
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
                progress = 100;
                loaderBar.style.width = '100%';
                loaderCount.textContent = '100%';
                clearInterval(interval);
                setTimeout(cb, 400);
            } else {
                loaderBar.style.width = progress + '%';
                loaderCount.textContent = Math.floor(progress) + '%';
            }
        }, 80);
    }

    function hideLoader() {
        loader.classList.add('hidden');
        setTimeout(() => { loader.style.display = 'none'; }, 1000);
        // Unlock scroll after loader
        document.body.style.overflow = '';
    }

    // Block scroll during load
    document.body.style.overflow = 'hidden';
    fakeLoad(hideLoader);

    // =========================================
    // SCROLL PROGRESS BAR
    // =========================================
    const scrollFill = document.getElementById('scrollProgressFill');
    window.addEventListener('scroll', function() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollFill.style.width = pct + '%';
    }, { passive: true });

    // =========================================
    // CUSTOM CURSOR
    // =========================================
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    cursorDot.style.left = '-100px';
    cursorDot.style.top = '-100px';
    cursorRing.style.left = '-100px';
    cursorRing.style.top = '-100px';

    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
        cursorDot.classList.add('visible');
        cursorRing.classList.add('visible');
    });

    function animateRing() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        cursorRing.style.left = ringX + 'px';
        cursorRing.style.top = ringY + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    var hoverTargets = document.querySelectorAll('a, button, .folder, .folder-item, .btn, .menu-link, .filter-btn, .contact-email, .social-item');
    hoverTargets.forEach(function(el) {
        el.addEventListener('mouseenter', function() { cursorRing.classList.add('hover'); });
        el.addEventListener('mouseleave', function() { cursorRing.classList.remove('hover'); });
    });

    document.addEventListener('mouseleave', function() {
        cursorDot.classList.remove('visible');
        cursorRing.classList.remove('visible');
    });

    // =========================================
    // NAV SCROLL EFFECT
    // =========================================
    var nav = document.getElementById('nav');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 60) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
    }, { passive: true });

    // =========================================
    // FULL-SCREEN MENU
    // =========================================
    var navToggle = document.getElementById('navToggle');
    var fullscreenMenu = document.getElementById('fullscreenMenu');
    var menuOpen = false;

    if (navToggle && fullscreenMenu) {
        navToggle.addEventListener('click', function() {
            menuOpen = !menuOpen;
            fullscreenMenu.classList.toggle('open', menuOpen);
            navToggle.classList.toggle('active', menuOpen);
            document.body.style.overflow = menuOpen ? 'hidden' : '';
        });

        // Close on link click
        fullscreenMenu.querySelectorAll('.menu-link').forEach(function(link) {
            link.addEventListener('click', function() {
                menuOpen = false;
                fullscreenMenu.classList.remove('open');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // =========================================
    // HERO TITLE - Clip-path reveal
    // =========================================
    function initHeroTitle() {
        var line1 = document.getElementById('titleLine1');
        var line2 = document.getElementById('titleLine2');
        if (!line1) return;

        // Wait for loader to finish, then trigger reveal
        setTimeout(function() {
            if (line1) line1.classList.add('revealed');
            if (line2) setTimeout(function() { if (line2) line2.classList.add('revealed'); }, 150);
        }, 200);
    }

    // =========================================
    // FEATURED WORDS CYCLING
    // =========================================
    var featuredWords = ['AGENCY', 'STUDIO', 'COLLECTIVE'];
    var currentWordIndex = 0;
    var featuredWordEl = document.getElementById('featuredWord');

    function cycleWords() {
        if (!featuredWordEl) return;
        var nextIndex = (currentWordIndex + 1) % featuredWords.length;

        featuredWordEl.classList.remove('active');
        featuredWordEl.classList.add('exit');

        setTimeout(function() {
            featuredWordEl.textContent = featuredWords[nextIndex];
            featuredWordEl.classList.remove('exit');
            featuredWordEl.classList.add('active');
            currentWordIndex = nextIndex;
        }, 500);
    }

    function initFeaturedWords() {
        if (!featuredWordEl) return;
        // Show first word after title reveal
        setTimeout(function() {
            featuredWordEl.classList.add('active');
            // Start cycling every 3s
            setInterval(cycleWords, 3000);
        }, 1200);
    }

    // =========================================
    // HERO COUNTER
    // =========================================
    function animateCounter(el, target, duration) {
        duration = duration || 1500;
        var startTime = performance.now();
        function update(now) {
            var elapsed = now - startTime;
            var progress = Math.min(elapsed / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    function initHeroCounter() {
        var counterEl = document.getElementById('workCount');
        if (!counterEl) return;
        var target = parseInt(counterEl.textContent) || 0;
        counterEl.textContent = '0';
        setTimeout(function() { animateCounter(counterEl, target); }, 1400);
    }

    // =========================================
    // HERO LABEL / DESC / ACTIONS reveal
    // =========================================
    function initHeroContent() {
        setTimeout(function() {
            var label = document.querySelector('.hero-label');
            if (label) label.classList.add('visible');
        }, 800);

        setTimeout(function() {
            var desc = document.querySelector('.hero-desc');
            if (desc) desc.classList.add('visible');
        }, 1100);

        setTimeout(function() {
            var actions = document.querySelector('.hero-actions');
            if (actions) actions.classList.add('visible');
        }, 1400);

        setTimeout(function() {
            var scroll = document.querySelector('.hero-scroll');
            if (scroll) scroll.classList.add('visible');
        }, 1600);

        setTimeout(function() {
            var counter = document.querySelector('.hero-counter');
            if (counter) counter.classList.add('visible');
        }, 1800);
    }

    // =========================================
    // MAGNETIC BUTTON EFFECT
    // =========================================
    function initMagneticButtons() {
        var buttons = document.querySelectorAll('.btn, .contact-email, .social-item, .nav-admin-btn');
        buttons.forEach(function(btn) {
            btn.addEventListener('mousemove', function(e) {
                var rect = btn.getBoundingClientRect();
                var x = e.clientX - rect.left - rect.width / 2;
                var y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = 'translate(' + (x * 0.25) + 'px, ' + (y * 0.25) + 'px)';
            });
            btn.addEventListener('mouseleave', function() {
                btn.style.transform = '';
            });
        });
    }

    // =========================================
    // PARALLAX
    // =========================================
    function initParallax() {
        var heroGlows = document.querySelectorAll('.hero-glow');
        var heroTitle = document.querySelector('.hero-title');

        window.addEventListener('scroll', function() {
            var scrollY = window.scrollY;
            var heroH = document.querySelector('.hero') ? document.querySelector('.hero').offsetHeight : 0;
            if (scrollY < heroH) {
                if (heroTitle) heroTitle.style.transform = 'translateY(' + (scrollY * 0.15) + 'px)';
                heroGlows.forEach(function(g, i) {
                    g.style.transform = 'translateY(' + (scrollY * (0.15 + i * 0.08)) + 'px)';
                });
            }
        }, { passive: true });
    }

    // =========================================
    // SCROLL ANIMATIONS (IntersectionObserver)
    // =========================================
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-scroll]').forEach(function(el) {
        observer.observe(el);
    });

    // =========================================
    // SMOOTH SCROLL
    // =========================================
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            var target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // =========================================
    // INIT ALL
    // =========================================
    function initAll() {
        initHeroTitle();
        initFeaturedWords();
        initHeroCounter();
        initHeroContent();
        initMagneticButtons();
        initParallax();
    }

    // Wait for fonts + DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        setTimeout(initAll, 100);
    }

})();
