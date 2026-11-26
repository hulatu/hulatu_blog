# 维护手册 —— hulatu.com

> 设计相关在 [DESIGN.md](DESIGN.md)；操作步骤、文件地图与验收清单在本文件。
> 两边同一次改动里同步。

---

## 0. 现状速览

> 当前生效的字号 / 颜色 / 行高以 [DESIGN.md 第 0 节](DESIGN.md) 为唯一真值。
> **会随内容变化的数字只写在下面这个自动区块里**（`scripts/sync-status.py` 生成，`publish.sh` 发布前自动刷新）；
> 区块下面那张手写表只讲口径和约定，不再写数量。

<!-- status:begin（scripts/sync-status.py 自动生成，别手改） -->
源码统计每次重算；构建统计取自上一次干净构建（`./deploy.sh`）的 `public/`。这里之外出现的数字都是带日期的历史记录。

| 项 | 当前值 |
| --- | --- |
| 内容 | 文章 **113** 篇 + 周刊 **31** 期 = **144** 个内容页（另有 2 个 section index，共 146 个 Markdown）；草稿 0 篇 |
| 分类 | 8 个：思考 40 / 周刊 31 / 工具 22 / 记录 19 / 运动 13 / 学习科研 10 / 饮食 5 / 健康 4 |
| 系列 | 3 组 23 篇：跑步 14 / 综述写作 5 / 居家流水账 4 |
| 根级独立页 | 15 个（`content/*.md`，不含首页 `_index.md`） |
| 站点层 | `layouts/` 55 个文件 + `assets/js/` 8 个 + `assets/css/` 3 个 |
| 主题副本 | `themes/hugo-bearneo/` 27 个文件 |
| 脚本 | `scripts/` 16 个；GitHub Actions 2 个 |
| 301 | `static/_redirects` 17 条 |
| 产出 HTML | 408 个 |
| sitemap | 164 条 |
| 标签词条页 | 235 个（`noindex`） |
| CSS | `/css/main.min.*.css` 75.1 KB，gzip 15.4 KB |
| 全站 JS | `/js/site.min.*.js` 22.4 KB，gzip 7.8 KB |
| 搜索索引 | `/index.json` 141.7 KB，gzip 62.4 KB |
| 文章页 HTML | 中位数 25.2 KB，gzip 9.4 KB |
| 首页 HTML | 11.5 KB，gzip 4.7 KB |
<!-- status:end -->

| 项 | 值 |
| --- | --- |
| Hugo | `0.170.0`（本机 / GitHub Actions / Cloudflare 三边一致；**0.170 起没有 extended 版了**，别再装 `Hugo.Hugo.Extended`） |
| 主题 | `themes/hugo-bearneo/`；`style.html` 是 `assets/css/theme.css` 的镜像，有 **4 处登记改动**（正文行高 1.5、visited 与 link 同色、删除未启用的 upvote CSS、深色改用 `[data-theme]`），其余逐字节未改（`diff -r` 验过） |
| 代码高亮 | `[markup.highlight] noClasses = false`（**必须是 false**）+ 站点层第 12 段配色 |
| 站点层 | `layouts/` + `assets/js/` + `assets/css/`（个数见上面的自动区块）；另有 `data/` 下的词表与站点数据。逐文件用途见 DESIGN.md 第 5 节 |
| 页面 | HTML 页 + `/index.json`（搜索索引，不是 HTML）。个数见上面的自动区块，或 `find public -name '*.html' | wc -l` |
| 内容 | 文章 + 周刊（数量见上面的自动区块）+ 根级独立页与 `/feed/` 两页（订阅源浏览器视图，`noindex`） |
| 订阅源 | `/index.xml`（文章 20 条）+ `/weekly/index.xml`（周刊 20 条），**都只收文章页**；浏览器直开由 `functions/_middleware.js` 分派到 `/feed/` 那两页，订阅器照旧拿 XML |
| 站内搜索 | 全站搜索走 ⌘K / `/` 命令面板（脚本 `assets/js/palette.js`，对话框 `partials/custom_body.html`），读 `/index.json`（`layouts/index.json` 生成，全部内容页，字段 `t/u/g/h/k/d` = 标题 / 路径 / 标签 / h2·h3 章节 / 关键词 / 引用框），按标题 > 章节 > 关键词 > 引用四级打分，章节与关键词命中显示「章节 · …」「相关 · …」。⚠️ 索引只在面板第一次打开时 fetch；别改成进页面或聚焦就拉 |
| 词条页 | 标签与分类的词条页数量以 `ls public/tags | wc -l` / `ls public/categories | wc -l` 为准（会随标签合并变化）；标签页 `noindex, follow`，分类页可索引并进 sitemap。索引页 `/tags/` 已关；`/categories/` 是正式总览页（普通内容页 `content/category.md`） |
| sitemap | 构成 = 内容页 + 根级/列表页 + 分类词条页 + `/categories/` 总览页；与 noindex 页**零交集**。条数见上面的自动区块，或 `grep -c '<loc>' public/sitemap.xml` |
| CSS | **外部指纹文件** `/css/main.min.<hash>.css`（theme.css + custom.css + upgrade.css 按序拼接，体积见上面的自动区块），`/css/*` 长缓存 |
| JS | **全站 `/js/site.min.<hash>.js`**（`assets/js/palette.js` + `hello.js` + `toc.js` + `motion.js` 拼接，`<head>` 里 defer，`/js/*` 长缓存）+ giscus + 代码块复制按钮（后两个按需加载）。内联只剩主题引导、GoatCounter 加载器、Speculation Rules 与 JSON-LD |
| 构建 | 干净构建 **0 警告** |
| URL | 文章与周刊都落在 `/posts/…`；301 规则（`static/_redirects`，条数见上面的自动区块）：6 条 slug 兜底 + 4 条分页 + `/now/` + `/friends/` `/links/` + `/media/` `/stats/` + `/tags/` + `/colophon/` → `/map/`（`/categories/` 不再 301） |

### 体积基线（复测方法）

CSS 现在是一个外部文件 `/css/main.min.<hash>.css`，全站 JS 是 `/js/site.min.<hash>.js`（当前体积见第 0 节自动区块，`python3 scripts/sync-status.py --print` 可直接看）。手动复测：

```bash
find public/css -name 'main.min.*.css' -exec wc -c {} \;
gzip -9 -c public/css/main.min.*.css | wc -c
```

HTML 体积按页型抽样即可。不要再用「内联 `<style>` 逐档 gzip」的旧口径 —— 产物里没有内联主题 CSS。

---

## 1. 文件地图

```
hugo.toml                 站点配置（导航、参数、permalinks、输出格式、版本约束）
deploy.sh                 生产构建 → public/（干净构建 + livereload 自检 + rsync --delete）
publish.sh                提交 + 推送（git add 前先跑几个同步脚本，见第 2 节）
DESIGN.md / MAINTENANCE.md / README.md
CHANGELOG.md              变更记录：删过的文件、下线的子站、改动时间线（正文只写现状）

content/
  _index.md               首页正文（Hi! + 题记 + 简介 + 「支持」链接 + 四个平台链接行）
  about.md roll.md privacy.md archive.md donate.md run.md           根级独立页（含 style / map / series /
                          tools / featured / wechat / contact 两页）
  style.md map.md         样式样本 / 地图（入口 + 本站说明）
                          style.md 的 front matter 有 `longForm: true`，让样本页吃到
                            与文章相同的正文样式（尤其引用框）；它不是长文页
                          map.md 同时收技术栈、排版、评论与隐私、站史（旧 /colophon/ 301 到这里）
                          roll.md 是**唯一的链接页**：13 条（前 3 条朋友、后 10 条
                            组织/聚合站），用 `.roll-group` 标签分组，页面标题「收藏」；
                            页尾还有交友原则与本站友链信息。
                          run.md：`layout: "run"` →
                            layouts/_default/run.html，数据读 data/runs.json
  posts/                  文章 + _index.md（noindex，纯内部页）
  weekly/                 周刊 + _index.md（单独开 RSS 输出）
  feed/                   /feed/ 与 /feed/weekly/ —— 订阅源的「浏览器视图」的两个壳
                          （_index.md + weekly.md，**只有 front matter**：noindex + feedScope；
                          内容全在 layouts/partials/feed-view.html。⚠️ 别挂进导航）

archetypes/
  posts.md weekly.md      新建文章的模板（含发布前检查清单）

layouts/                  ★ 站点层覆盖（另有 data/ 下的词表与站点数据）
  index.html                        首页（上游只有 {{ .Content }}；简介**不包 <content>**）
  sitemap.xml                       ★ 按 $noindex 过滤（336 → 134 条）
                                    ⚠️ 过滤条件必须与 _default/baseof.html 的 $noindex 逐字同口径
  _partials/opengraph.html          ★ 覆盖 Hugo **内置**的 _partials 命名空间
                                    —— 按 slug 取 images/og/<slug>.png，取不到回落 share.png
  _partials/twitter_cards.html      ★ 同上（twitter:image 必须与 og:image 同源）
  _default/baseof.html              LanguageCode → Language.Locale + 补回 robots 分支
                                    + skip-link + <main id="main" tabindex="-1">
                                    + 长文页的 .print-url
  _default/single.html              去掉 `if eq .Type "blog"` 门槛 + hideDate/hideTitle
                                    + 文末三选一：「系列坐标带」→ 相关文章 → 「上一篇/下一篇」
                                    + 评论区
                                    ⚠️ 目录：末尾 `<div class="toc">`（>1200px）；
                                       正文顶部 `<details class="toc-mobile">`（≤1200px）。
                                       两块共用 $tocEnabled，媒体查询在 custom.css 第 20 / 46 段。
  _default/list.html                5 处文案英译中；列表本体调 partials/post-list.html
                                    ⚠️ 搜索框不在这里（/archive/ 顶部的也已删除）
  partials/post-list.html           按年分组 + orphan-safe 标题，list / archive 共用
  _default/rss.xml                  ★ 首页 feed 只收文章页 + atom:updated / category /
                                    摘要 description / 全文 content:encoded + pageLimit 20
                                    + <image> 站点图标（144×144 PNG，走
                                    params.feedIcon；必须在 <item> 之前）
  _default/archive.html             ★ /archive/ 列表页 + 顶部「系列」一行入口（→ /series/）
                                    + 底部标签：≥3 篇的常显、其余折叠（个数随标签变化）
  _default/series.html              ★ /series/ 系列总览页
  _default/run.html                 ★ /run/ 跑步数据页（2026-10-12 从子站搬入）
  shortcodes/home-stats.html        ★ 首页「文章数 / 周刊数 / 运行天数」内联文本
  shortcodes/writing-stats.html     ★ About 底部的字数统计 + 365 天热力图（纯构建期）
  shortcodes/mail-link.html          ★ 正文邮箱浮层：调 partials/hello.html
                                    （/about/ 的「写信」；页脚「问候」同源）
  feed/list.html                    ★ /feed/ —— 订阅源浏览器视图（section 页）
  feed/single.html                  ★ /feed/weekly/ —— 同一个视图（普通页）
                                    ⚠️ 两个文件名都要有，否则周刊那页会掉进
                                    _default/single.html 被渲染成「文章」
  _default/_markup/render-link.html ★ 只为去掉 `</a>` 后面那个换行
  _default/_markup/render-image.html ★ 给正文 <img> 补真实 width/height
                                    （读 data/image-dims.json）
                                    ⚠️ 2026-10-14：overlay 不再重复一个 <img>，
                                    URL 走 figure 上的 --zoom-src 画背景（省一半节点）
                                    ⚠️ 2026-10-25：加 srcset(400/720/1080) + 图床
                                    边缘转换(/cdn-cgi/image/width=W,format=auto,
                                    quality=82/) + 首图 fetchpriority=high。
                                    实测省 47–71%，见 DESIGN.md 8.5
  partials/nav.html                 完全由 [[menu.main]] 驱动（7 项）
                                    + aria-current="page"（精确匹配 RelPermalink）
  partials/header.html              ★ 站名从 <h1> 换成 <p class="title">
                                    —— 文章页原本有**两个 h1**（站名 + 文章标题，134/344 页）
                                    ⚠️ <p> 与 <h1> 的默认样式差四处（color/font-size/
                                       font-weight/margin），全靠 custom_head 第 00c 段补
                                    ⚠️ 别给 <a> 加 display:block，会改变点击区域
  partials/favicon.html             ★ head 里输出 6 条 link
                                    （SVG / 512 / 192 / apple-touch / ico / manifest）
                                    ⚠️ href 用 **`relURL`**（原来 `absURL`）
                                       —— 这 6 条只服务当前这个 HTML 页，同源即可；
                                       绝对地址在将来做镜像域名时会把 6 个请求拽回慢域名
                                    ⚠️ 上游只输出 1 条 shortcut icon，且本站指向 SVG
                                       ⇒ 订阅端与图标聚合服务拿不到图（不吃 SVG、
                                       /favicon.ico 又是 404），表现为「订阅里的头像
                                       和网站不一样」，站内完全看不出来
                                    ⚠️ 光栅四件套全部由 static/favicon.svg 生成，
                                       改图标只改 SVG 再跑 DESIGN.md 8.6 那几行
  partials/footer.html              版权独立成行 + 订阅行挪到第 3 行
                                    + copyrightNote/licenseName/licenseURL
                                    + 「打个招呼」浮层（partials/hello.html、
                                      assets/js/hello.js，样式在 custom.css 第 48 段）
  partials/custom_head.html         CSS 管道（theme → custom → upgrade.css）+ site.js + 主题引导 +
                                    图床预连 + 单个 theme-color + GoatCounter
                                    ⚠️ 样式段号全部在 assets/css/custom.css；
                                       `.hl-*` 升级包组件在 custom_head 末尾，别混
                                       空号 03 / 06 / 11 / 27 / 34 / 35 保留编号，不再复用
                                    ⚠️ 手机端折叠目录在 custom.css 第 46 段，标记在 single.html 中段
  partials/feed-view.html           ★ 订阅源浏览器视图：标题 + 简介 +
                                    订阅地址 + 条目「日期/标题/摘要」
                                    ⚠️ 页面集合口径必须与 _default/rss.xml 逐字一致
  partials/orphan-safe.html         孤行保护（标题末 2 字包 nowrap）
  partials/back-top.html            返回顶部（只长文页，纯 CSS、零 JS）
  partials/code-copy.html           代码块复制按钮的脚本引入（只含代码的页）
  partials/breadcrumbs.html         ★ 面包屑（+ BreadcrumbList JSON-LD），只给文章页
  partials/seo_tags.html            ★ SEO 头：覆盖上游同名 partial
                                    —— 删 keywords / name=title / 整套微数据，
                                    换按页型分四类的 JSON-LD，补 og:image 宽高
  partials/giscus.html              评论区（无外框，只剩「评论」+ 细线「＋ 变 －」）
  404.html                          ★ 404 页（上游只有两行字）

assets/js/giscus.js       评论区脚本（只在挂评论的页加载）
assets/js/code-copy.js    代码块复制按钮（只在含代码块的 5 页加载）
assets/js/footnote.js     脚注就地预览（只在含脚注的页加载，判断在 partials/footnote.html）
assets/js/mermaid-init.js Mermaid 图的渲染：浅、深两份 SVG（只在有 mermaid 代码块的页加载）
assets/js/vendor/mermaid.min.js  Mermaid 11.17.2 本体（3.6 MB，本站自带，不连 CDN；升级见 partials/mermaid.html）

themes/hugo-bearneo/      ★ 上游副本；style.html 有 4 处登记改动（见 DESIGN.md 第 5 节），其余逐字节未改

static/
  _headers _redirects     Cloudflare 的响应头 / 301 规则（条数见第 0 节自动区块）
  manifest.webmanifest    PWA 清单（name/图标/主题色），head 的 <link rel=manifest> 在 favicon.html。
                          ⚠️ 手写 JSON 不能写注释（见 DESIGN.md 第 5 节）
  favicon.* icon-*.png    站点图标（favicon.svg / .ico、apple-touch-icon、icon-192/512）
  images/                 share.png（兜底 og:image，params.images 引用）
                          + og/（按 slug 的分享卡，每篇一张）
                          + feed-icon.png（RSS <image>，params.feedIcon）
                          + donate/（2 张收款码）+ wechat/ 与 gzh.webp（公众号页）
                          ⚠️ og/ 是**离线生成、提交进仓库**的派生数据，publish.sh 每次重画

functions/                ★ Cloudflare Pages Functions
  _middleware.js            订阅源的内容协商：浏览器导航 /index.xml → /feed/ 的 HTML，
                            订阅器 → 原样 XML。⚠️ 这是整套方案唯一会**静默失效**的一环

data/                     runs.json（/run/ 页）· featured.yaml（/featured/ 主编导读）· tools.yaml（/tools/）
                          image-dims.json / image-colors.json（render-image.html 的宽高与占位色）
                          pinyin.json（heading-slug.html 的拼音锚点字表）· inline-links.json（正文自动内链）
                          ⚠️ 全部在用，别当孤儿删
scripts/                  脚本，见第 4 节
.github/workflows/        build.yml（构建校验）/ sync-garmin.yml（每日同步跑步数据，兼全站每日重建）
```

