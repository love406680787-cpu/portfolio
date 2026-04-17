/**
 * Portfolio Admin JS - Local Storage Version
 * Works data stored in localStorage (no GitHub API needed)
 * Export/Import JSON for backup
 */

(function() {
    'use strict';

    // =========================================
    // State
    // =========================================
    let currentFile = null;
    let works = [];

    // =========================================
    // DOM Elements
    // =========================================
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // =========================================
    // Utilities
    // =========================================
    function showToast(message, type = 'success') {
        const toast = $('#toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
    }

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // =========================================
    // Works Data (localStorage)
    // =========================================
    function loadWorks() {
        try {
            const saved = localStorage.getItem('portfolio_works');
            if (saved) {
                works = JSON.parse(saved);
            } else {
                works = [];
            }
        } catch (e) {
            works = [];
        }
        return works;
    }

    function saveWorks() {
        localStorage.setItem('portfolio_works', JSON.stringify(works));
    }

    // =========================================
    // Tabs
    // =========================================
    function initTabs() {
        $$('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.tab-btn').forEach(b => b.classList.remove('active'));
                $$('.tab-panel').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                $(`#tab-${btn.dataset.tab}`).classList.add('active');

                if (btn.dataset.tab === 'manage') {
                    renderWorksList();
                }
            });
        });
    }

    // =========================================
    // Upload
    // =========================================
    function initUpload() {
        const uploadArea = $('#uploadArea');
        const fileInput = $('#fileInput');
        const previewBox = $('#previewBox');
        const previewImg = $('#previewImg');
        const previewVideo = $('#previewVideo');
        const previewRemove = $('#previewRemove');
        const previewName = $('#previewName');
        const previewSize = $('#previewSize');
        const workType = $('#workType');
        const form = $('#uploadForm');

        // Drag & drop
        ['dragenter', 'dragover'].forEach(evt => {
            uploadArea.addEventListener(evt, (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
        });
        ['dragleave', 'drop'].forEach(evt => {
            uploadArea.addEventListener(evt, (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
            });
        });
        uploadArea.addEventListener('drop', (e) => {
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handleFile(file);
        });

        function handleFile(file) {
            // Max 5MB for localStorage (Base64 takes 33% more space)
            if (file.size > 5 * 1024 * 1024) {
                showToast('文件大小不能超过 5MB（本地存储限制）', 'error');
                return;
            }

            const isVideo = file.type.startsWith('video/');
            currentFile = file;
            workType.value = isVideo ? 'video' : 'image';

            // Show preview
            previewBox.classList.add('has-file');
            previewName.textContent = file.name;
            previewSize.textContent = formatSize(file.size);

            if (isVideo) {
                previewImg.style.display = 'none';
                previewVideo.style.display = 'block';
                previewVideo.src = URL.createObjectURL(file);
            } else {
                previewVideo.style.display = 'none';
                previewImg.style.display = 'block';
                previewImg.src = URL.createObjectURL(file);
            }
        }

        // Remove preview
        previewRemove.addEventListener('click', () => {
            currentFile = null;
            previewBox.classList.remove('has-file');
            previewImg.style.display = 'none';
            previewVideo.style.display = 'none';
            fileInput.value = '';
        });

        // Submit
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!currentFile) {
                showToast('请先选择文件', 'error');
                return;
            }

            const title = $('#workTitle').value.trim();
            if (!title) {
                showToast('请填写作品标题', 'error');
                return;
            }

            const submitBtn = $('#submitBtn');
            const submitText = $('#submitText');
            submitBtn.classList.add('loading');
            submitText.textContent = '处理中...';
            submitBtn.disabled = true;

            try {
                // Convert file to Base64
                const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(currentFile);
                });

                // Add to works
                const workData = {
                    id: Date.now().toString(),
                    type: workType.value,
                    title: title,
                    description: $('#workDesc').value.trim(),
                    category: $('#workCategory').value,
                    year: $('#workYear').value.trim() || new Date().getFullYear().toString(),
                    url: base64, // Store as Base64 data URL
                    addedAt: new Date().toISOString()
                };

                works.unshift(workData);
                saveWorks();

                // Reset form
                currentFile = null;
                previewBox.classList.remove('has-file');
                previewImg.style.display = 'none';
                previewVideo.style.display = 'none';
                fileInput.value = '';
                form.reset();
                workType.value = 'image';

                showToast(`上传成功！作品「${title}」已保存`);
            } catch (err) {
                console.error('Upload error:', err);
                showToast(`上传失败：${err.message}`, 'error');
            } finally {
                submitBtn.classList.remove('loading');
                submitText.textContent = '上传并发布';
                submitBtn.disabled = false;
            }
        });
    }

    // =========================================
    // Works Management
    // =========================================
    function renderWorksList() {
        const list = $('#worksList');
        loadWorks();

        if (works.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📂</div>
                    <p>还没有作品，去「上传作品」添加吧</p>
                </div>`;
            return;
        }

        list.innerHTML = works.map((work, i) => `
            <div class="work-item" data-index="${i}">
                <div class="work-item-thumb">
                    ${work.type === 'video'
                        ? `<video src="${work.url}" muted></video>`
                        : `<img src="${work.url}" alt="${work.title}" loading="lazy">`}
                </div>
                <div class="work-item-info">
                    <div class="work-item-title">${work.title}</div>
                    <div class="work-item-meta">
                        <span class="work-item-type">${work.type === 'video' ? '视频' : '图片'}</span>
                        <span>${work.category || ''}</span>
                        <span>${work.year || ''}</span>
                    </div>
                </div>
                <div class="work-item-actions">
                    <button class="work-item-btn delete" onclick="deleteWork(${i})">删除</button>
                </div>
            </div>
        `).join('');
    }

    window.deleteWork = function(index) {
        if (!confirm('确定要删除这个作品吗？')) return;
        works.splice(index, 1);
        saveWorks();
        renderWorksList();
        showToast('删除成功');
    };

    // =========================================
    // Export/Import
    // =========================================
    function initDataManagement() {
        const exportBtn = $('#exportBtn');
        const importBtn = $('#importBtn');
        const importInput = $('#importInput');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                loadWorks();
                const data = JSON.stringify({ works }, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `portfolio-works-${new Date().toISOString().slice(0,10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                showToast('导出成功');
            });
        }

        if (importBtn && importInput) {
            importBtn.addEventListener('click', () => importInput.click());
            importInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const data = JSON.parse(ev.target.result);
                        if (data.works && Array.isArray(data.works)) {
                            works = data.works;
                            saveWorks();
                            showToast(`导入成功，共 ${works.length} 个作品`);
                        } else {
                            showToast('文件格式不正确', 'error');
                        }
                    } catch (err) {
                        showToast('解析失败：' + err.message, 'error');
                    }
                };
                reader.readAsText(file);
            });
        }
    }

    // =========================================
    // Init
    // =========================================
    function init() {
        loadWorks();
        initTabs();
        initUpload();
        initDataManagement();
        
        // Show count in header
        const count = works.length;
        const headerCount = document.getElementById('headerWorkCount');
        if (headerCount) {
            headerCount.textContent = `(${count}个作品)`;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
