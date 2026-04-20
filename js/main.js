/**
 * Portfolio - fromanother.love inspired interactions
 */

(function() {
    'use strict';

    // =========================================
    // DOM Elements
    // =========================================
    const pageLoader = document.getElementById('pageLoader');
    const loaderBar = document.getElementById('loaderBar');
    const loaderCount = document.getElementById('loaderCount');
    const scrollProgress = document.getElementById('scrollProgress');
    const header = document.getElementById('header');
    const menuToggle = document.getElementById('menuToggle');
    const fullscreenMenu = document.getElementById('fullscreenMenu');
    const worksGrid = document.getElementById('worksGrid');
    const worksEmpty = document.getElementById('worksEmpty');
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = document.getElementById('lightboxContent');
    const lightboxInfo = document.getElementById('lightboxInfo');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    // State
    let works = [];
    let currentWorkIndex = 0;
    let isLoaderDone = false;

    // =========================================
    // PAGE LOADER
    // =========================================
    function initLoader() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    pageLoader.classList.add('hidden');
                    document.body.style.overflow = '';
                    isLoaderDone = true;
                    initScrollReveal();
                }, 300);
            }
            updateLoader(progress);
        }, 100);
    }

    function updateLoader(val) {
        const p = Math.min(100, Math.floor(val));
        if (loaderBar) loaderBar.style.width = p + '%';
        if (loaderCount) loaderCount.textContent = p;
    }

    // =========================================
    // SCROLL PROGRESS
    // =========================================
    function updateScrollProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        if (scrollProgress) {
            scrollProgress.style.width = progress + '%';
        }
    }

    // =========================================
    // FULLSCREEN MENU
    // =========================================
    function toggleMenu() {
        if (!fullscreenMenu) return;
        const isActive = fullscreenMenu.classList.toggle('active');
        if (menuToggle) {
            menuToggle.querySelector('.toggle-text').textContent = isActive ? 'Close' : 'Menu';
        }
        document.body.style.overflow = isActive ? 'hidden' : '';
    }

    function closeMenu() {
        if (!fullscreenMenu) return;
        fullscreenMenu.classList.remove('active');
        if (menuToggle) {
            menuToggle.querySelector('.toggle-text').textContent = 'Menu';
        }
        document.body.style.overflow = '';
    }

    // =========================================
    // SCROLL REVEAL
    // =========================================
    function initScrollReveal() {
        const items = document.querySelectorAll('[data-reveal]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        items.forEach(item => observer.observe(item));
    }

    // =========================================
    // WORKS DATA
    // =========================================
    async function loadWorks() {
        try {
            // Try localStorage first (for admin updates)
            const localData = localStorage.getItem('portfolioWorks');
            if (localData) {
                const parsed = JSON.parse(localData);
                if (parsed && parsed.works && parsed.works.length > 0) {
                    works = parsed.works;
                    renderWorks(works);
                    return;
                }
            }

            // Fallback to JSON file
            const res = await fetch('data/works.json?t=' + Date.now());
            const data = await res.json();
            works = data.works || [];
            renderWorks(works);
        } catch (e) {
            console.error('Failed to load works:', e);
            if (worksEmpty) {
                worksEmpty.style.display = 'block';
            }
        }
    }

    function renderWorks(items) {
        if (!worksGrid) return;

        if (!items || items.length === 0) {
            worksGrid.innerHTML = '';
            if (worksEmpty) worksEmpty.style.display = 'block';
            return;
        }

        if (worksEmpty) worksEmpty.style.display = 'none';

        worksGrid.innerHTML = items.map((work, index) => `
            <div class="work-item" data-index="${index}" data-type="${work.type || 'image'}">
                ${work.type === 'video' 
                    ? `<video src="${work.url}" muted loop playsinline></video>`
                    : `<img src="${work.url}" alt="${work.title}" loading="lazy">`
                }
                <div class="work-item-overlay">
                    <div class="work-item-info">
                        <div class="work-item-title">${work.title || 'Untitled'}</div>
                        <div class="work-item-category">${work.category || ''}</div>
                    </div>
                </div>
            </div>
        `).join('');

        // Bind click events
        worksGrid.querySelectorAll('.work-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                openLightbox(index);
            });

            // Video hover play
            const video = item.querySelector('video');
            if (video) {
                item.addEventListener('mouseenter', () => video.play());
                item.addEventListener('mouseleave', () => {
                    video.pause();
                    video.currentTime = 0;
                });
            }
        });
    }

    // =========================================
    // FILTER
    // =========================================
    function initFilter() {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.dataset.filter;
                if (filter === 'all') {
                    renderWorks(works);
                } else {
                    const filtered = works.filter(w => w.type === filter);
                    renderWorks(filtered);
                }
            });
        });
    }

    // =========================================
    // LIGHTBOX
    // =========================================
    function openLightbox(index) {
        if (!lightbox || !works[index]) return;
        currentWorkIndex = index;
        const work = works[index];

        lightboxContent.innerHTML = work.type === 'video'
            ? `<video src="${work.url}" controls autoplay></video>`
            : `<img src="${work.url}" alt="${work.title}">`;

        lightboxInfo.innerHTML = `<strong>${work.title}</strong><br><span style="color:#666">${work.category || ''}</span>`;

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        
        // Stop video if playing
        const video = lightboxContent.querySelector('video');
        if (video) {
            video.pause();
            video.remove();
        }
    }

    function navigateLightbox(dir) {
        const filtered = getFilteredWorks();
        const currentFilteredIndex = filtered.findIndex(w => w.id === works[currentWorkIndex]?.id);
        
        if (currentFilteredIndex === -1) return;
        
        let newIndex = currentFilteredIndex + dir;
        if (newIndex < 0) newIndex = filtered.length - 1;
        if (newIndex >= filtered.length) newIndex = 0;
        
        const actualIndex = works.findIndex(w => w.id === filtered[newIndex]?.id);
        if (actualIndex !== -1) {
            openLightbox(actualIndex);
        }
    }

    function getFilteredWorks() {
        const activeBtn = document.querySelector('.filter-btn.active');
        if (!activeBtn) return works;
        
        const filter = activeBtn.dataset.filter;
        if (filter === 'all') return works;
        return works.filter(w => w.type === filter);
    }

    // =========================================
    // KEYBOARD NAVIGATION
    // =========================================
    function handleKeyboard(e) {
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
        }
        if (fullscreenMenu && fullscreenMenu.classList.contains('active')) {
            if (e.key === 'Escape') closeMenu();
        }
    }

    // =========================================
    // SMOOTH SCROLL
    // =========================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                closeMenu();
                
                const target = document.querySelector(href);
                if (target) {
                    setTimeout(() => {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            });
        });
    }

    // =========================================
    // MAGNETIC HOVER (optional)
    // =========================================
    function initMagneticHover() {
        const items = document.querySelectorAll('.menu-item, .contact-email, .btn');
        
        items.forEach(item => {
            item.addEventListener('mousemove', (e) => {
                const rect = item.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                item.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = '';
            });
        });
    }

    // =========================================
    // INIT
    // =========================================
    function init() {
        // Prevent scroll during loader
        document.body.style.overflow = 'hidden';

        // Start loader
        initLoader();

        // Scroll events
        window.addEventListener('scroll', updateScrollProgress, { passive: true });

        // Menu
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleMenu);
        }
        
        // Menu links
        document.querySelectorAll('[data-menu]').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Load works
        loadWorks();

        // Filter
        initFilter();

        // Lightbox
        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightboxPrev) lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
        if (lightboxNext) lightboxNext.addEventListener('click', () => navigateLightbox(1));
        
        // Click outside lightbox content
        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) closeLightbox();
            });
        }

        // Keyboard
        document.addEventListener('keydown', handleKeyboard);

        // Smooth scroll
        initSmoothScroll();

        // Magnetic hover (subtle effect)
        initMagneticHover();

        // Header scroll effect
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            if (header) {
                if (currentScroll > lastScroll && currentScroll > 100) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = '';
                }
            }
            lastScroll = currentScroll;
        }, { passive: true });
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