> 删掉的文件、下线的子站及其来龙去脉见 [CHANGELOG.md](CHANGELOG.md)；要取回旧文件，用 `git log --diff-filter=D --name-only` 定位提交。

---

## 2. 构建 / 预览 / 发布

```bash
hugo server -D          # 本地预览（-D 显示草稿）
```

⚠️ **`hugo server` 开着会持续覆盖 `public/`**。`deploy.sh` 会检测 1313 端口并警告，但**不会替你停** —— 要部署先停它。

### 干净构建（验收用）

```bash
hugo --gc --minify --cleanDestinationDir --destination /tmp/hb-check
```

四个坑：

- **本仓 `minifyOutput = true`** → **不存在「不压缩的构建」**，想拿未压缩产物做对照是浪费时间。
- **`hugo --gc --minify` 不删 `public/` 里的陈旧文件** → 表现像「改了没生效」。一律加 `--cleanDestinationDir` 或构建到临时目录。
- `--destination /tmp/xxx` **不碰 `public/`**，是唯一能在 server 开着时安全验收的办法。
- **别用 `hugo --quiet` 做验收** —— 它会把「构建失败」藏起来，而失败时 `--cleanDestinationDir` 不执行，你会读到上一次的产物。**必须看输出里有没有 `ERROR`。**

### 生产发布

```bash
./deploy.sh     # 干净构建到临时目录 → 查 livereload → rsync -a --delete 到 public/
./publish.sh    # git 提交 + 推送（终端敲 up 同效）
./publish.sh "修复导航样式"  # 指定提交信息；不传参数时交互终端会提示，直接回车用默认值
```

默认提交信息：改动全在 `content/` 时为「博客：新增/修改文章」，否则为「博客：更新站点」。

`publish.sh` 在 `git add` 前依次跑四个脚本（失败都不阻断发布）：

```
sync-pinyin.py           补 data/pinyin.json 缺的汉字（标题锚点用；只写 JSON）
sync-lastmod.py          刷改过的文章的 lastmod
sync-image-dims.py       补抓新图尺寸 → data/image-dims.json      ← 2026-10-18 接入
gen-og.js                全量重画分享卡 → static/images/og/       ← 2026-10-18 接入
```

⚠️ **2026-11-22**：脚本正式跑之前先查 `.git/index.lock` 和未完成的 rebase，发现就立即退出；
`git add` 失败也会停止（旧版不检查退出码，会打印「没有需要提交」并把 push/pull 带偏）。
`sync-lastmod.py` 刷新改过的文章的 `lastmod`：文章页「更新于」、RSS、sitemap、JSON-LD `dateModified` 都读它。
⚠️ 后两个是「**离线生成、提交进仓库**」的派生数据，**没有构建期钩子**：Hugo 拿不到图床图片的尺寸，也算不出分享卡。漏跑时**构建 0 警告**，只是静默降级（分享卡退回通用图 / `<img>` 缺宽高）。2026-10-18 实测到过真实的漏：129 篇文章只有 127 张卡。
⚠️ 为什么**不**放进 `deploy.sh`：`sync-image-dims.py` 要联网抓图床，而「构建零网络依赖」是本站的架构底线（图床挂了也要能构建）。

### 新建文章

```bash
new posts/我的新文章       # = bash scripts/new-post.sh posts/我的新文章
new weekly/周刊-27
hugo new content/posts/我的新文章.md   # 同效，建完也会自动打开
```

`scripts/new-post.sh` 会套 `archetypes/` 模板（`draft: true`）、同名文件**不覆盖只打开**、然后用 `open` 走系统默认应用。
`hugo new …` 能自动打开，是因为 `~/.config/zsh/.zshrc` 里有一个同名 `hugo()` 包装函数：只拦截 `new` 子命令，建完解析出
`Content "<路径>" created` 里的文件再 `open`；其余子命令（`hugo server`、`hugo --minify`）原样透传，`hugo new site` / `new theme` 不打开。
⚠️ 命令 `new` 和 `hugo` 包装函数都在 `~/.config/zsh/.zshrc`（不在仓库里）—— 换机器要重新加一次；脚本本体在仓库里，可以直接 `bash scripts/new-post.sh …`。

### 边缘函数（Cloudflare Pages Functions）

`functions/_middleware.js` **不在 Hugo 构建里** —— 它由 Cloudflare Pages
在部署时打包，只在线上生效，`hugo server` 预览不到、本地也没有等价的测试环境。

```bash
# ① 浏览器视角：应返回 HTML 订阅页（这两个头缺一不可）
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' \
  -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' \
  -H 'Sec-Fetch-Dest: document' https://hulatu.com/index.xml
#   期望：200 text/html; charset=utf-8

# ② 订阅器视角：应原样返回 XML
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' \
  -H 'Accept: application/rss+xml, application/xml;q=0.9, */*;q=0.8' \
  https://hulatu.com/index.xml
#   期望：200 application/rss+xml

# ③ 周刊那一路同样要通
curl -s -H 'Sec-Fetch-Dest: document' -H 'Accept: text/html' \
  https://hulatu.com/weekly/index.xml | grep -c 'feed-view-title'
#   期望：>0（说明拿到的是 /feed/weekly/ 的 HTML，而不是 XML）
```

⚠️ **前提**：Cloudflare Pages 项目的 **Functions 目录**必须是默认的 `functions`（仓库根）。
被改过、或 Functions 被关掉，上面 ① 会返回 `application/rss+xml`（浏览器打开 feed 退回 raw XML），
而**部署与构建都不会报错** —— 这是整套方案唯一的静默故障点，改完务必跑一次上面的核对。
⚠️ 判据**只认 `Sec-Fetch-Dest: document`**（现代浏览器顶层导航才带的头），`Accept` 只是它缺席
时的退路。**别**改成「Accept 里含 text/html 就返回 HTML」：有些订阅器会带 text/html，
那样它们会拿到 HTML —— 静默坏掉，用户完全察觉不到。
⚠️ 两页在 Hugo 侧设了 `noindex`，函数响应又补了 `X-Robots-Tag: noindex, follow`；别去掉。
⚠️ 响应头（`Cache-Control` / `Vary`）写在函数代码里 —— `static/_headers` **不作用于函数响应**
（它只管静态资源）。改了别只改 `_headers` 那一份。

### CI

- `.github/workflows/build.yml`：push / PR 时用同一个 Hugo 版本**只构建主站**，并检查中文标题锚点是否补齐。
- `.github/workflows/sync-garmin.yml`：每天 00:10（Asia/Taipei；UTC `10 16 * * *`）拉跑步数据写 `data/runs.json`。白天跑的要到次日 00:10 才上 `/run/`，急着看就在 Actions 里手动 Run workflow。
- **每日重建靠 `sync-garmin.yml`**：它「记录本次同步」一步无论 Garmin 成败都会写 `runs.json` 的 `checked` → 每天必有提交 → Cloudflare 必重建（Garmin 失败时 job 照样标红通知）。⚠️ 停掉它、改 cron、或删掉那一步，首页「运行 N 天」、写作天数、热力图就会停在最后一次构建。⚠️ 公开仓库连续 60 天无提交会被 GitHub 停用 schedule —— 有了每日自动提交，这条不会触发。

---

## 3. 内容约定

### 文章 front matter（`archetypes/posts.md`）

