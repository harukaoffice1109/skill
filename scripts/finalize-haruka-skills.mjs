import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataPath = path.join(root, "public/data/skills.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const renames = {
  asr: "media-asr-transcriber",
  "content-parser": "media-content-parser",
  creator: "media-content-creator",
  explainer: "explainer-video-planner",
  listenhub: "listenhub-workflow-router",
  music: "ai-music-workflow",
  podcast: "podcast-production-studio",
  tts: "voiceover-tts-workflow",
  "video-gen": "ai-video-workflow",
  jotai: "json-render-jotai",
  react: "json-render-react",
  wxt: "wxt-extension-builder",
  "webext-core": "browser-extension-core",
  "image-gen": "image-generation-workflow",
  slides: "presentation-studio",
  defuddle: "clean-web-reader",
  "create-pr": "pull-request-creator",
  "prepare-pr": "pull-request-preflight",
  "migration-scripts": "safe-migration-author"
};

const summaryOverrides = {
  "goal-brief-builder": "把模糊或复杂的 Agent 任务整理成目标、范围、约束、证据和完成标准清晰的执行简报。",
  "haruka-skill-index": "维护 Haruka Skills 的分类索引、用途说明、安装入口和版本状态。",
  "skill-release-manager": "检查并发布 Agent Skill，覆盖目录规范、说明、安装命令、版本记录和发布验证。",
  "markdown-blog-publisher": "把 Markdown、文本或网页材料整理成可发布的博客内容包，处理元数据、图片、草稿状态和发布前检查。",
  "prompt-library-curator": "整理、检索、改写和组合提示词，建立用途、变量、示例与版本清楚的 Prompt 库。",
  "website-delivery-workflow": "规范网站从需求、实现、验证到 GitHub 与托管平台发布的完整交付流程。",
  "multi-agent-session-launcher": "规划多种编码 Agent 的本机会话启动方式，统一权限、目录、日志和安全边界。",
  "music-release-planner": "把歌曲整理为可发布的音乐内容包，处理音频、封面、元数据、版权和发布检查。",
  "ai-signal-radar": "从公开的 AI、技术和创作信息源建立可追溯的信息雷达，筛选值得研究或创作的主题。",
  "guided-reading-companion": "把电子书或长文按章节整理为共读材料，跟踪重点、评论和阶段性理解。",
  "product-design-critic": "用产品目标、信息层级、可用性、一致性和视觉克制审查设计，并给出可执行修改。",
  "editorial-poster-studio": "从主题、文案和使用场景建立海报、书封或专辑封面的编辑视觉方案并完成可检查产物。",
  "social-cover-studio": "为公众号、社交平台或专题内容设计多方向横向封面，保证标题可读与裁切安全。",
  "ebook-source-locator": "在合法可访问的公开目录、图书馆或用户提供来源中定位电子书，并核对版本与文件信息。",
  "wechat-multi": "评估并规划 macOS 上多个微信工作环境，优先采用官方、隔离且可恢复的方式。",
  "mac-storage-auditor": "诊断 Mac 磁盘占用，区分可清理缓存、用户文件和系统数据，并制定可恢复的清理方案。"
};

