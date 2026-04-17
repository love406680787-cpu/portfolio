
/* =========================================
   Folder Gallery JS - 文件夹作品展示逻辑
   ========================================= */

(function() {
    'use strict';

    const DATA_URL = '../data/works.json';
    const PLACEHOLDER_EMOJIS = ['\uD83C\uDFA8', '\u2708\uFE0F', '\uD83D\uDDBC\uFE0F', '\uD83D\uDDCF', '\uD83C\uDFA5', '\uD83D\uDCA1', '\u2728', '\uD83D\uDE80', '\uD83C\uDFAF', '\uD83D\uDD2E'];

    // 分类配置
    const CATEGORIES = [
        { key: 'all', name: 'All Works', icon: '\uD83D\uDCC2' },
        { key: 'image', name: 'Images', icon: '\uD83D\uDDBC\uFE0F' },
        { key: 'video', name: 'Videos', icon: '\uD83C\uDFA5' }
    ];

    let allWorks = [];
    let lightboxIndex = 0;
    let currentLightboxWorks = [];

    // =========================================
    // Load Works & Render Folders
    // =========================================
    function loadWorks() {
        fetch(DATA_URL)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                allWorks = data ? (data.works || []) : [];
                document.getElementById('workCount').textContent = allWorks.length;
                renderFolders();
                if (allWorks.length === 0) {
                    document.getElementById('folderGrid').style.display = 'none';
                    document.getElementById('worksEmpty').style.display = 'block';
                } else {
                    document.getElementById('folderGrid').style.display = 'grid';
                    document.getElementById('worksEmpty').style.display = 'none';
                }
            })
            .catch(() => {
                document.getElementById('folderGrid').style.display = 'none';
                document.getElementById('worksEmpty').style.display = 'block';
            });
    }

    function renderFolders() {
        const grid = document.getElementById('folderGrid');
        grid.innerHTML = '';

        CATEGORIES.forEach((cat, catIdx) => {
            let worksInCat = cat.key === 'all'
                ? [...allWorks]
                : allWorks.filter(w => w.type === cat.key);

            if (cat.key !== 'all' && worksInCat.length === 0) return;

            const folder = document.createElement('div');
            folder.className = 'folder';
            folder.dataset.category = cat.key;

            // 构建作品缩略图列表（最多显示4个）
            let itemsHTML = '';
            const displayWorks = worksInCat.slice(0, 4);
            displayWorks.forEach((work, i) => {
                const emoji = PLACEHOLDER_EMOJIS[i % PLACEHOLDER_EMOJIS.length];
                let thumbContent = '';
                if (work.url) {
                    if (work.type === 'video') {
                        thumbContent = `<video src="${work.url}" muted loop preload="metadata"></video>
                            <div class="folder-item-video"></div>`;
                    } else {
                        thumbContent = `<img src="${work.url}" alt="${work.title}" loading="lazy">`;
                    }
                } else {
                    thumbContent = `<span class="folder-item-placeholder">${emoji}</span>`;
                }

                itemsHTML += `
                    <div class="folder-item" data-work-index="${allWorks.indexOf(work)}" data-category-filter="${cat.key}">
                        ${thumbContent}
                        <span class="folder-item-title">${work.title || 'Untitled'}</span>
                    </div>`;
            });

            folder.innerHTML = `
                <div class="folder-tab"></div>
                <div class="folder-body">
                    <div class="folder-inner">
                        <span class="folder-icon">${cat.icon}</span>
                        <span class="folder-name">${cat.name}</span>
                        <span class="folder-count">${worksInCat.length} items</span>
                    </div>
                    <div class="folder-contents">
                        <div class="folder-items">
                            ${itemsHTML}
                        </div>
                        ${worksInCat.length > 4 ? `<div class="folder-more">+${worksInCat.length - 4} more</div>` : ''}
                    </div>
                </div>`;

            // 移动端点击展开/收起
            folder.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    if (e.target.closest('.folder-item')) return; // 点击作品项不切换文件夹
                    folder.classList.toggle('open');
                }
            });

            grid.appendChild(folder);

            // 入场动画
            setTimeout(() => {
                folder.style.opacity = '0';
                folder.style.transform = 'translateY(40px)';
                folder.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
                requestAnimationFrame(() => {
                    folder.style.opacity = '1';
                    folder.style.transform = 'translateY(0)';
                });
            }, catIdx * 120);
        });

        // 绑定文件夹内作品项的点击事件
        bindFolderItemEvents();

        // 触发 scroll observer
        observeFolders();
    }

    function bindFolderItemEvents() {
        document.querySelectorAll('.folder-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const workIndex = parseInt(item.dataset.workIndex);
                const filterKey = item.dataset.categoryFilter;

                let worksToShow = filterKey === 'all'
                    ? [...allWorks]
                    : allWorks.filter(w => w.type === filterKey);

                currentLightboxWorks = worksToShow;
                // 找到该作品在过滤后列表中的索引
                const targetWork = allWorks[workIndex];
                lightboxIndex = worksToShow.indexOf(targetWork);
                if (lightboxIndex === -1) lightboxIndex = 0;

                openLightbox(worksToShow, lightboxIndex);
            });

            // 视频预览
            const video = item.querySelector('video');
            if (video) {
                item.addEventListener('mouseenter', () => video.play());
                item.addEventListener('mouseleave', () => video.pause());
            }
        });
    }

    // =========================================
    // Scroll Observer for Folders
    // =========================================
    function observeFolders() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        document.querySelectorAll('.folder').forEach(el => observer.observe(el));
    }

    // =========================================
    // Lightbox (复用原有逻辑)
    // =========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxContent = document.getElementById('lightboxContent');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    function openLightbox(works, index) {
        if (!works[index]) return;
        lightboxIndex = index;
        currentLightboxWorks = works;
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
                    <video src="${work.url}" controls autoplay style="max-width:90vw;max-height:85vh;border-radius:12px;box-shadow:0 40px 80px rgba(0,0,0,0.6);"></video>`;
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
        lightboxIndex = (lightboxIndex + dir + currentLightboxWorks.length) % currentLightboxWorks.length;
        showLightboxItem(currentLightboxWorks[lightboxIndex]);
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

})();