| 字段 | 状态 | 说明 |
| --- | --- | --- |
| `title` / `date` / `slug` | ✅ | |
| `lastmod` | ✅ | 喂 RSS / sitemap，以及文章页日期行的「更新于」（`lastmod` 晚于 `date` 且日历日不同才显示） |
| `summary` | ✅ | 列表 / 首页摘要；`description` 留空时兜底 |
| `description` | ✅ | `<meta name="description">` + OG/Twitter 卡片 |
| `categories` / `tags` | ✅ | 词条页仍生成；`/categories/` 有总览页，`/tags/` 索引页已关 |
| `series` | ✅ | 文章页文末坐标带 + `/archive/` 一行入口 + `/series/` 总览页。⚠️ 字符串语义（一篇只能属一个系列）；旧文档说它「已作废」是过时的 |
| `comments` | ✅ | `false` 关掉该篇评论区 |
| `draft` | ✅ | |
| `toc` | ✅ | `false` 关掉**两侧目录**。闸门 `default .Site.Params.toc .Params.toc`，`hugo.toml` 的 `params.toc = true` → 不写 `toc` 的页（`/about/` `/privacy/`、文章页）>1200px 有右侧悬浮目录、≤1200px 有正文顶部折叠目录 |
| `hideDate` | ✅ | `true` 藏掉页面日期行（`date` 字段仍要留） |
| `mermaid` | ⛔ 不用写 | 2026-11-23 起页面里有 `mermaid` 代码块就自动加载画图脚本，这个字段不再读（全站没人写过） |
| `menu` | ✅ | 有值时 `single.html` 不输出 `<h1>` / 日期行 |

### 周刊 front matter（`archetypes/weekly.md`）

- `categories: ["周刊"]` 默认已填；没有 `issue`（期号）字段，期号写在标题「第N期」里。
- 周刊 URL 也落在 `/posts/YYYY/MM/DD/slug/`（`[permalinks]` 里 `weekly` 与 `posts` 同规则）—— **刻意，不是 bug**。

### 三个必须记住的规矩

1. **加根级独立页时写 `hideDate: true` + `toc: false`**（短页面挂目录是纯噪音；侧栏只在 >1200px 显示）；纯工具页再加 `noindex: true`；新页不用改 `static/_headers`（`/*` 已统一给 HTML 300 秒缓存）。
2. **中文标题的锚点不用管** —— 在构建期自动生成拼音 id（`#wei-he-zhi-zhe-yu-wei`），md 里**只写 `## 标题`**，不要再写 `{#xi-guan}`。唯一要记的是：新文章用了 `data/pinyin.json` 里没有的汉字时，跑一次 `python3 scripts/sync-pinyin.py` 补字（需要 macOS 拼音库），否则那一节会回退成 `#%e4%b9%a0%e6%83%af`。
3. **`noindex: true` 是生效的**（站点层 `baseof.html` 有 robots 分支，上游没有），覆盖 219 页 = 213 标签词条 + 8 分类词条 + `/privacy/` + `/posts/` + `/donate/` + 404。
   ✅ **sitemap 也排除了**：`layouts/sitemap.xml` 的四个判据与 `baseof.html` 的 `$noindex` 同口径，336 条 → 134 条。
   ⚠️ 两处的判据**必须逐字一致** —— 漂移时构建 0 警告，只是「提交给爬虫的地址」和「页面上的 noindex」对不上。

---

## 4. 常见任务 → 改哪儿

