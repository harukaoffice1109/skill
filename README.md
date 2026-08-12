# Haruka Skills

一个面向中文用户的 Agent Skill 目录，也是 Haruka Lab 自有工作流的统一仓库。

- 94 个由 Haruka Lab 独立重写并集中维护的 Skill
- 7 个自有专业分类：Agent、开发、内容、视觉、音视频、研究、效率
- 239 个社区精选条目，保留来源和安装入口
- 搜索、分类、来源筛选、专题合集和独立详情页

## 安装 Haruka Skill

浏览 `skills/` 目录或网站详情页，复制对应安装命令：

```bash
npx skills add https://github.com/harukaoffice1109/skill --skill goal-brief-builder
```

每个 Skill 都包含：

- `SKILL.md`：触发说明、输入、分类专属工作方法、交付物、安全边界与验收清单
- `agents/openai.yaml`：显示名称、简介与默认调用提示

完整索引见 `skills/manifest.json`。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

静态产物生成到 `dist/`。

## Cloudflare Pages

连接本 GitHub 仓库后使用：

- Framework preset：`Vite`
- Production branch：`main`
- Build command：`npm run build`
- Build output directory：`dist`
- Root directory：留空
- Node.js version：`22`

`public/_redirects` 已处理 Skill 详情与专题页面的深层链接刷新。

## 维护入口

- 页面与交互：`src/App.tsx`
- 样式：`src/styles.css`
- 目录数据：`public/data/skills.json`
- 自有 Skill：`skills/`
- Skill 清单：`skills/manifest.json`
- 分享封面：`public/og.png`

## 内容说明

Haruka Lab 条目基于早期公开工作流概念，经原概念作者许可后独立重写，并由本仓库持续维护。社区精选条目的著作权、商标与许可归各自作者和项目所有；安装或使用前请阅读对应来源说明。
