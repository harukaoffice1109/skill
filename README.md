# Skill 推荐网

一个面向中文用户的 Agent Skills 精选目录，提供搜索、分类筛选、专题合集、中文推荐理由和安装命令。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

静态产物会生成到 `dist/`。

## Cloudflare Pages 设置

在 Pages 项目中连接本 GitHub 仓库，使用以下设置：

- Framework preset：`Vite`
- Production branch：`main`
- Build command：`npm run build`
- Build output directory：`dist`
- Root directory：留空
- Node.js version：`22`

项目包含 `public/_redirects`，Skill 详情和专题页面的深层链接可以直接刷新。

## 内容维护

- 页面与交互：`src/App.tsx`
- 样式：`src/styles.css`
- Skill 数据：`public/data/skills.json`
- 网站图标：`public/favicon.svg`
- 分享封面：`public/og.png`