const renamedIds = new Map();
for (const skill of data.skills.filter((item) => item.collection === "haruka")) {
  const oldName = skill.name;
  const newName = renames[oldName] || oldName;
  if (newName !== oldName) {
    renamedIds.set(skill.id, `haruka:${newName}`);
    const oldDir = path.join(root, "skills", oldName);
    const newDir = path.join(root, "skills", newName);
    if (fs.existsSync(oldDir) && !fs.existsSync(newDir)) fs.renameSync(oldDir, newDir);
  }
  skill.name = newName;
  skill.skillId = newName;
  skill.id = `haruka:${newName}`;
  skill.installCommand = `npx skills add https://github.com/harukaoffice1109/skill --skill ${newName}`;
  skill.githubUrl = `https://github.com/harukaoffice1109/skill/blob/main/skills/${newName}/SKILL.md`;
  skill.githubRawUrl = `https://raw.githubusercontent.com/harukaoffice1109/skill/main/skills/${newName}/SKILL.md`;
  skill.sourceSkillPath = `skills/${newName}/SKILL.md`;
  if (summaryOverrides[newName]) {
    skill.description = summaryOverrides[newName];
    skill.summaryZh = summaryOverrides[newName];
    skill.cardValueZh = summaryOverrides[newName];
    skill.sourceExcerpt = summaryOverrides[newName];
  }
}
data.trending = (data.trending || []).map((item) => ({ ...item, skillId: renamedIds.get(item.skillId) || item.skillId }));
data.collections = (data.collections || []).map((collection) => ({
  ...collection,
  skillIds: (collection.skillIds || []).map((id) => renamedIds.get(id) || id)
}));
const skills = data.skills.filter((skill) => skill.collection === "haruka");

