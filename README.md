<div align="center">

# ✍️ 胡拉图说

**一个普通研究生的个人博客。**

记录思考、分享日常、观察生活 —— 内容包含但不限于运动、健康、成长、科研与工具折腾。

<br>

[![内容](https://img.shields.io/static/v1?label=%E5%86%85%E5%AE%B9&message=113%20%E7%AF%87&color=1b1917&style=flat-square)](https://hulatu.com/archive/)
[![周刊](https://img.shields.io/static/v1?label=%E5%91%A8%E5%88%8A&message=31%20%E6%9C%9F&color=c0392b&style=flat-square)](https://hulatu.com/weekly/)
[![Hugo](https://img.shields.io/static/v1?label=Hugo&message=0.170&color=ff4088&style=flat-square&logo=hugo&logoColor=white)](https://gohugo.io/)
[![部署](https://img.shields.io/static/v1?label=%E9%83%A8%E7%BD%B2&message=Cloudflare%20Pages&color=f38020&style=flat-square&logo=cloudflare&logoColor=white)](#-发布)
[![RSS](https://img.shields.io/static/v1?label=%E8%AE%A2%E9%98%85&message=RSS%20%E5%85%A8%E6%96%87&color=e8892e&style=flat-square&logo=rss&logoColor=white)](https://hulatu.com/index.xml)
[![许可](https://img.shields.io/static/v1?label=%E8%AE%B8%E5%8F%AF&message=CC%20BY-NC-SA%204.0&color=2f7d5d&style=flat-square)](#-许可)

<br>

**[🌐 hulatu.com](https://hulatu.com/)** ・ **[📮 订阅](https://hulatu.com/index.xml)** ・ **[📚 精选](https://hulatu.com/featured/)**

</div>

---

> **这份 README 只讲「怎么跑起来」和「想改什么去哪改」。**
>
> 更深入的两份：**[MAINTENANCE.md](MAINTENANCE.md)**（文件地图、坑、验收清单）、
> **[DESIGN.md](DESIGN.md)**（视觉规范与站点层每个文件的偏离）。
> **视觉数值（字号 / 颜色 / 行高）以 DESIGN.md 第 0 节为准；篇数、文件数、体积等统计只看
> MAINTENANCE.md 第 0 节的自动区块（`scripts/sync-status.py` 生成）；操作步骤以 MAINTENANCE.md 为准。**
> 三份文档里其他地方出现的数字，都是写那一段时的实测值。

## 📑 目录

| 想做什么 | 看这里 |
| --- | --- |
| 了解这是个什么站 | [🌱 这是个什么站](#-这是个什么站) |
| 在本机跑起来 | [🚀 本地跑起来](#-本地跑起来) |
| 找文件 | [🗂 仓库地图](#-仓库地图) |
| 改点什么 | [🎛 想改什么 去哪改](#-想改什么-去哪改) |
| 发一篇文章 | [📝 写与发](#-写与发) |
| 部署 / 订阅 / 评论 | [🚢 发布](#-发布) ・ [📡 订阅与评论](#-订阅与评论) |
| 看现在的家底 | [🧭 站点现状](#-站点现状) |
| 这里为什么是这样 | [📜 变更记录](#-变更记录) |

## 🌱 这是个什么站

| | |
| --- | --- |
| 🌐 **线上地址** | <https://hulatu.com/> |
| 🧱 **框架** | [Hugo](https://gohugo.io/) `0.170.0`（0.170 起无 extended 版） |
| 🎨 **主题** | 上游 [hugo-bearneo](https://github.com/rokcso/hugo-bearneo) 的副本（只有 `style.html` 六处登记改动：正文行高 1.8、列宽 680、代码块圆角 12、visited 与 link 同色、删掉未启用的 upvote CSS、深色改用 `[data-theme]`；其余逐字节未改。生效副本是 `assets/css/theme.css`） |
| ☁️ **托管** | Cloudflare Pages（Git 集成，push 即自动构建） |
| 💬 **评论** | giscus（GitHub Discussions，只挂长文页） |
| 📊 **统计** | GoatCounter（无 Cookie） |
| 📡 **订阅** | RSS 2.0 全文输出 |
| 🏗 **形态** | **单站单仓库** —— 2026-10-12 起原先四个子站全部下线，内容并回主站 |

**站点结构**（导航 7 项完全由 `hugo.toml` 的 `[[menu.main]]` 驱动，模板里不写死任何链接）：

| 路径 | 页面 | 说明 |
| --- | --- | --- |
| `/` | 首页 | 招呼 + 题记 + 简介 + 支持链接 + 平台入口 + 最近 5 篇 |
| `/archive/` | 文章 | 共 N 篇 + 随机读一篇 + 分类 / 系列入口 + 年份分组（顶部搜索已删除，全站搜索走 ⌘K） |
| `/weekly/` | 周刊 | 独立栏目，单独的 RSS |
| `/series/` | 系列 | 跨文章的系列总览 |
| `/featured/` | 精选 | 手工挑的几篇 |
| `/roll/` | 邻居 | 全站唯一的链接页（导航里的「邻居」） |
| `/about/` | 关于 | 无标题无头像 |
| `/run/` | 跑步 | 读 `data/runs.json`，每天自动同步 Garmin |
| `/donate/` | 支持 | 两个赞赏码 |
| `/wechat/` | 公众号 | 二维码页 |
| `/privacy/` | 隐私 | — |
| `/feed/` | 订阅源浏览器视图 | 内容协商落点，见 [订阅与评论](#-订阅与评论) |

**几条贯穿全站的设计取舍**

| | 做法 | 为什么 |
| --- | --- | --- |
| 🌗 深浅色 | 默认跟随系统，右上角月亮 / 太阳图标可手动切换（点击处圆形绽开、图标转一圈），选择存 LocalStorage | 2026-11-21 升级包要求；只记一个键 `hl-theme`。动效 2026-11-22 加，参考 directoryyy.com，Firefox / 关闭动效时退回 0.3s 颜色过渡 |
| 🔍 搜索 | 全站 `⌘K` / `/` 命令面板；`/archive/` 顶部搜索框 2026-11-21 已彻底删除 | 面板读 `/index.json`（标题 / 章节 / 关键词 / 引用）；归档只留计数与随机入口 |
| 📖 目录 | **>1200px** 右侧悬浮（平时隐形、悬停显形）；**≤1200px** 正文顶部折叠（原生 `<details>`） | 手机端折叠目录 2026-11-02 删过，2026-11-15 恢复 |
| 🖼 图片放大 | **原生 Popover**（`button[popovertarget]`）+ `--zoom-src` 背景图，零 JS | 每张图在 DOM 里只占 1 个节点，Esc / 顶层显示由浏览器原生负责；有 View Transitions 时从原图位置长出来 |
| ⬆️ 返回顶部 | 纯 CSS 滚动驱动动画，零 JS | 只挂长文页 |
| 🔗 标题锚点 | 只在文章页输出可点的 `#` | 独立页模板层就不输出 |
| 🎲 404 | 「随便看一篇」构建时抽签，每次发布换一篇 | 死链也能有个去处 |
| 📰 RSS | 浏览器打开 feed 时内容协商到站内 HTML 页 | Chromium 移除 XSLT，详见时间线 |

## 🚀 本地跑起来

**1. 装 Hugo（0.170.0）**

```bash
brew install hugo                          # macOS
winget install Hugo.Hugo                   # Windows（0.170 起没有 Extended 包了）
hugo version                               # 版本号见下
```

> ⚠️ **构建版本钉在 `0.170.0`**，四处一致：本机、CI（`.github/workflows/build.yml` 的
> `hugo-version`，还会 `grep -q v0.170.0` 硬校验）、Cloudflare Pages 的 `HUGO_VERSION`、
> `hugo.toml` 的 `[module.hugoVersion] min`。
>
> 2026-11-15 起**不再需要 extended 版**：Hugo 0.170 移除了 LibSass、取消 Extended 构建，
> 只剩一个二进制，`hugo version` 也不再带 extended 字样。本站从未用过 Sass，
> 对构建没有任何影响。升级 0.170 的 breaking change 已逐条核过，一项都没命中本仓库。

**2. 预览**

```bash
hugo server -D          # -D 连草稿一起显示，改文件自动刷新
./deploy.sh             # 干净构建到 public/，检查 livereload 与站内断链
```

> ⚠️ `hugo server` 开着会持续覆盖 `public/`。想在不打扰 server 的情况下验收，
> 构建到临时目录：`hugo --gc --minify --cleanDestinationDir --destination /tmp/hb-check`。

**3. 写一篇** —— 见 [📝 写与发](#-写与发)。

## 🗂 仓库地图

```
Blog/
├── hugo.toml                 # 站点配置：导航 / 参数 / permalinks / 高亮 / 版本约束
├── content/
│   ├── _index.md             # 首页文案（招呼、题记、简介、平台入口）
│   ├── posts/                # 文章
│   ├── weekly/               # 周刊（单独开了 RSS 输出）
│   ├── feed/                 # 订阅源「浏览器视图」的两个壳
│   ├── about / archive / roll / series / featured / run / donate / wechat / privacy
│   └── categories/           # 8 个分类
├── layouts/                  # ★ 站点层覆盖，主题一律不改
│   ├── index.html            #   首页
│   ├── _default/             #   baseof / single / list / rss / archive / run / series / featured
│   ├── partials/post-list.html # 列表本体，list/archive 共用
│   ├── feed/                 #   /feed/ 与 /feed/weekly/ 的视图
│   ├── partials/             #   nav / footer / custom_head / giscus / seo_tags / breadcrumbs …
│   └── _markup/              #   render-heading（标题锚点）/ render-link / render-image
├── themes/hugo-bearneo/      # ★ 上游主题副本，**别随手改**
├── assets/css/               # theme → custom → upgrade 三层，按序拼成一个 /css/main.min.<hash>.css
├── assets/js/                # palette / hello / toc 拼成全站 site.js；giscus / code-copy 只在需要的页加载
├── data/
│   ├── runs.json             # 跑步数据（/run/ 在读）
│   └── image-dims.json       # 正文图片真实宽高
├── static/                   # 原样发布：_headers / _redirects / 图标 / images
├── functions/_middleware.js  # Cloudflare Pages Functions：订阅源内容协商
├── scripts/                  # 脚本：发布前检查、链接检查、Garmin 同步、图床尺寸 …
├── archetypes/               # hugo new 的模板（posts / weekly）
├── publish.sh                # 一键发布：补锚点 → 刷 lastmod → 提交 → 推
├── deploy.sh                 # 本地干净构建，不部署
├── DESIGN.md                 # 设计规范
└── MAINTENANCE.md            # 维护手册（**冲突以它为准**）
```

## 🎛 想改什么 去哪改

| | 想改什么 | 去哪改 |
| --- | --- | --- |
| 🏷 | 博客名 / 描述 / 作者 / 邮箱 | `hugo.toml` 顶部与 `[params]` |
| 🧭 | **导航菜单**（增删项 / 改标签 / 换落点） | `hugo.toml` 的 `[[menu.main]]`（`weight` 控顺序），**不用碰模板** |
| 🦶 | 页脚 | `hugo.toml` 的 `copyright` / `copyrightNote` / `licenseName` / `licenseURL` / `[params.footer]`；结构在 `partials/footer.html`（两行：订阅/问候/开往/虫洞/隐私/地图 → 制作署名/版权/授权；2026-11-21 晚已去掉「搜索」入口） |
| 🏠 | 首页文案 | `content/_index.md` |
| 🔢 | 首页列几篇 | `hugo.toml` 的 `homeRecentCount`（当前 5，设 0 不显示） |
| 📐 | 首页列表的对齐 | `assets/css/custom.css` 第 04 段（`padding-left: 0` 保证与标题左对齐） |
| 💰 | 支持页 / 换赞赏码 | `content/donate.md` + `custom.css` 第 08 段。⚠️ 换码后去 Cloudflare Purge `/images/donate/*` |
| 🔗 | 链接页（朋友 / 聚合站 / 点评） | `content/roll.md` —— 全站唯一的链接页，一条平铺 13 项，格式 `名称：一句话点评` |
| 👤 | 关于页 | `content/about.md`（纯 Markdown，**没有头像**） |
| 🎨 | **颜色 / 字体 / 宽度 / 圆角** | `themes/hugo-bearneo/layouts/partials/style.html` 的 `:root`（改上游，改完在 DESIGN.md 第 5 节登记） |
| 📝 | 正文排版（标题间距 / 中文字体） | `assets/css/custom.css` 第 02 段 |
| 🍞 | 文末分类 / 标签行 | `_default/single.html` + `custom.css` 第 13 段（面包屑已移除，只保留 BreadcrumbList JSON-LD） |
| 👁 | 独立页是否显示标题 | front matter 的 `hideTitle: true`（仅联系页开着；`/roll/` `/about/` 已恢复标题） |
| 📚 | 文末推荐（系列 / 相关文章 / 上一篇下一篇，三选一只显示一块） | `_default/single.html` + `custom.css` 第 09 / 10 段 |
| 🗂 | 「系列」入口 / 总览页 | 入口 `_default/archive.html`；总览页 `_default/series.html` + `content/series.md` |
| 🎲 | 404 页 | `layouts/404.html` + `custom.css` 第 15 段 |
| 🔗 | 标题锚点 / 孤行保护 | `_markup/render-heading.html`（只文章页）+ `partials/orphan-safe.html`（全站） |
| ⬆️ | 返回顶部 | `partials/back-top.html` + `custom.css` 第 16 段 |
| 📋 | 代码复制按钮 | `assets/js/code-copy.js` + `partials/code-copy.html` + 第 18 段 |
| 🔖 | 脚注弹出预览 | `assets/js/footnote.js` + `partials/footnote.html` + `custom.css` 第 71 段 |
| 📄 | 分页 | **全站都不分页**（上游不用 `.Paginate`）。旧地址由 `static/_redirects` 301 兜底 |
| 📖 | 目录 | **>1200px** 右侧悬浮（`custom.css` 第 20 段）；**≤1200px** 正文顶部折叠（第 46 段） |
| 🖼 | 图标 | `static/favicon.svg` + 各档 PNG / ICO + `manifest.webmanifest`；重生成步骤见 DESIGN.md 8.6 |
| 💬 | 评论 | `hugo.toml` 的 `[params.giscus]`；单篇用 `comments: false` 关掉 |
| 📊 | 统计 | `hugo.toml` 的 `[params.analytics]`（GoatCounter，挂在 `custom_head.html` 末尾） |
| 🖼 | 分享图 | 每篇文章自动取 `images/og/<slug>.png`；取不到才回落 `hugo.toml` 的 `params.images`（`share.png`）+ `ogImageWidth` / `ogImageHeight` |
| 🔎 | **SEO 头**（canonical / OG / JSON-LD） | `layouts/partials/seo_tags.html` —— 整份覆盖上游同名 partial：删掉 `keywords` 与不生效的微数据，改按页型输出 JSON-LD |
| ↩️ | 加 301 / 改缓存头 | `static/_redirects`（首条命中即生效）/ `static/_headers` |
| ➕ | 加根级独立页 | `content/xxx.md`（`hideDate: true` + `toc: false`；纯工具页再加 `noindex: true`；`_headers` 的 `/*` 已统一处理缓存） |

## 📝 写与发

```bash
new posts/文章名                     # 周刊：new weekly/周刊-第N期
hugo new content/posts/文章名.md      # 同效，建完也会自动打开
```

两种写法都会套 `archetypes/` 模板，建完立刻用**系统默认的 Markdown 应用**打开（同名文件不会被覆盖，只会被打开）。按 `archetypes/posts.md` 的清单填 front matter，把 `draft` 改成 `false` 就发布。

| 字段 | 作用 |
| --- | --- |
| `date` | 决定 URL（`/posts/年/月/日/slug/`） |
| `slug` | 决定 URL 最后一段 |
| `series` | **在用**：文章页「系列坐标带」+ `/archive/` 入口 + `/series/` 总览都读它（一篇只能属于一个系列） |
| `tags` | 分类 / 标签行 + 归档页标签云 |
| `categories` | 文末分类行（「分类：」前缀）+ `/categories/<词>/` 词条页。周刊也写 `["周刊"]`（词条页要用），只是文末分类行对周刊跳过（分类名与栏目名重复） |

**提示框**：引用块第一行写 `[!NOTE]` / `[!TIP]` / `[!IMPORTANT]` / `[!WARNING]` / `[!CAUTION]`，类型后面可以跟自定义标题（`> [!WARNING] 先看这里`）。不写就是普通引用。样例见 `/style/`。

**中文折行**：段落里一句一行地写，渲染出来会连成一段、汉字之间不多空格；想分段就空一行。链接和全角标点之间别加空格；命令、参数（`--burn`）放进反引号，否则 `--` 会被换成短破折号。
中英文、中文和数字之间照旧手打一个空格；漏了的，新浏览器会自动补一点间距，但比手打的窄。

**扩展语法**（样例都在 `/style/`）：行内公式 `\( E = mc^2 \)`、独立成行的公式 `$$ … $$`（行内 `$` 没开）；
```` ```mermaid ```` 代码块画图；`==高亮==`；任务列表 `- [ ]`；代码块 `{linenos=true,hl_lines=[2]}`；
定义列表；`<kbd>⌘</kbd>`；可折叠提示框 `> [!TIP]- 标题`（`-` 默认收起、`+` 默认展开）。
图片 `![alt](地址 "标题")` 写了标题时图注用标题；站内链接可以直接写文件名 `[地图](map.md)`，构建时换成正式网址。

日常一条命令：

```bash
up                          # 或 cd ~/Blog && ./publish.sh
./publish.sh "修复导航样式"  # 指定提交信息；不传参数时交互终端会提示输入，直接回车用默认值
```

`publish.sh` 提交信息规则：传入参数直接用；不传时，改动全在 `content/` 用「博客：新增/修改文章」，否则用「博客：更新站点」；交互终端下会先提示手动确认/修改。

`publish.sh` 提交前会自动做两件事（失败不阻断发布）：给新写的中文标题补 `{#pinyin}` 锚点、
刷新改动过文章的 `lastmod`。

## 📡 订阅与评论

**RSS** —— 两个源都只收文章页，每源最多 20 条：

| 源 | 地址 |
| --- | --- |
| 全站 | <https://hulatu.com/index.xml> |
| 周刊专线 | <https://hulatu.com/weekly/index.xml> |

feed 本身是**纯 XML**（顶部没有 `<?xml-stylesheet?>`）。浏览器直接打开时，
`functions/_middleware.js` 做内容协商，改写到站内 HTML 页 `/feed/` 与 `/feed/weekly/`；
**订阅器不受影响，订阅地址一个字没变**。

**giscus 评论** —— 基于 GitHub Discussions，不用自建后端：

1. 仓库设为 **public**
2. **Settings → General → Features** 里开启 **Discussions**
3. 打开 [giscus.app](https://giscus.app)，填仓库地址、选分类
4. 把生成的 `data-repo` / `data-repo-id` / `data-category` / `data-category-id` 抄进 `hugo.toml` 的 `[params.giscus]`
5. 重新构建：文章页正文下方出现评论区（`repo` 留空则整块不显示）

> ⚠️ `mapping = "pathname"` —— **只要 URL 不变，老评论就直接接上**。
> 改 `[permalinks]` 会让评论全部断掉。

## 🚢 发布

线上是 **Cloudflare Pages 的 Git 集成**在构建：push → 自动构建发布。
本机不装 wrangler，也不手动上传。

**CI**（`.github/workflows/`）：

| 工作流 | 做什么 |
| --- | --- |
| `build.yml` | push / PR 时用**同一个 Hugo 版本**构建主站，并检查中文标题锚点 —— 把「本地没事、平台构建失败」挡在推送前 |
| `sync-garmin.yml` | 每天 00:10（Asia/Taipei）拉一次跑步数据（前一整天的记录），写进 `data/runs.json`。每次都会提交，所以它也是**全站每天的重建来源**（首页「运行 N 天」、写作统计靠它前进；原 `daily-rebuild.yml` 2026-11-22 删除） |

## 🧭 站点现状

<details>
<summary><b>点开看具体数字（脚本自动生成）</b></summary>

<!-- status:begin（scripts/sync-status.py 自动生成，别手改） -->
完整统计见 [MAINTENANCE.md 第 0 节](MAINTENANCE.md)。

| 项 | 当前值 |
| --- | --- |
| 内容 | 文章 **113** 篇 + 周刊 **31** 期 = **144** 个内容页（另有 2 个 section index，共 146 个 Markdown）；草稿 0 篇 |
| 分类 | 8 个：思考 40 / 周刊 31 / 工具 22 / 记录 19 / 运动 13 / 学习科研 10 / 饮食 5 / 健康 4 |
| 系列 | 3 组 23 篇：跑步 14 / 综述写作 5 / 居家流水账 4 |
| 产出 HTML | 408 个 |
| sitemap | 164 条 |
| 文章页 HTML | 中位数 25.2 KB，gzip 9.4 KB |
<!-- status:end -->

- 每页都有 JSON-LD（首页 `WebSite` / 文章页 `BlogPosting` / 独立页与 404 `WebPage` /
  section 与词条 `CollectionPage`）。
- **`noindex, follow`** 覆盖标签词条、`/privacy/`、`/posts/`、`/donate/`、`/wechat/`、404 与
  `/feed/` 那两页；**分类词条页 2026-10-26 起可索引**。
- **og:image 每篇文章一张**（`images/og/<slug>.png`，1200×630）；独立页与词条页回落到 `share.png`。

</details>

## 📜 变更记录

这个站是怎么一步步长成现在这样的、删过哪些文件和子站，都记在 **[CHANGELOG.md](CHANGELOG.md)**。

## 📄 许可

文章内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) —— 署名、非商业性使用、相同方式共享。
页脚那行由 `hugo.toml` 的 `copyrightNote` / `licenseName` / `licenseURL` 三个参数拼出。

代码部分随意取用。

---

<div align="center">

**[🌐 hulatu.com](https://hulatu.com/)** ・ **[📮 订阅](https://hulatu.com/index.xml)**

<sub>Hugo · Cloudflare Pages · 无广告 · 无追踪 Cookie</sub>

</div>