| 想做的事 | 去哪儿 |
| --- | --- |
| 改导航（增删项 / 改标签 / 换落点） | `hugo.toml` 的 `[[menu.main]]`，**不用碰模板**（当前 **7 项**：首页 `/` / 关于 `/about/` / 邻居 `/roll/` / **工具 `/tools/`** / 周刊 `/weekly/` / 文章 `/archive/` / 订阅 `/index.xml`）。⚠️ 7 项在 375–390px 下是**零余量**（刚好一行、差 0px），换字体渲染略宽的设备会折成两行 —— 这是可接受的降级，**别再压 gap 或字号** |
| 改首页文案 | `content/_index.md` |
| 改首页身份条 | `content/_index.md` 的 `{{< home-stats >}}` + `layouts/shortcodes/home-stats.html`。⚠️ shortcode 只输出**纯文本 + 句号**，必须和「支持一下」同段；**不要加 span/class/`<br>`/样式**（用户 2026-11-20 明确要求正常显示、连起来）。天数靠每天的构建前进（由 `sync-garmin.yml` 每天 00:10 的自动提交触发，过零点就 +1）；文章/周刊数在发布时自然更新 |
| 改首页列表条数 | `hugo.toml` 的 `homeRecentCount`（设 0 退回上游原样） |
| 改**首页最新周刊块** | `layouts/index.html` 的 `.latest-weekly`。取 weekly section 最新一篇，期号从标题「第N期」解析，导语取 front matter 的 `summary`；样式在 `custom.css` 第 53 段。⚠️ 最近更新列表**只取 posts**，周刊只在这个块出现，别把周刊加回列表（同一期会重复两次） |
| 改**精选导读页** | `data/featured.yaml`（唯一数据源：intro / groups / items.file + note）+ `layouts/_default/featured.html`（样式第 53 段）。⚠️ `file` 是相对 `content/` 的路径，不是 slug/URL —— 改 slug 不会失联；`where ... "File.Path"` 找不到页面时静默跳过，改完数一遍 `.featured-item` 是否等于条目数。⚠️ 只放 5–8 篇，这一页是「先读这几篇」，不再有 `featured: true` 第二套数据 |
| 改首页列表的对齐 / 间距 | `custom_head.html` 第 04 段。⚠️ 列表必须与 `最近更新：` 标题左对齐（`padding-left: 0`），失效时会缩进 40px；几何值（120px / .95rem / 1.2rem / 1.3 / 2rem）逐值照 yinji，改前想清楚 |
| 改关于页 /「内容平台」一节 | `content/about.md`（纯 Markdown，全站没有头像） |
| 改联系页 / 换 QQ、微信二维码 | `content/contact-qq.md` / `content/contact-wechat.md`（两处 `src` 仍是图床地址）+ `custom.css` 第 38 段（二维码 / 信息条样式）。⚠️ 两个文件用 front matter 的 `url:` 落在 `/contact/qq/`、`/contact/wechat/`；**别改成 `content/contact/` 目录**（会生成一个 `/contact/` 章节列表页）。关于页两个入口分别指过去 |
| 改支持页 / 换收款码 | `content/donate.md`（结构 + 文案）+ `custom_head.html` 第 08 段（样式）。⚠️ 换码后要去 Cloudflare Purge `/images/donate/*`（30 天缓存） |
| 改页脚 | `hugo.toml` 的 `copyright` / `copyrightNote` / `licenseName` / `licenseURL` / `[params.footer]` 四个开关。⚠️ 订阅行末尾那两条友链**不在配置里**，写在 `layouts/partials/footer.html` 的订阅块里（`safeHTML` 存成变量、三个互斥分支各引用一次）。⚠️「打个招呼」浮层是另一套三件套：`partials/hello.html`（标记）+ `assets/js/hello.js`（内联脚本）+ `custom.css` 第 48 段，**三处一起改**。正文 `/about/` 的「写信」走 `shortcodes/mail-link.html`，用的是同一套；脚本遍历所有 `.hello`，别改回 `querySelector` |
| 改**站内跳转预渲染** | `custom_head.html` 末尾那个 `<script type="speculationrules">`。⚠️ `eagerness` 是 `moderate`，**别改成 `eager`** —— 列表页一屏十几个链接会同时预渲染，把带宽吃光。⚠️ 规则里 `href_matches` 写 `/*` 是相对本文档解析的，只命中同源路径；别换成跨源全通配。⚠️ 模板注释里**绝不能出现星号加斜杠的连续两字符**（那就是注释结束符），我这次就写坏过一次，构建直接报 `comment ends before closing delimiter` |
| 改**图标 link 的绝对 / 相对** | `layouts/partials/favicon.html`（6 条全用 `relURL`）。⚠️ 别改回 `absURL`：这 6 条只服务当前 HTML 页，绝对地址在镜像域名下会把请求拽回 hulatu.com。**需要绝对地址的是 feed 里的图标**（走 `params.feedIcon`） |
| 改**图床预连的触发条件** | `custom_head.html` 顶部的图床预连段，条件是 `and (strings.Contains .Content "img.hulatu.com") (strings.Contains .Content "<img")`。⚠️ **两个条件缺一不可**：只判主机名会误命中 `/`、`/about/`、`/privacy/`（那三页里是 `<a href>` 或纯文本）。⚠️ 验收别数 `rel=preconnect` —— giscus 的预连也长这样（135 个长文页都有），会把结论带偏 |
| 改**标签（增 / 删 / 合并）** | 标签只来自各篇的 `tags:` 行，模板一处都不用动 —— `/archive/` 底部由 `layouts/_default/archive.html` 从 `site.Taxonomies.tags` 生成：**出现 ≥3 篇的常显（按篇数降序）**，其余收进「其余标签（N）」折叠（按名称）。⚠️ **删/合并标签必须同时处理 `static/_redirects`**：被删掉的 `/tags/<词>/` 会变成 404，得补 301；删 / 合并时记得同步补 301、删旧词条页。⚠️ 改完数一遍 `/archive/` 的 `class=tag-index` 里 `<a>` **总数**（常显 + 折叠），应等于 `tags/` 目录数（2026-11-23 为 **235**） |
| 改颜色 / 字体 / 宽度 / 圆角 | 升级包配色在 `assets/css/upgrade.css` 的 `--hl-*`（大部分颜色在这里改）；主题基础令牌在 `assets/css/theme.css` 的 `:root`（生效副本，`themes/…/style.html` 是镜像，两处同步，改完在 DESIGN.md 第 5 节登记） |
| 改正文标题的上下间距 / **标题后的 `#`** | `custom.css` 第 02 段。⚠️ h2/h3 后的 `#` **默认常显**、颜色 `--link-color`、字号 1em；触屏也不隐藏；`aria-label` / `title` 带标题文本。别再加「一、二、三」编号。样式在第 19 段，模板输出在 `_markup/render-heading.html` |
| 改**正文段落间距** | `custom.css` 第 02 段末尾的 `content > p { margin-bottom: 1.5em }`（与行高一致：所有阅读页 18px × 1.5 = 27px；旧的 1.75em / 2em 已取消）。⚠️ **必须写 `content > p`**：写成 `content p` 会覆盖上游的 `blockquote p { margin: 0 }`（同特异性、本文件后加载），引用块里凭空多出一行段距。⚠️ **段落本身只写 `margin-bottom`**：给所有 `content > p` 写 `margin-top` 会把「标题 → 正文」的默认间距一起改掉，也会让 /roll/ 首段贴住上方。标题后首段的 `margin-top: 0` 由相邻选择器 `content h2 + p` 等单独处理 |
| 改**长文页引用框** | `custom.css` 第 39-b 段（`content.long-form blockquote`）。构图：3px `--link-color` 左线 + 浅蓝底 + 左上大引号；亮色底 `#eef4fd`、深色 `#1a2230`。⚠️ 只作用于 `posts` + `weekly` —— `single.html` 里 `$longForm` 给 `<content>` 加 `long-form` 类，独立页不挂。⚠️ 引号是 `::before` 绝对定位（5em / opacity .3），正文靠 `padding-left: 3.2em` 绕开，框上 `overflow: hidden` 防溢出；移动端 ≤800px 收到 2em / 3.6em。⚠️ 打印已在同段清掉底色与引号，别在 `@media print` 里另写一套 |
| 改**正文行高 / 字号** | 行高**唯一来源**是 `assets/css/theme.css` 的 `content`（**1.5**）；`themes/.../style.html` 是镜像，两处同步。`custom.css` 第 39 段**不再覆盖行高**。字号：所有阅读页统一 **18px**（`--font-size-primary: 18px`），文章 / 周刊不再单独放大。`body` 那条 1.5 **不要动**（页头 / 导航 / 页脚是外壳，不是阅读面）。改完回读：`content` 应 **18px / 27px**，`content > p` 的 `margin-bottom` 应 **1.5em**，`header nav a` 仍 24px。⚠️ `<content>` 里的**标题也继承这 1.5**；行高改了必须同步复核段间距，否则「段距 = 行距」的约定会破 |
| 改文末「系列坐标带」/「上一篇 / 下一篇」 | 模板 `layouts/_default/single.html`，样式 `custom_head.html` 第 09 / 10 段（**改类名要两边一起改**） |
| 改「系列」入口 / 总览页 | 入口：`layouts/_default/archive.html`，样式 `custom_head.html` 第 09 段；总览页：`layouts/_default/series.html` + `content/series.md`，样式第 09b 段（「点进去才看」） |
| 改归档页底部的标签 | 模板 `layouts/_default/archive.html`（`</ul>` 后那段）+ 样式第 09 段的 `.tag-index*`<br>⚠️ 结构：`<section class="tag-index">` → `<h2>标签</h2>` → `.tag-index-top`（≥3 篇，32 个，`sort ... "count" "desc"`）→ `.tag-index-more`（其余 187 个，默认关闭的 `<details>`，按 `name` 排）<br>⚠️ 显示名用 `$pages.Page.Title`（Hugo 会把 `ai` 标题化成 `AI`），别改成 map 的 key，否则会变回小写<br>⚠️ 别写成 `{{ with .Site.Taxonomies.tags }}` 再 `range .Site.…` —— `with` 重绑 `.`，静默 0 迭代、只留一个空块，**构建 0 警告**<br>⚠️ 链接落 `/tags/<slug>/` 词条页；`/tags/` 索引页是关掉的，别改过去（会 404） |
| 改「系列」带里的序号对齐 | `custom_head.html` 第 09 段的 `.post-series-ord`（`min-width: 1.5em` + `text-align: right`）。不写的话「9」与「11」宽度不同（8.1 vs 16.3px），上下两行标题左端错开 8.1px；只兜得住 2 位 |
| ⚠️ 在 `custom_head.html` 写元素选择器前先数标签 | `grep -c '<nav' public/…/index.html`。2026-10-11 栽过：裸 `nav{display:flex}` 命中一页 5 个 `<nav>`，把 `.post-series` 挤成左右两栏（右边空 208px）、TOC 的 `<ul>` 撑出容器 92.8px。**必须写 `header nav`** |
| 改代码块配色 | `custom_head.html` 第 12 段（浅 / 深两套 `--code-*`）。⚠️ 前提是 `[markup.highlight] noClasses = false` —— 改回 `true` 代码块立刻变回「看不见」 |
| 改**样式样本页** `/style/` | `content/style.md`。它把所有 Markdown 元素排一遍，改字号 / 行高 / 段距 / 引用框后先打开它对照。⚠️ front matter 必须留 `longForm: true`：否则 `<content>` 没有 `long-form` 类，引用框会显示成独立页的旧样式。⚠️ 它不挂目录（`toc: false`），也不是长文页，别加进 `$longForm` 判断 |
| 改**写作统计 / 365 天热力图** | `layouts/shortcodes/writing-stats.html` + `custom.css` 第 51 段，调用点在 `content/about.md` 的「写作统计」。⚠️ 统计口径：posts + weekly、按 `.Date`（不是 lastmod）计数、字数用「汉字每字 + 英文每词」，与 byline 同一套。⚠️ 热力图在构建期生成 365 个 `<span>`，没有 JS；格子尺寸只改 `.writing-stats` 的 `--heat-cell` / `--heat-gap`，不要再去分别改 `.heatmap` 和 `.heat-cell` |
| 改**地图页** | `content/map.md`：上半是全部入口与订阅，下半是本站说明（技术栈、排版、评论与隐私、历史）。`hideDate` + `toc: false`；页脚「地图」指向它。⚠️ 新增栏目或页面时回来更新；`/style/` 与 `/about/` 的链接都在这页。⚠️ 原 `/colophon/` 已并入，`static/_redirects` 里有 301，别再单独建本站页 |
| 改独立页是否显示标题 | front matter `hideTitle: true`。`/roll/` `/about/` 都显示标题；目前只有联系页开着 |
| 改 `/roll/` 两组之间的分组标签 | `content/roll.md` 里的 `<p class="roll-group">朋友</p>` / `<p class="roll-group">组织</p>`，样式在 `custom.css` 第 49 段（小字 + 右侧发丝线）。⚠️ **别改成 `##` 标题**：会进右侧目录、把平铺页切成章节 |
| 改 404 页 | `layouts/404.html`（结构）+ 第 15 段（样式）。⚠️「随便看一篇」是 `shuffle` 构建期抽签 |
| 改标题锚点 `#` | `layouts/_default/_markup/render-heading.html` + 第 19 段。⚠️ **只给文章页**（两边都判 `$longForm`，改一处要一起改） |
| 改孤行保护 | `layouts/partials/orphan-safe.html` + 四处调用；⚠️ **别信「HTML 里有 span 就等于生效」**，`content .nowrap` 那条规则必须有 |
| 改返回顶部 | `layouts/partials/back-top.html` + 第 16 段。⚠️ **零 JS**，靠 `animation-timeline: scroll()` |
| 改脚注弹出预览 | `assets/js/footnote.js` + `custom.css` 第 71 段 + `partials/footnote.html` 的加载判断。⚠️ 状态要在 `beforetoggle` 里改（`toggle` 是异步的、会合并）；⚠️ 链接本身别改成按钮 —— 没有 JS 时要能跳到文末；⚠️ 悬停时长在脚本顶部 `HOVER_OPEN` / `HOVER_CLOSE`（300 / 200ms）；悬停只认 `pointerType === 'mouse'`，别改成 `mouseenter`（触屏点按也会触发） |
| 改代码复制按钮 | `assets/js/code-copy.js` + 第 18 段 + `partials/code-copy.html` 的加载判断（三处类名 / 判据一致） |
| 改公式 / Mermaid / 高亮 / 任务列表 / 行号等扩展语法 | 开关在 `hugo.toml` 的 `[markup.goldmark.extensions.*]` 与 `[markup.highlight]`；公式 `_markup/render-passthrough.html`；Mermaid `_markup/render-codeblock-mermaid.html` + `partials/mermaid.html` + `assets/js/mermaid-init.js`；样式全在 `custom.css` 第 70 段；样例 `/style/`。⚠️ 行内 `$ … $` 刻意没开、下标 `~` 刻意没开，理由写在 `hugo.toml`。⚠️ 别写 `linenos=table` |
| 改「系列」分组口径 | ⚠️ **两处必须同口径**（`series` 字段 + `.ByDate` 升序）：`single.html` 与 `archive.html` |
| 改评论区 | `layouts/partials/giscus.html` + `assets/js/giscus.js` + 第 07 段 |
| 改 robots / `noindex` | **`layouts/partials/noindex.html`**（是唯一判定处，`baseof.html` 与 `sitemap.xml` 都调它）。⚠️ 改完两处会同时生效，不需要再手动对齐；口径见 DESIGN.md 8.9 |
| 改首页那行平台链接 | `content/_index.md`（**地址的真相在 `content/about.md` 的「内容平台」段，两边一起改**） |
| 改链接页（加朋友 / 加聚合站） | `content/roll.md` —— **全站唯一的链接页**，用 `<p class="roll-group">` 分成「朋友 / 组织」两组<br>⚠️ 条目格式 `- [名称](地址)：一句话点评`<br>⚠️ `</a>` 和中文冒号之间**不要手写空格**（`render-link.html` 已处理）<br>⚠️ 分组标签**别改成 `##` 标题**（会进目录、破坏平铺）；页尾还有「交友原则 / 我的友链信息」 |
| 加根级独立页 | `content/xxx.md`（`hideDate` + `toc: false`）；缓存已由 `_headers` 的 `/*` 统一处理 |
| 加一个工具 / 改工具页文案 | **`data/tools.yaml`**（每项 `name` / `tagline` / `icon` / `repo`；模板 `layouts/_default/tools.html` 自动渲染，图标在 `partials/tool-icon.html`，样式 `custom.css` 第 41 段）。⚠️ `tagline` **必须写成一行**：用 YAML 的 `>-` 折行会在中文里插空格（「头条 要清洗」），构建不报错、编辑器里也看不出来；⚠️ 加新图标要同时在 `tool-icon.html` 里加分支 |
| 隐藏 / 恢复滚动条 | **`assets/css/custom.css` 第 42 段**（`* { scrollbar-width: none }` + 全局 `::-webkit-scrollbar`）。⚠️ **必须用 `*`，不能只写 `html`** —— Chrome 实测 `scrollbar-width` **不继承**（`getComputedStyle('.table-wrap')` 仍是 `auto`），只写 `html` 的话 Chromium 被 `::-webkit-scrollbar` 兜住看不出问题、**Firefox 却会在表格和图表里继续显示滚动条**（见 DESIGN.md 8.4）；⚠️ 隐藏的只是**指示条**，`overflow` 一个都没动，滚轮 / 触控板 / 方向键全部照常；⚠️ 类选择器会盖掉 `*`，所以第 34 段 `.chart` 的 `scrollbar-width: thin` 已删，**别再写回去** |
| 加 301 | `static/_redirects`（**首条命中即生效**，splat 要排在精确路径之后） |
| 改响应头 / 缓存 | `static/_headers` |
| 换 favicon / 站点图标 / 分享图 | **母版是 `~/Documents/生活素材/图片/H_avatar.jpg`**：按 DESIGN.md 8.6 的步骤用 potrace 描摹成 `static/favicon.svg`，再跑第 3 步生成 `icon-512/192.png`、`apple-touch-icon.png`、`favicon.ico`、`images/feed-icon.png`，最后**把 `partials/favicon.html` 里的 `$iconV` 加 1**（不加等于没换，浏览器 7 天内不会重抓）。（feed `<image>` 用，路径在 `hugo.toml` 的 `params.feedIcon`，宽高在 `rss.xml` 里写死 144）。⚠️ 光栅图**别手工裁**，会和 SVG 分叉；⚠️ 改完阅读器要手动刷新图标（订阅时抓一次就长期缓存）。分享图是 `static/images/share.png`（只是**兜底** `og:image`，由 `params.images` 引用，和文章卡一样由 `scripts/gen-og.js` 生成，改文案改脚本里的 `siteSvg()`；文章页各有一张 `static/images/og/<slug>.png`，由 `scripts/gen-og.js` 生成，`publish.sh` 每次重画）。⚠️ 换兜底图后改 `hugo.toml` 的 `params.ogImageWidth` / `ogImageHeight` 跟上（`seo_tags.html` 读这两个参数输出 og 宽高）。⚠️⚠️ **拼 `favicon.ico` 那句必须带 `-type TrueColorAlpha`**：少了它每层只剩 3–4 种颜色，抗锯齿全丢，浏览器标签页就是阶梯锯齿 —— 默认浏览器 Helium 走的是 `/favicon.ico` 而不是 SVG，所以这条链路一错，标签页必糊。见 DESIGN.md 8.6 |
| 改 SEO 头（keywords / JSON-LD / og / referrer / theme-color） | `layouts/partials/seo_tags.html`（2026-10-14 新增，整份覆盖上游同名 partial）。⚠️ `theme-color` 现在只有一条 `<meta id="hl-theme-color">`（`custom_head.html`），由 `assets/js/palette.js` 的 `applyTheme()` 在深浅色切换时改；`color-scheme` 与 `input{font-size}` 在第 26 段；`referrer` 在 `baseof.html`。⚠️ 上游那份是「HTML 规范还在 2015 年」的写法，**别回退** |
| 改分享卡片图 / JSON-LD 的 `image` | **`layouts/partials/og-image.html`**（是唯一取值处，`og:image` / `twitter:image` / JSON-LD `image` 三处都调它）。⚠️ 返回的是**绝对 URL**，调用方不要再套 `absURL` |
| 改分类页的标题 / 描述 | `content/categories/<词>/_index.md`（8 个，2026-10-26 新增）。⚠️ `title` 必须写，否则 `<title>` 会退化成「 \| 胡拉图说」；标签页没有对应文件（它们仍是 noindex） |
| 改引用框 / 提示框 | 普通引用：`custom.css` 第 39-b 段；提示框：`layouts/_default/_markup/render-blockquote.html`（类型 → 默认中文标题）+ `custom.css` 第 61 段（颜色变量 `--callout-*`）。⚠️ 提示框必须仍输出 `<blockquote>`（搜索索引按它收「引用」）；标题用 `<b>` 不用 `<strong>`（否则进关键词）。样例页 `/style/`。⚠️ 自定义标题后面紧跟中文正文时，Hugo 会把正文并进标题（中文换行设置导致），钩子里有补救；嵌在别的引用里的提示框补救不到，在标题下面空一行 `>` 即可 |
| 改站内搜索（索引内容 / 匹配规则 / 触发时机） | 索引 `layouts/index.json`（字段 `t/u/g/h/k/d`，`hugo.toml` 的 `[outputs] home` 含 `"JSON"`），前端只有命令面板（脚本 `assets/js/palette.js`，对话框 HTML 在 `layouts/partials/custom_body.html`）。⚠️ 索引 **约 137 KB / gzip 约 61 KB**（只收标题、章节、关键词、引用，不再收正文），命令面板只在呼出时 fetch（鼠标悬停在「搜索」按钮上也会预取，只认鼠标、只一次）；**别改成进页面或聚焦就拉**；⚠️ 拿不到索引时要让面板有可见反馈，不能静默变成「搜不出东西」；⚠️ 面板匹配顺序是标题 > 章节 > 关键词 > 引用，改规则要同步 DESIGN 8.7 |
| 改分享卡上的日期 / 作者 / 标签（`article:*`） | `layouts/_partials/opengraph.html`。⚠️ 只对 `posts` / `weekly` 输出，首页与列表页的 `og:type` 是 `website`，挂 `article:*` 非法；⚠️ `article:author` 按协议是**作者主页 URL**（本站指 `/about/`），不是名字 |
| 改「更新于」的显示条件 / 日期行排版 | `layouts/_default/single.html` 日期行（`$showUpdated`）。⚠️ 判据是「`lastmod` 晚于 `date` **且** 日历日不同」，不是「差 24 小时」——当天发当天改的两个日期长得一样，显示出来是噪音；⚠️ 日期行是 flex 一行（`.byline`，`custom.css` 第 39 段），日期、更新、时长、字数之间用间距分开，不用中点串 |
| 改 Web App Manifest（名称 / 图标 / 主题色） | `static/manifest.webmanifest`。⚠️ 它是**手写 JSON、不能写注释**（加了整份解析失败且静默），所有取舍理由写在 `layouts/partials/favicon.html` 那段注释里；⚠️ `purpose` 别加 `maskable`（图标笔画贴边会被裁）；⚠️ `id` 一旦发布别再改 |
| 改正文内链（加 / 删锚点词） | **`data/inline-links.json`**（`{a: 锚点, u: 目标URL}`）+ 逻辑在 `layouts/partials/inline-links.html`（挂在 `single.html` 的 `$content` 管线末尾）。⚠️ 加词条前先确认 ① 锚点逐字出现在**其他**文章正文里、② 锚点之间**不互为子串**（否则嵌套 `<a>`）、③ 目标 URL 拿产物目录当真值核对 —— 三条都栽过（见 DESIGN.md 8.10）。⚠️ 数据键带连字符，模板里必须 `index hugo.Data "inline-links"`，写成 `hugo.Data.inlineLinks` 会**静默 nil、0 警告**；⚠️ Hugo 0.168 没有 `strings.ReplaceAll`，用 `strings.Replace … -1` |
| 改图片放大（放大方式 / 键盘可达性） | 结构在 `layouts/_default/_markup/render-image.html`（`--zoom-src` 挂在 figure 上），样式在第 26 段 ④⑤。⚠️ overlay 是**空壳**（只有 `class`，没有 `<img>`）；`.image-zoom-toggle` 那条**必须带 `display`**，只写定位会让上游的 `display:none` 留下、checkbox 又变回不可聚焦 |
| 改文末「相关文章」 | 模板 `single.html` 的 ② 段 + 第 09 段的 `.post-related*` 规则 + **`hugo.toml` 的 `[related]`**（权重 / 阈值都在那）。⚠️ 文末三块**互斥**：系列带 → 相关文章 → 上一篇/下一篇，只渲染第一块成立的；相关文章不再显示推荐理由，右侧恢复日期。⚠️ 改阈值前先数产物里 `.post-related` 有几个 —— 2026-10-05 那次就是吃默认 `threshold = 80` 导致**一条都推不出来**、构建 0 警告。现在 20，非系列长文 120/120 篇有相关文章 |
| 改图片加载（srcset / 边缘转换 / 首图优先） | `layouts/_default/_markup/render-image.html`（一个文件搞定四件事，见 DESIGN.md 8.5）+ `custom_head.html` 顶部的 `preconnect`。⚠️ `quality=82` 是目视比过的，别往 70 以下调（截图类图片会出色带）；⚠️ 首图 `fetchpriority="high"` **不能同时带 `loading="lazy"`**，同时写 high 会被忽略；⚠️ `sizes` 里的 `680px` = `body` 的 720 减左右各 20 padding，改布局宽度要回来改它 |
| 改订阅源（feed 字段 / 浏览器打开 feed 时那一页） | ① feed 本身：`layouts/_default/rss.xml`；② 浏览器视图：`layouts/partials/feed-view.html` + `content/feed/`（只有 front matter）+ `custom_head.html` 第 28 段；③ 谁分派：`functions/_middleware.js`。⚠️ ①② 的**页面集合口径必须逐字一致**（`site` / `weekly` 两套），不一致就是「网页比订阅少一篇」且**构建 0 警告**；③ 改完按第 2 节「边缘函数」跑一遍线上核对 —— 它是**静默失效**的 |
| 改周刊页的计数行 / RSS 订阅入口 | `layouts/_default/list.html`（`$isWeekly` = Kind section + Section weekly；`#post-count` 是 `<span>`、订阅链接在它**外面**）。⚠️ 订阅入口是**普通文字链接，不要加样式**（2026-10-14 用户看过带边框 + 图标的徽章后要求简化）；⚠️ 归档页搜索框已删除，没有脚本再改写 `#post-count`，但**仍别把链接塞进 span** —— 与归档页保持同一套结构口径 |

