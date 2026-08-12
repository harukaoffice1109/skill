import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, BookOpen, Check, ChevronLeft, Command, Copy, Github, Moon, Search, Sparkles, Star, Sun, TrendingUp, X } from "./icons";

type Skill = {
  id: string;
  name: string;
  collection: string;
  source: string;
  categorySlug: string;
  categoryName: string;
  rank?: number;
  metricValue?: number | null;
  metricLabel?: string;
  summaryZh?: string;
  cardValueZh?: string;
  recommendationZh?: string;
  installCommand?: string;
  githubUrl?: string;
  tags?: string[];
  bestFor?: string[];
};
type Category = { slug: string; name: string; description?: string; availableCount?: number };
type Collection = { slug: string; name: string; description?: string; source?: string; skillIds?: string[] };
type Dataset = { skills: Skill[]; categories: Category[]; collections?: Collection[]; trending?: { skillId: string; reason?: string }[] };
type Route = { view: "directory" | "skill" | "collection"; id?: string };

const sourceLabels: Record<string, string> = { all: "全部", haruka: "Haruka Lab", install: "安装榜", community: "社区精选" };
const GITHUB_REPO = "https://github.com/harukaoffice1109/skill";
const metric = (value?: number | null) => !value ? "—" : value >= 1e6 ? `${(value / 1e6).toFixed(1)}m` : value >= 1e3 ? `${(value / 1e3).toFixed(value > 1e4 ? 0 : 1)}k` : String(value);
const parseRoute = (): Route => {
  const path = decodeURIComponent(location.pathname);
  if (path.startsWith("/skills/")) return { view: "skill", id: path.slice(8).replace(/\/$/, "") };
  if (path.startsWith("/collections/")) return { view: "collection", id: path.slice(13).replace(/\/$/, "") };
  return { view: "directory" };
};
const hrefFor = (route: Route) => route.view === "skill" ? `/skills/${encodeURIComponent(route.id || "")}/` : route.view === "collection" ? `/collections/${encodeURIComponent(route.id || "")}/` : "/";

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><span>H</span><i /></span>;
}

