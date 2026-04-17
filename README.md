# 作品集 Portfolio

一个精美的个人作品集网站，支持图片/视频上传，完全私密，通过 GitHub 管理。

## 功能特性

- 🎨 现代感设计：深色主题、渐变色彩、流畅动效
- 📷 图片 + 🎬 视频支持
- ⚡ 滚动动画、鼠标跟随、灯箱查看
- 🔒 完全私密：GitHub 私有仓库 + Vercel 私密部署
- 📱 完美适配手机和电脑
- 🔧 管理后台：上传、删除作品，无需改代码

## 部署步骤

### 第一步：创建 GitHub 仓库

1. 打开 [github.com/new](https://github.com/new)
2. Repository name: `portfolio`（或你喜欢的名字）
3. 选择 **Private**（私有）
4. 不要勾选任何初始化选项
5. 点击 Create repository

### 第二步：推送代码到仓库

打开终端，进入 `portfolio-project` 文件夹，执行：

```bash
cd portfolio-project
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/portfolio.git
git push -u origin main
```

> 注意：把 `你的用户名` 换成你的 GitHub 用户名

### 第三步：启用 GitHub Pages

1. 在 GitHub 仓库页面，点击 **Settings**
2. 左侧菜单找到 **Pages**
3. Source 选择：**Deploy from a branch** → **main** → **/ (root)**
4. 点击 Save
5. 等 1-2 分钟，你的网站就会上线！

### 第四步：私密分享链接

部署完成后访问：
- 作品展示页：`https://你的用户名.github.io/portfolio/`
- 管理后台：`https://你的用户名.github.io/portfolio/admin.html`

把这个链接发给别人，他们就能看到你的作品集了。

> 注意：如果你想更私密，可以使用 **Vercel** 部署（步骤见下方）

---

## 使用管理后台上传作品

### 1. 生成 GitHub Token

1. 打开：https://github.com/settings/tokens
2. 点击 **Generate new token (classic)**
3. 设置名称（随便填）
4. Expiration 选择 **No expiration**
5. 勾选 **repo**（Full control of private repositories）
6. 点击 Generate
7. 复制生成的 Token（以 `ghp_` 开头）

### 2. 配置管理后台

1. 打开 `admin.html` 页面
2. 点击顶部的 **设置** 标签
3. 填入：
   - GitHub 用户名
   - 仓库名称（portfolio）
   - GitHub Token（刚才生成的）
4. 点击 **保存配置**

### 3. 上传作品

1. 点击 **上传作品** 标签
2. 选择图片或视频文件
3. 填写标题、描述、分类
4. 点击 **上传并发布**
5. 作品会自动更新到作品集页面！

---

## Vercel 私密部署（可选，推荐）

如果不想让别人通过 GitHub Pages 访问，可以用 Vercel 部署：

### 步骤：

1. 注册 [vercel.com](https://vercel.com)（用 GitHub 登录）
2. 点击 **Add New** → **Project**
3. Import 你的 `portfolio` 仓库
4. Framework Preset 选择 **Other**
5. Build Command 和 Output Directory 留空
6. 点击 Deploy
7. 部署完成后，Vercel 会给你一个 `.vercel.app` 的链接
8. 在 Vercel 项目的 Settings → Domains 可以自定义域名

**Vercel 的优势：**
- 默认私密，只有知道链接的人能访问
- 免费额度足够个人使用
- 自动 HTTPS
- 访问速度快

---

## 目录结构

```
portfolio-project/
├── public/
│   ├── index.html        ← 作品展示页面
│   ├── admin.html        ← 管理后台上传页面
│   ├── css/
│   │   └── style.css     ← 样式文件
│   ├── js/
│   │   ├── main.js       ← 展示页逻辑
│   │   └── admin.js      ← 管理后台逻辑
│   └── data/
│       └── works.json    ← 作品数据文件
└── README.md             ← 本文件
```

## 常见问题

### Q: 上传失败怎么办？
检查：
1. GitHub Token 是否正确
2. 仓库是否存在
3. Token 是否有 `repo` 权限

### Q: 图片/视频加载不出来？
GitHub 的 raw.githubusercontent.com 在国内访问可能较慢，可以考虑：
- 上传到 CDN（图床）
- 使用 Vercel 部署
- 使用腾讯云 COS 存储

### Q: 想自定义样式？
修改 `public/css/style.css` 中的 CSS 变量：
```css
:root {
    --accent: #c8ff00;     /* 主色调，修改这个可以改变整站颜色 */
    --dark: #0a0a0b;       /* 背景色 */
}
```

### Q: 想修改个人信息？
编辑 `public/index.html` 中的：
- 名字/标题
- 介绍文字
- 联系方式
- 社交链接

---

## 技术栈

- 纯 HTML/CSS/JS，无框架依赖
- Google Fonts（Space Grotesk + Noto Sans SC）
- GitHub API（文件存储）
- Intersection Observer（滚动动画）

---

祝你使用愉快！有问题随时找我。