### `scripts/` 现状

| 脚本 | 状态 |
| --- | --- |
| `sync-pinyin.py` | ✅ 在用（2026-11-04 取代 `add-heading-anchors.py`）。只维护 `data/pinyin.json`，**不改 md**；CI 也跑 `--check`。云端构建机是 Linux、没有拼音库，所以这张表必须本机补好再提交 |
| `sync-garmin.py` / `garmin-token.py` | ✅ 在用（每日 CI 同步跑步数据 → `data/runs.json`） |
| `sync-lastmod.py` | ✅ 在用：发布前刷新**这次真正改过**的文章的 `lastmod`（文章页「更新于」、sitemap、JSON-LD `dateModified` 都读它）。⚠️ 一次要刷超过 10 篇就**一篇都不写**并报警（全站维护几乎不可能是内容修订；`--bulk-ok` 放行），`featured` / `comments` 字段改动不算修订。起因：2026-09-28 / 10-13 / 10-26 / 11-05 / 11-21 五次批量误刷，11-21 那次 143/144 篇一起显示「更新于」，已从 git 历史恢复 |
| `sync-image-dims.py` | ✅ 在用（HTTP 探测图床图片真实宽高 → `data/image-dims.json`，供 `render-image.html` 消费）。**在 `publish.sh` 里自动跑**，只补缺的 |
| `check-cache.sh` | ✅ 在用（2026-10-25 新增，**手动跑**）。自查线上首页是否被边缘缓存锁住：打 `/` 与 `/?cb=随机` 对比 `cf-cache-status` + 内容指纹，命中就打印后台 Purge / Edge TTL 的操作路径。退出码 0=正常 / 1=被锁 / 2=网络拿不到。⚠️ 不进 `publish.sh` —— 它依赖外网，而发布流程要能离线跑 |
| `check-links.sh` | ✅ 在用：构建后检查站内路径和页内锚点；`deploy.sh` 会调用，CI 也跑同一套 lychee 参数。未安装 lychee 时本地脚本提示并跳过 |
| `check-html.sh` | ✅ 在用（2026-11-15 新增，**CI 已接入**）：查八类问题 —— 同页重复 id、同名 landmark、`<img>` 缺 alt、标题跳级、锚点 `aria-label` 全同、产物含 livereload/localhost、打印字号被屏幕 px 覆盖、文字/背景对比度低于 4.5。只依赖 python3，不需要 lychee。用法 `bash scripts/check-html.sh public`；不给目录就临时构建一份。⚠️ 本机若开着 `hugo server`，它会往 `public/` 注入 livereload 与 localhost，脚本会（正确地）报「产物污染」—— 验收请用 `./deploy.sh` 或临时目录构建。退出码 0=干净 / 1=有问题 / 2=环境问题。⚠️ 与 `check-links.sh` 分工不同：那个查「指向的东西存不存在」，这个查「结构本身对不对」，**别合并**（依赖面不一样） |
| `gen-og.js` | ✅ 在用（2026-10-17 重写，2026-10-18 接入 `publish.sh`）：每篇文章一张 1200×630 分享卡 → `static/images/og/`。⚠️ 依赖 sharp，`publish.sh` 会自己找 `node` 与 `NODE_PATH`。**增量**：按每张卡的 SVG 原文算 sha1，记在 `resources/og-cache.json`（本机缓存，已 gitignore），标题 / 日期 / 版式都没变就跳过；改了版式会自动全部重画；`--force` 强制全量 |
| `new-post.sh` | ✅ 在用：`new posts/xxx` 建文件 + 用系统默认应用打开；`hugo new …` 由 `.zshrc` 里的 `hugo()` 包装函数做到同样效果。两个函数都在 `~/.config/zsh/.zshrc`，不在仓库里 |
| `backup-blog.sh` / `cleanup-junk.sh` / `_frontmatter.py` | ✅ 工具 |
| `sync-status.py` | ✅ 2026-11-22 新增：把篇数 / 文件数 / sitemap / 体积写进本文第 0 节和 README「站点现状」的自动区块，并更新 README 徽章。`publish.sh` 发布前自动跑；`--check` 只检查，`--print` 只打印。构建统计读**上一次** `./deploy.sh` 的 `public/`，`hugo server` 的开发版产物会被识别并跳过 |
| `sync-image-colors.py` | ✅ 2026-11-23 新增，`publish.sh` 在 `sync-image-dims.py` 之后自动跑：图床把每张图缩成 24×24 JPEG → macOS 自带 `sips` 转 BMP → 取平均色，写 `data/image-colors.json`。`render-image.html` 把它输出成 `--ph`，图片加载前的占位块就是这张图的主色（第 64 段）。只补缺的；`--all` 全部重算；不是 macOS 或断网就跳过 |
| `migrate-layouts.py` | 🕓 一次性：把 `layouts/` 迁到 Hugo 0.146+ 的新结构（`_partials` / `_shortcodes` / `_markup`、`_default/` 下的模板提到根目录）。**自带验收**：改前改后各构建一次逐字节比对（404.html 除外），不一致就自动回滚；一致才改写文档里的旧路径，再构建复核一次。`--dry-run` 只列计划。跑完可删 |
| `backup-images.py` | ✅ 2026-11-22 新增：由 `backup-blog.sh` 调用，把正文引用的 `img.hulatu.com/post/` 原图增量镜像到 `<备份目录>/images/`，附 `manifest.tsv`（地址 / 路径 / 字节 / sha256）。仓库里没有这些图，不跑它等于没备份图片。`SKIP_IMAGES=1` 可跳过 |

---

## 5. URL、重定向与缓存头

### URL 不变量（改任何东西之前先守住这几条）

- 文章 / 周刊：`/posts/YYYY/MM/DD/slug/`（126 条，由 `[permalinks]` 生成）
- 根级页：`/`、`/about/`、`/roll/`、`/privacy/`、`/archive/`、`/weekly/`、`/donate/`、`/run/`
- 订阅源浏览器视图：`/feed/`、`/feed/weekly/`（2026-10-15 新增，`noindex`，**不进导航**；
  线上由 `functions/_middleware.js` 把浏览器导航的 `/index.xml` 分派到这里，订阅器不受影响）
- 词条页：`/tags/<tag>/`（213）、`/categories/<cat>/`（8）
- `/posts/` 存在但 `noindex`，且全站没有页面链到它 —— 导航的 `Posts` 指的是 `/archive/`