const categoryProfiles = {
  "haruka-agent": {
    label: "Agent 工作流",
    inputs: ["目标、受众和最终交付物", "现有材料、工具权限和不能越过的边界", "成功标准、时间限制与需要保留的证据"],
    workflow: ["把请求改写为结果、范围、约束和验收标准，不把任务拆解误当成最终产物", "识别能够并行的研究、执行和审查工作，并明确每一步的责任与依赖", "先建立最小可行路径，再完成主体交付物并记录关键决策", "让独立审查覆盖事实、逻辑、完整性和可执行性，修正后再交付"],
    outputs: ["可直接执行的任务说明或工作流", "完成的主体产物，而不只是建议", "验证结果、限制和下一步"],
    checks: ["所有子任务都能追溯到用户目标", "结论与证据、假设与事实清楚分开", "交付物可以被下一位协作者直接继续使用"]
  },
  "haruka-dev": {
    label: "开发工程",
    inputs: ["仓库、文件、报错、目标行为或可复现步骤", "运行环境、版本、部署平台和项目约定", "允许修改的范围以及必须保持不变的接口"],
    workflow: ["先读取项目约定、目录结构和当前变更，避免覆盖用户已有工作", "复现问题或建立当前基线，用代码和运行结果定位原因", "实施范围最小但完整的修改，同时处理相关边界、错误状态和兼容性", "运行与风险相称的静态检查、测试、构建或真实交互验证", "复查差异，确认没有秘密信息、临时文件和无关改动"],
    outputs: ["可审阅的代码或配置变更", "测试、构建或复现证据", "风险、兼容性与部署说明"],
    checks: ["修改解决根因并保持既有行为", "命令、路径、版本和配置可在目标环境使用", "失败路径与回滚方式已考虑"]
  },
  "haruka-content": {
    label: "内容创作",
    inputs: ["主题、核心观点与必须保留的事实", "目标读者、发布平台、篇幅和语气", "参考材料、品牌词、禁用表达与行动目标"],
    workflow: ["提炼读者问题、传播目标和内容承诺，列出需要核实的事实", "按平台选择结构、节奏与开头，先搭建清晰大纲", "完成第一版，确保每段都推进观点、叙事或行动", "对照来源做事实校对，再进行删减、语言统一和标题优化", "按发布媒介整理正文、摘要、标题、标签与素材建议"],
    outputs: ["可直接编辑或发布的正文", "标题、摘要和结构化发布素材", "来源、待确认项与改写说明"],
    checks: ["事实不因追求传播效果而失真", "语言自然具体，没有模板腔和无意义重复", "格式、长度和行动指引符合目标平台"]
  },
  "haruka-visual": {
    label: "设计视觉",
    inputs: ["使用场景、画布尺寸和输出格式", "品牌、文案、数据、参考图与必须使用的素材", "视觉方向、可访问性和设备适配要求"],
    workflow: ["先建立信息层级和阅读路径，再选择能够服务内容的视觉语言", "明确网格、字体、色彩、留白和组件规则，避免无目的装饰", "制作可编辑源文件或实现，并为关键状态准备真实内容", "渲染或截图检查构图、对齐、溢出、对比度和小尺寸可读性", "根据视觉检查结果迭代，导出目标尺寸与格式"],
    outputs: ["可编辑的设计或实现文件", "最终渲染图、页面或演示产物", "尺寸、字体、色彩和使用说明"],
    checks: ["信息层级在第一眼清楚可辨", "文案、数据和素材没有裁切或错误", "桌面、移动端或目标画布上的呈现已实际检查"]
  },
  "haruka-media": {
    label: "音视频",
    inputs: ["主题、平台、时长、比例与受众", "脚本、音频、视频、字幕、音乐和授权信息", "画质、声音、编码、文件体积与交付规格"],
    workflow: ["盘点素材、版权和技术参数，标记缺失与不可用内容", "先完成脚本、分镜、节奏或声音结构，再进入生成与剪辑", "保留源素材和中间产物，用可复现参数完成制作", "试听或逐段观看，检查同步、字幕、响度、画面连续性与平台安全区", "按目标平台导出并核对时长、编码、尺寸和文件完整性"],
    outputs: ["主成片、音频或可执行制作方案", "字幕、封面、标题和发布元数据", "素材清单、参数与授权提醒"],
    checks: ["声音清楚、画面连续、字幕同步且无明显技术瑕疵", "导出规格匹配目标平台", "来源和版权状态明确，不绕过访问控制"]
  },
  "haruka-research": {
    label: "阅读研究",
    inputs: ["研究问题、用途和期望深度", "来源范围、时间范围、语言与引用格式", "已有材料以及不能访问或不能使用的来源"],
    workflow: ["把问题拆成可验证子问题，先定义证据标准和检索边界", "优先获取原始、权威或最接近事实的来源，并记录出处", "提取与问题直接相关的论点、数据、方法和限制", "交叉核对冲突信息，区分来源陈述、分析推断和未知项", "围绕决策或理解目标综合结论，给出可追溯引用"],
    outputs: ["结构化摘要或研究报告", "来源清单与关键证据", "分歧、限制、未知项和后续研究建议"],
    checks: ["每个关键结论都有相邻证据支持", "没有用二手摘要替代可获得的原始来源", "引用能够回到具体页面、章节或文件"]
  },
  "haruka-productivity": {
    label: "效率工具",
    inputs: ["当前状态、期望结果和使用环境", "涉及的账号、设备、文件与权限边界", "风险承受程度、备份状态和可逆要求"],
    workflow: ["先盘点现状并区分诊断、建议与真正需要执行的动作", "按影响和风险排序，优先选择可逆、可验证的方案", "分阶段执行，每一步记录结果并在关键外部动作前确认", "对照目标复核效果，避免只看过程指标", "整理可复用清单、维护节奏和恢复方式"],
    outputs: ["完成的配置、文档或决策产物", "执行记录与验证结果", "维护清单、隐私说明和恢复路径"],
    checks: ["没有未经确认的删除、发送、发布或权限变更", "敏感信息未写入日志或交付物", "用户能够理解并复现关键步骤"]
  }
};

function clean(value = "") {
  return String(value)
    .replace(/\s+/g, " ")
    .replace(/codex\s+--dangerously-bypass-approvals-and-sandbox/gi, "为编码 Agent 设置明确、受控的权限配置")
    .replace(/claude\s+--dangerously-skip-permissions/gi, "为编码 Agent 设置明确、受控的权限配置")
    .replace(/OpenAI Codex/gi, "编码 Agent")
    .replace(/Claude Code/gi, "编码 Agent")
    .replace(/\bCodex\b/gi, "编码 Agent")
    .replace(/\bClaude\b/gi, "编码 Agent")
    .replace(/Haruka自用/g, "Haruka Lab")
    .replace(/固定Haruka/g, "规范化")
    .replace(/Haruka网站/g, "网站")
    .replace(/Haruka GitHub/g, "GitHub")
    .replace(/Haruka写作风格/g, "清晰、自然、有证据意识的中文表达")
    .replace(/Haruka表达风格/g, "清晰、自然、有证据意识的中文表达")
    .replace(/Haruka共读助手/g, "共读助手")
    .replace(/Haruka精选/g, "精选")
    .replace(/Haruka音乐/g, "音乐")
    .replace(/\s+。/g, "。")
    .trim();
}

