<div align="center">

# ✍️ 胡拉图说

**一个普通研究生的个人博客。**

记录思考、分享日常、观察生活 —— 内容包含但不限于运动、健康、成长、科研与工具折腾。

<br>

[![内容](https://img.shields.io/static/v1?label=%E5%86%85%E5%AE%B9&message=137%20%E7%AF%87&color=1b1917&style=flat-square)](https://hulatu.com/archive/)
[![周刊](https://img.shields.io/static/v1?label=%E5%91%A8%E5%88%8A&message=28%20%E6%9C%9F&color=c0392b&style=flat-square)](https://hulatu.com/weekly/)
[![Hugo](https://img.shields.io/static/v1?label=Hugo&message=0.167&color=ff4088&style=flat-square&logo=hugo&logoColor=white)](https://gohugo.io/)
[![部署](https://img.shields.io/static/v1?label=%E9%83%A8%E7%BD%B2&message=Cloudflare%20Pages&color=f38020&style=flat-square&logo=cloudflare&logoColor=white)](#-发布)
[![RSS](https://img.shields.io/static/v1?label=%E8%AE%A2%E9%98%85&message=RSS%20%E5%85%A8%E6%96%87&color=e8892e&style=flat-square&logo=rss&logoColor=white)](https://hulatu.com/index.xml)
[![许可](https://img.shields.io/static/v1?label=%E5%86%85%E5%AE%B9&message=CC%20BY-NC-SA%204.0&color=2f7d5d&style=flat-square)](#-许可)

<br>

**[🌐 hulatu.com](https://hulatu.com/)** ・ **[📮 订阅](https://hulatu.com/index.xml)** ・ **[📚 精选](https://hulatu.com/featured/)**

</div>

---

> **这份 README 只讲「怎么跑起来」和「想改什么去哪改」。**
>
> 更深入的两份：**[MAINTENANCE.md](MAINTENANCE.md)**（文件地图、坑、验收清单）、
> **[DESIGN.md](DESIGN.md)**（视觉规范与站点层每个文件的偏离）。
> **三份冲突时以 MAINTENANCE.md 为准。**

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
| 这里为什么是这样 | [📜 变更时间线](#-变更时间线) |

## 🌱 这是个什么站

| | |
| --- | --- |
| 🌐 **线上地址** | <https://hulatu.com/> |
| 🧱 **框架** | [Hugo](https://gohugo.io/) `0.167.0` extended |
| 🎨 **主题** | 上游 [hugo-bearneo](https://github.com/rokcso/hugo-bearneo) 的副本（`themes/` 里 **27 个文件逐字节未改**，只有 `style.html` 两处登记改动：正文行高 1.6→1.8、删掉未启用的 upvote CSS） |
| ☁️ **托管** | Cloudflare Pages（Git 集成，push 即自动构建） |
| 💬 **评论** | giscus（GitHub Discussions，只挂长文页） |
| 📊 **统计** | GoatCounter（无 Cookie） |
| 📡 **订阅** | RSS 2.0 全文输出 |
| 🏗 **形态** | **单站单仓库** —— 2026-10-12 起原先四个子站全部下线，内容并回主站 |

**站点结构**（导航 6 项完全由 `hugo.toml` 的 `[[menu.main]]` 驱动，模板里不写死任何链接）：

| 路径 | 页面 | 说明 |
| --- | --- | --- |
| `/` | 首页 | 招呼 + 题记 + 简介 + 支持链接 + 平台入口 + 最近 5 篇 |
| `/archive/` | 文章 | 全站唯一的搜索框 + 系列入口 + 年份分组 |
| `/weekly/` | 周刊 | 独立栏目，单独的 RSS |
| `/series/` | 系列 | 跨文章的系列总览 |
| `/featured/` | 精选 | 手工挑的几篇 |
| `/roll/` | 友链 | 全站唯一的链接页（导航里的「友链」） |
| `/about/` | 关于 | 无标题无头像 |
| `/run/` | 跑步 | 读 `data/runs.json`，每天自动同步 Garmin |
| `/donate/` | 支持 | 两个赞赏码 |
| `/wechat/` | 公众号 | 二维码页 |
| `/privacy/` | 隐私 | — |
| `/feed/` | 订阅源浏览器视图 | 内容协商落点，见 [订阅与评论](#-订阅与评论) |

**几条贯穿全站的设计取舍**

| | 做法 | 为什么 |
| --- | --- | --- |
| 🌗 深浅色 | 完全跟随系统，**没有切换按钮** | 上游如此，少一个控件少一份状态 |
| 🔍 搜索 | 只在 `/archive/` 顶部 | 词条页和周刊列表挂搜索框是纯噪音 |
| 📖 目录 | 只在 **>1200px** 的桌面端，平时隐形、悬停显形 | 手机端折叠目录 2026-11-02 已删除，不恢复 |
| 🖼 图片放大 | **零 JS**：checkbox + `--zoom-src` 背景图 | 每张图在 DOM 里只占 1 个节点，放大时内联图不离流、零回流 |
| ⬆️ 返回顶部 | 纯 CSS 滚动驱动动画，零 JS | 只挂长文页 |
| 🔗 标题锚点 | 只在文章页输出可点的 `#` | 独立页模板层就不输出 |
| 🎲 404 | 「随便看一篇」构建时抽签，每次发布换一篇 | 死链也能有个去处 |
| 📰 RSS | 浏览器打开 feed 时内容协商到站内 HTML 页 | Chromium 移除 XSLT，详见时间线 |

## 🚀 本地跑起来

**1. 装 Hugo（Extended，0.167.0+）**

```bash
brew install hugo                          # macOS
winget install Hugo.Hugo.Extended          # Windows
hugo version                               # 只要 extended 就行，版本号见下
```

> ⚠️ **构建版本钉在 `0.167.0`**：CI（`.github/workflows/build.yml` 的 `hugo-version`，还会
> `grep -q v0.167.0` 硬校验）和 Cloudflare Pages 的 `HUGO_VERSION` 都是它，`hugo.toml` 的
> `[module.hugoVersion]` 写的是 `min = "0.167.0"`。
>
> 本机 `brew install hugo` 现在给的是 **0.169.0**，跑本地预览没问题（更高版本向后兼容），
> 但**别把本机版本号抄进 CI 或平台变量**——三处不一致的典型症状是「本地正常、线上构建失败」。

**2. 预览**

```bash
hugo server -D          # -D 连草稿一起显示，改文件自动刷新
./deploy.sh             # 干净构建到 public/，检查 livereload 与站内断链
```

> ⚠️ `hugo server` 开着会持续覆盖 `public/`。想在不打扰 server 的情况下验收，
> 构建到临时目录：`hugo --gc --minify --cleanDestinationDir --destination /tmp/hb-check`。

**3. 写一篇** —— 见 [✏️ 写与发](#-写与发)。

## 🗂 仓库地图

```
Blog/
├── hugo.toml                 # 站点配置：导航 / 参数 / permalinks / 高亮 / 版本约束
├── content/
│   ├── _index.md             # 首页文案（招呼、题记、简介、平台入口）
│   ├── posts/                # 109 篇文章
│   ├── weekly/               # 28 期周刊（单独开了 RSS 输出）
│   ├── feed/                 # 订阅源「浏览器视图」的两个壳
│   ├── about / archive / roll / series / featured / run / donate / wechat / privacy
│   └── categories/           # 8 个分类
├── layouts/                  # ★ 站点层覆盖（40 个文件），主题一律不改
│   ├── index.html            #   首页
│   ├── _default/             #   baseof / single / list / rss / archive / run / series / featured
│   ├── feed/                 #   /feed/ 与 /feed/weekly/ 的视图
│   ├── partials/             #   nav / footer / custom_head / giscus / seo_tags / breadcrumbs …
│   └── _markup/              #   render-heading（标题锚点）/ render-link / render-image
├── themes/hugo-bearneo/      # ★ 上游主题副本，**别随手改**
├── assets/js/                # giscus.js / code-copy.js（只在需要的页加载）
├── data/
│   ├── runs.json             # 跑步数据（/run/ 在读）
│   └── image-dims.json       # 正文图片真实宽高
├── static/                   # 原样发布：_headers / _redirects / 图标 / images
├── functions/_middleware.js  # Cloudflare Pages Functions：订阅源内容协商
├── scripts/                  # 12 个脚本：发布前检查、链接检查、Garmin 同步、图床尺寸 …
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
| 🦶 | 页脚 | `hugo.toml` 的 `copyright` / `copyrightNote` / `licenseName` / `licenseURL` / `[params.footer]`；结构在 `partials/footer.html`（四行：Made with → Copyright → 订阅行 → 英文授权行） |
| 🏠 | 首页文案 | `content/_index.md` |
| 🔢 | 首页列几篇 | `hugo.toml` 的 `homeRecentCount`（当前 5，设 0 不显示） |
| 📐 | 首页列表的对齐 | `partials/custom_head.html` 第 04 段（`padding-left: 0` 保证与标题左对齐） |
| 💰 | 支持页 / 换赞赏码 | `content/donate.md` + `custom_head.html` 第 08 段。⚠️ 换码后去 Cloudflare Purge `/images/donate/*` |
| 🔗 | 链接页（朋友 / 聚合站 / 点评） | `content/roll.md` —— 全站唯一的链接页，一条平铺 13 项，格式 `名称：一句话点评` |
| 👤 | 关于页 | `content/about.md`（纯 Markdown，**没有头像**） |
| 🎨 | **颜色 / 字体 / 宽度 / 圆角** | `themes/hugo-bearneo/layouts/partials/style.html` 的 `:root`（改上游，改完在 DESIGN.md 第 5 节登记） |
| 📝 | 正文排版（标题间距 / 中文字体） | `layouts/partials/custom_head.html` 第 02 段 |
| 🍞 | 面包屑 | `layouts/partials/breadcrumbs.html` + `custom_head.html` 第 13 段 |
| 👁 | 独立页是否显示标题 | front matter 的 `hideTitle: true`（`/roll/` `/about/` 开着） |
| 📚 | 文末「系列」/「相关文章」/「上一篇 下一篇」 | `_default/single.html` + `custom_head.html` 第 09 / 10 段 |
| 🗂 | 「系列」入口 / 总览页 | 入口 `_default/archive.html`；总览页 `_default/series.html` + `content/series.md` |
| 🎲 | 404 页 | `layouts/404.html` + `custom_head.html` 第 15 段 |
| 🔗 | 标题锚点 / 孤行保护 | `_markup/render-heading.html`（只文章页）+ `partials/orphan-safe.html`（全站） |
| ⬆️ | 返回顶部 | `partials/back-top.html` + `custom_head.html` 第 16 段 |
| 📋 | 代码复制按钮 | `assets/js/code-copy.js` + `partials/code-copy.html` + 第 18 段 |
| 📄 | 分页 | **全站都不分页**（上游不用 `.Paginate`）。旧地址由 `static/_redirects` 301 兜底 |
| 📖 | 目录 | **>1200px** 桌面端右侧悬浮（`custom_head.html` 第 20 段）；**≤1200px 没有目录** |
| 🖼 | 图标 | `static/favicon.svg`（全站唯一图标） |
| 💬 | 评论 | `hugo.toml` 的 `[params.giscus]`；单篇用 `comments: false` 关掉 |
| 📊 | 统计 | `hugo.toml` 的 `[params.analytics]`（GoatCounter，挂在 `custom_head.html` 末尾） |
| 🖼 | 分享图 | `hugo.toml` 的 `params.images`（**全站同一张** `share.webp`）+ `ogImageWidth` / `ogImageHeight`（当前 1200 / 630，换图要跟着改） |
| 🔎 | **SEO 头**（canonical / OG / JSON-LD） | `layouts/partials/seo_tags.html` —— 整份覆盖上游同名 partial：删掉 `keywords` 与不生效的微数据，改按页型输出 JSON-LD |
| ↩️ | 加 301 / 改缓存头 | `static/_redirects`（首条命中即生效）/ `static/_headers` |
| ➕ | 加根级独立页 | `content/xxx.md`（`hideDate: true` + `toc: false`；纯工具页再加 `noindex: true`）+ 回 `_headers` 补缓存规则 |

## 📝 写与发

```bash
hugo new content/posts/文章名.md           # 周刊：hugo new content/weekly/周刊-第N期.md
```

按 `archetypes/posts.md` 的清单填 front matter，把 `draft` 改成 `false` 就发布。

| 字段 | 作用 |
| --- | --- |
| `date` | 决定 URL（`/posts/年/月/日/slug/`） |
| `slug` | 决定 URL 最后一段 |
| `series` | **在用**：文章页「系列坐标带」+ `/archive/` 入口 + `/series/` 总览都读它（一篇只能属于一个系列） |
| `tags` | 标签行 + 归档页标签云 |
| `categories` | 面包屑第三段（**周刊刻意不加**） |

日常一条命令：

```bash
up                          # 或 cd ~/Blog && ./publish.sh
```

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
| `sync-garmin.yml` | 每天 22:00（Asia/Taipei）拉一次跑步数据，写进 `data/runs.json` |

## 🧭 站点现状

<details>
<summary><b>点开看具体数字（截至 2026-11-07，随内容增长会变）</b></summary>

| 项 | 数量 |
| --- | --- |
| 文章（`content/posts/`） | 109 篇 |
| 周刊（`content/weekly/`） | 28 期 |
| 合计 | **137 篇** —— 周刊也走 `/posts/:year/:month/:day/:slug/`，所以线上 `/posts/` 下共 137 个文章页 |
| 分类 | 8 个（健康 / 周刊 / 学习科研 / 工具 / 思考 / 记录 / 运动 / 饮食） |
| 标签词条页 | 219 个 |
| 系列 | 6 组 |
| 草稿 | 0 |
| 产出 HTML | 379 个文件（Hugo 报 384 页，含 XML / JSON 输出） |
| 首页体积 | 6592 B，gzip 2918 B |

- 每页都有 JSON-LD（首页 `WebSite` / 文章页 `BlogPosting` / 独立页与 404 `WebPage` /
  section 与词条 `CollectionPage`）。
- **`noindex, follow`** 覆盖标签词条、`/privacy/`、`/posts/`、`/donate/`、`/wechat/`、404 与
  `/feed/` 那两页；**分类词条页 2026-10-26 起可索引**。
- **og:image 全站同一张** `share.webp`（1200×630）。

</details>

## 📜 变更时间线

<details>
<summary><b>点开看这个站是怎么长成现在这样的</b></summary>

| 日期 | 改了什么 |
| --- | --- |
| 2026-10-10 | 整站从**自建主题**迁移到上游 hugo-bearneo；主题文件逐字节未改，站点特有内容全部走 `layouts/` 覆盖 |
| 2026-10-11 | 周刊回到导航；`links.md` 删除、友链并入 `roll.md`；`/donate/` 搬回；清理 125 张按 slug 分的 og 图，改成全站一张 `share.webp` |
| 2026-10-12 | **四个子站（run / shot / share / profile）全部下线**，`sites/` 与 `scripts/build-subdomains.sh` 从仓库删除；导航撤掉 `Hub`，内容并入 `/about/` 与 `/run/` |
| 2026-10-13 | 移除 `issue`（周刊期号）字段；删掉 PWA 五件套图标 |
| 2026-10-14 | 加载速率审计并全部实施：新增 `partials/seo_tags.html`（删掉 `keywords` 与不生效的微数据，改按页型输出 JSON-LD）、图片放大换成不重复 `<img>` 的方案。首页全页 gzip 5941 → 5082 B，全站 `<img>` 节点 644 → 323 |
| 2026-10-15 | **浏览器打开 RSS 换了实现**：Chromium 正在移除 XSLT，所以撤掉 `static/rss.xsl` 与 feed 顶部的 `<?xml-stylesheet?>`，改由 `functions/_middleware.js` 内容协商到 `/feed/` 与 `/feed/weekly/` |
| 2026-10-25 | 首页 `Hi!` 从 h2 升到 h1、`Recent Posts:` 升到 h2（与 h1 不跳级） |
| 2026-10-26 | 分类词条页开放索引 |
| 2026-11-02 | 删除手机端折叠目录，不恢复 |
| 2026-11-03 | 关于页撤掉「内容平台」一节（入口只留首页那一行）；「上一篇 / 下一篇」只给非系列文章；词条页与 `/weekly/` 不再挂搜索框 |
| 2026-11-05 | 新增 `/featured/` 精选页（`layout: "featured"`，与 `/series/` 同一套做法） |
| 2026-11-07 | 新增 `/wechat/` 公众号二维码页（`noindex`）；首页平台入口加了 X |

> 更早的历史：`git log --all` 。子站源码没有迁移到别处，需要时 `git show <commit>:sites/README.md` 取回。

</details>

## 📄 许可

文章内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) —— 署名、非商业性使用、相同方式共享。
页脚那行由 `hugo.toml` 的 `copyrightNote` / `licenseName` / `licenseURL` 三个参数拼出。

代码部分随意取用。

---

<div align="center">

**[🌐 hulatu.com](https://hulatu.com/)** ・ **[📮 订阅](https://hulatu.com/index.xml)**

<sub>Hugo · Cloudflare Pages · 无广告 · 无追踪 Cookie</sub>

</div>