**验收方式**：改完构建到 `/tmp`，用 `find . -name '*.html' | wc -l` 与当前基线（403）对比，并抽查 URL 是否仍与线上一致。

### `_redirects`（Cloudflare，首条命中即生效）

| 规则 | 为什么 |
| --- | --- |
| 4 条带句点 / 大写的文章旧址 | 历史 URL 兜底 |
| `/page/1/` → `/`，`/page/*` → `/archive/` | 首页分页取消 |
| `/weekly/page/1/`、`/weekly/page/*` → `/weekly/` | 周刊分页取消 |
| `/friends/` → `/roll/`、`/links/` → `/roll/` | 友链页并进收藏页，两条都直接指终点，不串两跳 |
| `/categories/` → 正式总览页；`/tags/` → `/archive/` | 标签索引页用 `disableKinds` 关掉（精确匹配，不误伤词条页）；`/categories/` 由 `content/category.md` 占位，**不要恢复 301** |
| `/media/` → `/`，`/stats/` → `/archive/` | 两页随自建主题删除 |

⚠️ 加 splat 规则时，精确路径（`/x/1/`）必须写在 splat（`/x/*`）**前面**。

### `_headers`

- `/*` 统一输出安全头，并给 HTML 默认缓存 `public, max-age=0, s-maxage=300, must-revalidate`。
- 静态资源用**更具体的规则覆盖**，但必须先 `! Cache-Control` 再重设：Cloudflare 会把所有匹配规则的响应头合并，只写新值会得到冲突的 `Cache-Control`。
  - `/images/*` 30 天；`/js/*` `/css/*` 一年 + immutable（文件名带哈希）。
  - `/favicon.svg` 与 4 个根级图标 / manifest 7 天（文件名不带哈希，不能 immutable）。
  - `/robots.txt` 1 天。
- `/index.xml` `/weekly/index.xml` `/sitemap.xml` 只 `max-age=0, must-revalidate`。
- `/index.json` 与 `/feed/*` 沿用 `/*` 的 300 秒。
- `functions/_middleware.js` 与 `/stats/` 的响应不吃 `_headers`，缓存头写在函数里。
- 新增**根级页**不用改这里；新增静态目录才需要加一条 detach 规则。改完跑 `scripts/check-cache.sh`。

### ⚠️⚠️ HTML 边缘缓存：300 秒

`_headers` 里的 `s-maxage=300` 会被 Cloudflare 后台的 Cache Rule / Edge TTL 覆盖；后台不改，仓库里写什么都不生效。

**正确状态**：Cache Rules 里有一条**显式**规则 ——

- 表达式：`(http.host eq "hulatu.com" and (http.request.uri.path eq "/" or ends_with(http.request.uri.path, "/")))`
- 缓存资格：**符合条件则缓存**
- 边缘 TTL：**300 秒**
- 不要保留 `bypass_cache_for_html`

**判据（改完必须复核）**：

```bash
bash scripts/check-cache.sh          # 退出码 0 才算过
curl -sI "https://hulatu.com/about/?cb=$RANDOM" | grep -iE "cf-cache-status|^age|cache-control"
#   cache-control: public, max-age=0, s-maxage=300, must-revalidate
#   cf-cache-status: HIT      ← 目标：命中边缘
#   age: 137                  ← 目标：< 300
```

- `DYNAMIC` = 还没进缓存（规则没命中，或刚 Purge 过，等第二次请求）
- `BYPASS` = 后台还有「绕过缓存」规则
- `HIT` 且 `age` 是**几万秒** = 另有更长的 TTL 规则，回到后台检查

**只删 Bypass 不够**：默认状态下 HTML 不进边缘，必须显式缓存。`DYNAMIC` 时 Purge 没用 —— 没有副本可清；只有 `HIT` + `age` 很大时 Purge 才有意义。

其他约定：

- 300 秒是刻意的小值，给「后台配错、首页被锁成旧版」兜底；可以调到 600，**别超过 900**。
- 顺序：先改后台规则 → 点 **Deploy** → 再 **Purge** 一次 `/`。旧副本不会自动失效。
- `img.hulatu.com` + `/cdn-cgi/image/` 那条规则**保持不动**：图片管线吃 1 年边缘缓存靠它。
- 仓库里没有 wrangler、没有 `CF_API_TOKEN`，`deploy.sh` / `publish.sh` 都**不 purge**。
- 本机到这个 POP 经常 timeout，**别把请求失败当成没上线**；用带随机查询串的方式才准。
- `functions/_middleware.js` 对缓存**无能为力**：命中边缘时请求根本进不到函数层。

---

## 6. 坑

### Hugo / 构建

1. **`disableKinds` 必须写在任何 `[table]` 之前**，否则被并进那张表，只吐一句 `WARN Unknown kind "disablekinds"` 然后**静默失效**（关 `/tags/` 索引页就靠它；词条页 kind `term` 仍生成）。
2. **`hugo --config /tmp/x.toml` 会破坏主题解析**（`themesDir` 相对站点根），症状是**静默产出一个没有主题的站**。别这么干。
3. **`minify` 会剥属性引号**（`href=/about/`）、**去前导零**（`0.32s` → `.32s`）、**不压 `rgba()` 里的空格** → 按压缩后写法 grep 会**假阴性**。先 `findall` 打出真实写法再判。
4. **Go 模板注释里绝不能出现 C 风格注释收尾符**（星号紧跟斜杠）：`{{/* … */}}` 被提前收掉，后面跟右花括号时**不报错**，注释后半段当文字输出 → 落在 `<style>` 里就吞掉紧随其后的那条 CSS 规则（实例：吞掉 `.recent-posts{padding-left:0}` → 首页缩进 39px，已复发 2 次）。**哨兵：`<style>` 块里不该出现任何中文**（第 7 节第 4 条）。
5. **`hugo --quiet` 会把构建失败藏起来**，而失败时 `--cleanDestinationDir` 不执行 → 读到上一次产物（症状「改了没生效」，被骗过两次）。改完必须看输出里有没有 `ERROR`。

### 模板 / 布局查找

6. **`/archive/` 是普通内容页，不是 section**，要用 `layout: "archive"` 指到 `layouts/_default/archive.html`。⚠️ 别删 `content/archive.md` 里那一行（删了就回落到 `single.html`，变成「只有正文」的空壳）；也别改成 `content/archive/_index.md`（section 的 `.Pages` 是它自己的子页，空数组，列表渲染成「这里还没有内容」）。
7. **普通内容页的模板查找顺序是 `layouts/<type>/<layout>.html` → `layouts/_default/<layout>.html`**，根级 md 的 `type` 是 `page`。文件名本身不参与查找，必须靠 front matter 的 `layout` 指。
8. **`with` 重绑定 `.`** → 里面的 `.Site` 废掉、静默 0 迭代（产物空块、0 警告）。写法：先 `{{- $x := .Site.Taxonomies.tags }}`，再 `{{ if $x }}{{ range $k, $v := $x }}`。

### 内容 / 渲染

9. **Goldmark 默认丢裸 `<iframe>`**（文章里有腾讯视频嵌入）→ `unsafe = true` 已开。
10. **`{#pinyin}` 锚点是 Goldmark 原生语法**，不依赖自定义 heading 钩子 —— 删掉 `_markup/render-heading.html` 之后它照常工作。
11. **`{{ .Summary }}` 在 `<meta content>` 里带 `<h1>` 是假阳性**，`--minify` 会重选引号并反转义。判据是用真 HTML 解析器读两种产物比对解析后的值。

### 工具链（本项目用法，跨项目通用）

12. **BSD grep 不支持 `\|` 交替** —— `grep "a\|b"` 会**静默返回空、不报错**，据此得出「没有 X」的结论会错（本站被坑过两次）。用 `grep -E` 或 Grep 工具。
13. **`&&` 串的校验会静默跳过后面** —— 前面一个 `grep -c` 返回 0（退出码 1）就断链了。独立检查用 `;`。
14. **标签配平必须用 `html.parser.HTMLParser`**，别手写正则 —— 正则会把压缩产物里 `<a href=/about/>` 末尾那个 `/` 当成自闭合斜杠，于是每个 `<a>` 都不进栈，报出一堆 `stray </a>` 的假崩。
15. **数「N 处」必须从工具输出回读**（`len(re.findall(...))`），别凭印象。**报 ✗ 时先怀疑正则**：`re.search` 只取第一个同名选择器；`@media[^{]*\{(.*?)\n\}` 会停在第一个 `\n}`；压缩产物上 `@media print \{.*?\n\}` 一次都不匹配。验收脚本一律 `findall`。
16. **源码注释会引用旧值**，查「旧值还在不在」先 strip 注释（`re.sub(r'/\*.*?\*/', '', s, flags=re.S)`）。

---

## 7. 验收清单

改完之后至少跑这几条（全部实测过，命令可直接复制）。先跑第 1 条，**看输出里有没有 `ERROR`**（别用 `--quiet`）。

```bash
# 1) 干净构建（应 0 警告；有 ERROR 时 --cleanDestinationDir 不执行，读到的是旧产物）
hugo --gc --minify --cleanDestinationDir --destination /tmp/hb-check
```

```bash
# 2) 标签配平 + 缺 h1 + data-page-node-id 注入 + 图片宽高 / %!d 哨兵
#    用 html.parser.HTMLParser，不要用正则
python3 - <<'PY'
import glob, re
from html.parser import HTMLParser
VOID={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
class B(HTMLParser):
    def __init__(s): super().__init__(); s.st=[]; s.bad=[]
    def handle_starttag(s,t,a):
        if t not in VOID: s.st.append(t)
    def handle_endtag(s,t):
        if t in VOID: return
        if s.st and s.st[-1]==t: s.st.pop()
        else: s.bad.append(t)
bad=h1=inj=fig=img=dim=lazy=badd=0
for f in glob.glob('/tmp/hb-check/**/*.html',recursive=True):
    x=open(f,encoding='utf-8',errors='replace').read()
    p=B(); p.feed(x)
    if p.bad or p.st: bad+=1
    if '<h1' not in x: h1+=1
    if 'data-page-node-id' in x: inj+=1
    fig += x.count('<figure')
    for m in re.finditer(r'<img\b[^>]*>', x):
        t=m.group(0); img+=1
        if 'width=' in t and 'height=' in t: dim+=1
        if 'loading=lazy' in t.replace('"',''): lazy+=1
    if '%!d' in x: badd+=1   # Go 模板 %d 喂 float64：构建 0 警告的静默残缺
print(f"不配平={bad} 缺h1={h1} 注入={inj} (都应 0)")
print(f"figure={fig} img={img} 带宽高={dim} (=img) lazy={lazy} %!d页={badd} (应 0)")
PY
# ⚠️ 21 段 img{height:auto} 不在时，旧产物 21 张图会塌成 720x2px
# 期望值（2026-11-23 实测）：figure=378 img=384 带宽高=384 lazy=296，其余都是 0
#   img 比 figure 多的是不经 render-image.html 的图（如直接写在 Markdown 里的收款码），它们没有 figure
# ⚠️ img 远大于 figure（接近 2 倍）就是图片放大 overlay 又在重复渲染 <img>（见 DESIGN.md 8.5）
```

```bash
# 3) URL 未变（和迁移前基线对比）
cd /tmp/hb-check && find . -name '*.html' | sed 's#^\./##' | sort > /tmp/urls-now.txt
comm -23 /tmp/urls-before.txt /tmp/urls-now.txt   # 只应剩 8 个刻意删除的地址
```

```bash
# 4) 内联 CSS 体积（Python gzip 口径）+ 样式块中文哨兵（应 0 页）
python3 -c "
import re,glob,gzip
t=g=0; bad=[]
for f in glob.glob('/tmp/hb-check/**/*.html',recursive=True):
    s=open(f,encoding='utf-8',errors='replace').read()
    for b in re.findall(r'<style[^>]*>(.*?)</style>',s,re.S):
        t+=len(b.encode()); g+=len(gzip.compress(b.encode(),9))
        if re.search(r'[\u4e00-\u9fff]',b): bad.append(f)
print(f'{t/1024:.0f} KB / gzip {g/1024:.0f} KB   中文泄漏={len(bad)}')"
# 期望：总量与第 0 节的页数吻合；中文泄漏 0
# （模板注释提前收尾会泄漏中文并吞掉紧随的 CSS 规则，见第 6 节第 4 条）
```