function sentence(value) {
  const text = clean(value).replace(/[。；，、]+$/g, "");
  return text ? `${text}。` : "完成该领域的专业工作流并交付可验证结果。";
}

function titleCase(name) {
  const small = new Set(["ai", "asr", "cli", "epub", "gif", "github", "html", "mv", "prd", "seo", "tts", "ui", "url", "web", "x", "youtube"]);
  return name.split("-").map((part) => small.has(part) ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function specialRules(skill) {
  const name = skill.name;
  const rules = [];
  if (/publish|release|github|blog|article-publisher/.test(name)) rules.push("发布、推送或创建远程内容前，展示最终预览、目标位置与可见范围并获得确认。");
  if (/download|cleaner|storage|wechat-multi/.test(name)) rules.push("不绕过访问控制、平台限制或版权保护；删除和系统级修改必须可恢复并先确认。");
  if (/browser|opencli|endpoint|controller|cli|lark|spotify|netease/.test(name)) rules.push("先检查工具是否可用、账号是否已授权；不声称执行了没有实际验证的外部动作。");
  if (/writer|fiction|drama|headline|cover|poster|image|music|video|podcast|tts|asr|slides/.test(name)) rules.push("尊重原始素材版权和人物授权；事实型内容不得为了风格或戏剧性而编造。");
  if (/resume/.test(name)) rules.push("简历只使用用户提供或确认的经历，不虚构成绩、职位、项目和联系方式。");
  if (/research|paper|search|radar|review|notebook|reading|extractor|defuddle/.test(name)) rules.push("关键事实保留可追溯来源，时效性信息在交付中标明检索日期。");
  return rules;
}

function list(items) {
  return items.map((item) => `- ${sentence(item)}`).join("\n");
}

function numbered(items) {
  return items.map((item, index) => `${index + 1}. ${sentence(item)}`).join("\n");
}

function bodyFor(skill) {
  const profile = categoryProfiles[skill.categorySlug];
  const summary = sentence(skill.cardValueZh || skill.description || skill.summaryZh);
  const useCases = (skill.bestFor || []).map(clean).filter(Boolean).slice(0, 4);
  const trigger = useCases.length ? useCases.join("、") : summary.replace(/。$/, "");
  const description = `${summary}当用户需要${trigger}时使用；应交付实际结果并完成${profile.label}验收。`;
  const rules = specialRules(skill);
  const checks = profile.checks;

  return `---\nname: ${skill.name}\ndescription: ${JSON.stringify(description)}\n---\n\n# ${titleCase(skill.name)}\n\n## 使命\n\n${summary}\n\n本 Skill 属于 Haruka Lab 的「${profile.label}」流程。它应在当前环境中完成工作并留下可验证产物；如果缺少工具或权限，要明确说明可完成的部分与阻塞点。\n\n## 何时使用\n\n${list(useCases.length ? useCases : [skill.cardFitZh || summary])}\n\n## 需要的输入\n\n${list(profile.inputs)}\n\n只询问会实质改变方案的缺失信息。能够从文件、上下文或现有页面安全确认的内容，先自行核对。\n\n## 工作方法\n\n${numbered(profile.workflow)}\n\n## 交付物\n\n${list(profile.outputs)}\n\n## 边界与安全\n\n- 不虚构来源、数据、运行结果、文件、账号状态或外部操作。\n- 尊重用户指定的语言、品牌、格式、工具和修改范围。\n- 涉及发送、发布、购买、删除、权限或不可逆变更时，动作前确认。\n${rules.map((rule) => `- ${rule}`).join("\n")}${rules.length ? "\n" : ""}\n## 验收清单\n\n${list(checks)}\n- 交付物与最初目标一致，名称、链接、命令和文件路径可用。\n- 清楚标注未验证项、限制和最有价值的下一步。\n`;
}

for (const skill of skills) {
  const profile = categoryProfiles[skill.categorySlug];
  if (!profile) throw new Error(`Missing category profile for ${skill.name}`);
  const dir = path.join(root, "skills", skill.name);
  fs.mkdirSync(path.join(dir, "agents"), { recursive: true });
  fs.writeFileSync(path.join(dir, "SKILL.md"), bodyFor(skill));
  const baseUiDescription = sentence(skill.cardValueZh || skill.description);
  const uiDescription = (baseUiDescription.length < 25 ? `${baseUiDescription}由 Haruka Lab 维护。` : baseUiDescription).slice(0, 60);
  fs.writeFileSync(path.join(dir, "agents/openai.yaml"), `interface:\n  display_name: ${JSON.stringify(titleCase(skill.name))}\n  short_description: ${JSON.stringify(uiDescription)}\n  default_prompt: ${JSON.stringify(`Use $${skill.name} to complete this workflow and return a verified deliverable.`)}\n`);
}

const categoryCollections = Object.entries(categoryProfiles).map(([slug, profile]) => {
  const categorySkills = skills.filter((skill) => skill.categorySlug === slug);
  return {
    slug: `${slug}-collection`,
    name: profile.label,
    description: `Haruka Lab 的${profile.label}合集：${categorySkills.length} 个独立重写、集中维护、可直接安装的 Skill。`,
    source: "haruka",
    skillIds: categorySkills.map((skill) => skill.id)
  };
});

data.collections = [
  ...categoryCollections,
  ...data.collections.filter((collection) => !collection.slug.startsWith("haruka-") || !collection.slug.endsWith("-collection"))
];

for (const skill of skills) {
  skill.description = sentence(skill.cardValueZh || skill.description);
  skill.summaryZh = `「${skill.name}」是 Haruka Lab 独立重写并集中维护的可安装 Skill。${skill.description}`;
  skill.recommendationZh = `它把${categoryProfiles[skill.categorySlug].label}中的真实任务整理为明确输入、可执行步骤、具体交付物和验收清单；适合直接安装，也便于继续改造成你的工作流。`;
  skill.sourceLabel = "Haruka Lab";
  skill.source = `harukaoffice1109/skill · skills/${skill.name}`;
  skill.metricLabel = "Haruka Lab";
  skill.metricValue = null;
  skill.metricNote = "由 Haruka Lab 独立重写并集中维护";
  skill.updatedAt = "2026-08-13";
  delete skill.forks;
  skill.bestFor = (skill.bestFor || []).map(clean);
  skill.cardValueZh = skill.description;
  skill.cardFitZh = clean(skill.cardFitZh);
  skill.sourceExcerpt = skill.description;
  delete skill.highlightsZh;
}

data.meta.title = "Haruka Skills";
data.meta.totalCategories = data.categories.length;
data.meta.harukaSkills = skills.length;
data.meta.harukaAdaptationPolicy = "independently rewritten workflows maintained in one repository with permission from the original concept author";
data.meta.adaptedAt = "2026-08-13T00:00:00+08:00";

const manifest = skills.map((skill) => ({
  name: skill.name,
  category: skill.categoryName,
  summary: skill.description,
  path: `skills/${skill.name}/SKILL.md`,
  installCommand: skill.installCommand
}));

fs.writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`);
fs.writeFileSync(path.join(root, "skills/manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Finalized ${skills.length} Haruka Skills across ${categoryCollections.length} collections.`);