function SkillCard({ skill, onOpen }: { skill: Skill; onOpen: (skill: Skill) => void }) {
  const isHaruka = skill.collection === "haruka";
  return <article className={`skill-card${isHaruka ? " is-haruka" : ""}`}>
    <button className="card-main" onClick={() => onOpen(skill)} aria-label={`查看 ${skill.name}`}>
      <div className="card-topline">
        <span className={`source-badge source-${skill.collection}`}>{sourceLabels[skill.collection] || skill.collection}</span>
        <span className="rank">{isHaruka ? <><Sparkles size={13} /> OWNED</> : <><TrendingUp size={14} /> #{skill.rank || "—"}</>}</span>
      </div>
      <div><h3>{skill.name}</h3><p className="byline">{skill.source || "Open source"}</p></div>
      <p className="description">{skill.cardValueZh || skill.summaryZh || "查看用途、推荐理由和安装方式。"}</p>
    </button>
    <div className="card-footer"><span>{skill.categoryName}</span><strong>{isHaruka ? "可直接安装" : <><Star size={14} /> {metric(skill.metricValue)}</>}</strong></div>
  </article>;
}

export default function App() {
  const [data, setData] = useState<Dataset | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(() => typeof window === "undefined" ? "all" : new URLSearchParams(location.search).get("category") || "all");
  const [source, setSource] = useState("all");
  const [sort, setSort] = useState("rank");
  const [route, setRoute] = useState<Route>(() => typeof window === "undefined" ? { view: "directory" } : parseRoute());
  const [dark, setDark] = useState(() => typeof window !== "undefined" && (localStorage.getItem("skill-theme") === "dark" || (!localStorage.getItem("skill-theme") && matchMedia("(prefers-color-scheme: dark)").matches)));
  const [copied, setCopied] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  const [loadError, setLoadError] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  const navigate = useCallback((next: Route) => {
    history.pushState({}, "", hrefFor(next));
    setRoute(next);
    scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    fetch("/data/skills.json")
      .then((response) => { if (!response.ok) throw new Error("Dataset unavailable"); return response.json(); })
      .then(setData)
      .catch(() => setLoadError(true));
    const handlePopState = () => { setRoute(parseRoute()); setCategory(new URLSearchParams(location.search).get("category") || "all"); };
    addEventListener("popstate", handlePopState);
    return () => removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; localStorage.setItem("skill-theme", dark ? "dark" : "light"); }, [dark]);
  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") { event.preventDefault(); document.querySelector<HTMLInputElement>("#skill-search")?.focus(); }
      if (event.key === "Escape" && route.view !== "directory") navigate({ view: "directory" });
    };
    addEventListener("keydown", handleKeyboard);
    return () => removeEventListener("keydown", handleKeyboard);
  }, [navigate, route.view]);

  const selectCategory = (slug: string) => {
    setCategory(slug);
    setVisibleCount(24);
    const target = slug === "all" ? "/" : `/?category=${encodeURIComponent(slug)}`;
    history.replaceState({}, "", target);
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      chipsRef.current?.querySelector<HTMLElement>(`[data-category="${CSS.escape(slug)}"]`)?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  };
  const clearFilters = () => { setQuery(""); setCategory("all"); setSource("all"); setSort("rank"); setVisibleCount(24); history.replaceState({}, "", "/"); };
  const copyCommand = async (skill: Skill) => {
    await navigator.clipboard.writeText(skill.installCommand || `npx skills add ${skill.name}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const filtered = useMemo(() => data ? data.skills
    .filter((skill) => category === "all" || skill.categorySlug === category)
    .filter((skill) => source === "all" || skill.collection === source)
    .filter((skill) => !query.trim() || [skill.name, skill.source, skill.cardValueZh, skill.summaryZh, skill.categoryName, ...(skill.tags || [])].join(" ").toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => sort === "name" ? a.name.localeCompare(b.name) : (a.rank || 9999) - (b.rank || 9999)) : [], [data, query, category, source, sort]);
  const trending = useMemo(() => data ? (data.trending || []).map((item) => data.skills.find((skill) => skill.id === item.skillId)).filter(Boolean).slice(0, 6) as Skill[] : [], [data]);
  const labCollections = data?.collections?.filter((collection) => collection.source === "haruka") || [];
  const selectedSkill = data?.skills.find((skill) => skill.id === route.id);
  const selectedCollection = data?.collections?.find((collection) => collection.slug === route.id);
  const collectionSkills = selectedCollection ? data?.skills.filter((skill) => selectedCollection.skillIds?.includes(skill.id)) || [] : [];
  const activeCategory = data?.categories.find((item) => item.slug === category);
  const harukaCount = data?.skills.filter((skill) => skill.collection === "haruka").length || 0;

  if (loadError) return <div className="fatal-state"><Command /><h1>目录暂时没有载入</h1><p>请刷新页面重试；如果问题持续，请检查 Pages 构建产物中是否包含 data 目录。</p><button onClick={() => location.reload()}>重新载入</button></div>;
  if (!data) return <div className="loading"><BrandMark /><p>正在载入 Haruka Skills…</p></div>;

  return <>
    <a className="skip-link" href="#main-content">跳到主要内容</a>
    <header className="site-header">
      <button className="brand" onClick={() => { setCategory("all"); history.pushState({}, "", "/"); setRoute({ view: "directory" }); scrollTo({ top: 0, behavior: "smooth" }); }} aria-label="Haruka Skills 首页">
        <BrandMark /><span className="brand-text"><strong>Haruka Skills</strong><small>Workflows, made installable.</small></span>
      </button>
      <nav className="header-actions" aria-label="主导航">
        <button className="header-link" onClick={() => { navigate({ view: "directory" }); setTimeout(() => document.querySelector("#haruka-lab")?.scrollIntoView({ behavior: "smooth" }), 60); }}>Haruka Lab</button>
        <button className="header-link" onClick={() => { navigate({ view: "directory" }); setTimeout(() => document.querySelector("#collections")?.scrollIntoView({ behavior: "smooth" }), 60); }}>专题合集</button>
        <a className="header-link" href={GITHUB_REPO} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={13} /></a>
        <button className="icon-button" onClick={() => setDark(!dark)} aria-label={dark ? "切换到浅色模式" : "切换到深色模式"}>{dark ? <Sun /> : <Moon />}</button>
      </nav>
    </header>

    <main className="app-shell" id="main-content">
      {route.view === "skill" && selectedSkill ? <SkillDetail skill={selectedSkill} copy={() => copyCommand(selectedSkill)} copied={copied} back={() => history.length > 1 ? history.back() : navigate({ view: "directory" })} related={data.skills.filter((skill) => skill.id !== selectedSkill.id && skill.categorySlug === selectedSkill.categorySlug).slice(0, 4)} open={(skill) => navigate({ view: "skill", id: skill.id })} /> :
      route.view === "collection" && selectedCollection ? <CollectionDetail collection={selectedCollection} skills={collectionSkills} back={() => history.length > 1 ? history.back() : navigate({ view: "directory" })} open={(skill) => navigate({ view: "skill", id: skill.id })} /> :
      route.view !== "directory" ? <div className="fatal-state"><Command /><h1>这个页面不存在</h1><p>条目可能已移动或重命名。</p><button onClick={() => navigate({ view: "directory" })}>返回全部 Skill</button></div> : <>
        <section className="hero">
          <div className="hero-copy"><p className="eyebrow"><Sparkles size={14} /> Haruka Skills · Open workflows</p><h1>把好方法，变成<br /><span>可安装的能力</span></h1><p className="lead">94 个 Haruka Lab Skill 已独立重写并集中维护，另有 239 个社区精选条目。按任务找到工作流，读懂边界，一条命令装进你的 Agent。</p><div className="hero-actions"><button onClick={() => { setSource("haruka"); setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 10); }}>浏览 Haruka Lab</button><a href={GITHUB_REPO} target="_blank" rel="noreferrer"><Github size={16} /> 查看 GitHub 仓库</a></div></div>
          <div className="hero-aside"><p>HARUKA LAB</p><strong>{harukaCount}</strong><span>个独立重写的 Skill</span><div className="source-tally"><span>7 专业分类</span><span>1 个统一仓库</span></div></div>
        </section>

        <section className="lab-intro" id="haruka-lab">
          <div><p className="eyebrow"><Sparkles size={14} /> Built and maintained here</p><h2>不是换名字，是重新定义工作方法</h2></div>
          <p>每个 Haruka Skill 都包含触发条件、输入、分类专属步骤、交付物、安全边界与验收清单。无需为 94 个 Skill 建 94 个仓库，它们全部从同一个仓库安装与更新。</p>
          <code>npx skills add {GITHUB_REPO}</code>
        </section>

        <section className="filter-dock" aria-label="搜索与筛选">
          <div className="search-box"><Search size={19} /><input id="skill-search" value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(24); }} placeholder="搜索 Skill、用途或使用场景…" aria-label="搜索 Skill" /><span className="search-count">{filtered.length} 个结果</span>{query ? <button onClick={() => { setQuery(""); setVisibleCount(24); }} aria-label="清除搜索"><X size={17} /></button> : <kbd>/</kbd>}</div>
          <div className="chips-row" ref={chipsRef}><button data-category="all" className={category === "all" ? "active" : ""} onClick={() => selectCategory("all")}>全部 <span>{data.skills.length}</span></button>{data.categories.map((item) => <button data-category={item.slug} key={item.slug} className={category === item.slug ? "active" : ""} onClick={() => selectCategory(item.slug)}>{item.name} <span>{item.availableCount}</span></button>)}</div>
          <div className="dock-filters"><div className="segmented" aria-label="内容来源">{Object.entries(sourceLabels).map(([key, label]) => <button key={key} className={source === key ? "active" : ""} aria-pressed={source === key} onClick={() => { setSource(key); setVisibleCount(24); }}>{label}</button>)}</div><label>排序 <select value={sort} onChange={(event) => { setSort(event.target.value); setVisibleCount(24); }}><option value="rank">按推荐</option><option value="name">按名称</option></select></label></div>
        </section>

        {!!labCollections.length && <section className="collections-panel" id="collections"><div className="section-head"><div><p className="eyebrow">Haruka Lab collections</p><h2>七条完整能力路线</h2></div><p>进入分类，按任务挑选并安装对应 Skill。</p></div><div className="collections-strip lab-collections">{labCollections.map((collection, index) => <button key={collection.slug} onClick={() => navigate({ view: "collection", id: collection.slug })}><span className="collection-index">{String(index + 1).padStart(2, "0")}</span><span className="collection-icon"><BookOpen /></span><div><small>Haruka Lab</small><h3>{collection.name}</h3><p>{collection.description}</p></div><strong>{collection.skillIds?.length || 0} SKILLS <ArrowUpRight size={14} /></strong></button>)}</div></section>}

        {!!trending.length && <section className="strip-panel"><div className="section-head"><div><p className="eyebrow">Curated signals</p><h2>近期值得关注</h2></div><p>结合自有更新与公开社区热度整理，仅作选型参考。</p></div><div className="trending-strip">{trending.map((skill, index) => <button key={skill.id} onClick={() => navigate({ view: "skill", id: skill.id })}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{skill.name}</strong><small>{skill.categoryName}</small></div><ArrowUpRight /></button>)}</div></section>}

        <section className="results-panel" ref={resultsRef}><div className="results-head"><div><p className="eyebrow">{sourceLabels[source]} · {filtered.length} results</p><h2>{activeCategory?.name || "全部 Skill"}</h2><p>{activeCategory?.description || "Haruka 自有工作流与社区精选内容，点击卡片查看用途、边界和安装方式。"}</p></div>{(query || category !== "all" || source !== "all" || sort !== "rank") && <button className="reset-button" onClick={clearFilters}><X size={14} /> 清除筛选</button>}</div><div className="skill-grid">{filtered.slice(0, visibleCount).map((skill) => <SkillCard key={skill.id} skill={skill} onOpen={(item) => navigate({ view: "skill", id: item.id })} />)}</div>{filtered.length > visibleCount && <button className="load-more" onClick={() => setVisibleCount((count) => count + 24)}>加载更多 <span>{visibleCount} / {filtered.length}</span></button>}{!filtered.length && <div className="empty-state"><Command /><h3>没有找到匹配项</h3><p>换一个关键词，或清除当前筛选条件。</p><button onClick={clearFilters}>查看全部 Skill</button></div>}</section>
      </>}
    </main>

    <footer><div><BrandMark /><p><strong>Haruka Skills</strong><br />让方法可安装，让交付可验证。</p></div><p>Haruka Lab 条目经许可独立重写并由本站维护<br />社区条目及商标归各自作者与项目所有</p></footer>
  </>;
}

function SkillDetail({ skill, copy, copied, back, related, open }: { skill: Skill; copy: () => void; copied: boolean; back: () => void; related: Skill[]; open: (skill: Skill) => void }) {
  const isHaruka = skill.collection === "haruka";
  return <article className="detail-view"><button className="back-button" onClick={back}><ChevronLeft size={17} /> 返回目录</button><div className="detail-hero"><div><div className="detail-kicker"><span className={`source-badge source-${skill.collection}`}>{sourceLabels[skill.collection] || skill.collection}</span><span>{skill.categoryName}</span><span>{skill.source}</span></div><h1>{skill.name}</h1><p>{skill.cardValueZh || skill.summaryZh}</p></div><div className="detail-rank"><small>{isHaruka ? "HARUKA LAB" : "热度排名"}</small><strong>{isHaruka ? "OWN" : `#${skill.rank || "—"}`}</strong><span>{isHaruka ? <><Check size={15} /> 单仓库维护</> : <><Star size={15} /> {metric(skill.metricValue)} {skill.metricLabel}</>}</span></div></div><div className="detail-grid"><section className="prose-card"><p className="eyebrow">{isHaruka ? "Haruka edition" : "Editorial note"}</p><h2>{isHaruka ? "这一版解决什么" : "为什么值得关注"}</h2><p>{skill.recommendationZh || skill.summaryZh}</p><div className="tag-list">{(skill.tags || skill.bestFor || [skill.categoryName]).map((tag) => <span key={tag}>{tag}</span>)}</div></section><aside className="install-card"><p className="eyebrow">Quick install</p><h2>复制后即可安装</h2><button className="command-box" onClick={copy}><code>{skill.installCommand || `npx skills add ${skill.name}`}</code>{copied ? <Check size={18} /> : <Copy size={18} />}</button>{skill.githubUrl && <a className="primary-link" href={skill.githubUrl} target="_blank" rel="noreferrer"><Github size={17} /> {isHaruka ? "查看 Haruka Skill 原文" : "查看来源文档"} <ArrowUpRight size={15} /></a>}<p className="install-note">{isHaruka ? "该 Skill 与其余 Haruka Skills 一起维护在当前仓库，无需创建独立仓库。" : "安装前请阅读来源项目的权限、依赖和许可说明。"}</p></aside></div>{!!related.length && <section className="related-section"><div className="section-head"><div><p className="eyebrow">Keep exploring</p><h2>同类 Skill</h2></div></div><div className="skill-grid">{related.map((item) => <SkillCard key={item.id} skill={item} onOpen={open} />)}</div></section>}</article>;
}

function CollectionDetail({ collection, skills, back, open }: { collection: Collection; skills: Skill[]; back: () => void; open: (skill: Skill) => void }) {
  const isHaruka = collection.source === "haruka";
  return <article className="collection-view"><button className="back-button" onClick={back}><ChevronLeft size={17} /> 返回目录</button><div className="collection-hero"><p className="eyebrow"><BookOpen size={14} /> {isHaruka ? "Haruka Lab collection" : "Curated collection"}</p><h1>{collection.name}</h1><p>{collection.description}</p><span>{skills.length} 个 Skill · {isHaruka ? "均在同一仓库维护" : "按建议使用顺序排列"}</span></div><div className="collection-list">{skills.map((skill, index) => <button key={skill.id} onClick={() => open(skill)}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{skill.categoryName}</small><h2>{skill.name}</h2><p>{skill.cardValueZh || skill.summaryZh}</p></div><ArrowUpRight /></button>)}</div></article>;
}