```bash
# 5) 行内链接 / 文末三选一 / 归档入口 / 系列页 / roll / 代码块配色 / 页面标题
#    在仓库根目录运行（b、d 要读 content/ 里的 series 字段）
python3 - <<'PY'
import re, glob, os
from collections import Counter
D = '/tmp/hb-check'
rd = lambda p: open(p, encoding='utf-8', errors='replace').read()
pages = {os.path.relpath(f, D): rd(f) for f in glob.glob(D + '/**/*.html', recursive=True)}
arts = {k: v for k, v in pages.items() if re.fullmatch(r'posts/\d{4}/\d\d/\d\d/[^/]+/index\.html', k)}
main = lambda s: (re.search(r'<main[^>]*>(.*?)</main>', s, re.S) or re.search(r'(.*)', s, re.S)).group(1)
has = lambda s, c: bool(re.search(r'class=["\']?' + c + r'[\s>"\']', s))
series = Counter()
for f in glob.glob('content/posts/*.md') + glob.glob('content/weekly/*.md'):
    m = re.search(r'^series:\s*"?([^"\n]+?)"?\s*$', rd(f), re.M)
    if m: series[m.group(1)] += 1
print('a) </a>+换行+中文标点 (0):', sum(len(re.findall(r'</a>\n[，。：；！？、）」』》〈【（]', s)) for s in pages.values()))
combo = Counter((has(s, 'post-series'), has(s, 'post-related'), has(s, 'post-nav')) for s in arts.values())
n_ser = sum(v for k, v in combo.items() if k[0])
print(f'b) 文末三选一：长文 {len(arts)} 篇 | 系列带 {n_ser}（应 = 带 series 的文章 {sum(series.values())}）'
      f' | 相关文章 {sum(v for k, v in combo.items() if k[1])} | 上一篇/下一篇 {sum(v for k, v in combo.items() if k[2])}'
      f' | 一块都没有或多于一块的页 (0): {sum(v for k, v in combo.items() if sum(k) != 1)}')
a = main(pages['archive/index.html'])
pc = re.search(r'<span id=post-count>共 (\d+) 篇</span>', a)
print('c) 归档计数行 N =', pc and int(pc.group(1)), '(应 = 长文数)',
      '| 分类 / 系列入口:', re.findall(r'<a class=series-entry href=([^ >]+)', a), "(应 ['/categories/', '/series/'])",
      '| 随机入口 (1):', a.count('id=archive-random'))
sp = main(pages['series/index.html'])
print('d) /series/ 组 / 篇:', len(re.findall(r'<section class=series-group[\s>]', sp)), len(re.findall(r'class=series-article-ord', sp)),
      f'(应 {len(series)} / {sum(series.values())})')
ro = main(pages['roll/index.html'])
print('e) /roll/ h1 (1):', len(re.findall(r'<h1[\s>]', ro)),
      '| 分组标签:', re.findall(r'<p class=roll-group>([^<]*)', ro), "(应 ['朋友', '组织', '交友原则', '我的友链信息'])",
      '| 分割线 hr (0):', len(re.findall(r'<hr', ro)))
css = ''.join(rd(f) for f in glob.glob(D + '/css/main.min.*.css'))
code = [k for k, s in pages.items() if 'class=chroma' in s]
print('f) 代码块配色规则在外置 CSS 里 (True):', '--code-keyword' in css,
      '| monokai 内联色残留 (0):', sum(1 for s in pages.values() if '#f8f8f2' in s or '#272822' in s),
      f'| 含代码块的页 {len(code)} / 其中加载复制按钮的 (应相等): {sum(1 for k in code if "code-copy" in pages[k])}')
for n in ['roll', 'about', 'privacy', 'donate']:
    print(f'g) /{n}/ 页面标题 (各 1 个):', [re.sub(r'<[^>]+>', '', h) for h in re.findall(r'<h1[^>]*>(.*?)</h1>', main(pages[n + '/index.html']), re.S)])
PY
# 期望（2026-11-23 实测）：a 0；b 长文 144 = 系列带 23 + 相关文章 121 + 上一篇/下一篇 0，多块/无块 0；
#   c 144、两个入口、随机 1；d 3 / 23；e h1 1、四个分组标签、hr 0；f True / 0 / 8 = 8；
#   g 收藏 / 关于 / 隐私政策 / 支持
# ⚠️ 页面结构是 `<main id=main tabindex=-1>`（skip-link 的落点），别再按裸 `<main>` 匹配
# ⚠️ 判断「有没有某块」要带类名边界：`post-series` 不能误中 `post-series-ord`（脚本里的 has() 已处理）
# f) 是「代码块看不见」的哨兵：noClasses 被改回 true 时
#    #f8f8f2 / #272822 这两个 monokai 内联色会重新出现
```

```bash
# 6) 面包屑：可见段数 与 JSON-LD 段数必须自洽（JSON-LD = 可见段 + 当前文章）
#    ⚠️⚠️ 2026-10-14 起文章页有**两个** ld+json 块：seo_tags.html 的 BlogPosting 在前、
#    breadcrumbs.html 的 BreadcrumbList 在后。所以**必须按 @type 挑** BreadcrumbList 那一个，
#    不能用 re.search 拿「第一个」—— 拿到 BlogPosting 会全判不合格（构建 0 警告，静默）。
python3 - <<'PY'
import json, glob, re
from collections import Counter
n_ok=n_bad=0; shapes=Counter()
for f in glob.glob('/tmp/hb-check/posts/**/index.html',recursive=True):
    x=open(f,encoding='utf-8',errors='replace').read()
    nav=re.search(r'<nav class=breadcrumbs.*?</nav>',x,re.S)
    if not nav: continue
    seg=len(re.findall(r'<li>',nav.group(0))); shapes[seg]+=1
    blocks=[json.loads(b) for b in re.findall(r'<script type=application/ld\+json>(.*?)</script>',x,re.S)]
    ld=next((b for b in blocks if b.get('@type')=='BreadcrumbList'),None)
    ok=(ld is not None and len(ld['itemListElement'])==seg+1
        and [i['position'] for i in ld['itemListElement']]==list(range(1,seg+2))
        and ld['itemListElement'][0]['name']=='首页')
    n_ok+=ok; n_bad+=(not ok)
print('面包屑页面 (应 = 内容页数):',n_ok+n_bad,'| JSON-LD 合格/不合格 (应 全部/0):',n_ok,'/',n_bad)
print('可见段数分布 (应 {3: 文章数, 2: 周刊数}；2026-11-23 为 {3:113, 2:31}):',dict(shapes))
PY
```

```bash
# 6b) ★ SEO 头哨兵（对应 DESIGN.md 8.8）
python3 - <<'PY'
import glob, re
from collections import Counter
kw=it=pd=ld=tc=og=ref=0; shapes=Counter()
for f in glob.glob('/tmp/hb-check/**/*.html',recursive=True):
    x=open(f,encoding='utf-8',errors='replace').read()
    kw += 'name=keywords' in x or 'name="keywords"' in x
    it += 'itemprop' in x
    pd += ' pubdate' in x or 'pubdate=' in x
    ld += 'application/ld+json' in x
    tc += 'theme-color' in x
    og += 'og:image:width' in x
    ref+= 'no-referrer-when-downgrade' in x
    for b in re.findall(r'<script type=application/ld\+json>(.*?)</script>',x,re.S):
        import json
        try:
            d=json.loads(b); shapes[d.get('@type','?')]+=1
        except Exception: shapes['PARSE-FAIL']+=1
print('keywords 页 (应 0):',kw,'| itemprop 页 (应 0):',it,'| pubdate 页 (应 0):',pd)
print('ld+json / theme-color / og:image:width 覆盖 (三项都应 = HTML 总数):',ld,tc,og)
print('旧 referrer 值残留 (应 0):',ref)
print('JSON-LD 类型分布:',dict(shapes))
# 期望（2026-11-23 实测，HTML 408 页）：WebSite 1、WebPage 17、CollectionPage 246、
#   BlogPosting 144（= 内容页数）、BreadcrumbList 144（文章页每页 2 块，所以块总数 552 > 页数 408，正常）
#   **零 PARSE-FAIL**（JSON-LD 语法错会让整块失效且构建 0 警告）
PY
```

