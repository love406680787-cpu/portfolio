/**
 * Portfolio Admin JS
 * - GitHub API integration for file uploads
 * - Works management (CRUD via GitHub API)
 * - Configuration management (localStorage)
 */

(function() {
    'use strict';

    // =========================================
    // Config
    // =========================================
    const API_BASE = 'https://api.github.com';
    const WORKS_FILE = 'data/works.json';
    const DATA_BRANCH = 'main';

    // =========================================
    // State
    // =========================================
    let config = {
        username: '',
        repo: '',
        token: ''
    };
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

    function getConfig() {
        try {
            const saved = localStorage.getItem('portfolio_config');
            if (saved) {
                config = JSON.parse(saved);
                return true;
            }
        } catch (e) {}
        return false;
    }

    function saveConfig() {
        localStorage.setItem('portfolio_config', JSON.stringify(config));
    }

    function isConfigured() {
        return !!(config.username && config.repo && config.token);
    }

    function updateConfigStatus() {
        const status = $('#configStatus');
        const text = $('#configStatusText');
        if (isConfigured()) {
            status.className = 'config-status configured';
            text.textContent = '已配置';
        } else {
            status.className = 'config-status not-configured';
            text.textContent = '未配置';
        }
    }

    // =========================================
    // GitHub API
    // =========================================
    async function githubRequest(method, path, body = null) {
        const url = `${API_BASE}${path}`;
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${config.token}`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            }
        };
        if (body) {
            options.body = JSON.stringify(body);
            options.headers['Content-Type'] = 'application/json';
        }
        const res = await fetch(url, options);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `HTTP ${res.status}`);
        }
        if (res.status === 204) return null;
        return res.json();
    }

    async function getFile(path, branch = DATA_BRANCH) {
        try {
            return await githubRequest('GET', `/repos/${config.username}/${config.repo}/contents/${path}?ref=${branch}`);
        } catch (e) {
            return null;
        }
    }

    async function saveFile(path, content, message, isBase64 = false, branch = DATA_BRANCH) {
        const existing = await getFile(path, branch);
        let sha = existing ? existing.sha : null;

        const body = {
            message,
            content: isBase64 ? content : btoa(unescape(encodeURIComponent(content))),
            branch
        };
        if (sha) body.sha = sha;

        return await githubRequest('PUT', `/repos/${config.username}/${config.repo}/contents/${path}`, body);
    }

    async function uploadFile(file, workData) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const base64 = e.target.result.split(',')[1];
                    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
                    const type = workData.type;
                    const folder = type === 'video' ? 'videos' : 'images';
                    const path = `${folder}/${filename}`;

                    await saveFile(path, base64, `Upload ${filename}`, true);

                    resolve({
                        // Use jsDelivr CDN - global CDN, fast, no CORS issues
                        // Repo name must be lowercase for jsDelivr
                        url: `https://cdn.jsdelivr.net/gh/${config.username.toLowerCase()}/${config.repo.toLowerCase()}@${DATA_BRANCH}/${path}`,
                        path,
                        filename
                    });
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('File read error'));
            reader.readAsDataURL(file);
        });
    }

    async function loadWorksFromGitHub() {
        try {
            const fileData = await getFile(WORKS_FILE);
            if (!fileData) return [];
            // Proper UTF-8 decode for Chinese characters
            const content = decodeURIComponent(escape(atob(fileData.content)));
            return JSON.parse(content).works || [];
        } catch (e) {
            return [];
        }
    }

    async function saveWorksToGitHub(works) {
        const content = JSON.stringify({ works, updated: new Date().toISOString() }, null, 2);
        await saveFile(WORKS_FILE, content, 'Update works.json');
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
                    loadWorksList();
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

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handleFile(file);
        });

        function handleFile(file) {
            // Max 100MB for GitHub
            if (file.size > 100 * 1024 * 1024) {
                showToast('文件大小不能超过 100MB', 'error');
                return;
            }

            const isVideo = file.type.startsWith('video/');
            currentFile = file;
            workType.value = isVideo ? 'video' : 'image';

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

        previewRemove.addEventListener('click', () => {
            currentFile = null;
            previewBox.classList.remove('has-file');
            previewImg.style.display = 'none';
            previewVideo.style.display = 'none';
            fileInput.value = '';
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!isConfigured()) {
                showToast('请先在「设置」中配置 GitHub 信息', 'error');
                $$('.tab-btn')[2].click();
                return;
            }

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
            submitText.textContent = '上传中...';
            submitBtn.disabled = true;

            try {
                const workData = {
                    type: workType.value,
                    title,
                    description: $('#workDesc').value.trim(),
                    category: $('#workCategory').value,
                    year: $('#workYear').value.trim() || new Date().getFullYear().toString()
                };

                const fileInfo = await uploadFile(currentFile, workData);

                works = await loadWorksFromGitHub();

                works.unshift({
                    id: Date.now().toString(),
                    title: workData.title,
                    description: workData.description,
                    type: workData.type,
                    category: workData.category,
                    year: workData.year,
                    url: fileInfo.url,
                    path: fileInfo.path,
                    filename: fileInfo.filename,
                    addedAt: new Date().toISOString()
                });

                await saveWorksToGitHub(works);

                currentFile = null;
                previewBox.classList.remove('has-file');
                previewImg.style.display = 'none';
                previewVideo.style.display = 'none';
                fileInput.value = '';
                form.reset();
                workType.value = 'image';

                showToast(`上传成功！作品「${title}」已发布`);
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
    async function loadWorksList() {
        const list = $('#worksList');

        if (!isConfigured()) {
            list.innerHTML = `<div class="empty-state"><div class="empty-icon">⚙️</div><p>请先在「设置」中配置 GitHub 信息</p></div>`;
            return;
        }

        try {
            works = await loadWorksFromGitHub();

            if (works.length === 0) {
                list.innerHTML = `<div class="empty-state"><div class="empty-icon">📂</div><p>还没有作品，去「上传作品」添加吧</p></div>`;
                return;
            }

            list.innerHTML = works.map((work, i) => `
                <div class="work-item" data-index="${i}">
                    <div class="work-item-thumb">
                        ${work.type === 'video'
                            ? `<video src="${work.url}" muted></video>`
                            : (work.url ? `<img src="${work.url}" alt="${work.title}" loading="lazy">` : `<span style="font-size:2rem;">🖼️</span>`)}
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
                        <a href="${work.url}" target="_blank" class="work-item-btn">预览</a>
                        <button class="work-item-btn delete" onclick="deleteWork(${i})">删除</button>
                    </div>
                </div>
            `).join('');

        } catch (err) {
            list.innerHTML = `<div class="empty-state"><p>加载失败：${err.message}</p></div>`;
        }
    }

    window.deleteWork = async function(index) {
        if (!confirm('确定要删除这个作品吗？')) return;

        try {
            const fileData = await getFile(WORKS_FILE);
            works.splice(index, 1);
            await saveWorksToGitHub(works);
            showToast('删除成功');
            loadWorksList();
        } catch (err) {
            showToast(`删除失败：${err.message}`, 'error');
        }
    };

    // =========================================
    // Config Form
    // =========================================
    function initConfig() {
        const form = $('#configForm');
        const usernameInput = $('#githubUsername');
        const repoInput = $('#githubRepo');
        const tokenInput = $('#githubToken');

        getConfig();
        usernameInput.value = config.username;
        repoInput.value = config.repo;
        tokenInput.value = config.token;
        updateConfigStatus();

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            config.username = usernameInput.value.trim();
            config.repo = repoInput.value.trim();
            config.token = tokenInput.value.trim();

            if (!config.username || !config.repo || !config.token) {
                showToast('请填写完整信息', 'error');
                return;
            }

            saveConfig();
            updateConfigStatus();
            showToast('配置已保存');

            try {
                const existing = await getFile(WORKS_FILE);
                if (!existing) {
                    await saveWorksToGitHub([]);
                    showToast('works.json 已创建，可以开始上传了！');
                }
            } catch (err) {
                showToast(`请确保仓库 ${config.username}/${config.repo} 已创建且有正确权限`, 'error');
            }
        });
    }

    // =========================================
    // Init
    // =========================================
    function init() {
        getConfig();
        updateConfigStatus();
        initTabs();
        initUpload();
        initConfig();

        if (!isConfigured()) {
            setTimeout(() => {
                showToast('首次使用请先在「设置」中配置 GitHub 信息', 'error');
            }, 1000);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
