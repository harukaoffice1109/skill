# Skill 推荐网

一个面向中文用户的 Agent Skills 精选目录，收录公开榜单、社区项目和 GitHub 原始文档，并提供搜索、分类筛选、专题合集、中文推荐理由及安装命令。

## 本地运行

需要 Node.js 22.13 或更高版本。

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## 构建

```bash
npm run build
```

## 部署到 Cloudflare Workers

该项目已经包含 Cloudflare Workers 配置。在 Cloudflare 控制台连接本 GitHub 仓库后使用：

- Production branch：`main`
- Build command：`npm run build`
- Deploy command：`npm run deploy:cf`
- Node.js version：`22`

也可以在本地登录 Cloudflare 后运行：

```bash
npm run deploy
```

## 内容维护

- 网站页面与交互：`app/`
- Skill 数据：`public/data/skills.json`
- 网站图标：`public/favicon.svg`
- 社交分享封面：`public/og.png`

数据来源于公开页面与 GitHub 原始文档；公开指标会随来源网站变化。