```bash
# 7) ★「首行贴导航栏」的哨兵：/roll/ /about/ 两页的正文首行到导航文字下沿
#    应都在 ~28 CSS px（与 yinji 一致；12.5px 就是 content > :first-child 被加回来了）
#    ⚠️ 三页必须在**同一批截图**里量：--window-size 高度不同会得出不同数字
#    （实测过 46px vs 57px 的假差异）；量法：2x 截图后逐行取最暗像素找文本带，换算回 CSS px

# 8) ★ 订阅源：只收文章页 + **顶部没有 XSL 样式表** + 浏览器视图与 feed 逐条对齐
python3 - <<'PY'
import re, html, pathlib
def xml_items(f):
    s = pathlib.Path(f).read_text()
    return ([html.unescape(t) for t in re.findall(r'<item>\s*<title>(.*?)</title>', s, re.S)],
            re.findall(r'<item>.*?<link>(.*?)</link>', s, re.S),
            s)
def html_items(f):
    s = pathlib.Path(f).read_text()
    # ⚠️ minify 会剥属性引号 → 引号写成可选，否则恒报 0 条（假阴性）
    pairs = re.findall(r'<p class=feed-view-title><a href="?([^">]+)"?>(.*?)</a></p>', s, re.S)
    return ([html.unescape(re.sub(r'<[^>]+>', '', t)) for _, t in pairs], [l for l, _ in pairs])

for xf, hf in [('/tmp/hb-check/index.xml', '/tmp/hb-check/feed/index.html'),
               ('/tmp/hb-check/weekly/index.xml', '/tmp/hb-check/feed/weekly/index.html')]:
    xt, xl, s = xml_items(xf)
    ht, hl = html_items(hf)
    items = s.split('<lastBuildDate>')[-1]        # 跳过 channel 自己的 <link>
    links = re.findall(r'<link>([^<]+)</link>', items)
    print(xf,
          '| 条目', len(links),
          '| 非文章', sum(1 for l in links if '/posts/' not in l),
          '| 样式表(应 False)', bool(re.search(r'<\?xml-stylesheet[^>]*\?>', s)),
          '| content:encoded', len(re.findall(r'<content:encoded>', items)),
          '| atom:updated', len(re.findall(r'<atom:updated>', items)),
          '| category', len(re.findall(r'<category>', items)),
          '| 视图条目', len(ht),
          '| 与 feed 标题一致', xt == ht,
          '| 与 feed 链接一致', [u.replace('https://hulatu.com', '') for u in xl] == hl)
PY
# 期望：两个文件都是 条目 20 / 非文章 0 / 样式表 False /
#       content:encoded 20 / atom:updated 20 / category > 0 /
#       视图条目 20 / 标题一致 True / 链接一致 True
# ⚠️ 最后三项是「网页视图与订阅口径一致」的哨兵：不一致时构建 0 警告、页面照常生成
# ⚠️ 视图那两页还要 `noindex`：grep -c 'name=robots' 应为 1（minify 会剥引号，别按
#    `name="robots"` 写）

# 9) ★ 归档页底部标签（≥3 篇常显 + 其余折叠）+ 外置 CSS 作用域哨兵
python3 - <<'PY'
import re, glob, os
D = '/tmp/hb-check'
rd = lambda p: open(p, encoding='utf-8', errors='replace').read()
pages = {os.path.relpath(f, D): rd(f) for f in glob.glob(D + '/**/*.html', recursive=True)}
cssf = glob.glob(D + '/css/main.min.*.css')
css = rd(cssf[0]) if len(cssf) == 1 else ''
print('0) 外置 CSS 文件数 (1):', len(cssf), '| 没引用它的 HTML 页 (0):', sum(1 for s in pages.values() if '/css/main.min.' not in s))
a = pages['archive/index.html']
blk = re.search(r'<section class=tag-index.*?</section>', a, re.S)
top = re.search(r'<div class=tag-index-top>(.*?)</div>', blk.group(0), re.S) if blk else None
more = re.search(r'<details class=tag-index-more>(.*?)</details>', blk.group(0), re.S) if blk else None
tags = re.findall(r'>#([^<]+)</a>', blk.group(0)) if blk else []
n_dirs = len([d for d in os.listdir(D + '/tags') if os.path.isdir(os.path.join(D, 'tags', d))])
print('a) 归档标签总数 / 标签词条页数 (应相等):', len(tags), n_dirs,
      '| 常显 / 折叠:', top.group(1).count('<a ') if top else 0, more.group(1).count('<a ') if more else 0,
      '| 重复标签 (0):', len(tags) - len(set(tags)))
print('b) 外置 CSS 里有 .tag-index 规则 (True):', bool(re.search(r'\.tag-index[\s{.,:]', css)))
print('c) 外置 CSS 里有 header nav 规则 (True):', bool(re.search(r'header\s+nav\s*\{', css)))
print('d) ★ 外置 CSS 里的「裸 nav」选择器 (0):', len(re.findall(r'(?:^|[{},])nav(?=[{,:\[])', css)))
print('e) 外置 CSS 里 .post-series-ord 带 min-width (True):', bool(re.search(r'\.post-series-ord\s*\{[^}]*min-width', css)))
PY
# 期望（2026-11-23 实测）：0) 1 / 0；a) 235 = 235，常显 35 / 折叠 200，重复 0；b) c) e) True；d) 0
# ⚠️ CSS 全部外置成一个 `/css/main.min.<hash>.css`，页面里不再有站点规则的内联 <style>，
#    所以 b–e 读的是那个文件，不再逐页扫。0) 保证每一页都引用了它。
# ⚠️ d) 只抓「整个选择器就是 nav」的写法（`nav{`、`nav,`、`nav:hover`、`@media{nav{`）；
#    `header nav{`、`.toc-nav{` 不算，主题自带的 `nav a{` 是上游规则，也不算。
#    当年的事故是一条裸 `nav{display:flex}` 命中一页 5 个 <nav>。
# ⚠️ 写断言时当心：`'header nav{' in css.replace(' ','')` 是错的
#    （把 needle 里的空格也去掉了）→ 永远 False；反向测试过的写法就是上面这几条正则。
```


改完模板还要手工扫一眼这几处（回归面）：

- 首页：`h1#hai` → 引用 → 段落 → **身份条 + 含「支持」链接的同一段**（两者直接相连，**没有 `<br>` / 额外 `<p>` / 特殊样式**）→ 四个平台链接行 → 虚线 `<hr>` → `<h2 class=recent-posts-head>最近更新：</h2>` → 5 条（只取 posts）；标题行右侧是「精选文章」入口 → `.latest-weekly`（最新一期周刊）
  ⚠️ 身份条由 `layouts/shortcodes/home-stats.html` 在构建期算（文章数 / 周刊数 / 最早一篇到今天的整天数），数字每天可能变 —— 回归时看**格式**，别把某一组数字写死。它现在就是普通正文（18px / 主文字色），不要再加 `.home-stats` 之类的类或小字灰字。
  ⚠️ 简介正文外面不该有 `<content>`（照 yinji 去掉的，行高走 body 的 1.5 —— 2026-11-21 正文是 1.5，留着简介会比正文还松）；列表左边界要和 `Recent Posts:` 标题对齐（实测都 x≈140），缩进 40px 就是 `.recent-posts{padding-left:0}` 被吞了 → 去跑第 4 条哨兵
- `/archive/`：「共 **N** 篇，随机阅读一篇。」（`<span id=post-count>` 动态算，别写死）+ **分类 / 系列**一行入口（类数与篇数动态）+ 年份分组（年份标题后带「N 篇」）+ 底部标签（常显/折叠数量随标签增删变化）。顶部搜索框已删除，见「站内搜索」
- 导航 **7 项**；⚠️ 靠第 00 段 `header nav{flex-wrap:wrap;column-gap:8px}` 保证只在项与项之间折
- 页脚两行：`通过 RSS 订阅，或直接 ✉️ 问候， 🔒 隐私. 🚇 开往. 🌀 虫洞. 🗺️ 网站地图.` / `基于 … 制作，版权所有 …，本站内容采用 CC BY-NC-SA 4.0 协议。`（2026-11-21 晚已去掉「🔍 搜索」入口）
  ⚠️ **RSS 前面不要图标**；其余入口保留 emoji。顺序固定为 隐私 → 搜索 → 开往 → 虫洞 → 网站地图。分隔符统一 `.`，`·` 为 0 个。
  哨兵：`<footer>` 里 `<br>` 恰好 **1 个**、`go.html` 恰好 **2 次**（开往 + 虫洞）、`·` **0 次**
  ⚠️「打个招呼」是悬停胶囊：**触发词仍是 `mailto:` 链接**（`.hello-link`），悬停 / 键盘聚焦浮出 `.hello-card`，点 `.hello-copy` 复制并显示「已复制」，1.6 秒复原；失败时显示「复制失败，请手动选中」并通过 `.hl-toast` 的 `role=status` 播报；触屏（`hover: none`）改为点触发词开合胶囊。**卡片里只有邮箱 + 复制图标** —— 没有「邮箱」标签、提示行、mailto 入口或小三角（用户同日明确要求），别再加回去。三件套：`partials/hello.html` + `assets/js/hello.js` + `custom.css` 第 48 段，改名要三处同改（`.is-copied` / `.is-failed` / `.is-open` 也是契约）。⚠️ `/about/` 的「写信」也用它（`shortcodes/mail-link.html`）；脚本遍历页面上所有 `.hello`，正文卡片用第 52 段左对齐，避免窄屏溢出
- 文章页：`<h1>`、日期行、标签行、**文末三选一：系列坐标带（23 篇连载）→ 相关文章 → 上一篇/下一篇（兜底，目前 0 篇）**、TOC、评论区
  ⚠️ **「上一篇」= 更早、「下一篇」= 更晚**；两段相邻时只画一条发丝线；最新一篇没有「下一篇」、最早一篇没有「上一篇」（留不可见空槽，正常）
  ⚠️ 含代码的文章代码块必须「浅灰底 + 深字」（浅色）—— 大片文字发白就是 `noClasses` 被改回 `true`，跑第 5 条 f) 哨兵
- 文章页顶部面包屑：`首页 / 文章 / 分类`（周刊是 `首页 / 周刊`，**两段** —— 周刊的 `categories` 就是 `["周刊"]`，加了会变「首页 / 周刊 / 周刊」）；⚠️ 面包屑**不该**出现在 `/about/` `/roll/` 或词条页上
- `/roll/`：页面标题「收藏」，两个 `<ul>`：3 条朋友 + 10 条组织/聚合站，用 `.roll-group` 轻量标签分组（不是 `##`）；结尾「…更新中」，其后是「交友原则」（有序列表）与「我的友链信息」（小列表）；无日期行 / 评论区 / TOC；正文首行到导航文字下沿约 **28 CSS px**（~12.5px 就是 `content > :first-child` 被加回来了）
- `/about/`：介绍块纯 Markdown，**没有头像**（全站一张头像都没有）；页面标题「关于」；章节顺序是「这个站 → 联系我 → 写作统计」，「联系我」的 QQ / WeChat 指向 `/contact/qq/` / `/contact/wechat/`
- `/contact/qq/` 与 `/contact/wechat/`：**一页一张二维码**。每页一个 `.oa-wrap`（256px 居中）+ `.oa-tip` + `.oa-profile`（头像 H / 胡拉图 / 扫码加我好友），与 `/wechat/` 共用第 38 段样式；**没有**标题 / 日期 / TOC / 评论区；码 256×256、信息条**必须同宽 256**。⚠️ `/contact/` 本身是 404 —— 两个 md 在 content 根目录、靠 `url:` 落到子路径，别再建 `content/contact/` 章节页
- `/donate/`：两个收款码并排居中（窄屏一列），**没有**日期行 / TOC / 评论区（**有标题**）
- `/privacy/` `/posts/` `/donate/` `/contact/qq/` `/contact/wechat/` `/wechat/` `/404.html` 与全部词条页、`/feed/` 两页：`<meta name=robots content="noindex, follow">`（2026-11-23 构建实测合计 **244 页**）。⚠️ `/feed/` 那两页的 `noindex` 写在 `content/feed/*.md` 的 front matter 里，别删
- `/run/`：`<h1>跑步</h1>` + 导语 + 4 个 `.stats` 格子 + 月度柱状图 + 按年 `<details>` 记录表 + 更新时间行；**没有**面包屑 / TOC / 评论区（走 `layouts/_default/run.html`，不经过 single.html）；数据每天由 CI 的 `sync-garmin.py` 刷新

---

## 8. 待办 / 已知缺口

2. **非文章页没有页面级 `<h1>`**（有意接受上游行为，见 DESIGN.md 8.11）。
3. **Cloudflare 后台收尾**（仓库侧无法代劳）：`run.` / `profile.` / `shot.` / `share.` 四个子域名的 CNAME 已删，Pages 项目本身若还留在后台建议一并删掉 —— 它们指向的 `sites/` 目录已不存在，构建只会失败。
4. **⚠️ 确认 Pages 项目的 Functions 目录**：必须是仓库根的 `functions`。被改过或 Functions 被关掉的话，浏览器打开 `/index.xml` 会退回 raw XML，而**构建与部署都不报错** —— 核对命令见第 2 节「边缘函数」那三条 `curl`。
5. **删掉废弃的部署凭据**：每日重建已改由 `sync-garmin.yml` 的自动提交触发，不再需要 Deploy Hook。旧仓库里的 `CLOUDFLARE_DEPLOY_HOOK` secret 与 Cloudflare 里那个 hook 应删除（它是带凭据的地址，谁拿到都能触发部署）；迁移时**别再配**。
7. **www → 根域的 301 用 Cloudflare Redirect Rule**：`static/_routes.json` 让 Pages Functions 只在 `/index.xml`、`/weekly/index.xml`、`/stats/*` 上运行，所以 www 跳转不能再靠中间件。
   Cloudflare Dashboard → 选 `hulatu.com` 这个域名 → **Rules → Redirect Rules → Create rule**（也可以直接用模板「Redirect from WWW to root」）：
   When incoming requests match：Hostname **equals** `www.hulatu.com`；
   Then：Type **Dynamic**，Expression `concat("https://hulatu.com", http.request.uri.path)`，Status **301**，勾选 **Preserve query string**。
   ⚠️ 前提是 www 的 DNS 记录是橙云（Proxied）。
   ⚠️ **先建规则、验证，再推带 `_routes.json` 的代码**。推代码前中间件也在做 www 跳转，光看 301 分不出是谁给的，
      要用 POST 验：`curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' -X POST https://www.hulatu.com/posts/`
      —— 中间件只跳 GET/HEAD，**返回 301 才说明是 Redirect Rule 生效了**（没生效时是 405 或 200）。
   推送之后在 Workers & Pages → 本项目 → Functions 的请求数里应该看到断崖式下降。
   ⚠️ 以后给 `functions/` 加新路由，**必须同时加进 `_routes.json` 的 include**，否则新函数不会被调用、也不报错。
6. **Garmin 令牌回写**：Garmin 续期访问令牌时会作废旧的 refresh token，`sync-garmin.yml` 每次续期后要把新令牌写回 Secret `GARMINTOKENS`。GitHub 自带的 `GITHUB_TOKEN` 改不了 Secret，所以要建一个专用 token：
   GitHub → Settings → Developer settings → **Fine-grained personal access tokens** → Generate new token；
   Repository access 选 **Only select repositories → `hulatu/hulatu_blog`**；Permissions 只开 **Repository → Secrets: Read and write**（其余全部 No access）；过期时间按自己习惯（到期前 GitHub 会发邮件）。
   把生成的 token 存成仓库 Secret **`GH_SECRETS_TOKEN`**。没配时：令牌没续期就照常同步；一旦续期，job 会标红提醒（新令牌没写回，下一次续期会失败）。
   ⚠️ 令牌已经坏了（报 `Failed to retrieve social profile` 且日志显示访问令牌已过期）：本机运行 `python3 scripts/garmin-token.py --fresh`，把打印的整段 JSON 更新到 `GARMINTOKENS`。

> 被删掉的孤儿资源与失效脚本都在 git 历史里；要恢复就 `git log --diff-filter=D` 取回，别照着旧待办去找已经不存在的文件。

---
